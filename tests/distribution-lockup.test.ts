/**
 * DISTRIBUTION_LOCKUP — the project-finance distribution test.
 *
 * What separates a lock-up from an ordinary gated waterfall tier is where the
 * money goes: blocked cash is *trapped* in a named reserve rather than left in
 * the remainder for junior tiers. These tests pin both the conditions and the
 * trap, and they check that a failing test reports every reason rather than
 * just the first — a sponsor asking "why can't I distribute?" needs all of it.
 */

import { describe, it, expect } from 'vitest';
import { parseOrThrow } from '../src/parser.js';
import { ProVisoInterpreter } from '../src/interpreter.js';
import { validate } from '../src/validator.js';
import { compileToState, diffStates } from '../src/hub/versioning/index.js';

const PROJECT = `
  DEFINE CFADS AS revenue - opex
  DEFINE HistoricalDSCR AS CFADS / debt_service
  DEFINE ProjectedDSCR AS projected_cfads / debt_service

  RESERVE DebtServiceReserve
    TARGET 30_000_000
    MINIMUM 15_000_000

  RESERVE LockupReserve
    TARGET 100_000_000
    MINIMUM 0

  DISTRIBUTION_LOCKUP SponsorDistributions
    TEST HistoricalDSCR >= 1.20x
    TEST ProjectedDSCR >= 1.20x
    RESERVES_FUNDED DebtServiceReserve
    NO_DEFAULT
    TRAP_TO LockupReserve

  WATERFALL Operating
    FREQUENCY quarterly
    TIER 1 "Debt Service"
      PAY 40_000_000
      FROM Revenue
    TIER 2 "Distributions"
      PAY 25_000_000
      FROM REMAINDER
      SUBJECT_TO_LOCKUP SponsorDistributions
`;

const HEALTHY = {
  revenue: 90_000_000,
  opex: 30_000_000,
  debt_service: 40_000_000,
  projected_cfads: 60_000_000,
};

async function project(
  financials: Record<string, number> = {},
  dsraBalance = 30_000_000
) {
  const interpreter = new ProVisoInterpreter(await parseOrThrow(PROJECT));
  interpreter.loadFinancials({ ...HEALTHY, ...financials });
  interpreter.setReserveBalance('DebtServiceReserve', dsraBalance);
  interpreter.setReserveBalance('LockupReserve', 0);
  return interpreter;
}

// =============================================================================
// CONDITIONS
// =============================================================================

describe('DISTRIBUTION_LOCKUP — conditions', () => {
  it('should release when every condition holds', async () => {
    const result = (await project()).checkDistributionLockup('SponsorDistributions');

    expect(result.released).toBe(true);
    expect(result.failedConditions).toHaveLength(0);
  });

  it('should lock when historical DSCR falls short', async () => {
    // CFADS 42M / 40M = 1.05x
    const result = (await project({ revenue: 72_000_000 })).checkDistributionLockup(
      'SponsorDistributions'
    );

    expect(result.released).toBe(false);
    expect(result.failedConditions.some((c) => /HistoricalDSCR/.test(c))).toBe(true);
  });

  it('should lock when projected DSCR falls short', async () => {
    const result = (await project({ projected_cfads: 40_000_000 })).checkDistributionLockup(
      'SponsorDistributions'
    );

    expect(result.released).toBe(false);
    expect(result.failedConditions.some((c) => /ProjectedDSCR/.test(c))).toBe(true);
  });

  it('should lock when a required reserve is underfunded', async () => {
    const result = (await project({}, 18_000_000)).checkDistributionLockup('SponsorDistributions');

    expect(result.released).toBe(false);
    expect(result.failedConditions.some((c) => /DebtServiceReserve/.test(c))).toBe(true);
  });

  it('should lock while an event of default subsists', async () => {
    const interpreter = await project();
    interpreter.setEventDefault('EventOfDefault');

    const result = interpreter.checkDistributionLockup('SponsorDistributions');
    expect(result.released).toBe(false);
    expect(result.failedConditions.some((c) => /default/i.test(c))).toBe(true);
  });

  it('should report every failing condition, not just the first', async () => {
    const result = (
      await project({ revenue: 72_000_000, projected_cfads: 40_000_000 }, 18_000_000)
    ).checkDistributionLockup('SponsorDistributions');

    // Both DSCR tests and the reserve test.
    expect(result.failedConditions.length).toBe(3);
  });

  it('should report the actual and threshold for a ratio test', async () => {
    const result = (await project()).checkDistributionLockup('SponsorDistributions');
    const dscr = result.conditions.find((c) => /HistoricalDSCR/.test(c.description));

    expect(dscr?.actual).toBeCloseTo(1.5, 10);
    expect(dscr?.threshold).toBeCloseTo(1.2, 10);
  });

  it('should fail closed when a test cannot be evaluated', async () => {
    // A figure the engine cannot compute must not release cash.
    const interpreter = new ProVisoInterpreter(await parseOrThrow(PROJECT));
    interpreter.loadFinancials({ revenue: 90_000_000, opex: 30_000_000 });
    interpreter.setReserveBalance('DebtServiceReserve', 30_000_000);

    expect(interpreter.checkDistributionLockup('SponsorDistributions').released).toBe(false);
  });

  it('should throw a clear error for an unknown lock-up', async () => {
    const interpreter = await project();
    expect(() => interpreter.checkDistributionLockup('Nope')).toThrow(/Unknown distribution lockup/);
  });
});

// =============================================================================
// THE TRAP — what makes this more than a gated tier
// =============================================================================

describe('DISTRIBUTION_LOCKUP — cash trap', () => {
  it('should pay distributions through when released', async () => {
    const interpreter = await project();
    const result = interpreter.executeWaterfall('Operating', 100_000_000);
    const distributions = result.tiers[1];

    expect(distributions?.blocked).toBe(false);
    expect(distributions?.paid).toBe(25_000_000);
    expect(interpreter.getReserveStatus('LockupReserve').balance).toBe(0);
  });

  it('should trap blocked cash in the named reserve', async () => {
    const interpreter = await project({ revenue: 72_000_000 });
    const result = interpreter.executeWaterfall('Operating', 100_000_000);
    const distributions = result.tiers[1];

    expect(distributions?.blocked).toBe(true);
    expect(distributions?.trapped).toBe(25_000_000);
    expect(distributions?.trappedTo).toBe('LockupReserve');
    expect(interpreter.getReserveStatus('LockupReserve').balance).toBe(25_000_000);
  });

  it('should explain why the tier was blocked', async () => {
    const interpreter = await project({}, 18_000_000);
    const result = interpreter.executeWaterfall('Operating', 100_000_000);

    expect(result.tiers[1]?.blockReason).toMatch(/lock-up/i);
    expect(result.tiers[1]?.blockReason).toMatch(/DebtServiceReserve/);
  });

  it('should not trap more than the cash available at that tier', async () => {
    // Only 10M reaches the distribution tier after debt service.
    const interpreter = await project({ revenue: 72_000_000 });
    const result = interpreter.executeWaterfall('Operating', 50_000_000);
    const distributions = result.tiers[1];

    expect(distributions?.trapped).toBe(10_000_000);
    expect(interpreter.getReserveStatus('LockupReserve').balance).toBe(10_000_000);
  });

  it('should keep the waterfall arithmetic consistent when trapping', async () => {
    const interpreter = await project({ revenue: 72_000_000 });
    const result = interpreter.executeWaterfall('Operating', 100_000_000);

    // Trapped cash leaves the waterfall, so it is distributed, not remaining.
    expect(result.remainder).toBeGreaterThanOrEqual(0);
    expect(result.totalDistributed).toBe(
      result.tiers.reduce((sum, t) => sum + t.paid, 0)
    );
  });

  it('should leave cash in the remainder when no trap reserve is declared', async () => {
    const source = PROJECT.replace('    TRAP_TO LockupReserve\n', '');
    const interpreter = new ProVisoInterpreter(await parseOrThrow(source));
    interpreter.loadFinancials({ ...HEALTHY, revenue: 72_000_000 });
    interpreter.setReserveBalance('DebtServiceReserve', 30_000_000);

    const result = interpreter.executeWaterfall('Operating', 100_000_000);
    expect(result.tiers[1]?.trapped).toBe(0);
    expect(result.remainder).toBe(60_000_000);
  });
});

// =============================================================================
// VALIDATION
// =============================================================================

describe('DISTRIBUTION_LOCKUP — validation', () => {
  it('should accept a well-formed lock-up', async () => {
    expect(validate(await parseOrThrow(PROJECT)).valid).toBe(true);
  });

  it('should error when TRAP_TO names an undeclared reserve', async () => {
    const result = validate(
      await parseOrThrow(`
        DISTRIBUTION_LOCKUP L
          TEST dscr >= 1.20x
          TRAP_TO NoSuchReserve
      `)
    );

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.reference === 'NoSuchReserve')).toBe(true);
  });

  it('should error when RESERVES_FUNDED names an undeclared reserve', async () => {
    const result = validate(
      await parseOrThrow(`
        DISTRIBUTION_LOCKUP L
          TEST dscr >= 1.20x
          RESERVES_FUNDED Imaginary
      `)
    );

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.reference === 'Imaginary')).toBe(true);
  });

  it('should error when a tier references an undeclared lock-up', async () => {
    const result = validate(
      await parseOrThrow(`
        WATERFALL W
          FREQUENCY quarterly
          TIER 1 "Distributions"
            PAY 1_000_000
            FROM Revenue
            SUBJECT_TO_LOCKUP NoSuchLockup
      `)
    );

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.reference === 'NoSuchLockup')).toBe(true);
  });

  it('should warn when a lock-up has no trap reserve', async () => {
    const result = validate(
      await parseOrThrow(`
        DISTRIBUTION_LOCKUP L
          TEST dscr >= 1.20x
      `)
    );

    expect(result.warnings.some((w) => /no TRAP_TO/.test(w.message))).toBe(true);
  });

  it('should warn when a lock-up declares no conditions at all', async () => {
    const result = validate(
      await parseOrThrow(`
        RESERVE R
          TARGET 1_000_000
        DISTRIBUTION_LOCKUP L
          TRAP_TO R
      `)
    );

    expect(result.warnings.some((w) => /no conditions/.test(w.message))).toBe(true);
  });
});

// =============================================================================
// DIFF COVERAGE
// =============================================================================

describe('DISTRIBUTION_LOCKUP — diff coverage', () => {
  it('should detect a changed DSCR threshold', async () => {
    const from = await compileToState(PROJECT);
    const to = await compileToState(PROJECT.replace('HistoricalDSCR >= 1.20x', 'HistoricalDSCR >= 1.35x'));
    const result = diffStates(from, to);

    expect(result.diffs.length).toBeGreaterThan(0);
  });

  it('should report no change when the lock-up is untouched', async () => {
    const result = diffStates(await compileToState(PROJECT), await compileToState(PROJECT));
    expect(result.diffs).toHaveLength(0);
  });
});
