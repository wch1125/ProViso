/**
 * EXCESS_CASH_FLOW, SWEEP and the period settlement engine.
 *
 * This is the first construct set that carries state across periods, so the
 * tests care about two things beyond arithmetic: that balances roll forward
 * correctly, and that a period is priced off its OPENING leverage — otherwise
 * a repayment could move the grid that helped fund it, closing a loop inside
 * a single period.
 */

import { describe, it, expect } from 'vitest';
import { parseOrThrow } from '../src/parser.js';
import { ProVisoInterpreter } from '../src/interpreter.js';
import { validate } from '../src/validator.js';
import { compileToState, diffStates } from '../src/hub/versioning/index.js';

const DEAL = `
  PRICING_GRID SeniorPricing
    BASED_ON NetLeverage
    WHEN >= 5.00x MARGIN 4.50%
    WHEN >= 4.00x MARGIN 4.25%
    WHEN >= 3.00x MARGIN 4.00%
    OTHERWISE MARGIN 3.75%

  FACILITY Senior
    BENCHMARK 5.00%
    TRANCHE TermLoanB
      TYPE TERM_LOAN_B
      COMMITMENT $500_000_000
      PRICING SeniorPricing
      AMORTIZATION 1%

  DEFINE EBITDA AS ebitda
  DEFINE NetLeverage AS NetDebt / EBITDA

  EXCESS_CASH_FLOW AnnualECF
    STARTING_FROM operating_cash_flow
    LESS capex
    LESS cash_taxes

  SWEEP ECFSweep
    OF AnnualECF
    APPLIED_TO TermLoanB
    BASED_ON NetLeverage
    WHEN >= 4.00x SWEEP 75%
    WHEN >= 3.00x SWEEP 50%
    OTHERWISE SWEEP 25%
`;

async function deal(financials: Record<string, number> = {}) {
  const interpreter = new ProVisoInterpreter(await parseOrThrow(DEAL));
  interpreter.loadFinancials({
    ebitda: 100_000_000,
    operating_cash_flow: 90_000_000,
    capex: 20_000_000,
    cash_taxes: 15_000_000,
    ...financials,
  });
  return interpreter;
}

// =============================================================================
// EXCESS CASH FLOW
// =============================================================================

describe('EXCESS_CASH_FLOW', () => {
  it('should subtract each deduction from the starting figure', async () => {
    const ecf = (await deal()).getExcessCashFlow('AnnualECF');

    // 90M − 20M − 15M
    expect(ecf.startingValue).toBe(90_000_000);
    expect(ecf.result).toBe(55_000_000);
  });

  it('should report the deductions line by line', async () => {
    const ecf = (await deal()).getExcessCashFlow('AnnualECF');

    expect(ecf.deductions.map((d) => d.label)).toEqual(['capex', 'cash_taxes']);
    expect(ecf.deductions[0]?.amount).toBe(20_000_000);
  });

  it('should floor at zero when deductions exceed the starting figure', async () => {
    // A cash shortfall is not a negative prepayment.
    const ecf = (await deal({ operating_cash_flow: 10_000_000 })).getExcessCashFlow('AnnualECF');

    expect(ecf.result).toBe(0);
  });

  it('should treat an unresolvable deduction as zero rather than throwing', async () => {
    const ast = await parseOrThrow(`
      EXCESS_CASH_FLOW E
        STARTING_FROM operating_cash_flow
        LESS not_supplied
    `);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials({ operating_cash_flow: 50_000_000 });

    expect(interpreter.getExcessCashFlow('E').result).toBe(50_000_000);
  });

  it('should throw a clear error for an unknown ECF', async () => {
    const interpreter = await deal();
    expect(() => interpreter.getExcessCashFlow('Nope')).toThrow(/Unknown excess cash flow/);
  });
});

// =============================================================================
// SETTLEMENT — one period
// =============================================================================

describe('Period settlement — a single period', () => {
  it('should price the period off its opening leverage', async () => {
    const settlement = (await deal()).settlePeriod({ period: '2026' });

    // Opens at 500M / 100M = 5.00x, so the top grid level applies even though
    // the period's own repayments will reduce leverage by its close.
    expect(settlement.openingLeverage).toBeCloseTo(5.0, 10);
    expect(settlement.applicableMargin).toBeCloseTo(4.5, 10);
  });

  it('should accrue interest on the opening balance at the opening margin', async () => {
    const settlement = (await deal()).settlePeriod({ period: '2026' });

    // 500M × (5.00% benchmark + 4.50% margin)
    expect(settlement.interest).toBeCloseTo(47_500_000, 2);
  });

  it('should pay scheduled amortization', async () => {
    const settlement = (await deal()).settlePeriod({ period: '2026' });

    // 500M commitment × 1%
    expect(settlement.scheduledAmortization).toBeCloseTo(5_000_000, 2);
  });

  it('should sweep the stepped percentage of ECF', async () => {
    const settlement = (await deal()).settlePeriod({ period: '2026' });

    // 5.00x leverage → 75% of 55M ECF
    expect(settlement.sweeps[0]?.percentage).toBeCloseTo(75, 10);
    expect(settlement.sweeps[0]?.applied).toBeCloseTo(41_250_000, 2);
  });

  it('should close at opening debt less all principal repaid', async () => {
    const settlement = (await deal()).settlePeriod({ period: '2026' });

    expect(settlement.principalRepaid).toBeCloseTo(46_250_000, 2);
    expect(settlement.closingDebt).toBeCloseTo(453_750_000, 2);
    expect(settlement.closingDebt).toBeCloseTo(
      settlement.openingDebt - settlement.principalRepaid,
      2
    );
  });

  it('should refuse to settle without a facility', async () => {
    const interpreter = new ProVisoInterpreter(await parseOrThrow('DEFINE X AS 1'));
    expect(() => interpreter.settlePeriod({ period: '1' })).toThrow(/no FACILITY/);
  });
});

// =============================================================================
// SETTLEMENT — the de-levering narrative across periods
// =============================================================================

describe('Period settlement — across periods', () => {
  it('should roll balances forward between periods', async () => {
    const interpreter = await deal();
    const first = interpreter.settlePeriod({ period: '2026' });
    const second = interpreter.settlePeriod({ period: '2027' });

    expect(second.openingDebt).toBeCloseTo(first.closingDebt, 2);
  });

  it('should step the margin down as the credit de-levers', async () => {
    const interpreter = await deal();
    const periods = interpreter.settlePeriods(
      ['2026', '2027', '2028', '2029'].map((period) => ({ period }))
    );

    const margins = periods.map((p) => p.applicableMargin);
    expect(margins[0]).toBeCloseTo(4.5, 10);
    // Every later margin is no higher than the one before it.
    for (let i = 1; i < margins.length; i++) {
      expect(margins[i]!).toBeLessThanOrEqual(margins[i - 1]!);
    }
    expect(margins[margins.length - 1]!).toBeLessThan(margins[0]!);
  });

  it('should reduce interest as the margin and balance fall', async () => {
    const interpreter = await deal();
    const periods = interpreter.settlePeriods(
      ['2026', '2027', '2028', '2029'].map((period) => ({ period }))
    );

    for (let i = 1; i < periods.length; i++) {
      expect(periods[i]!.interest).toBeLessThan(periods[i - 1]!.interest);
    }
  });

  it('should step the sweep percentage down as leverage falls — the self-damping feedback', async () => {
    const interpreter = await deal();
    const periods = interpreter.settlePeriods(
      ['2026', '2027', '2028', '2029'].map((period) => ({ period }))
    );

    const first = periods[0]?.sweeps[0]?.percentage;
    const last = periods[periods.length - 1]?.sweeps[0]?.percentage;

    expect(first).toBeCloseTo(75, 10);
    expect(last!).toBeLessThan(first!);
  });

  it('should leave debt monotonically falling', async () => {
    const interpreter = await deal();
    const periods = interpreter.settlePeriods(
      ['2026', '2027', '2028', '2029'].map((period) => ({ period }))
    );

    for (let i = 1; i < periods.length; i++) {
      expect(periods[i]!.closingDebt).toBeLessThan(periods[i - 1]!.closingDebt);
    }
  });

  it('should make rolled-forward debt visible to covenants', async () => {
    const interpreter = await deal();
    const before = interpreter.evaluate('NetLeverage');
    interpreter.settlePeriod({ period: '2026' });
    const after = interpreter.evaluate('NetLeverage');

    expect(before).toBeCloseTo(5.0, 10);
    expect(after).toBeLessThan(before);
  });

  it('should restore drafted balances on reset', async () => {
    const interpreter = await deal();
    interpreter.settlePeriod({ period: '2026' });
    interpreter.resetTrancheBalances();

    expect(interpreter.evaluate('NetLeverage')).toBeCloseTo(5.0, 10);
  });
});

// =============================================================================
// EDGE CASES — the hostile-question surface
// =============================================================================

describe('Period settlement — edge cases', () => {
  it('should never repay more than the outstanding balance', async () => {
    // Enormous ECF against a small balance.
    const interpreter = await deal({ operating_cash_flow: 5_000_000_000 });
    const settlement = interpreter.settlePeriod({ period: '2026' });

    expect(settlement.closingDebt).toBeGreaterThanOrEqual(0);
    expect(settlement.principalRepaid).toBeLessThanOrEqual(settlement.openingDebt);
  });

  it('should settle to zero and stay there', async () => {
    const interpreter = await deal({ operating_cash_flow: 5_000_000_000 });
    interpreter.settlePeriod({ period: '2026' });
    const second = interpreter.settlePeriod({ period: '2027' });

    expect(second.closingDebt).toBe(0);
    expect(second.sweeps[0]?.applied).toBe(0);
  });

  it('should sweep nothing when there is no excess cash', async () => {
    const settlement = (await deal({ operating_cash_flow: 1_000_000 })).settlePeriod({
      period: '2026',
    });

    expect(settlement.ecf?.result).toBe(0);
    expect(settlement.sweeps[0]?.applied).toBe(0);
  });

  it('should apply a sweep across tranches in the order named', async () => {
    const ast = await parseOrThrow(`
      FACILITY Senior
        TRANCHE First
          TYPE TERM_LOAN_B
          COMMITMENT $10_000_000
        TRANCHE Second
          TYPE TERM_LOAN_A
          COMMITMENT $50_000_000

      EXCESS_CASH_FLOW E
        STARTING_FROM operating_cash_flow

      SWEEP S
        OF E
        APPLIED_TO First, Second
        OTHERWISE SWEEP 100%
    `);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials({ operating_cash_flow: 25_000_000 });

    const settlement = interpreter.settlePeriod({ period: '1' });
    const applications = settlement.sweeps[0]?.applications ?? [];

    // First is exhausted before Second is touched.
    expect(applications[0]).toMatchObject({ tranche: 'First', amount: 10_000_000, balanceAfter: 0 });
    expect(applications[1]).toMatchObject({ tranche: 'Second', amount: 15_000_000 });
  });

  it('should settle a facility with no sweep at all', async () => {
    const ast = await parseOrThrow(`
      FACILITY Senior
        TRANCHE T
          TYPE TERM_LOAN_A
          COMMITMENT $100_000_000
          MARGIN 4.00%
          AMORTIZATION 10%
    `);
    const settlement = new ProVisoInterpreter(ast).settlePeriod({ period: '1' });

    expect(settlement.sweeps).toHaveLength(0);
    expect(settlement.scheduledAmortization).toBeCloseTo(10_000_000, 2);
    expect(settlement.closingDebt).toBeCloseTo(90_000_000, 2);
  });
});

// =============================================================================
// VALIDATION
// =============================================================================

describe('SWEEP — validation', () => {
  it('should error when APPLIED_TO names an unknown tranche', async () => {
    const result = validate(
      await parseOrThrow(`
        FACILITY Senior
          TRANCHE Real
            TYPE TERM_LOAN_B
            COMMITMENT $1_000_000
        EXCESS_CASH_FLOW E
          STARTING_FROM cash
        SWEEP S
          OF E
          APPLIED_TO Imaginary
          OTHERWISE SWEEP 50%
      `)
    );

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.reference === 'Imaginary')).toBe(true);
  });

  it('should error when a sweep applies to nothing', async () => {
    const result = validate(
      await parseOrThrow(`
        EXCESS_CASH_FLOW E
          STARTING_FROM cash
        SWEEP S
          OF E
          OTHERWISE SWEEP 50%
      `)
    );

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /APPLIED_TO/.test(e.message))).toBe(true);
  });

  it('should warn when the source is neither an ECF nor a DEFINE', async () => {
    const result = validate(
      await parseOrThrow(`
        FACILITY Senior
          TRANCHE T
            TYPE TERM_LOAN_B
            COMMITMENT $1_000_000
        SWEEP S
          OF NoSuchSource
          APPLIED_TO T
          OTHERWISE SWEEP 50%
      `)
    );

    expect(result.warnings.some((w) => w.reference === 'NoSuchSource')).toBe(true);
  });

  it('should error when OTHERWISE is not the last sweep level', async () => {
    const result = validate(
      await parseOrThrow(`
        FACILITY Senior
          TRANCHE T
            TYPE TERM_LOAN_B
            COMMITMENT $1_000_000
        EXCESS_CASH_FLOW E
          STARTING_FROM cash
        SWEEP S
          OF E
          APPLIED_TO T
          BASED_ON Lev
          OTHERWISE SWEEP 25%
          WHEN >= 4.00x SWEEP 75%
        DEFINE Lev AS 1
      `)
    );

    expect(result.valid).toBe(false);
  });

  it('should accept a well-formed sweep', async () => {
    expect(validate(await parseOrThrow(DEAL)).valid).toBe(true);
  });
});

// =============================================================================
// DIFF COVERAGE — a repricing of the sweep must not read as "no change"
// =============================================================================

describe('SWEEP and ECF — diff coverage', () => {
  async function diff(fromCode: string, toCode: string) {
    return diffStates(await compileToState(fromCode), await compileToState(toCode));
  }

  function fields(result: { diffs: Array<{ fieldChanges: Array<{ field: string }> }> }): string[] {
    return result.diffs.flatMap((d) => d.fieldChanges.map((f) => f.field));
  }

  it('should detect a changed sweep percentage', async () => {
    const result = await diff(DEAL, DEAL.replace('SWEEP 75%', 'SWEEP 50%'));
    expect(fields(result)).toContain('level.1');
  });

  it('should detect a change to the tranches swept', async () => {
    const result = await diff(
      DEAL,
      DEAL.replace('APPLIED_TO TermLoanB', 'APPLIED_TO TermLoanB, TermLoanB')
    );
    expect(fields(result)).toContain('appliedTo');
  });

  it('should detect an added ECF deduction', async () => {
    const result = await diff(
      DEAL,
      DEAL.replace('LESS cash_taxes', 'LESS cash_taxes\n    LESS permitted_items')
    );
    expect(fields(result).some((f) => f.startsWith('deduction.'))).toBe(true);
  });

  it('should detect a changed ECF starting point', async () => {
    const result = await diff(
      DEAL,
      DEAL.replace('STARTING_FROM operating_cash_flow', 'STARTING_FROM ebitda')
    );
    expect(fields(result)).toContain('startingFrom');
  });

  it('should report no change when nothing moved', async () => {
    const result = await diff(DEAL, DEAL);
    expect(result.diffs).toHaveLength(0);
  });
});
