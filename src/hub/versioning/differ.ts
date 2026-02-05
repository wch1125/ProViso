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
