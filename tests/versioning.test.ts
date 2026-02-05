/**
 * ProViso Hub v2.0 — Versioning Tests
 *
 * Tests for state diffing, change classification, and change log generation.
 */

import { describe, it, expect } from 'vitest';
import {
  compileToState,
  diffStates,
  expressionToString,
  classifyChange,
  classifyImpact,
  generateTitleAndDescription,
  generateChangeSummary,
  generateChangeLog,
} from '../src/hub/versioning/index.js';
import type { DealVersion } from '../src/hub/types.js';
import type { ElementDiff } from '../src/hub/versioning/differ.js';

// =============================================================================
// STATE COMPILATION
// =============================================================================

describe('State Compilation', () => {
  it('should compile empty code to empty state', async () => {
    const state = await compileToState('');
    expect(state.parseError).toBeNull();
    expect(state.definitions.size).toBe(0);
    expect(state.covenants.size).toBe(0);
  });

  it('should extract definitions', async () => {
    const code = `
      DEFINE EBITDA AS Revenue - Expenses
      DEFINE TotalDebt AS SeniorDebt + SubDebt
    `;
    const state = await compileToState(code);

    expect(state.parseError).toBeNull();
    expect(state.definitions.size).toBe(2);
    expect(state.definitions.has('EBITDA')).toBe(true);
    expect(state.definitions.has('TotalDebt')).toBe(true);
  });

  it('should extract covenants', async () => {
    const code = `
      COVENANT MaxLeverage
        REQUIRES Leverage <= 5.0
        TESTED QUARTERLY
    `;
    const state = await compileToState(code);

    expect(state.parseError).toBeNull();
    expect(state.covenants.size).toBe(1);
    expect(state.covenants.has('MaxLeverage')).toBe(true);
  });

  it('should extract baskets', async () => {
    const code = `
      BASKET Investments
        CAPACITY $50_000_000

      BASKET Acquisitions
        CAPACITY GreaterOf($25_000_000, 10% * EBITDA)
        FLOOR $20_000_000
    `;
    const state = await compileToState(code);

    expect(state.parseError).toBeNull();
    expect(state.baskets.size).toBe(2);
    expect(state.baskets.has('Investments')).toBe(true);
    expect(state.baskets.has('Acquisitions')).toBe(true);
  });

  it('should report parse errors', async () => {
    const code = 'INVALID SYNTAX HERE!!!';
    const state = await compileToState(code);

    expect(state.parseError).not.toBeNull();
  });

  it('should extract phases', async () => {
    const code = `
      PHASE Construction
        UNTIL COD_Achieved
        COVENANTS SUSPENDED MaxLeverage
    `;
    const state = await compileToState(code);

    expect(state.parseError).toBeNull();
    expect(state.phases.size).toBe(1);
    expect(state.phases.has('Construction')).toBe(true);
  });

  it('should extract milestones', async () => {
    const code = `
      MILESTONE FoundationComplete
        TARGET 2026-06-01
        LONGSTOP 2026-09-01
    `;
    const state = await compileToState(code);

    expect(state.parseError).toBeNull();
    expect(state.milestones.size).toBe(1);
    expect(state.milestones.has('FoundationComplete')).toBe(true);
  });

  it('should extract reserves', async () => {
    const code = `
      RESERVE DebtService
        TARGET $5_000_000
        MINIMUM $2_500_000
    `;
    const state = await compileToState(code);

    expect(state.parseError).toBeNull();
    expect(state.reserves.size).toBe(1);
    expect(state.reserves.has('DebtService')).toBe(true);
  });
});

// =============================================================================
// STATE DIFFING
// =============================================================================

describe('State Diffing', () => {
  it('should detect no changes between identical states', async () => {
    const code = 'COVENANT Test REQUIRES X <= 5';
    const from = await compileToState(code);
    const to = await compileToState(code);

    const result = diffStates(from, to);

    expect(result.success).toBe(true);
    expect(result.diffs).toHaveLength(0);
    expect(result.stats.totalChanges).toBe(0);
  });

  it('should detect added covenants', async () => {
    const fromCode = 'COVENANT A REQUIRES X <= 5';
    const toCode = `
      COVENANT A REQUIRES X <= 5
      COVENANT B REQUIRES Y >= 2
    `;

    const from = await compileToState(fromCode);
    const to = await compileToState(toCode);
    const result = diffStates(from, to);

    expect(result.success).toBe(true);
    expect(result.diffs).toHaveLength(1);
    expect(result.diffs[0].changeType).toBe('added');
    expect(result.diffs[0].elementName).toBe('B');
    expect(result.stats.added).toBe(1);
  });

  it('should detect removed covenants', async () => {
    const fromCode = `
      COVENANT A REQUIRES X <= 5
      COVENANT B REQUIRES Y >= 2
    `;
    const toCode = 'COVENANT A REQUIRES X <= 5';

    const from = await compileToState(fromCode);
    const to = await compileToState(toCode);
    const result = diffStates(from, to);

    expect(result.success).toBe(true);
    expect(result.diffs).toHaveLength(1);
    expect(result.diffs[0].changeType).toBe('removed');
    expect(result.diffs[0].elementName).toBe('B');
    expect(result.stats.removed).toBe(1);
  });

  it('should detect modified covenant threshold', async () => {
    const fromCode = 'COVENANT MaxLev REQUIRES Leverage <= 5.0';
    const toCode = 'COVENANT MaxLev REQUIRES Leverage <= 5.5';

    const from = await compileToState(fromCode);
    const to = await compileToState(toCode);
    const result = diffStates(from, to);

    expect(result.success).toBe(true);
    expect(result.diffs).toHaveLength(1);
    expect(result.diffs[0].changeType).toBe('modified');
    expect(result.diffs[0].elementName).toBe('MaxLev');
    expect(result.diffs[0].fieldChanges.length).toBeGreaterThan(0);
    expect(result.stats.modified).toBe(1);
  });

  it('should detect modified basket capacity', async () => {
    const fromCode = 'BASKET Investments CAPACITY $25_000_000';
    const toCode = 'BASKET Investments CAPACITY $35_000_000';

    const from = await compileToState(fromCode);
    const to = await compileToState(toCode);
    const result = diffStates(from, to);

    expect(result.success).toBe(true);
    expect(result.diffs).toHaveLength(1);
    expect(result.diffs[0].changeType).toBe('modified');
    expect(result.diffs[0].fieldChanges.some((fc) => fc.field === 'capacity')).toBe(true);
  });

  it('should handle multiple changes', async () => {
    const fromCode = `
      COVENANT A REQUIRES X <= 5
      BASKET B CAPACITY $10_000_000
    `;
    const toCode = `
      COVENANT A REQUIRES X <= 6
      BASKET B CAPACITY $15_000_000
      BASKET C CAPACITY $20_000_000
    `;

    const from = await compileToState(fromCode);
    const to = await compileToState(toCode);
    const result = diffStates(from, to);

    expect(result.success).toBe(true);
    expect(result.diffs).toHaveLength(3); // A modified, B modified, C added
    expect(result.stats.totalChanges).toBe(3);
    expect(result.stats.byType.covenant).toBe(1);
    expect(result.stats.byType.basket).toBe(2);
  });

  it('should report errors for invalid from code', async () => {
    const fromCode = 'INVALID!!!';
    const toCode = 'COVENANT Test REQUIRES X <= 5';

    const from = await compileToState(fromCode);
    const to = await compileToState(toCode);
    const result = diffStates(from, to);

    expect(result.success).toBe(false);
    expect(result.fromError).not.toBeNull();
  });

  it('should report errors for invalid to code', async () => {
    const fromCode = 'COVENANT Test REQUIRES X <= 5';
    const toCode = 'INVALID!!!';

    const from = await compileToState(fromCode);
    const to = await compileToState(toCode);
    const result = diffStates(from, to);

    expect(result.success).toBe(false);
    expect(result.toError).not.toBeNull();
  });
});

// =============================================================================
// EXPRESSION TO STRING
// =============================================================================

describe('Expression to String', () => {
  it('should handle null/undefined', () => {
    expect(expressionToString(null)).toBeNull();
    expect(expressionToString(undefined)).toBeNull();
  });

  it('should handle string identifiers', () => {
    expect(expressionToString('EBITDA')).toBe('EBITDA');
  });

  it('should handle number', () => {
    expect(expressionToString(42)).toBe('42');
  });

  it('should handle currency literals', () => {
    expect(expressionToString({ type: 'Currency', value: 1000000 })).toBe('$1,000,000');
  });

  it('should handle percentage literals', () => {
    expect(expressionToString({ type: 'Percentage', value: 15 })).toBe('15%');
  });

  it('should handle ratio literals', () => {
    expect(expressionToString({ type: 'Ratio', value: 5.0 })).toBe('5x');
  });

  it('should handle binary expressions', () => {
    const expr = {
      type: 'BinaryExpression' as const,
      operator: '+' as const,
      left: 'A',
      right: 'B',
    };
    expect(expressionToString(expr)).toBe('(A + B)');
  });

  it('should handle comparison expressions', () => {
    const expr = {
      type: 'Comparison' as const,
      operator: '<=' as const,
      left: 'Leverage',
      right: { type: 'Ratio' as const, value: 5.0 },
    };
    expect(expressionToString(expr)).toBe('Leverage <= 5x');
  });

  it('should handle function calls', () => {
    const expr = {
      type: 'FunctionCall' as const,
      name: 'GreaterOf',
      arguments: [
        { type: 'Currency' as const, value: 25000000 },
        'EBITDA',
      ],
    };
    expect(expressionToString(expr)).toContain('GreaterOf');
  });
});

// =============================================================================
// CHANGE CLASSIFICATION
// =============================================================================

describe('Change Classification', () => {
  describe('Impact Classification', () => {
    it('should classify added covenant as lender favorable', () => {
      const diff: ElementDiff = {
        changeType: 'added',
        elementType: 'covenant',
        elementName: 'NewCovenant',
        fromElement: null,
        toElement: { type: 'Covenant', name: 'NewCovenant', requires: null, tested: null, cure: null, breach: null },
        fieldChanges: [],
      };

      const impact = classifyImpact(diff);
      expect(impact).toBe('lender_favorable');
    });

    it('should classify removed covenant as borrower favorable', () => {
      const diff: ElementDiff = {
        changeType: 'removed',
        elementType: 'covenant',
        elementName: 'OldCovenant',
        fromElement: { type: 'Covenant', name: 'OldCovenant', requires: null, tested: null, cure: null, breach: null },
        toElement: null,
        fieldChanges: [],
      };

      const impact = classifyImpact(diff);
      expect(impact).toBe('borrower_favorable');
    });

    it('should classify added basket as borrower favorable', () => {
      const diff: ElementDiff = {
        changeType: 'added',
        elementType: 'basket',
        elementName: 'NewBasket',
        fromElement: null,
        toElement: { type: 'Basket', name: 'NewBasket', capacity: null, plus: [], subjectTo: null, floor: null, buildsFrom: null, starting: null, maximum: null },
        fieldChanges: [],
      };

      const impact = classifyImpact(diff);
      expect(impact).toBe('borrower_favorable');
    });

    it('should classify removed basket as lender favorable', () => {
      const diff: ElementDiff = {
        changeType: 'removed',
        elementType: 'basket',
        elementName: 'OldBasket',
        fromElement: { type: 'Basket', name: 'OldBasket', capacity: null, plus: [], subjectTo: null, floor: null, buildsFrom: null, starting: null, maximum: null },
        toElement: null,
        fieldChanges: [],
      };

      const impact = classifyImpact(diff);
      expect(impact).toBe('lender_favorable');
    });
  });

  describe('Title and Description Generation', () => {
    it('should generate title for added element', () => {
      const diff: ElementDiff = {
        changeType: 'added',
        elementType: 'covenant',
        elementName: 'NewCov',
        fromElement: null,
        toElement: { type: 'Covenant', name: 'NewCov', requires: null, tested: null, cure: null, breach: null },
        fieldChanges: [],
      };

      const { title, description } = generateTitleAndDescription(diff);
      expect(title).toContain('added');
      expect(description).toContain('NewCov');
    });

    it('should generate title for removed element', () => {
      const diff: ElementDiff = {
        changeType: 'removed',
        elementType: 'basket',
        elementName: 'OldBasket',
        fromElement: { type: 'Basket', name: 'OldBasket', capacity: null, plus: [], subjectTo: null, floor: null, buildsFrom: null, starting: null, maximum: null },
        toElement: null,
        fieldChanges: [],
      };

      const { title, description } = generateTitleAndDescription(diff);
      expect(title).toContain('removed');
      expect(description).toContain('OldBasket');
    });

    it('should generate title for modified element with field changes', () => {
      const diff: ElementDiff = {
        changeType: 'modified',
        elementType: 'covenant',
        elementName: 'MaxLev',
        fromElement: { type: 'Covenant', name: 'MaxLev', requires: null, tested: null, cure: null, breach: null },
        toElement: { type: 'Covenant', name: 'MaxLev', requires: null, tested: null, cure: null, breach: null },
        fieldChanges: [{ field: 'requires', fromValue: '5.0x', toValue: '5.5x' }],
      };

      const { title } = generateTitleAndDescription(diff);
      expect(title).toContain('Threshold');
    });
  });

  describe('Full Change Classification', () => {
    it('should produce a complete Change object', () => {
      const diff: ElementDiff = {
        changeType: 'modified',
        elementType: 'basket',
        elementName: 'Investments',
        fromElement: {
          type: 'Basket',
          name: 'Investments',
          capacity: { type: 'Currency', value: 25000000 },
          plus: [],
          subjectTo: null,
          floor: null,
          buildsFrom: null,
          starting: null,
          maximum: null,
        },
        toElement: {
          type: 'Basket',
          name: 'Investments',
          capacity: { type: 'Currency', value: 35000000 },
          plus: [],
          subjectTo: null,
          floor: null,
          buildsFrom: null,
          starting: null,
          maximum: null,
        },
        fieldChanges: [
          { field: 'capacity', fromValue: '$25,000,000', toValue: '$35,000,000' },
        ],
      };

      const change = classifyChange(diff);

      expect(change.id).toBeDefined();
      expect(change.changeType).toBe('modified');
      expect(change.elementType).toBe('basket');
      expect(change.elementName).toBe('Investments');
      expect(change.title).toBeDefined();
      expect(change.description).toBeDefined();
      expect(change.impact).toBe('borrower_favorable');
    });
  });
});

// =============================================================================
// CHANGE LOG GENERATION
// =============================================================================

describe('Change Log Generation', () => {
  const makeVersion = (
    id: string,
    num: number,
    code: string,
    author: string
  ): DealVersion => ({
    id,
    dealId: 'deal-1',
    versionNumber: num,
    versionLabel: `v${num}`,
    creditLangCode: code,
    createdBy: 'user@test.com',
    authorParty: author,
    createdAt: new Date(),
    parentVersionId: null,
    status: 'draft',
    generatedWordDoc: null,
    changeSummary: null,
  });

  describe('generateChangeSummary', () => {
    it('should generate summary for versions with no changes', async () => {
      const code = 'COVENANT Test REQUIRES X <= 5';
      const v1 = makeVersion('v1', 1, code, 'Lender');
      const v2 = makeVersion('v2', 2, code, 'Borrower');

      const summary = await generateChangeSummary(v1, v2);

      expect(summary.versionFrom).toBe(1);
      expect(summary.versionTo).toBe(2);
      expect(summary.totalChanges).toBe(0);
      expect(summary.authorParty).toBe('Borrower');
    });

    it('should generate summary with change counts', async () => {
      const v1Code = 'COVENANT Test REQUIRES X <= 5';
      const v2Code = 'COVENANT Test REQUIRES X <= 6';

      const v1 = makeVersion('v1', 1, v1Code, 'Lender');
      const v2 = makeVersion('v2', 2, v2Code, 'Borrower');

      const summary = await generateChangeSummary(v1, v2);

      expect(summary.totalChanges).toBe(1);
      expect(summary.covenantChanges).toBe(1);
      expect(summary.changes).toHaveLength(1);
    });

    it('should classify impacts in summary', async () => {
      const v1Code = `
        BASKET Investments CAPACITY $25_000_000
      `;
      const v2Code = `
        BASKET Investments CAPACITY $35_000_000
        BASKET NewBasket CAPACITY $10_000_000
      `;

      const v1 = makeVersion('v1', 1, v1Code, 'Lender');
      const v2 = makeVersion('v2', 2, v2Code, 'Borrower');

      const summary = await generateChangeSummary(v1, v2);

      expect(summary.totalChanges).toBe(2);
      expect(summary.borrowerFavorable).toBeGreaterThan(0);
    });
  });

  describe('generateChangeLog', () => {
    it('should generate detailed format', async () => {
      const v1Code = 'COVENANT MaxLev REQUIRES Leverage <= 5.0';
      const v2Code = 'COVENANT MaxLev REQUIRES Leverage <= 5.5';

      const v1 = makeVersion('v1', 1, v1Code, 'Lender');
      const v2 = makeVersion('v2', 2, v2Code, 'Borrower');

      const log = await generateChangeLog({
        fromVersion: v1,
        toVersion: v2,
        includeCodeDiffs: true,
        includeImpactAnalysis: true,
        format: 'detailed',
      });

      expect(log.header.fromVersion).toBe(1);
      expect(log.header.toVersion).toBe(2);
      expect(log.text).toContain('CHANGE LOG');
      expect(log.text).toContain('MaxLev');
      expect(log.validation.valid).toBe(true);
    });

    it('should generate summary format', async () => {
      const v1Code = 'BASKET Test CAPACITY $10_000_000';
      const v2Code = 'BASKET Test CAPACITY $20_000_000';

      const v1 = makeVersion('v1', 1, v1Code, 'Lender');
      const v2 = makeVersion('v2', 2, v2Code, 'Borrower');

      const log = await generateChangeLog({
        fromVersion: v1,
        toVersion: v2,
        includeCodeDiffs: false,
        includeImpactAnalysis: false,
        format: 'summary',
      });

      expect(log.text).toContain('Change Log');
      expect(log.text).toContain('Total Changes');
    });

    it('should generate executive format', async () => {
      const v1Code = 'COVENANT A REQUIRES X <= 5';
      const v2Code = `
        COVENANT A REQUIRES X <= 6
        COVENANT B REQUIRES Y >= 2
      `;

      const v1 = makeVersion('v1', 1, v1Code, 'Lender');
      const v2 = makeVersion('v2', 2, v2Code, 'Borrower');

      const log = await generateChangeLog({
        fromVersion: v1,
        toVersion: v2,
        includeCodeDiffs: false,
        includeImpactAnalysis: true,
        format: 'executive',
      });

      expect(log.text).toContain('EXECUTIVE SUMMARY');
      expect(log.text).toContain('Key Changes');
    });

    it('should report validation errors for invalid code', async () => {
      const v1 = makeVersion('v1', 1, 'COVENANT A REQUIRES X <= 5', 'Lender');
      const v2 = makeVersion('v2', 2, 'INVALID CODE!!!', 'Borrower');

      const log = await generateChangeLog({
        fromVersion: v1,
        toVersion: v2,
        includeCodeDiffs: false,
        includeImpactAnalysis: false,
        format: 'summary',
      });

      expect(log.validation.valid).toBe(false);
      expect(log.validation.errors.length).toBeGreaterThan(0);
    });
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe('Versioning Integration', () => {
  it('should handle realistic negotiation scenario', async () => {
    const v1Code = `
      // Lender's Draft
      DEFINE EBITDA AS Revenue - Expenses
      DEFINE Leverage AS TotalDebt / EBITDA

      COVENANT MaxLeverage
        REQUIRES Leverage <= 5.00
        TESTED QUARTERLY

      COVENANT MinCoverage
        REQUIRES EBITDA / Interest >= 2.50
        TESTED QUARTERLY

      BASKET GeneralInvestments
        CAPACITY GreaterOf($25_000_000, 10% * EBITDA)
    `;

    const v2Code = `
      // Borrower's Markup
      DEFINE EBITDA AS Revenue - Expenses
      DEFINE Leverage AS TotalDebt / EBITDA

      COVENANT MaxLeverage
        REQUIRES Leverage <= 5.25
        TESTED QUARTERLY
        CURE EquityCure MAX_USES 2 OVER trailing_4_quarters MAX_AMOUNT $25_000_000

      COVENANT MinCoverage
        REQUIRES EBITDA / Interest >= 2.25
        TESTED QUARTERLY

      BASKET GeneralInvestments
        CAPACITY GreaterOf($35_000_000, 15% * EBITDA)
    `;

    const from = await compileToState(v1Code);
    const to = await compileToState(v2Code);

    expect(from.parseError).toBeNull();
    expect(to.parseError).toBeNull();

    const result = diffStates(from, to);

    expect(result.success).toBe(true);
    // Should detect: MaxLeverage modified (threshold + cure), MinCoverage modified, GeneralInvestments modified
    expect(result.stats.totalChanges).toBeGreaterThanOrEqual(3);
    expect(result.stats.byType.covenant).toBeGreaterThanOrEqual(2);
    expect(result.stats.byType.basket).toBeGreaterThanOrEqual(1);

    // Generate full change log
    const v1: DealVersion = {
      id: 'v1',
      dealId: 'd1',
      versionNumber: 1,
      versionLabel: "Lender's Draft",
      creditLangCode: v1Code,
      createdBy: 'lender@test.com',
      authorParty: 'Simpson Thacher',
      createdAt: new Date(),
      parentVersionId: null,
      status: 'sent',
      generatedWordDoc: null,
      changeSummary: null,
    };

    const v2: DealVersion = {
      id: 'v2',
      dealId: 'd1',
      versionNumber: 2,
      versionLabel: "Borrower's Markup",
      creditLangCode: v2Code,
      createdBy: 'borrower@test.com',
      authorParty: 'Davis Polk',
      createdAt: new Date(),
      parentVersionId: 'v1',
      status: 'draft',
      generatedWordDoc: null,
      changeSummary: null,
    };

    const summary = await generateChangeSummary(v1, v2);

    expect(summary.authorParty).toBe('Davis Polk');
    expect(summary.totalChanges).toBeGreaterThanOrEqual(3);
    // Basket capacity increase and loosened covenants should be borrower favorable
    expect(summary.borrowerFavorable).toBeGreaterThan(0);
  });

  it('should handle project finance phases and milestones', async () => {
    const v1Code = `
      PHASE Construction
        UNTIL COD_Achieved
        COVENANTS SUSPENDED MaxLeverage

      MILESTONE Foundation
        TARGET 2026-06-01
        LONGSTOP 2026-09-01
    `;

    const v2Code = `
      PHASE Construction
        UNTIL COD_Achieved
        COVENANTS SUSPENDED MaxLeverage, MinCoverage

      MILESTONE Foundation
        TARGET 2026-07-01
        LONGSTOP 2026-10-01
    `;

    const from = await compileToState(v1Code);
    const to = await compileToState(v2Code);

    expect(from.parseError).toBeNull();
    expect(to.parseError).toBeNull();

    const result = diffStates(from, to);

    expect(result.success).toBe(true);
    expect(result.stats.byType.phase).toBeGreaterThanOrEqual(1);
    expect(result.stats.byType.milestone).toBeGreaterThanOrEqual(1);
  });
});
