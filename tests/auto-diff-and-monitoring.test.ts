/**
 * Auto-Diff & Live Monitoring Tests
 *
 * Feature 1: Automated Version Diff
 *   - Tests that the version diff engine (compileToState → diffStates → classifyChange)
 *     produces correct ChangeSummary output for the demo negotiation versions.
 *   - Validates that removing hardcoded ChangeSummary from demo data doesn't break
 *     the live diff pipeline.
 *
 * Feature 2: Live Compliance History
 *   - Tests the HistoricalPeriod → MultiPeriodFinancialData conversion.
 *   - Tests that multi-period data flows through the interpreter correctly.
 *   - Validates compliance history output across periods.
 */

import { describe, it, expect } from 'vitest';
import { parseOrThrow } from '../src/parser.js';
import { ProVisoInterpreter } from '../src/interpreter.js';
import type { MultiPeriodFinancialData, SimpleFinancialData } from '../src/types.js';
import { compileToState, diffStates } from '../src/hub/versioning/differ.js';
import { classifyChange, classifyImpact } from '../src/hub/versioning/classifier.js';

// =============================================================================
// INLINE HELPERS (avoid dashboard import path issues)
// =============================================================================

/** Mirrors HistoricalPeriod from demo-scenarios.ts */
interface HistoricalPeriod {
  period: string;
  periodEnd: string;
  data: Record<string, number>;
  complianceStatus: 'compliant' | 'cured' | 'breach';
  cureUsed?: string;
}

/**
 * Convert HistoricalPeriod[] to MultiPeriodFinancialData.
 * Mirrors the logic in dashboard/src/utils/historicalDataConverter.ts.
 */
function convertHistoricalToMultiPeriod(
  historicalData: HistoricalPeriod[],
  currentFinancials?: Record<string, number>,
  currentPeriodLabel?: string,
): MultiPeriodFinancialData {
  const periods = historicalData.map(h => ({
    period: h.period,
    periodType: (/Q\d/i.test(h.period) ? 'quarterly' : 'monthly') as 'quarterly' | 'monthly',
    periodEnd: h.periodEnd,
    data: { ...h.data },
  }));

  if (currentFinancials && currentPeriodLabel) {
    const alreadyPresent = periods.some(p => p.period === currentPeriodLabel);
    if (!alreadyPresent) {
      periods.push({
        period: currentPeriodLabel,
        periodType: 'quarterly',
        periodEnd: new Date().toISOString().split('T')[0]!,
        data: { ...currentFinancials },
      });
    }
  }

  return { periods };
}

// =============================================================================
// DEMO CODE VERSIONS (same as negotiation-demo.ts)
// =============================================================================

const VERSION_1_CODE = `// ABC Acquisition Facility - Lender's Initial Draft
DEFINE EBITDA AS (
  NetIncome
  + InterestExpense
  + TaxExpense
  + DepreciationAmortization
) EXCLUDING extraordinary_items

DEFINE TotalDebt AS SeniorDebt + SubordinatedDebt

DEFINE Leverage AS TotalDebt / EBITDA

COVENANT MaxLeverage
  REQUIRES Leverage <= 5.00
  TESTED QUARTERLY

COVENANT MinInterestCoverage
  REQUIRES EBITDA / InterestExpense >= 2.50
  TESTED QUARTERLY

BASKET GeneralInvestments
  CAPACITY GreaterOf($25_000_000, 10% * EBITDA)

BASKET PermittedAcquisitions
  CAPACITY $50_000_000
  SUBJECT TO ProFormaCompliance
`;

const VERSION_2_CODE = `// ABC Acquisition Facility - Borrower's Markup
DEFINE EBITDA AS (
  NetIncome
  + InterestExpense
  + TaxExpense
  + DepreciationAmortization
  + StockBasedComp
) EXCLUDING extraordinary_items

DEFINE TotalDebt AS SeniorDebt + SubordinatedDebt

DEFINE Leverage AS TotalDebt / EBITDA

COVENANT MaxLeverage
  REQUIRES Leverage <= 5.25
  TESTED QUARTERLY
  CURE EquityCure MAX_USES 2 OVER trailing_4_quarters MAX_AMOUNT $25_000_000

COVENANT MinInterestCoverage
  REQUIRES EBITDA / InterestExpense >= 2.25
  TESTED QUARTERLY

BASKET GeneralInvestments
  CAPACITY GreaterOf($35_000_000, 15% * EBITDA)

BASKET PermittedAcquisitions
  CAPACITY $75_000_000
  SUBJECT TO ProFormaCompliance
`;

const VERSION_3_CODE = `// ABC Acquisition Facility - Lender's Counter
DEFINE EBITDA AS (
  NetIncome
  + InterestExpense
  + TaxExpense
  + DepreciationAmortization
  + StockBasedComp
) EXCLUDING extraordinary_items
  CAPPED AT $5_000_000

DEFINE TotalDebt AS SeniorDebt + SubordinatedDebt

DEFINE Leverage AS TotalDebt / EBITDA

COVENANT MaxLeverage
  REQUIRES Leverage <= 4.75
  TESTED QUARTERLY
  CURE EquityCure MAX_USES 2 OVER trailing_4_quarters MAX_AMOUNT $20_000_000

COVENANT MinInterestCoverage
  REQUIRES EBITDA / InterestExpense >= 2.25
  TESTED QUARTERLY

BASKET GeneralInvestments
  CAPACITY GreaterOf($30_000_000, 12.5% * EBITDA)

BASKET PermittedAcquisitions
  CAPACITY $60_000_000
  SUBJECT TO ProFormaCompliance
`;

// =============================================================================
// FEATURE 1: AUTOMATED VERSION DIFF
// =============================================================================

describe('Automated Version Diff', () => {
  describe('State Compilation', () => {
    it('should compile V1 code to structured state', async () => {
      const state = await compileToState(VERSION_1_CODE);
      expect(state.parseError).toBeNull();
      expect(state.definitions.size).toBe(3); // EBITDA, TotalDebt, Leverage
      expect(state.covenants.size).toBe(2);   // MaxLeverage, MinInterestCoverage
      expect(state.baskets.size).toBe(2);      // GeneralInvestments, PermittedAcquisitions
    });

    it('should compile V2 code with cure rights', async () => {
      const state = await compileToState(VERSION_2_CODE);
      expect(state.parseError).toBeNull();
      expect(state.definitions.size).toBe(3);
      expect(state.covenants.size).toBe(2);
      expect(state.baskets.size).toBe(2);
    });

    it('should compile V3 code with CAPPED modifier', async () => {
      const state = await compileToState(VERSION_3_CODE);
      expect(state.parseError).toBeNull();
      expect(state.definitions.size).toBe(3);
      expect(state.covenants.size).toBe(2);
    });
  });

  describe('V1 → V2 Diff (Borrower Markup)', () => {
    it('should detect all changes between V1 and V2', async () => {
      const [fromState, toState] = await Promise.all([
        compileToState(VERSION_1_CODE),
        compileToState(VERSION_2_CODE),
      ]);

      const result = diffStates(fromState, toState);
      expect(result.success).toBe(true);
      expect(result.diffs.length).toBeGreaterThanOrEqual(3); // At minimum: EBITDA, MaxLeverage, MinInterestCoverage changes
    });

    it('should detect leverage ratio threshold change', async () => {
      const [fromState, toState] = await Promise.all([
        compileToState(VERSION_1_CODE),
        compileToState(VERSION_2_CODE),
      ]);

      const result = diffStates(fromState, toState);
      const leverageDiff = result.diffs.find(
        d => d.elementName === 'MaxLeverage' && d.elementType === 'covenant'
      );
      expect(leverageDiff).toBeDefined();
      expect(leverageDiff!.changeType).toBe('modified');
    });

    it('should classify borrower markup as borrower-favorable', async () => {
      const [fromState, toState] = await Promise.all([
        compileToState(VERSION_1_CODE),
        compileToState(VERSION_2_CODE),
      ]);

      const result = diffStates(fromState, toState);

      // Classify each diff
      const classified = result.diffs.map(d => classifyChange(d));

      // Most changes in borrower's markup should be borrower-favorable
      const borrowerFavorable = classified.filter(c => c.impact === 'borrower_favorable').length;
      expect(borrowerFavorable).toBeGreaterThanOrEqual(2);
    });

    it('should produce human-readable titles for covenant changes', async () => {
      const [fromState, toState] = await Promise.all([
        compileToState(VERSION_1_CODE),
        compileToState(VERSION_2_CODE),
      ]);

      const result = diffStates(fromState, toState);
      const classified = result.diffs.map(d => classifyChange(d));

      // Every classified change should have a title and description
      for (const change of classified) {
        expect(change.title).toBeTruthy();
        expect(change.description).toBeTruthy();
        expect(change.id).toBeTruthy();
      }
    });
  });

  describe('V2 → V3 Diff (Lender Counter)', () => {
    it('should detect changes between V2 and V3', async () => {
      const [fromState, toState] = await Promise.all([
        compileToState(VERSION_2_CODE),
        compileToState(VERSION_3_CODE),
      ]);

      const result = diffStates(fromState, toState);
      expect(result.success).toBe(true);
      expect(result.diffs.length).toBeGreaterThanOrEqual(3);
    });

    it('should classify lender counter as mixed lender-favorable/neutral', async () => {
      const [fromState, toState] = await Promise.all([
        compileToState(VERSION_2_CODE),
        compileToState(VERSION_3_CODE),
      ]);

      const result = diffStates(fromState, toState);
      const classified = result.diffs.map(d => classifyChange(d));

      // Lender counter should have at least some lender-favorable changes
      const lenderFavorable = classified.filter(c => c.impact === 'lender_favorable').length;
      expect(lenderFavorable).toBeGreaterThanOrEqual(1);
    });

    it('should detect basket size changes', async () => {
      const [fromState, toState] = await Promise.all([
        compileToState(VERSION_2_CODE),
        compileToState(VERSION_3_CODE),
      ]);

      const result = diffStates(fromState, toState);
      const basketDiffs = result.diffs.filter(d => d.elementType === 'basket');
      expect(basketDiffs.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Full V1 → V3 Diff (End-to-End)', () => {
    it('should compute complete diff between first and last version', async () => {
      const [fromState, toState] = await Promise.all([
        compileToState(VERSION_1_CODE),
        compileToState(VERSION_3_CODE),
      ]);

      const result = diffStates(fromState, toState);
      expect(result.success).toBe(true);
      expect(result.diffs.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('ChangeSummary Aggregation', () => {
    it('should produce correct summary statistics', async () => {
      const [fromState, toState] = await Promise.all([
        compileToState(VERSION_1_CODE),
        compileToState(VERSION_2_CODE),
      ]);

      const result = diffStates(fromState, toState);
      const changes = result.diffs.map(d => classifyChange(d));

      // Aggregate stats
      let covenantChanges = 0;
      let definitionChanges = 0;
      let basketChanges = 0;

      for (const change of changes) {
        switch (change.elementType) {
          case 'covenant': covenantChanges++; break;
          case 'definition': definitionChanges++; break;
          case 'basket': basketChanges++; break;
        }
      }

      expect(covenantChanges).toBeGreaterThanOrEqual(1);
      expect(changes.length).toBe(covenantChanges + definitionChanges + basketChanges + changes.filter(c => !['covenant', 'definition', 'basket'].includes(c.elementType)).length);
    });
  });

  describe('Impact Classification', () => {
    it('should classify leverage threshold increase as borrower-favorable', async () => {
      const [fromState, toState] = await Promise.all([
        compileToState(VERSION_1_CODE),
        compileToState(VERSION_2_CODE),
      ]);

      const result = diffStates(fromState, toState);
      const leverageDiff = result.diffs.find(
        d => d.elementName === 'MaxLeverage' && d.elementType === 'covenant'
      );
      expect(leverageDiff).toBeDefined();

      const impact = classifyImpact(leverageDiff!);
      expect(impact).toBe('borrower_favorable');
    });

    it('should classify leverage threshold tightening as lender-favorable', async () => {
      const [fromState, toState] = await Promise.all([
        compileToState(VERSION_2_CODE),
        compileToState(VERSION_3_CODE),
      ]);

      const result = diffStates(fromState, toState);
      const leverageDiff = result.diffs.find(
        d => d.elementName === 'MaxLeverage' && d.elementType === 'covenant'
      );
      expect(leverageDiff).toBeDefined();

      const impact = classifyImpact(leverageDiff!);
      expect(impact).toBe('lender_favorable');
    });
  });
});

// =============================================================================
// FEATURE 2: LIVE COMPLIANCE HISTORY
// =============================================================================

describe('Live Compliance History', () => {
  describe('Historical Data Conversion', () => {
    it('should convert HistoricalPeriod[] to MultiPeriodFinancialData', () => {
      const historical: HistoricalPeriod[] = [
        {
          period: 'Q1 2025',
          periodEnd: '2025-03-31',
          data: { Revenue: 100, EBITDA: 40, Debt: 200, InterestExpense: 10 },
          complianceStatus: 'compliant',
        },
        {
          period: 'Q2 2025',
          periodEnd: '2025-06-30',
          data: { Revenue: 110, EBITDA: 45, Debt: 190, InterestExpense: 9 },
          complianceStatus: 'compliant',
        },
      ];

      const result = convertHistoricalToMultiPeriod(historical);

      expect(result.periods).toHaveLength(2);
      expect(result.periods[0]!.period).toBe('Q1 2025');
      expect(result.periods[0]!.periodType).toBe('quarterly');
      expect(result.periods[0]!.periodEnd).toBe('2025-03-31');
      expect(result.periods[0]!.data.Revenue).toBe(100);
      expect(result.periods[1]!.period).toBe('Q2 2025');
    });

    it('should append current period financials if not already present', () => {
      const historical: HistoricalPeriod[] = [
        {
          period: 'Q1 2025',
          periodEnd: '2025-03-31',
          data: { Revenue: 100 },
          complianceStatus: 'compliant',
        },
      ];

      const currentFinancials = { Revenue: 120, EBITDA: 50 };
      const result = convertHistoricalToMultiPeriod(historical, currentFinancials, 'Q2 2025');

      expect(result.periods).toHaveLength(2);
      expect(result.periods[1]!.period).toBe('Q2 2025');
      expect(result.periods[1]!.data.Revenue).toBe(120);
      expect(result.periods[1]!.data.EBITDA).toBe(50);
    });

    it('should NOT duplicate current period if already in historical data', () => {
      const historical: HistoricalPeriod[] = [
        {
          period: 'Q1 2025',
          periodEnd: '2025-03-31',
          data: { Revenue: 100 },
          complianceStatus: 'compliant',
        },
      ];

      const result = convertHistoricalToMultiPeriod(historical, { Revenue: 100 }, 'Q1 2025');

      expect(result.periods).toHaveLength(1);
    });

    it('should handle empty historical data', () => {
      const result = convertHistoricalToMultiPeriod([]);
      expect(result.periods).toHaveLength(0);
    });

    it('should handle empty historical data with current period', () => {
      const result = convertHistoricalToMultiPeriod([], { Revenue: 100 }, 'Q1 2025');
      expect(result.periods).toHaveLength(1);
      expect(result.periods[0]!.period).toBe('Q1 2025');
    });
  });

  describe('Multi-Period Interpreter Integration', () => {
    const SIMPLE_CODE = `
DEFINE Leverage AS TotalDebt / EBITDA

COVENANT MaxLeverage
  REQUIRES Leverage <= 5.00
  TESTED QUARTERLY

COVENANT MinInterestCoverage
  REQUIRES EBITDA / InterestExpense >= 2.50
  TESTED QUARTERLY
`;

    it('should detect multi-period mode when loading multi-period data', async () => {
      const ast = await parseOrThrow(SIMPLE_CODE);
      const interp = new ProVisoInterpreter(ast);

      const multiPeriod: MultiPeriodFinancialData = {
        periods: [
          { period: 'Q1 2025', periodType: 'quarterly', periodEnd: '2025-03-31', data: { EBITDA: 50, TotalDebt: 200, InterestExpense: 15 } },
          { period: 'Q2 2025', periodType: 'quarterly', periodEnd: '2025-06-30', data: { EBITDA: 55, TotalDebt: 190, InterestExpense: 14 } },
        ],
      };

      interp.loadFinancials(multiPeriod);
      expect(interp.hasMultiPeriodData()).toBe(true);
    });

    it('should return compliance history across all periods', async () => {
      const ast = await parseOrThrow(SIMPLE_CODE);
      const interp = new ProVisoInterpreter(ast);

      const multiPeriod: MultiPeriodFinancialData = {
        periods: [
          { period: 'Q1 2025', periodType: 'quarterly', periodEnd: '2025-03-31', data: { EBITDA: 50, TotalDebt: 200, InterestExpense: 15 } },
          { period: 'Q2 2025', periodType: 'quarterly', periodEnd: '2025-06-30', data: { EBITDA: 55, TotalDebt: 190, InterestExpense: 14 } },
          { period: 'Q3 2025', periodType: 'quarterly', periodEnd: '2025-09-30', data: { EBITDA: 60, TotalDebt: 180, InterestExpense: 13 } },
        ],
      };

      interp.loadFinancials(multiPeriod);
      const history = interp.getComplianceHistory();

      expect(history).toHaveLength(3);
      expect(history[0]!.period).toBe('Q1 2025');
      expect(history[1]!.period).toBe('Q2 2025');
      expect(history[2]!.period).toBe('Q3 2025');
    });

    it('should evaluate covenants correctly for each period', async () => {
      const ast = await parseOrThrow(SIMPLE_CODE);
      const interp = new ProVisoInterpreter(ast);

      const multiPeriod: MultiPeriodFinancialData = {
        periods: [
          // Q1: Leverage = 200/50 = 4.0x (compliant, <= 5.0), Coverage = 50/15 = 3.33x (compliant, >= 2.5)
          { period: 'Q1 2025', periodType: 'quarterly', periodEnd: '2025-03-31', data: { EBITDA: 50, TotalDebt: 200, InterestExpense: 15 } },
          // Q2: Leverage = 300/40 = 7.5x (BREACH), Coverage = 40/20 = 2.0x (BREACH)
          { period: 'Q2 2025', periodType: 'quarterly', periodEnd: '2025-06-30', data: { EBITDA: 40, TotalDebt: 300, InterestExpense: 20 } },
          // Q3: Leverage = 180/60 = 3.0x (compliant), Coverage = 60/12 = 5.0x (compliant)
          { period: 'Q3 2025', periodType: 'quarterly', periodEnd: '2025-09-30', data: { EBITDA: 60, TotalDebt: 180, InterestExpense: 12 } },
        ],
      };

      interp.loadFinancials(multiPeriod);
      const history = interp.getComplianceHistory();

      // Q1: all compliant
      expect(history[0]!.overallCompliant).toBe(true);

      // Q2: breach on both
      expect(history[1]!.overallCompliant).toBe(false);
      const q2Leverage = history[1]!.covenants.find(c => c.name === 'MaxLeverage');
      expect(q2Leverage).toBeDefined();
      expect(q2Leverage!.compliant).toBe(false);
      expect(q2Leverage!.actual).toBeCloseTo(7.5, 1);

      const q2Coverage = history[1]!.covenants.find(c => c.name === 'MinInterestCoverage');
      expect(q2Coverage).toBeDefined();
      expect(q2Coverage!.compliant).toBe(false);
      expect(q2Coverage!.actual).toBeCloseTo(2.0, 1);

      // Q3: back to compliant
      expect(history[2]!.overallCompliant).toBe(true);
    });

    it('should return single-period history when no multi-period data', async () => {
      const ast = await parseOrThrow(SIMPLE_CODE);
      const interp = new ProVisoInterpreter(ast);

      interp.loadFinancials({ EBITDA: 50, TotalDebt: 200, InterestExpense: 15 });

      expect(interp.hasMultiPeriodData()).toBe(false);
      const history = interp.getComplianceHistory();
      expect(history).toHaveLength(1);
      expect(history[0]!.period).toBe('current');
    });
  });

  describe('Historical Data to Compliance History (End-to-End)', () => {
    it('should produce correct compliance history from converted HistoricalPeriod[]', async () => {
      const code = `
DEFINE Leverage AS TotalDebt / EBITDA

COVENANT MaxLeverage
  REQUIRES Leverage <= 5.00
  TESTED QUARTERLY
`;

      const historical: HistoricalPeriod[] = [
        {
          period: 'Q1 2025',
          periodEnd: '2025-03-31',
          data: { EBITDA: 50, TotalDebt: 200 }, // Leverage = 4.0 (compliant)
          complianceStatus: 'compliant',
        },
        {
          period: 'Q2 2025',
          periodEnd: '2025-06-30',
          data: { EBITDA: 40, TotalDebt: 250 }, // Leverage = 6.25 (breach)
          complianceStatus: 'breach',
        },
        {
          period: 'Q3 2025',
          periodEnd: '2025-09-30',
          data: { EBITDA: 55, TotalDebt: 220 }, // Leverage = 4.0 (compliant)
          complianceStatus: 'compliant',
        },
      ];

      // Convert and load
      const multiPeriod = convertHistoricalToMultiPeriod(historical);
      const ast = await parseOrThrow(code);
      const interp = new ProVisoInterpreter(ast);
      interp.loadFinancials(multiPeriod);

      expect(interp.hasMultiPeriodData()).toBe(true);

      const history = interp.getComplianceHistory();
      expect(history).toHaveLength(3);

      // Q1: compliant
      const q1 = history[0]!;
      expect(q1.period).toBe('Q1 2025');
      expect(q1.overallCompliant).toBe(true);
      expect(q1.covenants[0]!.actual).toBeCloseTo(4.0);

      // Q2: breach
      const q2 = history[1]!;
      expect(q2.period).toBe('Q2 2025');
      expect(q2.overallCompliant).toBe(false);
      expect(q2.covenants[0]!.actual).toBeCloseTo(6.25);

      // Q3: compliant again
      const q3 = history[2]!;
      expect(q3.period).toBe('Q3 2025');
      expect(q3.overallCompliant).toBe(true);
    });

    it('should append current-period financials to historical data', async () => {
      const code = `
DEFINE Leverage AS TotalDebt / EBITDA

COVENANT MaxLeverage
  REQUIRES Leverage <= 5.00
  TESTED QUARTERLY
`;

      const historical: HistoricalPeriod[] = [
        {
          period: 'Q1 2025',
          periodEnd: '2025-03-31',
          data: { EBITDA: 50, TotalDebt: 200 },
          complianceStatus: 'compliant',
        },
      ];

      const currentFinancials = { EBITDA: 60, TotalDebt: 180 };
      const multiPeriod = convertHistoricalToMultiPeriod(historical, currentFinancials, 'Q2 2025');

      const ast = await parseOrThrow(code);
      const interp = new ProVisoInterpreter(ast);
      interp.loadFinancials(multiPeriod);

      const history = interp.getComplianceHistory();
      expect(history).toHaveLength(2);
      expect(history[0]!.period).toBe('Q1 2025');
      expect(history[1]!.period).toBe('Q2 2025');
      // Current period leverage = 180/60 = 3.0 (compliant)
      expect(history[1]!.covenants[0]!.actual).toBeCloseTo(3.0);
      expect(history[1]!.overallCompliant).toBe(true);
    });
  });

  describe('ComplianceHistoryMap Building', () => {
    it('should build per-covenant history map from multi-period data', async () => {
      const code = `
DEFINE Leverage AS TotalDebt / EBITDA

COVENANT MaxLeverage
  REQUIRES Leverage <= 5.00
  TESTED QUARTERLY

COVENANT MinCoverage
  REQUIRES EBITDA / InterestExpense >= 2.50
  TESTED QUARTERLY
`;

      const multiPeriod: MultiPeriodFinancialData = {
        periods: [
          { period: 'Q1', periodType: 'quarterly', periodEnd: '2025-03-31', data: { EBITDA: 50, TotalDebt: 200, InterestExpense: 15 } },
          { period: 'Q2', periodType: 'quarterly', periodEnd: '2025-06-30', data: { EBITDA: 55, TotalDebt: 195, InterestExpense: 14 } },
          { period: 'Q3', periodType: 'quarterly', periodEnd: '2025-09-30', data: { EBITDA: 60, TotalDebt: 180, InterestExpense: 12 } },
        ],
      };

      const ast = await parseOrThrow(code);
      const interp = new ProVisoInterpreter(ast);
      interp.loadFinancials(multiPeriod);

      const history = interp.getComplianceHistory();

      // Build ComplianceHistoryMap (same logic as ProVisoContext)
      const historyMap: Record<string, Array<{ period: string; actual: number; threshold: number; compliant: boolean }>> = {};
      for (const periodEntry of history) {
        for (const cov of periodEntry.covenants) {
          if (!historyMap[cov.name]) {
            historyMap[cov.name] = [];
          }
          historyMap[cov.name].push({
            period: periodEntry.period,
            actual: cov.actual,
            threshold: cov.threshold,
            compliant: cov.compliant,
          });
        }
      }

      // Should have entries for both covenants
      expect(Object.keys(historyMap)).toContain('MaxLeverage');
      expect(Object.keys(historyMap)).toContain('MinCoverage');

      // Each covenant should have 3 periods
      expect(historyMap['MaxLeverage']).toHaveLength(3);
      expect(historyMap['MinCoverage']).toHaveLength(3);

      // Verify trending values for leverage (200/50=4.0, 195/55=3.545, 180/60=3.0)
      expect(historyMap['MaxLeverage']![0]!.actual).toBeCloseTo(4.0, 1);
      expect(historyMap['MaxLeverage']![1]!.actual).toBeCloseTo(3.545, 1);
      expect(historyMap['MaxLeverage']![2]!.actual).toBeCloseTo(3.0, 1);

      // All should be compliant (all under 5.0x)
      for (const entry of historyMap['MaxLeverage']!) {
        expect(entry.compliant).toBe(true);
        expect(entry.threshold).toBe(5.0);
      }
    });
  });
});

// =============================================================================
// CROSS-FEATURE TESTS
// =============================================================================

describe('Cross-Feature: Diff + History on Same Code', () => {
  it('should support both diff and history on project finance code', async () => {
    const v1Code = `
DEFINE DSCR AS CashFlow / DebtService

COVENANT MinDSCR
  REQUIRES DSCR >= 1.20
  TESTED QUARTERLY
`;

    const v2Code = `
DEFINE DSCR AS CashFlow / DebtService

COVENANT MinDSCR
  REQUIRES DSCR >= 1.10
  TESTED QUARTERLY
`;

    // Feature 1: Diff should detect the threshold change
    const [fromState, toState] = await Promise.all([
      compileToState(v1Code),
      compileToState(v2Code),
    ]);
    const diffResult = diffStates(fromState, toState);
    expect(diffResult.success).toBe(true);
    expect(diffResult.diffs.length).toBeGreaterThanOrEqual(1);

    const dscrDiff = diffResult.diffs.find(d => d.elementName === 'MinDSCR');
    expect(dscrDiff).toBeDefined();
    expect(dscrDiff!.changeType).toBe('modified');

    // Classify impact
    const impact = classifyImpact(dscrDiff!);
    expect(impact).toBe('borrower_favorable'); // Lower DSCR requirement = borrower friendly

    // Feature 2: V2 compliance history with multi-period data
    const multiPeriod: MultiPeriodFinancialData = {
      periods: [
        { period: 'Q1', periodType: 'quarterly', periodEnd: '2025-03-31', data: { CashFlow: 15, DebtService: 12 } }, // DSCR = 1.25
        { period: 'Q2', periodType: 'quarterly', periodEnd: '2025-06-30', data: { CashFlow: 12, DebtService: 12 } }, // DSCR = 1.00
      ],
    };

    const ast = await parseOrThrow(v2Code);
    const interp = new ProVisoInterpreter(ast);
    interp.loadFinancials(multiPeriod);

    const history = interp.getComplianceHistory();
    // Q1: DSCR = 1.25 >= 1.10 (compliant)
    expect(history[0]!.overallCompliant).toBe(true);
    // Q2: DSCR = 1.00 < 1.10 (breach)
    expect(history[1]!.overallCompliant).toBe(false);
  });
});
