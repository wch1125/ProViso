/**
 * Tests for dashboard-side presentation utilities.
 *
 * These modules were previously outside the suite's reach, which is how a
 * terminal crash and a mis-scaled compliance certificate both shipped. They
 * import from '@proviso/*' as type-only, so no runtime alias is required.
 */

import { describe, it, expect } from 'vitest';
import { parseOrThrow } from '../src/parser.js';
import { ProVisoInterpreter } from '../src/interpreter.js';
import { executeCommand } from '../dashboard/src/utils/commandRunner.js';
import { generateComplianceReport } from '../dashboard/src/utils/complianceExport.js';
import {
  getThresholdZone,
  getZonePresentation,
  generateAlerts,
} from '../dashboard/src/utils/thresholds.js';
import { COVENANT_STATUS_PRIORITY } from '../dashboard/src/types/index.js';
import type { DashboardData, CovenantData, ReserveData } from '../dashboard/src/types/index.js';

// =============================================================================
// FIXTURES
// =============================================================================

function baseDashboardData(overrides: Partial<DashboardData> = {}): DashboardData {
  return {
    project: { name: 'Test Project', facility: 'Term Loan', sponsor: 'S', borrower: 'B' },
    phase: {
      current: 'Operations',
      constructionStart: '2024-01-01',
      codTarget: '2025-01-01',
      maturity: '2030-01-01',
    },
    financials: {},
    covenants: [],
    baskets: [],
    milestones: [],
    reserves: [],
    waterfall: { revenue: 0, tiers: [] },
    conditionsPrecedent: [],
    ...overrides,
  };
}

function covenant(over: Partial<CovenantData> = {}): CovenantData {
  return {
    name: 'MaxLeverage',
    actual: 3.75,
    required: 4.5,
    operator: '<=',
    compliant: true,
    headroom: 0.75,
    ...over,
  };
}

function reserve(over: Partial<ReserveData> = {}): ReserveData {
  return { name: 'DSRA', balance: 0, target: 0, minimum: 0, ...over };
}

// =============================================================================
// TERMINAL: BASKET BAR RENDERING
// =============================================================================

describe('Demo terminal — baskets command', () => {
  async function interpreterWithBasket(capacity: string, used: number) {
    const ast = await parseOrThrow(`BASKET GeneralInvestments CAPACITY ${capacity}`);
    const interpreter = new ProVisoInterpreter(ast);
    if (used > 0) {
      interpreter.useBasket('GeneralInvestments', used);
    }
    return interpreter;
  }

  it('should render a basket under capacity without throwing', async () => {
    const interpreter = await interpreterWithBasket('$100_000_000', 25_000_000);
    const result = executeCommand('baskets', interpreter);

    expect(result.type).not.toBe('error');
    expect(result.output).toContain('GeneralInvestments');
    expect(result.output).toContain('25%');
  });

  /**
   * Over-utilization is reachable through a grower basket: capacity tracks a
   * financial metric, so a drop in EBITDA after a draw leaves used > capacity.
   * useBasket itself refuses to over-draw, so this is the realistic path.
   */
  async function interpreterWithShrunkGrowerBasket() {
    const ast = await parseOrThrow(`
      DEFINE EBITDA AS ebitda
      BASKET GeneralInvestments
        CAPACITY 15% * EBITDA
    `);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials({ ebitda: 1_000_000_000 }); // capacity $150M
    interpreter.useBasket('GeneralInvestments', 100_000_000);
    interpreter.loadFinancials({ ebitda: 100_000_000 }); // capacity falls to $15M
    return interpreter;
  }

  it('should not throw on an over-utilized basket', async () => {
    // Regression: repeat() received a negative count once used > capacity,
    // killing the whole terminal command with a RangeError.
    const interpreter = await interpreterWithShrunkGrowerBasket();

    expect(() => executeCommand('baskets', interpreter)).not.toThrow();
    const result = executeCommand('baskets', interpreter);
    expect(result.type).not.toBe('error');
    expect(result.output).toContain('GeneralInvestments');
  });

  it('should clamp the bar to its full width when over-utilized', async () => {
    const interpreter = await interpreterWithShrunkGrowerBasket();
    const result = executeCommand('baskets', interpreter);

    // 20-wide bar, fully filled, no stray padding.
    expect(result.output).toContain(`[${'='.repeat(20)}]`);
  });

  it('should not throw on a zero-capacity basket', async () => {
    const interpreter = await interpreterWithBasket('$0', 0);

    expect(() => executeCommand('baskets', interpreter)).not.toThrow();
    const result = executeCommand('baskets', interpreter);
    expect(result.output).not.toContain('Infinity');
    expect(result.output).not.toContain('NaN');
  });

  it('should keep the bar and the percentage consistent', async () => {
    const interpreter = await interpreterWithBasket('$100_000_000', 50_000_000);
    const result = executeCommand('baskets', interpreter);

    // 50% => half of a 20-wide bar.
    expect(result.output).toContain(`[${'='.repeat(10)}${' '.repeat(10)}] 50%`);
  });
});

// =============================================================================
// COMPLIANCE CERTIFICATE: HEADROOM SEMANTICS
// =============================================================================

describe('Compliance certificate — headroom', () => {
  it('should treat a comfortable absolute headroom as safe', () => {
    // Regression: headroom is absolute (0.75x on a 4.50x threshold = 16.7%),
    // but the certificate compared it against percentage bands, so anything
    // under 25 rendered as "Caution" and under 10 as "At Risk".
    const html = generateComplianceReport(
      baseDashboardData({ covenants: [covenant({ actual: 3.75, required: 4.5, headroom: 0.75 })] })
    );

    expect(html).not.toContain('At Risk');
  });

  it('should still flag a genuinely thin headroom', () => {
    // 0.05x of a 4.50x threshold ~= 1.1% — legitimately close to breach.
    const html = generateComplianceReport(
      baseDashboardData({ covenants: [covenant({ actual: 4.45, required: 4.5, headroom: 0.05 })] })
    );

    expect(html).toContain('At Risk');
  });

  it('should mark a non-compliant covenant as a breach', () => {
    const html = generateComplianceReport(
      baseDashboardData({
        covenants: [covenant({ actual: 5.2, required: 4.5, compliant: false, headroom: -0.7 })],
      })
    );

    expect(html).toContain('Breach');
  });

  it('should render headroom in ratio units, not as a percentage', () => {
    const html = generateComplianceReport(
      baseDashboardData({ covenants: [covenant({ headroom: 0.75 })] })
    );

    expect(html).toContain('0.75x');
    expect(html).not.toContain('0.8%');
  });

  it('should survive a covenant with no headroom figure', () => {
    const html = generateComplianceReport(
      baseDashboardData({ covenants: [covenant({ headroom: undefined })] })
    );

    expect(html).not.toContain('NaN');
    expect(html).toContain('n/a');
  });
});

// =============================================================================
// COMPLIANCE CERTIFICATE: RESERVE FUNDING
// =============================================================================

describe('Compliance certificate — reserve funding', () => {
  it('should not render NaN% for a zero-target reserve', () => {
    const html = generateComplianceReport(
      baseDashboardData({ reserves: [reserve({ balance: 0, target: 0 })] })
    );

    expect(html).not.toContain('NaN');
  });

  it('should not render Infinity% when a funded reserve has no target', () => {
    const html = generateComplianceReport(
      baseDashboardData({ reserves: [reserve({ balance: 5_000_000, target: 0 })] })
    );

    expect(html).not.toContain('Infinity');
  });

  it('should compute a real funding percentage when a target exists', () => {
    const html = generateComplianceReport(
      baseDashboardData({ reserves: [reserve({ balance: 7_500_000, target: 10_000_000 })] })
    );

    expect(html).toContain('75.0%');
  });
});

// =============================================================================
// TERMINAL: COVENANT UNITS AND SIMULATION
// =============================================================================

describe('Demo terminal — covenant value units', () => {
  async function interpreterFor(source: string, data: Record<string, number>) {
    const interpreter = new ProVisoInterpreter(await parseOrThrow(source));
    interpreter.loadFinancials(data);
    return interpreter;
  }

  it('should render a percentage covenant as a percentage, not a ratio', async () => {
    // Regression: `const isRatio = cov.actual < 100` printed a percentage
    // covenant of 15 as "15.00x".
    const interpreter = await interpreterFor(
      'COVENANT MinMargin REQUIRES margin >= 10% TESTED QUARTERLY',
      { margin: 15 }
    );
    const result = executeCommand('check', interpreter);

    expect(result.output).toContain('15.00%');
    expect(result.output).not.toContain('15.00x');
  });

  it('should render a ratio covenant in ratio units', async () => {
    const interpreter = await interpreterFor(
      'COVENANT MaxLeverage REQUIRES leverage <= 4.0x TESTED QUARTERLY',
      { leverage: 3.5 }
    );
    const result = executeCommand('check', interpreter);

    expect(result.output).toContain('3.50x');
  });

  it('should render a currency covenant in currency units', async () => {
    const interpreter = await interpreterFor(
      'COVENANT MinLiquidity REQUIRES cash >= $50_000_000 TESTED QUARTERLY',
      { cash: 75_000_000 }
    );
    const result = executeCommand('check', interpreter);

    expect(result.output).toContain('$75.0M');
  });

  it('should not leak a novel simulate key into the shared interpreter', async () => {
    // Regression: the terminal applied changes with loadFinancials and
    // restored key by key, so a key with no prior value kept its simulated
    // value for the rest of the session.
    const interpreter = await interpreterFor(
      `DEFINE Leverage AS total_debt / ebitda
       COVENANT MaxLeverage REQUIRES Leverage <= 4.0x TESTED QUARTERLY`,
      { total_debt: 300, ebitda: 100 }
    );

    const before = interpreter.checkCovenant('MaxLeverage').actual;
    executeCommand('simulate NovelKey=999999', interpreter);
    executeCommand('simulate total_debt=900', interpreter);

    expect(interpreter.checkCovenant('MaxLeverage').actual).toBe(before);
    expect(() => interpreter.evaluate('NovelKey')).toThrow();
  });

  it('should show the simulated pro forma value, not the current one', async () => {
    const interpreter = await interpreterFor(
      `DEFINE Leverage AS total_debt / ebitda
       COVENANT MaxLeverage REQUIRES Leverage <= 4.0x TESTED QUARTERLY`,
      { total_debt: 300, ebitda: 100 }
    );

    // Warm the interpreter first — this is what used to poison the result.
    executeCommand('check', interpreter);
    const result = executeCommand('simulate total_debt=900', interpreter);

    expect(result.output).toContain('9.00x');
  });
});

// =============================================================================
// THRESHOLD ZONES
// =============================================================================

describe('Threshold zones — strict operators', () => {
  // The zone was driven by `utilization > 1`, so actual === threshold showed
  // amber "danger" even though a strict operator makes equality a breach.
  it('should treat equality as a breach under a strict max operator', () => {
    expect(getThresholdZone(4.5, 4.5, '<')).toBe('breach');
  });

  it('should treat equality as a breach under a strict min operator', () => {
    expect(getThresholdZone(1.25, 1.25, '>')).toBe('breach');
  });

  it('should treat equality as compliant under an inclusive max operator', () => {
    expect(getThresholdZone(4.5, 4.5, '<=')).not.toBe('breach');
  });

  it('should treat equality as compliant under an inclusive min operator', () => {
    expect(getThresholdZone(1.25, 1.25, '>=')).not.toBe('breach');
  });

  it('should still report a genuine breach past the threshold', () => {
    expect(getThresholdZone(5.0, 4.5, '<=')).toBe('breach');
  });

  it('should still report a comfortable covenant as safe', () => {
    expect(getThresholdZone(2.0, 4.5, '<=')).toBe('safe');
  });
});

// =============================================================================
// AT-THE-LINE ZONE
//
// A covenant sitting exactly on its threshold under an inclusive operator is
// compliant with zero cushion. It used to wear breach-red while the panel
// header said "3/3 passing" — a contradiction on the same card.
// =============================================================================

describe('Threshold zones — at the line', () => {
  it('should report a max covenant exactly at its ceiling as at_the_line', () => {
    expect(getThresholdZone(4.5, 4.5, '<=')).toBe('at_the_line');
  });

  it('should report a min covenant exactly at its floor as at_the_line', () => {
    expect(getThresholdZone(1.25, 1.25, '>=')).toBe('at_the_line');
  });

  it('should keep at_the_line distinct from both breach and danger', () => {
    const atLine = getThresholdZone(4.5, 4.5, '<=');
    expect(atLine).not.toBe('breach');
    expect(atLine).not.toBe('danger');
  });

  it('should still report just-inside-the-line as danger, not at_the_line', () => {
    expect(getThresholdZone(4.45, 4.5, '<=')).toBe('danger');
  });

  it('should carry a label so the state never rests on colour alone', () => {
    expect(getZonePresentation('at_the_line').label).toMatch(/headroom/i);
  });

  it('should give every zone a non-empty label', () => {
    const zones = ['safe', 'caution', 'danger', 'at_the_line', 'breach'] as const;
    for (const zone of zones) {
      expect(getZonePresentation(zone).label.length).toBeGreaterThan(0);
    }
  });

  it('should not dress at_the_line in the breach token', () => {
    expect(getZonePresentation('at_the_line').textClass).not.toEqual(
      getZonePresentation('breach').textClass
    );
  });
});

describe('Alerts — at-the-line covenants', () => {
  const atLineCovenant = [
    { name: 'MinEquityContribution', actual: 1.0, required: 1.0, operator: '>=' as const },
  ];

  it('should raise an alert rather than passing over it silently', () => {
    const summary = generateAlerts(atLineCovenant);
    expect(summary.hasAlerts).toBe(true);
    expect(summary.atTheLineCount).toBe(1);
  });

  it('should give the alert a real message', () => {
    const [alert] = generateAlerts(atLineCovenant).alerts;
    expect(alert?.message.length).toBeGreaterThan(0);
    expect(alert?.message).toMatch(/headroom/i);
  });

  it('should not count it as a breach', () => {
    expect(generateAlerts(atLineCovenant).breachCount).toBe(0);
  });

  it('should rank it above a merely-approaching covenant', () => {
    const summary = generateAlerts([
      { name: 'Approaching', actual: 3.7, required: 4.5, operator: '<=' as const },
      ...atLineCovenant,
    ]);
    expect(summary.alerts[0]?.name).toBe('MinEquityContribution');
  });

  it('should surface it in the summary message', () => {
    expect(generateAlerts(atLineCovenant).message).toMatch(/no headroom/i);
  });
});

// =============================================================================
// COVENANT SORT PRIORITY
// =============================================================================

describe('Covenant status priority', () => {
  // CovenantPanel derives a status straight from getThresholdZone, so a zone
  // with no priority entry yields undefined and turns the comparator into NaN,
  // which silently leaves the list unsorted.
  it('should have a priority for every threshold zone', () => {
    const zones = ['safe', 'caution', 'danger', 'at_the_line', 'breach'] as const;
    for (const zone of zones) {
      expect(typeof COVENANT_STATUS_PRIORITY[zone]).toBe('number');
    }
  });

  it('should rank at_the_line between breach and danger', () => {
    expect(COVENANT_STATUS_PRIORITY.breach).toBeLessThan(COVENANT_STATUS_PRIORITY.at_the_line);
    expect(COVENANT_STATUS_PRIORITY.at_the_line).toBeLessThan(COVENANT_STATUS_PRIORITY.danger);
  });
});
