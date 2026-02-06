// ProViso Type Definitions

// ==================== AST NODES ====================

export interface Program {
  type: 'Program';
  statements: Statement[];
}

export type Statement =
  | DefineStatement
  | CovenantStatement
  | BasketStatement
  | ConditionStatement
  | ProhibitStatement
  | EventStatement
  | LoadStatement
  | CommentStatement
  | AmendmentStatement
  | PhaseStatement
  | TransitionStatement
  | MilestoneStatement
  | TechnicalMilestoneStatement
  | RegulatoryRequirementStatement
  | PerformanceGuaranteeStatement
  | DegradationScheduleStatement
  | SeasonalAdjustmentStatement
  | TaxEquityStructureStatement
  | TaxCreditStatement
  | DepreciationStatement
  | FlipEventStatement
  | ReserveStatement
  | WaterfallStatement
  | ConditionsPrecedentStatement;

export interface DefineStatement {
  type: 'Define';
  name: string;
  expression: Expression;
  modifiers: DefineModifiers;
}

export interface DefineModifiers {
  excluding?: string[];
  cap?: Expression;
}

export interface StepDownEntry {
  /** Date after which this threshold takes effect (YYYY-MM-DD) */
  afterDate: string;
  /** The new threshold value */
  threshold: Expression;
}

export interface CovenantStatement {
  type: 'Covenant';
  name: string;
  requires: Expression | null;
  tested: Frequency | null;
  cure: CureMechanism | null;
  breach: string | null;
  /** Step-down schedule: threshold changes over time */
  stepDown: StepDownEntry[] | null;
}

export type Frequency = 'quarterly' | 'annually' | 'monthly';

export interface CureMechanism {
  type: 'EquityCure' | 'PaymentCure';
  details: CureDetails;
}

export interface CureDetails {
  maxUses?: number;
  overPeriod?: string;
  maxAmount?: Expression;
  curePeriod?: Duration;
}

export interface BasketStatement {
  type: 'Basket';
  name: string;
  capacity: Expression | null;
  plus: Expression[];
  subjectTo: string[] | null;
  // Grower basket: minimum floor for the capacity
  floor: Expression | null;
  // Builder basket: expression that adds to capacity over time
  buildsFrom: Expression | null;
  // Builder basket: starting capacity amount
  starting: Expression | null;
  // Builder basket: maximum capacity cap
  maximum: Expression | null;
}

export interface ConditionStatement {
  type: 'Condition';
  name: string;
  expression: Expression;
}

export interface ProhibitStatement {
  type: 'Prohibit';
  target: string;
  exceptions: ExceptClause[];
}

export type ExceptClause = ExceptWhenClause | NotwithstandingClause;

export interface ExceptWhenClause {
  type: 'ExceptWhen';
  conditions: Expression[];
  notwithstanding?: string;
}

export interface NotwithstandingClause {
  type: 'Notwithstanding';
  reference: string;
}

export interface EventStatement {
  type: 'Event';
  name: string;
  triggers: Expression | null;
  gracePeriod: Duration | null;
  consequence: string | null;
}

export interface LoadStatement {
  type: 'Load';
  source: LoadSource;
}

export type LoadSource = FileSource | InlineSource;

export interface FileSource {
  type: 'file';
  path: string;
}

export interface InlineSource {
  type: 'inline';
  data: Record<string, unknown>;
}

export interface CommentStatement {
  type: 'Comment';
  text: string;
}

// ==================== EXPRESSIONS ====================

export type Expression =
  | string // Identifier
  | number
  | NumberLiteral
  | CurrencyLiteral
  | PercentageLiteral
  | RatioLiteral
  | BinaryExpression
  | UnaryExpression
  | ComparisonExpression
  | FunctionCallExpression
  | TrailingExpression;

export interface NumberLiteral {
  type: 'Number';
  value: number;
}

export interface CurrencyLiteral {
  type: 'Currency';
  value: number;
}

export interface PercentageLiteral {
  type: 'Percentage';
  value: number;
  unit?: 'bps';
}

export interface RatioLiteral {
  type: 'Ratio';
  value: number;
}

export interface BinaryExpression {
  type: 'BinaryExpression';
  operator: '+' | '-' | '*' | '/' | 'AND' | 'OR';
  left: Expression;
  right: Expression;
}

export interface UnaryExpression {
  type: 'UnaryExpression';
  operator: '-' | 'NOT';
  argument: Expression;
}

export interface ComparisonExpression {
  type: 'Comparison';
  operator: '<=' | '>=' | '<' | '>' | '=' | '!=';
  left: Expression;
  right: Expression;
}

export interface FunctionCallExpression {
  type: 'FunctionCall';
  name: string;
  arguments: Expression[];
}

/**
 * Trailing expression for period-based calculations.
 * Example: TRAILING 4 QUARTERS OF EBITDA
 */
export interface TrailingExpression {
  type: 'Trailing';
  /** Number of periods to include */
  count: number;
  /** Type of periods (quarters, months, years) */
  period: 'quarters' | 'months' | 'years';
  /** Expression to evaluate for each period */
  expression: Expression;
}

/**
 * Type guard for TrailingExpression
 */
export function isTrailingExpression(expr: Expression): expr is TrailingExpression {
  return isObjectExpression(expr) && expr.type === 'Trailing';
}

export interface Duration {
  type: 'Duration';
  amount: number;
  unit: 'days' | 'months' | 'years';
}

// ==================== TYPE GUARDS ====================

/**
 * Union type of all object-based expressions (excludes string and number primitives)
 */
export type ObjectExpression =
  | NumberLiteral
  | CurrencyLiteral
  | PercentageLiteral
  | RatioLiteral
  | BinaryExpression
  | UnaryExpression
  | ComparisonExpression
  | FunctionCallExpression
  | TrailingExpression;

/**
 * Check if an expression is an object-based expression (not a string identifier or number)
 */
export function isObjectExpression(expr: Expression): expr is ObjectExpression {
  return expr !== null && typeof expr === 'object';
}

/**
 * Check if an expression is a ComparisonExpression
 */
export function isComparisonExpression(expr: Expression): expr is ComparisonExpression {
  return isObjectExpression(expr) && expr.type === 'Comparison';
}

/**
 * Check if an expression is a BinaryExpression
 */
export function isBinaryExpression(expr: Expression): expr is BinaryExpression {
  return isObjectExpression(expr) && expr.type === 'BinaryExpression';
}

/**
 * Check if an expression is a UnaryExpression
 */
export function isUnaryExpression(expr: Expression): expr is UnaryExpression {
  return isObjectExpression(expr) && expr.type === 'UnaryExpression';
}

/**
 * Check if an expression is a FunctionCallExpression
 */
export function isFunctionCallExpression(expr: Expression): expr is FunctionCallExpression {
  return isObjectExpression(expr) && expr.type === 'FunctionCall';
}

// ==================== RUNTIME TYPES ====================

/**
 * Simple financial data - a flat record of metric names to values.
 * This is the original format and is still fully supported.
 */
export type SimpleFinancialData = Record<string, number>;

/**
 * Period-specific financial data with period identification.
 */
export interface PeriodData {
  /** Period identifier (e.g., "2024-Q1", "2024-Q2", "2024-12") */
  period: string;
  /** Type of period for interpretation */
  periodType: 'quarterly' | 'monthly' | 'annual';
  /** ISO date string for the period end date (e.g., "2024-03-31") */
  periodEnd: string;
  /** Financial data for this period */
  data: Record<string, number>;
}

/**
 * Multi-period financial data with multiple periods.
 */
export interface MultiPeriodFinancialData {
  /** Array of period data, typically in chronological order */
  periods: PeriodData[];
  /** Optional pre-calculated trailing values (e.g., trailing["LTM"]["EBITDA"]) */
  trailing?: Record<string, Record<string, number>>;
}

/**
 * Financial data can be either simple (flat) or multi-period.
 * The interpreter detects which format is used and handles it appropriately.
 */
export type FinancialData = SimpleFinancialData | MultiPeriodFinancialData;

/**
 * Type guard to check if financial data is multi-period format.
 */
export function isMultiPeriodData(data: unknown): data is MultiPeriodFinancialData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'periods' in data &&
    Array.isArray((data as MultiPeriodFinancialData).periods)
  );
}

/**
 * Type guard to check if data is a PeriodData object.
 */
export function isPeriodData(data: unknown): data is PeriodData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'period' in data &&
    'periodType' in data &&
    'periodEnd' in data &&
    'data' in data
  );
}

/**
 * Type guard to check if financial data is simple (flat) format.
 */
export function isSimpleFinancialData(data: unknown): data is SimpleFinancialData {
  if (typeof data !== 'object' || data === null) return false;
  // Simple data has no 'periods' key and all values are numbers
  if ('periods' in data) return false;
  return Object.values(data).every((v) => typeof v === 'number');
}

export interface CovenantResult {
  name: string;
  compliant: boolean;
  actual: number;
  threshold: number;
  operator: string;
  headroom?: number;
  /** If the covenant has a step-down schedule, the original (initial) threshold */
  originalThreshold?: number;
  /** The active step-down entry, if applicable */
  activeStep?: { afterDate: string; threshold: number };
  /** The next step-down entry (upcoming tightening), if any */
  nextStep?: { afterDate: string; threshold: number };
}

/**
 * Calculation tree node for visualizing how values are computed.
 * Used by the dashboard to show calculation drilldowns.
 */
export interface CalculationNode {
  /** Name of this calculation step (e.g., "Leverage" or "TotalDebt") */
  name: string;
  /** Computed value at this node */
  value: number;
  /** Formula used to compute this value (if any) */
  formula?: string;
  /** Child nodes that contribute to this calculation */
  children?: CalculationNode[];
  /** Source type: 'definition' for DEFINE statements, 'financial_data' for raw data, 'literal' for constants */
  source: 'definition' | 'financial_data' | 'literal' | 'computed';
  /** Raw financial data key if source is 'financial_data' */
  rawDataKey?: string;
  /** Value type for formatting */
  valueType?: 'currency' | 'ratio' | 'percentage' | 'number';
}

export interface BasketStatus {
  name: string;
  capacity: number;
  used: number;
  available: number;
  // For grower baskets: the calculated base capacity before floor
  baseCapacity?: number;
  // For grower baskets: the floor that was applied
  floor?: number;
  // For builder baskets: accumulated amount
  accumulated?: number;
  // For builder baskets: starting capacity
  starting?: number;
  // For builder baskets: maximum cap
  maximum?: number;
  // Basket classification
  basketType?: 'fixed' | 'grower' | 'builder';
}

export interface BasketLedgerEntry {
  timestamp: Date;
  basket: string;
  amount: number;
  description: string;
  // For builder baskets: whether this is an accumulation (+) or usage (-)
  entryType?: 'usage' | 'accumulation';
}

export interface QueryResult {
  permitted: boolean;
  reasoning: ReasoningStep[];
  warnings: string[];
}

export interface ReasoningStep {
  rule: string;
  evaluation: string;
  passed: boolean;
}

export interface SimulationResult {
  covenants: CovenantResult[];
  baskets: BasketStatus[];
}

export interface StatusReport {
  timestamp: Date;
  covenants: CovenantResult[];
  baskets: BasketStatus[];
  overallCompliant: boolean;
  /** Current phase (if phases are defined) */
  currentPhase?: string;
  /** Covenants that are suspended in the current phase */
  suspendedCovenants?: string[];
}

// ==================== PARSER TYPES ====================

export interface ParseErrorLocation {
  start: { line: number; column: number; offset?: number };
  end: { line: number; column: number; offset?: number };
}

export interface ParseError {
  message: string;
  location?: ParseErrorLocation;
  /** What the parser expected at the error position */
  expected?: string[];
  /** What was actually found at the error position */
  found?: string | null;
}

export interface ParseResult {
  success: boolean;
  ast?: Program;
  error?: ParseError;
  /** The source that was parsed (for error context display) */
  source?: string;
}

// ==================== VALIDATION TYPES ====================

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationIssue {
  severity: ValidationSeverity;
  message: string;
  /** The name of the undefined or problematic reference */
  reference?: string;
  /** Where the issue occurred */
  context?: string;
  /** What type of reference was expected */
  expectedType?: 'define' | 'covenant' | 'basket' | 'condition' | 'event' | 'identifier';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

// ==================== CURE RIGHTS TYPES ====================

export type CureStatus = 'breach' | 'unmatured_default' | 'cured' | 'event_of_default';

export interface CureState {
  covenantName: string;
  breachDate: Date;
  cureDeadline: Date;
  status: CureStatus;
  cureAttempts: CureAttempt[];
}

export interface CureAttempt {
  date: Date;
  mechanism: string;
  amount: number;
  successful: boolean;
}

export interface CureUsage {
  mechanism: string;
  usesRemaining: number;
  totalUses: number;
  maxUses: number;
  period: string;
}

export interface CureResult {
  success: boolean;
  reason?: string;
  curedAmount?: number;
}

export interface CovenantResultWithCure extends CovenantResult {
  cureAvailable?: boolean;
  cureState?: CureState;
  shortfall?: number;
  cureMechanism?: CureMechanism;
}

// ==================== AMENDMENT TYPES ====================

export interface AmendmentStatement {
  type: 'Amendment';
  number: number;
  effective: DateLiteral | null;
  description: string | null;
  directives: AmendmentDirective[];
}

export interface DateLiteral {
  type: 'Date';
  value: string; // ISO format: YYYY-MM-DD
}

export type AmendmentDirective =
  | ReplaceDirective
  | AddDirective
  | DeleteDirective
  | ModifyDirective;

export interface ReplaceDirective {
  directive: 'replace';
  targetType: StatementTypeName;
  targetName: string;
  replacement: Statement;
}

export interface AddDirective {
  directive: 'add';
  statement: Statement;
}

export interface DeleteDirective {
  directive: 'delete';
  targetType: StatementTypeName;
  targetName: string;
}

export interface ModifyDirective {
  directive: 'modify';
  targetType: StatementTypeName;
  targetName: string;
  modifications: ModificationClause[];
}

export type StatementTypeName = 'Covenant' | 'Basket' | 'Condition' | 'Define' | 'Prohibit' | 'Event' | 'Phase' | 'Transition';

export interface ModificationClause {
  type: 'capacity' | 'floor' | 'maximum' | 'requires' | 'tested';
  value: Expression;
}

// ==================== PHASE TYPES ====================

/**
 * Phase statement defining a project phase with specific covenant rules.
 * Project finance deals have distinct phases (Construction, Operations, etc.)
 * with different covenants active or suspended.
 */
export interface PhaseStatement {
  type: 'Phase';
  /** Name of the phase (e.g., 'Construction', 'Operations') */
  name: string;
  /** Event/condition that ends this phase (e.g., 'COD_Achieved') */
  until: string | null;
  /** Event/condition that starts this phase */
  from: string | null;
  /** Covenants suspended during this phase */
  covenantsSuspended: string[];
  /** Covenants active during this phase */
  covenantsActive: string[];
  /** Covenants required during this phase */
  requiredCovenants: string[];
}

/**
 * Transition statement defining conditions for phase transitions.
 */
export interface TransitionStatement {
  type: 'Transition';
  /** Name of the transition event (e.g., 'COD_Achieved') */
  name: string;
  /** Condition that triggers this transition */
  when: TransitionCondition | Expression | null;
}

/**
 * Condition for phase transitions - can be ALL_OF or ANY_OF
 */
export type TransitionCondition = AllOfCondition | AnyOfCondition;

export interface AllOfCondition {
  type: 'AllOf';
  conditions: string[];
}

export interface AnyOfCondition {
  type: 'AnyOf';
  conditions: string[];
}

/**
 * Type guard for AllOfCondition
 */
export function isAllOfCondition(cond: unknown): cond is AllOfCondition {
  return (
    typeof cond === 'object' &&
    cond !== null &&
    'type' in cond &&
    (cond as AllOfCondition).type === 'AllOf'
  );
}

/**
 * Type guard for AnyOfCondition
 */
export function isAnyOfCondition(cond: unknown): cond is AnyOfCondition {
  return (
    typeof cond === 'object' &&
    cond !== null &&
    'type' in cond &&
    (cond as AnyOfCondition).type === 'AnyOf'
  );
}

/**
 * Runtime phase state for project finance deals.
 * Tracks current position in the project lifecycle.
 */
export type PhaseState =
  | 'pre_closing'
  | 'construction'
  | 'cod'
  | 'operations'
  | 'maturity'
  | 'default';

/**
 * Record of a phase transition event.
 */
export interface PhaseHistoryEntry {
  /** Phase that was entered */
  phase: string;
  /** When this phase was entered */
  enteredAt: Date;
  /** Transition event that triggered entry (null for initial phase) */
  triggeredBy: string | null;
}

/**
 * Result of checking phase transition conditions.
 */
export interface TransitionResult {
  /** Name of the transition */
  name: string;
  /** Whether the transition conditions are met */
  triggered: boolean;
  /** Individual condition results */
  conditions: { name: string; met: boolean }[];
  /** Target phase if transition triggers */
  targetPhase?: string;
}

// ==================== MILESTONE TYPES ====================

/**
 * Milestone statement for project finance construction tracking.
 * Milestones have target dates, longstop dates (deadlines), and can trigger events.
 */
export interface MilestoneStatement {
  type: 'Milestone';
  /** Name of the milestone (e.g., 'FoundationComplete') */
  name: string;
  /** Target date for achieving the milestone (ISO format: YYYY-MM-DD) */
  targetDate: string | null;
  /** Longstop date - deadline after which milestone is breached (ISO format) */
  longstopDate: string | null;
  /** Events triggered when milestone is achieved */
  triggers: string[];
  /** Prerequisites - other milestones or conditions that must be met first */
  requires: string | AllOfCondition | AnyOfCondition | null;
}

/**
 * Status of a milestone based on current date and achievement.
 */
export type MilestoneStatus =
  | 'pending'    // Not yet achieved, before target date
  | 'achieved'   // Successfully completed
  | 'at_risk'    // Past target date but before longstop
  | 'breached';  // Past longstop date without achievement

/**
 * Result of milestone status check.
 */
export interface MilestoneResult {
  name: string;
  status: MilestoneStatus;
  targetDate: string | null;
  longstopDate: string | null;
  achievedDate?: string;
  /** Days until target (negative if past) */
  daysToTarget: number;
  /** Days until longstop (negative if past) */
  daysToLongstop: number;
  /** Prerequisite check results */
  prerequisites: { name: string; met: boolean }[];
}

// ==================== TECHNICAL MILESTONE TYPES ====================

/**
 * Technical milestone with quantitative measurement tracking.
 * Extends the basic Milestone concept with engineering/physics-based progress tracking.
 * Used for construction milestones like "MW installed" or "foundations poured".
 */
export interface TechnicalMilestoneStatement {
  type: 'TechnicalMilestone';
  /** Name of the milestone (e.g., 'ModuleInstallation') */
  name: string;
  /** Target date for achieving the milestone (ISO format: YYYY-MM-DD) */
  targetDate: string | null;
  /** Longstop date - deadline after which milestone is breached (ISO format) */
  longstopDate: string | null;
  /** Human-readable measurement unit (e.g., "MW Installed", "Foundations Poured") */
  measurement: string | null;
  /** Target value to achieve (e.g., 200 for 200 MW) */
  targetValue: Expression | null;
  /** Current value (can be expression for dynamic lookup from financial data) */
  currentValue: Expression | null;
  /** Expression for calculating progress (e.g., MW_installed / total_MW) */
  progressMetric: Expression | null;
  /** Events triggered when milestone is achieved (when currentValue >= targetValue) */
  triggers: string[];
  /** Prerequisites - other milestones or conditions that must be met first */
  requires: string | AllOfCondition | AnyOfCondition | null;
}

/**
 * Result of technical milestone status check.
 */
export interface TechnicalMilestoneResult {
  name: string;
  status: MilestoneStatus;
  targetDate: string | null;
  longstopDate: string | null;
  achievedDate?: string;
  /** Days until target (negative if past) */
  daysToTarget: number;
  /** Days until longstop (negative if past) */
  daysToLongstop: number;
  /** The measurement description */
  measurement: string | null;
  /** Target value */
  targetValue: number | null;
  /** Current value */
  currentValue: number | null;
  /** Completion percentage (0-100+) */
  completionPercent: number | null;
  /** Progress metric value if defined */
  progressMetric: number | null;
  /** Prerequisite check results */
  prerequisites: { name: string; met: boolean }[];
}

// ==================== REGULATORY REQUIREMENT TYPES ====================

/**
 * Categories of regulatory requirements (extensible - any string is valid).
 * Common types include:
 * - environmental: EPA, state environmental permits
 * - interconnection: Grid connection agreements (LGIA, etc.)
 * - land_use: Zoning, building permits
 * - aviation: FAA obstruction marking (wind)
 * - tribal: Tribal consultation requirements
 * - water_rights: Water usage permits
 * - permit: Generic permits
 */
export type RegulatoryType = string;

/**
 * Status of a regulatory requirement.
 */
export type RegulatoryStatus = 'pending' | 'submitted' | 'approved' | 'denied';

/**
 * Regulatory requirement statement for tracking permits and approvals.
 * Flexible design allows any type of regulatory requirement across industries.
 */
export interface RegulatoryRequirementStatement {
  type: 'RegulatoryRequirement';
  /** Name/identifier of the requirement (e.g., 'GridInterconnect') */
  name: string;
  /** Regulatory agency or authority (e.g., "Regional ISO", "EPA Region 4") */
  agency: string | null;
  /** Type of requirement (flexible string - environmental, interconnection, etc.) */
  requirementType: RegulatoryType | null;
  /** Human-readable description */
  description: string | null;
  /** Phase that requires this approval (e.g., Construction, Operations) */
  requiredFor: string | null;
  /** Current status */
  status: RegulatoryStatus;
  /** Date approval was received (ISO format) */
  approvalDate: string | null;
  /** Events/conditions satisfied when this requirement is approved */
  satisfies: string[];
}

/**
 * Result of regulatory requirement status check.
 */
export interface RegulatoryRequirementResult {
  name: string;
  agency: string | null;
  requirementType: RegulatoryType | null;
  description: string | null;
  requiredFor: string | null;
  status: RegulatoryStatus;
  approvalDate: string | null;
  /** Whether this requirement blocks the required phase */
  blocking: boolean;
  /** Conditions/events satisfied when approved */
  satisfies: string[];
}

/**
 * Summary of all regulatory requirements.
 */
export interface RegulatoryChecklistResult {
  totalRequirements: number;
  approved: number;
  submitted: number;
  pending: number;
  denied: number;
  /** Whether all requirements for a given phase are approved */
  phaseReady: Record<string, boolean>;
  requirements: RegulatoryRequirementResult[];
}

// ==================== PERFORMANCE GUARANTEE TYPES ====================

/**
 * Performance guarantee statement for energy production or other performance metrics.
 * Expresses P50/P75/P90/P99 probability thresholds and shortfall handling.
 */
export interface PerformanceGuaranteeStatement {
  type: 'PerformanceGuarantee';
  /** Name of the guarantee (e.g., 'MinEnergyProduction') */
  name: string;
  /** Metric being guaranteed (e.g., 'annual_generation_MWh') */
  metric: string | null;
  /** P50 threshold (50% probability of exceedance) */
  p50: Expression | null;
  /** P75 threshold (75% probability of exceedance) */
  p75: Expression | null;
  /** P90 threshold (90% probability of exceedance) */
  p90: Expression | null;
  /** P99 threshold (99% probability of exceedance) */
  p99: Expression | null;
  /** Period covered by the guarantee (e.g., "year_1_through_5") */
  guaranteePeriod: string | null;
  /** Rate per unit for shortfall calculation (e.g., $/MWh) */
  shortfallRate: Expression | null;
  /** Insurance coverage amount */
  insuranceCoverage: Expression | null;
  /** Actual performance value (can be expression for dynamic lookup) */
  actualValue: Expression | null;
}

/**
 * Result of performance guarantee evaluation.
 */
export interface PerformanceGuaranteeResult {
  name: string;
  metric: string | null;
  /** Evaluated threshold values */
  p50: number | null;
  p75: number | null;
  p90: number | null;
  p99: number | null;
  /** Actual performance value */
  actual: number | null;
  /** Which threshold is met (p50, p75, p90, p99, or below_p99) */
  performanceLevel: 'p50' | 'p75' | 'p90' | 'p99' | 'below_p99' | null;
  /** Whether actual meets minimum guarantee (typically P99 or P90) */
  meetsGuarantee: boolean;
  /** Shortfall amount below P99 threshold */
  shortfall: number;
  /** Calculated shortfall payment */
  shortfallPayment: number;
  guaranteePeriod: string | null;
}

// ==================== DEGRADATION SCHEDULE TYPES ====================

/**
 * Degradation schedule entry for year-by-year rates.
 */
export interface DegradationEntry {
  year: number;
  rate: Expression;
}

/**
 * Degradation schedule statement for asset capacity modeling.
 * Models how assets like solar panels or batteries degrade over time.
 */
export interface DegradationScheduleStatement {
  type: 'DegradationSchedule';
  /** Name of the degradation schedule */
  name: string;
  /** Type of asset (e.g., 'solar_panels', 'battery', 'wind_turbine') */
  assetType: string | null;
  /** Initial capacity (e.g., 200 MW) */
  initialCapacity: Expression | null;
  /** First year degradation rate (often higher than subsequent years) */
  year1Degradation: Expression | null;
  /** Annual degradation rate for years 2+ */
  annualDegradation: Expression | null;
  /** Minimum capacity floor */
  minimumCapacity: Expression | null;
  /** Explicit year-by-year schedule (alternative to year1/annual rates) */
  schedule: DegradationEntry[] | null;
  /** Metrics affected by this degradation (e.g., EBITDA, generation_capacity) */
  affects: string[];
}

/**
 * Result of degradation calculation for a specific year.
 */
export interface DegradationResult {
  name: string;
  assetType: string | null;
  initialCapacity: number;
  /** Year number (1, 2, 3, ...) */
  year: number;
  /** Cumulative degradation percentage (0-100) */
  cumulativeDegradation: number;
  /** Effective capacity after degradation */
  effectiveCapacity: number;
  /** Capacity as percentage of initial */
  capacityPercent: number;
  /** Whether at minimum capacity floor */
  atMinimum: boolean;
  /** Metrics affected by this degradation */
  affects: string[];
}

// ==================== SEASONAL ADJUSTMENT TYPES ====================

/**
 * Seasonal adjustment statement for modifying metrics by season.
 * Used to account for seasonal variations in energy production, demand, etc.
 */
export interface SeasonalAdjustmentStatement {
  type: 'SeasonalAdjustment';
  /** Name of the adjustment (e.g., 'WinterCapacity') */
  name: string;
  /** Metric being adjusted */
  metric: string | null;
  /** Seasons/periods when adjustment applies (e.g., ['Q4', 'Q1'] or ['Dec', 'Jan', 'Feb']) */
  season: string[];
  /** Multiplier to apply (e.g., 0.75 for 75% of base, 1.20 for 120%) */
  adjustmentFactor: Expression | null;
  /** Reason for the adjustment */
  reason: string | null;
}

/**
 * Result of applying seasonal adjustments to a metric.
 */
export interface SeasonalAdjustmentResult {
  name: string;
  metric: string | null;
  /** Original metric value */
  baseValue: number;
  /** Adjustment factor applied */
  adjustmentFactor: number;
  /** Adjusted value */
  adjustedValue: number;
  /** Whether adjustment is currently active (based on current period) */
  active: boolean;
  /** Applicable seasons */
  seasons: string[];
  reason: string | null;
}

// ==================== TAX EQUITY TYPES ====================

/**
 * Allocation specification for tax equity structures.
 * Represents investor/sponsor percentage splits.
 */
export interface AllocationSpec {
  /** Investor allocation percentage */
  investor: number;
  /** Sponsor allocation percentage */
  sponsor: number;
}

/**
 * Tax equity structure statement.
 * Models partnership flips, sale-leaseback, and inverted lease structures.
 */
export interface TaxEquityStructureStatement {
  type: 'TaxEquityStructure';
  /** Structure name (e.g., 'MainPartnershipFlip') */
  name: string;
  /** Structure type: partnership_flip, sale_leaseback, inverted_lease, or custom */
  structureType: string | null;
  /** Tax equity investor name */
  taxInvestor: string | null;
  /** Project sponsor name */
  sponsor: string | null;
  /** Tax credit allocation (investor/sponsor %) */
  taxCreditAllocation: AllocationSpec | null;
  /** Depreciation allocation (investor/sponsor %) */
  depreciationAllocation: AllocationSpec | null;
  /** Cash distribution allocation (investor/sponsor %) */
  cashAllocation: AllocationSpec | null;
  /** Expected flip date */
  flipDate: { type: 'Date'; value: string } | null;
  /** Target IRR for flip trigger */
  targetReturn: Expression | null;
  /** Buyout price expression */
  buyoutPrice: Expression | null;
}

/**
 * Result of evaluating a tax equity structure's current status.
 */
export interface TaxEquityStructureResult {
  name: string;
  structureType: string | null;
  taxInvestor: string | null;
  sponsor: string | null;
  /** Current tax credit allocation */
  taxCreditAllocation: AllocationSpec | null;
  /** Current depreciation allocation */
  depreciationAllocation: AllocationSpec | null;
  /** Current cash allocation */
  cashAllocation: AllocationSpec | null;
  /** Expected or actual flip date */
  flipDate: string | null;
  /** Target IRR */
  targetReturn: number | null;
  /** Buyout price */
  buyoutPrice: number | null;
  /** Whether the flip has occurred */
  hasFlipped: boolean;
  /** Flip event name if applicable */
  flipEventName: string | null;
}

/**
 * Tax credit adder for bonus credits (domestic content, energy community, etc.)
 */
export interface TaxCreditAdder {
  /** Adder name (e.g., 'domestic_content', 'energy_community') */
  name: string;
  /** Bonus percentage expression */
  bonus: Expression;
}

/**
 * Tax credit statement.
 * Models ITC (Investment Tax Credit), PTC (Production Tax Credit), and other credits.
 */
export interface TaxCreditStatement {
  type: 'TaxCredit';
  /** Credit name (e.g., 'SolarITC', 'WindPTC') */
  name: string;
  /** Credit type: itc, ptc, 45X, 45V, 45Q, or custom */
  creditType: string | null;
  /** Base credit rate percentage */
  rate: Expression | null;
  /** Eligible basis for ITC calculation */
  eligibleBasis: Expression | null;
  /** Direct credit amount (if known) */
  creditAmount: Expression | null;
  /** Vesting period description */
  vestingPeriod: string | null;
  /** Recapture risk description */
  recaptureRisk: string | null;
  /** Bonus adders (domestic content, energy community, etc.) */
  adders: TaxCreditAdder[];
  /** Conditions satisfied when credit is earned */
  satisfies: string[];
}

/**
 * Result of evaluating a tax credit's current status.
 */
export interface TaxCreditResult {
  name: string;
  creditType: string | null;
  /** Base rate percentage */
  baseRate: number | null;
  /** Total rate including adders */
  effectiveRate: number | null;
  /** Eligible basis amount */
  eligibleBasis: number | null;
  /** Calculated credit amount */
  creditAmount: number | null;
  /** Adders applied */
  adders: { name: string; bonus: number }[];
  vestingPeriod: string | null;
  recaptureRisk: string | null;
  /** Whether credit is fully vested */
  isVested: boolean;
}

/**
 * Depreciation year entry for explicit schedules.
 */
export interface DepreciationYearEntry {
  /** Year number (1, 2, 3, etc.) */
  year: number;
  /** Depreciation percentage for this year */
  percentage: Expression;
}

/**
 * Depreciation schedule statement.
 * Models MACRS accelerated depreciation for tax equity.
 */
export interface DepreciationStatement {
  type: 'Depreciation';
  /** Schedule name (e.g., 'SolarMACRS') */
  name: string;
  /** Depreciation method: macrs_5yr, macrs_7yr, macrs_15yr, macrs_20yr, straight_line, or custom */
  method: string | null;
  /** Depreciable basis amount */
  depreciableBasis: Expression | null;
  /** Bonus depreciation percentage (e.g., 100% for 2022, 80% for 2023) */
  bonusDepreciation: Expression | null;
  /** Explicit year-by-year schedule */
  schedule: DepreciationYearEntry[] | null;
  /** Metrics affected by depreciation */
  affects: string[];
}

/**
 * Result of evaluating depreciation for a specific year.
 */
export interface DepreciationResult {
  name: string;
  method: string | null;
  /** Original depreciable basis */
  depreciableBasis: number | null;
  /** Bonus depreciation percentage */
  bonusDepreciation: number | null;
  /** Bonus depreciation amount */
  bonusAmount: number | null;
  /** Remaining basis after bonus */
  remainingBasis: number | null;
  /** Year being evaluated */
  year: number;
  /** Regular depreciation percentage for year */
  regularPercentage: number | null;
  /** Regular depreciation amount for year */
  regularAmount: number | null;
  /** Total depreciation for year (bonus + regular) */
  totalDepreciation: number | null;
  /** Cumulative depreciation through this year */
  cumulativeDepreciation: number | null;
  /** Remaining book value */
  remainingBookValue: number | null;
}

/**
 * Buyout option specification for flip events.
 */
export type BuyoutOption =
  | { type: 'fmv' }
  | { type: 'fixed'; price: Expression }
  | { type: 'formula'; formula: Expression };

/**
 * Flip event statement.
 * Defines triggers for partnership flips in tax equity structures.
 */
export interface FlipEventStatement {
  type: 'FlipEvent';
  /** Event name (e.g., 'TargetReturnFlip') */
  name: string;
  /** Trigger type: target_return, date_certain, pf_event, or custom */
  trigger: string | null;
  /** Trigger value (IRR percentage, date, or event name) */
  triggerValue: Expression | { type: 'Date'; value: string } | null;
  /** Pre-flip allocation (investor/sponsor %) */
  preFlipAllocation: AllocationSpec | null;
  /** Post-flip allocation (investor/sponsor %) */
  postFlipAllocation: AllocationSpec | null;
  /** Buyout option specification */
  buyoutOption: BuyoutOption | null;
  /** Conditions satisfied when flip occurs */
  satisfies: string[];
}

/**
 * Result of evaluating a flip event's current status.
 */
export interface FlipEventResult {
  name: string;
  trigger: string | null;
  /** Evaluated trigger value */
  triggerValue: number | string | null;
  /** Pre-flip allocation */
  preFlipAllocation: AllocationSpec | null;
  /** Post-flip allocation */
  postFlipAllocation: AllocationSpec | null;
  /** Whether flip has been triggered */
  hasTriggered: boolean;
  /** Trigger date if applicable */
  triggerDate: string | null;
  /** Current allocation based on flip status */
  currentAllocation: AllocationSpec | null;
  /** Buyout price if applicable */
  buyoutPrice: number | null;
}

// ==================== RESERVE TYPES ====================

/**
 * Reserve account statement for project finance.
 * Reserves hold funds for specific purposes (debt service, maintenance, etc.)
 */
export interface ReserveStatement {
  type: 'Reserve';
  /** Name of the reserve account */
  name: string;
  /** Target balance expression (e.g., 6 * monthly_debt_service) */
  target: Expression | null;
  /** Minimum required balance expression */
  minimum: Expression | null;
  /** Sources that can fund this reserve */
  fundedBy: string[];
  /** What the reserve can be released to (e.g., Waterfall) */
  releasedTo: string | null;
  /** What purposes the reserve can be released for */
  releasedFor: string | null;
}

/**
 * Current status of a reserve account.
 */
export interface ReserveStatus {
  name: string;
  balance: number;
  target: number;
  minimum: number;
  /** Percentage of target funded (0-100+) */
  fundedPercent: number;
  /** Whether balance is below minimum */
  belowMinimum: boolean;
  /** Amount available for release (balance - minimum) */
  availableForRelease: number;
}

// ==================== WATERFALL TYPES ====================

/**
 * Waterfall statement for project finance cash flow distribution.
 * Cash flows through tiers in priority order.
 */
export interface WaterfallStatement {
  type: 'Waterfall';
  /** Name of the waterfall */
  name: string;
  /** Execution frequency */
  frequency: 'monthly' | 'quarterly' | 'annually';
  /** Ordered list of payment tiers */
  tiers: WaterfallTier[];
}

/**
 * A single tier in a waterfall.
 */
export interface WaterfallTier {
  /** Priority order (1 = highest) */
  priority: number;
  /** Display name for the tier */
  name: string;
  /** Reserve account to pay into (for reserve replenishment) */
  payTo: string | null;
  /** Amount to pay (expression) */
  payAmount: Expression | null;
  /** Source of funds */
  from: 'Revenue' | 'REMAINDER';
  /** Condition to stop paying (for reserve caps) */
  until: Expression | null;
  /** Reserve to draw from if tier can't be fully paid */
  shortfall: string | null;
  /** Gate condition (e.g., IF COMPLIANT) */
  condition: Expression | null;
}

/**
 * Result of executing a waterfall.
 */
export interface WaterfallResult {
  /** Name of the waterfall executed */
  name: string;
  /** Starting revenue/funds */
  totalRevenue: number;
  /** Total distributed across all tiers */
  totalDistributed: number;
  /** Remaining after all tiers */
  remainder: number;
  /** Results for each tier */
  tiers: WaterfallTierResult[];
}

/**
 * Result for a single waterfall tier.
 */
export interface WaterfallTierResult {
  priority: number;
  name: string;
  /** Amount requested by this tier */
  requested: number;
  /** Amount actually paid */
  paid: number;
  /** Shortfall (requested - paid) */
  shortfall: number;
  /** Amount drawn from reserve to cover shortfall */
  reserveDrawn: number;
  /** Whether tier was blocked by condition */
  blocked: boolean;
  /** Reason for blocking */
  blockReason?: string;
}

// ==================== CONDITIONS PRECEDENT TYPES ====================

/**
 * Conditions Precedent statement for tracking closing/draw requirements.
 */
export interface ConditionsPrecedentStatement {
  type: 'ConditionsPrecedent';
  /** Name of the CP checklist (e.g., 'InitialFunding', 'Draw3') */
  name: string;
  /** Credit agreement section reference */
  section: string | null;
  /** List of condition precedent items */
  conditions: CPItem[];
}

/**
 * A single condition precedent item.
 */
export interface CPItem {
  /** Identifier for the CP */
  name: string;
  /** Human-readable description */
  description: string | null;
  /** Party responsible for satisfying this CP */
  responsible: string | null;
  /** Current status */
  status: CPStatus;
  /** Events/conditions satisfied when this CP is complete */
  satisfies: string[];
}

/**
 * Status of a condition precedent.
 */
export type CPStatus = 'pending' | 'satisfied' | 'waived' | 'not_applicable';

/**
 * Summary of conditions precedent checklist.
 */
export interface CPChecklistResult {
  name: string;
  section: string | null;
  totalConditions: number;
  satisfied: number;
  pending: number;
  waived: number;
  /** Whether all required conditions are satisfied or waived */
  complete: boolean;
  conditions: CPItemResult[];
}

/**
 * Status of a single CP item.
 */
export interface CPItemResult {
  name: string;
  description: string | null;
  responsible: string | null;
  status: CPStatus;
  satisfies: string[];
}
