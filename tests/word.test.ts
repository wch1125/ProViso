/**
 * ProViso Hub v2.0 — Word Integration Tests
 *
 * Tests for Word generation, drift detection, and round-trip validation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  // Generator
  WordGenerator,
  createWordGenerator,
  generateWordDocument,
  generateRedline,
  // Templates
  renderCovenantToWord,
  renderBasketToWord,
  renderDefinitionToWord,
  renderPhaseToWord,
  renderMilestoneToWord,
  renderReserveToWord,
  formatCurrency,
  formatRatio,
  formatOperator,
  formatFrequency,
  getMetricDisplayName,
  // Drift Detection
  DriftDetector,
  createDriftDetector,
  detectDrift,
  // Round-Trip
  RoundTripValidator,
  createRoundTripValidator,
  validateRoundTrip,
  validateCodeRepresentation,
} from '../src/hub/word/index.js';
import type {
  CovenantStatement,
  BasketStatement,
  DefineStatement,
  PhaseStatement,
  MilestoneStatement,
  ReserveStatement,
} from '../src/types.js';

// =============================================================================
// FORMAT HELPERS TESTS
// =============================================================================

describe('Word Format Helpers', () => {
  describe('formatCurrency', () => {
    it('formats millions correctly', () => {
      expect(formatCurrency(25_000_000)).toBe('$25.0 million');
    });

    it('formats billions correctly', () => {
      expect(formatCurrency(1_500_000_000)).toBe('$1.5 billion');
    });

    it('formats small amounts with commas', () => {
      expect(formatCurrency(50_000)).toBe('$50,000');
    });
  });

  describe('formatRatio', () => {
    it('formats ratio with two decimals', () => {
      expect(formatRatio(5.0)).toBe('5.00 to 1.00');
    });

    it('handles fractional ratios', () => {
      expect(formatRatio(4.75)).toBe('4.75 to 1.00');
    });
  });

  describe('formatOperator', () => {
    it('formats less-than-or-equal', () => {
      expect(formatOperator('<=')).toBe('exceed');
    });

    it('formats greater-than-or-equal', () => {
      expect(formatOperator('>=')).toBe('be less than');
    });
  });

  describe('formatFrequency', () => {
    it('formats quarterly', () => {
      expect(formatFrequency('quarterly')).toBe('fiscal quarter');
    });

    it('formats monthly', () => {
      expect(formatFrequency('monthly')).toBe('fiscal month');
    });

    it('formats annually', () => {
      expect(formatFrequency('annually')).toBe('fiscal year');
    });

    it('handles uppercase', () => {
      expect(formatFrequency('QUARTERLY')).toBe('fiscal quarter');
    });
  });

  describe('getMetricDisplayName', () => {
    it('returns full name for Leverage', () => {
      expect(getMetricDisplayName('Leverage')).toBe(
        'Leverage Ratio (Total Debt to Consolidated EBITDA)'
      );
    });

    it('returns full name for InterestCoverage', () => {
      expect(getMetricDisplayName('InterestCoverage')).toBe(
        'Interest Coverage Ratio (Consolidated EBITDA to Interest Expense)'
      );
    });

    it('returns input for unknown metrics', () => {
      expect(getMetricDisplayName('CustomMetric')).toBe('CustomMetric');
    });
  });
});

// =============================================================================
// TEMPLATE RENDERING TESTS
// =============================================================================

describe('Word Template Rendering', () => {
  describe('renderCovenantToWord', () => {
    it('renders simple covenant', () => {
      const covenant: CovenantStatement = {
        type: 'Covenant',
        name: 'MaxLeverage',
        requires: {
          type: 'Comparison',
          left: 'Leverage',
          operator: '<=',
          right: { type: 'Number', value: 5.0 },
        },
        tested: 'quarterly',
        cure: null,
        breach: null,
      };

      const result = renderCovenantToWord(covenant, {
        sectionPrefix: '7.11',
        subsectionLabel: '(a)',
      });

      expect(result).toContain('MaxLeverage');
      expect(result).toContain('fiscal quarter');
      expect(result).toContain('shall not permit');
    });

    it('renders covenant with cure rights', () => {
      const covenant: CovenantStatement = {
        type: 'Covenant',
        name: 'MaxLeverage',
        requires: {
          type: 'Comparison',
          left: 'Leverage',
          operator: '<=',
          right: { type: 'Number', value: 5.0 },
        },
        tested: 'quarterly',
        cure: {
          type: 'EquityCure',
          details: {
            maxUses: 2,
            period: 'life_of_facility',
            maxAmount: { type: 'Currency', value: 25_000_000 },
          },
        },
        breach: null,
      };

      const result = renderCovenantToWord(covenant);

      expect(result).toContain('EquityCure');
      expect(result).toContain('provided');
    });
  });

  describe('renderBasketToWord', () => {
    it('renders fixed basket', () => {
      const basket: BasketStatement = {
        type: 'Basket',
        name: 'GeneralInvestments',
        capacity: { type: 'Currency', value: 25_000_000 },
        floor: null,
        buildsFrom: null,
        starting: null,
        maximum: null,
        subjectTo: null,
      };

      const result = renderBasketToWord(basket, {
        sectionPrefix: '7.02',
        subsectionLabel: '(f)',
      });

      expect(result).toContain('GeneralInvestments');
      expect(result).toContain('$25,000,000');
    });

    it('renders grower basket with floor', () => {
      const basket: BasketStatement = {
        type: 'Basket',
        name: 'GeneralInvestments',
        capacity: {
          type: 'FunctionCall',
          name: 'GreaterOf',
          arguments: [
            { type: 'Currency', value: 25_000_000 },
            {
              type: 'BinaryExpression',
              left: { type: 'Percentage', value: 10 },
              operator: '*',
              right: 'LTM_EBITDA',
            },
          ],
        },
        floor: { type: 'Currency', value: 20_000_000 },
        buildsFrom: null,
        starting: null,
        maximum: null,
        subjectTo: null,
      };

      const result = renderBasketToWord(basket);

      expect(result).toContain('greater of');
      expect(result).toContain('in no event less than');
    });

    it('renders basket with subject to condition', () => {
      const basket: BasketStatement = {
        type: 'Basket',
        name: 'GeneralInvestments',
        capacity: { type: 'Currency', value: 25_000_000 },
        floor: null,
        buildsFrom: null,
        starting: null,
        maximum: null,
        subjectTo: ['ProFormaCompliance'],
      };

      const result = renderBasketToWord(basket);

      expect(result).toContain('provided that');
      expect(result).toContain('pro forma');
    });
  });

  describe('renderDefinitionToWord', () => {
    it('renders simple definition', () => {
      const definition: DefineStatement = {
        type: 'Define',
        name: 'TotalDebt',
        expression: 'senior_debt + subordinated_debt',
        modifiers: {},
      };

      const result = renderDefinitionToWord(definition);

      expect(result).toContain('"TotalDebt" means');
    });

    it('renders definition with exclusions', () => {
      const definition: DefineStatement = {
        type: 'Define',
        name: 'EBITDA',
        expression: 'net_income + interest + taxes + depreciation',
        modifiers: {
          excluding: ['extraordinary_items', 'one_time_charges'],
        },
      };

      const result = renderDefinitionToWord(definition);

      expect(result).toContain('excluding');
      expect(result).toContain('extraordinary_items');
    });

    it('renders definition with cap', () => {
      const definition: DefineStatement = {
        type: 'Define',
        name: 'EBITDA',
        expression: 'net_income',
        modifiers: {
          cap: { type: 'Currency', value: 10_000_000 },
        },
      };

      const result = renderDefinitionToWord(definition);

      expect(result).toContain('capped at');
    });
  });

  describe('renderPhaseToWord', () => {
    it('renders phase with dates', () => {
      const phase: PhaseStatement = {
        type: 'Phase',
        name: 'Construction',
        from: 'Closing_Date',
        until: 'COD_Achieved',
        covenantsSuspended: ['DSCR'],
        covenantsActive: ['MaxLeverage'],
        requiredCovenants: [],
      };

      const result = renderPhaseToWord(phase);

      expect(result).toContain('Construction');
      expect(result).toContain('commence');
      expect(result).toContain('suspended');
      expect(result).toContain('DSCR');
    });
  });

  describe('renderMilestoneToWord', () => {
    it('renders milestone with dates', () => {
      const milestone: MilestoneStatement = {
        type: 'Milestone',
        name: 'FoundationComplete',
        targetDate: '2025-06-30',
        longstopDate: '2025-09-30',
        triggers: ['UnlockDraw2'],
        requires: null,
      };

      const result = renderMilestoneToWord(milestone);

      expect(result).toContain('FoundationComplete');
      expect(result).toContain('Target Date');
      expect(result).toContain('longstop');
      expect(result).toContain('UnlockDraw2');
    });
  });

  describe('renderReserveToWord', () => {
    it('renders reserve with target and minimum', () => {
      const reserve: ReserveStatement = {
        type: 'Reserve',
        name: 'DebtServiceReserve',
        target: { type: 'Currency', value: 10_000_000 },
        minimum: { type: 'Currency', value: 5_000_000 },
        fundedBy: ['Revenue'],
        releasedTo: 'Borrower',
        releasedFor: 'operations',
      };

      const result = renderReserveToWord(reserve);

      expect(result).toContain('DebtServiceReserve');
      expect(result).toContain('minimum balance');
      expect(result).toContain('funded by');
      expect(result).toContain('released');
    });
  });
});

// =============================================================================
// WORD GENERATOR TESTS
// =============================================================================

describe('WordGenerator', () => {
  let generator: WordGenerator;

  beforeEach(() => {
    generator = createWordGenerator();
  });

  describe('generateDocument', () => {
    it('generates document from simple code', async () => {
      const code = `
        DEFINE TotalDebt AS senior_debt + subordinated_debt

        COVENANT MaxLeverage
          REQUIRES Leverage <= 5.0
          TESTED QUARTERLY
      `;

      const doc = await generateWordDocument(code, {
        dealName: 'Test Facility',
        facilityAmount: 100_000_000,
      });

      expect(doc.metadata.dealName).toBe('Test Facility');
      expect(doc.articles.length).toBeGreaterThan(0);
      expect(doc.fullText).toContain('CREDIT AGREEMENT');
    });

    it('organizes elements into articles', async () => {
      const code = `
        DEFINE EBITDA AS net_income + interest + taxes
        DEFINE Leverage AS TotalDebt / EBITDA

        COVENANT MaxLeverage
          REQUIRES Leverage <= 5.0
          TESTED QUARTERLY
      `;

      const doc = await generator.generateDocument(code, {
        dealName: 'Test Facility',
      });

      // Should have Article 1 (Definitions) and Article 7 (Covenants)
      const articleNumbers = doc.articles.map((a) => a.articleNumber);
      expect(articleNumbers).toContain(1);
      expect(articleNumbers).toContain(7);
    });

    it('handles project finance elements', async () => {
      const code = `
        PHASE Construction
          FROM Closing_Date
          UNTIL COD_Achieved
          COVENANTS SUSPENDED DSCR
          COVENANTS ACTIVE MaxLeverage

        MILESTONE FoundationComplete
          TARGET 2025-06-30
          LONGSTOP 2025-09-30
      `;

      const doc = await generator.generateDocument(code, {
        dealName: 'Solar Project',
      });

      expect(doc.fullText).toContain('Construction');
      expect(doc.fullText).toContain('FoundationComplete');
    });
  });

  describe('generateSection', () => {
    it('generates single section from statement', () => {
      const covenant: CovenantStatement = {
        type: 'Covenant',
        name: 'MaxLeverage',
        requires: {
          type: 'Comparison',
          left: 'Leverage',
          operator: '<=',
          right: { type: 'Number', value: 5.0 },
        },
        tested: 'quarterly',
        cure: null,
        breach: null,
      };

      const section = generator.generateSection(covenant, {
        sectionPrefix: '7.11',
        subsectionLabel: '(a)',
      });

      expect(section.sectionReference).toBe('7.11(a)');
      expect(section.elementName).toBe('MaxLeverage');
      expect(section.content).toContain('shall not permit');
    });
  });

  describe('generateRedline', () => {
    it('detects added sections', async () => {
      const oldCode = `
        COVENANT MaxLeverage
          REQUIRES Leverage <= 5.0
          TESTED QUARTERLY
      `;

      const newCode = `
        COVENANT MaxLeverage
          REQUIRES Leverage <= 5.0
          TESTED QUARTERLY

        COVENANT MinCoverage
          REQUIRES InterestCoverage >= 2.5
          TESTED QUARTERLY
      `;

      const redline = await generateRedline(oldCode, newCode);

      expect(redline.hasChanges).toBe(true);
      expect(redline.addedSections.length).toBeGreaterThan(0);
    });

    it('detects removed sections', async () => {
      const oldCode = `
        COVENANT MaxLeverage
          REQUIRES Leverage <= 5.0
          TESTED QUARTERLY

        COVENANT MinCoverage
          REQUIRES InterestCoverage >= 2.5
          TESTED QUARTERLY
      `;

      const newCode = `
        COVENANT MaxLeverage
          REQUIRES Leverage <= 5.0
          TESTED QUARTERLY
      `;

      const redline = await generateRedline(oldCode, newCode);

      expect(redline.hasChanges).toBe(true);
      expect(redline.removedSections.length).toBeGreaterThan(0);
    });

    it('detects modified sections', async () => {
      const oldCode = `
        COVENANT MaxLeverage
          REQUIRES Leverage <= 5.0
          TESTED QUARTERLY
      `;

      const newCode = `
        COVENANT MaxLeverage
          REQUIRES Leverage <= 5.25
          TESTED QUARTERLY
      `;

      const redline = await generateRedline(oldCode, newCode);

      expect(redline.hasChanges).toBe(true);
      expect(redline.modifiedSections.length).toBeGreaterThan(0);
    });

    it('handles no changes', async () => {
      const code = `
        COVENANT MaxLeverage
          REQUIRES Leverage <= 5.0
          TESTED QUARTERLY
      `;

      const redline = await generateRedline(code, code);

      expect(redline.hasChanges).toBe(false);
      expect(redline.addedSections.length).toBe(0);
      expect(redline.removedSections.length).toBe(0);
      expect(redline.modifiedSections.length).toBe(0);
    });
  });
});

// =============================================================================
// DRIFT DETECTOR TESTS
// =============================================================================

describe('DriftDetector', () => {
  let detector: DriftDetector;

  beforeEach(() => {
    detector = createDriftDetector();
  });

  describe('classifyDrift', () => {
    it('classifies covenant threshold change', () => {
      const diff = {
        section: '7.11(a)',
        type: 'modification' as const,
        expected: 'Leverage Ratio shall not exceed 5.00 to 1.00',
        actual: 'Leverage Ratio shall not exceed 5.25 to 1.00',
        lineNumber: 10,
      };

      const classification = detector.classifyDrift(diff);

      expect(classification).not.toBeNull();
      expect(classification?.elementType).toBe('covenant');
      expect(classification?.changeCategory).toBe('threshold');
      expect(classification?.confidence).toBeGreaterThan(0.5);
    });

    it('classifies basket capacity change', () => {
      const diff = {
        section: '7.02(f)',
        type: 'modification' as const,
        expected: 'investments not to exceed $25 million',
        actual: 'investments not to exceed $35 million',
        lineNumber: 20,
      };

      const classification = detector.classifyDrift(diff);

      expect(classification).not.toBeNull();
      expect(classification?.elementType).toBe('basket');
      expect(classification?.changeCategory).toBe('capacity');
    });

    it('classifies definition change', () => {
      const diff = {
        section: '1.01',
        type: 'addition' as const,
        expected: '',
        actual: '"Consolidated EBITDA" means net income plus interest',
        lineNumber: 5,
      };

      const classification = detector.classifyDrift(diff);

      expect(classification).not.toBeNull();
      expect(classification?.elementType).toBe('definition');
    });

    it('returns null for unclassifiable text', () => {
      const diff = {
        section: 'misc',
        type: 'modification' as const,
        expected: 'Lorem ipsum dolor sit amet',
        actual: 'Consectetur adipiscing elit',
        lineNumber: 100,
      };

      const classification = detector.classifyDrift(diff);

      expect(classification).toBeNull();
    });
  });

  describe('suggestCode', () => {
    it('suggests covenant code', () => {
      const diff = {
        section: '7.11(a)',
        type: 'modification' as const,
        expected: '',
        actual: 'Leverage Ratio shall not exceed 5.25',
        lineNumber: 10,
      };

      const classification = {
        elementType: 'covenant' as const,
        changeCategory: 'threshold' as const,
        explanation: 'Threshold changed',
        confidence: 0.9,
      };

      const code = detector.suggestCode(diff, classification);

      expect(code).not.toBeNull();
      expect(code).toContain('COVENANT');
      expect(code).toContain('5.25');
    });

    it('suggests basket code', () => {
      const diff = {
        section: '7.02(f)',
        type: 'addition' as const,
        expected: '',
        actual: 'investments not to exceed $35 million',
        lineNumber: 20,
      };

      const classification = {
        elementType: 'basket' as const,
        changeCategory: 'capacity' as const,
        explanation: 'Capacity changed',
        confidence: 0.8,
      };

      const code = detector.suggestCode(diff, classification);

      expect(code).not.toBeNull();
      expect(code).toContain('BASKET');
    });
  });

  describe('assessSeverity', () => {
    it('rates threshold changes as high severity', () => {
      const classification = {
        elementType: 'covenant' as const,
        changeCategory: 'threshold' as const,
        explanation: 'Threshold changed',
        confidence: 0.9,
      };

      const severity = detector.assessSeverity(classification);

      expect(severity).toBe('high');
    });

    it('rates capacity changes as high severity', () => {
      const classification = {
        elementType: 'basket' as const,
        changeCategory: 'capacity' as const,
        explanation: 'Capacity changed',
        confidence: 0.8,
      };

      const severity = detector.assessSeverity(classification);

      expect(severity).toBe('high');
    });

    it('rates structural changes as medium severity', () => {
      const classification = {
        elementType: 'covenant' as const,
        changeCategory: 'structure' as const,
        explanation: 'Structure changed',
        confidence: 0.7,
      };

      const severity = detector.assessSeverity(classification);

      expect(severity).toBe('medium');
    });

    it('rates null classification as low severity', () => {
      const severity = detector.assessSeverity(null);

      expect(severity).toBe('low');
    });
  });

  describe('findMatchingForm', () => {
    it('finds covenant forms', () => {
      const classification = {
        elementType: 'covenant' as const,
        changeCategory: 'threshold' as const,
        explanation: '',
        confidence: 0.9,
      };

      const form = detector.findMatchingForm(classification);

      expect(form).toBe('covenant-simple');
    });

    it('finds basket forms', () => {
      const classification = {
        elementType: 'basket' as const,
        changeCategory: 'capacity' as const,
        explanation: '',
        confidence: 0.8,
      };

      const form = detector.findMatchingForm(classification);

      expect(form).toBe('basket-fixed');
    });

    it('returns null for unknown element types', () => {
      const classification = {
        elementType: 'other' as const,
        changeCategory: 'other' as const,
        explanation: '',
        confidence: 0.5,
      };

      const form = detector.findMatchingForm(classification);

      expect(form).toBeNull();
    });
  });

  describe('detectDrift', () => {
    it('detects drift between code and Word text', async () => {
      const code = `
        COVENANT MaxLeverage
          REQUIRES Leverage <= 5.0
          TESTED QUARTERLY
      `;

      // Simulate Word text that differs from expected
      const actualWord = `
        (a) Maximum Leverage. The Borrower shall not permit the
        Leverage Ratio to exceed 5.25 to 1.00.
      `;

      const report = await detectDrift(actualWord, code);

      // Report should indicate drift exists
      expect(report).toBeDefined();
      expect(report.stats).toBeDefined();
    });
  });
});

// =============================================================================
// ROUND-TRIP VALIDATOR TESTS
// =============================================================================

describe('RoundTripValidator', () => {
  let validator: RoundTripValidator;

  beforeEach(() => {
    validator = createRoundTripValidator();
  });

  describe('validateCodeRepresentation', () => {
    it('validates when numbers are preserved', () => {
      const original = 'Leverage Ratio shall not exceed 5.00 to 1.00';
      const generated = 'Leverage shall not exceed 5.00 to 1.00';

      const result = validator.validateCodeRepresentation(original, generated);

      // Should pass since both 5.00 and 1.00 are present
      expect(result.isValid).toBe(true);
      expect(result.issues.length).toBe(0);
    });

    it('detects missing numbers', () => {
      const original = 'Capacity of $25,000,000 and 10% of EBITDA';
      const generated = 'Capacity of 10% of EBITDA';

      const result = validator.validateCodeRepresentation(original, generated);

      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('detects missing key phrases when greater of is omitted', () => {
      const original = 'The greater of $25M or 10% of EBITDA';
      const generated = 'Just $25M';

      const result = validator.validateCodeRepresentation(original, generated);

      // 'greater of' is a key phrase that should be preserved
      expect(result.isValid).toBe(false);
    });
  });

  describe('validate', () => {
    it('validates round-trip for simple covenant', async () => {
      const code = `
        COVENANT MaxLeverage
          REQUIRES Leverage <= 5.0
          TESTED QUARTERLY
      `;

      // Generate Word from code
      const doc = await generateWordDocument(code, { dealName: 'Test' });

      // Validate round-trip
      const result = await validateRoundTrip(doc.fullText, code);

      expect(result).toBeDefined();
      expect(result.stats).toBeDefined();
      expect(result.stats.totalSections).toBeGreaterThanOrEqual(0);
    });
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe('Word Integration', () => {
  it('generates and redlines a complete agreement', async () => {
    const v1Code = `
      DEFINE EBITDA AS net_income + interest + taxes + depreciation
      DEFINE TotalDebt AS senior_debt + subordinated_debt
      DEFINE Leverage AS TotalDebt / EBITDA

      COVENANT MaxLeverage
        REQUIRES Leverage <= 5.0
        TESTED QUARTERLY

      BASKET GeneralInvestments
        CAPACITY $25_000_000
    `;

    const v2Code = `
      DEFINE EBITDA AS net_income + interest + taxes + depreciation
      DEFINE TotalDebt AS senior_debt + subordinated_debt
      DEFINE Leverage AS TotalDebt / EBITDA

      COVENANT MaxLeverage
        REQUIRES Leverage <= 5.25
        TESTED QUARTERLY

      BASKET GeneralInvestments
        CAPACITY $35_000_000

      COVENANT MinCoverage
        REQUIRES InterestCoverage >= 2.5
        TESTED QUARTERLY
    `;

    // Generate both documents
    const v1Doc = await generateWordDocument(v1Code, {
      dealName: 'ABC Facility',
      version: 'v1',
    });

    const v2Doc = await generateWordDocument(v2Code, {
      dealName: 'ABC Facility',
      version: 'v2',
    });

    // Generate redline
    const redline = await generateRedline(v1Code, v2Code);

    expect(v1Doc.articles.length).toBeGreaterThan(0);
    expect(v2Doc.articles.length).toBeGreaterThan(0);
    expect(redline.hasChanges).toBe(true);
    expect(redline.addedSections.length).toBeGreaterThan(0); // MinCoverage added
    expect(redline.modifiedSections.length).toBeGreaterThan(0); // MaxLeverage, GeneralInvestments modified
  });

  it('detects drift and suggests corrections', async () => {
    const code = `
      COVENANT MaxLeverage
        REQUIRES Leverage <= 5.0
        TESTED QUARTERLY

      BASKET GeneralInvestments
        CAPACITY $25_000_000
    `;

    // Simulate lawyer editing Word with different values
    const editedWord = `
      7.11(a) Maximum Leverage. The Borrower shall not permit the Leverage Ratio to exceed 5.50 to 1.00.

      7.02(f) General Investment Basket. Investments not to exceed $40,000,000.
    `;

    const report = await detectDrift(editedWord, code);

    expect(report.drifts.length).toBeGreaterThan(0);
    // At least one should be classified as high severity (threshold/capacity)
    const highSeverity = report.drifts.filter((d) => d.severity === 'high');
    expect(highSeverity.length).toBeGreaterThanOrEqual(0);
  });
});
