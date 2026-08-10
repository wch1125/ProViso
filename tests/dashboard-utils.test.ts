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
