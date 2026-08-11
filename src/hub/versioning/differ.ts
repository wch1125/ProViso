/**
 * ProViso Hub v2.0 — State Differ
 *
 * Compiles ProViso code into a structured state and diffs two states
 * to produce a list of changes. This is the foundation for change tracking.
 */

import { parse as parseAsync } from '../../parser.js';
import type {
  Statement,
  DefineStatement,
  CovenantStatement,
  BasketStatement,
  ConditionStatement,
  ProhibitStatement,
  EventStatement,
  PhaseStatement,
  TransitionStatement,
  MilestoneStatement,
  ReserveStatement,
  WaterfallStatement,
  ConditionsPrecedentStatement,
  FacilityStatement,
  TrancheStatement,
  PricingGridStatement,
  SweepStatement,
  ExcessCashFlowStatement,
  DistributionLockupStatement,
  Expression,
} from '../../types.js';
import type { ElementType, ChangeType } from '../types.js';

// =============================================================================
// COMPILED STATE
// =============================================================================

/**
 * Compiled state of a ProViso agreement.
 * Extracts all named elements into Maps for easy comparison.
 */
export interface CompiledState {
  /** DEFINE statements by name */
  definitions: Map<string, DefineStatement>;
  /** COVENANT statements by name */
  covenants: Map<string, CovenantStatement>;
  /** BASKET statements by name */
  baskets: Map<string, BasketStatement>;
  /** CONDITION statements by name */
  conditions: Map<string, ConditionStatement>;
  /** PROHIBIT statements by target */
  prohibitions: Map<string, ProhibitStatement>;
  /** EVENT statements by name */
  events: Map<string, EventStatement>;
  /** PHASE statements by name */
  phases: Map<string, PhaseStatement>;
  /** TRANSITION statements by name */
  transitions: Map<string, TransitionStatement>;
  /** MILESTONE statements by name */
  milestones: Map<string, MilestoneStatement>;
  /** RESERVE statements by name */
  reserves: Map<string, ReserveStatement>;
  /** WATERFALL statements by name */
  waterfalls: Map<string, WaterfallStatement>;
  /** CONDITIONS_PRECEDENT statements by name */
  conditionsPrecedent: Map<string, ConditionsPrecedentStatement>;
  /** FACILITY statements by name */
  facilities: Map<string, FacilityStatement>;
  /** PRICING_GRID statements by name */
  pricingGrids: Map<string, PricingGridStatement>;
  /** SWEEP statements by name */
  sweeps: Map<string, SweepStatement>;
  /** EXCESS_CASH_FLOW statements by name */
  excessCashFlows: Map<string, ExcessCashFlowStatement>;
  /** DISTRIBUTION_LOCKUP statements by name */
  distributionLockups: Map<string, DistributionLockupStatement>;
  /** Raw source code */
  sourceCode: string;
  /** Parse errors if any */
  parseError: string | null;
}

/**
 * A diff between two elements.
 */
export interface ElementDiff {
  /** Type of change */
  changeType: ChangeType;
  /** Type of element that changed */
  elementType: ElementType;
  /** Name of the element */
  elementName: string;
  /** Element from the "from" state (null if added) */
  fromElement: Statement | null;
  /** Element from the "to" state (null if removed) */
  toElement: Statement | null;
  /** Specific field changes for modified elements */
  fieldChanges: FieldChange[];
}

/**
 * A change to a specific field within an element.
 */
export interface FieldChange {
  /** Name of the field that changed */
  field: string;
  /** Value before (stringified) */
  fromValue: string | null;
  /** Value after (stringified) */
  toValue: string | null;
}

/**
 * Result of diffing two states.
 */
export interface DiffResult {
  /** Whether both states parsed successfully */
  success: boolean;
  /** Parse error from "from" version */
  fromError: string | null;
  /** Parse error from "to" version */
  toError: string | null;
  /** List of element diffs */
  diffs: ElementDiff[];
  /** Statistics */
  stats: DiffStats;
}

/**
 * Statistics about the diff.
 */
export interface DiffStats {
  totalChanges: number;
  added: number;
  removed: number;
  modified: number;
  byType: Record<ElementType, number>;
}

// =============================================================================
// STATE COMPILATION
// =============================================================================

/**
 * Compile ProViso code into a structured state.
 */
export async function compileToState(code: string): Promise<CompiledState> {
  const state: CompiledState = {
    definitions: new Map(),
    covenants: new Map(),
    baskets: new Map(),
    conditions: new Map(),
    prohibitions: new Map(),
    events: new Map(),
    phases: new Map(),
    transitions: new Map(),
    milestones: new Map(),
    reserves: new Map(),
    waterfalls: new Map(),
    conditionsPrecedent: new Map(),
    facilities: new Map(),
    pricingGrids: new Map(),
    sweeps: new Map(),
    excessCashFlows: new Map(),
    distributionLockups: new Map(),
    sourceCode: code,
    parseError: null,
  };

  const parseResult = await parseAsync(code);
  if (!parseResult.success || !parseResult.ast) {
    state.parseError = parseResult.error?.message ?? 'Unknown parse error';
    return state;
  }

  for (const stmt of parseResult.ast.statements) {
    switch (stmt.type) {
      case 'Define':
        state.definitions.set(stmt.name, stmt);
        break;
      case 'Covenant':
        state.covenants.set(stmt.name, stmt);
        break;
      case 'Basket':
        state.baskets.set(stmt.name, stmt);
        break;
      case 'Condition':
        state.conditions.set(stmt.name, stmt);
        break;
      case 'Prohibit':
        state.prohibitions.set(stmt.target, stmt);
        break;
      case 'Event':
        state.events.set(stmt.name, stmt);
        break;
      case 'Phase':
        state.phases.set(stmt.name, stmt);
        break;
      case 'Transition':
        state.transitions.set(stmt.name, stmt);
        break;
      case 'Milestone':
        state.milestones.set(stmt.name, stmt);
        break;
      case 'Reserve':
        state.reserves.set(stmt.name, stmt);
        break;
      case 'Waterfall':
        state.waterfalls.set(stmt.name, stmt);
        break;
      case 'ConditionsPrecedent':
        state.conditionsPrecedent.set(stmt.name, stmt);
        break;
      case 'Facility':
        state.facilities.set(stmt.name, stmt);
        break;
      case 'PricingGrid':
        state.pricingGrids.set(stmt.name, stmt);
        break;
      case 'Sweep':
        state.sweeps.set(stmt.name, stmt);
        break;
      case 'ExcessCashFlow':
        state.excessCashFlows.set(stmt.name, stmt);
        break;
      case 'DistributionLockup':
        state.distributionLockups.set(stmt.name, stmt);
        break;
      // Skip: Comment, Load, Amendment (amendments are applied separately)
    }
  }

  return state;
}

// =============================================================================
// STATE DIFFING
// =============================================================================

/**
 * Diff two compiled states and return the list of changes.
 */
export function diffStates(fromState: CompiledState, toState: CompiledState): DiffResult {
  const diffs: ElementDiff[] = [];

  // Check for parse errors
  if (fromState.parseError || toState.parseError) {
    return {
      success: false,
      fromError: fromState.parseError,
      toError: toState.parseError,
      diffs: [],
      stats: emptyStats(),
    };
  }

  // Diff each element type
  diffMaps(fromState.definitions, toState.definitions, 'definition', diffs);
  diffMaps(fromState.covenants, toState.covenants, 'covenant', diffs);
  diffMaps(fromState.baskets, toState.baskets, 'basket', diffs);
  diffMaps(fromState.conditions, toState.conditions, 'condition', diffs);
  diffMaps(fromState.prohibitions, toState.prohibitions, 'other', diffs); // Prohibit uses target, not name
  diffMaps(fromState.events, toState.events, 'other', diffs);
  diffMaps(fromState.phases, toState.phases, 'phase', diffs);
  diffMaps(fromState.transitions, toState.transitions, 'other', diffs);
  diffMaps(fromState.milestones, toState.milestones, 'milestone', diffs);
  diffMaps(fromState.reserves, toState.reserves, 'reserve', diffs);
  diffMaps(fromState.waterfalls, toState.waterfalls, 'waterfall', diffs);
  diffMaps(fromState.conditionsPrecedent, toState.conditionsPrecedent, 'cp', diffs);
  diffMaps(fromState.facilities, toState.facilities, 'facility', diffs);
  diffMaps(fromState.pricingGrids, toState.pricingGrids, 'facility', diffs);
  diffMaps(fromState.sweeps, toState.sweeps, 'facility', diffs);
  diffMaps(fromState.excessCashFlows, toState.excessCashFlows, 'facility', diffs);
  diffMaps(fromState.distributionLockups, toState.distributionLockups, 'waterfall', diffs);

  // Compute stats
  const stats = computeStats(diffs);

  return {
    success: true,
    fromError: null,
    toError: null,
    diffs,
    stats,
  };
}

/**
 * Diff two maps of elements.
 */
function diffMaps<T extends Statement>(
  fromMap: Map<string, T>,
  toMap: Map<string, T>,
  elementType: ElementType,
  diffs: ElementDiff[]
): void {
  // Find removed elements
  for (const [name, fromElement] of fromMap) {
    if (!toMap.has(name)) {
      diffs.push({
        changeType: 'removed',
        elementType,
        elementName: name,
        fromElement,
        toElement: null,
        fieldChanges: [],
      });
    }
  }

  // Find added or modified elements
  for (const [name, toElement] of toMap) {
    const fromElement = fromMap.get(name);
    if (!fromElement) {
      diffs.push({
        changeType: 'added',
        elementType,
        elementName: name,
        fromElement: null,
        toElement,
        fieldChanges: [],
      });
    } else {
      // Check if modified
      const fieldChanges = diffElements(fromElement, toElement);
      if (fieldChanges.length > 0) {
        diffs.push({
          changeType: 'modified',
          elementType,
          elementName: name,
          fromElement,
          toElement,
          fieldChanges,
        });
      }
    }
  }
}

/**
 * Compare two elements and return field-level changes.
 */
function diffElements(fromElement: Statement, toElement: Statement): FieldChange[] {
  const changes: FieldChange[] = [];

  // Compare based on statement type
  switch (fromElement.type) {
    case 'Covenant':
      diffCovenants(fromElement, toElement as CovenantStatement, changes);
      break;
    case 'Basket':
      diffBaskets(fromElement, toElement as BasketStatement, changes);
      break;
    case 'Define':
      diffDefinitions(fromElement, toElement as DefineStatement, changes);
      break;
    case 'Condition':
      diffConditions(fromElement, toElement as ConditionStatement, changes);
      break;
    case 'Phase':
      diffPhases(fromElement, toElement as PhaseStatement, changes);
      break;
    case 'Milestone':
      diffMilestones(fromElement, toElement as MilestoneStatement, changes);
      break;
    case 'Reserve':
      diffReserves(fromElement, toElement as ReserveStatement, changes);
      break;
    case 'Facility':
      diffFacilities(fromElement, toElement as FacilityStatement, changes);
      break;
    case 'PricingGrid':
      diffPricingGrids(fromElement, toElement as PricingGridStatement, changes);
      break;
    case 'Sweep':
      diffSweeps(fromElement, toElement as SweepStatement, changes);
      break;
    case 'ExcessCashFlow':
      diffExcessCashFlows(fromElement, toElement as ExcessCashFlowStatement, changes);
      break;
    case 'DistributionLockup':
      diffDistributionLockups(fromElement, toElement as DistributionLockupStatement, changes);
      break;
    case 'Waterfall':
      diffWaterfalls(fromElement, toElement as WaterfallStatement, changes);
      break;
    default:
      // Generic comparison for other types
      if (JSON.stringify(fromElement) !== JSON.stringify(toElement)) {
        changes.push({
          field: 'content',
          fromValue: JSON.stringify(fromElement),
          toValue: JSON.stringify(toElement),
        });
      }
  }

  return changes;
}

/**
 * Compare two covenants.
 */
function diffCovenants(from: CovenantStatement, to: CovenantStatement, changes: FieldChange[]): void {
  // Compare requires expression
  const fromReq = expressionToString(from.requires);
  const toReq = expressionToString(to.requires);
  if (fromReq !== toReq) {
    changes.push({ field: 'requires', fromValue: fromReq, toValue: toReq });
  }

  // Compare tested frequency
  if (from.tested !== to.tested) {
    changes.push({ field: 'tested', fromValue: from.tested, toValue: to.tested });
  }

  // Compare cure mechanism
  const fromCure = from.cure ? JSON.stringify(from.cure) : null;
  const toCure = to.cure ? JSON.stringify(to.cure) : null;
  if (fromCure !== toCure) {
    changes.push({ field: 'cure', fromValue: fromCure, toValue: toCure });
  }

  // Compare breach
  if (from.breach !== to.breach) {
    changes.push({ field: 'breach', fromValue: from.breach, toValue: to.breach });
  }
}

/**
 * Compare two baskets.
 */
function diffBaskets(from: BasketStatement, to: BasketStatement, changes: FieldChange[]): void {
  // Compare capacity
  const fromCap = expressionToString(from.capacity);
  const toCap = expressionToString(to.capacity);
  if (fromCap !== toCap) {
    changes.push({ field: 'capacity', fromValue: fromCap, toValue: toCap });
  }

  // Compare floor
  const fromFloor = expressionToString(from.floor);
  const toFloor = expressionToString(to.floor);
  if (fromFloor !== toFloor) {
    changes.push({ field: 'floor', fromValue: fromFloor, toValue: toFloor });
  }

  // Compare buildsFrom
  const fromBuilds = expressionToString(from.buildsFrom);
  const toBuilds = expressionToString(to.buildsFrom);
  if (fromBuilds !== toBuilds) {
    changes.push({ field: 'buildsFrom', fromValue: fromBuilds, toValue: toBuilds });
  }

  // Compare starting
  const fromStarting = expressionToString(from.starting);
  const toStarting = expressionToString(to.starting);
  if (fromStarting !== toStarting) {
    changes.push({ field: 'starting', fromValue: fromStarting, toValue: toStarting });
  }

  // Compare maximum
  const fromMax = expressionToString(from.maximum);
  const toMax = expressionToString(to.maximum);
  if (fromMax !== toMax) {
    changes.push({ field: 'maximum', fromValue: fromMax, toValue: toMax });
  }

  // Compare subjectTo
  const fromSubject = from.subjectTo?.join(', ') ?? null;
  const toSubject = to.subjectTo?.join(', ') ?? null;
  if (fromSubject !== toSubject) {
    changes.push({ field: 'subjectTo', fromValue: fromSubject, toValue: toSubject });
  }
}

/**
 * Compare two definitions.
 */
function diffDefinitions(from: DefineStatement, to: DefineStatement, changes: FieldChange[]): void {
  // Compare expression
  const fromExpr = expressionToString(from.expression);
  const toExpr = expressionToString(to.expression);
  if (fromExpr !== toExpr) {
    changes.push({ field: 'expression', fromValue: fromExpr, toValue: toExpr });
  }

  // Compare modifiers
  const fromMods = JSON.stringify(from.modifiers);
  const toMods = JSON.stringify(to.modifiers);
  if (fromMods !== toMods) {
    changes.push({ field: 'modifiers', fromValue: fromMods, toValue: toMods });
  }
}

/**
 * Compare two conditions.
 */
function diffConditions(from: ConditionStatement, to: ConditionStatement, changes: FieldChange[]): void {
  const fromExpr = expressionToString(from.expression);
  const toExpr = expressionToString(to.expression);
  if (fromExpr !== toExpr) {
    changes.push({ field: 'expression', fromValue: fromExpr, toValue: toExpr });
  }
}

/**
 * Compare two phases.
 */
function diffPhases(from: PhaseStatement, to: PhaseStatement, changes: FieldChange[]): void {
  if (from.until !== to.until) {
    changes.push({ field: 'until', fromValue: from.until, toValue: to.until });
  }
  if (from.from !== to.from) {
    changes.push({ field: 'from', fromValue: from.from, toValue: to.from });
  }

  const fromSuspended = from.covenantsSuspended.join(', ');
  const toSuspended = to.covenantsSuspended.join(', ');
  if (fromSuspended !== toSuspended) {
    changes.push({ field: 'covenantsSuspended', fromValue: fromSuspended, toValue: toSuspended });
  }

  const fromActive = from.covenantsActive.join(', ');
  const toActive = to.covenantsActive.join(', ');
  if (fromActive !== toActive) {
    changes.push({ field: 'covenantsActive', fromValue: fromActive, toValue: toActive });
  }

  compareLists('requiredCovenants', from.requiredCovenants, to.requiredCovenants, changes);
}

/**
 * Push a FieldChange when two scalar values differ.
 * Everything the Word generator renders must be compared, or a real edit
 * shows up as "no change" in the party-vs-party diff.
 */
function compareScalars(
  field: string,
  fromValue: string | null | undefined,
  toValue: string | null | undefined,
  changes: FieldChange[]
): void {
  const a = fromValue ?? null;
  const b = toValue ?? null;
  if (a !== b) {
    changes.push({ field, fromValue: a, toValue: b });
  }
}

/** Push a FieldChange when two string lists differ, order-sensitively. */
function compareLists(
  field: string,
  fromValue: string[] | null | undefined,
  toValue: string[] | null | undefined,
  changes: FieldChange[]
): void {
  const a = (fromValue ?? []).join(', ');
  const b = (toValue ?? []).join(', ');
  if (a !== b) {
    changes.push({ field, fromValue: a || null, toValue: b || null });
  }
}

/**
 * Compare a field that may hold a plain identifier or a nested ALL_OF/ANY_OF
 * condition, by structural serialisation.
 */
function compareStructured(
  field: string,
  fromValue: unknown,
  toValue: unknown,
  changes: FieldChange[]
): void {
  const serialise = (v: unknown): string | null => {
    if (v === null || v === undefined) return null;
    return typeof v === 'string' ? v : JSON.stringify(v);
  };
  const a = serialise(fromValue);
  const b = serialise(toValue);
  if (a !== b) {
    changes.push({ field, fromValue: a, toValue: b });
  }
}

/**
 * Compare two milestones.
 */
function diffMilestones(from: MilestoneStatement, to: MilestoneStatement, changes: FieldChange[]): void {
  if (from.targetDate !== to.targetDate) {
    changes.push({ field: 'targetDate', fromValue: from.targetDate, toValue: to.targetDate });
  }
  if (from.longstopDate !== to.longstopDate) {
    changes.push({ field: 'longstopDate', fromValue: from.longstopDate, toValue: to.longstopDate });
  }

  const fromTriggers = from.triggers.join(', ');
  const toTriggers = to.triggers.join(', ');
  if (fromTriggers !== toTriggers) {
    changes.push({ field: 'triggers', fromValue: fromTriggers, toValue: toTriggers });
  }

  // REQUIRES may be a bare identifier or a nested ALL_OF/ANY_OF condition.
  compareStructured('requires', from.requires, to.requires, changes);
}

/**
 * Compare two distribution lock-ups.
 *
 * A tightened DSCR threshold is one of the most consequential changes in a
 * project financing — it decides whether the sponsor sees cash — so every
 * test, reserve condition and the trap destination are compared.
 */
function diffDistributionLockups(
  from: DistributionLockupStatement,
  to: DistributionLockupStatement,
  changes: FieldChange[]
): void {
  const most = Math.max(from.tests.length, to.tests.length);
  for (let i = 0; i < most; i++) {
    const before = from.tests[i];
    const after = to.tests[i];
    compareScalars(
      `test.${i + 1}`,
      before === undefined ? null : expressionToString(before),
      after === undefined ? null : expressionToString(after),
      changes
    );
  }

  compareLists('reservesFunded', from.reservesFunded, to.reservesFunded, changes);
  compareScalars('trapTo', from.trapTo, to.trapTo, changes);
  compareScalars(
    'requiresNoDefault',
    String(from.requiresNoDefault),
    String(to.requiresNoDefault),
    changes
  );
}

/**
 * Compare two sweeps.
 *
 * The percentage schedule and the tranches a prepayment lands on are both
 * negotiated terms; a sweep stepping from 75% to 50% must not read as
 * "no change".
 */
function diffSweeps(from: SweepStatement, to: SweepStatement, changes: FieldChange[]): void {
  compareScalars('source', from.source, to.source, changes);
  compareScalars('basedOn', from.basedOn, to.basedOn, changes);
  compareLists('appliedTo', from.appliedTo, to.appliedTo, changes);

  const describe = (level: SweepStatement['levels'][number]): string => {
    const threshold = level.threshold === null
      ? 'otherwise'
      : `${level.operator ?? ''} ${expressionToString(level.threshold) ?? ''}`.trim();
    return `${threshold} -> ${expressionToString(level.percentage) ?? ''}`;
  };

  const most = Math.max(from.levels.length, to.levels.length);
  for (let i = 0; i < most; i++) {
    const a = from.levels[i];
    const b = to.levels[i];
    compareScalars(`level.${i + 1}`, a ? describe(a) : null, b ? describe(b) : null, changes);
  }
}

/**
 * Compare two ECF stacks. The deduction list is the whole definition, so it
 * is compared item by item and in order.
 */
function diffExcessCashFlows(
  from: ExcessCashFlowStatement,
  to: ExcessCashFlowStatement,
  changes: FieldChange[]
): void {
  compareScalars(
    'startingFrom',
    expressionToString(from.startingFrom),
    expressionToString(to.startingFrom),
    changes
  );

  const most = Math.max(from.deductions.length, to.deductions.length);
  for (let i = 0; i < most; i++) {
    const a = from.deductions[i];
    const b = to.deductions[i];
    compareScalars(
      `deduction.${i + 1}`,
      a ? `${a.label}: ${expressionToString(a.amount) ?? ''}` : null,
      b ? `${b.label}: ${expressionToString(b.amount) ?? ''}` : null,
      changes
    );
  }
}

/**
 * Compare two pricing grids level by level.
 *
 * A repricing is one of the most negotiated changes in a deal, and it lives
 * entirely in the level thresholds and margins — comparing only the grid name
 * would report no change on a full repricing.
 */
function diffPricingGrids(
  from: PricingGridStatement,
  to: PricingGridStatement,
  changes: FieldChange[]
): void {
  compareScalars('basedOn', from.basedOn, to.basedOn, changes);

  const describe = (level: PricingGridStatement['levels'][number]): string => {
    const threshold = level.threshold === null
      ? 'otherwise'
      : `${level.operator ?? ''} ${expressionToString(level.threshold) ?? ''}`.trim();
    return `${threshold} -> ${expressionToString(level.margin) ?? ''}`;
  };

  const most = Math.max(from.levels.length, to.levels.length);
  for (let i = 0; i < most; i++) {
    const a = from.levels[i];
    const b = to.levels[i];
    compareScalars(
      `level.${i + 1}`,
      a ? describe(a) : null,
      b ? describe(b) : null,
      changes
    );
  }
}

/**
 * Compare two facilities, tranche by tranche.
 *
 * Commitments, margins and maturities are among the most-negotiated terms in a
 * deal, so a facility diff has to descend into tranches — comparing only
 * facility-level fields would report "no change" when a revolver commitment
 * moved by $50M. Tranches are matched by name; added and removed ones are
 * reported as field changes rather than silently ignored.
 */
function diffFacilities(from: FacilityStatement, to: FacilityStatement, changes: FieldChange[]): void {
  compareScalars('benchmark', expressionToString(from.benchmark), expressionToString(to.benchmark), changes);
  compareScalars(
    'cashNettingCap',
    expressionToString(from.cashNettingCap),
    expressionToString(to.cashNettingCap),
    changes
  );
  compareScalars(
    'commitmentFee',
    expressionToString(from.commitmentFee),
    expressionToString(to.commitmentFee),
    changes
  );
  compareScalars('lcFee', expressionToString(from.lcFee), expressionToString(to.lcFee), changes);

  const fromTranches = new Map(from.tranches.map((t) => [t.name, t]));
  const toTranches = new Map(to.tranches.map((t) => [t.name, t]));

  for (const [name, fromTranche] of fromTranches) {
    const toTranche = toTranches.get(name);
    if (!toTranche) {
      changes.push({ field: `tranche.${name}`, fromValue: 'present', toValue: null });
      continue;
    }
    diffTranche(name, fromTranche, toTranche, changes);
  }

  for (const [name] of toTranches) {
    if (!fromTranches.has(name)) {
      changes.push({ field: `tranche.${name}`, fromValue: null, toValue: 'present' });
    }
  }
}

/** Compare every negotiated field on a single tranche. */
function diffTranche(
  name: string,
  from: TrancheStatement,
  to: TrancheStatement,
  changes: FieldChange[]
): void {
  const field = (suffix: string): string => `tranche.${name}.${suffix}`;

  compareScalars(field('type'), from.trancheType, to.trancheType, changes);
  compareScalars(field('pricingGrid'), from.pricingGrid, to.pricingGrid, changes);
  compareScalars(field('maturity'), from.maturity, to.maturity, changes);

  const expressionFields: Array<[string, keyof TrancheStatement]> = [
    ['commitment', 'commitment'],
    ['drawn', 'drawn'],
    ['margin', 'margin'],
    ['amortization', 'amortization'],
    ['lcOutstanding', 'lcOutstanding'],
    ['lcSublimit', 'lcSublimit'],
  ];

  for (const [label, key] of expressionFields) {
    compareScalars(
      field(label),
      expressionToString(from[key] as Parameters<typeof expressionToString>[0]),
      expressionToString(to[key] as Parameters<typeof expressionToString>[0]),
      changes
    );
  }
}

/**
 * Compare two reserves.
 */
function diffReserves(from: ReserveStatement, to: ReserveStatement, changes: FieldChange[]): void {
  const fromTarget = expressionToString(from.target);
  const toTarget = expressionToString(to.target);
  if (fromTarget !== toTarget) {
    changes.push({ field: 'target', fromValue: fromTarget, toValue: toTarget });
  }

  const fromMin = expressionToString(from.minimum);
  const toMin = expressionToString(to.minimum);
  if (fromMin !== toMin) {
    changes.push({ field: 'minimum', fromValue: fromMin, toValue: toMin });
  }

  // All three are rendered into the Word document, so a change to any of them
  // is a real change the diff must report.
  compareLists('fundedBy', from.fundedBy, to.fundedBy, changes);
  compareScalars('releasedTo', from.releasedTo, to.releasedTo, changes);
  compareScalars('releasedFor', from.releasedFor, to.releasedFor, changes);
}

/**
 * Compare two waterfalls (simplified - just check if tiers changed).
 */
function diffWaterfalls(from: WaterfallStatement, to: WaterfallStatement, changes: FieldChange[]): void {
  if (from.frequency !== to.frequency) {
    changes.push({ field: 'frequency', fromValue: from.frequency, toValue: to.frequency });
  }

  const fromTiers = JSON.stringify(from.tiers);
  const toTiers = JSON.stringify(to.tiers);
  if (fromTiers !== toTiers) {
    changes.push({ field: 'tiers', fromValue: `${from.tiers.length} tiers`, toValue: `${to.tiers.length} tiers` });
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Convert an expression to a readable string for comparison.
 */
export function expressionToString(expr: Expression | null | undefined): string | null {
  if (expr === null || expr === undefined) return null;

  if (typeof expr === 'string') return expr;
  if (typeof expr === 'number') return expr.toString();

  switch (expr.type) {
    case 'Number':
      return expr.value.toString();
    case 'Currency':
      return `$${expr.value.toLocaleString()}`;
    case 'Percentage':
      return `${expr.value}%`;
    case 'Ratio':
      return `${expr.value}x`;
    case 'BinaryExpression':
      return `(${expressionToString(expr.left)} ${expr.operator} ${expressionToString(expr.right)})`;
    case 'UnaryExpression':
      return `${expr.operator}${expressionToString(expr.argument)}`;
    case 'Comparison':
      return `${expressionToString(expr.left)} ${expr.operator} ${expressionToString(expr.right)}`;
    case 'FunctionCall':
      return `${expr.name}(${expr.arguments.map(expressionToString).join(', ')})`;
    case 'Trailing':
      return `TRAILING ${expr.count} ${expr.period.toUpperCase()} OF ${expressionToString(expr.expression)}`;
    default:
      return JSON.stringify(expr);
  }
}

/**
 * Create empty stats object.
 */
function emptyStats(): DiffStats {
  return {
    totalChanges: 0,
    added: 0,
    removed: 0,
    modified: 0,
    byType: {
      covenant: 0,
      basket: 0,
      definition: 0,
      condition: 0,
      phase: 0,
      milestone: 0,
      reserve: 0,
      waterfall: 0,
      cp: 0,
      facility: 0,
      other: 0,
    },
  };
}

/**
 * Compute statistics from diffs.
 */
function computeStats(diffs: ElementDiff[]): DiffStats {
  const stats = emptyStats();

  for (const diff of diffs) {
    stats.totalChanges++;
    stats[diff.changeType]++;
    stats.byType[diff.elementType]++;
  }

  return stats;
}
