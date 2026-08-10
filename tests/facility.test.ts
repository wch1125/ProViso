/**
 * FACILITY / TRANCHE — the debt spine.
 *
 * The facility is the authoritative source of the debt stack: when one is
 * declared, leverage, coverage, reserves and waterfalls all read the same
 * derived figures instead of independently-supplied metrics. These tests pin
 * both the arithmetic and — just as important — that the whole layer stays
 * inert for files that declare no facility.
 */

import { describe, it, expect } from 'vitest';
import { parse, parseOrThrow } from '../src/parser.js';
import { ProVisoInterpreter } from '../src/interpreter.js';
import { validate } from '../src/validator.js';
import { compileToState, diffStates } from '../src/hub/versioning/index.js';
import { generateWordDocument, generateRedline, detectDrift } from '../src/hub/word/index.js';
import type { FacilityStatement } from '../src/types.js';

const FACILITY_SOURCE = `
  FACILITY SeniorSecured
    BENCHMARK 5.00%
    CASH_NETTING_CAP $50_000_000

    TRANCHE Revolver
      TYPE REVOLVING
      COMMITMENT $100_000_000
      DRAWN $40_000_000
      MARGIN 3.25%
      MATURITY 2029-06-30
      LC_OUTSTANDING $10_000_000
      LC_SUBLIMIT $25_000_000

    TRANCHE TermLoanB
      TYPE TERM_LOAN_B
      COMMITMENT $400_000_000
      MARGIN 4.00%
      MATURITY 2031-06-30
      AMORTIZATION 1%
`;

async function facilityInterpreter(extra = '') {
  const interpreter = new ProVisoInterpreter(await parseOrThrow(FACILITY_SOURCE + extra));
  interpreter.loadFinancials({
    ebitda: 100_000_000,
    capital_leases: 10_000_000,
    cash: 80_000_000,
  });
  return interpreter;
}

// =============================================================================
// PARSING
// =============================================================================

describe('FACILITY — parsing', () => {
  it('should parse a facility with multiple tranches', async () => {
    const ast = await parseOrThrow(FACILITY_SOURCE);
    const facility = ast.statements.find((s) => s.type === 'Facility') as FacilityStatement;

    expect(facility.name).toBe('SeniorSecured');
    expect(facility.tranches).toHaveLength(2);
    expect(facility.tranches[0]?.name).toBe('Revolver');
    expect(facility.tranches[0]?.trancheType).toBe('revolving_credit');
    expect(facility.tranches[1]?.trancheType).toBe('term_loan_b');
  });

  it('should parse every tranche type', async () => {
    const types: Array<[string, string]> = [
      ['REVOLVING', 'revolving_credit'],
      ['TERM_LOAN_A', 'term_loan_a'],
      ['TERM_LOAN_B', 'term_loan_b'],
      ['DELAYED_DRAW', 'delayed_draw'],
      ['BRIDGE', 'bridge_loan'],
      ['ABL', 'asset_based_loan'],
    ];

    for (const [keyword, expected] of types) {
      const ast = await parseOrThrow(`
        FACILITY F
          TRANCHE T
            TYPE ${keyword}
            COMMITMENT $1_000_000
      `);
      const facility = ast.statements[0] as FacilityStatement;
      expect(facility.tranches[0]?.trancheType).toBe(expected);
    }
  });

  it('should reject a facility with no tranches', async () => {
    const result = await parse('FACILITY Empty\n  BENCHMARK 5.00%');
    expect(result.success).toBe(false);
  });
});

// =============================================================================
// TRANCHE ARITHMETIC
// =============================================================================

describe('FACILITY — tranche arithmetic', () => {
  it('should compute the all-in rate as benchmark plus margin', async () => {
    const status = (await facilityInterpreter()).getFacilityStatus('SeniorSecured');

    expect(status.tranches[0]?.allInRate).toBeCloseTo(8.25, 10);
    expect(status.tranches[1]?.allInRate).toBeCloseTo(9.0, 10);
  });

  it('should compute annual interest on the drawn balance', async () => {
    const status = (await facilityInterpreter()).getFacilityStatus('SeniorSecured');

    // 40M × 8.25%
    expect(status.tranches[0]?.annualInterest).toBeCloseTo(3_300_000, 2);
    // 400M × 9.00%
    expect(status.tranches[1]?.annualInterest).toBeCloseTo(36_000_000, 2);
  });

  it('should default a term tranche to fully drawn and a revolver to undrawn', async () => {
    const ast = await parseOrThrow(`
      FACILITY F
        TRANCHE Term
          TYPE TERM_LOAN_A
          COMMITMENT $200_000_000
        TRANCHE Revolver
          TYPE REVOLVING
          COMMITMENT $100_000_000
    `);
    const status = new ProVisoInterpreter(ast).getFacilityStatus('F');

    expect(status.tranches[0]?.drawn).toBe(200_000_000);
    expect(status.tranches[1]?.drawn).toBe(0);
  });

  it('should compute revolver availability net of letters of credit', async () => {
    const status = (await facilityInterpreter()).getFacilityStatus('SeniorSecured');

    // 100M commitment − 40M drawn − 10M LC
    expect(status.tranches[0]?.availability).toBe(50_000_000);
    expect(status.tranches[0]?.utilization).toBeCloseTo(50, 10);
  });

  it('should report no availability or utilization for a term tranche', async () => {
    const status = (await facilityInterpreter()).getFacilityStatus('SeniorSecured');

    expect(status.tranches[1]?.availability).toBeNull();
    expect(status.tranches[1]?.utilization).toBeNull();
  });

  it('should compute scheduled amortization off the original commitment', async () => {
    const status = (await facilityInterpreter()).getFacilityStatus('SeniorSecured');

    // 400M × 1%
    expect(status.tranches[1]?.scheduledAmortization).toBeCloseTo(4_000_000, 2);
  });

  it('should weight the facility rate by drawn balance, not commitment', async () => {
    const status = (await facilityInterpreter()).getFacilityStatus('SeniorSecured');

    // (8.25 × 40 + 9.00 × 400) / 440
    expect(status.weightedRate).toBeCloseTo(8.9318, 3);
  });
});

// =============================================================================
// DERIVED METRICS
// =============================================================================

describe('FACILITY — derived debt metrics', () => {
  it('should derive TotalDrawn from tranche balances', async () => {
    const interpreter = await facilityInterpreter();
    expect(interpreter.evaluate('TotalDrawn')).toBe(440_000_000);
  });

  it('should add non-facility debt to TotalDebt rather than dropping it', async () => {
    const interpreter = await facilityInterpreter();
    // 440M facility + 10M capital leases
    expect(interpreter.evaluate('TotalDebt')).toBe(450_000_000);
  });

  it('should cap cash netting when computing NetDebt', async () => {
    const interpreter = await facilityInterpreter();
    // 450M gross − min(80M cash, 50M cap)
    expect(interpreter.evaluate('NetDebt')).toBe(400_000_000);
  });

  it('should never net more cash than exists', async () => {
    const interpreter = new ProVisoInterpreter(await parseOrThrow(FACILITY_SOURCE));
    interpreter.loadFinancials({ cash: 5_000_000 });

    // Cap is 50M but only 5M of cash exists.
    expect(interpreter.evaluate('NetDebt')).toBe(435_000_000);
  });

  it('should never report a negative NetDebt', async () => {
    const ast = await parseOrThrow(`
      FACILITY F
        TRANCHE Term
          TYPE TERM_LOAN_A
          COMMITMENT $10_000_000
    `);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials({ cash: 500_000_000 });

    expect(interpreter.evaluate('NetDebt')).toBe(0);
  });

  it('should derive debt service as interest plus scheduled amortization', async () => {
    const interpreter = await facilityInterpreter();
    expect(interpreter.evaluate('DebtService')).toBeCloseTo(43_300_000, 2);
  });

  it('should feed covenants from the facility', async () => {
    const interpreter = await facilityInterpreter(`
      DEFINE EBITDA AS ebitda
      DEFINE Leverage AS TotalDebt / EBITDA
      COVENANT MaxLeverage REQUIRES Leverage <= 5.0x TESTED QUARTERLY
    `);

    const result = interpreter.checkCovenant('MaxLeverage');
    expect(result.actual).toBe(4.5);
    expect(result.compliant).toBe(true);
  });
});

// =============================================================================
// BACK-COMPATIBILITY — the layer must be invisible without a facility
// =============================================================================

describe('FACILITY — inert without a declaration', () => {
  it('should leave a supplied TotalDebt untouched when no facility exists', async () => {
    const ast = await parseOrThrow(`
      DEFINE EBITDA AS ebitda
      DEFINE Leverage AS TotalDebt / EBITDA
    `);
    const interpreter = new ProVisoInterpreter(ast);
    interpreter.loadFinancials({ TotalDebt: 250_000_000, ebitda: 100_000_000 });

    expect(interpreter.evaluate('TotalDebt')).toBe(250_000_000);
    expect(interpreter.evaluate('Leverage')).toBe(2.5);
  });

  it('should report no facilities for a file that declares none', async () => {
    const interpreter = new ProVisoInterpreter(await parseOrThrow('DEFINE X AS 1'));

    expect(interpreter.hasFacilities()).toBe(false);
    expect(interpreter.getFacilityNames()).toEqual([]);
  });

  it('should allow DEFINE TotalDebt when no facility is declared', async () => {
    // Six of the seven shipped examples do exactly this.
    const result = validate(
      await parseOrThrow('DEFINE TotalDebt AS funded_debt + capital_leases')
    );

    expect(result.valid).toBe(true);
  });
});

// =============================================================================
// VALIDATION
// =============================================================================

describe('FACILITY — validation', () => {
  it('should error when a DEFINE shadows a facility-derived metric', async () => {
    const result = validate(
      await parseOrThrow(FACILITY_SOURCE + '\nDEFINE TotalDebt AS funded_debt')
    );

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.reference === 'TotalDebt')).toBe(true);
  });

  it('should error on a tranche with no commitment', async () => {
    const result = validate(
      await parseOrThrow(`
        FACILITY F
          TRANCHE T
            TYPE TERM_LOAN_A
            MARGIN 4.00%
      `)
    );

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /COMMITMENT/i.test(e.message))).toBe(true);
  });

  it('should error on duplicate tranche names within a facility', async () => {
    const result = validate(
      await parseOrThrow(`
        FACILITY F
          TRANCHE T
            TYPE TERM_LOAN_A
            COMMITMENT $1_000_000
          TRANCHE T
            TYPE TERM_LOAN_B
            COMMITMENT $2_000_000
      `)
    );

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /Duplicate tranche/i.test(e.message))).toBe(true);
  });

  it('should warn when LC clauses appear on a non-revolving tranche', async () => {
    const result = validate(
      await parseOrThrow(`
        FACILITY F
          TRANCHE T
            TYPE TERM_LOAN_B
            COMMITMENT $1_000_000
            LC_SUBLIMIT $100_000
      `)
    );

    expect(result.warnings.some((w) => /LC_/.test(w.message))).toBe(true);
  });

  it('should accept a well-formed facility', async () => {
    const result = validate(await parseOrThrow(FACILITY_SOURCE));
    expect(result.valid).toBe(true);
  });
});

// =============================================================================
// EDGE CASES — the hostile-question surface
// =============================================================================

describe('FACILITY — edge cases', () => {
  it('should not divide by zero on a zero-commitment revolver', async () => {
    const ast = await parseOrThrow(`
      FACILITY F
        TRANCHE R
          TYPE REVOLVING
          COMMITMENT $0
    `);
    const status = new ProVisoInterpreter(ast).getFacilityStatus('F');

    expect(status.tranches[0]?.utilization).toBeNull();
    expect(Number.isFinite(status.weightedRate)).toBe(true);
  });

  it('should not report negative undrawn when a tranche is overdrawn', async () => {
    const ast = await parseOrThrow(`
      FACILITY F
        TRANCHE T
          TYPE TERM_LOAN_A
          COMMITMENT $100_000_000
          DRAWN $150_000_000
    `);
    const status = new ProVisoInterpreter(ast).getFacilityStatus('F');

    expect(status.tranches[0]?.undrawn).toBe(0);
    expect(status.totalUndrawn).toBe(0);
  });

  it('should handle a facility with no benchmark', async () => {
    const ast = await parseOrThrow(`
      FACILITY F
        TRANCHE T
          TYPE TERM_LOAN_A
          COMMITMENT $100_000_000
          MARGIN 4.00%
    `);
    const status = new ProVisoInterpreter(ast).getFacilityStatus('F');

    expect(status.benchmark).toBe(0);
    expect(status.tranches[0]?.allInRate).toBeCloseTo(4.0, 10);
  });

  it('should aggregate across multiple facilities', async () => {
    const ast = await parseOrThrow(`
      FACILITY First
        TRANCHE A
          TYPE TERM_LOAN_A
          COMMITMENT $100_000_000
      FACILITY Second
        TRANCHE B
          TYPE TERM_LOAN_B
          COMMITMENT $250_000_000
    `);
    const interpreter = new ProVisoInterpreter(ast);

    expect(interpreter.evaluate('TotalDrawn')).toBe(350_000_000);
    expect(interpreter.getFacilityNames()).toEqual(['First', 'Second']);
  });

  it('should throw a clear error for an unknown facility', async () => {
    const interpreter = await facilityInterpreter();
    expect(() => interpreter.getFacilityStatus('Nope')).toThrow(/Unknown facility/);
  });
});

// =============================================================================
// DIFF COVERAGE — facility terms must not read as "no change"
// =============================================================================

describe('FACILITY — diff coverage', () => {
  async function diff(fromCode: string, toCode: string) {
    return diffStates(await compileToState(fromCode), await compileToState(toCode));
  }

  it('should detect a change to a tranche commitment', async () => {
    const result = await diff(
      FACILITY_SOURCE,
      FACILITY_SOURCE.replace('COMMITMENT $100_000_000', 'COMMITMENT $150_000_000')
    );

    const fields = result.diffs.flatMap((d) => d.fieldChanges.map((f) => f.field));
    expect(fields).toContain('tranche.Revolver.commitment');
  });

  it('should detect a change to a tranche margin', async () => {
    const result = await diff(
      FACILITY_SOURCE,
      FACILITY_SOURCE.replace('MARGIN 4.00%', 'MARGIN 4.50%')
    );

    const fields = result.diffs.flatMap((d) => d.fieldChanges.map((f) => f.field));
    expect(fields).toContain('tranche.TermLoanB.margin');
  });

  it('should detect a change to a tranche maturity', async () => {
    const result = await diff(
      FACILITY_SOURCE,
      FACILITY_SOURCE.replace('MATURITY 2031-06-30', 'MATURITY 2032-06-30')
    );

    const fields = result.diffs.flatMap((d) => d.fieldChanges.map((f) => f.field));
    expect(fields).toContain('tranche.TermLoanB.maturity');
  });

  it('should detect an added tranche', async () => {
    const result = await diff(
      FACILITY_SOURCE,
      FACILITY_SOURCE +
        `
    TRANCHE Incremental
      TYPE TERM_LOAN_B
      COMMITMENT $75_000_000
      MARGIN 4.50%
`
    );

    const fields = result.diffs.flatMap((d) => d.fieldChanges.map((f) => f.field));
    expect(fields).toContain('tranche.Incremental');
  });

  it('should report no change when nothing moved', async () => {
    const result = await diff(FACILITY_SOURCE, FACILITY_SOURCE);
    expect(result.diffs).toHaveLength(0);
  });
});

// =============================================================================
// WORD RENDERING — the facility must appear in generated documents
// =============================================================================

describe('FACILITY — Word rendering', () => {
  async function generate() {
    return generateWordDocument(FACILITY_SOURCE, { dealName: 'Test Deal' });
  }

  it('should render the facility under Article 2, The Credits', async () => {
    const doc = await generate();
    const article = doc.articles.find((a) => a.articleNumber === 2);

    expect(article?.title).toBe('The Credits');
    expect(article?.sections).toHaveLength(1);
    expect(article?.sections[0]?.sectionReference).toBe('2.01(a)');
  });

  it('should name every tranche with its type and amount', async () => {
    const doc = await generate();
    const prose = doc.fullText;

    expect(prose).toContain('revolving credit facility');
    expect(prose).toContain('term loan B facility');
    expect(prose).toContain('$100,000,000');
    expect(prose).toContain('$400,000,000');
  });

  it('should render rates to two decimals with "per annum"', async () => {
    const doc = await generate();

    // A margin drafted as 3.25% must not render as "3.25" or "3%".
    expect(doc.fullText).toContain('3.25% per annum');
    expect(doc.fullText).toContain('4.00% per annum');
  });

  it('should render maturities as agreement-style dates', async () => {
    const doc = await generate();

    expect(doc.fullText).toContain('June 30, 2029');
    expect(doc.fullText).not.toContain('2029-06-30');
  });

  it('should describe the cash netting cap', async () => {
    const doc = await generate();

    expect(doc.fullText).toContain('netted against outstanding indebtedness');
    expect(doc.fullText).toContain('$50,000,000');
  });

  it('should describe amortization where a tranche has it', async () => {
    const doc = await generate();
    expect(doc.fullText).toMatch(/TermLoanB shall amortize/);
  });

  it('should emit a uniquely-addressable section marker', async () => {
    const doc = await generate();
    expect(doc.fullText).toMatch(/^2\.01\(a\)/m);
  });

  it('should detect a commitment change as drift, not silence', async () => {
    // The redline path: an edited document must not read as unchanged.
    const doc = await generate();
    const edited = doc.fullText.replace('$100,000,000', '$175,000,000');

    expect(edited).not.toBe(doc.fullText);
    const report = await detectDrift(edited, FACILITY_SOURCE);
    expect(report.hasDrift).toBe(true);
  });

  it('should report no drift for an unedited document', async () => {
    const doc = await generate();
    const report = await detectDrift(doc.fullText, FACILITY_SOURCE);

    expect(report.hasDrift).toBe(false);
  });

  it('should surface a tranche change in the redline', async () => {
    const result = await generateRedline(
      FACILITY_SOURCE,
      FACILITY_SOURCE.replace('MARGIN 4.00%', 'MARGIN 4.75%')
    );

    expect(result.hasChanges).toBe(true);
    expect(result.modifiedSections.some((s) => s.newContent.includes('4.75% per annum'))).toBe(true);
  });
});
