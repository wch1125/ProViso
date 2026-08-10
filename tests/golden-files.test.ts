/**
 * Golden-file regression gate.
 *
 * Snapshots the full evaluated output of every shipped example deal. The
 * facility spine (and the derived-metric layer behind it) changes where numbers
 * come from, not what they should be — so any movement in these snapshots on a
 * file that declares no FACILITY is a regression, not an improvement.
 *
 * Determinism: every wall-clock-sensitive call is pinned to AS_OF, and the
 * report timestamp is stripped. If a snapshot ever churns without a deliberate
 * code change, that is itself the bug.
 */

import { describe, it, expect } from 'vitest';
import { readFile } from 'fs/promises';
import { parseOrThrow } from '../src/parser.js';
import { ProVisoInterpreter } from '../src/interpreter.js';

/** Fixed evaluation date. Chosen after every example's milestone longstops so
 *  statuses are settled rather than drifting as the real clock advances. */
const AS_OF = new Date('2027-01-01T00:00:00Z');

/** Example file → optional financial data file. */
const EXAMPLES: Array<{ proviso: string; data?: string }> = [
  { proviso: 'corporate_revolver.proviso', data: 'q3_2024_financials.json' },
  { proviso: 'project_finance.proviso', data: 'project_finance_demo.json' },
  { proviso: 'solar_utility.proviso', data: 'solar_utility_financials.json' },
  { proviso: 'trailing_definitions.proviso', data: 'multi_period_financials.json' },
  { proviso: 'data_center.proviso' },
  { proviso: 'wind_onshore.proviso' },
  { proviso: 'amendment_001.proviso' },
];

/**
 * Evaluate anything that might throw into a tagged result.
 *
 * A snapshot that records "this threw, with this message" is more useful than
 * one that omits the section: it pins current behaviour either way, so a fix
 * that turns an error into a value shows up as a visible diff.
 */
function attempt<T>(fn: () => T): T | { __error: string } {
  try {
    return fn();
  } catch (err) {
    return { __error: (err as Error).message };
  }
}

/** Sort by a stable key so map-iteration order can never churn a snapshot. */
function byName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Build a deterministic, fully-populated snapshot of an interpreter's state.
 * Sections are included only when the file declares the relevant construct, so
 * each example's snapshot reflects what it actually exercises.
 */
function snapshotOf(interpreter: ProVisoInterpreter): Record<string, unknown> {
  const snapshot: Record<string, unknown> = {};

  // --- Definitions: the numbers everything else is derived from ---
  snapshot.definitions = interpreter
    .getDefinitionNames()
    .sort()
    .map((name) => ({ name, value: attempt(() => interpreter.evaluate(name)) }));

  // --- Covenants and baskets: present in every file ---
  snapshot.covenants = attempt(() => byName(interpreter.checkAllCovenants()));
  snapshot.baskets = attempt(() => byName(interpreter.getAllBasketStatuses()));

  // --- Multi-period ---
  if (interpreter.hasMultiPeriodData()) {
    snapshot.periods = interpreter.getAvailablePeriods();
    snapshot.evaluationPeriod = interpreter.getEvaluationPeriod();
  }

  // --- Project finance ---
  if (interpreter.hasPhases()) {
    snapshot.phase = {
      current: interpreter.getCurrentPhase(),
      active: [...interpreter.getActiveCovenants()].sort(),
      suspended: [...interpreter.getSuspendedCovenants()].sort(),
      required: [...interpreter.getRequiredCovenants()].sort(),
      transitions: attempt(() => interpreter.checkPhaseTransitions()),
    };
  }

  if (interpreter.hasMilestones()) {
    snapshot.milestones = attempt(() => byName(interpreter.getAllMilestoneStatuses(AS_OF)));
  }

  if (interpreter.hasReserves()) {
    snapshot.reserves = attempt(() => byName(interpreter.getAllReserveStatuses()));
  }

  if (interpreter.hasConditionsPrecedent()) {
    snapshot.conditionsPrecedent = attempt(() =>
      byName(
        interpreter
          .getCPChecklistNames()
          .map((name) => interpreter.getCPChecklist(name))
      )
    );
  }

  // --- v2.1 industry constructs ---
  if (interpreter.hasTechnicalMilestones()) {
    snapshot.technicalMilestones = attempt(() =>
      byName(interpreter.getAllTechnicalMilestoneStatuses(AS_OF))
    );
  }

  if (interpreter.hasRegulatoryRequirements()) {
    snapshot.regulatoryRequirements = attempt(() =>
      byName(interpreter.getAllRegulatoryRequirementStatuses())
    );
  }

  if (interpreter.hasPerformanceGuarantees()) {
    snapshot.performanceGuarantees = attempt(() =>
      byName(interpreter.getAllPerformanceGuaranteeStatuses())
    );
  }

  if (interpreter.hasSeasonalAdjustments()) {
    snapshot.seasonalAdjustments = attempt(() =>
      byName(interpreter.getAllSeasonalAdjustmentStatuses())
    );
  }

  return snapshot;
}

async function loadExample(proviso: string, data?: string): Promise<ProVisoInterpreter> {
  const source = await readFile(`examples/${proviso}`, 'utf-8');
  const interpreter = new ProVisoInterpreter(await parseOrThrow(source));

  if (data) {
    const raw = JSON.parse(await readFile(`examples/${data}`, 'utf-8')) as Record<string, unknown>;
    interpreter.loadFinancialsFromFile(raw);
  }

  return interpreter;
}

describe('Golden files — shipped example deals', () => {
  for (const { proviso, data } of EXAMPLES) {
    it(`${proviso} evaluates identically`, async () => {
      const interpreter = await loadExample(proviso, data);
      expect(snapshotOf(interpreter)).toMatchSnapshot();
    });
  }

  it('produces a stable snapshot across repeated evaluation', async () => {
    // Guards the class of bug this gate exists to catch: state that leaks
    // between evaluations (caches, restored-but-not-really financials).
    const interpreter = await loadExample('corporate_revolver.proviso', 'q3_2024_financials.json');

    const first = JSON.stringify(snapshotOf(interpreter));
    interpreter.simulate({ funded_debt: 999_000_000 });
    const second = JSON.stringify(snapshotOf(interpreter));

    expect(second).toBe(first);
  });

  it('pins evaluation to AS_OF rather than the wall clock', async () => {
    // If any snapshotted call starts reading the real clock, this fails long
    // before the snapshots start churning for mysterious reasons.
    const interpreter = await loadExample('project_finance.proviso', 'project_finance_demo.json');

    const a = JSON.stringify(snapshotOf(interpreter));
    const b = JSON.stringify(snapshotOf(interpreter));

    expect(a).toBe(b);
  });
});
