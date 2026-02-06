/**
 * ProViso — Deal Template Tests
 *
 * Tests for the deal template system including:
 * - Template registry (lookup, filtering)
 * - Template code generation (all 4 templates)
 * - Value enrichment (percentage-to-decimal conversions)
 * - Template validation
 * - Generated code structure verification
 */

import { describe, it, expect } from 'vitest';
import {
  dealTemplates,
  getDealTemplate,
  getDealTemplatesByIndustry,
  getDealTemplatesByComplexity,
  generateFromTemplate,
  enrichTemplateValues,
  corporateRevolverTemplate,
  termLoanBTemplate,
  projectFinanceTemplate,
  realEstateTemplate,
  getDefaultValues,
  validateFormValues,
} from '../src/hub/forms/index.js';

// =============================================================================
// TEMPLATE REGISTRY TESTS
// =============================================================================

describe('Deal Template Registry', () => {
  it('has 4 templates registered', () => {
    expect(dealTemplates).toHaveLength(4);
  });

  it('retrieves templates by ID', () => {
    expect(getDealTemplate('corporate-revolver')).toBeDefined();
    expect(getDealTemplate('term-loan-b')).toBeDefined();
    expect(getDealTemplate('project-finance')).toBeDefined();
    expect(getDealTemplate('real-estate')).toBeDefined();
  });

  it('returns undefined for unknown template', () => {
    expect(getDealTemplate('nonexistent')).toBeUndefined();
  });

  it('filters by industry', () => {
    const corporate = getDealTemplatesByIndustry('corporate');
    expect(corporate).toHaveLength(1);
    expect(corporate[0]?.id).toBe('corporate-revolver');

    const pf = getDealTemplatesByIndustry('project_finance');
    expect(pf).toHaveLength(1);
    expect(pf[0]?.id).toBe('project-finance');

    const re = getDealTemplatesByIndustry('real_estate');
    expect(re).toHaveLength(1);
    expect(re[0]?.id).toBe('real-estate');

    const lf = getDealTemplatesByIndustry('leveraged_finance');
    expect(lf).toHaveLength(1);
    expect(lf[0]?.id).toBe('term-loan-b');
  });

  it('filters by complexity', () => {
    const standard = getDealTemplatesByComplexity('standard');
    expect(standard.length).toBeGreaterThanOrEqual(3);

    const advanced = getDealTemplatesByComplexity('advanced');
    expect(advanced).toHaveLength(1);
    expect(advanced[0]?.id).toBe('project-finance');
  });

  it('all templates have required metadata', () => {
    for (const template of dealTemplates) {
      expect(template.id).toBeTruthy();
      expect(template.name).toBeTruthy();
      expect(template.description).toBeTruthy();
      expect(template.industry).toBeTruthy();
      expect(template.complexity).toBeTruthy();
      expect(template.icon).toBeTruthy();
      expect(template.features.length).toBeGreaterThan(0);
      expect(template.form).toBeDefined();
      expect(template.form.id).toMatch(/^template-/);
      expect(template.form.category).toBe('templates');
      expect(template.form.elementType).toBe('template');
    }
  });

  it('all templates have non-empty form fields', () => {
    for (const template of dealTemplates) {
      expect(template.form.fields.length).toBeGreaterThan(0);
      expect(template.form.codeTemplate).toBeTruthy();
    }
  });
});

// =============================================================================
// TEMPLATE STRUCTURE TESTS
// =============================================================================

describe('Corporate Revolver Template', () => {
  const template = corporateRevolverTemplate;

  it('has correct metadata', () => {
    expect(template.id).toBe('corporate-revolver');
    expect(template.industry).toBe('corporate');
    expect(template.complexity).toBe('standard');
  });

  it('has all key fields', () => {
    const fieldNames = template.form.fields.map((f) => f.name);
    expect(fieldNames).toContain('borrowerName');
    expect(fieldNames).toContain('facilityAmount');
    expect(fieldNames).toContain('maxLeverage');
    expect(fieldNames).toContain('minInterestCoverage');
    expect(fieldNames).toContain('generalInvestmentBasket');
    expect(fieldNames).toContain('crossDefaultThreshold');
  });

  it('has default values for all required fields', () => {
    const defaults = getDefaultValues(template.form);
    expect(defaults.borrowerName).toBeTruthy();
    expect(defaults.facilityAmount).toBeGreaterThan(0);
    expect(defaults.maxLeverage).toBeGreaterThan(0);
    expect(defaults.minInterestCoverage).toBeGreaterThan(0);
  });

  it('validates with default values', () => {
    const defaults = getDefaultValues(template.form);
    const result = validateFormValues(template.form, defaults);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
    expect(result.formErrors).toHaveLength(0);
  });

  it('generates code with DEFINE blocks', () => {
    const result = generateFromTemplate('corporate-revolver', getDefaultValues(template.form));
    expect(result).not.toBeNull();
    expect(result!.code).toContain('DEFINE EBITDA AS');
    expect(result!.code).toContain('DEFINE TotalDebt AS');
    expect(result!.code).toContain('DEFINE Leverage AS');
    expect(result!.code).toContain('DEFINE InterestCoverage AS');
  });

  it('generates code with COVENANT blocks', () => {
    const result = generateFromTemplate('corporate-revolver', getDefaultValues(template.form));
    expect(result!.code).toContain('COVENANT MaxLeverage');
    expect(result!.code).toContain('REQUIRES Leverage <= 4.5');
    expect(result!.code).toContain('COVENANT MinInterestCoverage');
    expect(result!.code).toContain('REQUIRES InterestCoverage >= 2.5');
    expect(result!.code).toContain('TESTED QUARTERLY');
  });

  it('generates code with BASKET blocks', () => {
    const result = generateFromTemplate('corporate-revolver', getDefaultValues(template.form));
    expect(result!.code).toContain('BASKET GeneralInvestments');
    expect(result!.code).toContain('BASKET RestrictedPayments');
    expect(result!.code).toContain('BASKET CapEx');
    expect(result!.code).toContain('BASKET PermittedAcquisitions');
  });

  it('generates code with grower basket when enabled', () => {
    const defaults = getDefaultValues(template.form);
    defaults.hasGrowerBasket = true;
    const result = generateFromTemplate('corporate-revolver', defaults);
    expect(result!.code).toContain('BASKET EBITDAInvestments');
    expect(result!.code).toContain('FLOOR');
  });

  it('omits grower basket when disabled', () => {
    const defaults = getDefaultValues(template.form);
    defaults.hasGrowerBasket = false;
    const result = generateFromTemplate('corporate-revolver', defaults);
    expect(result!.code).not.toContain('BASKET EBITDAInvestments');
  });

  it('generates code with builder basket when enabled', () => {
    const defaults = getDefaultValues(template.form);
    defaults.hasBuilderBasket = true;
    const result = generateFromTemplate('corporate-revolver', defaults);
    expect(result!.code).toContain('BASKET RetainedEarningsBasket');
    expect(result!.code).toContain('BUILDS_FROM');
    expect(result!.code).toContain('STARTING');
    expect(result!.code).toContain('MAXIMUM');
  });

  it('generates code with cure rights when enabled', () => {
    const defaults = getDefaultValues(template.form);
    defaults.hasCureRight = true;
    const result = generateFromTemplate('corporate-revolver', defaults);
    expect(result!.code).toContain('CURE EquityCure');
    expect(result!.code).toContain('MAX_USES');
  });

  it('generates code with conditions', () => {
    const result = generateFromTemplate('corporate-revolver', getDefaultValues(template.form));
    expect(result!.code).toContain('CONDITION NoDefault AS');
    expect(result!.code).toContain('CONDITION ProFormaCompliance AS');
  });

  it('generates code with prohibitions', () => {
    const result = generateFromTemplate('corporate-revolver', getDefaultValues(template.form));
    expect(result!.code).toContain('PROHIBIT Investments');
    expect(result!.code).toContain('PROHIBIT Dividends');
    expect(result!.code).toContain('PROHIBIT CapitalExpenditures');
  });

  it('generates code with events of default', () => {
    const result = generateFromTemplate('corporate-revolver', getDefaultValues(template.form));
    expect(result!.code).toContain('EVENT PaymentDefault');
    expect(result!.code).toContain('EVENT CovenantDefault');
    expect(result!.code).toContain('EVENT CrossDefault');
    expect(result!.code).toContain('GRACE_PERIOD');
    expect(result!.code).toContain('CONSEQUENCE EventOfDefault');
  });

  it('uses custom borrower name in generated code', () => {
    const values = getDefaultValues(template.form);
    values.borrowerName = 'TestCo Inc.';
    const result = generateFromTemplate('corporate-revolver', values);
    expect(result!.code).toContain('TestCo Inc.');
  });

  it('validates builder basket maximum >= starting', () => {
    const values = getDefaultValues(template.form);
    values.hasBuilderBasket = true;
    values.builderStarting = 50_000_000;
    values.builderMaximum = 10_000_000; // Less than starting
    const result = validateFormValues(template.form, values);
    expect(result.isValid).toBe(false);
  });

  it('includes liquidity covenant when enabled', () => {
    const values = getDefaultValues(template.form);
    values.hasLiquidityCovenant = true;
    values.minLiquidity = 15_000_000;
    const result = generateFromTemplate('corporate-revolver', values);
    expect(result!.code).toContain('COVENANT MinLiquidity');
    expect(result!.code).toContain('REQUIRES cash >= 15000000');
  });
});

describe('Term Loan B Template', () => {
  const template = termLoanBTemplate;

  it('has correct metadata', () => {
    expect(template.id).toBe('term-loan-b');
    expect(template.industry).toBe('leveraged_finance');
    expect(template.complexity).toBe('standard');
  });

  it('validates with default values', () => {
    const defaults = getDefaultValues(template.form);
    const result = validateFormValues(template.form, defaults);
    expect(result.isValid).toBe(true);
  });

  it('generates incurrence-only conditions (no maintenance covenants)', () => {
    const result = generateFromTemplate('term-loan-b', getDefaultValues(template.form));
    expect(result!.code).toContain('CONDITION IncurrenceLeverageTest AS');
    expect(result!.code).toContain('CONDITION RPIncurrenceTest AS');
    // Should NOT have TESTED QUARTERLY on main conditions (incurrence-only)
    expect(result!.code).toContain('PROHIBIT DebtIncurrence');
    expect(result!.code).toContain('PROHIBIT RestrictedPayment');
  });

  it('generates secured leverage test', () => {
    const result = generateFromTemplate('term-loan-b', getDefaultValues(template.form));
    expect(result!.code).toContain('DEFINE SecuredLeverage AS');
    expect(result!.code).toContain('SecuredLeverage <= 3.5');
  });

  it('generates change of control event', () => {
    const result = generateFromTemplate('term-loan-b', getDefaultValues(template.form));
    expect(result!.code).toContain('EVENT ChangeOfControl');
  });

  it('validates secured leverage must not exceed total leverage', () => {
    const values = getDefaultValues(template.form);
    values.securedLeverageCap = 6.0;
    values.incurrenceLeverage = 5.0;
    const result = validateFormValues(template.form, values);
    expect(result.isValid).toBe(false);
  });
});

describe('Project Finance Template', () => {
  const template = projectFinanceTemplate;

  it('has correct metadata', () => {
    expect(template.id).toBe('project-finance');
    expect(template.industry).toBe('project_finance');
    expect(template.complexity).toBe('advanced');
  });

  it('validates with default values', () => {
    const defaults = getDefaultValues(template.form);
    const result = validateFormValues(template.form, defaults);
    expect(result.isValid).toBe(true);
  });

  it('generates PHASE blocks', () => {
    const result = generateFromTemplate('project-finance', getDefaultValues(template.form));
    expect(result!.code).toContain('PHASE Construction');
    expect(result!.code).toContain('PHASE Operations');
    expect(result!.code).toContain('PHASE Tail');
  });

  it('generates MILESTONE blocks', () => {
    const result = generateFromTemplate('project-finance', getDefaultValues(template.form));
    expect(result!.code).toContain('MILESTONE FoundationComplete');
    expect(result!.code).toContain('MILESTONE MechanicalCompletion');
    expect(result!.code).toContain('TARGET');
    expect(result!.code).toContain('LONGSTOP');
  });

  it('generates DSCR covenant', () => {
    const result = generateFromTemplate('project-finance', getDefaultValues(template.form));
    expect(result!.code).toContain('COVENANT MinDSCR');
    expect(result!.code).toContain('REQUIRES DSCR >= 1.2');
  });

  it('generates LLCR covenant when enabled', () => {
    const defaults = getDefaultValues(template.form);
    defaults.hasLLCR = true;
    const result = generateFromTemplate('project-finance', defaults);
    expect(result!.code).toContain('COVENANT MinLLCR');
    expect(result!.code).toContain('DEFINE LLCR AS');
  });

  it('generates RESERVE blocks', () => {
    const result = generateFromTemplate('project-finance', getDefaultValues(template.form));
    expect(result!.code).toContain('RESERVE DSRA');
    expect(result!.code).toContain('RESERVE MRA');
    expect(result!.code).toContain('FUNDED_BY');
  });

  it('generates WATERFALL block', () => {
    const result = generateFromTemplate('project-finance', getDefaultValues(template.form));
    expect(result!.code).toContain('WATERFALL OperatingCashflow');
    expect(result!.code).toContain('TIER 1');
    expect(result!.code).toContain('TIER 2');
  });

  it('generates CONDITIONS_PRECEDENT block', () => {
    const result = generateFromTemplate('project-finance', getDefaultValues(template.form));
    expect(result!.code).toContain('CONDITIONS_PRECEDENT InitialDraw');
    expect(result!.code).toContain('CP PermitsObtained');
    expect(result!.code).toContain('CP InsuranceInPlace');
    expect(result!.code).toContain('CP EquityContribution');
  });

  it('validates DSCR ordering', () => {
    const values = getDefaultValues(template.form);
    values.minDSCR = 1.05; // Less than lockup
    values.lockupDSCR = 1.10;
    values.defaultDSCR = 1.05;
    const result = validateFormValues(template.form, values);
    expect(result.isValid).toBe(false);
  });

  it('generates transition block', () => {
    const result = generateFromTemplate('project-finance', getDefaultValues(template.form));
    expect(result!.code).toContain('TRANSITION ConstructionToOperations');
    expect(result!.code).toContain('ALL_OF');
  });
});

describe('Real Estate Template', () => {
  const template = realEstateTemplate;

  it('has correct metadata', () => {
    expect(template.id).toBe('real-estate');
    expect(template.industry).toBe('real_estate');
    expect(template.complexity).toBe('standard');
  });

  it('validates with default values', () => {
    const defaults = getDefaultValues(template.form);
    const result = validateFormValues(template.form, defaults);
    expect(result.isValid).toBe(true);
  });

  it('generates LTV covenant', () => {
    const defaults = getDefaultValues(template.form);
    const result = generateFromTemplate('real-estate', defaults);
    expect(result!.code).toContain('COVENANT MaxLTV');
    expect(result!.code).toContain('DEFINE LTV AS');
  });

  it('generates DSCR and DebtYield covenants', () => {
    const defaults = getDefaultValues(template.form);
    defaults.hasDebtYield = true;
    const result = generateFromTemplate('real-estate', defaults);
    expect(result!.code).toContain('COVENANT MinDSCR');
    expect(result!.code).toContain('COVENANT MinDebtYield');
    expect(result!.code).toContain('DEFINE DebtYield AS');
  });

  it('generates tenant concentration covenant when enabled', () => {
    const defaults = getDefaultValues(template.form);
    defaults.hasTenantConcentration = true;
    const result = generateFromTemplate('real-estate', defaults);
    expect(result!.code).toContain('COVENANT MaxTenantConcentration');
    expect(result!.code).toContain('DEFINE TenantConcentration AS');
  });

  it('generates reserve accounts', () => {
    const defaults = getDefaultValues(template.form);
    defaults.hasTaxInsuranceEscrow = true;
    const result = generateFromTemplate('real-estate', defaults);
    expect(result!.code).toContain('RESERVE ReplacementReserve');
    expect(result!.code).toContain('RESERVE TaxInsuranceEscrow');
  });

  it('generates NOI definition', () => {
    const result = generateFromTemplate('real-estate', getDefaultValues(template.form));
    expect(result!.code).toContain('DEFINE NOI AS');
    expect(result!.code).toContain('gross_rental_income');
  });
});

// =============================================================================
// VALUE ENRICHMENT TESTS
// =============================================================================

describe('Template Value Enrichment', () => {
  it('converts real estate percentages to decimals', () => {
    const enriched = enrichTemplateValues('template-real-estate', {
      maxLTV: 65,
      minDebtYield: 8,
      maxTenantConcentration: 30,
      minOccupancy: 80,
    });
    expect(enriched.maxLTVDecimal).toBe('0.65');
    expect(enriched.minDebtYieldDecimal).toBe('0.08');
    expect(enriched.maxTenantConcentrationDecimal).toBe('0.30');
    expect(enriched.minOccupancyDecimal).toBe('0.80');
  });

  it('computes occupancy default threshold', () => {
    const enriched = enrichTemplateValues('template-real-estate', {
      minOccupancy: 80,
    });
    expect(enriched.occupancyDefaultDecimal).toBe('0.70');
  });

  it('sets change of control thresholds for term loan B', () => {
    const majority = enrichTemplateValues('template-term-loan-b', {
      changeOfControlTrigger: 'majority',
    });
    expect(majority.changeOfControlThresholdValue).toBe(50);

    const supermajority = enrichTemplateValues('template-term-loan-b', {
      changeOfControlTrigger: 'supermajority',
    });
    expect(supermajority.changeOfControlThresholdValue).toBe(66);
  });

  it('does not enrich unknown templates', () => {
    const enriched = enrichTemplateValues('template-corporate-revolver', {
      maxLeverage: 4.5,
    });
    // Should just pass through values unchanged
    expect(enriched.maxLeverage).toBe(4.5);
  });
});

// =============================================================================
// GENERATE FROM TEMPLATE TESTS
// =============================================================================

describe('generateFromTemplate', () => {
  it('returns null for unknown template', () => {
    const result = generateFromTemplate('nonexistent', {});
    expect(result).toBeNull();
  });

  it('returns code and template name', () => {
    const result = generateFromTemplate(
      'corporate-revolver',
      getDefaultValues(corporateRevolverTemplate.form)
    );
    expect(result).not.toBeNull();
    expect(result!.code).toBeTruthy();
    expect(result!.templateName).toBe('Corporate Revolving Credit Facility');
  });

  it('generates substantial code for all templates', () => {
    for (const template of dealTemplates) {
      const defaults = getDefaultValues(template.form);
      const result = generateFromTemplate(template.id, defaults);
      expect(result).not.toBeNull();
      // Each template should generate at least 30 lines
      const lineCount = result!.code.split('\n').length;
      expect(lineCount).toBeGreaterThan(30);
    }
  });
});
