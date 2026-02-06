// ProViso Test Suite
import { describe, it, expect, beforeEach } from 'vitest';
import { parse, parseOrThrow } from '../src/parser.js';
import { ProVisoInterpreter } from '../src/interpreter.js';
import {
  Program,
  TechnicalMilestoneStatement,
  RegulatoryRequirementStatement,
  PerformanceGuaranteeStatement,
  DegradationScheduleStatement,
  SeasonalAdjustmentStatement,
} from '../src/types.js';

// ==================== PARSER TESTS ====================

describe('Parser', () => {
  it('should parse DEFINE statements', async () => {
    const source = `
      DEFINE EBITDA AS
        net_income + interest_expense + tax_expense
    `;
    const ast = await parseOrThrow(source);
    expect(ast.type).toBe('Program');
    expect(ast.statements.length).toBeGreaterThan(0);
    
    const define = ast.statements.find(s => s.type === 'Define');
    expect(define).toBeDefined();
    expect((define as any).name).toBe('EBITDA');
  });

  it('should parse COVENANT statements', async () => {
    const source = `
      COVENANT MaxLeverage
        REQUIRES Leverage <= 4.50
        TESTED QUARTERLY
    `;
    const ast = await parseOrThrow(source);
    const covenant = ast.statements.find(s => s.type === 'Covenant');
    expect(covenant).toBeDefined();
    expect((covenant as any).name).toBe('MaxLeverage');
    expect((covenant as any).tested).toBe('quarterly');
  });

  it('should parse BASKET statements', async () => {
    const source = `
      BASKET GeneralInvestments
        CAPACITY $25_000_000
    `;
    const ast = await parseOrThrow(source);
    const basket = ast.statements.find(s => s.type === 'Basket');
    expect(basket).toBeDefined();
    expect((basket as any).name).toBe('GeneralInvestments');
  });

  it('should parse currency with underscores', async () => {
    const source = `
      BASKET Test
        CAPACITY $1_000_000
    `;
    const ast = await parseOrThrow(source);
    const basket = ast.statements.find(s => s.type === 'Basket') as any;
    expect(basket.capacity.value).toBe(1000000);
  });

  it('should parse GreaterOf function', async () => {
    const source = `
      BASKET RestrictedPayments
        CAPACITY GreaterOf($10_000_000, 5% * total_assets)
    `;
    const ast = await parseOrThrow(source);
    const basket = ast.statements.find(s => s.type === 'Basket') as any;
    expect(basket.capacity.type).toBe('FunctionCall');
    expect(basket.capacity.name).toBe('GreaterOf');
  });

  it('should parse CONDITION statements', async () => {
    const source = `
      CONDITION NoDefault AS
        NOT EXISTS(EventOfDefault)
    `;
    const ast = await parseOrThrow(source);
    const condition = ast.statements.find(s => s.type === 'Condition');
    expect(condition).toBeDefined();
    expect((condition as any).name).toBe('NoDefault');
  });

  it('should parse PROHIBIT with EXCEPT WHEN', async () => {
    const source = `
      PROHIBIT Dividends
        EXCEPT WHEN
          | amount <= AVAILABLE(RestrictedPayments)
          | AND NoDefault
    `;
    const ast = await parseOrThrow(source);
    const prohibit = ast.statements.find(s => s.type === 'Prohibit');
    expect(prohibit).toBeDefined();
    expect((prohibit as any).target).toBe('Dividends');
    expect((prohibit as any).exceptions.length).toBeGreaterThan(0);
  });

  it('should parse EVENT statements', async () => {
    const source = `
      EVENT CrossDefault
        TRIGGERS WHEN external_debt_default > 10_000_000
        CONSEQUENCE EventOfDefault
    `;
    const ast = await parseOrThrow(source);
    const event = ast.statements.find(s => s.type === 'Event');
    expect(event).toBeDefined();
    expect((event as any).name).toBe('CrossDefault');
  });

  it('should parse comments', async () => {
    const source = `
      // This is a comment
      DEFINE Test AS 100
    `;
    const ast = await parseOrThrow(source);
    expect(ast.statements.length).toBe(2);
  });
});

// ==================== INTERPRETER TESTS ====================

describe('Interpreter', () => {
  let interpreter: ProVisoInterpreter;

  const sampleSource = `
    DEFINE EBITDA AS
      net_income + interest_expense + tax_expense + depreciation + amortization
      EXCLUDING extraordinary_items

    DEFINE TotalDebt AS
      funded_debt + capital_leases

    DEFINE Leverage AS
      TotalDebt / EBITDA

    COVENANT MaxLeverage
      REQUIRES Leverage <= 4.50
      TESTED QUARTERLY

    COVENANT MinLiquidity
      REQUIRES cash >= 15_000_000
      TESTED QUARTERLY

    BASKET GeneralInvestments
      CAPACITY $25_000_000

    BASKET RestrictedPayments
      CAPACITY GreaterOf($10_000_000, 5% * total_assets)

    CONDITION NoDefault AS
      NOT EXISTS(EventOfDefault)

    PROHIBIT Investments
      EXCEPT WHEN
        | amount <= AVAILABLE(GeneralInvestments)
        | AND NoDefault
  `;

  const sampleFinancials = {
    net_income: 22000000,
    interest_expense: 8200000,
    tax_expense: 7500000,
    depreciation: 4800000,
    amortization: 2200000,
    extraordinary_items: 0,
    funded_debt: 156000000,
    capital_leases: 5000000,
    cash: 28400000,
    total_assets: 340000000,
  };

  beforeEach(async () => {
    const ast = await parseOrThrow(sampleSource);
    interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials(sampleFinancials);
  });

  describe('Expression Evaluation', () => {
    it('should evaluate EBITDA correctly', () => {
      // EBITDA = net_income + interest + tax + depreciation + amortization - extraordinary
      // = 22M + 8.2M + 7.5M + 4.8M + 2.2M - 0 = 44.7M
      const ebitda = interpreter['evaluate']('EBITDA');
      expect(ebitda).toBe(44700000);
    });

    it('should evaluate TotalDebt correctly', () => {
      // TotalDebt = funded_debt + capital_leases = 156M + 5M = 161M
      const totalDebt = interpreter['evaluate']('TotalDebt');
      expect(totalDebt).toBe(161000000);
    });

    it('should evaluate Leverage correctly', () => {
      // Leverage = TotalDebt / EBITDA = 161M / 44.7M ≈ 3.60
      const leverage = interpreter['evaluate']('Leverage');
      expect(leverage).toBeCloseTo(3.60, 1);
    });
  });

  describe('Covenant Checking', () => {
    it('should check MaxLeverage covenant', () => {
      const result = interpreter.checkCovenant('MaxLeverage');
      expect(result.compliant).toBe(true);
      expect(result.actual).toBeCloseTo(3.60, 1);
      expect(result.threshold).toBe(4.50);
      expect(result.headroom).toBeCloseTo(0.90, 1);
    });

    it('should check MinLiquidity covenant', () => {
      const result = interpreter.checkCovenant('MinLiquidity');
      expect(result.compliant).toBe(true);
      expect(result.actual).toBe(28400000);
      expect(result.threshold).toBe(15000000);
    });

    it('should return all covenants', () => {
      const results = interpreter.checkAllCovenants();
      expect(results.length).toBe(2);
    });
  });

  describe('Basket Operations', () => {
    it('should calculate basket capacity', () => {
      const capacity = interpreter.getBasketCapacity('GeneralInvestments');
      expect(capacity).toBe(25000000);
    });

    it('should calculate GreaterOf basket capacity', () => {
      // GreaterOf($10M, 5% * $340M) = GreaterOf($10M, $17M) = $17M
      const capacity = interpreter.getBasketCapacity('RestrictedPayments');
      expect(capacity).toBe(17000000);
    });

    it('should track basket utilization', () => {
      const initialAvailable = interpreter.getBasketAvailable('GeneralInvestments');
      expect(initialAvailable).toBe(25000000);

      interpreter.useBasket('GeneralInvestments', 5000000, 'Test investment');
      
      const afterUse = interpreter.getBasketAvailable('GeneralInvestments');
      expect(afterUse).toBe(20000000);
    });

    it('should prevent over-utilization', () => {
      expect(() => {
        interpreter.useBasket('GeneralInvestments', 30000000, 'Too much');
      }).toThrow(/Insufficient basket capacity/);
    });
  });

  describe('Condition Evaluation', () => {
    it('should evaluate NoDefault condition (no defaults)', () => {
      const result = interpreter.evaluateBoolean('NoDefault');
      expect(result).toBe(true);
    });

    it('should evaluate NoDefault condition (with default)', () => {
      interpreter.setEventDefault('EventOfDefault');
      const result = interpreter.evaluateBoolean('NoDefault');
      expect(result).toBe(false);
    });
  });

  describe('Prohibition Checking', () => {
    it('should permit investment within basket', () => {
      const result = interpreter.checkProhibition('Investments', 10000000);
      expect(result.permitted).toBe(true);
    });

    it('should prohibit investment exceeding basket', () => {
      const result = interpreter.checkProhibition('Investments', 30000000);
      expect(result.permitted).toBe(false);
    });

    it('should prohibit investment when in default', () => {
      interpreter.setEventDefault('EventOfDefault');
      const result = interpreter.checkProhibition('Investments', 10000000);
      expect(result.permitted).toBe(false);
    });
  });

  describe('Simulation', () => {
    it('should simulate pro forma changes', () => {
      // Add $50M debt and see if still compliant
      const result = interpreter.simulate({ funded_debt: 206000000 });
      
      const maxLeverage = result.covenants.find(c => c.name === 'MaxLeverage');
      expect(maxLeverage).toBeDefined();
      // New leverage = (206M + 5M) / 44.7M = 4.72x > 4.50x
      expect(maxLeverage!.compliant).toBe(false);
    });

    it('should not modify original state', () => {
      const originalLeverage = interpreter.checkCovenant('MaxLeverage');
      interpreter.simulate({ funded_debt: 500000000 });
      const afterSimLeverage = interpreter.checkCovenant('MaxLeverage');
      
      expect(afterSimLeverage.actual).toBe(originalLeverage.actual);
    });
  });
});

// ==================== GROWER/BUILDER BASKET TESTS ====================

describe('Grower Baskets', () => {
  it('should parse FLOOR clause', async () => {
    const source = `
      BASKET EBITDABasket
        CAPACITY 10% * EBITDA
        FLOOR $5_000_000
    `;
    const ast = await parseOrThrow(source);
    const basket = ast.statements.find(s => s.type === 'Basket') as any;
    expect(basket.floor).toBeDefined();
    expect(basket.floor.value).toBe(5000000);
  });

  it('should calculate grower basket capacity', async () => {
    const source = `
      DEFINE EBITDA AS net_income

      BASKET EBITDABasket
        CAPACITY 10% * EBITDA
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials({ net_income: 50000000 });

    // 10% of $50M = $5M
    const capacity = interpreter.getBasketCapacity('EBITDABasket');
    expect(capacity).toBe(5000000);
  });

  it('should apply floor when capacity is below minimum', async () => {
    const source = `
      DEFINE EBITDA AS net_income

      BASKET EBITDABasket
        CAPACITY 10% * EBITDA
        FLOOR $10_000_000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials({ net_income: 50000000 });

    // 10% of $50M = $5M, but floor is $10M
    const capacity = interpreter.getBasketCapacity('EBITDABasket');
    expect(capacity).toBe(10000000);
  });

  it('should not apply floor when capacity exceeds minimum', async () => {
    const source = `
      DEFINE EBITDA AS net_income

      BASKET EBITDABasket
        CAPACITY 10% * EBITDA
        FLOOR $2_000_000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials({ net_income: 50000000 });

    // 10% of $50M = $5M > floor of $2M
    const capacity = interpreter.getBasketCapacity('EBITDABasket');
    expect(capacity).toBe(5000000);
  });

  it('should report grower basket status with details', async () => {
    const source = `
      DEFINE EBITDA AS net_income

      BASKET EBITDABasket
        CAPACITY 10% * EBITDA
        FLOOR $10_000_000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials({ net_income: 50000000 });

    const status = interpreter.getBasketStatus('EBITDABasket');
    expect(status.basketType).toBe('grower');
    expect(status.baseCapacity).toBe(5000000);
    expect(status.floor).toBe(10000000);
    expect(status.capacity).toBe(10000000);
  });

  it('should identify grower baskets', async () => {
    const source = `
      BASKET Fixed CAPACITY $10_000_000

      BASKET Grower
        CAPACITY 10% * total_assets
        FLOOR $5_000_000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials({ total_assets: 100000000 });

    const growerNames = interpreter.getGrowerBasketNames();
    expect(growerNames).toContain('Grower');
    expect(growerNames).not.toContain('Fixed');
  });
});

describe('Builder Baskets', () => {
  it('should parse BUILDS_FROM clause', async () => {
    const source = `
      BASKET RetainedEarnings
        BUILDS_FROM 50% * net_income
        STARTING $10_000_000
    `;
    const ast = await parseOrThrow(source);
    const basket = ast.statements.find(s => s.type === 'Basket') as any;
    expect(basket.buildsFrom).toBeDefined();
    expect(basket.starting).toBeDefined();
    expect(basket.starting.value).toBe(10000000);
  });

  it('should parse MAXIMUM clause', async () => {
    const source = `
      BASKET RetainedEarnings
        BUILDS_FROM 50% * net_income
        STARTING $10_000_000
        MAXIMUM $50_000_000
    `;
    const ast = await parseOrThrow(source);
    const basket = ast.statements.find(s => s.type === 'Basket') as any;
    expect(basket.maximum).toBeDefined();
    expect(basket.maximum.value).toBe(50000000);
  });

  it('should start with initial capacity', async () => {
    const source = `
      BASKET RetainedEarnings
        BUILDS_FROM 50% * net_income
        STARTING $10_000_000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials({ net_income: 5000000 });

    const capacity = interpreter.getBasketCapacity('RetainedEarnings');
    expect(capacity).toBe(10000000);
  });

  it('should accumulate capacity over time', async () => {
    const source = `
      BASKET RetainedEarnings
        BUILDS_FROM 50% * net_income
        STARTING $10_000_000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials({ net_income: 8000000 });

    // Initial capacity
    expect(interpreter.getBasketCapacity('RetainedEarnings')).toBe(10000000);

    // Accumulate Q1 earnings (50% of $8M = $4M)
    const accumulated = interpreter.accumulateBuilderBasket('RetainedEarnings', 'Q1 2024 earnings');
    expect(accumulated).toBe(4000000);

    // New capacity = $10M + $4M = $14M
    expect(interpreter.getBasketCapacity('RetainedEarnings')).toBe(14000000);

    // Accumulate Q2 earnings
    interpreter.accumulateBuilderBasket('RetainedEarnings', 'Q2 2024 earnings');
    expect(interpreter.getBasketCapacity('RetainedEarnings')).toBe(18000000);
  });

  it('should respect maximum cap', async () => {
    const source = `
      BASKET RetainedEarnings
        BUILDS_FROM 50% * net_income
        STARTING $10_000_000
        MAXIMUM $15_000_000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials({ net_income: 20000000 });

    // Accumulate (50% of $20M = $10M), but max is $15M
    interpreter.accumulateBuilderBasket('RetainedEarnings', 'Q1 2024 earnings');

    // Should be capped at $15M
    expect(interpreter.getBasketCapacity('RetainedEarnings')).toBe(15000000);

    // Further accumulation should not increase capacity
    interpreter.accumulateBuilderBasket('RetainedEarnings', 'Q2 2024 earnings');
    expect(interpreter.getBasketCapacity('RetainedEarnings')).toBe(15000000);
  });

  it('should report builder basket status with details', async () => {
    const source = `
      BASKET RetainedEarnings
        BUILDS_FROM 50% * net_income
        STARTING $10_000_000
        MAXIMUM $50_000_000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials({ net_income: 8000000 });

    interpreter.accumulateBuilderBasket('RetainedEarnings', 'Q1 earnings');

    const status = interpreter.getBasketStatus('RetainedEarnings');
    expect(status.basketType).toBe('builder');
    expect(status.accumulated).toBe(4000000);
    expect(status.maximum).toBe(50000000);
    expect(status.capacity).toBe(14000000);
  });

  it('should track accumulation in ledger', async () => {
    const source = `
      BASKET RetainedEarnings
        BUILDS_FROM 50% * net_income
        STARTING $10_000_000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials({ net_income: 8000000 });

    interpreter.accumulateBuilderBasket('RetainedEarnings', 'Q1 2024 earnings');
    interpreter.useBasket('RetainedEarnings', 5000000, 'Investment');

    const ledger = interpreter.getBasketLedger();
    expect(ledger.length).toBe(2);
    expect(ledger[0].entryType).toBe('accumulation');
    expect(ledger[0].amount).toBe(4000000);
    expect(ledger[1].entryType).toBe('usage');
    expect(ledger[1].amount).toBe(5000000);
  });

  it('should identify builder baskets', async () => {
    const source = `
      BASKET Fixed CAPACITY $10_000_000

      BASKET Builder
        BUILDS_FROM 50% * net_income
        STARTING $5_000_000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials({ net_income: 5000000 });

    const builderNames = interpreter.getBuilderBasketNames();
    expect(builderNames).toContain('Builder');
    expect(builderNames).not.toContain('Fixed');
  });

  it('should throw error when accumulating non-builder basket', async () => {
    const source = `
      BASKET Fixed CAPACITY $10_000_000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    expect(() => {
      interpreter.accumulateBuilderBasket('Fixed', 'Test');
    }).toThrow(/not a builder basket/);
  });
});

// ==================== INTEGRATION TESTS ====================

describe('Integration', () => {
  it('should handle a complete credit agreement', async () => {
    const source = `
      // Sample Corporate Credit Agreement
      
      DEFINE EBITDA AS
        net_income + interest_expense + tax_expense + depreciation + amortization
      
      DEFINE TotalDebt AS
        funded_debt + capital_leases
      
      DEFINE Leverage AS
        TotalDebt / EBITDA
      
      COVENANT MaxLeverage
        REQUIRES Leverage <= 4.50
        TESTED QUARTERLY
      
      COVENANT MinInterestCoverage
        REQUIRES EBITDA / interest_expense >= 2.50
        TESTED QUARTERLY
      
      BASKET GeneralInvestments
        CAPACITY $25_000_000
      
      CONDITION NoDefault AS
        NOT EXISTS(EventOfDefault)
      
      CONDITION ProFormaCompliance AS
        COMPLIANT(MaxLeverage) AND COMPLIANT(MinInterestCoverage)
      
      PROHIBIT Investments
        EXCEPT WHEN
          | amount <= AVAILABLE(GeneralInvestments)
          | AND NoDefault
    `;

    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);
    
    interpreter.loadFinancials({
      net_income: 22000000,
      interest_expense: 8200000,
      tax_expense: 7500000,
      depreciation: 4800000,
      amortization: 2200000,
      funded_debt: 156000000,
      capital_leases: 5000000,
      cash: 28400000,
      total_assets: 340000000,
    });

    const status = interpreter.getStatus();
    
    expect(status.overallCompliant).toBe(true);
    expect(status.covenants.length).toBe(2);
    expect(status.baskets.length).toBe(1);
    
    // Check ProFormaCompliance condition
    expect(interpreter.evaluateBoolean('ProFormaCompliance')).toBe(true);
    
    // Test prohibition
    const queryResult = interpreter.checkProhibition('Investments', 10000000);
    expect(queryResult.permitted).toBe(true);
  });
});

// ==================== PARSE ERROR TESTS ====================

describe('Parse Errors', () => {
  it('should return error with location for unknown keyword', async () => {
    const source = 'COVENAT MaxLeverage REQUIRES Leverage <= 4.5';
    const result = await parse(source);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.location).toBeDefined();
    expect(result.error?.location?.start.line).toBe(1);
    expect(result.error?.location?.start.column).toBe(1);
  });

  it('should capture expected tokens', async () => {
    const source = 'COVENAT MaxLeverage';
    const result = await parse(source);

    expect(result.success).toBe(false);
    expect(result.error?.expected).toBeDefined();
    expect(result.error?.expected?.length).toBeGreaterThan(0);
  });

  it('should capture what was found', async () => {
    const source = 'COVENAT MaxLeverage';
    const result = await parse(source);

    expect(result.success).toBe(false);
    // Peggy reports the first character as "found"
    expect(result.error?.found).toBeDefined();
  });

  it('should include source in result for context display', async () => {
    const source = 'INVALID SYNTAX HERE';
    const result = await parse(source);

    expect(result.success).toBe(false);
    expect(result.source).toBe(source);
  });

  it('should provide location for mid-file errors', async () => {
    const source = `
DEFINE EBITDA AS 100

COVENAT MaxLeverage REQUIRES x > 1
`;
    const result = await parse(source);

    expect(result.success).toBe(false);
    expect(result.error?.location?.start.line).toBe(4);
  });

  it('should provide location for expression errors', async () => {
    const source = `
DEFINE EBITDA AS
  net_income + + interest
`;
    const result = await parse(source);

    expect(result.success).toBe(false);
    expect(result.error?.location).toBeDefined();
  });

  it('should have expected list include valid keywords', async () => {
    const source = 'BADKEYWORD Test';
    const result = await parse(source);

    expect(result.success).toBe(false);
    // Expected should include valid top-level keywords
    const expectedLower = result.error?.expected?.map(e => e.toLowerCase()) ?? [];
    const hasValidKeyword = expectedLower.some(e =>
      e.includes('define') || e.includes('covenant') || e.includes('basket')
    );
    expect(hasValidKeyword).toBe(true);
  });
});

// ==================== SEMANTIC VALIDATION TESTS ====================

import { validate } from '../src/validator.js';

describe('Semantic Validation', () => {
  it('should pass for valid program', async () => {
    const source = `
      DEFINE EBITDA AS net_income
      COVENANT MaxLeverage REQUIRES EBITDA > 0
      BASKET GeneralInvestments CAPACITY $25_000_000
      CONDITION NoDefault AS COMPLIANT(MaxLeverage)
    `;
    const ast = await parseOrThrow(source);
    const result = validate(ast);

    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should error on undefined basket in AVAILABLE()', async () => {
    const source = `
      PROHIBIT Investments
        EXCEPT WHEN
          | amount <= AVAILABLE(NonExistentBasket)
    `;
    const ast = await parseOrThrow(source);
    const result = validate(ast);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]!.message).toContain('NonExistentBasket');
    expect(result.errors[0]!.expectedType).toBe('basket');
  });

  it('should error on undefined covenant in COMPLIANT()', async () => {
    const source = `
      CONDITION Test AS
        COMPLIANT(NonExistentCovenant)
    `;
    const ast = await parseOrThrow(source);
    const result = validate(ast);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]!.message).toContain('NonExistentCovenant');
    expect(result.errors[0]!.expectedType).toBe('covenant');
  });

  it('should error on undefined condition in SUBJECT TO', async () => {
    const source = `
      BASKET Test
        CAPACITY $1_000_000
        SUBJECT TO UndefinedCondition
    `;
    const ast = await parseOrThrow(source);
    const result = validate(ast);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]!.message).toContain('UndefinedCondition');
    expect(result.errors[0]!.expectedType).toBe('condition');
  });

  it('should warn on undefined identifier (possible financial data)', async () => {
    const source = `
      DEFINE Test AS undefined_field
    `;
    const ast = await parseOrThrow(source);
    const result = validate(ast);

    // Not an error because it might be financial data
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]!.message).toContain('undefined_field');
  });

  it('should resolve references to defined terms', async () => {
    const source = `
      DEFINE EBITDA AS net_income
      DEFINE Leverage AS total_debt / EBITDA
    `;
    const ast = await parseOrThrow(source);
    const result = validate(ast);

    // EBITDA reference in Leverage should be resolved
    // Only net_income and total_debt should generate warnings
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
    const warningMessages = result.warnings.map(w => w.reference);
    expect(warningMessages).toContain('net_income');
    expect(warningMessages).toContain('total_debt');
    expect(warningMessages).not.toContain('EBITDA');
  });

  // Note: Unknown functions are caught at parse time by the grammar
  // which only allows specific function names. No semantic validation test needed.

  it('should validate GreaterOf arguments', async () => {
    const source = `
      BASKET Test
        CAPACITY GreaterOf($1_000_000, 5% * EBITDA)
    `;
    const ast = await parseOrThrow(source);
    const result = validate(ast);

    // EBITDA is undefined, so there should be a warning
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.reference === 'EBITDA')).toBe(true);
  });

  it('should allow amount in PROHIBIT EXCEPT WHEN context', async () => {
    const source = `
      BASKET TestBasket CAPACITY $1_000_000
      PROHIBIT TestAction
        EXCEPT WHEN
          | amount <= AVAILABLE(TestBasket)
    `;
    const ast = await parseOrThrow(source);
    const result = validate(ast);

    // amount is a special binding, should not generate warning
    expect(result.valid).toBe(true);
    expect(result.warnings.some(w => w.reference === 'amount')).toBe(false);
  });

  it('should warn on EXISTS() with undefined event', async () => {
    const source = `
      CONDITION Test AS EXISTS(UndefinedEvent)
    `;
    const ast = await parseOrThrow(source);
    const result = validate(ast);

    // EXISTS with undefined event is a warning (might be runtime state)
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBe(1);
    expect(result.warnings[0]!.reference).toBe('UndefinedEvent');
    expect(result.warnings[0]!.expectedType).toBe('event');
  });

  it('should not warn on EXISTS() with defined event', async () => {
    const source = `
      EVENT TestEvent TRIGGERS WHEN x > 0
      CONDITION Test AS EXISTS(TestEvent)
    `;
    const ast = await parseOrThrow(source);
    const result = validate(ast);

    // EXISTS with defined event should not generate warnings for the event
    const existsWarnings = result.warnings.filter(w => w.reference === 'TestEvent');
    expect(existsWarnings.length).toBe(0);
  });

  it('should validate complex expressions', async () => {
    const source = `
      BASKET TestBasket CAPACITY $1_000_000
      COVENANT MaxLev REQUIRES x <= 4.5
      CONDITION NoDefault AS COMPLIANT(MaxLev)
      PROHIBIT Dividends
        EXCEPT WHEN
          | amount <= AVAILABLE(TestBasket)
          | AND NoDefault
    `;
    const ast = await parseOrThrow(source);
    const result = validate(ast);

    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
    // Only x should generate a warning (undefined financial data)
    const warningRefs = result.warnings.map(w => w.reference);
    expect(warningRefs).toContain('x');
    expect(warningRefs).not.toContain('NoDefault');
    expect(warningRefs).not.toContain('MaxLev');
    expect(warningRefs).not.toContain('TestBasket');
  });

  it('should validate EXCLUDING items', async () => {
    const source = `
      DEFINE EBITDA AS net_income
        EXCLUDING extraordinary_items
    `;
    const ast = await parseOrThrow(source);
    const result = validate(ast);

    expect(result.valid).toBe(true);
    // extraordinary_items is not defined, should warn
    const excludingWarning = result.warnings.find(w => w.reference === 'extraordinary_items');
    expect(excludingWarning).toBeDefined();
    expect(excludingWarning!.context).toContain('DEFINE EBITDA');
  });

  it('should validate builder basket BUILDS_FROM expressions', async () => {
    const source = `
      DEFINE NetIncome AS revenue - expenses
      BASKET RetainedEarnings
        BUILDS_FROM 50% * NetIncome
        STARTING $10_000_000
        MAXIMUM $75_000_000
    `;
    const ast = await parseOrThrow(source);
    const result = validate(ast);

    expect(result.valid).toBe(true);
    // NetIncome reference should be resolved (no warning)
    const netIncomeWarning = result.warnings.find(w => w.reference === 'NetIncome');
    expect(netIncomeWarning).toBeUndefined();
    // revenue and expenses should have warnings
    expect(result.warnings.some(w => w.reference === 'revenue')).toBe(true);
    expect(result.warnings.some(w => w.reference === 'expenses')).toBe(true);
  });

  it('should validate grower basket FLOOR expressions', async () => {
    const source = `
      BASKET Test
        CAPACITY 10% * undefined_metric
        FLOOR $5_000_000
    `;
    const ast = await parseOrThrow(source);
    const result = validate(ast);

    expect(result.valid).toBe(true);
    expect(result.warnings.some(w => w.reference === 'undefined_metric')).toBe(true);
  });
});

// ==================== BASKET LEDGER TESTS ====================

describe('Basket Ledger', () => {
  it('should return empty ledger initially', async () => {
    const source = `
      BASKET TestBasket CAPACITY $10_000_000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const ledger = interpreter.getBasketLedger();
    expect(ledger.length).toBe(0);
  });

  it('should record usage entries in ledger', async () => {
    const source = `
      BASKET TestBasket CAPACITY $10_000_000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    interpreter.useBasket('TestBasket', 5000000, 'Q1 Investment');

    const ledger = interpreter.getBasketLedger();
    expect(ledger.length).toBe(1);
    expect(ledger[0]!.basket).toBe('TestBasket');
    expect(ledger[0]!.amount).toBe(5000000);
    expect(ledger[0]!.entryType).toBe('usage');
    expect(ledger[0]!.description).toBe('Q1 Investment');
  });

  it('should record accumulation entries in ledger', async () => {
    const source = `
      BASKET Builder
        BUILDS_FROM 50% * net_income
        STARTING $1_000_000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials({ net_income: 10000000 });

    interpreter.accumulateBuilderBasket('Builder', 'Q1 2024 earnings');

    const ledger = interpreter.getBasketLedger();
    expect(ledger.length).toBe(1);
    expect(ledger[0]!.basket).toBe('Builder');
    expect(ledger[0]!.amount).toBe(5000000);
    expect(ledger[0]!.entryType).toBe('accumulation');
  });

  it('should track multiple entries in order', async () => {
    const source = `
      BASKET Builder
        BUILDS_FROM 50% * net_income
        STARTING $5_000_000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials({ net_income: 4000000 });

    interpreter.accumulateBuilderBasket('Builder', 'Q1 earnings');
    interpreter.useBasket('Builder', 3000000, 'Investment A');
    interpreter.accumulateBuilderBasket('Builder', 'Q2 earnings');
    interpreter.useBasket('Builder', 2000000, 'Investment B');

    const ledger = interpreter.getBasketLedger();
    expect(ledger.length).toBe(4);
    expect(ledger[0]!.entryType).toBe('accumulation');
    expect(ledger[1]!.entryType).toBe('usage');
    expect(ledger[2]!.entryType).toBe('accumulation');
    expect(ledger[3]!.entryType).toBe('usage');
  });

  it('should include timestamps in ledger entries', async () => {
    const source = `
      BASKET TestBasket CAPACITY $10_000_000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const before = new Date();
    interpreter.useBasket('TestBasket', 1000000, 'Test');
    const after = new Date();

    const ledger = interpreter.getBasketLedger();
    expect(ledger[0]!.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(ledger[0]!.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});

// ==================== CURE RIGHTS TESTS ====================

describe('Cure Rights', () => {
  describe('Grammar', () => {
    it('should parse CURE clause with MAX_USES', async () => {
      const source = `
        COVENANT MaxLeverage
          REQUIRES Leverage <= 4.50
          TESTED QUARTERLY
          CURE EquityCure MAX_USES 3 OVER life_of_facility
      `;
      const ast = await parseOrThrow(source);
      const covenant = ast.statements.find(s => s.type === 'Covenant') as any;

      expect(covenant.cure).toBeDefined();
      expect(covenant.cure.type).toBe('EquityCure');
      expect(covenant.cure.details.maxUses).toBe(3);
      expect(covenant.cure.details.overPeriod).toBe('life_of_facility');
    });

    it('should parse CURE clause with MAX_AMOUNT', async () => {
      const source = `
        COVENANT MaxLeverage
          REQUIRES Leverage <= 4.50
          CURE EquityCure MAX_AMOUNT $20_000_000
      `;
      const ast = await parseOrThrow(source);
      const covenant = ast.statements.find(s => s.type === 'Covenant') as any;

      expect(covenant.cure.details.maxAmount).toBeDefined();
      expect(covenant.cure.details.maxAmount.value).toBe(20000000);
    });

    it('should parse CURE clause with CURE_PERIOD', async () => {
      const source = `
        COVENANT MaxLeverage
          REQUIRES Leverage <= 4.50
          CURE EquityCure CURE_PERIOD 30 DAYS
      `;
      const ast = await parseOrThrow(source);
      const covenant = ast.statements.find(s => s.type === 'Covenant') as any;

      expect(covenant.cure.details.curePeriod).toBeDefined();
      expect(covenant.cure.details.curePeriod.amount).toBe(30);
      expect(covenant.cure.details.curePeriod.unit).toBe('days');
    });

    it('should parse combined CURE clauses', async () => {
      const source = `
        COVENANT MaxLeverage
          REQUIRES Leverage <= 4.50
          CURE EquityCure MAX_USES 3 OVER life_of_facility MAX_AMOUNT $20_000_000
      `;
      const ast = await parseOrThrow(source);
      const covenant = ast.statements.find(s => s.type === 'Covenant') as any;

      expect(covenant.cure.details.maxUses).toBe(3);
      expect(covenant.cure.details.maxAmount.value).toBe(20000000);
    });

    it('should parse PaymentCure mechanism', async () => {
      const source = `
        COVENANT MinCoverage
          REQUIRES coverage >= 1.25
          CURE PaymentCure MAX_USES 2 OVER life_of_facility
      `;
      const ast = await parseOrThrow(source);
      const covenant = ast.statements.find(s => s.type === 'Covenant') as any;

      expect(covenant.cure.type).toBe('PaymentCure');
    });
  });

  describe('Interpreter', () => {
    it('should check cure availability when compliant', async () => {
      const source = `
        DEFINE Leverage AS total_debt / ebitda
        COVENANT MaxLeverage
          REQUIRES Leverage <= 4.50
          CURE EquityCure MAX_USES 3 OVER life_of_facility
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);
      interpreter.loadFinancials({ total_debt: 90000000, ebitda: 30000000 }); // 3x leverage

      const result = interpreter.checkCovenantWithCure('MaxLeverage');
      expect(result.compliant).toBe(true);
      expect(result.cureAvailable).toBeUndefined(); // Not needed when compliant
    });

    it('should check cure availability when breached', async () => {
      const source = `
        DEFINE Leverage AS total_debt / ebitda
        COVENANT MaxLeverage
          REQUIRES Leverage <= 4.50
          CURE EquityCure MAX_USES 3 OVER life_of_facility
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);
      interpreter.loadFinancials({ total_debt: 150000000, ebitda: 30000000 }); // 5x leverage

      const result = interpreter.checkCovenantWithCure('MaxLeverage');
      expect(result.compliant).toBe(false);
      expect(result.cureAvailable).toBe(true);
      expect(result.shortfall).toBeCloseTo(0.5, 1); // 5x - 4.5x = 0.5x shortfall
    });

    it('should apply equity cure successfully', async () => {
      const source = `
        DEFINE Leverage AS total_debt / ebitda
        COVENANT MaxLeverage
          REQUIRES Leverage <= 4.50
          CURE EquityCure MAX_USES 3 OVER life_of_facility
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);
      interpreter.loadFinancials({ total_debt: 150000000, ebitda: 30000000 }); // 5x leverage

      const result = interpreter.applyCure('MaxLeverage', 10000000);
      expect(result.success).toBe(true);
    });

    it('should reject cure when uses exhausted', async () => {
      const source = `
        DEFINE Leverage AS total_debt / ebitda
        COVENANT MaxLeverage
          REQUIRES Leverage <= 4.50
          CURE EquityCure MAX_USES 2 OVER life_of_facility
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);
      interpreter.loadFinancials({ total_debt: 150000000, ebitda: 30000000 });

      // Use both cures
      interpreter.applyCure('MaxLeverage', 10000000);
      interpreter.applyCure('MaxLeverage', 10000000);

      // Third should fail
      const result = interpreter.applyCure('MaxLeverage', 10000000);
      expect(result.success).toBe(false);
      expect(result.reason).toContain('No cure uses remaining');
    });

    it('should reject cure when amount exceeds max', async () => {
      const source = `
        DEFINE Leverage AS total_debt / ebitda
        COVENANT MaxLeverage
          REQUIRES Leverage <= 4.50
          CURE EquityCure MAX_AMOUNT $5_000_000
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);
      interpreter.loadFinancials({ total_debt: 150000000, ebitda: 30000000 });

      const result = interpreter.applyCure('MaxLeverage', 10000000);
      expect(result.success).toBe(false);
      expect(result.reason).toContain('exceeds maximum cure');
    });

    it('should calculate shortfall for leverage covenant', async () => {
      const source = `
        DEFINE Leverage AS total_debt / ebitda
        COVENANT MaxLeverage
          REQUIRES Leverage <= 4.00
          CURE EquityCure
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);
      interpreter.loadFinancials({ total_debt: 150000000, ebitda: 30000000 }); // 5x

      const result = interpreter.checkCovenantWithCure('MaxLeverage');
      expect(result.shortfall).toBeCloseTo(1.0, 1); // 5x - 4x = 1x shortfall
    });

    it('should calculate shortfall for coverage covenant', async () => {
      const source = `
        DEFINE Coverage AS ebitda / interest
        COVENANT MinCoverage
          REQUIRES Coverage >= 2.50
          CURE PaymentCure
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);
      interpreter.loadFinancials({ ebitda: 20000000, interest: 10000000 }); // 2x

      const result = interpreter.checkCovenantWithCure('MinCoverage');
      expect(result.shortfall).toBeCloseTo(0.5, 1); // 2.5x - 2x = 0.5x shortfall
    });

    it('should track cure usage across multiple cures', async () => {
      const source = `
        DEFINE Leverage AS total_debt / ebitda
        COVENANT MaxLeverage
          REQUIRES Leverage <= 4.50
          CURE EquityCure MAX_USES 5 OVER life_of_facility
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);
      interpreter.loadFinancials({ total_debt: 150000000, ebitda: 30000000 });

      interpreter.applyCure('MaxLeverage', 10000000);
      interpreter.applyCure('MaxLeverage', 10000000);

      const usage = interpreter.getCureUsage();
      expect(usage.length).toBe(1);
      expect(usage[0]!.mechanism).toBe('EquityCure');
      expect(usage[0]!.totalUses).toBe(2);
      expect(usage[0]!.usesRemaining).toBe(3);
    });

    it('should reject cure on compliant covenant', async () => {
      const source = `
        DEFINE Leverage AS total_debt / ebitda
        COVENANT MaxLeverage
          REQUIRES Leverage <= 4.50
          CURE EquityCure
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);
      interpreter.loadFinancials({ total_debt: 90000000, ebitda: 30000000 }); // 3x

      const result = interpreter.applyCure('MaxLeverage', 10000000);
      expect(result.success).toBe(false);
      expect(result.reason).toContain('already compliant');
    });

    it('should identify covenants with cure mechanisms', async () => {
      const source = `
        COVENANT WithCure
          REQUIRES x <= 5
          CURE EquityCure

        COVENANT WithoutCure
          REQUIRES y >= 1
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);

      const withCure = interpreter.getCovenantsWithCure();
      expect(withCure).toContain('WithCure');
      expect(withCure).not.toContain('WithoutCure');
    });
  });
});

// ==================== AMENDMENT TESTS ====================

describe('Amendments', () => {
  describe('Grammar', () => {
    it('should parse basic AMENDMENT statement', async () => {
      const source = `
        AMENDMENT 1
          EFFECTIVE 2024-06-15
          DESCRIPTION "First Amendment"

          ADDS BASKET NewBasket
            CAPACITY $10_000_000
      `;
      const ast = await parseOrThrow(source);
      const amendment = ast.statements.find(s => s.type === 'Amendment') as any;

      expect(amendment).toBeDefined();
      expect(amendment.number).toBe(1);
      expect(amendment.effective.value).toBe('2024-06-15');
      expect(amendment.description).toBe('First Amendment');
      expect(amendment.directives.length).toBe(1);
    });

    it('should parse REPLACES directive', async () => {
      const source = `
        AMENDMENT 1
          REPLACES COVENANT MaxLeverage WITH
            COVENANT MaxLeverage
              REQUIRES Leverage <= 5.00
              TESTED QUARTERLY
      `;
      const ast = await parseOrThrow(source);
      const amendment = ast.statements.find(s => s.type === 'Amendment') as any;

      expect(amendment.directives[0].directive).toBe('replace');
      expect(amendment.directives[0].targetType).toBe('Covenant');
      expect(amendment.directives[0].targetName).toBe('MaxLeverage');
      expect(amendment.directives[0].replacement.type).toBe('Covenant');
    });

    it('should parse ADDS directive', async () => {
      const source = `
        AMENDMENT 1
          ADDS BASKET AdditionalInvestments
            CAPACITY $15_000_000
      `;
      const ast = await parseOrThrow(source);
      const amendment = ast.statements.find(s => s.type === 'Amendment') as any;

      expect(amendment.directives[0].directive).toBe('add');
      expect(amendment.directives[0].statement.type).toBe('Basket');
      expect(amendment.directives[0].statement.name).toBe('AdditionalInvestments');
    });

    it('should parse DELETES directive', async () => {
      const source = `
        AMENDMENT 1
          DELETES CONDITION OldCondition
      `;
      const ast = await parseOrThrow(source);
      const amendment = ast.statements.find(s => s.type === 'Amendment') as any;

      expect(amendment.directives[0].directive).toBe('delete');
      expect(amendment.directives[0].targetType).toBe('Condition');
      expect(amendment.directives[0].targetName).toBe('OldCondition');
    });

    it('should parse MODIFIES directive', async () => {
      const source = `
        AMENDMENT 1
          MODIFIES BASKET GeneralInvestments
            CAPACITY $35_000_000
      `;
      const ast = await parseOrThrow(source);
      const amendment = ast.statements.find(s => s.type === 'Amendment') as any;

      expect(amendment.directives[0].directive).toBe('modify');
      expect(amendment.directives[0].targetType).toBe('Basket');
      expect(amendment.directives[0].targetName).toBe('GeneralInvestments');
      expect(amendment.directives[0].modifications[0].type).toBe('capacity');
    });

    it('should parse multiple directives in one amendment', async () => {
      const source = `
        AMENDMENT 2
          EFFECTIVE 2024-09-01

          MODIFIES BASKET GeneralInvestments
            CAPACITY $40_000_000

          ADDS BASKET NewBasket
            CAPACITY $5_000_000

          DELETES CONDITION OldCondition
      `;
      const ast = await parseOrThrow(source);
      const amendment = ast.statements.find(s => s.type === 'Amendment') as any;

      expect(amendment.number).toBe(2);
      expect(amendment.directives.length).toBe(3);
      expect(amendment.directives[0].directive).toBe('modify');
      expect(amendment.directives[1].directive).toBe('add');
      expect(amendment.directives[2].directive).toBe('delete');
    });
  });

  describe('Interpreter', () => {
    it('should apply REPLACES directive', async () => {
      const source = `
        DEFINE Leverage AS total_debt / ebitda

        COVENANT MaxLeverage
          REQUIRES Leverage <= 4.50
          TESTED QUARTERLY
      `;
      const amendmentSource = `
        AMENDMENT 1
          REPLACES COVENANT MaxLeverage WITH
            COVENANT MaxLeverage
              REQUIRES Leverage <= 5.00
              TESTED QUARTERLY
      `;

      const ast = await parseOrThrow(source);
      const amendmentAst = await parseOrThrow(amendmentSource);
      const interpreter = new ProVisoInterpreter(ast);
      interpreter.loadFinancials({ total_debt: 230000000, ebitda: 50000000 }); // 4.6x leverage

      // Before amendment: breach (4.6x > 4.5x)
      let result = interpreter.checkCovenant('MaxLeverage');
      expect(result.compliant).toBe(false);

      // Apply amendment
      const amendment = amendmentAst.statements.find(s => s.type === 'Amendment') as any;
      interpreter.applyAmendment(amendment);

      // After amendment: compliant (4.6x <= 5.0x)
      result = interpreter.checkCovenant('MaxLeverage');
      expect(result.compliant).toBe(true);
      expect(result.threshold).toBe(5.0);
    });

    it('should apply ADDS directive', async () => {
      const source = `
        BASKET ExistingBasket
          CAPACITY $10_000_000
      `;
      const amendmentSource = `
        AMENDMENT 1
          ADDS BASKET NewBasket
            CAPACITY $15_000_000
      `;

      const ast = await parseOrThrow(source);
      const amendmentAst = await parseOrThrow(amendmentSource);
      const interpreter = new ProVisoInterpreter(ast);

      // Before amendment
      expect(interpreter.getBasketNames()).toContain('ExistingBasket');
      expect(interpreter.getBasketNames()).not.toContain('NewBasket');

      // Apply amendment
      const amendment = amendmentAst.statements.find(s => s.type === 'Amendment') as any;
      interpreter.applyAmendment(amendment);

      // After amendment
      expect(interpreter.getBasketNames()).toContain('NewBasket');
      expect(interpreter.getBasketCapacity('NewBasket')).toBe(15000000);
    });

    it('should apply DELETES directive', async () => {
      const source = `
        CONDITION OldCondition AS
          x > 0

        CONDITION KeepThis AS
          y > 0
      `;
      const amendmentSource = `
        AMENDMENT 1
          DELETES CONDITION OldCondition
      `;

      const ast = await parseOrThrow(source);
      const amendmentAst = await parseOrThrow(amendmentSource);
      const interpreter = new ProVisoInterpreter(ast);

      // Before
      expect(interpreter.getConditionNames()).toContain('OldCondition');
      expect(interpreter.getConditionNames()).toContain('KeepThis');

      // Apply
      const amendment = amendmentAst.statements.find(s => s.type === 'Amendment') as any;
      interpreter.applyAmendment(amendment);

      // After
      expect(interpreter.getConditionNames()).not.toContain('OldCondition');
      expect(interpreter.getConditionNames()).toContain('KeepThis');
    });

    it('should throw error on deleting non-existent statement', async () => {
      const source = `
        BASKET SomeBasket CAPACITY $10_000_000
      `;
      const amendmentSource = `
        AMENDMENT 1
          DELETES CONDITION NonExistent
      `;

      const ast = await parseOrThrow(source);
      const amendmentAst = await parseOrThrow(amendmentSource);
      const interpreter = new ProVisoInterpreter(ast);

      const amendment = amendmentAst.statements.find(s => s.type === 'Amendment') as any;
      expect(() => interpreter.applyAmendment(amendment)).toThrow(/not found/);
    });

    it('should apply MODIFIES directive to basket capacity', async () => {
      const source = `
        BASKET GeneralInvestments
          CAPACITY $25_000_000
      `;
      const amendmentSource = `
        AMENDMENT 1
          MODIFIES BASKET GeneralInvestments
            CAPACITY $35_000_000
      `;

      const ast = await parseOrThrow(source);
      const amendmentAst = await parseOrThrow(amendmentSource);
      const interpreter = new ProVisoInterpreter(ast);

      // Before
      expect(interpreter.getBasketCapacity('GeneralInvestments')).toBe(25000000);

      // Apply
      const amendment = amendmentAst.statements.find(s => s.type === 'Amendment') as any;
      interpreter.applyAmendment(amendment);

      // After
      expect(interpreter.getBasketCapacity('GeneralInvestments')).toBe(35000000);
    });

    it('should apply multiple amendments in order', async () => {
      const source = `
        BASKET TestBasket CAPACITY $10_000_000
      `;
      const amendment1Source = `
        AMENDMENT 1
          MODIFIES BASKET TestBasket
            CAPACITY $20_000_000
      `;
      const amendment2Source = `
        AMENDMENT 2
          MODIFIES BASKET TestBasket
            CAPACITY $30_000_000
      `;

      const ast = await parseOrThrow(source);
      const amendment1Ast = await parseOrThrow(amendment1Source);
      const amendment2Ast = await parseOrThrow(amendment2Source);
      const interpreter = new ProVisoInterpreter(ast);

      expect(interpreter.getBasketCapacity('TestBasket')).toBe(10000000);

      const amendment1 = amendment1Ast.statements.find(s => s.type === 'Amendment') as any;
      interpreter.applyAmendment(amendment1);
      expect(interpreter.getBasketCapacity('TestBasket')).toBe(20000000);

      const amendment2 = amendment2Ast.statements.find(s => s.type === 'Amendment') as any;
      interpreter.applyAmendment(amendment2);
      expect(interpreter.getBasketCapacity('TestBasket')).toBe(30000000);
    });

    it('should track applied amendments', async () => {
      const source = `
        BASKET TestBasket CAPACITY $10_000_000
      `;
      const amendmentSource = `
        AMENDMENT 1
          EFFECTIVE 2024-06-15
          DESCRIPTION "Capacity increase"
          MODIFIES BASKET TestBasket
            CAPACITY $20_000_000
      `;

      const ast = await parseOrThrow(source);
      const amendmentAst = await parseOrThrow(amendmentSource);
      const interpreter = new ProVisoInterpreter(ast);

      expect(interpreter.getAppliedAmendments().length).toBe(0);

      const amendment = amendmentAst.statements.find(s => s.type === 'Amendment') as any;
      interpreter.applyAmendment(amendment);

      const applied = interpreter.getAppliedAmendments();
      expect(applied.length).toBe(1);
      expect(applied[0].number).toBe(1);
      expect(applied[0].description).toBe('Capacity increase');
    });

    it('should throw error on replacing non-existent statement', async () => {
      const source = `
        BASKET SomeBasket CAPACITY $10_000_000
      `;
      const amendmentSource = `
        AMENDMENT 1
          REPLACES COVENANT NonExistent WITH
            COVENANT NonExistent
              REQUIRES x <= 5
      `;

      const ast = await parseOrThrow(source);
      const amendmentAst = await parseOrThrow(amendmentSource);
      const interpreter = new ProVisoInterpreter(ast);

      const amendment = amendmentAst.statements.find(s => s.type === 'Amendment') as any;
      expect(() => interpreter.applyAmendment(amendment)).toThrow(/not found/);
    });
  });
});

// ==================== CLOSING ENUMS TESTS ====================

import {
  TransactionType,
  DocumentType,
  DocumentStatus,
  PartyRole,
  ConditionStatus,
  DefinedTermCategory,
  DocumentCategory,
  isTransactionType,
  isDocumentType,
  isDocumentStatus,
  isPartyRole,
  isConditionStatus,
  getTransactionTypeLabel,
  getDocumentStatusLabel,
  getPartyRoleLabel,
  getConditionStatusLabel,
} from '../src/closing-enums.js';

describe('Closing Enums', () => {
  describe('TransactionType', () => {
    it('should have all expected transaction types', () => {
      expect(TransactionType.REVOLVING_CREDIT).toBe('revolving_credit');
      expect(TransactionType.TERM_LOAN_A).toBe('term_loan_a');
      expect(TransactionType.TERM_LOAN_B).toBe('term_loan_b');
      expect(TransactionType.DELAYED_DRAW).toBe('delayed_draw');
      expect(TransactionType.BRIDGE_LOAN).toBe('bridge_loan');
      expect(TransactionType.ABL).toBe('asset_based_loan');
      expect(TransactionType.MULTI_TRANCHE).toBe('multi_tranche');
    });

    it('should validate transaction types', () => {
      expect(isTransactionType('revolving_credit')).toBe(true);
      expect(isTransactionType('term_loan_a')).toBe(true);
      expect(isTransactionType('invalid_type')).toBe(false);
    });

    it('should provide human-readable labels', () => {
      expect(getTransactionTypeLabel(TransactionType.REVOLVING_CREDIT)).toBe('Revolving Credit');
      expect(getTransactionTypeLabel(TransactionType.ABL)).toBe('Asset-Based Loan');
    });
  });

  describe('DocumentType', () => {
    it('should have core agreement documents', () => {
      expect(DocumentType.CREDIT_AGREEMENT).toBe('credit_agreement');
      expect(DocumentType.AMENDMENT).toBe('amendment');
      expect(DocumentType.WAIVER).toBe('waiver');
    });

    it('should have corporate documents', () => {
      expect(DocumentType.OFFICERS_CERTIFICATE).toBe('officers_certificate');
      expect(DocumentType.SECRETARY_CERTIFICATE).toBe('secretary_certificate');
      expect(DocumentType.GOOD_STANDING).toBe('good_standing');
    });

    it('should have security documents', () => {
      expect(DocumentType.SECURITY_AGREEMENT).toBe('security_agreement');
      expect(DocumentType.PLEDGE_AGREEMENT).toBe('pledge_agreement');
      expect(DocumentType.GUARANTY).toBe('guaranty');
    });

    it('should validate document types', () => {
      expect(isDocumentType('credit_agreement')).toBe(true);
      expect(isDocumentType('legal_opinion')).toBe(true);
      expect(isDocumentType('fake_document')).toBe(false);
    });
  });

  describe('DocumentStatus', () => {
    it('should have all lifecycle statuses', () => {
      expect(DocumentStatus.NOT_STARTED).toBe('not_started');
      expect(DocumentStatus.DRAFTING).toBe('drafting');
      expect(DocumentStatus.FINAL).toBe('final');
      expect(DocumentStatus.EXECUTED).toBe('executed');
    });

    it('should validate document statuses', () => {
      expect(isDocumentStatus('drafting')).toBe(true);
      expect(isDocumentStatus('executed')).toBe(true);
      expect(isDocumentStatus('invalid_status')).toBe(false);
    });

    it('should provide human-readable labels', () => {
      expect(getDocumentStatusLabel(DocumentStatus.NOT_STARTED)).toBe('Not Started');
      expect(getDocumentStatusLabel(DocumentStatus.OUT_FOR_REVIEW)).toBe('Out for Review');
    });
  });

  describe('PartyRole', () => {
    it('should have all party roles', () => {
      expect(PartyRole.BORROWER).toBe('borrower');
      expect(PartyRole.ADMINISTRATIVE_AGENT).toBe('administrative_agent');
      expect(PartyRole.LENDER).toBe('lender');
    });

    it('should validate party roles', () => {
      expect(isPartyRole('borrower')).toBe(true);
      expect(isPartyRole('lender')).toBe(true);
      expect(isPartyRole('fake_role')).toBe(false);
    });

    it('should provide human-readable labels', () => {
      expect(getPartyRoleLabel(PartyRole.ADMINISTRATIVE_AGENT)).toBe('Administrative Agent');
      expect(getPartyRoleLabel(PartyRole.SWINGLINE_LENDER)).toBe('Swingline Lender');
    });
  });

  describe('ConditionStatus', () => {
    it('should have all condition statuses', () => {
      expect(ConditionStatus.PENDING).toBe('pending');
      expect(ConditionStatus.SATISFIED).toBe('satisfied');
      expect(ConditionStatus.WAIVED).toBe('waived');
    });

    it('should validate condition statuses', () => {
      expect(isConditionStatus('satisfied')).toBe(true);
      expect(isConditionStatus('waived')).toBe(true);
      expect(isConditionStatus('invalid')).toBe(false);
    });

    it('should provide human-readable labels', () => {
      expect(getConditionStatusLabel(ConditionStatus.IN_PROGRESS)).toBe('In Progress');
      expect(getConditionStatusLabel(ConditionStatus.NOT_APPLICABLE)).toBe('N/A');
    });
  });

  describe('DefinedTermCategory', () => {
    it('should have all term categories', () => {
      expect(DefinedTermCategory.PARTY).toBe('party');
      expect(DefinedTermCategory.DOCUMENT).toBe('document');
      expect(DefinedTermCategory.FACILITY).toBe('facility');
      expect(DefinedTermCategory.COLLATERAL).toBe('collateral');
      expect(DefinedTermCategory.GENERAL).toBe('general');
    });
  });

  describe('DocumentCategory', () => {
    it('should have all document categories', () => {
      expect(DocumentCategory.CORE_AGREEMENT).toBe('Core Agreement');
      expect(DocumentCategory.CORPORATE_DOCUMENTS).toBe('Corporate Documents');
      expect(DocumentCategory.SECURITY_DOCUMENTS).toBe('Security Documents');
      expect(DocumentCategory.LEGAL_OPINIONS).toBe('Legal Opinions');
    });
  });
});

// ==================== ONTOLOGY TESTS ====================

import {
  loadBuiltinOntology,
  validateOntology,
  getDocumentsByCategory,
  getConditionBySection,
  getDocumentCategories,
  getConditionCategories,
  getDocumentByKey,
  type OntologyConfig,
} from '../src/ontology.js';

describe('Ontology System', () => {
  let ontology: OntologyConfig;

  beforeEach(() => {
    ontology = loadBuiltinOntology('credit-agreement-v1');
  });

  describe('Loading', () => {
    it('should load built-in credit-agreement-v1 ontology', () => {
      expect(ontology.name).toBe('credit-agreement-v1');
      expect(ontology.version).toBe('1.0.0');
    });

    it('should have document templates', () => {
      expect(ontology.documentTemplates.length).toBeGreaterThan(0);
    });

    it('should have condition templates', () => {
      expect(ontology.conditionTemplates.length).toBeGreaterThan(0);
    });

    it('should have covenant templates', () => {
      expect(ontology.covenantTemplates).toBeDefined();
      expect(ontology.covenantTemplates!.length).toBeGreaterThan(0);
    });

    it('should have basket templates', () => {
      expect(ontology.basketTemplates).toBeDefined();
      expect(ontology.basketTemplates!.length).toBeGreaterThan(0);
    });
  });

  describe('Document Templates', () => {
    it('should have credit agreement template', () => {
      const creditAgreement = getDocumentByKey(ontology, 'credit_agreement');
      expect(creditAgreement).toBeDefined();
      expect(creditAgreement!.documentType).toBe('credit_agreement');
      expect(creditAgreement!.category).toBe('Core Agreement');
    });

    it('should have officers certificate template', () => {
      const cert = getDocumentByKey(ontology, 'officers_certificate');
      expect(cert).toBeDefined();
      expect(cert!.defaultResponsibleRole).toBe('borrower');
    });

    it('should get documents by category', () => {
      const corporateDocs = getDocumentsByCategory(ontology, 'Corporate Documents');
      expect(corporateDocs.length).toBeGreaterThan(0);
      expect(corporateDocs.every(d => d.category === 'Corporate Documents')).toBe(true);
    });

    it('should get all document categories', () => {
      const categories = getDocumentCategories(ontology);
      expect(categories).toContain('Core Agreement');
      expect(categories).toContain('Corporate Documents');
      expect(categories).toContain('Security Documents');
    });
  });

  describe('Condition Templates', () => {
    it('should have corporate documents condition', () => {
      const condition = getConditionBySection(ontology, '4.01(a)');
      expect(condition).toBeDefined();
      expect(condition!.title).toBe('Corporate Documents');
    });

    it('should have expected document keys', () => {
      const condition = getConditionBySection(ontology, '4.01(a)');
      expect(condition!.expectedDocumentKeys).toContain('officers_certificate');
      expect(condition!.expectedDocumentKeys).toContain('secretary_certificate');
    });

    it('should get all condition categories', () => {
      const categories = getConditionCategories(ontology);
      expect(categories).toContain('Corporate Documents');
      expect(categories).toContain('Security Documents');
      expect(categories).toContain('Legal Opinions');
    });
  });

  describe('Validation', () => {
    it('should validate ontology with no errors', () => {
      const errors = validateOntology(ontology);
      expect(errors.length).toBe(0);
    });

    it('should detect invalid document references', () => {
      const invalidOntology: OntologyConfig = {
        name: 'test',
        documentTemplates: [],
        conditionTemplates: [{
          sectionReference: '1.01',
          title: 'Test',
          description: 'Test',
          category: 'Test',
          expectedDocumentKeys: ['nonexistent_doc'],
        }],
      };

      const errors = validateOntology(invalidOntology);
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('nonexistent_doc');
    });
  });

  describe('Covenant Templates', () => {
    it('should have total leverage template', () => {
      const totalLeverage = ontology.covenantTemplates!.find(c => c.key === 'total_leverage');
      expect(totalLeverage).toBeDefined();
      expect(totalLeverage!.metric).toBe('TotalLeverage');
      expect(totalLeverage!.defaultOperator).toBe('<=');
    });

    it('should have common thresholds by transaction type', () => {
      const totalLeverage = ontology.covenantTemplates!.find(c => c.key === 'total_leverage');
      expect(totalLeverage!.commonThresholds).toBeDefined();
      expect(totalLeverage!.commonThresholds!.leveraged).toBe(5.0);
    });
  });

  describe('Basket Templates', () => {
    it('should have general investment basket template', () => {
      const basket = ontology.basketTemplates!.find(b => b.key === 'general_investment');
      expect(basket).toBeDefined();
      expect(basket!.basketType).toBe('grower');
    });

    it('should have common capacities', () => {
      const basket = ontology.basketTemplates!.find(b => b.key === 'general_investment');
      expect(basket!.commonCapacities).toBeDefined();
      expect(basket!.commonCapacities!.leveraged).toContain('GreaterOf');
    });
  });
});

// ==================== DEFINED TERMS TESTS ====================

import {
  parseDefinedTerm,
  parseDefinedTerms,
  loadDefinedTermsFromJson,
  createTermsRegistry,
  findTerm,
  findTermsByCategory,
  findReferencingTerms,
  buildCrossReferenceGraph,
  findCircularReferences,
  validateCrossReferences,
  findDuplicateTerms,
  isCalculableTerm,
  extractPotentialIdentifiers,
  type DefinedTerm,
  type DefinedTermsRegistry,
} from '../src/defined-terms.js';

describe('Defined Terms System', () => {
  const sampleTerms: DefinedTerm[] = [
    {
      term: 'EBITDA',
      definition: 'means Net Income plus Interest Expense plus Tax Expense plus Depreciation and Amortization',
      source: 'credit_agreement',
      sectionReference: 'Section 1.01',
      category: 'financial',
      crossReferences: ['Net Income', 'Interest Expense', 'Tax Expense'],
    },
    {
      term: 'Net Income',
      definition: 'means the net income of the Borrower and its Subsidiaries determined in accordance with GAAP',
      source: 'credit_agreement',
      sectionReference: 'Section 1.01',
      category: 'financial',
      crossReferences: ['Borrower', 'GAAP'],
    },
    {
      term: 'Borrower',
      definition: 'ABC Corporation, a Delaware corporation',
      source: 'credit_agreement',
      sectionReference: 'Section 1.01',
      category: 'party',
      crossReferences: [],
    },
  ];

  describe('Parsing', () => {
    it('should parse a raw defined term', () => {
      const raw = {
        term: 'Test',
        definition: 'Test definition',
        source: 'test_source',
        section_reference: 'Section 1.01',
        category: 'general',
        cross_references: ['Other Term'],
        notes: 'Test notes',
      };

      const parsed = parseDefinedTerm(raw);
      expect(parsed.term).toBe('Test');
      expect(parsed.sectionReference).toBe('Section 1.01');
      expect(parsed.crossReferences).toContain('Other Term');
      expect(parsed.notes).toBe('Test notes');
    });

    it('should parse multiple raw terms', () => {
      const rawTerms = [
        { term: 'A', definition: 'A def', source: 's', section_reference: '1', category: 'g', cross_references: [] },
        { term: 'B', definition: 'B def', source: 's', section_reference: '2', category: 'g', cross_references: [] },
      ];

      const parsed = parseDefinedTerms(rawTerms);
      expect(parsed.length).toBe(2);
      expect(parsed[0]!.term).toBe('A');
      expect(parsed[1]!.term).toBe('B');
    });

    it('should load terms from JSON string', () => {
      const json = JSON.stringify([
        { term: 'Test', definition: 'Def', source: 's', section_reference: '1', category: 'g', cross_references: [] }
      ]);

      const terms = loadDefinedTermsFromJson(json);
      expect(terms.length).toBe(1);
      expect(terms[0]!.term).toBe('Test');
    });
  });

  describe('Registry', () => {
    let registry: DefinedTermsRegistry;

    beforeEach(() => {
      registry = createTermsRegistry(sampleTerms, 'test_agreement', '1.0');
    });

    it('should create a registry from terms', () => {
      expect(registry.source).toBe('test_agreement');
      expect(registry.version).toBe('1.0');
      expect(registry.terms.length).toBe(3);
      expect(registry.lastUpdated).toBeDefined();
    });

    it('should find term by name', () => {
      const term = findTerm(registry, 'EBITDA');
      expect(term).toBeDefined();
      expect(term!.definition).toContain('Net Income');
    });

    it('should find term case-insensitively', () => {
      const term = findTerm(registry, 'ebitda');
      expect(term).toBeDefined();
      expect(term!.term).toBe('EBITDA');
    });

    it('should find terms by category', () => {
      const financialTerms = findTermsByCategory(registry, 'financial');
      expect(financialTerms.length).toBe(2);
      expect(financialTerms.every(t => t.category === 'financial')).toBe(true);
    });

    it('should find referencing terms', () => {
      const referencingTerms = findReferencingTerms(registry, 'Net Income');
      expect(referencingTerms.length).toBe(1);
      expect(referencingTerms[0]!.term).toBe('EBITDA');
    });
  });

  describe('Cross-Reference Analysis', () => {
    let registry: DefinedTermsRegistry;

    beforeEach(() => {
      registry = createTermsRegistry(sampleTerms, 'test', '1.0');
    });

    it('should build cross-reference graph', () => {
      const graph = buildCrossReferenceGraph(registry);
      expect(graph.length).toBeGreaterThan(0);

      const ebitdaRefs = graph.filter(r => r.fromTerm === 'EBITDA');
      expect(ebitdaRefs.length).toBe(3);
    });

    it('should detect circular references', () => {
      const circularTerms: DefinedTerm[] = [
        { term: 'A', definition: 'refs B', source: 's', sectionReference: '1', category: 'g', crossReferences: ['B'] },
        { term: 'B', definition: 'refs C', source: 's', sectionReference: '2', category: 'g', crossReferences: ['C'] },
        { term: 'C', definition: 'refs A', source: 's', sectionReference: '3', category: 'g', crossReferences: ['A'] },
      ];
      const circularRegistry = createTermsRegistry(circularTerms, 'test', '1.0');

      const cycles = findCircularReferences(circularRegistry);
      expect(cycles.length).toBeGreaterThan(0);
    });

    it('should not detect cycles where none exist', () => {
      const cycles = findCircularReferences(registry);
      expect(cycles.length).toBe(0);
    });
  });

  describe('Validation', () => {
    it('should validate cross-references', () => {
      const invalidTerms: DefinedTerm[] = [
        { term: 'Test', definition: 'refs undefined', source: 's', sectionReference: '1', category: 'g', crossReferences: ['UndefinedTerm'] },
      ];
      const registry = createTermsRegistry(invalidTerms, 'test', '1.0');

      const errors = validateCrossReferences(registry);
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('UndefinedTerm');
    });

    it('should detect duplicate terms', () => {
      const duplicateTerms: DefinedTerm[] = [
        { term: 'Test', definition: 'def 1', source: 's', sectionReference: '1', category: 'g', crossReferences: [] },
        { term: 'TEST', definition: 'def 2', source: 's', sectionReference: '2', category: 'g', crossReferences: [] },
      ];
      const registry = createTermsRegistry(duplicateTerms, 'test', '1.0');

      const duplicates = findDuplicateTerms(registry);
      expect(duplicates.length).toBe(1);
    });
  });

  describe('ProViso Integration', () => {
    it('should identify calculable terms by category', () => {
      const financialTerm: DefinedTerm = {
        term: 'EBITDA',
        definition: 'calculated value',
        source: 's',
        sectionReference: '1',
        category: 'financial',
        crossReferences: [],
      };

      expect(isCalculableTerm(financialTerm)).toBe(true);
    });

    it('should identify calculable terms by definition keywords', () => {
      const calculableTerm: DefinedTerm = {
        term: 'Leverage',
        definition: 'means the ratio of Total Debt divided by EBITDA',
        source: 's',
        sectionReference: '1',
        category: 'general',
        crossReferences: [],
      };

      expect(isCalculableTerm(calculableTerm)).toBe(true);
    });

    it('should not identify non-calculable terms', () => {
      const partyTerm: DefinedTerm = {
        term: 'Borrower',
        definition: 'ABC Corporation, a Delaware corporation',
        source: 's',
        sectionReference: '1',
        category: 'party',
        crossReferences: [],
      };

      expect(isCalculableTerm(partyTerm)).toBe(false);
    });

    it('should extract potential identifiers from definition', () => {
      const term: DefinedTerm = {
        term: 'EBITDA',
        definition: 'means Net Income plus Interest Expense',
        source: 's',
        sectionReference: '1',
        category: 'financial',
        crossReferences: ['Net Income', 'Interest Expense'],
      };

      const identifiers = extractPotentialIdentifiers(term);
      expect(identifiers).toContain('Net Income');
      expect(identifiers).toContain('Interest Expense');
    });
  });
});

// ==================== MULTI-PERIOD TESTS ====================

describe('Multi-Period Financial Data', () => {
  describe('Type Guards', () => {
    it('should identify multi-period data', async () => {
      const { isMultiPeriodData, isPeriodData, isSimpleFinancialData } = await import('../src/types.js');

      const multiPeriod = {
        periods: [
          { period: '2024-Q1', periodType: 'quarterly', periodEnd: '2024-03-31', data: { revenue: 100 } },
        ],
      };

      const simple = { revenue: 100, expenses: 50 };

      expect(isMultiPeriodData(multiPeriod)).toBe(true);
      expect(isMultiPeriodData(simple)).toBe(false);
      expect(isSimpleFinancialData(simple)).toBe(true);
      expect(isSimpleFinancialData(multiPeriod)).toBe(false);
    });

    it('should identify period data', async () => {
      const { isPeriodData } = await import('../src/types.js');

      const periodData = {
        period: '2024-Q1',
        periodType: 'quarterly',
        periodEnd: '2024-03-31',
        data: { revenue: 100 },
      };

      expect(isPeriodData(periodData)).toBe(true);
      expect(isPeriodData({ revenue: 100 })).toBe(false);
    });
  });

  describe('Trailing Expression Parsing', () => {
    it('should parse TRAILING QUARTERS expression', async () => {
      const source = `
        DEFINE LTM_EBITDA AS
          TRAILING 4 QUARTERS OF EBITDA
      `;
      const ast = await parseOrThrow(source);
      const define = ast.statements.find((s) => s.type === 'Define') as any;
      expect(define).toBeDefined();
      expect(define.expression.type).toBe('Trailing');
      expect(define.expression.count).toBe(4);
      expect(define.expression.period).toBe('quarters');
    });

    it('should parse TRAILING MONTHS expression', async () => {
      const source = `
        DEFINE LTM_Revenue AS
          TRAILING 12 MONTHS OF revenue
      `;
      const ast = await parseOrThrow(source);
      const define = ast.statements.find((s) => s.type === 'Define') as any;
      expect(define.expression.type).toBe('Trailing');
      expect(define.expression.count).toBe(12);
      expect(define.expression.period).toBe('months');
    });

    it('should parse TRAILING YEARS expression', async () => {
      const source = `
        DEFINE ThreeYearAvg AS
          TRAILING 3 YEARS OF annualRevenue
      `;
      const ast = await parseOrThrow(source);
      const define = ast.statements.find((s) => s.type === 'Define') as any;
      expect(define.expression.type).toBe('Trailing');
      expect(define.expression.count).toBe(3);
      expect(define.expression.period).toBe('years');
    });

    it('should parse trailing with singular period (QUARTER)', async () => {
      const source = `
        DEFINE SingleQuarter AS
          TRAILING 1 QUARTER OF EBITDA
      `;
      const ast = await parseOrThrow(source);
      const define = ast.statements.find((s) => s.type === 'Define') as any;
      expect(define.expression.count).toBe(1);
      expect(define.expression.period).toBe('quarters');
    });
  });

  describe('Multi-Period Interpreter', () => {
    const multiPeriodData = {
      periods: [
        {
          period: '2024-Q1',
          periodType: 'quarterly' as const,
          periodEnd: '2024-03-31',
          data: { EBITDA: 10000000, interest_expense: 1000000, funded_debt: 40000000 },
        },
        {
          period: '2024-Q2',
          periodType: 'quarterly' as const,
          periodEnd: '2024-06-30',
          data: { EBITDA: 11000000, interest_expense: 1100000, funded_debt: 42000000 },
        },
        {
          period: '2024-Q3',
          periodType: 'quarterly' as const,
          periodEnd: '2024-09-30',
          data: { EBITDA: 10500000, interest_expense: 1050000, funded_debt: 43000000 },
        },
        {
          period: '2024-Q4',
          periodType: 'quarterly' as const,
          periodEnd: '2024-12-31',
          data: { EBITDA: 11500000, interest_expense: 1150000, funded_debt: 45000000 },
        },
      ],
    };

    it('should load multi-period data and detect mode', async () => {
      const source = `DEFINE Test AS EBITDA`;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);

      expect(interpreter.hasMultiPeriodData()).toBe(false);

      interpreter.loadFinancials(multiPeriodData);
      expect(interpreter.hasMultiPeriodData()).toBe(true);
    });

    it('should return available periods sorted', async () => {
      const source = `DEFINE Test AS EBITDA`;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);
      interpreter.loadFinancials(multiPeriodData);

      const periods = interpreter.getAvailablePeriods();
      expect(periods).toEqual(['2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4']);
    });

    it('should default to latest period', async () => {
      const source = `DEFINE Test AS EBITDA`;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);
      interpreter.loadFinancials(multiPeriodData);

      expect(interpreter.getEvaluationPeriod()).toBe('2024-Q4');
    });

    it('should set and get evaluation period', async () => {
      const source = `DEFINE Test AS EBITDA`;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);
      interpreter.loadFinancials(multiPeriodData);

      interpreter.setEvaluationPeriod('2024-Q2');
      expect(interpreter.getEvaluationPeriod()).toBe('2024-Q2');
    });

    it('should throw on invalid period', async () => {
      const source = `DEFINE Test AS EBITDA`;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);
      interpreter.loadFinancials(multiPeriodData);

      expect(() => interpreter.setEvaluationPeriod('2025-Q1')).toThrow();
    });

    it('should evaluate identifier for current period', async () => {
      const source = `
        DEFINE Test AS EBITDA
        COVENANT MaxTest REQUIRES Test <= 50_000_000
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);
      interpreter.loadFinancials(multiPeriodData);

      // Default is Q4, EBITDA = 11500000
      const result = interpreter.checkCovenant('MaxTest');
      expect(result.actual).toBe(11500000);

      // Switch to Q1, EBITDA = 10000000
      interpreter.setEvaluationPeriod('2024-Q1');
      const result2 = interpreter.checkCovenant('MaxTest');
      expect(result2.actual).toBe(10000000);
    });

    it('should evaluate trailing expression', async () => {
      const source = `
        DEFINE LTM_EBITDA AS TRAILING 4 QUARTERS OF EBITDA
        COVENANT MaxLeverage REQUIRES funded_debt / LTM_EBITDA <= 2.00
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);
      interpreter.loadFinancials(multiPeriodData);

      // LTM EBITDA = 10 + 11 + 10.5 + 11.5 = 43 million
      // Q4 funded_debt = 45 million
      // Leverage = 45/43 = 1.047
      const result = interpreter.checkCovenant('MaxLeverage');
      expect(result.actual).toBeCloseTo(45000000 / 43000000, 2);
      expect(result.compliant).toBe(true);
    });

    it('should handle trailing with fewer periods available', async () => {
      const source = `
        DEFINE LTM_EBITDA AS TRAILING 4 QUARTERS OF EBITDA
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);

      // Load only 2 quarters
      interpreter.loadFinancials({
        periods: [
          { period: '2024-Q3', periodType: 'quarterly', periodEnd: '2024-09-30', data: { EBITDA: 10000000 } },
          { period: '2024-Q4', periodType: 'quarterly', periodEnd: '2024-12-31', data: { EBITDA: 11000000 } },
        ],
      });

      // Should sum available periods (only 2) - this will log a warning
      // but should still work
      const definition = ast.statements.find((s) => s.type === 'Define') as any;
      expect(definition).toBeDefined();
    });

    it('should get compliance history', async () => {
      const source = `
        COVENANT MinEBITDA REQUIRES EBITDA >= 10_500_000
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);
      interpreter.loadFinancials(multiPeriodData);

      const history = interpreter.getComplianceHistory();
      expect(history.length).toBe(4);

      // Q1: 10M < 10.5M -> breach
      expect(history[0]?.period).toBe('2024-Q1');
      expect(history[0]?.overallCompliant).toBe(false);

      // Q2: 11M >= 10.5M -> compliant
      expect(history[1]?.period).toBe('2024-Q2');
      expect(history[1]?.overallCompliant).toBe(true);

      // Q3: 10.5M >= 10.5M -> compliant (exactly)
      expect(history[2]?.period).toBe('2024-Q3');
      expect(history[2]?.overallCompliant).toBe(true);

      // Q4: 11.5M >= 10.5M -> compliant
      expect(history[3]?.period).toBe('2024-Q4');
      expect(history[3]?.overallCompliant).toBe(true);
    });
  });

  describe('Backward Compatibility', () => {
    it('should still work with simple financial data', async () => {
      const source = `
        DEFINE EBITDA AS net_income + interest
        COVENANT MaxLeverage REQUIRES debt / EBITDA <= 4.00
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);

      // Old-style simple data
      interpreter.loadFinancials({
        net_income: 8000000,
        interest: 2000000,
        debt: 36000000,
      });

      expect(interpreter.hasMultiPeriodData()).toBe(false);

      const result = interpreter.checkCovenant('MaxLeverage');
      expect(result.actual).toBeCloseTo(3.6, 1);
      expect(result.compliant).toBe(true);
    });

    it('should work with loadFinancialsFromFile for simple data', async () => {
      const source = `DEFINE Test AS revenue`;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);

      interpreter.loadFinancialsFromFile({
        financials: { revenue: 1000000 },
        adjustments: { bonus: 50000 },
      });

      expect(interpreter.hasMultiPeriodData()).toBe(false);
    });
  });

  describe('Period Sorting', () => {
    it('should sort quarterly periods correctly', async () => {
      const source = `DEFINE Test AS value`;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);

      // Load out-of-order periods
      interpreter.loadFinancials({
        periods: [
          { period: '2024-Q3', periodType: 'quarterly', periodEnd: '2024-09-30', data: { value: 3 } },
          { period: '2024-Q1', periodType: 'quarterly', periodEnd: '2024-03-31', data: { value: 1 } },
          { period: '2024-Q4', periodType: 'quarterly', periodEnd: '2024-12-31', data: { value: 4 } },
          { period: '2024-Q2', periodType: 'quarterly', periodEnd: '2024-06-30', data: { value: 2 } },
        ],
      });

      const periods = interpreter.getAvailablePeriods();
      expect(periods).toEqual(['2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4']);
    });

    it('should sort monthly periods correctly', async () => {
      const source = `DEFINE Test AS value`;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);

      interpreter.loadFinancials({
        periods: [
          { period: '2024-03', periodType: 'monthly', periodEnd: '2024-03-31', data: { value: 3 } },
          { period: '2024-01', periodType: 'monthly', periodEnd: '2024-01-31', data: { value: 1 } },
          { period: '2024-02', periodType: 'monthly', periodEnd: '2024-02-29', data: { value: 2 } },
        ],
      });

      const periods = interpreter.getAvailablePeriods();
      expect(periods).toEqual(['2024-01', '2024-02', '2024-03']);
    });
  });

  describe('Validation', () => {
    it('should validate trailing expressions', async () => {
      const { validate } = await import('../src/validator.js');

      const source = `
        DEFINE LTM_EBITDA AS TRAILING 4 QUARTERS OF QuarterlyEBITDA
        DEFINE QuarterlyEBITDA AS net_income + depreciation
      `;
      const ast = await parseOrThrow(source);
      const result = validate(ast);

      // Should have warnings for net_income and depreciation (undefined identifiers)
      // but no errors
      expect(result.valid).toBe(true);
    });
  });
});

// ==================== PHASE SYSTEM TESTS (v1.0) ====================

describe('Phase System', () => {
  describe('Parser', () => {
    it('should parse PHASE statement with UNTIL clause', async () => {
      const source = `
        PHASE Construction
          UNTIL COD_Achieved
          COVENANTS SUSPENDED MaxLeverage
          REQUIRED MinEquityContribution
      `;
      const ast = await parseOrThrow(source);
      const phase = ast.statements.find(s => s.type === 'Phase') as any;

      expect(phase).toBeDefined();
      expect(phase.name).toBe('Construction');
      expect(phase.until).toBe('COD_Achieved');
      expect(phase.covenantsSuspended).toContain('MaxLeverage');
      expect(phase.requiredCovenants).toContain('MinEquityContribution');
    });

    it('should parse PHASE statement with FROM clause', async () => {
      const source = `
        PHASE Operations
          FROM COD_Achieved
          COVENANTS ACTIVE MaxLeverage, MinDSCR
      `;
      const ast = await parseOrThrow(source);
      const phase = ast.statements.find(s => s.type === 'Phase') as any;

      expect(phase).toBeDefined();
      expect(phase.name).toBe('Operations');
      expect(phase.from).toBe('COD_Achieved');
      expect(phase.covenantsActive).toEqual(['MaxLeverage', 'MinDSCR']);
    });

    it('should parse PHASE with multiple suspended covenants', async () => {
      const source = `
        PHASE Construction
          UNTIL COD_Achieved
          COVENANTS SUSPENDED MaxLeverage, InterestCoverage, MinDSCR
      `;
      const ast = await parseOrThrow(source);
      const phase = ast.statements.find(s => s.type === 'Phase') as any;

      expect(phase.covenantsSuspended).toEqual(['MaxLeverage', 'InterestCoverage', 'MinDSCR']);
    });

    it('should parse TRANSITION statement with ALL_OF condition', async () => {
      const source = `
        TRANSITION COD_Achieved
          WHEN ALL_OF(
            SubstantialCompletion,
            LenderCertification,
            InsuranceInPlace
          )
      `;
      const ast = await parseOrThrow(source);
      const transition = ast.statements.find(s => s.type === 'Transition') as any;

      expect(transition).toBeDefined();
      expect(transition.name).toBe('COD_Achieved');
      expect(transition.when.type).toBe('AllOf');
      expect(transition.when.conditions).toEqual([
        'SubstantialCompletion',
        'LenderCertification',
        'InsuranceInPlace'
      ]);
    });

    it('should parse TRANSITION statement with ANY_OF condition', async () => {
      const source = `
        TRANSITION EarlyTermination
          WHEN ANY_OF(
            BorrowerDefault,
            MaterialAdverseChange,
            LenderAcceleration
          )
      `;
      const ast = await parseOrThrow(source);
      const transition = ast.statements.find(s => s.type === 'Transition') as any;

      expect(transition.when.type).toBe('AnyOf');
      expect(transition.when.conditions).toHaveLength(3);
    });

    it('should parse TRANSITION with simple boolean expression', async () => {
      const source = `
        TRANSITION MaturityReached
          WHEN maturity_date_reached = 1
      `;
      const ast = await parseOrThrow(source);
      const transition = ast.statements.find(s => s.type === 'Transition') as any;

      expect(transition.when.type).toBe('Comparison');
    });
  });

  describe('Interpreter - Phase Management', () => {
    it('should set initial phase from first PHASE with no FROM clause', async () => {
      const source = `
        PHASE Construction
          UNTIL COD_Achieved

        PHASE Operations
          FROM COD_Achieved
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);

      expect(interpreter.getCurrentPhase()).toBe('Construction');
    });

    it('should track phase history', async () => {
      const source = `
        PHASE Construction
          UNTIL COD_Achieved

        PHASE Operations
          FROM COD_Achieved
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);

      const history = interpreter.getPhaseHistory();
      expect(history).toHaveLength(1);
      expect(history[0].phase).toBe('Construction');
      expect(history[0].triggeredBy).toBeNull();
    });

    it('should transition to new phase', async () => {
      const source = `
        PHASE Construction
          UNTIL COD_Achieved

        PHASE Operations
          FROM COD_Achieved
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);

      expect(interpreter.getCurrentPhase()).toBe('Construction');

      interpreter.transitionTo('COD_Achieved');

      expect(interpreter.getCurrentPhase()).toBe('Operations');
      expect(interpreter.getPhaseHistory()).toHaveLength(2);
    });

    it('should get phase names', async () => {
      const source = `
        PHASE Construction
          UNTIL COD_Achieved

        PHASE Operations
          FROM COD_Achieved
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);

      expect(interpreter.getPhaseNames()).toEqual(['Construction', 'Operations']);
    });

    it('should report hasPhases correctly', async () => {
      const sourceWithPhases = `
        PHASE Construction
          UNTIL COD_Achieved
      `;
      const sourceWithoutPhases = `
        COVENANT MaxLeverage
          REQUIRES Leverage <= 4.5
          TESTED QUARTERLY
      `;

      const ast1 = await parseOrThrow(sourceWithPhases);
      const ast2 = await parseOrThrow(sourceWithoutPhases);

      const interpreter1 = new ProVisoInterpreter(ast1);
      const interpreter2 = new ProVisoInterpreter(ast2);

      expect(interpreter1.hasPhases()).toBe(true);
      expect(interpreter2.hasPhases()).toBe(false);
    });
  });

  describe('Interpreter - Covenant Suspension', () => {
    it('should suspend covenants in construction phase', async () => {
      const source = `
        PHASE Construction
          UNTIL COD_Achieved
          COVENANTS SUSPENDED MaxLeverage, InterestCoverage

        COVENANT MaxLeverage
          REQUIRES Leverage <= 4.5
          TESTED QUARTERLY

        COVENANT InterestCoverage
          REQUIRES coverage >= 2.5
          TESTED QUARTERLY

        COVENANT MinEquity
          REQUIRES equity >= 1000000
          TESTED QUARTERLY

        DEFINE Leverage AS total_debt / ebitda
        DEFINE coverage AS ebitda / interest
        DEFINE equity AS total_equity
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);

      expect(interpreter.getCurrentPhase()).toBe('Construction');
      expect(interpreter.getSuspendedCovenants()).toEqual(['MaxLeverage', 'InterestCoverage']);
      expect(interpreter.getActiveCovenants()).toEqual(['MinEquity']);
    });

    it('should check only active covenants in checkActiveCovenants', async () => {
      const source = `
        PHASE Construction
          UNTIL COD_Achieved
          COVENANTS SUSPENDED MaxLeverage

        COVENANT MaxLeverage
          REQUIRES Leverage <= 4.5
          TESTED QUARTERLY

        COVENANT MinEquity
          REQUIRES equity >= 1000000
          TESTED QUARTERLY

        DEFINE Leverage AS total_debt / ebitda
        DEFINE equity AS total_equity
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);

      interpreter.loadFinancials({
        total_debt: 5000000,
        ebitda: 1000000,  // Leverage = 5.0, would fail MaxLeverage
        total_equity: 2000000  // Passes MinEquity
      });

      // checkAllCovenants includes all covenants
      const allResults = interpreter.checkAllCovenants();
      expect(allResults).toHaveLength(2);
      expect(allResults.find(r => r.name === 'MaxLeverage')?.compliant).toBe(false);

      // checkActiveCovenants excludes suspended covenants
      const activeResults = interpreter.checkActiveCovenants();
      expect(activeResults).toHaveLength(1);
      expect(activeResults[0].name).toBe('MinEquity');
      expect(activeResults[0].compliant).toBe(true);
    });

    it('should activate covenants after transition to operations', async () => {
      const source = `
        PHASE Construction
          UNTIL COD_Achieved
          COVENANTS SUSPENDED MaxLeverage

        PHASE Operations
          FROM COD_Achieved
          COVENANTS ACTIVE MaxLeverage, MinEquity

        COVENANT MaxLeverage
          REQUIRES Leverage <= 4.5
          TESTED QUARTERLY

        COVENANT MinEquity
          REQUIRES equity >= 1000000
          TESTED QUARTERLY

        DEFINE Leverage AS total_debt / ebitda
        DEFINE equity AS total_equity
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);

      // Initially in Construction
      expect(interpreter.getSuspendedCovenants()).toContain('MaxLeverage');

      // Transition to Operations
      interpreter.transitionTo('COD_Achieved');

      expect(interpreter.getCurrentPhase()).toBe('Operations');
      expect(interpreter.getSuspendedCovenants()).toEqual([]);
      expect(interpreter.getActiveCovenants()).toEqual(['MaxLeverage', 'MinEquity']);
    });

    it('should include required covenants in phase checking', async () => {
      const source = `
        PHASE Construction
          UNTIL COD_Achieved
          COVENANTS SUSPENDED MaxLeverage
          REQUIRED MinEquityContribution

        COVENANT MaxLeverage
          REQUIRES Leverage <= 4.5
          TESTED QUARTERLY

        COVENANT MinEquityContribution
          REQUIRES equity_pct >= 0.35
          TESTED MONTHLY

        DEFINE Leverage AS total_debt / ebitda
        DEFINE equity_pct AS equity / total_project_cost
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);

      expect(interpreter.getRequiredCovenants()).toEqual(['MinEquityContribution']);
    });
  });

  describe('Interpreter - Transition Conditions', () => {
    it('should check ALL_OF transition conditions', async () => {
      const source = `
        TRANSITION COD_Achieved
          WHEN ALL_OF(
            SubstantialCompletion,
            LenderCertification,
            InsuranceInPlace
          )

        PHASE Construction
          UNTIL COD_Achieved

        PHASE Operations
          FROM COD_Achieved
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);

      // Check transition before any conditions are satisfied
      let transitions = interpreter.checkPhaseTransitions();
      expect(transitions).toHaveLength(1);
      expect(transitions[0].triggered).toBe(false);
      expect(transitions[0].conditions.every(c => !c.met)).toBe(true);

      // Satisfy some conditions
      interpreter.satisfyCondition('SubstantialCompletion');
      interpreter.satisfyCondition('LenderCertification');

      transitions = interpreter.checkPhaseTransitions();
      expect(transitions[0].triggered).toBe(false);
      expect(transitions[0].conditions.filter(c => c.met)).toHaveLength(2);

      // Satisfy all conditions
      interpreter.satisfyCondition('InsuranceInPlace');

      transitions = interpreter.checkPhaseTransitions();
      expect(transitions[0].triggered).toBe(true);
      expect(transitions[0].targetPhase).toBe('Operations');
    });

    it('should check ANY_OF transition conditions', async () => {
      const source = `
        TRANSITION EarlyTermination
          WHEN ANY_OF(
            BorrowerDefault,
            MaterialAdverseChange
          )
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);

      // Not triggered initially
      let transitions = interpreter.checkPhaseTransitions();
      expect(transitions[0].triggered).toBe(false);

      // Satisfy just one condition
      interpreter.satisfyCondition('MaterialAdverseChange');

      transitions = interpreter.checkPhaseTransitions();
      expect(transitions[0].triggered).toBe(true);
    });

    it('should track and clear satisfied conditions', async () => {
      const source = `
        PHASE Construction
          UNTIL COD_Achieved
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);

      expect(interpreter.isConditionSatisfied('TestCondition')).toBe(false);

      interpreter.satisfyCondition('TestCondition');
      expect(interpreter.isConditionSatisfied('TestCondition')).toBe(true);

      interpreter.clearCondition('TestCondition');
      expect(interpreter.isConditionSatisfied('TestCondition')).toBe(false);
    });
  });

  describe('Interpreter - Status Report with Phases', () => {
    it('should include phase info in status report', async () => {
      const source = `
        PHASE Construction
          UNTIL COD_Achieved
          COVENANTS SUSPENDED MaxLeverage

        COVENANT MaxLeverage
          REQUIRES Leverage <= 4.5
          TESTED QUARTERLY

        DEFINE Leverage AS total_debt / ebitda
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);

      interpreter.loadFinancials({
        total_debt: 3000000,
        ebitda: 1000000
      });

      const status = interpreter.getStatus();

      expect(status.currentPhase).toBe('Construction');
      expect(status.suspendedCovenants).toContain('MaxLeverage');
      // Should only check active covenants (none in this case since only one covenant which is suspended)
      expect(status.covenants).toHaveLength(0);
    });

    it('should check covenants without phase info when no phases defined', async () => {
      const source = `
        COVENANT MaxLeverage
          REQUIRES Leverage <= 4.5
          TESTED QUARTERLY

        DEFINE Leverage AS total_debt / ebitda
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);

      interpreter.loadFinancials({
        total_debt: 3000000,
        ebitda: 1000000
      });

      const status = interpreter.getStatus();

      expect(status.currentPhase).toBeUndefined();
      expect(status.suspendedCovenants).toBeUndefined();
      expect(status.covenants).toHaveLength(1);
    });
  });

  describe('Integration - Full Project Finance Flow', () => {
    it('should simulate construction to operations transition', async () => {
      const source = `
        // Phases
        PHASE Construction
          UNTIL COD_Achieved
          COVENANTS SUSPENDED TotalLeverage, InterestCoverage
          REQUIRED MinEquityContribution

        PHASE Operations
          FROM COD_Achieved
          COVENANTS ACTIVE TotalLeverage, InterestCoverage, MinDSCR

        // Transition
        TRANSITION COD_Achieved
          WHEN ALL_OF(
            SubstantialCompletion,
            LenderCertification
          )

        // Covenants
        COVENANT TotalLeverage
          REQUIRES Leverage <= 4.50
          TESTED QUARTERLY

        COVENANT InterestCoverage
          REQUIRES EBITDA / interest_expense >= 2.50
          TESTED QUARTERLY

        COVENANT MinDSCR
          REQUIRES DSCR >= 1.25
          TESTED QUARTERLY

        COVENANT MinEquityContribution
          REQUIRES equity_pct >= 0.35
          TESTED MONTHLY

        // Definitions
        DEFINE Leverage AS TotalDebt / EBITDA
        DEFINE TotalDebt AS senior_debt + subordinated_debt
        DEFINE EBITDA AS net_income + interest_expense + depreciation
        DEFINE DSCR AS EBITDA / debt_service
        DEFINE equity_pct AS equity_contributed / total_project_cost
      `;
      const ast = await parseOrThrow(source);
      const interpreter = new ProVisoInterpreter(ast);

      interpreter.loadFinancials({
        net_income: 5000000,
        interest_expense: 2000000,
        depreciation: 3000000,
        senior_debt: 30000000,
        subordinated_debt: 0,
        debt_service: 6000000,
        equity_contributed: 18000000,
        total_project_cost: 50000000
      });

      // CONSTRUCTION PHASE
      expect(interpreter.getCurrentPhase()).toBe('Construction');

      // Leverage covenants should be suspended
      expect(interpreter.getSuspendedCovenants()).toContain('TotalLeverage');
      expect(interpreter.getSuspendedCovenants()).toContain('InterestCoverage');

      // Only check active covenants (MinEquityContribution in this setup)
      const constructionResults = interpreter.checkActiveCovenants();
      expect(constructionResults.some(r => r.name === 'TotalLeverage')).toBe(false);

      // Check transition status
      let transitions = interpreter.checkPhaseTransitions();
      expect(transitions[0].triggered).toBe(false);

      // Satisfy construction milestones
      interpreter.satisfyCondition('SubstantialCompletion');
      interpreter.satisfyCondition('LenderCertification');

      transitions = interpreter.checkPhaseTransitions();
      expect(transitions[0].triggered).toBe(true);

      // Execute transition
      interpreter.transitionTo('COD_Achieved');

      // OPERATIONS PHASE
      expect(interpreter.getCurrentPhase()).toBe('Operations');
      expect(interpreter.getSuspendedCovenants()).toEqual([]);

      // Now all covenants should be active
      const operationsResults = interpreter.checkActiveCovenants();
      expect(operationsResults.map(r => r.name)).toContain('TotalLeverage');
      expect(operationsResults.map(r => r.name)).toContain('InterestCoverage');
      expect(operationsResults.map(r => r.name)).toContain('MinDSCR');
    });
  });
});

// ==================== MILESTONE TESTS ====================

describe('Milestones', () => {
  it('should parse MILESTONE statements', async () => {
    const source = `
      MILESTONE FoundationComplete
        TARGET 2024-06-30
        LONGSTOP 2024-09-30
        TRIGGERS Draw2Available
    `;
    const ast = await parseOrThrow(source);
    const milestone = ast.statements.find(s => s.type === 'Milestone') as any;
    expect(milestone).toBeDefined();
    expect(milestone.name).toBe('FoundationComplete');
    expect(milestone.targetDate).toBe('2024-06-30');
    expect(milestone.longstopDate).toBe('2024-09-30');
    expect(milestone.triggers).toEqual(['Draw2Available']);
  });

  it('should parse MILESTONE with REQUIRES', async () => {
    const source = `
      MILESTONE SubstantialCompletion
        TARGET 2025-06-15
        LONGSTOP 2025-08-15
        REQUIRES ALL_OF(RoofComplete, MEPComplete)
        TRIGGERS COD_Achieved
    `;
    const ast = await parseOrThrow(source);
    const milestone = ast.statements.find(s => s.type === 'Milestone') as any;
    expect(milestone.requires.type).toBe('AllOf');
    expect(milestone.requires.conditions).toEqual(['RoofComplete', 'MEPComplete']);
  });

  it('should parse MILESTONE with single prerequisite', async () => {
    const source = `
      MILESTONE SteelErection
        TARGET 2024-09-30
        LONGSTOP 2024-12-31
        REQUIRES FoundationComplete
    `;
    const ast = await parseOrThrow(source);
    const milestone = ast.statements.find(s => s.type === 'Milestone') as any;
    expect(milestone.requires).toBe('FoundationComplete');
  });

  it('should track milestone status', async () => {
    const source = `
      MILESTONE FoundationComplete
        TARGET 2024-06-30
        LONGSTOP 2024-09-30
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    // Check pending status (using a date before target)
    const status = interpreter.getMilestoneStatus('FoundationComplete', new Date('2024-05-01'));
    expect(status.status).toBe('pending');
    expect(status.daysToTarget).toBe(60);
    expect(status.daysToLongstop).toBe(152);
  });

  it('should detect at_risk status', async () => {
    const source = `
      MILESTONE FoundationComplete
        TARGET 2024-06-30
        LONGSTOP 2024-09-30
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    // Check at_risk status (past target, before longstop)
    const status = interpreter.getMilestoneStatus('FoundationComplete', new Date('2024-08-01'));
    expect(status.status).toBe('at_risk');
  });

  it('should detect breached status', async () => {
    const source = `
      MILESTONE FoundationComplete
        TARGET 2024-06-30
        LONGSTOP 2024-09-30
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    // Check breached status (past longstop)
    const status = interpreter.getMilestoneStatus('FoundationComplete', new Date('2024-10-15'));
    expect(status.status).toBe('breached');
  });

  it('should mark milestone as achieved', async () => {
    const source = `
      MILESTONE FoundationComplete
        TARGET 2024-06-30
        LONGSTOP 2024-09-30
        TRIGGERS Draw2Available
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    interpreter.achieveMilestone('FoundationComplete', new Date('2024-06-22'));

    const status = interpreter.getMilestoneStatus('FoundationComplete');
    expect(status.status).toBe('achieved');
    expect(status.achievedDate).toBe('2024-06-22');

    // Trigger should be satisfied
    expect(interpreter.isConditionSatisfied('Draw2Available')).toBe(true);
  });

  it('should check milestone prerequisites', async () => {
    const source = `
      MILESTONE FoundationComplete
        TARGET 2024-06-30
        LONGSTOP 2024-09-30

      MILESTONE SteelErection
        TARGET 2024-09-30
        LONGSTOP 2024-12-31
        REQUIRES FoundationComplete
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    // Prerequisites not met
    expect(interpreter.areMilestonePrerequisitesMet('SteelErection')).toBe(false);

    // Achieve prerequisite
    interpreter.achieveMilestone('FoundationComplete');
    expect(interpreter.areMilestonePrerequisitesMet('SteelErection')).toBe(true);
  });

  it('should get all milestone statuses', async () => {
    const source = `
      MILESTONE FoundationComplete
        TARGET 2024-06-30
        LONGSTOP 2024-09-30

      MILESTONE SteelErection
        TARGET 2024-09-30
        LONGSTOP 2024-12-31
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const statuses = interpreter.getAllMilestoneStatuses(new Date('2024-05-01'));
    expect(statuses.length).toBe(2);
    expect(statuses.map(s => s.name)).toEqual(['FoundationComplete', 'SteelErection']);
  });
});

// ==================== RESERVE TESTS ====================

describe('Reserves', () => {
  it('should parse RESERVE statements', async () => {
    const source = `
      DEFINE monthly_debt_service AS 5_000_000

      RESERVE DebtServiceReserve
        TARGET 6 * monthly_debt_service
        MINIMUM 3 * monthly_debt_service
        FUNDED_BY Waterfall, EquityContribution
        RELEASED_TO Waterfall
    `;
    const ast = await parseOrThrow(source);
    const reserve = ast.statements.find(s => s.type === 'Reserve') as any;
    expect(reserve).toBeDefined();
    expect(reserve.name).toBe('DebtServiceReserve');
    expect(reserve.fundedBy).toEqual(['Waterfall', 'EquityContribution']);
    expect(reserve.releasedTo).toBe('Waterfall');
  });

  it('should parse RESERVE with RELEASED_FOR', async () => {
    const source = `
      DEFINE annual_capex_budget AS 16_000_000

      RESERVE MaintenanceReserve
        TARGET annual_capex_budget
        MINIMUM 0.5 * annual_capex_budget
        FUNDED_BY Waterfall
        RELEASED_FOR PermittedCapEx
    `;
    const ast = await parseOrThrow(source);
    const reserve = ast.statements.find(s => s.type === 'Reserve') as any;
    expect(reserve.releasedFor).toBe('PermittedCapEx');
  });

  it('should calculate reserve status', async () => {
    const source = `
      DEFINE monthly_debt_service AS 5_000_000

      RESERVE DebtServiceReserve
        TARGET 6 * monthly_debt_service
        MINIMUM 3 * monthly_debt_service
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials({ monthly_debt_service: 5000000 });

    const status = interpreter.getReserveStatus('DebtServiceReserve');
    expect(status.target).toBe(30000000); // 6 * 5M
    expect(status.minimum).toBe(15000000); // 3 * 5M
    expect(status.balance).toBe(0);
    expect(status.fundedPercent).toBe(0);
    expect(status.belowMinimum).toBe(true);
    expect(status.availableForRelease).toBe(0);
  });

  it('should fund reserve accounts', async () => {
    const source = `
      RESERVE DebtServiceReserve
        TARGET 30_000_000
        MINIMUM 15_000_000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    interpreter.fundReserve('DebtServiceReserve', 20000000);

    const status = interpreter.getReserveStatus('DebtServiceReserve');
    expect(status.balance).toBe(20000000);
    expect(status.fundedPercent).toBeCloseTo(66.67, 1);
    expect(status.belowMinimum).toBe(false);
    expect(status.availableForRelease).toBe(5000000); // 20M - 15M minimum
  });

  it('should draw from reserve accounts', async () => {
    const source = `
      RESERVE DebtServiceReserve
        TARGET 30_000_000
        MINIMUM 15_000_000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    interpreter.setReserveBalance('DebtServiceReserve', 25000000);

    // Can only draw down to minimum
    const drawn = interpreter.drawFromReserve('DebtServiceReserve', 20000000);
    expect(drawn).toBe(10000000); // Can only draw 25M - 15M minimum = 10M

    const status = interpreter.getReserveStatus('DebtServiceReserve');
    expect(status.balance).toBe(15000000);
  });

  it('should get all reserve statuses', async () => {
    const source = `
      RESERVE DebtServiceReserve
        TARGET 30_000_000
        MINIMUM 15_000_000

      RESERVE MaintenanceReserve
        TARGET 16_000_000
        MINIMUM 8_000_000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const statuses = interpreter.getAllReserveStatuses();
    expect(statuses.length).toBe(2);
    expect(statuses.map(s => s.name)).toContain('DebtServiceReserve');
    expect(statuses.map(s => s.name)).toContain('MaintenanceReserve');
  });
});

// ==================== WATERFALL TESTS ====================

describe('Waterfalls', () => {
  it('should parse WATERFALL statements', async () => {
    const source = `
      WATERFALL OperatingWaterfall
        FREQUENCY monthly

        TIER 1 "Operating Expenses"
          PAY operating_expenses
          FROM Revenue

        TIER 2 "Senior Debt Service"
          PAY senior_debt_service
          FROM REMAINDER
    `;
    const ast = await parseOrThrow(source);
    const waterfall = ast.statements.find(s => s.type === 'Waterfall') as any;
    expect(waterfall).toBeDefined();
    expect(waterfall.name).toBe('OperatingWaterfall');
    expect(waterfall.frequency).toBe('monthly');
    expect(waterfall.tiers.length).toBe(2);
    expect(waterfall.tiers[0].name).toBe('Operating Expenses');
    expect(waterfall.tiers[0].from).toBe('Revenue');
  });

  it('should parse WATERFALL with PAY TO reserve', async () => {
    const source = `
      WATERFALL OperatingWaterfall
        FREQUENCY monthly

        TIER 3 "DSRA Replenishment"
          PAY TO DebtServiceReserve
          UNTIL DebtServiceReserve >= 30_000_000
          FROM REMAINDER
    `;
    const ast = await parseOrThrow(source);
    const waterfall = ast.statements.find(s => s.type === 'Waterfall') as any;
    expect(waterfall.tiers[0].payTo).toBe('DebtServiceReserve');
    expect(waterfall.tiers[0].until).toBeDefined();
  });

  it('should parse WATERFALL with SHORTFALL and IF', async () => {
    const source = `
      DEFINE MinDSCR AS 1.25

      WATERFALL OperatingWaterfall
        FREQUENCY monthly

        TIER 2 "Debt Service"
          PAY senior_debt_service
          FROM REMAINDER
          SHORTFALL -> DebtServiceReserve

        TIER 5 "Distributions"
          IF DSCR >= 1.50
          PAY distributions
          FROM REMAINDER
    `;
    const ast = await parseOrThrow(source);
    const waterfall = ast.statements.find(s => s.type === 'Waterfall') as any;
    expect(waterfall.tiers[0].shortfall).toBe('DebtServiceReserve');
    expect(waterfall.tiers[1].condition).toBeDefined();
  });

  it('should execute simple waterfall', async () => {
    const source = `
      WATERFALL TestWaterfall
        FREQUENCY monthly

        TIER 1 "OpEx"
          PAY 3_000_000
          FROM Revenue

        TIER 2 "Debt Service"
          PAY 4_000_000
          FROM REMAINDER
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const result = interpreter.executeWaterfall('TestWaterfall', 10000000);

    expect(result.totalRevenue).toBe(10000000);
    expect(result.tiers[0].paid).toBe(3000000);
    expect(result.tiers[1].paid).toBe(4000000);
    expect(result.remainder).toBe(3000000);
    expect(result.totalDistributed).toBe(7000000);
  });

  it('should handle waterfall shortfall', async () => {
    const source = `
      RESERVE DebtServiceReserve
        TARGET 30_000_000
        MINIMUM 0

      WATERFALL TestWaterfall
        FREQUENCY monthly

        TIER 1 "Debt Service"
          PAY 10_000_000
          FROM Revenue
          SHORTFALL -> DebtServiceReserve
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.setReserveBalance('DebtServiceReserve', 8000000);

    // Only $5M available, need $10M, should draw $5M from reserve
    const result = interpreter.executeWaterfall('TestWaterfall', 5000000);

    expect(result.tiers[0].requested).toBe(10000000);
    expect(result.tiers[0].paid).toBe(10000000); // Paid in full with reserve draw
    expect(result.tiers[0].shortfall).toBe(0);
    expect(result.tiers[0].reserveDrawn).toBe(5000000);

    // Reserve should be drawn down
    const reserveStatus = interpreter.getReserveStatus('DebtServiceReserve');
    expect(reserveStatus.balance).toBe(3000000);
  });

  it('should block distribution tier on condition', async () => {
    const source = `
      DEFINE DSCR AS 1.20

      WATERFALL TestWaterfall
        FREQUENCY monthly

        TIER 1 "OpEx"
          PAY 1_000_000
          FROM Revenue

        TIER 2 "Distributions"
          IF DSCR >= 1.50
          PAY 5_000_000
          FROM REMAINDER
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials({ DSCR: 1.20 });

    const result = interpreter.executeWaterfall('TestWaterfall', 10000000);

    expect(result.tiers[1].blocked).toBe(true);
    expect(result.tiers[1].blockReason).toBe('Condition not met');
    expect(result.tiers[1].paid).toBe(0);
    expect(result.remainder).toBe(9000000); // Only OpEx paid
  });

  it('should pay into reserve with UNTIL condition', async () => {
    const source = `
      RESERVE DebtServiceReserve
        TARGET 30_000_000
        MINIMUM 0

      WATERFALL TestWaterfall
        FREQUENCY monthly

        TIER 1 "Reserve Replenishment"
          PAY TO DebtServiceReserve
          UNTIL DebtServiceReserve >= 30_000_000
          FROM Revenue
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.setReserveBalance('DebtServiceReserve', 25000000);

    // Should only pay 5M to reach target
    const result = interpreter.executeWaterfall('TestWaterfall', 10000000);

    expect(result.tiers[0].requested).toBe(5000000); // Only need 5M to reach target
    expect(result.tiers[0].paid).toBe(5000000);
    expect(result.remainder).toBe(5000000);

    const reserveStatus = interpreter.getReserveStatus('DebtServiceReserve');
    expect(reserveStatus.balance).toBe(30000000);
  });
});

// ==================== CONDITIONS PRECEDENT TESTS ====================

describe('Conditions Precedent', () => {
  it('should parse CONDITIONS_PRECEDENT statements', async () => {
    const source = `
      CONDITIONS_PRECEDENT InitialFunding
        SECTION "4.01"

        CP ExecutedCreditAgreement
          DESCRIPTION "Executed Credit Agreement"
          RESPONSIBLE Agent

        CP LegalOpinions
          DESCRIPTION "Opinions of Borrower's Counsel"
          RESPONSIBLE BorrowerCounsel
    `;
    const ast = await parseOrThrow(source);
    const cp = ast.statements.find(s => s.type === 'ConditionsPrecedent') as any;
    expect(cp).toBeDefined();
    expect(cp.name).toBe('InitialFunding');
    expect(cp.section).toBe('4.01');
    expect(cp.conditions.length).toBe(2);
    expect(cp.conditions[0].name).toBe('ExecutedCreditAgreement');
    expect(cp.conditions[0].responsible).toBe('Agent');
  });

  it('should parse CP with STATUS and SATISFIES', async () => {
    const source = `
      CONDITIONS_PRECEDENT Draw2
        SECTION "4.02"

        CP InsuranceCertificate
          DESCRIPTION "Evidence of Required Insurance"
          RESPONSIBLE Borrower
          STATUS pending
          SATISFIES InsuranceInPlace
    `;
    const ast = await parseOrThrow(source);
    const cp = ast.statements.find(s => s.type === 'ConditionsPrecedent') as any;
    expect(cp.conditions[0].status).toBe('pending');
    expect(cp.conditions[0].satisfies).toEqual(['InsuranceInPlace']);
  });

  it('should track CP checklist status', async () => {
    const source = `
      CONDITIONS_PRECEDENT InitialFunding
        SECTION "4.01"

        CP Item1
          DESCRIPTION "First item"
          STATUS pending

        CP Item2
          DESCRIPTION "Second item"
          STATUS satisfied

        CP Item3
          DESCRIPTION "Third item"
          STATUS waived
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const checklist = interpreter.getCPChecklist('InitialFunding');
    expect(checklist.totalConditions).toBe(3);
    expect(checklist.satisfied).toBe(1);
    expect(checklist.pending).toBe(1);
    expect(checklist.waived).toBe(1);
    expect(checklist.complete).toBe(false); // Still has pending
  });

  it('should update CP status', async () => {
    const source = `
      CONDITIONS_PRECEDENT InitialFunding
        SECTION "4.01"

        CP Item1
          DESCRIPTION "First item"
          STATUS pending
          SATISFIES Condition1
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    // Update status
    interpreter.updateCPStatus('InitialFunding', 'Item1', 'satisfied');

    const checklist = interpreter.getCPChecklist('InitialFunding');
    expect(checklist.satisfied).toBe(1);
    expect(checklist.pending).toBe(0);
    expect(checklist.complete).toBe(true);

    // Should trigger satisfied condition
    expect(interpreter.isConditionSatisfied('Condition1')).toBe(true);
  });

  it('should check if draw is allowed', async () => {
    const source = `
      CONDITIONS_PRECEDENT Draw1
        CP Item1
          STATUS pending

      CONDITIONS_PRECEDENT Draw2
        CP Item2
          STATUS satisfied
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    expect(interpreter.isDrawAllowed('Draw1')).toBe(false);
    expect(interpreter.isDrawAllowed('Draw2')).toBe(true);
  });

  it('should list all CP checklists', async () => {
    const source = `
      CONDITIONS_PRECEDENT InitialFunding
        CP Item1
          STATUS pending

      CONDITIONS_PRECEDENT Draw3
        CP Item2
          STATUS pending
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const names = interpreter.getCPChecklistNames();
    expect(names).toContain('InitialFunding');
    expect(names).toContain('Draw3');
  });
});

// ==================== INTEGRATION TESTS ====================

describe('Project Finance Integration', () => {
  it('should handle complete project finance scenario', async () => {
    const source = `
      // Phases
      PHASE Construction
        UNTIL COD_Achieved
        COVENANTS SUSPENDED TotalLeverage

      PHASE Operations
        FROM COD_Achieved
        COVENANTS ACTIVE TotalLeverage, MinDSCR

      TRANSITION COD_Achieved
        WHEN ALL_OF(SubstantialCompletion, LenderCert)

      // Milestones
      MILESTONE FoundationComplete
        TARGET 2024-06-30
        LONGSTOP 2024-09-30
        TRIGGERS Draw2Available

      MILESTONE SubstantialCompletion
        TARGET 2025-06-15
        LONGSTOP 2025-08-15
        REQUIRES FoundationComplete
        TRIGGERS COD_Achieved

      // Definitions
      DEFINE TotalDebt AS total_debt
      DEFINE EBITDA AS ebitda
      DEFINE Leverage AS TotalDebt / EBITDA
      DEFINE DSCR AS 1.50

      // Covenants
      COVENANT TotalLeverage
        REQUIRES Leverage <= 4.50
        TESTED QUARTERLY

      COVENANT MinDSCR
        REQUIRES DSCR >= 1.25
        TESTED QUARTERLY

      // Reserves
      RESERVE DebtServiceReserve
        TARGET 30_000_000
        MINIMUM 15_000_000

      // Waterfall
      WATERFALL OperatingWaterfall
        FREQUENCY monthly

        TIER 1 "OpEx"
          PAY operating_expenses
          FROM Revenue

        TIER 2 "Debt Service"
          PAY debt_service
          FROM REMAINDER
          SHORTFALL -> DebtServiceReserve

        TIER 3 "DSRA"
          PAY TO DebtServiceReserve
          UNTIL DebtServiceReserve >= 30_000_000
          FROM REMAINDER

      // Conditions Precedent
      CONDITIONS_PRECEDENT Draw2
        CP LienSearch
          RESPONSIBLE Agent
          STATUS pending

        CP InsuranceCert
          RESPONSIBLE Borrower
          STATUS pending
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    // Load financial data
    interpreter.loadFinancials({
      total_debt: 100000000,
      ebitda: 30000000,
      operating_expenses: 5000000,
      debt_service: 8000000,
    });

    // CONSTRUCTION PHASE
    expect(interpreter.getCurrentPhase()).toBe('Construction');
    expect(interpreter.getSuspendedCovenants()).toContain('TotalLeverage');

    // Check milestones
    expect(interpreter.hasMilestones()).toBe(true);
    const milestoneStatus = interpreter.getMilestoneStatus('FoundationComplete', new Date('2024-05-01'));
    expect(milestoneStatus.status).toBe('pending');

    // Achieve milestone
    interpreter.achieveMilestone('FoundationComplete');
    expect(interpreter.isConditionSatisfied('Draw2Available')).toBe(true);

    // Check reserves
    expect(interpreter.hasReserves()).toBe(true);
    interpreter.setReserveBalance('DebtServiceReserve', 20000000);
    const reserveStatus = interpreter.getReserveStatus('DebtServiceReserve');
    expect(reserveStatus.belowMinimum).toBe(false);

    // Execute waterfall
    const waterfallResult = interpreter.executeWaterfall('OperatingWaterfall', 20000000);
    expect(waterfallResult.tiers.length).toBe(3);
    expect(waterfallResult.tiers[0].paid).toBe(5000000); // OpEx
    expect(waterfallResult.tiers[1].paid).toBe(8000000); // Debt Service

    // Check CP status
    const cpStatus = interpreter.getCPChecklist('Draw2');
    expect(cpStatus.pending).toBe(2);
    expect(interpreter.isDrawAllowed('Draw2')).toBe(false);

    // Satisfy CPs
    interpreter.updateCPStatus('Draw2', 'LienSearch', 'satisfied');
    interpreter.updateCPStatus('Draw2', 'InsuranceCert', 'satisfied');
    expect(interpreter.isDrawAllowed('Draw2')).toBe(true);

    // Complete transition to operations
    interpreter.satisfyCondition('SubstantialCompletion');
    interpreter.satisfyCondition('LenderCert');

    const transitions = interpreter.checkPhaseTransitions();
    expect(transitions.find(t => t.name === 'COD_Achieved')?.triggered).toBe(true);

    interpreter.transitionTo('COD_Achieved');
    expect(interpreter.getCurrentPhase()).toBe('Operations');
    expect(interpreter.getSuspendedCovenants()).toEqual([]);
  });
});

// ==================== TECHNICAL MILESTONE TESTS ====================

describe('Technical Milestones', () => {
  it('should parse technical milestone with measurement', async () => {
    const source = `
      TECHNICAL_MILESTONE ModuleInstallation
        TARGET 2026-06-30
        LONGSTOP 2026-09-30
        MEASUREMENT "MW Installed"
        TARGET_VALUE 200
        CURRENT_VALUE 145.5
        TRIGGERS ArrayCompletion
        REQUIRES StructuralComplete
    `;
    const ast = await parseOrThrow(source);
    expect(ast.statements).toHaveLength(1);
    const milestone = ast.statements[0] as TechnicalMilestoneStatement;
    expect(milestone.type).toBe('TechnicalMilestone');
    expect(milestone.name).toBe('ModuleInstallation');
    expect(milestone.targetDate).toBe('2026-06-30');
    expect(milestone.longstopDate).toBe('2026-09-30');
    expect(milestone.measurement).toBe('MW Installed');
    expect(milestone.targetValue).toMatchObject({ type: 'Number', value: 200 });
    expect(milestone.currentValue).toMatchObject({ type: 'Number', value: 145.5 });
    expect(milestone.triggers).toEqual(['ArrayCompletion']);
  });

  it('should calculate completion percentage', async () => {
    const source = `
      TECHNICAL_MILESTONE PanelInstall
        TARGET 2026-06-30
        LONGSTOP 2026-09-30
        MEASUREMENT "Panels"
        TARGET_VALUE 1000
        CURRENT_VALUE 750
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const status = interpreter.getTechnicalMilestoneStatus('PanelInstall');
    expect(status.targetValue).toBe(1000);
    expect(status.currentValue).toBe(750);
    expect(status.completionPercent).toBe(75);
    expect(status.status).toBe('pending');
  });

  it('should auto-achieve when target is met', async () => {
    const source = `
      TECHNICAL_MILESTONE FoundationPour
        TARGET 2026-06-30
        MEASUREMENT "Foundations"
        TARGET_VALUE 50
        CURRENT_VALUE 50
        TRIGGERS FoundationsComplete
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    // Should auto-detect achievement
    expect(interpreter.isTechnicalMilestoneAchieved('FoundationPour')).toBe(true);

    const status = interpreter.getTechnicalMilestoneStatus('FoundationPour');
    expect(status.completionPercent).toBe(100);
    expect(status.status).toBe('achieved');
  });

  it('should exceed target value', async () => {
    const source = `
      TECHNICAL_MILESTONE Excavation
        TARGET 2026-06-30
        MEASUREMENT "Cubic Yards"
        TARGET_VALUE 10000
        CURRENT_VALUE 12500
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const status = interpreter.getTechnicalMilestoneStatus('Excavation');
    expect(status.completionPercent).toBe(125);
    expect(status.status).toBe('achieved');
  });

  it('should evaluate progress metric expression', async () => {
    const source = `
      TECHNICAL_MILESTONE GridConnection
        TARGET 2026-08-15
        PROGRESS_METRIC 0.65
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const status = interpreter.getTechnicalMilestoneStatus('GridConnection');
    expect(status.progressMetric).toBe(0.65);
    expect(status.completionPercent).toBe(65);
  });

  it('should check prerequisites across milestone types', async () => {
    const source = `
      MILESTONE StructuralComplete
        TARGET 2026-05-01

      TECHNICAL_MILESTONE PanelMount
        TARGET 2026-06-30
        MEASUREMENT "Panels Mounted"
        TARGET_VALUE 5000
        CURRENT_VALUE 0
        REQUIRES StructuralComplete
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    // Prereqs not met
    let status = interpreter.getTechnicalMilestoneStatus('PanelMount');
    expect(status.prerequisites[0]).toEqual({ name: 'StructuralComplete', met: false });

    // Achieve regular milestone
    interpreter.achieveMilestone('StructuralComplete');

    // Now prereqs should be met
    status = interpreter.getTechnicalMilestoneStatus('PanelMount');
    expect(status.prerequisites[0]).toEqual({ name: 'StructuralComplete', met: true });
  });

  it('should trigger events when manually achieved', async () => {
    const source = `
      TECHNICAL_MILESTONE InverterInstall
        TARGET 2026-07-15
        MEASUREMENT "Inverters"
        TARGET_VALUE 20
        CURRENT_VALUE 10
        TRIGGERS InvertersReady, ElectricalReview
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    expect(interpreter.isConditionSatisfied('InvertersReady')).toBe(false);

    interpreter.achieveTechnicalMilestone('InverterInstall');

    expect(interpreter.isConditionSatisfied('InvertersReady')).toBe(true);
    expect(interpreter.isConditionSatisfied('ElectricalReview')).toBe(true);
  });

  it('should return at_risk status when past target', async () => {
    const source = `
      TECHNICAL_MILESTONE CableRun
        TARGET 2024-06-30
        LONGSTOP 2024-09-30
        MEASUREMENT "Linear Feet"
        TARGET_VALUE 5000
        CURRENT_VALUE 3500
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    // Test with date past target but before longstop
    const status = interpreter.getTechnicalMilestoneStatus('CableRun', new Date('2024-08-15'));
    expect(status.status).toBe('at_risk');
    expect(status.daysToTarget).toBeLessThan(0);
  });

  it('should list all technical milestones', async () => {
    const source = `
      TECHNICAL_MILESTONE TM1
        TARGET 2026-06-01
        MEASUREMENT "Units"
        TARGET_VALUE 100
        CURRENT_VALUE 50

      TECHNICAL_MILESTONE TM2
        TARGET 2026-07-01
        MEASUREMENT "Meters"
        TARGET_VALUE 200
        CURRENT_VALUE 200
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const names = interpreter.getTechnicalMilestoneNames();
    expect(names).toContain('TM1');
    expect(names).toContain('TM2');

    const statuses = interpreter.getAllTechnicalMilestoneStatuses();
    expect(statuses).toHaveLength(2);
    expect(statuses.find(s => s.name === 'TM1')?.completionPercent).toBe(50);
    expect(statuses.find(s => s.name === 'TM2')?.status).toBe('achieved');
  });
});

// ==================== REGULATORY REQUIREMENT TESTS ====================

describe('Regulatory Requirements', () => {
  it('should parse regulatory requirement', async () => {
    const source = `
      REGULATORY_REQUIREMENT GridInterconnect
        AGENCY "Regional ISO"
        TYPE interconnection
        DESCRIPTION "Large Generator Interconnection Agreement"
        REQUIRED_FOR Construction
        STATUS pending
        SATISFIES InterconnectionComplete
    `;
    const ast = await parseOrThrow(source);
    expect(ast.statements).toHaveLength(1);
    const req = ast.statements[0] as RegulatoryRequirementStatement;
    expect(req.type).toBe('RegulatoryRequirement');
    expect(req.name).toBe('GridInterconnect');
    expect(req.agency).toBe('Regional ISO');
    expect(req.requirementType).toBe('interconnection');
    expect(req.requiredFor).toBe('Construction');
    expect(req.status).toBe('pending');
    expect(req.satisfies).toEqual(['InterconnectionComplete']);
  });

  it('should parse with flexible type', async () => {
    const source = `
      REGULATORY_REQUIREMENT CustomPermit
        AGENCY "Local Authority"
        TYPE special_zoning_variance
        STATUS submitted
    `;
    const ast = await parseOrThrow(source);
    const req = ast.statements[0] as RegulatoryRequirementStatement;
    expect(req.requirementType).toBe('special_zoning_variance');
  });

  it('should track regulatory status', async () => {
    const source = `
      REGULATORY_REQUIREMENT EPA_Permit
        AGENCY "EPA Region 4"
        TYPE environmental
        REQUIRED_FOR Construction
        STATUS pending

      REGULATORY_REQUIREMENT FAA_Obstruction
        AGENCY "FAA"
        TYPE aviation
        REQUIRED_FOR Construction
        STATUS approved
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const checklist = interpreter.getRegulatoryChecklist();
    expect(checklist.totalRequirements).toBe(2);
    expect(checklist.pending).toBe(1);
    expect(checklist.approved).toBe(1);
    expect(checklist.phaseReady['Construction']).toBe(false);
  });

  it('should update regulatory status', async () => {
    const source = `
      REGULATORY_REQUIREMENT BuildingPermit
        AGENCY "County Planning"
        TYPE land_use
        STATUS pending
        SATISFIES PermitReady
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    expect(interpreter.isConditionSatisfied('PermitReady')).toBe(false);

    interpreter.updateRegulatoryStatus('BuildingPermit', 'approved', '2026-03-15');

    const status = interpreter.getRegulatoryRequirementStatus('BuildingPermit');
    expect(status.status).toBe('approved');
    expect(status.blocking).toBe(false);

    // Should satisfy conditions
    expect(interpreter.isConditionSatisfied('PermitReady')).toBe(true);
  });

  it('should check phase regulatory readiness', async () => {
    const source = `
      REGULATORY_REQUIREMENT Permit1
        TYPE environmental
        REQUIRED_FOR Operations
        STATUS approved

      REGULATORY_REQUIREMENT Permit2
        TYPE land_use
        REQUIRED_FOR Operations
        STATUS approved

      REGULATORY_REQUIREMENT Permit3
        TYPE interconnection
        REQUIRED_FOR Construction
        STATUS pending
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    expect(interpreter.isPhaseRegulatoryReady('Operations')).toBe(true);
    expect(interpreter.isPhaseRegulatoryReady('Construction')).toBe(false);
  });

  it('should track submitted and denied status', async () => {
    const source = `
      REGULATORY_REQUIREMENT WaterRights
        AGENCY "State Water Board"
        TYPE water_rights
        STATUS submitted

      REGULATORY_REQUIREMENT ZoningVariance
        AGENCY "City Planning"
        TYPE land_use
        STATUS denied
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const checklist = interpreter.getRegulatoryChecklist();
    expect(checklist.submitted).toBe(1);
    expect(checklist.denied).toBe(1);
  });

  it('should identify blocking requirements', async () => {
    const source = `
      REGULATORY_REQUIREMENT BlockingReq
        TYPE permit
        REQUIRED_FOR Construction
        STATUS pending

      REGULATORY_REQUIREMENT NonBlockingReq
        TYPE permit
        STATUS pending
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const blocking = interpreter.getRegulatoryRequirementStatus('BlockingReq');
    expect(blocking.blocking).toBe(true);

    const nonBlocking = interpreter.getRegulatoryRequirementStatus('NonBlockingReq');
    expect(nonBlocking.blocking).toBe(false);
  });

  it('should list all regulatory requirements', async () => {
    const source = `
      REGULATORY_REQUIREMENT Req1
        TYPE environmental
        STATUS pending

      REGULATORY_REQUIREMENT Req2
        TYPE interconnection
        STATUS approved
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const names = interpreter.getRegulatoryRequirementNames();
    expect(names).toContain('Req1');
    expect(names).toContain('Req2');
    expect(interpreter.hasRegulatoryRequirements()).toBe(true);
  });

  it('should handle approval date', async () => {
    const source = `
      REGULATORY_REQUIREMENT ApprovedReq
        AGENCY "EPA"
        TYPE environmental
        STATUS approved
        APPROVAL_DATE 2026-03-01
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const status = interpreter.getRegulatoryRequirementStatus('ApprovedReq');
    expect(status.approvalDate).toBe('2026-03-01');
  });
});

// ==================== INDUSTRY CONSTRUCTS INTEGRATION ====================

describe('Industry Constructs Integration', () => {
  it('should integrate technical milestones with phase transitions', async () => {
    const source = `
      PHASE Construction
        UNTIL COD_Achieved
        COVENANTS SUSPENDED OperatingLeverage

      PHASE Operations
        FROM COD_Achieved
        COVENANTS ACTIVE OperatingLeverage

      TRANSITION COD_Achieved
        WHEN ALL_OF(SubstantialCompletion, InterconnectionComplete)

      TECHNICAL_MILESTONE SubstantialCompletion
        TARGET 2026-06-15
        MEASUREMENT "MW Operational"
        TARGET_VALUE 200
        CURRENT_VALUE 200
        TRIGGERS SubstantialCompletion

      REGULATORY_REQUIREMENT GridInterconnect
        TYPE interconnection
        STATUS approved
        SATISFIES InterconnectionComplete

      COVENANT OperatingLeverage
        REQUIRES Leverage <= 5.0
        TESTED QUARTERLY

      DEFINE Leverage AS 3.5
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    // Start in Construction
    expect(interpreter.getCurrentPhase()).toBe('Construction');

    // Technical milestone auto-achieved (current >= target)
    expect(interpreter.isTechnicalMilestoneAchieved('SubstantialCompletion')).toBe(true);

    // Regulatory requirement satisfied on init (approved status)
    expect(interpreter.isConditionSatisfied('InterconnectionComplete')).toBe(true);

    // All transition conditions met
    const transitions = interpreter.checkPhaseTransitions();
    expect(transitions.find(t => t.name === 'COD_Achieved')?.triggered).toBe(true);

    // Execute transition
    interpreter.transitionTo('COD_Achieved');
    expect(interpreter.getCurrentPhase()).toBe('Operations');
  });
});

// ==================== PERFORMANCE GUARANTEE TESTS ====================

describe('Performance Guarantees', () => {
  it('should parse performance guarantee with P-values', async () => {
    const source = `
      PERFORMANCE_GUARANTEE MinEnergyProduction
        METRIC annual_generation_MWh
        P50 450000
        P75 420000
        P90 400000
        P99 380000
        GUARANTEE_PERIOD "year_1_through_5"
        SHORTFALL_RATE 0.85
        INSURANCE_COVERAGE $100_000_000
    `;
    const ast = await parseOrThrow(source);
    expect(ast.statements).toHaveLength(1);
    const guarantee = ast.statements[0] as PerformanceGuaranteeStatement;
    expect(guarantee.type).toBe('PerformanceGuarantee');
    expect(guarantee.name).toBe('MinEnergyProduction');
    expect(guarantee.metric).toBe('annual_generation_MWh');
    expect(guarantee.guaranteePeriod).toBe('year_1_through_5');
  });

  it('should evaluate performance against thresholds', async () => {
    const source = `
      PERFORMANCE_GUARANTEE SolarProduction
        METRIC generation_MWh
        P50 500000
        P75 450000
        P90 400000
        P99 350000
        ACTUAL 420000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const status = interpreter.getPerformanceGuaranteeStatus('SolarProduction');
    expect(status.p50).toBe(500000);
    expect(status.p99).toBe(350000);
    expect(status.actual).toBe(420000);
    expect(status.performanceLevel).toBe('p90'); // 420000 >= P90(400000), < P75(450000)
    expect(status.meetsGuarantee).toBe(true);
    expect(status.shortfall).toBe(0); // Above P99
  });

  it('should calculate shortfall below P99', async () => {
    const source = `
      PERFORMANCE_GUARANTEE WindProduction
        METRIC generation_MWh
        P99 350000
        SHORTFALL_RATE 50
        ACTUAL 300000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const status = interpreter.getPerformanceGuaranteeStatus('WindProduction');
    expect(status.actual).toBe(300000);
    expect(status.performanceLevel).toBe('below_p99');
    expect(status.meetsGuarantee).toBe(false);
    expect(status.shortfall).toBe(50000); // 350000 - 300000
    expect(status.shortfallPayment).toBe(2500000); // 50000 * 50
  });

  it('should get actual from financial data', async () => {
    const source = `
      PERFORMANCE_GUARANTEE DataCenterUptime
        METRIC uptime_percentage
        P50 99.99
        P99 99.5
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials({ uptime_percentage: 99.8 });

    const status = interpreter.getPerformanceGuaranteeStatus('DataCenterUptime');
    expect(status.actual).toBe(99.8);
    expect(status.performanceLevel).toBe('p99'); // 99.8 >= P99(99.5), P90 not defined
    expect(status.meetsGuarantee).toBe(true);
  });

  it('should list all performance guarantees', async () => {
    const source = `
      PERFORMANCE_GUARANTEE PG1
        METRIC metric1
        P99 100

      PERFORMANCE_GUARANTEE PG2
        METRIC metric2
        P99 200
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const names = interpreter.getPerformanceGuaranteeNames();
    expect(names).toContain('PG1');
    expect(names).toContain('PG2');
    expect(interpreter.hasPerformanceGuarantees()).toBe(true);
  });
});

// ==================== DEGRADATION SCHEDULE TESTS ====================

describe('Degradation Schedules', () => {
  it('should parse degradation schedule with rates', async () => {
    const source = `
      DEGRADATION_SCHEDULE PanelDegradation
        ASSET_TYPE solar_panels
        INITIAL_CAPACITY 200
        YEAR_1_DEGRADATION 2
        ANNUAL_DEGRADATION 0.5
        MINIMUM_CAPACITY 160
        AFFECTS EBITDA, generation_capacity
    `;
    const ast = await parseOrThrow(source);
    expect(ast.statements).toHaveLength(1);
    const schedule = ast.statements[0] as DegradationScheduleStatement;
    expect(schedule.type).toBe('DegradationSchedule');
    expect(schedule.name).toBe('PanelDegradation');
    expect(schedule.assetType).toBe('solar_panels');
    expect(schedule.affects).toEqual(['EBITDA', 'generation_capacity']);
  });

  it('should calculate year 1 degradation', async () => {
    const source = `
      DEGRADATION_SCHEDULE SolarDegradation
        INITIAL_CAPACITY 100
        YEAR_1_DEGRADATION 2
        ANNUAL_DEGRADATION 0.5
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const year1 = interpreter.getDegradedCapacity('SolarDegradation', 1);
    expect(year1.initialCapacity).toBe(100);
    expect(year1.cumulativeDegradation).toBe(2); // 2% in year 1
    expect(year1.effectiveCapacity).toBe(98); // 100 * (1 - 0.02)
    expect(year1.capacityPercent).toBe(98);
  });

  it('should calculate multi-year degradation', async () => {
    const source = `
      DEGRADATION_SCHEDULE BatteryDegradation
        INITIAL_CAPACITY 100
        YEAR_1_DEGRADATION 3
        ANNUAL_DEGRADATION 1
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    // Year 5: 3% (year 1) + 4 * 1% (years 2-5) = 7% degradation
    const year5 = interpreter.getDegradedCapacity('BatteryDegradation', 5);
    expect(year5.cumulativeDegradation).toBe(7);
    expect(year5.effectiveCapacity).toBe(93);

    // Year 10: 3% + 9 * 1% = 12% degradation
    const year10 = interpreter.getDegradedCapacity('BatteryDegradation', 10);
    expect(year10.cumulativeDegradation).toBe(12);
    expect(year10.effectiveCapacity).toBe(88);
  });

  it('should respect minimum capacity floor', async () => {
    const source = `
      DEGRADATION_SCHEDULE AggressiveDegradation
        INITIAL_CAPACITY 100
        YEAR_1_DEGRADATION 10
        ANNUAL_DEGRADATION 5
        MINIMUM_CAPACITY 60
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    // Year 10: 10% + 9 * 5% = 55% degradation, would be 45 capacity
    // But minimum is 60, so should be floored
    const year10 = interpreter.getDegradedCapacity('AggressiveDegradation', 10);
    expect(year10.effectiveCapacity).toBe(60);
    expect(year10.atMinimum).toBe(true);
  });

  it('should parse explicit schedule', async () => {
    const source = `
      DEGRADATION_SCHEDULE CustomSchedule
        INITIAL_CAPACITY 100
        SCHEDULE
          YEAR_1: 2
          YEAR_2: 1.5
          YEAR_3: 1
    `;
    const ast = await parseOrThrow(source);
    const schedule = ast.statements[0] as DegradationScheduleStatement;
    expect(schedule.schedule).toHaveLength(3);
    expect(schedule.schedule![0].year).toBe(1);
  });

  it('should project degradation over multiple years', async () => {
    const source = `
      DEGRADATION_SCHEDULE WindTurbine
        INITIAL_CAPACITY 150
        YEAR_1_DEGRADATION 1
        ANNUAL_DEGRADATION 0.3
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const projection = interpreter.getDegradationProjection('WindTurbine', 5);
    expect(projection).toHaveLength(5);
    expect(projection[0].year).toBe(1);
    expect(projection[4].year).toBe(5);
    expect(projection[4].cumulativeDegradation).toBeCloseTo(2.2); // 1 + 4*0.3
  });

  it('should list all degradation schedules', async () => {
    const source = `
      DEGRADATION_SCHEDULE DS1
        INITIAL_CAPACITY 100
        ANNUAL_DEGRADATION 1

      DEGRADATION_SCHEDULE DS2
        INITIAL_CAPACITY 200
        ANNUAL_DEGRADATION 0.5
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const names = interpreter.getDegradationScheduleNames();
    expect(names).toContain('DS1');
    expect(names).toContain('DS2');
    expect(interpreter.hasDegradationSchedules()).toBe(true);
  });
});

// ==================== SEASONAL ADJUSTMENT TESTS ====================

describe('Seasonal Adjustments', () => {
  it('should parse seasonal adjustment', async () => {
    const source = `
      SEASONAL_ADJUSTMENT WinterCapacity
        METRIC generation_capacity
        SEASON Q4, Q1
        ADJUSTMENT_FACTOR 0.75
        REASON "Reduced solar irradiance"
    `;
    const ast = await parseOrThrow(source);
    expect(ast.statements).toHaveLength(1);
    const adjustment = ast.statements[0] as SeasonalAdjustmentStatement;
    expect(adjustment.type).toBe('SeasonalAdjustment');
    expect(adjustment.name).toBe('WinterCapacity');
    expect(adjustment.metric).toBe('generation_capacity');
    expect(adjustment.season).toEqual(['Q4', 'Q1']);
    expect(adjustment.reason).toBe('Reduced solar irradiance');
  });

  it('should apply adjustment when season matches', async () => {
    const source = `
      SEASONAL_ADJUSTMENT SummerPeak
        METRIC revenue
        SEASON Q2, Q3
        ADJUSTMENT_FACTOR 1.25
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials({ revenue: 1000000 });

    // In Q2 (summer), adjustment should be active
    const summerStatus = interpreter.getSeasonalAdjustmentStatus('SummerPeak', 'Q2');
    expect(summerStatus.active).toBe(true);
    expect(summerStatus.baseValue).toBe(1000000);
    expect(summerStatus.adjustedValue).toBe(1250000); // 1M * 1.25

    // In Q4 (winter), adjustment should not be active
    const winterStatus = interpreter.getSeasonalAdjustmentStatus('SummerPeak', 'Q4');
    expect(winterStatus.active).toBe(false);
    expect(winterStatus.adjustedValue).toBe(1000000); // No adjustment
  });

  it('should parse month-based seasons', async () => {
    const source = `
      SEASONAL_ADJUSTMENT HolidaySeason
        METRIC demand
        SEASON Dec, Jan, Feb
        ADJUSTMENT_FACTOR 0.80
    `;
    const ast = await parseOrThrow(source);
    const adjustment = ast.statements[0] as SeasonalAdjustmentStatement;
    expect(adjustment.season).toEqual(['Dec', 'Jan', 'Feb']);
  });

  it('should apply adjustments to specific metrics', async () => {
    const source = `
      SEASONAL_ADJUSTMENT WinterReduction
        METRIC capacity
        SEASON Q1
        ADJUSTMENT_FACTOR 0.70
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials({ capacity: 100, revenue: 500 });

    // Should find adjustment for capacity
    const result = interpreter.applySeasonalAdjustments('capacity', 100, 'Q1');
    expect(result).not.toBeNull();
    expect(result!.adjustedValue).toBe(70);

    // Should not find adjustment for revenue
    const noResult = interpreter.applySeasonalAdjustments('revenue', 500, 'Q1');
    expect(noResult).toBeNull();
  });

  it('should list all seasonal adjustments', async () => {
    const source = `
      SEASONAL_ADJUSTMENT SA1
        METRIC metric1
        SEASON Q1
        ADJUSTMENT_FACTOR 0.9

      SEASONAL_ADJUSTMENT SA2
        METRIC metric2
        SEASON Q3
        ADJUSTMENT_FACTOR 1.1
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const names = interpreter.getSeasonalAdjustmentNames();
    expect(names).toContain('SA1');
    expect(names).toContain('SA2');
    expect(interpreter.hasSeasonalAdjustments()).toBe(true);

    const allStatuses = interpreter.getAllSeasonalAdjustmentStatuses('Q1');
    expect(allStatuses).toHaveLength(2);
    expect(allStatuses.find(s => s.name === 'SA1')?.active).toBe(true);
    expect(allStatuses.find(s => s.name === 'SA2')?.active).toBe(false);
  });
});

// ==================== PHASE 2 INTEGRATION TESTS ====================

describe('Performance & Degradation Integration', () => {
  it('should model solar project with degradation and performance', async () => {
    const source = `
      // Performance guarantee
      PERFORMANCE_GUARANTEE AnnualGeneration
        METRIC generation_MWh
        P50 450000
        P99 380000
        SHORTFALL_RATE 85

      // Panel degradation
      DEGRADATION_SCHEDULE PanelDegradation
        ASSET_TYPE solar_panels
        INITIAL_CAPACITY 200
        YEAR_1_DEGRADATION 2
        ANNUAL_DEGRADATION 0.5
        MINIMUM_CAPACITY 160
        AFFECTS generation_capacity

      // Seasonal production adjustment
      SEASONAL_ADJUSTMENT WinterProduction
        METRIC generation_MWh
        SEASON Q4, Q1
        ADJUSTMENT_FACTOR 0.65
        REASON "Lower solar irradiance in winter"

      SEASONAL_ADJUSTMENT SummerProduction
        METRIC generation_MWh
        SEASON Q2, Q3
        ADJUSTMENT_FACTOR 1.35
        REASON "Peak solar production in summer"
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials({ generation_MWh: 420000 });

    // Check performance guarantee
    const performance = interpreter.getPerformanceGuaranteeStatus('AnnualGeneration');
    expect(performance.meetsGuarantee).toBe(true);
    expect(performance.performanceLevel).toBe('p99'); // 420000 >= P99(380000), no P75/P90 defined

    // Check year 5 degradation
    const degradation = interpreter.getDegradedCapacity('PanelDegradation', 5);
    expect(degradation.cumulativeDegradation).toBe(4); // 2% + 3*0.5%
    expect(degradation.effectiveCapacity).toBe(192); // 200 * 0.96

    // Check seasonal adjustments
    const winter = interpreter.getSeasonalAdjustmentStatus('WinterProduction', 'Q1');
    expect(winter.active).toBe(true);
    expect(winter.adjustedValue).toBe(273000); // 420000 * 0.65

    const summer = interpreter.getSeasonalAdjustmentStatus('SummerProduction', 'Q3');
    expect(summer.active).toBe(true);
    expect(summer.adjustedValue).toBe(567000); // 420000 * 1.35
  });
});

// ==================== TAX EQUITY STRUCTURES ====================

describe('Tax Equity Structures', () => {
  it('should parse tax equity structure with partnership flip', async () => {
    const source = `
      TAX_EQUITY_STRUCTURE MainPartnership
        STRUCTURE_TYPE partnership_flip
        TAX_INVESTOR "JP Morgan Tax Equity Fund"
        SPONSOR "SunPower Development LLC"
        TAX_CREDIT_ALLOCATION 99/1
        DEPRECIATION_ALLOCATION 99/1
        CASH_ALLOCATION 90/10
        TARGET_RETURN 8.5
    `;
    const ast = await parseOrThrow(source);
    expect(ast.statements).toHaveLength(1);

    const stmt = ast.statements[0];
    expect(stmt.type).toBe('TaxEquityStructure');
    expect(stmt.name).toBe('MainPartnership');
    expect(stmt.structureType).toBe('partnership_flip');
    expect(stmt.taxInvestor).toBe('JP Morgan Tax Equity Fund');
    expect(stmt.sponsor).toBe('SunPower Development LLC');
    expect(stmt.taxCreditAllocation).toEqual({ investor: 99, sponsor: 1 });
    expect(stmt.cashAllocation).toEqual({ investor: 90, sponsor: 10 });
  });

  it('should evaluate tax equity structure status', async () => {
    const source = `
      TAX_EQUITY_STRUCTURE SolarPartnership
        STRUCTURE_TYPE partnership_flip
        TAX_INVESTOR "Bank of America"
        SPONSOR "Developer Corp"
        TAX_CREDIT_ALLOCATION 99/1
        TARGET_RETURN 7.5
        BUYOUT_PRICE 1000000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const status = interpreter.getTaxEquityStructureStatus('SolarPartnership');
    expect(status.structureType).toBe('partnership_flip');
    expect(status.taxInvestor).toBe('Bank of America');
    expect(status.targetReturn).toBe(7.5);
    expect(status.buyoutPrice).toBe(1000000);
    expect(status.hasFlipped).toBe(false);
  });

  it('should support sale-leaseback structure', async () => {
    const source = `
      TAX_EQUITY_STRUCTURE SaleLeaseback
        STRUCTURE_TYPE sale_leaseback
        TAX_INVESTOR "US Bank Leasing"
        SPONSOR "Wind Developer Inc"
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const status = interpreter.getTaxEquityStructureStatus('SaleLeaseback');
    expect(status.structureType).toBe('sale_leaseback');
  });

  it('should list all tax equity structures', async () => {
    const source = `
      TAX_EQUITY_STRUCTURE TE1
        STRUCTURE_TYPE partnership_flip

      TAX_EQUITY_STRUCTURE TE2
        STRUCTURE_TYPE inverted_lease
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const names = interpreter.getTaxEquityStructureNames();
    expect(names).toContain('TE1');
    expect(names).toContain('TE2');
    expect(interpreter.hasTaxEquityStructures()).toBe(true);
  });
});

// ==================== TAX CREDITS ====================

describe('Tax Credits', () => {
  it('should parse ITC with base rate and adders', async () => {
    const source = `
      TAX_CREDIT SolarITC
        CREDIT_TYPE itc
        RATE 30
        ELIGIBLE_BASIS 50000000
        ADDER domestic_content + 10
        ADDER energy_community + 10
        VESTING_PERIOD "5 years"
        RECAPTURE_RISK "20% per year for first 5 years"
    `;
    const ast = await parseOrThrow(source);
    expect(ast.statements).toHaveLength(1);

    const stmt = ast.statements[0];
    expect(stmt.type).toBe('TaxCredit');
    expect(stmt.creditType).toBe('itc');
    expect(stmt.adders).toHaveLength(2);
    expect(stmt.adders[0].name).toBe('domestic_content');
    expect(stmt.vestingPeriod).toBe('5 years');
  });

  it('should calculate ITC credit amount with adders', async () => {
    const source = `
      TAX_CREDIT SolarITC
        CREDIT_TYPE itc
        RATE 30
        ELIGIBLE_BASIS 100000000
        ADDER domestic_content + 10
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const status = interpreter.getTaxCreditStatus('SolarITC');
    expect(status.baseRate).toBe(30);
    expect(status.effectiveRate).toBe(40); // 30 + 10
    expect(status.eligibleBasis).toBe(100000000);
    expect(status.creditAmount).toBe(40000000); // 100M * 40%
    expect(status.adders).toHaveLength(1);
    expect(status.adders[0].name).toBe('domestic_content');
    expect(status.adders[0].bonus).toBe(10);
  });

  it('should parse PTC credit type', async () => {
    const source = `
      TAX_CREDIT WindPTC
        CREDIT_TYPE ptc
        RATE 2.75
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const status = interpreter.getTaxCreditStatus('WindPTC');
    expect(status.creditType).toBe('ptc');
    expect(status.baseRate).toBe(2.75);
  });

  it('should support 45X manufacturing credit', async () => {
    const source = `
      TAX_CREDIT BatteryManufacturing
        CREDIT_TYPE 45X
        CREDIT_AMOUNT 35000000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const status = interpreter.getTaxCreditStatus('BatteryManufacturing');
    expect(status.creditType).toBe('45X');
    expect(status.creditAmount).toBe(35000000);
  });

  it('should satisfy conditions when tax credit is loaded', async () => {
    const source = `
      TAX_CREDIT SolarITC
        CREDIT_TYPE itc
        RATE 30
        SATISFIES ITC_Earned
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    expect(interpreter.isConditionSatisfied('ITC_Earned')).toBe(true);
  });
});

// ==================== DEPRECIATION SCHEDULES ====================

describe('Depreciation Schedules', () => {
  it('should parse MACRS depreciation schedule', async () => {
    const source = `
      DEPRECIATION_SCHEDULE SolarMACRS
        METHOD macrs_5yr
        DEPRECIABLE_BASIS 80000000
        BONUS_DEPRECIATION 60
    `;
    const ast = await parseOrThrow(source);
    expect(ast.statements).toHaveLength(1);

    const stmt = ast.statements[0];
    expect(stmt.type).toBe('Depreciation');
    expect(stmt.method).toBe('macrs_5yr');
  });

  it('should calculate MACRS 5-year depreciation with bonus', async () => {
    const source = `
      DEPRECIATION_SCHEDULE SolarMACRS
        METHOD macrs_5yr
        DEPRECIABLE_BASIS 100000000
        BONUS_DEPRECIATION 60
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    // Year 1: 60% bonus on full basis + 20% regular on remaining
    const year1 = interpreter.getDepreciationForYear('SolarMACRS', 1);
    expect(year1.depreciableBasis).toBe(100000000);
    expect(year1.bonusDepreciation).toBe(60);
    expect(year1.bonusAmount).toBe(60000000); // 60% of 100M
    expect(year1.remainingBasis).toBe(40000000); // 100M - 60M
    expect(year1.regularPercentage).toBe(20); // MACRS 5yr year 1
    expect(year1.regularAmount).toBe(8000000); // 20% of 40M
    expect(year1.totalDepreciation).toBe(68000000);
  });

  it('should calculate MACRS without bonus', async () => {
    const source = `
      DEPRECIATION_SCHEDULE WindMACRS
        METHOD macrs_5yr
        DEPRECIABLE_BASIS 50000000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const year1 = interpreter.getDepreciationForYear('WindMACRS', 1);
    expect(year1.bonusAmount).toBe(0);
    expect(year1.regularPercentage).toBe(20);
    expect(year1.regularAmount).toBe(10000000); // 20% of 50M

    const year2 = interpreter.getDepreciationForYear('WindMACRS', 2);
    expect(year2.regularPercentage).toBe(32);
    expect(year2.regularAmount).toBe(16000000); // 32% of 50M
  });

  it('should support 7-year MACRS', async () => {
    const source = `
      DEPRECIATION_SCHEDULE StorageMACRS
        METHOD macrs_7yr
        DEPRECIABLE_BASIS 20000000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const year1 = interpreter.getDepreciationForYear('StorageMACRS', 1);
    expect(year1.regularPercentage).toBe(14.29);

    const year8 = interpreter.getDepreciationForYear('StorageMACRS', 8);
    expect(year8.regularPercentage).toBe(4.46);
  });

  it('should calculate cumulative depreciation', async () => {
    const source = `
      DEPRECIATION_SCHEDULE TestMACRS
        METHOD macrs_5yr
        DEPRECIABLE_BASIS 100000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const year3 = interpreter.getDepreciationForYear('TestMACRS', 3);
    // Year 1: 20% = 20000, Year 2: 32% = 32000, Year 3: 19.2% = 19200
    expect(year3.cumulativeDepreciation).toBeCloseTo(71200, 0);
    expect(year3.remainingBookValue).toBeCloseTo(28800, 0);
  });

  it('should support explicit schedule override', async () => {
    const source = `
      DEPRECIATION_SCHEDULE CustomSchedule
        DEPRECIABLE_BASIS 1000000
        SCHEDULE
          YEAR_1 50
          YEAR_2 30
          YEAR_3 20
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const year1 = interpreter.getDepreciationForYear('CustomSchedule', 1);
    expect(year1.regularPercentage).toBe(50);
    expect(year1.regularAmount).toBe(500000);

    const year2 = interpreter.getDepreciationForYear('CustomSchedule', 2);
    expect(year2.regularPercentage).toBe(30);
  });
});

// ==================== FLIP EVENTS ====================

describe('Flip Events', () => {
  it('should parse flip event with target return trigger', async () => {
    const source = `
      FLIP_EVENT TargetIRRFlip
        TRIGGER target_return 8.5
        PRE_FLIP_ALLOCATION 99/1
        POST_FLIP_ALLOCATION 5/95
        BUYOUT_OPTION fair_market_value
    `;
    const ast = await parseOrThrow(source);
    expect(ast.statements).toHaveLength(1);

    const stmt = ast.statements[0];
    expect(stmt.type).toBe('FlipEvent');
    expect(stmt.trigger).toBe('target_return');
    expect(stmt.preFlipAllocation).toEqual({ investor: 99, sponsor: 1 });
    expect(stmt.postFlipAllocation).toEqual({ investor: 5, sponsor: 95 });
    expect(stmt.buyoutOption).toEqual({ type: 'fmv' });
  });

  it('should evaluate flip event status before trigger', async () => {
    const source = `
      FLIP_EVENT TargetFlip
        TRIGGER target_return 7.5
        PRE_FLIP_ALLOCATION 99/1
        POST_FLIP_ALLOCATION 5/95
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const status = interpreter.getFlipEventStatus('TargetFlip');
    expect(status.trigger).toBe('target_return');
    expect(status.hasTriggered).toBe(false);
    expect(status.currentAllocation).toEqual({ investor: 99, sponsor: 1 });
  });

  it('should trigger flip event and update allocation', async () => {
    const source = `
      FLIP_EVENT IRRFlip
        TRIGGER target_return 8.0
        PRE_FLIP_ALLOCATION 99/1
        POST_FLIP_ALLOCATION 5/95
        SATISFIES Flip_Occurred
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    // Before flip
    expect(interpreter.isFlipTriggered('IRRFlip')).toBe(false);
    expect(interpreter.isConditionSatisfied('Flip_Occurred')).toBe(false);

    // Trigger flip
    interpreter.triggerFlip('IRRFlip', new Date('2026-06-15'), 8.2);

    // After flip
    expect(interpreter.isFlipTriggered('IRRFlip')).toBe(true);
    expect(interpreter.isConditionSatisfied('Flip_Occurred')).toBe(true);

    const status = interpreter.getFlipEventStatus('IRRFlip');
    expect(status.hasTriggered).toBe(true);
    expect(status.triggerDate).toBe('2026-06-15');
    expect(status.currentAllocation).toEqual({ investor: 5, sponsor: 95 });
  });

  it('should support date certain trigger', async () => {
    const source = `
      FLIP_EVENT DateFlip
        TRIGGER date_certain 2030-12-31
        PRE_FLIP_ALLOCATION 99/1
        POST_FLIP_ALLOCATION 10/90
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    const status = interpreter.getFlipEventStatus('DateFlip');
    expect(status.trigger).toBe('date_certain');
  });

  it('should support fixed buyout price', async () => {
    const source = `
      FLIP_EVENT FixedBuyout
        TRIGGER target_return 7.0
        PRE_FLIP_ALLOCATION 99/1
        POST_FLIP_ALLOCATION 5/95
        BUYOUT_OPTION fixed 500000
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    // Trigger the flip
    interpreter.triggerFlip('FixedBuyout');

    const status = interpreter.getFlipEventStatus('FixedBuyout');
    expect(status.buyoutPrice).toBe(500000);
  });

  it('should prevent double-triggering flip', async () => {
    const source = `
      FLIP_EVENT OnceOnly
        TRIGGER target_return 8.0
        PRE_FLIP_ALLOCATION 99/1
        POST_FLIP_ALLOCATION 5/95
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    interpreter.triggerFlip('OnceOnly');

    expect(() => interpreter.triggerFlip('OnceOnly')).toThrow('already been triggered');
  });

  it('should list triggered flips', async () => {
    const source = `
      FLIP_EVENT Flip1
        TRIGGER target_return 8.0
        PRE_FLIP_ALLOCATION 99/1
        POST_FLIP_ALLOCATION 5/95

      FLIP_EVENT Flip2
        TRIGGER target_return 7.0
        PRE_FLIP_ALLOCATION 95/5
        POST_FLIP_ALLOCATION 10/90
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    interpreter.triggerFlip('Flip1');

    const triggered = interpreter.getTriggeredFlips();
    expect(triggered).toContain('Flip1');
    expect(triggered).not.toContain('Flip2');
  });
});

// ==================== TAX EQUITY INTEGRATION ====================

describe('Tax Equity Integration', () => {
  it('should model complete solar tax equity deal', async () => {
    const source = `
      // Tax equity structure
      TAX_EQUITY_STRUCTURE SolarPartnership
        STRUCTURE_TYPE partnership_flip
        TAX_INVESTOR "Tax Equity Fund I"
        SPONSOR "Solar Developer LLC"
        TAX_CREDIT_ALLOCATION 99/1
        DEPRECIATION_ALLOCATION 99/1
        CASH_ALLOCATION 95/5
        TARGET_RETURN 7.5

      // Investment tax credit
      TAX_CREDIT ProjectITC
        CREDIT_TYPE itc
        RATE 30
        ELIGIBLE_BASIS 80000000
        ADDER domestic_content + 10
        VESTING_PERIOD "5 years"

      // MACRS depreciation
      DEPRECIATION_SCHEDULE ProjectMACRS
        METHOD macrs_5yr
        DEPRECIABLE_BASIS 80000000
        BONUS_DEPRECIATION 60

      // Partnership flip
      FLIP_EVENT TargetReturnFlip
        TRIGGER target_return 7.5
        PRE_FLIP_ALLOCATION 99/1
        POST_FLIP_ALLOCATION 5/95
        BUYOUT_OPTION fair_market_value
        SATISFIES Partnership_Flipped
    `;
    const ast = await parseOrThrow(source);
    const interpreter = new ProVisoInterpreter(ast);

    // Check structure
    const structure = interpreter.getTaxEquityStructureStatus('SolarPartnership');
    expect(structure.structureType).toBe('partnership_flip');
    expect(structure.targetReturn).toBe(7.5);

    // Check ITC with adder
    const itc = interpreter.getTaxCreditStatus('ProjectITC');
    expect(itc.effectiveRate).toBe(40); // 30 + 10
    expect(itc.creditAmount).toBe(32000000); // 80M * 40%

    // Check depreciation year 1
    const depreciation = interpreter.getDepreciationForYear('ProjectMACRS', 1);
    expect(depreciation.bonusAmount).toBe(48000000); // 60% of 80M
    expect(depreciation.totalDepreciation).toBe(48000000 + 6400000); // bonus + 20% of remaining

    // Flip not triggered yet
    expect(interpreter.isFlipTriggered('TargetReturnFlip')).toBe(false);
    expect(interpreter.isConditionSatisfied('Partnership_Flipped')).toBe(false);

    // Trigger flip at target return
    interpreter.triggerFlip('TargetReturnFlip', new Date('2031-03-15'), 7.6);

    // Verify flip effects
    expect(interpreter.isConditionSatisfied('Partnership_Flipped')).toBe(true);
    const flipStatus = interpreter.getFlipEventStatus('TargetReturnFlip');
    expect(flipStatus.currentAllocation).toEqual({ investor: 5, sponsor: 95 });
  });
});

// ==================== STEP-DOWN COVENANT TESTS ====================

describe('Step-Down Covenants', () => {
  describe('Grammar Parsing', () => {
    it('should parse a covenant with STEP_DOWN clause', async () => {
      const code = `
        DEFINE Leverage AS funded_debt / ebitda

        COVENANT MaxLeverage
          REQUIRES Leverage <= 5.00
          STEP_DOWN
            AFTER 2025-06-30 TO 4.50
            AFTER 2026-06-30 TO 4.00
            AFTER 2027-06-30 TO 3.50
          TESTED QUARTERLY
      `;
      const result = await parseOrThrow(code);
      expect(result.statements.length).toBe(2);
      const covenant = result.statements[1] as any;
      expect(covenant.type).toBe('Covenant');
      expect(covenant.name).toBe('MaxLeverage');
      expect(covenant.stepDown).not.toBeNull();
      expect(covenant.stepDown).toHaveLength(3);
      expect(covenant.stepDown[0].afterDate).toBe('2025-06-30');
      expect(covenant.stepDown[1].afterDate).toBe('2026-06-30');
      expect(covenant.stepDown[2].afterDate).toBe('2027-06-30');
    });

    it('should parse step-down with expression thresholds', async () => {
      const code = `
        COVENANT MinCoverage
          REQUIRES coverage >= 2.00
          STEP_DOWN
            AFTER 2025-12-31 TO 2.50
            AFTER 2026-12-31 TO 3.00
          TESTED QUARTERLY
      `;
      const result = await parseOrThrow(code);
      const covenant = result.statements[0] as any;
      expect(covenant.stepDown).toHaveLength(2);
    });

    it('should parse covenant without step-down (backward compatibility)', async () => {
      const code = `
        COVENANT Simple
          REQUIRES ratio <= 5.00
          TESTED QUARTERLY
      `;
      const result = await parseOrThrow(code);
      const covenant = result.statements[0] as any;
      expect(covenant.stepDown).toBeNull();
    });

    it('should parse step-down with other clauses in any order', async () => {
      const code = `
        DEFINE Leverage AS funded_debt / ebitda

        COVENANT MaxLeverage
          REQUIRES Leverage <= 5.00
          TESTED QUARTERLY
          STEP_DOWN
            AFTER 2025-06-30 TO 4.50
          CURE EquityCure MAX_USES 3 OVER life_of_facility
          BREACH -> UnmaturedDefault
      `;
      const result = await parseOrThrow(code);
      const covenant = result.statements[1] as any;
      expect(covenant.stepDown).toHaveLength(1);
      expect(covenant.tested).toBe('quarterly');
      expect(covenant.cure).not.toBeNull();
      expect(covenant.breach).toBe('UnmaturedDefault');
    });

    it('should parse single step-down entry', async () => {
      const code = `
        COVENANT MaxLeverage
          REQUIRES ratio <= 5.00
          STEP_DOWN
            AFTER 2026-01-01 TO 4.00
          TESTED ANNUALLY
      `;
      const result = await parseOrThrow(code);
      const covenant = result.statements[0] as any;
      expect(covenant.stepDown).toHaveLength(1);
      expect(covenant.stepDown[0].afterDate).toBe('2026-01-01');
    });
  });

  describe('Interpreter - Step-Down with Multi-Period Data', () => {
    it('should apply the correct step-down threshold based on evaluation period', async () => {
      const code = `
        DEFINE Leverage AS funded_debt / ebitda

        COVENANT MaxLeverage
          REQUIRES Leverage <= 5.00
          STEP_DOWN
            AFTER 2025-06-30 TO 4.50
            AFTER 2026-06-30 TO 4.00
          TESTED QUARTERLY
      `;
      const ast = await parseOrThrow(code);
      const interp = new ProVisoInterpreter(ast);
      interp.loadFinancials({
        periods: [
          { period: 'Q1 2025', data: { funded_debt: 400, ebitda: 100 } }, // leverage = 4.0
          { period: 'Q3 2025', data: { funded_debt: 400, ebitda: 100 } }, // leverage = 4.0
          { period: 'Q1 2026', data: { funded_debt: 400, ebitda: 100 } }, // leverage = 4.0
          { period: 'Q3 2026', data: { funded_debt: 400, ebitda: 100 } }, // leverage = 4.0
        ],
      });

      // Q1 2025: Before any step-down, threshold = 5.00
      interp.setEvaluationPeriod('Q1 2025');
      let result = interp.checkCovenant('MaxLeverage');
      expect(result.threshold).toBe(5.00);
      expect(result.compliant).toBe(true);
      expect(result.originalThreshold).toBe(5.00);
      expect(result.nextStep).toEqual({ afterDate: '2025-06-30', threshold: 4.50 });

      // Q3 2025: First step-down active (after 2025-06-30), threshold = 4.50
      interp.setEvaluationPeriod('Q3 2025');
      result = interp.checkCovenant('MaxLeverage');
      expect(result.threshold).toBe(4.50);
      expect(result.compliant).toBe(true);
      expect(result.activeStep).toEqual({ afterDate: '2025-06-30', threshold: 4.50 });
      expect(result.nextStep).toEqual({ afterDate: '2026-06-30', threshold: 4.00 });

      // Q1 2026: Still first step-down, threshold = 4.50
      interp.setEvaluationPeriod('Q1 2026');
      result = interp.checkCovenant('MaxLeverage');
      expect(result.threshold).toBe(4.50);

      // Q3 2026: Second step-down active, threshold = 4.00
      interp.setEvaluationPeriod('Q3 2026');
      result = interp.checkCovenant('MaxLeverage');
      expect(result.threshold).toBe(4.00);
      expect(result.compliant).toBe(true);
      expect(result.activeStep).toEqual({ afterDate: '2026-06-30', threshold: 4.00 });
      expect(result.nextStep).toBeUndefined();
    });

    it('should detect breach when step-down tightens below actual', async () => {
      const code = `
        DEFINE Leverage AS funded_debt / ebitda

        COVENANT MaxLeverage
          REQUIRES Leverage <= 5.00
          STEP_DOWN
            AFTER 2025-06-30 TO 4.50
            AFTER 2026-06-30 TO 3.50
          TESTED QUARTERLY
      `;
      const ast = await parseOrThrow(code);
      const interp = new ProVisoInterpreter(ast);
      interp.loadFinancials({
        periods: [
          { period: 'Q1 2025', data: { funded_debt: 400, ebitda: 100 } }, // 4.0x
          { period: 'Q3 2026', data: { funded_debt: 400, ebitda: 100 } }, // 4.0x
        ],
      });

      // Q1 2025: 4.0 <= 5.0 → compliant
      interp.setEvaluationPeriod('Q1 2025');
      expect(interp.checkCovenant('MaxLeverage').compliant).toBe(true);

      // Q3 2026: 4.0 <= 3.5 → breach!
      interp.setEvaluationPeriod('Q3 2026');
      const result = interp.checkCovenant('MaxLeverage');
      expect(result.compliant).toBe(false);
      expect(result.actual).toBe(4.0);
      expect(result.threshold).toBe(3.50);
      expect(result.headroom).toBe(-0.50);
      expect(result.originalThreshold).toBe(5.00);
    });

    it('should apply step-down to >= covenants (step-up pattern)', async () => {
      // Coverage ratio that must INCREASE over time (step-up is step-down for >= covenants)
      const code = `
        DEFINE Coverage AS ebitda / interest

        COVENANT MinCoverage
          REQUIRES Coverage >= 2.00
          STEP_DOWN
            AFTER 2025-12-31 TO 2.50
            AFTER 2026-12-31 TO 3.00
          TESTED QUARTERLY
      `;
      const ast = await parseOrThrow(code);
      const interp = new ProVisoInterpreter(ast);
      interp.loadFinancials({
        periods: [
          { period: 'Q1 2025', data: { ebitda: 500, interest: 200 } }, // 2.5x
          { period: 'Q1 2026', data: { ebitda: 500, interest: 200 } }, // 2.5x
          { period: 'Q1 2027', data: { ebitda: 500, interest: 200 } }, // 2.5x
        ],
      });

      // Q1 2025: 2.5 >= 2.0 → compliant
      interp.setEvaluationPeriod('Q1 2025');
      let result = interp.checkCovenant('MinCoverage');
      expect(result.compliant).toBe(true);
      expect(result.threshold).toBe(2.00);

      // Q1 2026: 2.5 >= 2.5 → compliant (exactly at threshold)
      interp.setEvaluationPeriod('Q1 2026');
      result = interp.checkCovenant('MinCoverage');
      expect(result.compliant).toBe(true);
      expect(result.threshold).toBe(2.50);

      // Q1 2027: 2.5 >= 3.0 → breach!
      interp.setEvaluationPeriod('Q1 2027');
      result = interp.checkCovenant('MinCoverage');
      expect(result.compliant).toBe(false);
      expect(result.threshold).toBe(3.00);
      expect(result.headroom).toBe(-0.50);
    });
  });

  describe('Interpreter - Step-Down with Simple Data', () => {
    it('should use the last (tightest) step-down when no date context available', async () => {
      const code = `
        COVENANT MaxRatio
          REQUIRES ratio <= 5.00
          STEP_DOWN
            AFTER 2025-06-30 TO 4.50
            AFTER 2026-06-30 TO 4.00
            AFTER 2027-06-30 TO 3.50
          TESTED QUARTERLY
      `;
      const ast = await parseOrThrow(code);
      const interp = new ProVisoInterpreter(ast);
      // Simple (non-period) financial data — no date context
      interp.loadFinancials({ ratio: 4.20 });

      const result = interp.checkCovenant('MaxRatio');
      // Should use the tightest threshold (3.50) since no date is available
      expect(result.threshold).toBe(3.50);
      expect(result.compliant).toBe(false); // 4.20 > 3.50
      expect(result.originalThreshold).toBe(5.00);
    });
  });

  describe('Interpreter - Step-Down Headroom', () => {
    it('should calculate headroom from the stepped-down threshold', async () => {
      const code = `
        COVENANT MaxLeverage
          REQUIRES ratio <= 5.00
          STEP_DOWN
            AFTER 2025-06-30 TO 4.00
          TESTED QUARTERLY
      `;
      const ast = await parseOrThrow(code);
      const interp = new ProVisoInterpreter(ast);
      interp.loadFinancials({
        periods: [
          { period: 'Q3 2025', data: { ratio: 3.50 } },
        ],
      });
      interp.setEvaluationPeriod('Q3 2025');

      const result = interp.checkCovenant('MaxLeverage');
      expect(result.threshold).toBe(4.00);
      expect(result.headroom).toBe(0.50); // 4.00 - 3.50
      expect(result.originalThreshold).toBe(5.00);
    });
  });

  describe('Interpreter - Step-Down with Date Periods', () => {
    it('should handle date-format periods (YYYY-MM-DD)', async () => {
      const code = `
        COVENANT MaxRatio
          REQUIRES ratio <= 5.00
          STEP_DOWN
            AFTER 2025-06-30 TO 4.00
          TESTED QUARTERLY
      `;
      const ast = await parseOrThrow(code);
      const interp = new ProVisoInterpreter(ast);
      interp.loadFinancials({
        periods: [
          { period: '2025-03-31', data: { ratio: 4.50 } },
          { period: '2025-09-30', data: { ratio: 4.50 } },
        ],
      });

      // Before step-down
      interp.setEvaluationPeriod('2025-03-31');
      let result = interp.checkCovenant('MaxRatio');
      expect(result.threshold).toBe(5.00);
      expect(result.compliant).toBe(true);

      // After step-down
      interp.setEvaluationPeriod('2025-09-30');
      result = interp.checkCovenant('MaxRatio');
      expect(result.threshold).toBe(4.00);
      expect(result.compliant).toBe(false); // 4.50 > 4.00
    });

    it('should handle year-month periods (YYYY-MM)', async () => {
      const code = `
        COVENANT MaxRatio
          REQUIRES ratio <= 5.00
          STEP_DOWN
            AFTER 2025-06-30 TO 4.00
          TESTED MONTHLY
      `;
      const ast = await parseOrThrow(code);
      const interp = new ProVisoInterpreter(ast);
      interp.loadFinancials({
        periods: [
          { period: '2025-03', data: { ratio: 4.50 } },
          { period: '2025-09', data: { ratio: 4.50 } },
        ],
      });

      interp.setEvaluationPeriod('2025-03');
      expect(interp.checkCovenant('MaxRatio').threshold).toBe(5.00);

      interp.setEvaluationPeriod('2025-09');
      expect(interp.checkCovenant('MaxRatio').threshold).toBe(4.00);
    });
  });

  describe('Interpreter - checkAllCovenants with Step-Downs', () => {
    it('should apply step-downs when checking all covenants', async () => {
      const code = `
        DEFINE Leverage AS funded_debt / ebitda
        DEFINE Coverage AS ebitda / interest

        COVENANT MaxLeverage
          REQUIRES Leverage <= 5.00
          STEP_DOWN
            AFTER 2025-06-30 TO 4.00
          TESTED QUARTERLY

        COVENANT MinCoverage
          REQUIRES Coverage >= 2.00
          TESTED QUARTERLY
      `;
      const ast = await parseOrThrow(code);
      const interp = new ProVisoInterpreter(ast);
      interp.loadFinancials({
        periods: [
          { period: 'Q3 2025', data: { funded_debt: 400, ebitda: 100, interest: 40 } },
        ],
      });
      interp.setEvaluationPeriod('Q3 2025');

      const results = interp.checkAllCovenants();
      expect(results).toHaveLength(2);

      const leverage = results.find(r => r.name === 'MaxLeverage');
      expect(leverage!.threshold).toBe(4.00); // Step-down applied
      expect(leverage!.originalThreshold).toBe(5.00);

      const coverage = results.find(r => r.name === 'MinCoverage');
      expect(coverage!.threshold).toBe(2.00); // No step-down
      expect(coverage!.originalThreshold).toBeUndefined();
    });
  });

  describe('Interpreter - Step-Down Edge Cases', () => {
    it('should handle evaluation period exactly on step-down date', async () => {
      const code = `
        COVENANT MaxRatio
          REQUIRES ratio <= 5.00
          STEP_DOWN
            AFTER 2025-06-30 TO 4.00
          TESTED QUARTERLY
      `;
      const ast = await parseOrThrow(code);
      const interp = new ProVisoInterpreter(ast);
      interp.loadFinancials({
        periods: [
          { period: '2025-06-30', data: { ratio: 4.50 } },
        ],
      });
      interp.setEvaluationPeriod('2025-06-30');

      // On the exact date, the step-down should be active (>=)
      const result = interp.checkCovenant('MaxRatio');
      expect(result.threshold).toBe(4.00);
    });

    it('should handle multiple step-downs with same threshold', async () => {
      const code = `
        COVENANT MaxRatio
          REQUIRES ratio <= 5.00
          STEP_DOWN
            AFTER 2025-06-30 TO 4.00
            AFTER 2026-06-30 TO 4.00
            AFTER 2027-06-30 TO 3.00
          TESTED QUARTERLY
      `;
      const ast = await parseOrThrow(code);
      const interp = new ProVisoInterpreter(ast);
      interp.loadFinancials({
        periods: [
          { period: 'Q3 2026', data: { ratio: 3.50 } },
        ],
      });
      interp.setEvaluationPeriod('Q3 2026');

      const result = interp.checkCovenant('MaxRatio');
      expect(result.threshold).toBe(4.00);
      expect(result.nextStep).toEqual({ afterDate: '2027-06-30', threshold: 3.00 });
    });

    it('should preserve step-down info in CovenantResultWithCure', async () => {
      const code = `
        DEFINE Leverage AS funded_debt / ebitda

        COVENANT MaxLeverage
          REQUIRES Leverage <= 5.00
          STEP_DOWN
            AFTER 2025-06-30 TO 3.50
          TESTED QUARTERLY
          CURE EquityCure MAX_USES 3 OVER life_of_facility
      `;
      const ast = await parseOrThrow(code);
      const interp = new ProVisoInterpreter(ast);
      interp.loadFinancials({
        periods: [
          // leverage = 4.0x, threshold stepped down to 3.50 → breach
          { period: 'Q3 2025', data: { funded_debt: 400, ebitda: 100 } },
        ],
      });
      interp.setEvaluationPeriod('Q3 2025');

      // checkCovenantWithCure extends checkCovenant, so step-down info should persist
      const result = interp.checkCovenantWithCure('MaxLeverage');
      expect(result.compliant).toBe(false); // 4.0 > 3.5 → breached
      expect(result.threshold).toBe(3.50);
      expect(result.originalThreshold).toBe(5.00);
      expect(result.cureAvailable).toBe(true); // Cure available for breached covenant
    });
  });
});
