/**
 * PRICING_GRID and facility fees — Phase 2 loan economics.
 *
 * The grid is a margin ratchet read against a named ratio. Its correctness
 * rests on two things: the right level being selected at every boundary, and
 * the basis never depending on the interest the grid itself produces (D6) —
 * which would make the grid feed its own input.
 */

import { describe, it, expect } from 'vitest';
import { parseOrThrow } from '../src/parser.js';
import { ProVisoInterpreter } from '../src/interpreter.js';
import { validate } from '../src/validator.js';
import { compileToState, diffStates } from '../src/hub/versioning/index.js';
import { generateWordDocument } from '../src/hub/word/index.js';

const GRID = `
  PRICING_GRID SeniorPricing
    BASED_ON NetLeverage
    WHEN >= 5.00x MARGIN 4.50%
    WHEN >= 4.00x MARGIN 4.25%
    WHEN >= 3.00x MARGIN 4.00%
    OTHERWISE MARGIN 3.75%
`;

/** Facility whose term tranche size drives leverage, so the grid can be walked. */
function facilityWith(termCommitment: string): string {
  return `
    ${GRID}

    FACILITY Senior
      BENCHMARK 5.00%
      COMMITMENT_FEE 0.50%
      LC_FEE 2.00%

      TRANCHE Revolver
        TYPE REVOLVING
        COMMITMENT $100_000_000
        DRAWN $20_000_000
        PRICING SeniorPricing
        LC_OUTSTANDING $10_000_000

      TRANCHE TermB
        TYPE TERM_LOAN_B
        COMMITMENT ${termCommitment}
        PRICING SeniorPricing

    DEFINE EBITDA AS ebitda
    DEFINE NetLeverage AS NetDebt / EBITDA
  `;
}

async function gridAt(termCommitment: string) {
  const interpreter = new ProVisoInterpreter(await parseOrThrow(facilityWith(termCommitment)));
  interpreter.loadFinancials({ ebitda: 100_000_000 });
  return interpreter;
}

// =============================================================================
// LEVEL SELECTION
// =============================================================================

describe('PRICING_GRID — level selection', () => {
  it('should select the top level at high leverage', async () => {
    // 500M + 20M drawn = 5.20x
    const status = (await gridAt('$500_000_000')).getPricingGridStatus('SeniorPricing');

    expect(status.basisValue).toBeCloseTo(5.2, 10);
    expect(status.activeLevel).toBe(1);
    expect(status.margin).toBeCloseTo(4.5, 10);
  });

  it('should step down as leverage falls', async () => {
    const mid = (await gridAt('$380_000_000')).getPricingGridStatus('SeniorPricing');
    const low = (await gridAt('$250_000_000')).getPricingGridStatus('SeniorPricing');

    expect(mid.margin).toBeCloseTo(4.25, 10);
    expect(low.margin).toBeCloseTo(3.75, 10);
  });

  it('should treat a threshold as inclusive at the boundary', async () => {
    // 380M + 20M = exactly 4.00x, which must match ">= 4.00x".
    const status = (await gridAt('$380_000_000')).getPricingGridStatus('SeniorPricing');

    expect(status.basisValue).toBeCloseTo(4.0, 10);
    expect(status.activeLevel).toBe(2);
  });

  it('should fall to OTHERWISE below every threshold', async () => {
    const status = (await gridAt('$250_000_000')).getPricingGridStatus('SeniorPricing');

    expect(status.activeLevel).toBe(4);
    expect(status.levelDescription).toBe('otherwise');
  });

  it('should evaluate levels in written order', async () => {
    // A basis of 5.20x satisfies every threshold; the first must win.
    const status = (await gridAt('$500_000_000')).getPricingGridStatus('SeniorPricing');
    expect(status.activeLevel).toBe(1);
  });

  it('should throw a clear error for an unknown grid', async () => {
    const interpreter = await gridAt('$500_000_000');
    expect(() => interpreter.getPricingGridStatus('Nope')).toThrow(/Unknown pricing grid/);
  });
});

// =============================================================================
// EFFECT ON THE FACILITY
// =============================================================================

describe('PRICING_GRID — effect on interest', () => {
  it('should drive the tranche margin from the grid', async () => {
    const status = (await gridAt('$500_000_000')).getFacilityStatus('Senior');

    // Benchmark 5.00 + grid margin 4.50
    expect(status.tranches[0]?.allInRate).toBeCloseTo(9.5, 10);
    expect(status.tranches[0]?.pricingGrid).toBe('SeniorPricing');
  });

  it('should lower interest when the grid steps down', async () => {
    const high = (await gridAt('$500_000_000')).getFacilityStatus('Senior');
    const low = (await gridAt('$500_000_000')).getFacilityStatus('Senior');

    expect(high.annualInterest).toBeCloseTo(low.annualInterest, 2);

    // Same debt, cheaper pricing: compare against a lower-leverage deal of the
    // same size by supplying more EBITDA.
    const cheaper = new ProVisoInterpreter(await parseOrThrow(facilityWith('$500_000_000')));
    cheaper.loadFinancials({ ebitda: 300_000_000 }); // 1.73x → OTHERWISE
    const cheapStatus = cheaper.getFacilityStatus('Senior');

    expect(cheapStatus.annualInterest).toBeLessThan(high.annualInterest);
  });

  it('should let an explicit MARGIN win over a grid reference', async () => {
    const ast = await parseOrThrow(`
      ${GRID}
      FACILITY Senior
        TRANCHE T
          TYPE TERM_LOAN_B
          COMMITMENT $100_000_000
          MARGIN 1.00%
          PRICING SeniorPricing
      DEFINE EBITDA AS ebitda
      DEFINE NetLeverage AS NetDebt / EBITDA
    `);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials({ ebitda: 10_000_000 });

    const status = interpreter.getFacilityStatus('Senior');
    expect(status.tranches[0]?.margin).toBeCloseTo(1.0, 10);
    expect(status.tranches[0]?.pricingGrid).toBeNull();
  });

  it('should fall to the floor rather than throw when the basis is unresolvable', async () => {
    const ast = await parseOrThrow(`
      ${GRID}
      FACILITY Senior
        TRANCHE T
          TYPE TERM_LOAN_B
          COMMITMENT $100_000_000
          PRICING SeniorPricing
    `);
    // NetLeverage cannot resolve — no EBITDA supplied.
    const status = new ProVisoInterpreter(ast).getPricingGridStatus('SeniorPricing');

    expect(status.basisValue).toBeNull();
    expect(status.levelDescription).toBe('otherwise');
    expect(status.margin).toBeCloseTo(3.75, 10);
  });
});

// =============================================================================
// FEES
// =============================================================================

describe('Facility fees', () => {
  it('should charge the commitment fee on undrawn revolver only', async () => {
    const status = (await gridAt('$500_000_000')).getFacilityStatus('Senior');

    // Revolver: 100M − 20M drawn = 80M undrawn × 0.50%
    expect(status.tranches[0]?.commitmentFee).toBeCloseTo(400_000, 2);
    // Term loan is fully drawn and has no undrawn line to charge for.
    expect(status.tranches[1]?.commitmentFee).toBe(0);
  });

  it('should charge the LC fee on letters of credit outstanding', async () => {
    const status = (await gridAt('$500_000_000')).getFacilityStatus('Senior');

    // 10M LC × 2.00%
    expect(status.tranches[0]?.lcFee).toBeCloseTo(200_000, 2);
  });

  it('should include fees in debt service', async () => {
    const status = (await gridAt('$500_000_000')).getFacilityStatus('Senior');

    expect(status.fees).toBeCloseTo(600_000, 2);
    expect(status.debtService).toBeCloseTo(
      status.annualInterest + status.fees + status.scheduledAmortization,
      2
    );
  });

  it('should expose TotalFees as a derived metric', async () => {
    const interpreter = await gridAt('$500_000_000');
    expect(interpreter.evaluate('TotalFees')).toBeCloseTo(600_000, 2);
  });

  it('should report zero fees when no fee rates are declared', async () => {
    const ast = await parseOrThrow(`
      FACILITY Senior
        TRANCHE R
          TYPE REVOLVING
          COMMITMENT $100_000_000
          DRAWN $10_000_000
    `);
    const status = new ProVisoInterpreter(ast).getFacilityStatus('Senior');

    expect(status.fees).toBe(0);
  });
});

// =============================================================================
// VALIDATION — D6 acyclicity is the load-bearing check
// =============================================================================

describe('PRICING_GRID — validation', () => {
  it('should reject a basis that depends on the interest the grid sets', async () => {
    // The grid sets the margin, the margin drives AnnualInterest — so a basis
    // reading AnnualInterest closes a loop the engine cannot resolve.
    const result = validate(
      await parseOrThrow(`
        PRICING_GRID BadGrid
          BASED_ON CoverageRatio
          WHEN >= 2.00x MARGIN 4.00%
          OTHERWISE MARGIN 3.00%
        DEFINE CoverageRatio AS ebitda / AnnualInterest
      `)
    );

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.reference === 'AnnualInterest')).toBe(true);
  });

  it('should reject a basis depending on DebtService', async () => {
    const result = validate(
      await parseOrThrow(`
        PRICING_GRID BadGrid
          BASED_ON FCCR
          WHEN >= 2.00x MARGIN 4.00%
          OTHERWISE MARGIN 3.00%
        DEFINE FCCR AS ebitda / DebtService
      `)
    );

    expect(result.valid).toBe(false);
  });

  it('should accept a leverage basis, which excludes interest', async () => {
    const result = validate(
      await parseOrThrow(`
        ${GRID}
        DEFINE NetLeverage AS NetDebt / ebitda
      `)
    );

    expect(result.valid).toBe(true);
  });

  it('should error when OTHERWISE is not the last level', async () => {
    const result = validate(
      await parseOrThrow(`
        PRICING_GRID BadOrder
          BASED_ON Leverage
          OTHERWISE MARGIN 3.75%
          WHEN >= 5.00x MARGIN 4.50%
        DEFINE Leverage AS 1
      `)
    );

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /OTHERWISE must be the last/.test(e.message))).toBe(true);
  });

  it('should warn when a grid has no OTHERWISE level', async () => {
    const result = validate(
      await parseOrThrow(`
        PRICING_GRID NoFloor
          BASED_ON Leverage
          WHEN >= 5.00x MARGIN 4.50%
        DEFINE Leverage AS 1
      `)
    );

    expect(result.warnings.some((w) => /no OTHERWISE/.test(w.message))).toBe(true);
  });

  it('should error when a tranche references an undefined grid', async () => {
    const result = validate(
      await parseOrThrow(`
        FACILITY Senior
          TRANCHE T
            TYPE TERM_LOAN_B
            COMMITMENT $100_000_000
            PRICING NoSuchGrid
      `)
    );

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.reference === 'NoSuchGrid')).toBe(true);
  });

  it('should warn when a tranche declares both MARGIN and PRICING', async () => {
    const result = validate(
      await parseOrThrow(`
        ${GRID}
        FACILITY Senior
          TRANCHE T
            TYPE TERM_LOAN_B
            COMMITMENT $100_000_000
            MARGIN 1.00%
            PRICING SeniorPricing
        DEFINE NetLeverage AS 1
      `)
    );

    expect(result.warnings.some((w) => /both MARGIN and PRICING/.test(w.message))).toBe(true);
  });
});

// =============================================================================
// DIFF AND WORD COVERAGE
// =============================================================================

describe('PRICING_GRID — diff and Word coverage', () => {
  it('should detect a repricing of one level', async () => {
    const from = await compileToState(GRID);
    const to = await compileToState(GRID.replace('MARGIN 4.25%', 'MARGIN 4.00%'));
    const result = diffStates(from, to);

    const fields = result.diffs.flatMap((d) => d.fieldChanges.map((f) => f.field));
    expect(fields).toContain('level.2');
  });

  it('should detect a changed grid basis', async () => {
    const from = await compileToState(GRID);
    const to = await compileToState(GRID.replace('BASED_ON NetLeverage', 'BASED_ON TotalLeverage'));
    const result = diffStates(from, to);

    const fields = result.diffs.flatMap((d) => d.fieldChanges.map((f) => f.field));
    expect(fields).toContain('basedOn');
  });

  it('should detect an added level', async () => {
    const from = await compileToState(GRID);
    const to = await compileToState(
      GRID.replace('OTHERWISE MARGIN 3.75%', 'WHEN >= 2.00x MARGIN 3.80%\n    OTHERWISE MARGIN 3.75%')
    );
    const result = diffStates(from, to);

    expect(result.diffs.length).toBeGreaterThan(0);
  });

  it('should report no change when the grid is untouched', async () => {
    const result = diffStates(await compileToState(GRID), await compileToState(GRID));
    expect(result.diffs).toHaveLength(0);
  });

  it('should render the grid as an Applicable Margin definition', async () => {
    const doc = await generateWordDocument(GRID, { dealName: 'Test' });

    expect(doc.fullText).toContain('"Applicable Margin"');
    expect(doc.fullText).toContain('greater than or equal to');
    expect(doc.fullText).toContain('4.50% per annum');
    expect(doc.fullText).toMatch(/Level I:/);
  });
});
