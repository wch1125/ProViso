// ProViso Interpreter
// Evaluates parsed AST against financial data

import {
  Program,
  Statement,
  Expression,
  DefineStatement,
  CovenantStatement,
  BasketStatement,
  ConditionStatement,
  ProhibitStatement,
  EventStatement,
  AmendmentStatement,
  AmendmentDirective,
  ModificationClause,
  PhaseStatement,
  TransitionStatement,
  PhaseHistoryEntry,
  TransitionResult,
  MilestoneStatement,
  MilestoneStatus,
  MilestoneResult,
  TechnicalMilestoneStatement,
  TechnicalMilestoneResult,
  RegulatoryRequirementStatement,
  RegulatoryRequirementResult,
  RegulatoryChecklistResult,
  RegulatoryStatus,
  PerformanceGuaranteeStatement,
  PerformanceGuaranteeResult,
  DegradationScheduleStatement,
  DegradationResult,
  SeasonalAdjustmentStatement,
  SeasonalAdjustmentResult,
  TaxEquityStructureStatement,
  TaxEquityStructureResult,
  TaxCreditStatement,
  TaxCreditResult,
  DepreciationStatement,
  DepreciationResult,
  FlipEventStatement,
  FlipEventResult,
  ReserveStatement,
  ReserveStatus,
  WaterfallStatement,
  WaterfallTier,
  WaterfallResult,
  WaterfallTierResult,
  ConditionsPrecedentStatement,
  CPStatus,
  CPChecklistResult,
  CPItemResult,
  FinancialData,
  SimpleFinancialData,
  MultiPeriodFinancialData,
  CovenantResult,
  CovenantResultWithCure,
  BasketStatus,
  BasketLedgerEntry,
  QueryResult,
  ReasoningStep,
  SimulationResult,
  StatusReport,
  CureState,
  CureUsage,
  CureResult,
  CalculationNode,
  isObjectExpression,
  isComparisonExpression,
  isFunctionCallExpression,
  isMultiPeriodData,
  isAllOfCondition,
  isAnyOfCondition,
} from './types.js';

export class ProVisoInterpreter {
  private definitions: Map<string, DefineStatement> = new Map();
  private covenants: Map<string, CovenantStatement> = new Map();
  private baskets: Map<string, BasketStatement> = new Map();
  private conditions: Map<string, ConditionStatement> = new Map();
  private prohibitions: Map<string, ProhibitStatement> = new Map();
  private events: Map<string, EventStatement> = new Map();

  // Phase system state
  private phases: Map<string, PhaseStatement> = new Map();
  private transitions: Map<string, TransitionStatement> = new Map();
  private currentPhase: string | null = null;
  private phaseHistory: PhaseHistoryEntry[] = [];
  // Set of satisfied conditions/milestones for transition checking
  private satisfiedConditions: Set<string> = new Set();

  // Project finance state
  private milestones: Map<string, MilestoneStatement> = new Map();
  private technicalMilestones: Map<string, TechnicalMilestoneStatement> = new Map();
  private technicalMilestoneAchievements: Map<string, Date> = new Map();
  private regulatoryRequirements: Map<string, RegulatoryRequirementStatement> = new Map();
  private regulatoryStatuses: Map<string, RegulatoryStatus> = new Map();
  private performanceGuarantees: Map<string, PerformanceGuaranteeStatement> = new Map();
  private degradationSchedules: Map<string, DegradationScheduleStatement> = new Map();
  private seasonalAdjustments: Map<string, SeasonalAdjustmentStatement> = new Map();
  private taxEquityStructures: Map<string, TaxEquityStructureStatement> = new Map();
  private taxCredits: Map<string, TaxCreditStatement> = new Map();
  private depreciationSchedules: Map<string, DepreciationStatement> = new Map();
  private flipEvents: Map<string, FlipEventStatement> = new Map();
  private triggeredFlips: Map<string, { date: Date; triggerValue: number | string }> = new Map();
  private milestoneAchievements: Map<string, Date> = new Map();
  private reserves: Map<string, ReserveStatement> = new Map();
  private reserveBalances: Map<string, number> = new Map();
  private waterfalls: Map<string, WaterfallStatement> = new Map();
  private conditionsPrecedent: Map<string, ConditionsPrecedentStatement> = new Map();
  private cpStatuses: Map<string, Map<string, CPStatus>> = new Map(); // checklist -> (cp -> status)

  // Simple financial data (flat record) - used when not in multi-period mode
  private simpleFinancialData: SimpleFinancialData = {};
  // Multi-period financial data - used when periods are loaded
  private multiPeriodData: MultiPeriodFinancialData | null = null;
  // Current evaluation period (for multi-period mode)
  private evaluationPeriod: string | null = null;

  private basketLedger: BasketLedgerEntry[] = [];
  private basketUtilization: Map<string, number> = new Map();
  // Accumulated capacity for builder baskets
  private basketAccumulation: Map<string, number> = new Map();

  private eventDefaults: Set<string> = new Set();

  // Amendment tracking
  private appliedAmendments: AmendmentStatement[] = [];

  // Cure rights tracking
  private cureStates: Map<string, CureState> = new Map();
  private cureUsage: Map<string, number> = new Map(); // mechanism type -> total uses

  // Evaluation context for temporary bindings (e.g., 'amount' in prohibition checks)
  private evaluationContext: { bindings?: Record<string, number> } = {};

  constructor(private ast: Program) {
    this.loadStatements();
  }

  private loadStatements(): void {
    for (const stmt of this.ast.statements) {
      this.loadStatement(stmt);
    }
  }

  private loadStatement(stmt: Statement): void {
    switch (stmt.type) {
      case 'Define':
        this.definitions.set(stmt.name, stmt);
        break;
      case 'Covenant':
        this.covenants.set(stmt.name, stmt);
        break;
      case 'Basket':
        this.baskets.set(stmt.name, stmt);
        if (!this.basketUtilization.has(stmt.name)) {
          this.basketUtilization.set(stmt.name, 0);
        }
        break;
      case 'Condition':
        this.conditions.set(stmt.name, stmt);
        break;
      case 'Prohibit':
        this.prohibitions.set(stmt.target, stmt);
        break;
      case 'Event':
        this.events.set(stmt.name, stmt);
        break;
      case 'Phase':
        this.phases.set(stmt.name, stmt);
        // Set as current phase if it's the first phase or has no 'from' clause
        if (this.currentPhase === null && stmt.from === null) {
          this.setCurrentPhase(stmt.name);
        }
        break;
      case 'Transition':
        this.transitions.set(stmt.name, stmt);
        break;
      case 'Milestone':
        this.milestones.set(stmt.name, stmt);
        break;
      case 'TechnicalMilestone':
        this.technicalMilestones.set(stmt.name, stmt);
        break;
      case 'RegulatoryRequirement':
        this.regulatoryRequirements.set(stmt.name, stmt);
        this.regulatoryStatuses.set(stmt.name, stmt.status);
        // If already approved, satisfy conditions
        if (stmt.status === 'approved') {
          this.satisfiedConditions.add(stmt.name);
          for (const sat of stmt.satisfies) {
            this.satisfiedConditions.add(sat);
          }
        }
        break;
      case 'PerformanceGuarantee':
        this.performanceGuarantees.set(stmt.name, stmt);
        break;
      case 'DegradationSchedule':
        this.degradationSchedules.set(stmt.name, stmt);
        break;
      case 'SeasonalAdjustment':
        this.seasonalAdjustments.set(stmt.name, stmt);
        break;
      case 'TaxEquityStructure':
        this.taxEquityStructures.set(stmt.name, stmt);
        break;
      case 'TaxCredit':
        this.taxCredits.set(stmt.name, stmt);
        // If credit has satisfies conditions, add them when loaded (credit is earned on placement)
        for (const condition of stmt.satisfies) {
          this.satisfiedConditions.add(condition);
        }
        break;
      case 'Depreciation':
        this.depreciationSchedules.set(stmt.name, stmt);
        break;
      case 'FlipEvent':
        this.flipEvents.set(stmt.name, stmt);
        break;
      case 'Reserve':
        this.reserves.set(stmt.name, stmt);
        if (!this.reserveBalances.has(stmt.name)) {
          this.reserveBalances.set(stmt.name, 0);
        }
        break;
      case 'Waterfall':
        this.waterfalls.set(stmt.name, stmt);
        break;
      case 'ConditionsPrecedent': {
        this.conditionsPrecedent.set(stmt.name, stmt);
        // Initialize CP statuses from statement
        const cpMap = new Map<string, CPStatus>();
        for (const cp of stmt.conditions) {
          cpMap.set(cp.name, cp.status);
        }
        this.cpStatuses.set(stmt.name, cpMap);
        break;
      }
      case 'Amendment':
        // Amendments are processed separately via applyAmendment
        break;
      case 'Load':
        if (stmt.source.type === 'inline' && stmt.source.data) {
          this.loadFinancials(stmt.source.data as FinancialData);
        }
        break;
    }
  }

  loadFinancials(data: FinancialData): void {
    if (isMultiPeriodData(data)) {
      this.multiPeriodData = data;
      // Default to the latest period if not explicitly set
      if (this.evaluationPeriod === null && data.periods.length > 0) {
        const sortedPeriods = this.sortPeriods(data.periods.map((p) => p.period));
        this.evaluationPeriod = sortedPeriods[sortedPeriods.length - 1] ?? null;
      }
    } else {
      this.simpleFinancialData = { ...this.simpleFinancialData, ...data };
    }
  }

  loadFinancialsFromFile(data: Record<string, unknown>): void {
    // Check if it's multi-period data
    if (isMultiPeriodData(data)) {
      this.loadFinancials(data);
      return;
    }

    // Flatten nested structures if needed (simple data format)
    if (data.financials && typeof data.financials === 'object') {
      this.simpleFinancialData = {
        ...this.simpleFinancialData,
        ...(data.financials as SimpleFinancialData),
      };
    }
    if (data.adjustments && typeof data.adjustments === 'object') {
      this.simpleFinancialData = {
        ...this.simpleFinancialData,
        ...(data.adjustments as SimpleFinancialData),
      };
    }
    // Also load top-level values
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'number') {
        this.simpleFinancialData[key] = value;
      }
    }
  }

  // ==================== EXPRESSION EVALUATION ====================

  evaluate(expr: Expression): number {
    if (typeof expr === 'string') {
      // It's an identifier
      return this.resolveIdentifier(expr);
    }

    if (typeof expr === 'number') {
      return expr;
    }

    if (!isObjectExpression(expr)) {
      throw new Error(`Cannot evaluate expression: ${JSON.stringify(expr)}`);
    }

    switch (expr.type) {
      case 'Number':
        return expr.value;

      case 'Currency':
        return expr.value;

      case 'Percentage':
        return expr.value / 100;

      case 'Ratio':
        return expr.value;

      case 'BinaryExpression': {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);
        switch (expr.operator) {
          case '+': return left + right;
          case '-': return left - right;
          case '*': return left * right;
          case '/': return right !== 0 ? left / right : Infinity;
          default:
            throw new Error(`Unknown operator: ${expr.operator}`);
        }
      }

      case 'UnaryExpression':
        if (expr.operator === '-') {
          return -this.evaluate(expr.argument);
        }
        throw new Error(`Unknown unary operator: ${expr.operator}`);

      case 'FunctionCall':
        return this.evaluateFunction(expr.name, expr.arguments);

      case 'Trailing':
        return this.evaluateTrailing(expr);

      case 'Comparison':
        throw new Error('Comparison expressions should be evaluated with evaluateBoolean');
    }
  }

  /**
   * Evaluate a trailing expression by summing values across periods.
   * Example: TRAILING 4 QUARTERS OF EBITDA sums EBITDA across the last 4 quarters.
   */
  private evaluateTrailing(expr: {
    type: 'Trailing';
    count: number;
    period: 'quarters' | 'months' | 'years';
    expression: Expression;
  }): number {
    if (!this.isMultiPeriodMode() || !this.multiPeriodData) {
      // In simple mode, trailing expressions evaluate to just the current value
      // with a warning (useful for backward compatibility)
      console.warn(
        `TRAILING expression used without multi-period data. Evaluating expression once.`
      );
      return this.evaluate(expr.expression);
    }

    const periods = this.getTrailingPeriods(expr.count, expr.period);

    if (periods.length === 0) {
      throw new Error(
        `No periods available for TRAILING ${expr.count} ${expr.period.toUpperCase()}`
      );
    }

    // Note: When fewer periods are available than requested, we use what's available.
    // This is intentional - early quarters in a series won't have full trailing data.
    // The caller can check periods.length if they need to know.

    // Sum the expression across all trailing periods
    let sum = 0;
    const savedPeriod = this.evaluationPeriod;

    for (const period of periods) {
      this.evaluationPeriod = period;
      sum += this.evaluate(expr.expression);
    }

    // Restore the evaluation period
    this.evaluationPeriod = savedPeriod;
    return sum;
  }

  /**
   * Get the periods for a trailing calculation.
   * Returns periods ending at (and including) the current evaluation period.
   */
  private getTrailingPeriods(
    count: number,
    periodType: 'quarters' | 'months' | 'years'
  ): string[] {
    if (!this.multiPeriodData) return [];

    // Get all available periods and sort them
    const allPeriods = this.multiPeriodData.periods.map((p) => p.period);
    const sorted = this.sortPeriods(allPeriods);

    // Find the current period index
    const currentPeriod = this.evaluationPeriod ?? sorted[sorted.length - 1];
    const currentIdx = currentPeriod ? sorted.indexOf(currentPeriod) : sorted.length - 1;

    if (currentIdx < 0) return [];

    // Filter periods by type if multi-period data has mixed period types
    const periodData = this.multiPeriodData.periods;
    const matchingPeriods = sorted.filter((p) => {
      const pd = periodData.find((d) => d.period === p);
      if (!pd) return false;

      // If we're asking for quarters, we need quarterly data
      // If we're asking for months with quarterly data, we can convert (4 quarters = 12 months - future enhancement)
      // For now, we just use the available periods that match the type
      if (periodType === 'quarters' && pd.periodType === 'quarterly') return true;
      if (periodType === 'months' && pd.periodType === 'monthly') return true;
      if (periodType === 'years' && pd.periodType === 'annual') return true;

      // If types don't match exactly, we still include them with a warning
      // This allows using quarterly data when asking for "months" by treating quarters as periods
      return true;
    });

    // Find where the current period is in the matching periods
    const matchingCurrentIdx = matchingPeriods.indexOf(currentPeriod ?? '');
    if (matchingCurrentIdx < 0 && currentPeriod) {
      // Current period might not be in matching periods, use the last one
      return matchingPeriods.slice(-count);
    }

    // Get the last N periods ending at current
    const startIdx = Math.max(0, matchingCurrentIdx - count + 1);
    return matchingPeriods.slice(startIdx, matchingCurrentIdx + 1);
  }

  private resolveIdentifier(name: string): number {
    // Check evaluation context first (for temporary bindings like 'amount')
    if (this.evaluationContext.bindings && name in this.evaluationContext.bindings) {
      return this.evaluationContext.bindings[name]!;
    }

    // Check definitions
    const def = this.definitions.get(name);
    if (def) {
      return this.evaluateDefinition(def);
    }

    // Get value from financial data (multi-period or simple)
    const value = this.getFinancialValue(name);
    if (value !== undefined) {
      return value;
    }

    // Common aliases
    const aliases: Record<string, string> = {
      EBITDA: 'ebitda',
      TotalDebt: 'total_debt',
      InterestExpense: 'interest_expense',
      NetIncome: 'net_income',
      TotalAssets: 'total_assets',
    };

    const aliasedName = aliases[name];
    if (aliasedName) {
      const aliasedValue = this.getFinancialValue(aliasedName);
      if (aliasedValue !== undefined) {
        return aliasedValue;
      }
    }

    throw new Error(`Undefined identifier: ${name}`);
  }

  /**
   * Get a financial value, considering multi-period mode if active.
   */
  private getFinancialValue(name: string): number | undefined {
    if (this.isMultiPeriodMode() && this.evaluationPeriod) {
      return this.getValueForPeriod(name, this.evaluationPeriod);
    }
    // Simple mode
    if (name in this.simpleFinancialData) {
      return this.simpleFinancialData[name];
    }
    return undefined;
  }

  /**
   * Check if we are in multi-period mode.
   */
  private isMultiPeriodMode(): boolean {
    return this.multiPeriodData !== null;
  }

  /**
   * Get a value for a specific period from multi-period data.
   */
  private getValueForPeriod(name: string, period: string): number | undefined {
    if (!this.multiPeriodData) return undefined;

    const periodData = this.multiPeriodData.periods.find((p) => p.period === period);
    if (!periodData) return undefined;

    if (name in periodData.data) {
      return periodData.data[name];
    }
    return undefined;
  }

  /**
   * Sort period strings chronologically.
   * Supports formats like "2024-Q1", "2024-Q2", "2024-01", "2024".
   */
  private sortPeriods(periods: string[]): string[] {
    return [...periods].sort((a, b) => {
      const parseValue = (p: string): number => {
        // Handle "2024-Q1" format
        const quarterMatch = p.match(/^(\d{4})-Q(\d)$/i);
        if (quarterMatch) {
          const year = parseInt(quarterMatch[1]!, 10);
          const quarter = parseInt(quarterMatch[2]!, 10);
          return year * 100 + quarter * 25; // Q1=25, Q2=50, Q3=75, Q4=100
        }
        // Handle "2024-01" format (monthly)
        const monthMatch = p.match(/^(\d{4})-(\d{2})$/);
        if (monthMatch) {
          const year = parseInt(monthMatch[1]!, 10);
          const month = parseInt(monthMatch[2]!, 10);
          return year * 100 + month;
        }
        // Handle "2024" format (annual)
        const yearMatch = p.match(/^(\d{4})$/);
        if (yearMatch) {
          return parseInt(yearMatch[1]!, 10) * 100;
        }
        // Fallback to string comparison
        return 0;
      };
      return parseValue(a) - parseValue(b);
    });
  }

  private evaluateDefinition(def: DefineStatement): number {
    let value = this.evaluate(def.expression);

    // Apply modifiers
    if (def.modifiers.excluding) {
      for (const item of def.modifiers.excluding) {
        const excludeValue = this.getFinancialValue(item);
        if (excludeValue !== undefined) {
          value -= excludeValue;
        }
      }
    }

    if (def.modifiers.cap) {
      const cap = this.evaluate(def.modifiers.cap);
      value = Math.min(value, cap);
    }

    return value;
  }

  private evaluateFunction(name: string, args: Expression[]): number {
    switch (name) {
      case 'AVAILABLE':
        if (args.length !== 1 || typeof args[0] !== 'string') {
          throw new Error('AVAILABLE requires a basket name');
        }
        return this.getBasketAvailable(args[0]);

      case 'GreaterOf':
        if (args.length !== 2) {
          throw new Error('GreaterOf requires two arguments');
        }
        return Math.max(this.evaluate(args[0]!), this.evaluate(args[1]!));

      case 'LesserOf':
        if (args.length !== 2) {
          throw new Error('LesserOf requires two arguments');
        }
        return Math.min(this.evaluate(args[0]!), this.evaluate(args[1]!));

      case 'COMPLIANT':
        if (args.length !== 1 || typeof args[0] !== 'string') {
          throw new Error('COMPLIANT requires a covenant name');
        }
        return this.checkCovenant(args[0]).compliant ? 1 : 0;

      case 'EXISTS':
        if (args.length !== 1 || typeof args[0] !== 'string') {
          throw new Error('EXISTS requires an identifier');
        }
        // Check if an event/default exists
        return this.eventDefaults.has(args[0]) ? 1 : 0;

      case 'NOT':
        if (args.length !== 1) {
          throw new Error('NOT requires one argument');
        }
        return this.evaluateBoolean(args[0]!) ? 0 : 1;

      default:
        throw new Error(`Unknown function: ${name}`);
    }
  }

  // ==================== BOOLEAN EVALUATION ====================

  evaluateBoolean(expr: Expression): boolean {
    if (typeof expr === 'string') {
      // Check conditions
      const cond = this.conditions.get(expr);
      if (cond) {
        return this.evaluateBoolean(cond.expression);
      }
      // Check if identifier resolves to truthy value
      try {
        return this.resolveIdentifier(expr) !== 0;
      } catch {
        return false;
      }
    }

    if (!isObjectExpression(expr)) {
      return Boolean(expr);
    }

    switch (expr.type) {
      case 'Comparison': {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);
        switch (expr.operator) {
          case '<=': return left <= right;
          case '>=': return left >= right;
          case '<': return left < right;
          case '>': return left > right;
          case '=': return left === right;
          case '!=': return left !== right;
          default: return false;
        }
      }

      case 'BinaryExpression':
        if (expr.operator === 'AND') {
          return this.evaluateBoolean(expr.left) && this.evaluateBoolean(expr.right);
        }
        if (expr.operator === 'OR') {
          return this.evaluateBoolean(expr.left) || this.evaluateBoolean(expr.right);
        }
        // Numeric binary expression - evaluate as truthy
        return this.evaluate(expr) !== 0;

      case 'UnaryExpression':
        if (expr.operator === 'NOT') {
          return !this.evaluateBoolean(expr.argument);
        }
        return this.evaluate(expr) !== 0;

      case 'FunctionCall':
        return this.evaluate(expr) !== 0;

      default:
        return this.evaluate(expr) !== 0;
    }
  }

  // ==================== CALCULATION TREE ====================

  /**
   * Build a calculation tree showing how a definition's value is computed.
   * This allows the dashboard to show a drilldown of how values are derived.
   */
  getCalculationTree(definitionName: string): CalculationNode | null {
    const def = this.definitions.get(definitionName);
    if (!def) {
      // Check if it's a financial data key
      const value = this.getFinancialValue(definitionName);
      if (value !== undefined) {
        return {
          name: definitionName,
          value,
          source: 'financial_data',
          rawDataKey: definitionName,
          valueType: this.inferValueType(definitionName, value),
        };
      }
      return null;
    }

    const value = this.evaluateDefinition(def);
    const children = this.buildExpressionTree(def.expression);

    // Build formula string from definition
    const formula = this.expressionToString(def.expression);

    return {
      name: definitionName,
      value,
      formula,
      children: children ? [children] : undefined,
      source: 'definition',
      valueType: this.inferValueType(definitionName, value),
    };
  }

  /**
   * Build a calculation tree for an expression.
   */
  private buildExpressionTree(expr: Expression): CalculationNode | null {
    if (typeof expr === 'string') {
      // Identifier - could be a definition or financial data
      const def = this.definitions.get(expr);
      if (def) {
        const value = this.evaluateDefinition(def);
        const children = this.buildExpressionTree(def.expression);
        return {
          name: expr,
          value,
          formula: this.expressionToString(def.expression),
          children: children ? [children] : undefined,
          source: 'definition',
          valueType: this.inferValueType(expr, value),
        };
      }

      // Financial data
      const value = this.getFinancialValue(expr);
      if (value !== undefined) {
        return {
          name: expr,
          value,
          source: 'financial_data',
          rawDataKey: expr,
          valueType: this.inferValueType(expr, value),
        };
      }

      // Try aliases
      try {
        const resolved = this.resolveIdentifier(expr);
        return {
          name: expr,
          value: resolved,
          source: 'financial_data',
          rawDataKey: expr,
          valueType: this.inferValueType(expr, resolved),
        };
      } catch {
        return null;
      }
    }

    if (typeof expr === 'number') {
      return {
        name: String(expr),
        value: expr,
        source: 'literal',
        valueType: 'number',
      };
    }

    if (!isObjectExpression(expr)) {
      return null;
    }

    switch (expr.type) {
      case 'Number':
        return {
          name: String(expr.value),
          value: expr.value,
          source: 'literal',
          valueType: 'number',
        };

      case 'Currency':
        return {
          name: `$${expr.value.toLocaleString()}`,
          value: expr.value,
          source: 'literal',
          valueType: 'currency',
        };

      case 'Percentage':
        return {
          name: `${expr.value}%`,
          value: expr.value / 100,
          source: 'literal',
          valueType: 'percentage',
        };

      case 'Ratio':
        return {
          name: `${expr.value}x`,
          value: expr.value,
          source: 'literal',
          valueType: 'ratio',
        };

      case 'BinaryExpression': {
        const leftNode = this.buildExpressionTree(expr.left);
        const rightNode = this.buildExpressionTree(expr.right);
        const value = this.evaluate(expr);
        const children: CalculationNode[] = [];
        if (leftNode) children.push(leftNode);
        if (rightNode) children.push(rightNode);

        return {
          name: this.expressionToString(expr),
          value,
          formula: `${leftNode?.name ?? '?'} ${expr.operator} ${rightNode?.name ?? '?'}`,
          children: children.length > 0 ? children : undefined,
          source: 'computed',
          valueType: this.inferValueType('', value),
        };
      }

      case 'FunctionCall': {
        const value = this.evaluateFunction(expr.name, expr.arguments);
        const children = expr.arguments
          .map(arg => this.buildExpressionTree(arg))
          .filter((n): n is CalculationNode => n !== null);

        return {
          name: `${expr.name}(...)`,
          value,
          formula: `${expr.name}(${expr.arguments.map(a => this.expressionToString(a)).join(', ')})`,
          children: children.length > 0 ? children : undefined,
          source: 'computed',
          valueType: this.inferValueType('', value),
        };
      }

      default:
        return null;
    }
  }

  /**
   * Convert an expression to a string representation for display.
   */
  private expressionToString(expr: Expression): string {
    if (typeof expr === 'string') {
      return expr;
    }

    if (typeof expr === 'number') {
      return String(expr);
    }

    if (!isObjectExpression(expr)) {
      return String(expr);
    }

    switch (expr.type) {
      case 'Number':
        return String(expr.value);
      case 'Currency':
        return `$${expr.value.toLocaleString()}`;
      case 'Percentage':
        return `${expr.value}%`;
      case 'Ratio':
        return `${expr.value}x`;
      case 'BinaryExpression':
        return `${this.expressionToString(expr.left)} ${expr.operator} ${this.expressionToString(expr.right)}`;
      case 'UnaryExpression':
        return `${expr.operator}${this.expressionToString(expr.argument)}`;
      case 'FunctionCall':
        return `${expr.name}(${expr.arguments.map(a => this.expressionToString(a)).join(', ')})`;
      case 'Comparison':
        return `${this.expressionToString(expr.left)} ${expr.operator} ${this.expressionToString(expr.right)}`;
      case 'Trailing':
        return `TRAILING ${expr.count} ${expr.period.toUpperCase()} OF ${this.expressionToString(expr.expression)}`;
      default:
        return '?';
    }
  }

  /**
   * Infer the value type based on the name or value.
   */
  private inferValueType(name: string, value: number): 'currency' | 'ratio' | 'percentage' | 'number' {
    const lowerName = name.toLowerCase();

    // Currency indicators
    if (lowerName.includes('debt') || lowerName.includes('revenue') ||
        lowerName.includes('income') || lowerName.includes('expense') ||
        lowerName.includes('ebitda') || lowerName.includes('amount') ||
        lowerName.includes('assets') || lowerName.includes('funded') ||
        lowerName.includes('capacity') || lowerName.includes('balance')) {
      return 'currency';
    }

    // Ratio indicators
    if (lowerName.includes('ratio') || lowerName.includes('leverage') ||
        lowerName.includes('coverage') || lowerName.includes('multiple') ||
        lowerName.includes('dscr')) {
      return 'ratio';
    }

    // Percentage indicators
    if (lowerName.includes('rate') || lowerName.includes('percent') ||
        lowerName.includes('margin') || value > 0 && value < 1) {
      return 'percentage';
    }

    // Default based on magnitude
    if (Math.abs(value) > 10000) return 'currency';
    if (Math.abs(value) < 10) return 'ratio';

    return 'number';
  }

  /**
   * Get all definition names that can be used with getCalculationTree.
   */
  getDefinitionNames(): string[] {
    return Array.from(this.definitions.keys());
  }

  // ==================== COVENANT CHECKING ====================

  checkCovenant(name: string): CovenantResult {
    const covenant = this.covenants.get(name);
    if (!covenant) {
      throw new Error(`Unknown covenant: ${name}`);
    }

    if (!covenant.requires) {
      throw new Error(`Covenant ${name} has no REQUIRES clause`);
    }

    if (!isComparisonExpression(covenant.requires)) {
      // Boolean condition
      const compliant = this.evaluateBoolean(covenant.requires);
      return {
        name,
        compliant,
        actual: compliant ? 1 : 0,
        threshold: 1,
        operator: '=',
      };
    }

    const actual = this.evaluate(covenant.requires.left);
    const threshold = this.evaluate(covenant.requires.right);
    let compliant: boolean;

    switch (covenant.requires.operator) {
      case '<=': compliant = actual <= threshold; break;
      case '>=': compliant = actual >= threshold; break;
      case '<': compliant = actual < threshold; break;
      case '>': compliant = actual > threshold; break;
      case '=': compliant = actual === threshold; break;
      case '!=': compliant = actual !== threshold; break;
      default: compliant = false;
    }

    let headroom: number | undefined;
    if (covenant.requires.operator === '<=') {
      headroom = threshold - actual;
    } else if (covenant.requires.operator === '>=') {
      headroom = actual - threshold;
    }

    return {
      name,
      compliant,
      actual,
      threshold,
      operator: covenant.requires.operator,
      headroom,
    };
  }

  checkAllCovenants(): CovenantResult[] {
    const results: CovenantResult[] = [];
    for (const name of this.covenants.keys()) {
      results.push(this.checkCovenant(name));
    }
    return results;
  }

  /**
   * Check only the covenants that are active in the current phase.
   * Suspended covenants are excluded from the results.
   */
  checkActiveCovenants(): CovenantResult[] {
    const results: CovenantResult[] = [];
    const activeCovenants = this.getActiveCovenants();

    for (const name of activeCovenants) {
      results.push(this.checkCovenant(name));
    }

    // Also check required covenants for this phase
    const requiredCovenants = this.getRequiredCovenants();
    for (const name of requiredCovenants) {
      if (!activeCovenants.includes(name)) {
        results.push(this.checkCovenant(name));
      }
    }

    return results;
  }

  // ==================== BASKET OPERATIONS ====================

  /**
   * Determines the type of basket based on its configuration
   */
  private getBasketType(basket: BasketStatement): 'fixed' | 'grower' | 'builder' {
    if (basket.buildsFrom) {
      return 'builder';
    }
    // A grower basket has a floor or uses a percentage/dynamic expression for capacity
    if (basket.floor) {
      return 'grower';
    }
    return 'fixed';
  }

  /**
   * Calculate the capacity for a grower basket
   * Grower baskets have capacity that scales with financial metrics (e.g., 10% * EBITDA)
   * with an optional floor (minimum capacity)
   */
  private getGrowerBasketCapacity(basket: BasketStatement): { capacity: number; baseCapacity: number; floor?: number } {
    let baseCapacity = 0;

    if (basket.capacity) {
      baseCapacity = this.evaluate(basket.capacity);
    }

    // Add any PLUS components
    for (const plus of basket.plus) {
      baseCapacity += this.evaluate(plus);
    }

    let capacity = baseCapacity;

    // Apply floor if present
    const floor = basket.floor ? this.evaluate(basket.floor) : undefined;
    if (floor !== undefined) {
      capacity = Math.max(capacity, floor);
    }

    return { capacity, baseCapacity, floor };
  }

  /**
   * Calculate the capacity for a builder basket
   * Builder baskets accumulate capacity over time from specified sources
   * with optional starting amount and maximum cap
   */
  private getBuilderBasketCapacity(basket: BasketStatement): { capacity: number; accumulated: number; maximum?: number } {
    // Get starting amount
    const starting = basket.starting ? this.evaluate(basket.starting) : 0;

    // Get accumulated amount (from previous accumulate() calls)
    const accumulated = this.basketAccumulation.get(basket.name) ?? 0;

    let capacity = starting + accumulated;

    // Apply maximum cap if present
    const maximum = basket.maximum ? this.evaluate(basket.maximum) : undefined;
    if (maximum !== undefined) {
      capacity = Math.min(capacity, maximum);
    }

    // Add any PLUS components (additional one-time capacity)
    for (const plus of basket.plus) {
      capacity += this.evaluate(plus);
    }

    return { capacity, accumulated, maximum };
  }

  getBasketCapacity(name: string): number {
    const basket = this.baskets.get(name);
    if (!basket) {
      throw new Error(`Unknown basket: ${name}`);
    }

    const basketType = this.getBasketType(basket);

    switch (basketType) {
      case 'builder':
        return this.getBuilderBasketCapacity(basket).capacity;
      case 'grower':
        return this.getGrowerBasketCapacity(basket).capacity;
      default: {
        // Fixed basket - original logic
        let capacity = 0;
        if (basket.capacity) {
          capacity = this.evaluate(basket.capacity);
        }
        for (const plus of basket.plus) {
          capacity += this.evaluate(plus);
        }
        return capacity;
      }
    }
  }

  getBasketUsed(name: string): number {
    return this.basketUtilization.get(name) ?? 0;
  }

  getBasketAvailable(name: string): number {
    return this.getBasketCapacity(name) - this.getBasketUsed(name);
  }

  getBasketStatus(name: string): BasketStatus {
    const basket = this.baskets.get(name);
    if (!basket) {
      throw new Error(`Unknown basket: ${name}`);
    }

    const basketType = this.getBasketType(basket);
    const capacity = this.getBasketCapacity(name);
    const used = this.getBasketUsed(name);

    const status: BasketStatus = {
      name,
      capacity,
      used,
      available: capacity - used,
      basketType,
    };

    // Add type-specific details
    if (basketType === 'grower') {
      const growerDetails = this.getGrowerBasketCapacity(basket);
      status.baseCapacity = growerDetails.baseCapacity;
      status.floor = growerDetails.floor;
    } else if (basketType === 'builder') {
      const builderDetails = this.getBuilderBasketCapacity(basket);
      status.accumulated = builderDetails.accumulated;
      status.starting = basket.starting ? this.evaluate(basket.starting) : 0;
      status.maximum = builderDetails.maximum;
    }

    return status;
  }

  getAllBasketStatuses(): BasketStatus[] {
    const statuses: BasketStatus[] = [];
    for (const name of this.baskets.keys()) {
      statuses.push(this.getBasketStatus(name));
    }
    return statuses;
  }

  useBasket(name: string, amount: number, description: string): void {
    const available = this.getBasketAvailable(name);
    if (amount > available) {
      throw new Error(`Insufficient basket capacity: ${name} has $${available} available, requested $${amount}`);
    }

    const current = this.basketUtilization.get(name) ?? 0;
    this.basketUtilization.set(name, current + amount);

    this.basketLedger.push({
      timestamp: new Date(),
      basket: name,
      amount,
      description,
      entryType: 'usage',
    });
  }

  /**
   * Accumulate capacity to a builder basket
   * This is called periodically (e.g., quarterly) to add capacity based on the BUILDS_FROM expression
   */
  accumulateBuilderBasket(name: string, description: string): number {
    const basket = this.baskets.get(name);
    if (!basket) {
      throw new Error(`Unknown basket: ${name}`);
    }

    if (!basket.buildsFrom) {
      throw new Error(`Basket ${name} is not a builder basket (no BUILDS_FROM clause)`);
    }

    // Evaluate the BUILDS_FROM expression
    const accumulationAmount = this.evaluate(basket.buildsFrom);

    // Add to current accumulation
    const current = this.basketAccumulation.get(name) ?? 0;
    let newTotal = current + accumulationAmount;

    // Apply maximum cap if present
    if (basket.maximum) {
      const starting = basket.starting ? this.evaluate(basket.starting) : 0;
      const maximum = this.evaluate(basket.maximum);
      // The maximum applies to the total capacity (starting + accumulated)
      const maxAccumulation = maximum - starting;
      newTotal = Math.min(newTotal, maxAccumulation);
    }

    this.basketAccumulation.set(name, newTotal);

    // Record in ledger
    this.basketLedger.push({
      timestamp: new Date(),
      basket: name,
      amount: accumulationAmount,
      description,
      entryType: 'accumulation',
    });

    return accumulationAmount;
  }

  /**
   * Get all builder basket names
   */
  getBuilderBasketNames(): string[] {
    const names: string[] = [];
    for (const [name, basket] of this.baskets) {
      if (this.getBasketType(basket) === 'builder') {
        names.push(name);
      }
    }
    return names;
  }

  /**
   * Get all grower basket names
   */
  getGrowerBasketNames(): string[] {
    const names: string[] = [];
    for (const [name, basket] of this.baskets) {
      if (this.getBasketType(basket) === 'grower') {
        names.push(name);
      }
    }
    return names;
  }

  // ==================== PROHIBITION CHECKING ====================

  checkProhibition(action: string, amount?: number): QueryResult {
    const prohibition = this.prohibitions.get(action);
    const reasoning: ReasoningStep[] = [];
    const warnings: string[] = [];

    if (!prohibition) {
      // No prohibition found - permitted by default
      return {
        permitted: true,
        reasoning: [{
          rule: 'Default',
          evaluation: `No prohibition found for ${action}`,
          passed: true,
        }],
        warnings: [],
      };
    }

    // Set evaluation context if amount is provided
    if (amount !== undefined) {
      this.evaluationContext = { bindings: { amount } };
    }

    try {
      // Action is prohibited by default
      reasoning.push({
        rule: `Prohibit ${action}`,
        evaluation: `${action} is generally prohibited`,
        passed: false,
      });

      // Check exceptions
      for (const exception of prohibition.exceptions) {
        if (exception.type === 'ExceptWhen' && exception.conditions) {
          let allConditionsMet = true;

          for (const cond of exception.conditions) {
            const condMet = this.evaluateBoolean(cond);
            reasoning.push({
              rule: this.describeCondition(cond),
              evaluation: condMet ? 'PASS' : 'FAIL',
              passed: condMet,
            });

            if (!condMet) {
              allConditionsMet = false;
            }
          }

          if (allConditionsMet) {
            return {
              permitted: true,
              reasoning,
              warnings,
            };
          }
        }
      }

      return {
        permitted: false,
        reasoning,
        warnings: ['All exception conditions must be satisfied'],
      };
    } finally {
      // Clear evaluation context
      this.evaluationContext = {};
    }
  }

  private describeCondition(cond: Expression): string {
    if (typeof cond === 'string') {
      return cond;
    }
    if (!isObjectExpression(cond)) {
      return String(cond);
    }
    if (isComparisonExpression(cond)) {
      return `${this.describeExpr(cond.left)} ${cond.operator} ${this.describeExpr(cond.right)}`;
    }
    if (isFunctionCallExpression(cond)) {
      return `${cond.name}(${cond.arguments.map((a) => this.describeExpr(a)).join(', ')})`;
    }
    return JSON.stringify(cond);
  }

  private describeExpr(expr: Expression): string {
    if (typeof expr === 'string') return expr;
    if (typeof expr === 'number') return expr.toString();
    if (!isObjectExpression(expr)) return '...';

    switch (expr.type) {
      case 'Currency': return `$${expr.value.toLocaleString()}`;
      case 'Number': return expr.value.toString();
      case 'Ratio': return `${expr.value}x`;
      case 'Percentage': return `${expr.value}%`;
      case 'FunctionCall': return `${expr.name}(...)`;
      default: return '...';
    }
  }

  // ==================== SIMULATION ====================

  simulate(changes: Partial<SimpleFinancialData>): SimulationResult {
    if (this.isMultiPeriodMode() && this.multiPeriodData && this.evaluationPeriod) {
      // Multi-period mode: apply changes to the current period
      const periodIdx = this.multiPeriodData.periods.findIndex(
        (p) => p.period === this.evaluationPeriod
      );
      if (periodIdx >= 0) {
        const periodData = this.multiPeriodData.periods[periodIdx]!;
        const savedPeriodData = { ...periodData.data };

        // Apply changes
        for (const [key, value] of Object.entries(changes)) {
          if (value !== undefined) {
            periodData.data[key] = value;
          }
        }

        // Evaluate
        const covenants = this.checkAllCovenants();
        const baskets = this.getAllBasketStatuses();

        // Restore
        periodData.data = savedPeriodData;

        return { covenants, baskets };
      }
    }

    // Simple mode: save and restore simple financial data
    const savedData = { ...this.simpleFinancialData };

    // Apply changes (filter out undefined values)
    for (const [key, value] of Object.entries(changes)) {
      if (value !== undefined) {
        this.simpleFinancialData[key] = value;
      }
    }

    // Evaluate
    const covenants = this.checkAllCovenants();
    const baskets = this.getAllBasketStatuses();

    // Restore state
    this.simpleFinancialData = savedData;

    return { covenants, baskets };
  }

  // ==================== STATUS REPORT ====================

  getStatus(): StatusReport {
    // Use phase-aware covenant checking if phases are defined
    const covenants = this.hasPhases()
      ? this.checkActiveCovenants()
      : this.checkAllCovenants();
    const baskets = this.getAllBasketStatuses();
    const overallCompliant = covenants.every(c => c.compliant);

    const report: StatusReport = {
      timestamp: new Date(),
      covenants,
      baskets,
      overallCompliant,
    };

    // Include phase information if available
    if (this.hasPhases()) {
      report.currentPhase = this.currentPhase ?? undefined;
      report.suspendedCovenants = this.getSuspendedCovenants();
    }

    return report;
  }

  // ==================== MULTI-PERIOD OPERATIONS ====================

  /**
   * Set the evaluation period for multi-period mode.
   * This affects which period's data is used for identifier resolution.
   */
  setEvaluationPeriod(period: string): void {
    if (!this.isMultiPeriodMode()) {
      console.warn('setEvaluationPeriod called but not in multi-period mode');
      return;
    }
    if (!this.multiPeriodData?.periods.find((p) => p.period === period)) {
      throw new Error(`Period '${period}' not found in financial data`);
    }
    this.evaluationPeriod = period;
  }

  /**
   * Clear the evaluation period (defaults to latest period).
   */
  clearEvaluationPeriod(): void {
    if (this.multiPeriodData && this.multiPeriodData.periods.length > 0) {
      const sorted = this.sortPeriods(this.multiPeriodData.periods.map((p) => p.period));
      this.evaluationPeriod = sorted[sorted.length - 1] ?? null;
    } else {
      this.evaluationPeriod = null;
    }
  }

  /**
   * Get the current evaluation period.
   */
  getEvaluationPeriod(): string | null {
    return this.evaluationPeriod;
  }

  /**
   * Get all available periods from multi-period data, sorted chronologically.
   */
  getAvailablePeriods(): string[] {
    if (!this.multiPeriodData) return [];
    return this.sortPeriods(this.multiPeriodData.periods.map((p) => p.period));
  }

  /**
   * Check if the interpreter is in multi-period mode.
   */
  hasMultiPeriodData(): boolean {
    return this.isMultiPeriodMode();
  }

  /**
   * Get compliance history across all periods.
   * Returns covenant results for each period.
   */
  getComplianceHistory(): Array<{
    period: string;
    periodEnd: string;
    covenants: CovenantResult[];
    overallCompliant: boolean;
  }> {
    if (!this.isMultiPeriodMode() || !this.multiPeriodData) {
      // Not in multi-period mode, return single entry with current data
      return [
        {
          period: 'current',
          periodEnd: new Date().toISOString().split('T')[0]!,
          covenants: this.checkAllCovenants(),
          overallCompliant: this.checkAllCovenants().every((c) => c.compliant),
        },
      ];
    }

    const savedPeriod = this.evaluationPeriod;
    const history: Array<{
      period: string;
      periodEnd: string;
      covenants: CovenantResult[];
      overallCompliant: boolean;
    }> = [];

    const sortedPeriods = this.getAvailablePeriods();

    for (const period of sortedPeriods) {
      this.evaluationPeriod = period;
      const periodData = this.multiPeriodData.periods.find((p) => p.period === period);
      const covenants = this.checkAllCovenants();

      history.push({
        period,
        periodEnd: periodData?.periodEnd ?? '',
        covenants,
        overallCompliant: covenants.every((c) => c.compliant),
      });
    }

    // Restore the original period
    this.evaluationPeriod = savedPeriod;
    return history;
  }

  // ==================== PHASE SYSTEM ====================

  /**
   * Get the current phase name.
   */
  getCurrentPhase(): string | null {
    return this.currentPhase;
  }

  /**
   * Get the current phase statement.
   */
  getCurrentPhaseStatement(): PhaseStatement | null {
    if (!this.currentPhase) return null;
    return this.phases.get(this.currentPhase) ?? null;
  }

  /**
   * Set the current phase directly.
   * Typically called via transitionTo() but can be set manually.
   */
  setCurrentPhase(phaseName: string, triggeredBy: string | null = null): void {
    if (!this.phases.has(phaseName)) {
      throw new Error(`Unknown phase: ${phaseName}`);
    }

    this.currentPhase = phaseName;
    this.phaseHistory.push({
      phase: phaseName,
      enteredAt: new Date(),
      triggeredBy,
    });
  }

  /**
   * Transition to a new phase triggered by an event.
   * Finds the phase that starts FROM the given event.
   */
  transitionTo(eventName: string): void {
    // Mark the event as satisfied
    this.satisfiedConditions.add(eventName);

    // Find the phase that starts from this event
    for (const [phaseName, phase] of this.phases) {
      if (phase.from === eventName) {
        this.setCurrentPhase(phaseName, eventName);
        return;
      }
    }

    // If no phase found, just record the event (it might be a milestone)
  }

  /**
   * Mark a condition/milestone as satisfied.
   */
  satisfyCondition(conditionName: string): void {
    this.satisfiedConditions.add(conditionName);
  }

  /**
   * Check if a condition/milestone is satisfied.
   */
  isConditionSatisfied(conditionName: string): boolean {
    return this.satisfiedConditions.has(conditionName);
  }

  /**
   * Clear a satisfied condition.
   */
  clearCondition(conditionName: string): void {
    this.satisfiedConditions.delete(conditionName);
  }

  /**
   * Check all transitions and return their status.
   * Does NOT automatically trigger transitions - call transitionTo() for that.
   */
  checkPhaseTransitions(): TransitionResult[] {
    const results: TransitionResult[] = [];

    for (const [, transition] of this.transitions) {
      const result = this.evaluateTransition(transition);
      results.push(result);
    }

    return results;
  }

  /**
   * Evaluate a single transition's conditions.
   */
  private evaluateTransition(transition: TransitionStatement): TransitionResult {
    const conditions: { name: string; met: boolean }[] = [];
    let triggered = false;

    if (!transition.when) {
      return {
        name: transition.name,
        triggered: false,
        conditions: [],
      };
    }

    // Handle ALL_OF and ANY_OF conditions
    if (isAllOfCondition(transition.when)) {
      triggered = true;
      for (const condName of transition.when.conditions) {
        const met = this.satisfiedConditions.has(condName);
        conditions.push({ name: condName, met });
        if (!met) {
          triggered = false;
        }
      }
    } else if (isAnyOfCondition(transition.when)) {
      triggered = false;
      for (const condName of transition.when.conditions) {
        const met = this.satisfiedConditions.has(condName);
        conditions.push({ name: condName, met });
        if (met) {
          triggered = true;
        }
      }
    } else {
      // It's a boolean expression - evaluate it
      try {
        triggered = this.evaluateBoolean(transition.when as Expression);
        conditions.push({ name: 'expression', met: triggered });
      } catch {
        triggered = false;
        conditions.push({ name: 'expression', met: false });
      }
    }

    // Find the target phase
    let targetPhase: string | undefined;
    for (const [phaseName, phase] of this.phases) {
      if (phase.from === transition.name) {
        targetPhase = phaseName;
        break;
      }
    }

    return {
      name: transition.name,
      triggered,
      conditions,
      targetPhase,
    };
  }

  /**
   * Get the list of covenants that are currently active (not suspended).
   * In the current phase, this respects:
   * - covenantsActive: explicitly active covenants
   * - covenantsSuspended: explicitly suspended covenants
   * If no phase is set, all covenants are active.
   */
  getActiveCovenants(): string[] {
    const phase = this.getCurrentPhaseStatement();
    const allCovenants = Array.from(this.covenants.keys());

    if (!phase) {
      return allCovenants;
    }

    // If phase explicitly lists active covenants, use that list
    if (phase.covenantsActive.length > 0) {
      return phase.covenantsActive.filter((name) => this.covenants.has(name));
    }

    // Otherwise, return all covenants except suspended ones
    const suspended = new Set(phase.covenantsSuspended);
    return allCovenants.filter((name) => !suspended.has(name));
  }

  /**
   * Get the list of covenants that are suspended in the current phase.
   */
  getSuspendedCovenants(): string[] {
    const phase = this.getCurrentPhaseStatement();
    if (!phase) {
      return [];
    }
    return phase.covenantsSuspended.filter((name) => this.covenants.has(name));
  }

  /**
   * Get the list of required covenants for the current phase.
   * Required covenants are phase-specific covenants that must be tested.
   */
  getRequiredCovenants(): string[] {
    const phase = this.getCurrentPhaseStatement();
    if (!phase) {
      return [];
    }
    return phase.requiredCovenants.filter((name) => this.covenants.has(name));
  }

  /**
   * Check if a specific covenant is active in the current phase.
   */
  isCovenantActive(covenantName: string): boolean {
    const phase = this.getCurrentPhaseStatement();
    if (!phase) {
      return true; // No phase = all covenants active
    }

    // If covenant is explicitly suspended, it's not active
    if (phase.covenantsSuspended.includes(covenantName)) {
      return false;
    }

    // If phase has explicit active list, check if covenant is in it
    if (phase.covenantsActive.length > 0) {
      return phase.covenantsActive.includes(covenantName);
    }

    // Otherwise, covenant is active (not suspended)
    return true;
  }

  /**
   * Get the phase history.
   */
  getPhaseHistory(): PhaseHistoryEntry[] {
    return [...this.phaseHistory];
  }

  /**
   * Get all phase names.
   */
  getPhaseNames(): string[] {
    return Array.from(this.phases.keys());
  }

  /**
   * Get all transition names.
   */
  getTransitionNames(): string[] {
    return Array.from(this.transitions.keys());
  }

  /**
   * Get a phase statement by name.
   */
  getPhase(name: string): PhaseStatement | undefined {
    return this.phases.get(name);
  }

  /**
   * Get a transition statement by name.
   */
  getTransition(name: string): TransitionStatement | undefined {
    return this.transitions.get(name);
  }

  /**
   * Check if project has phase definitions.
   */
  hasPhases(): boolean {
    return this.phases.size > 0;
  }

  // ==================== MILESTONE SYSTEM ====================

  /**
   * Get milestone status based on current date.
   */
  getMilestoneStatus(name: string, asOfDate?: Date): MilestoneResult {
    const milestone = this.milestones.get(name);
    if (!milestone) {
      throw new Error(`Unknown milestone: ${name}`);
    }

    const now = asOfDate ?? new Date();
    const achievedDate = this.milestoneAchievements.get(name);

    // Parse dates
    const targetDate = milestone.targetDate ? new Date(milestone.targetDate) : null;
    const longstopDate = milestone.longstopDate ? new Date(milestone.longstopDate) : null;

    // Calculate days
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysToTarget = targetDate
      ? Math.ceil((targetDate.getTime() - now.getTime()) / msPerDay)
      : 0;
    const daysToLongstop = longstopDate
      ? Math.ceil((longstopDate.getTime() - now.getTime()) / msPerDay)
      : 0;

    // Check prerequisites
    const prerequisites = this.checkMilestonePrerequisites(milestone);

    // Determine status
    let status: MilestoneStatus;
    if (achievedDate) {
      status = 'achieved';
    } else if (longstopDate && now > longstopDate) {
      status = 'breached';
    } else if (targetDate && now > targetDate) {
      status = 'at_risk';
    } else {
      status = 'pending';
    }

    return {
      name,
      status,
      targetDate: milestone.targetDate,
      longstopDate: milestone.longstopDate,
      achievedDate: achievedDate?.toISOString().split('T')[0],
      daysToTarget,
      daysToLongstop,
      prerequisites,
    };
  }

  /**
   * Check if milestone prerequisites are met.
   */
  private checkMilestonePrerequisites(milestone: MilestoneStatement): { name: string; met: boolean }[] {
    const results: { name: string; met: boolean }[] = [];

    if (!milestone.requires) {
      return results;
    }

    if (typeof milestone.requires === 'string') {
      // Single prerequisite
      const met = this.isMilestoneAchieved(milestone.requires) ||
                  this.satisfiedConditions.has(milestone.requires);
      results.push({ name: milestone.requires, met });
    } else if (isAllOfCondition(milestone.requires)) {
      for (const cond of milestone.requires.conditions) {
        const met = this.isMilestoneAchieved(cond) || this.satisfiedConditions.has(cond);
        results.push({ name: cond, met });
      }
    } else if (isAnyOfCondition(milestone.requires)) {
      for (const cond of milestone.requires.conditions) {
        const met = this.isMilestoneAchieved(cond) || this.satisfiedConditions.has(cond);
        results.push({ name: cond, met });
      }
    }

    return results;
  }

  /**
   * Check if all milestone prerequisites are satisfied.
   */
  areMilestonePrerequisitesMet(name: string): boolean {
    const milestone = this.milestones.get(name);
    if (!milestone) return false;
    if (!milestone.requires) return true;

    const prereqs = this.checkMilestonePrerequisites(milestone);

    if (typeof milestone.requires === 'string') {
      return prereqs.every(p => p.met);
    } else if (isAllOfCondition(milestone.requires)) {
      return prereqs.every(p => p.met);
    } else if (isAnyOfCondition(milestone.requires)) {
      return prereqs.some(p => p.met);
    }

    return true;
  }

  /**
   * Mark a milestone as achieved.
   */
  achieveMilestone(name: string, achievedDate?: Date): void {
    const milestone = this.milestones.get(name);
    if (!milestone) {
      throw new Error(`Unknown milestone: ${name}`);
    }

    const date = achievedDate ?? new Date();
    this.milestoneAchievements.set(name, date);

    // Mark as satisfied for transition checking
    this.satisfiedConditions.add(name);

    // Trigger any events
    for (const trigger of milestone.triggers) {
      this.satisfiedConditions.add(trigger);
    }
  }

  /**
   * Check if a milestone has been achieved.
   */
  isMilestoneAchieved(name: string): boolean {
    return this.milestoneAchievements.has(name);
  }

  /**
   * Get all milestone statuses.
   */
  getAllMilestoneStatuses(asOfDate?: Date): MilestoneResult[] {
    const results: MilestoneResult[] = [];
    for (const name of this.milestones.keys()) {
      results.push(this.getMilestoneStatus(name, asOfDate));
    }
    return results;
  }

  /**
   * Get milestone names.
   */
  getMilestoneNames(): string[] {
    return Array.from(this.milestones.keys());
  }

  /**
   * Check if project has milestones.
   */
  hasMilestones(): boolean {
    return this.milestones.size > 0;
  }

  // ==================== TECHNICAL MILESTONE SYSTEM ====================

  /**
   * Get technical milestone status with quantitative progress tracking.
   */
  getTechnicalMilestoneStatus(name: string, asOfDate?: Date): TechnicalMilestoneResult {
    const milestone = this.technicalMilestones.get(name);
    if (!milestone) {
      throw new Error(`Unknown technical milestone: ${name}`);
    }

    const now = asOfDate ?? new Date();
    const achievedDate = this.technicalMilestoneAchievements.get(name);

    // Parse dates
    const targetDate = milestone.targetDate ? new Date(milestone.targetDate) : null;
    const longstopDate = milestone.longstopDate ? new Date(milestone.longstopDate) : null;

    // Calculate days
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysToTarget = targetDate
      ? Math.ceil((targetDate.getTime() - now.getTime()) / msPerDay)
      : 0;
    const daysToLongstop = longstopDate
      ? Math.ceil((longstopDate.getTime() - now.getTime()) / msPerDay)
      : 0;

    // Evaluate quantitative values
    const targetValue = milestone.targetValue ? this.evaluate(milestone.targetValue) : null;
    const currentValue = milestone.currentValue ? this.evaluate(milestone.currentValue) : null;
    const progressMetric = milestone.progressMetric ? this.evaluate(milestone.progressMetric) : null;

    // Calculate completion percentage
    let completionPercent: number | null = null;
    if (targetValue !== null && currentValue !== null && targetValue > 0) {
      completionPercent = (currentValue / targetValue) * 100;
    } else if (progressMetric !== null) {
      completionPercent = progressMetric * 100; // Assume metric is already a ratio
    }

    // Check prerequisites (same logic as regular milestones)
    const prerequisites = this.checkTechnicalMilestonePrerequisites(milestone);

    // Determine status - achieved if current >= target OR manually achieved
    let status: MilestoneStatus;
    if (achievedDate) {
      status = 'achieved';
    } else if (currentValue !== null && targetValue !== null && currentValue >= targetValue) {
      // Auto-achieve when target is met
      status = 'achieved';
    } else if (longstopDate && now > longstopDate) {
      status = 'breached';
    } else if (targetDate && now > targetDate) {
      status = 'at_risk';
    } else {
      status = 'pending';
    }

    return {
      name,
      status,
      targetDate: milestone.targetDate,
      longstopDate: milestone.longstopDate,
      achievedDate: achievedDate?.toISOString().split('T')[0],
      daysToTarget,
      daysToLongstop,
      measurement: milestone.measurement,
      targetValue,
      currentValue,
      completionPercent,
      progressMetric,
      prerequisites,
    };
  }

  /**
   * Check prerequisites for a technical milestone.
   */
  private checkTechnicalMilestonePrerequisites(
    milestone: TechnicalMilestoneStatement
  ): { name: string; met: boolean }[] {
    const results: { name: string; met: boolean }[] = [];

    if (!milestone.requires) {
      return results;
    }

    if (typeof milestone.requires === 'string') {
      const met =
        this.isTechnicalMilestoneAchieved(milestone.requires) ||
        this.isMilestoneAchieved(milestone.requires) ||
        this.satisfiedConditions.has(milestone.requires);
      results.push({ name: milestone.requires, met });
    } else if (isAllOfCondition(milestone.requires)) {
      for (const cond of milestone.requires.conditions) {
        const met =
          this.isTechnicalMilestoneAchieved(cond) ||
          this.isMilestoneAchieved(cond) ||
          this.satisfiedConditions.has(cond);
        results.push({ name: cond, met });
      }
    } else if (isAnyOfCondition(milestone.requires)) {
      for (const cond of milestone.requires.conditions) {
        const met =
          this.isTechnicalMilestoneAchieved(cond) ||
          this.isMilestoneAchieved(cond) ||
          this.satisfiedConditions.has(cond);
        results.push({ name: cond, met });
      }
    }

    return results;
  }

  /**
   * Mark a technical milestone as achieved.
   */
  achieveTechnicalMilestone(name: string, achievedDate?: Date): void {
    const milestone = this.technicalMilestones.get(name);
    if (!milestone) {
      throw new Error(`Unknown technical milestone: ${name}`);
    }

    const date = achievedDate ?? new Date();
    this.technicalMilestoneAchievements.set(name, date);

    // Mark as satisfied for transition checking
    this.satisfiedConditions.add(name);

    // Trigger any events
    for (const trigger of milestone.triggers) {
      this.satisfiedConditions.add(trigger);
    }
  }

  /**
   * Check if a technical milestone has been achieved.
   * If achieved via value comparison, also triggers the conditions.
   */
  isTechnicalMilestoneAchieved(name: string): boolean {
    if (this.technicalMilestoneAchievements.has(name)) {
      return true;
    }
    // Also check if current value meets target
    const milestone = this.technicalMilestones.get(name);
    if (milestone && milestone.targetValue && milestone.currentValue) {
      const target = this.evaluate(milestone.targetValue);
      const current = this.evaluate(milestone.currentValue);
      if (current >= target) {
        // Auto-trigger conditions when achievement is detected
        this.satisfiedConditions.add(name);
        for (const trigger of milestone.triggers) {
          this.satisfiedConditions.add(trigger);
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Get all technical milestone statuses.
   */
  getAllTechnicalMilestoneStatuses(asOfDate?: Date): TechnicalMilestoneResult[] {
    const results: TechnicalMilestoneResult[] = [];
    for (const name of this.technicalMilestones.keys()) {
      results.push(this.getTechnicalMilestoneStatus(name, asOfDate));
    }
    return results;
  }

  /**
   * Get technical milestone names.
   */
  getTechnicalMilestoneNames(): string[] {
    return Array.from(this.technicalMilestones.keys());
  }

  /**
   * Check if project has technical milestones.
   */
  hasTechnicalMilestones(): boolean {
    return this.technicalMilestones.size > 0;
  }

  // ==================== REGULATORY REQUIREMENT SYSTEM ====================

  /**
   * Get regulatory requirement status.
   */
  getRegulatoryRequirementStatus(name: string): RegulatoryRequirementResult {
    const req = this.regulatoryRequirements.get(name);
    if (!req) {
      throw new Error(`Unknown regulatory requirement: ${name}`);
    }

    const status = this.regulatoryStatuses.get(name) ?? req.status;

    // Check if this requirement is blocking its required phase
    const blocking = req.requiredFor !== null && status !== 'approved';

    return {
      name: req.name,
      agency: req.agency,
      requirementType: req.requirementType,
      description: req.description,
      requiredFor: req.requiredFor,
      status,
      approvalDate: req.approvalDate,
      blocking,
      satisfies: req.satisfies,
    };
  }

  /**
   * Update regulatory requirement status.
   */
  updateRegulatoryStatus(name: string, status: RegulatoryStatus, approvalDate?: string): void {
    const req = this.regulatoryRequirements.get(name);
    if (!req) {
      throw new Error(`Unknown regulatory requirement: ${name}`);
    }

    this.regulatoryStatuses.set(name, status);

    // If approved, mark conditions as satisfied
    if (status === 'approved') {
      this.satisfiedConditions.add(name);
      for (const sat of req.satisfies) {
        this.satisfiedConditions.add(sat);
      }
    }

    // Update the approval date in the statement if provided
    if (approvalDate && status === 'approved') {
      req.approvalDate = approvalDate;
    }
  }

  /**
   * Get all regulatory requirement statuses.
   */
  getAllRegulatoryRequirementStatuses(): RegulatoryRequirementResult[] {
    const results: RegulatoryRequirementResult[] = [];
    for (const name of this.regulatoryRequirements.keys()) {
      results.push(this.getRegulatoryRequirementStatus(name));
    }
    return results;
  }

  /**
   * Get regulatory checklist summary.
   */
  getRegulatoryChecklist(): RegulatoryChecklistResult {
    const requirements = this.getAllRegulatoryRequirementStatuses();

    // Count by status
    let approved = 0;
    let submitted = 0;
    let pending = 0;
    let denied = 0;

    // Track phase readiness
    const phaseRequirements: Record<string, { total: number; approved: number }> = {};

    for (const req of requirements) {
      switch (req.status) {
        case 'approved':
          approved++;
          break;
        case 'submitted':
          submitted++;
          break;
        case 'pending':
          pending++;
          break;
        case 'denied':
          denied++;
          break;
      }

      // Track by phase
      if (req.requiredFor) {
        const phase = req.requiredFor;
        if (!phaseRequirements[phase]) {
          phaseRequirements[phase] = { total: 0, approved: 0 };
        }
        const phaseData = phaseRequirements[phase];
        if (phaseData) {
          phaseData.total++;
          if (req.status === 'approved') {
            phaseData.approved++;
          }
        }
      }
    }

    // Calculate phase readiness
    const phaseReady: Record<string, boolean> = {};
    for (const [phase, counts] of Object.entries(phaseRequirements)) {
      phaseReady[phase] = counts.approved === counts.total;
    }

    return {
      totalRequirements: requirements.length,
      approved,
      submitted,
      pending,
      denied,
      phaseReady,
      requirements,
    };
  }

  /**
   * Check if all requirements for a phase are approved.
   */
  isPhaseRegulatoryReady(phase: string): boolean {
    const checklist = this.getRegulatoryChecklist();
    return checklist.phaseReady[phase] ?? true;
  }

  /**
   * Get regulatory requirement names.
   */
  getRegulatoryRequirementNames(): string[] {
    return Array.from(this.regulatoryRequirements.keys());
  }

  /**
   * Check if project has regulatory requirements.
   */
  hasRegulatoryRequirements(): boolean {
    return this.regulatoryRequirements.size > 0;
  }

  // ==================== PERFORMANCE GUARANTEE SYSTEM ====================

  /**
   * Evaluate a performance guarantee against actual performance.
   */
  getPerformanceGuaranteeStatus(name: string): PerformanceGuaranteeResult {
    const guarantee = this.performanceGuarantees.get(name);
    if (!guarantee) {
      throw new Error(`Unknown performance guarantee: ${name}`);
    }

    // Evaluate threshold values
    const p50 = guarantee.p50 ? this.evaluate(guarantee.p50) : null;
    const p75 = guarantee.p75 ? this.evaluate(guarantee.p75) : null;
    const p90 = guarantee.p90 ? this.evaluate(guarantee.p90) : null;
    const p99 = guarantee.p99 ? this.evaluate(guarantee.p99) : null;

    // Get actual value - either from ACTUAL clause or from financial data
    let actual: number | null = null;
    if (guarantee.actualValue) {
      actual = this.evaluate(guarantee.actualValue);
    } else if (guarantee.metric) {
      const metricValue = this.getFinancialValue(guarantee.metric);
      actual = metricValue ?? null;
    }

    // Determine performance level
    let performanceLevel: 'p50' | 'p75' | 'p90' | 'p99' | 'below_p99' | null = null;
    if (actual !== null) {
      if (p50 !== null && actual >= p50) {
        performanceLevel = 'p50';
      } else if (p75 !== null && actual >= p75) {
        performanceLevel = 'p75';
      } else if (p90 !== null && actual >= p90) {
        performanceLevel = 'p90';
      } else if (p99 !== null && actual >= p99) {
        performanceLevel = 'p99';
      } else {
        performanceLevel = 'below_p99';
      }
    }

    // Calculate shortfall (below P99 threshold)
    let shortfall = 0;
    if (actual !== null && p99 !== null && actual < p99) {
      shortfall = p99 - actual;
    }

    // Calculate shortfall payment
    let shortfallPayment = 0;
    if (shortfall > 0 && guarantee.shortfallRate) {
      const rate = this.evaluate(guarantee.shortfallRate);
      shortfallPayment = shortfall * rate;
    }

    // Determine if meets guarantee (typically P99 or lowest defined threshold)
    const meetsGuarantee = performanceLevel !== 'below_p99' && performanceLevel !== null;

    return {
      name: guarantee.name,
      metric: guarantee.metric,
      p50,
      p75,
      p90,
      p99,
      actual,
      performanceLevel,
      meetsGuarantee,
      shortfall,
      shortfallPayment,
      guaranteePeriod: guarantee.guaranteePeriod,
    };
  }

  /**
   * Get all performance guarantee statuses.
   */
  getAllPerformanceGuaranteeStatuses(): PerformanceGuaranteeResult[] {
    const results: PerformanceGuaranteeResult[] = [];
    for (const name of this.performanceGuarantees.keys()) {
      results.push(this.getPerformanceGuaranteeStatus(name));
    }
    return results;
  }

  /**
   * Get performance guarantee names.
   */
  getPerformanceGuaranteeNames(): string[] {
    return Array.from(this.performanceGuarantees.keys());
  }

  /**
   * Check if project has performance guarantees.
   */
  hasPerformanceGuarantees(): boolean {
    return this.performanceGuarantees.size > 0;
  }

  // ==================== DEGRADATION SCHEDULE SYSTEM ====================

  /**
   * Calculate degraded capacity for a given year.
   */
  getDegradedCapacity(name: string, year: number): DegradationResult {
    const schedule = this.degradationSchedules.get(name);
    if (!schedule) {
      throw new Error(`Unknown degradation schedule: ${name}`);
    }

    const initialCapacity = schedule.initialCapacity ? this.evaluate(schedule.initialCapacity) : 0;
    const minimumCapacity = schedule.minimumCapacity ? this.evaluate(schedule.minimumCapacity) : 0;

    let cumulativeDegradation = 0;

    if (schedule.schedule && schedule.schedule.length > 0) {
      // Use explicit year-by-year schedule
      for (const entry of schedule.schedule) {
        if (entry.year <= year) {
          cumulativeDegradation += this.evaluate(entry.rate);
        }
      }
    } else {
      // Use year1 + annual rates
      const year1Rate = schedule.year1Degradation ? this.evaluate(schedule.year1Degradation) : 0;
      const annualRate = schedule.annualDegradation ? this.evaluate(schedule.annualDegradation) : 0;

      if (year >= 1) {
        // Year 1 degradation (often higher due to initial burn-in)
        cumulativeDegradation = year1Rate;
      }
      if (year > 1) {
        // Subsequent years use annual rate
        cumulativeDegradation += (year - 1) * annualRate;
      }
    }

    // Convert percentage to decimal if needed (assume rates are percentages)
    const degradationFactor = cumulativeDegradation / 100;

    // Calculate effective capacity
    let effectiveCapacity = initialCapacity * (1 - degradationFactor);

    // Apply minimum floor
    const atMinimum = effectiveCapacity < minimumCapacity;
    if (atMinimum) {
      effectiveCapacity = minimumCapacity;
    }

    return {
      name: schedule.name,
      assetType: schedule.assetType,
      initialCapacity,
      year,
      cumulativeDegradation,
      effectiveCapacity,
      capacityPercent: initialCapacity > 0 ? (effectiveCapacity / initialCapacity) * 100 : 0,
      atMinimum,
      affects: schedule.affects,
    };
  }

  /**
   * Get degradation results for all years up to a given year.
   */
  getDegradationProjection(name: string, years: number): DegradationResult[] {
    const results: DegradationResult[] = [];
    for (let year = 1; year <= years; year++) {
      results.push(this.getDegradedCapacity(name, year));
    }
    return results;
  }

  /**
   * Get all degradation schedule names.
   */
  getDegradationScheduleNames(): string[] {
    return Array.from(this.degradationSchedules.keys());
  }

  /**
   * Check if project has degradation schedules.
   */
  hasDegradationSchedules(): boolean {
    return this.degradationSchedules.size > 0;
  }

  // ==================== SEASONAL ADJUSTMENT SYSTEM ====================

  /**
   * Apply seasonal adjustments to a metric value.
   * @param metricName The metric to adjust
   * @param baseValue The base value to adjust
   * @param currentPeriod The current period (e.g., 'Q1', 'Q4', 'Jan', 'Dec')
   */
  applySeasonalAdjustments(
    metricName: string,
    baseValue: number,
    currentPeriod?: string
  ): SeasonalAdjustmentResult | null {
    // Find adjustments that apply to this metric
    for (const [name, adjustment] of this.seasonalAdjustments) {
      if (adjustment.metric === metricName) {
        const factor = adjustment.adjustmentFactor ? this.evaluate(adjustment.adjustmentFactor) : 1;

        // Check if the current period matches the adjustment's seasons
        let active = false;
        if (currentPeriod && adjustment.season.length > 0) {
          active = adjustment.season.includes(currentPeriod);
        }

        return {
          name,
          metric: adjustment.metric,
          baseValue,
          adjustmentFactor: factor,
          adjustedValue: active ? baseValue * factor : baseValue,
          active,
          seasons: adjustment.season,
          reason: adjustment.reason,
        };
      }
    }
    return null;
  }

  /**
   * Get seasonal adjustment status for a specific adjustment.
   */
  getSeasonalAdjustmentStatus(name: string, currentPeriod?: string): SeasonalAdjustmentResult {
    const adjustment = this.seasonalAdjustments.get(name);
    if (!adjustment) {
      throw new Error(`Unknown seasonal adjustment: ${name}`);
    }

    const factor = adjustment.adjustmentFactor ? this.evaluate(adjustment.adjustmentFactor) : 1;

    // Get the base value for the metric
    let baseValue = 0;
    if (adjustment.metric) {
      baseValue = this.getFinancialValue(adjustment.metric) ?? 0;
    }

    // Check if the current period matches the adjustment's seasons
    let active = false;
    if (currentPeriod && adjustment.season.length > 0) {
      active = adjustment.season.includes(currentPeriod);
    }

    return {
      name,
      metric: adjustment.metric,
      baseValue,
      adjustmentFactor: factor,
      adjustedValue: active ? baseValue * factor : baseValue,
      active,
      seasons: adjustment.season,
      reason: adjustment.reason,
    };
  }

  /**
   * Get all seasonal adjustment statuses.
   */
  getAllSeasonalAdjustmentStatuses(currentPeriod?: string): SeasonalAdjustmentResult[] {
    const results: SeasonalAdjustmentResult[] = [];
    for (const name of this.seasonalAdjustments.keys()) {
      results.push(this.getSeasonalAdjustmentStatus(name, currentPeriod));
    }
    return results;
  }

  /**
   * Get seasonal adjustment names.
   */
  getSeasonalAdjustmentNames(): string[] {
    return Array.from(this.seasonalAdjustments.keys());
  }

  /**
   * Check if project has seasonal adjustments.
   */
  hasSeasonalAdjustments(): boolean {
    return this.seasonalAdjustments.size > 0;
  }

  // ==================== TAX EQUITY SYSTEM ====================

  /**
   * Get tax equity structure status.
   */
  getTaxEquityStructureStatus(name: string): TaxEquityStructureResult {
    const structure = this.taxEquityStructures.get(name);
    if (!structure) {
      throw new Error(`Unknown tax equity structure: ${name}`);
    }

    const targetReturn = structure.targetReturn ? this.evaluate(structure.targetReturn) : null;
    const buyoutPrice = structure.buyoutPrice ? this.evaluate(structure.buyoutPrice) : null;

    // Check if any flip event has been triggered for this structure
    let hasFlipped = false;
    let flipEventName: string | null = null;

    for (const eventName of this.triggeredFlips.keys()) {
      // Check if this flip event is associated with this structure
      const flipEvent = this.flipEvents.get(eventName);
      if (flipEvent) {
        hasFlipped = true;
        flipEventName = eventName;
        break;
      }
    }

    return {
      name,
      structureType: structure.structureType,
      taxInvestor: structure.taxInvestor,
      sponsor: structure.sponsor,
      taxCreditAllocation: structure.taxCreditAllocation,
      depreciationAllocation: structure.depreciationAllocation,
      cashAllocation: structure.cashAllocation,
      flipDate: structure.flipDate?.value ?? null,
      targetReturn,
      buyoutPrice,
      hasFlipped,
      flipEventName,
    };
  }

  /**
   * Get all tax equity structure names.
   */
  getTaxEquityStructureNames(): string[] {
    return Array.from(this.taxEquityStructures.keys());
  }

  /**
   * Check if project has tax equity structures.
   */
  hasTaxEquityStructures(): boolean {
    return this.taxEquityStructures.size > 0;
  }

  /**
   * Get tax credit status.
   */
  getTaxCreditStatus(name: string): TaxCreditResult {
    const credit = this.taxCredits.get(name);
    if (!credit) {
      throw new Error(`Unknown tax credit: ${name}`);
    }

    const baseRate = credit.rate ? this.evaluate(credit.rate) : null;
    const eligibleBasis = credit.eligibleBasis ? this.evaluate(credit.eligibleBasis) : null;

    // Calculate adder bonuses
    const adders: { name: string; bonus: number }[] = [];
    let adderTotal = 0;
    for (const adder of credit.adders) {
      const bonus = this.evaluate(adder.bonus);
      adders.push({ name: adder.name, bonus });
      adderTotal += bonus;
    }

    // Calculate effective rate
    const effectiveRate = baseRate !== null ? baseRate + adderTotal : null;

    // Calculate credit amount
    let creditAmount: number | null = null;
    if (credit.creditAmount) {
      creditAmount = this.evaluate(credit.creditAmount);
    } else if (effectiveRate !== null && eligibleBasis !== null) {
      // ITC calculation: basis * rate
      creditAmount = eligibleBasis * (effectiveRate / 100);
    }

    return {
      name,
      creditType: credit.creditType,
      baseRate,
      effectiveRate,
      eligibleBasis,
      creditAmount,
      adders,
      vestingPeriod: credit.vestingPeriod,
      recaptureRisk: credit.recaptureRisk,
      isVested: true, // Simplified - would need vesting date tracking for real implementation
    };
  }

  /**
   * Get all tax credit names.
   */
  getTaxCreditNames(): string[] {
    return Array.from(this.taxCredits.keys());
  }

  /**
   * Check if project has tax credits.
   */
  hasTaxCredits(): boolean {
    return this.taxCredits.size > 0;
  }

  /**
   * Get depreciation for a specific year.
   * Standard MACRS tables:
   * - 5-year: 20%, 32%, 19.2%, 11.52%, 11.52%, 5.76%
   * - 7-year: 14.29%, 24.49%, 17.49%, 12.49%, 8.93%, 8.92%, 8.93%, 4.46%
   */
  getDepreciationForYear(name: string, year: number): DepreciationResult {
    const schedule = this.depreciationSchedules.get(name);
    if (!schedule) {
      throw new Error(`Unknown depreciation schedule: ${name}`);
    }

    const depreciableBasis = schedule.depreciableBasis ? this.evaluate(schedule.depreciableBasis) : null;
    const bonusPercent = schedule.bonusDepreciation ? this.evaluate(schedule.bonusDepreciation) : 0;

    // Calculate bonus depreciation (applies in year 1)
    const bonusAmount = year === 1 && depreciableBasis !== null ? depreciableBasis * (bonusPercent / 100) : 0;
    const remainingBasis = depreciableBasis !== null ? depreciableBasis - (depreciableBasis * (bonusPercent / 100)) : null;

    // Get regular depreciation percentage
    let regularPercentage: number | null = null;

    if (schedule.schedule && schedule.schedule.length > 0) {
      // Use explicit schedule
      const entry = schedule.schedule.find(e => e.year === year);
      if (entry) {
        regularPercentage = this.evaluate(entry.percentage);
      }
    } else if (schedule.method) {
      // Use standard MACRS tables
      regularPercentage = this.getMACRSPercentage(schedule.method, year);
    }

    const regularAmount = remainingBasis !== null && regularPercentage !== null
      ? remainingBasis * (regularPercentage / 100)
      : null;

    const totalDepreciation = (bonusAmount ?? 0) + (regularAmount ?? 0);

    // Calculate cumulative depreciation
    let cumulativeDepreciation = 0;
    for (let y = 1; y <= year; y++) {
      const yearResult = y === year
        ? { bonusAmount, regularAmount: regularAmount ?? 0 }
        : this.getDepreciationForYearInternal(schedule, y, depreciableBasis, bonusPercent, remainingBasis);
      cumulativeDepreciation += (yearResult.bonusAmount ?? 0) + (yearResult.regularAmount ?? 0);
    }

    const remainingBookValue = depreciableBasis !== null
      ? depreciableBasis - cumulativeDepreciation
      : null;

    return {
      name,
      method: schedule.method,
      depreciableBasis,
      bonusDepreciation: bonusPercent,
      bonusAmount: year === 1 ? bonusAmount : 0,
      remainingBasis,
      year,
      regularPercentage,
      regularAmount,
      totalDepreciation,
      cumulativeDepreciation,
      remainingBookValue,
    };
  }

  /**
   * Internal helper for calculating depreciation for a specific year.
   */
  private getDepreciationForYearInternal(
    schedule: DepreciationStatement,
    year: number,
    depreciableBasis: number | null,
    bonusPercent: number,
    remainingBasis: number | null
  ): { bonusAmount: number; regularAmount: number } {
    const bonusAmount = year === 1 && depreciableBasis !== null
      ? depreciableBasis * (bonusPercent / 100)
      : 0;

    let regularPercentage: number | null = null;

    if (schedule.schedule && schedule.schedule.length > 0) {
      const entry = schedule.schedule.find(e => e.year === year);
      if (entry) {
        regularPercentage = this.evaluate(entry.percentage);
      }
    } else if (schedule.method) {
      regularPercentage = this.getMACRSPercentage(schedule.method, year);
    }

    const regularAmount = remainingBasis !== null && regularPercentage !== null
      ? remainingBasis * (regularPercentage / 100)
      : 0;

    return { bonusAmount, regularAmount };
  }

  /**
   * Get MACRS depreciation percentage for a given method and year.
   */
  private getMACRSPercentage(method: string, year: number): number | null {
    const tables: { [key: string]: number[] } = {
      'macrs_5yr': [20, 32, 19.2, 11.52, 11.52, 5.76],
      'macrs_7yr': [14.29, 24.49, 17.49, 12.49, 8.93, 8.92, 8.93, 4.46],
      'macrs_15yr': [5, 9.5, 8.55, 7.7, 6.93, 6.23, 5.9, 5.9, 5.91, 5.9, 5.91, 5.9, 5.91, 5.9, 5.91, 2.95],
      'macrs_20yr': [3.75, 7.219, 6.677, 6.177, 5.713, 5.285, 4.888, 4.522, 4.462, 4.461, 4.462, 4.461, 4.462, 4.461, 4.462, 4.461, 4.462, 4.461, 4.462, 4.461, 2.231],
      'straight_line': [], // Needs special handling based on recovery period
    };

    const table = tables[method];
    if (!table || year < 1 || year > table.length) {
      return null;
    }

    return table[year - 1] ?? null;
  }

  /**
   * Get all depreciation schedule names.
   */
  getDepreciationScheduleNames(): string[] {
    return Array.from(this.depreciationSchedules.keys());
  }

  /**
   * Check if project has depreciation schedules.
   */
  hasDepreciationSchedules(): boolean {
    return this.depreciationSchedules.size > 0;
  }

  /**
   * Get flip event status.
   */
  getFlipEventStatus(name: string): FlipEventResult {
    const flipEvent = this.flipEvents.get(name);
    if (!flipEvent) {
      throw new Error(`Unknown flip event: ${name}`);
    }

    // Check if this flip has been triggered
    const triggered = this.triggeredFlips.get(name);
    const hasTriggered = !!triggered;

    // Evaluate trigger value
    let triggerValue: number | string | null = null;
    if (flipEvent.triggerValue) {
      if (typeof flipEvent.triggerValue === 'object' && 'type' in flipEvent.triggerValue) {
        if (flipEvent.triggerValue.type === 'Date') {
          triggerValue = flipEvent.triggerValue.value;
        } else {
          triggerValue = this.evaluate(flipEvent.triggerValue as Expression);
        }
      }
    }

    // Determine current allocation based on flip status
    const currentAllocation = hasTriggered
      ? flipEvent.postFlipAllocation
      : flipEvent.preFlipAllocation;

    // Calculate buyout price if applicable
    let buyoutPrice: number | null = null;
    if (hasTriggered && flipEvent.buyoutOption) {
      if (flipEvent.buyoutOption.type === 'fixed') {
        buyoutPrice = this.evaluate(flipEvent.buyoutOption.price);
      } else if (flipEvent.buyoutOption.type === 'formula') {
        buyoutPrice = this.evaluate(flipEvent.buyoutOption.formula);
      }
      // FMV would require external appraisal - not calculable
    }

    return {
      name,
      trigger: flipEvent.trigger,
      triggerValue,
      preFlipAllocation: flipEvent.preFlipAllocation,
      postFlipAllocation: flipEvent.postFlipAllocation,
      hasTriggered,
      triggerDate: triggered?.date.toISOString().split('T')[0] ?? null,
      currentAllocation,
      buyoutPrice,
    };
  }

  /**
   * Trigger a flip event.
   */
  triggerFlip(name: string, date: Date = new Date(), triggerValue?: number | string): void {
    const flipEvent = this.flipEvents.get(name);
    if (!flipEvent) {
      throw new Error(`Unknown flip event: ${name}`);
    }

    if (this.triggeredFlips.has(name)) {
      throw new Error(`Flip event ${name} has already been triggered`);
    }

    // Store the trigger
    this.triggeredFlips.set(name, {
      date,
      triggerValue: triggerValue ?? 'manual'
    });

    // Satisfy any conditions
    for (const condition of flipEvent.satisfies) {
      this.satisfiedConditions.add(condition);
    }
  }

  /**
   * Check if a flip event has been triggered.
   */
  isFlipTriggered(name: string): boolean {
    return this.triggeredFlips.has(name);
  }

  /**
   * Get all flip event names.
   */
  getFlipEventNames(): string[] {
    return Array.from(this.flipEvents.keys());
  }

  /**
   * Check if project has flip events.
   */
  hasFlipEvents(): boolean {
    return this.flipEvents.size > 0;
  }

  /**
   * Get all triggered flip events.
   */
  getTriggeredFlips(): string[] {
    return Array.from(this.triggeredFlips.keys());
  }

  // ==================== RESERVE SYSTEM ====================

  /**
   * Get reserve account status.
   */
  getReserveStatus(name: string): ReserveStatus {
    const reserve = this.reserves.get(name);
    if (!reserve) {
      throw new Error(`Unknown reserve: ${name}`);
    }

    const balance = this.reserveBalances.get(name) ?? 0;
    const target = reserve.target ? this.evaluate(reserve.target) : 0;
    const minimum = reserve.minimum ? this.evaluate(reserve.minimum) : 0;

    const fundedPercent = target > 0 ? (balance / target) * 100 : 100;
    const belowMinimum = balance < minimum;
    const availableForRelease = Math.max(0, balance - minimum);

    return {
      name,
      balance,
      target,
      minimum,
      fundedPercent,
      belowMinimum,
      availableForRelease,
    };
  }

  /**
   * Get all reserve statuses.
   */
  getAllReserveStatuses(): ReserveStatus[] {
    const results: ReserveStatus[] = [];
    for (const name of this.reserves.keys()) {
      results.push(this.getReserveStatus(name));
    }
    return results;
  }

  /**
   * Fund a reserve account.
   */
  fundReserve(name: string, amount: number, _description?: string): void {
    const reserve = this.reserves.get(name);
    if (!reserve) {
      throw new Error(`Unknown reserve: ${name}`);
    }

    const current = this.reserveBalances.get(name) ?? 0;
    this.reserveBalances.set(name, current + amount);
  }

  /**
   * Draw from a reserve account.
   */
  drawFromReserve(name: string, amount: number): number {
    const reserve = this.reserves.get(name);
    if (!reserve) {
      throw new Error(`Unknown reserve: ${name}`);
    }

    const status = this.getReserveStatus(name);
    const maxDraw = status.availableForRelease;
    const actualDraw = Math.min(amount, maxDraw);

    if (actualDraw > 0) {
      const current = this.reserveBalances.get(name) ?? 0;
      this.reserveBalances.set(name, current - actualDraw);
    }

    return actualDraw;
  }

  /**
   * Set reserve balance directly (for initialization).
   */
  setReserveBalance(name: string, balance: number): void {
    if (!this.reserves.has(name)) {
      throw new Error(`Unknown reserve: ${name}`);
    }
    this.reserveBalances.set(name, balance);
  }

  /**
   * Get reserve names.
   */
  getReserveNames(): string[] {
    return Array.from(this.reserves.keys());
  }

  /**
   * Check if project has reserves.
   */
  hasReserves(): boolean {
    return this.reserves.size > 0;
  }

  // ==================== WATERFALL SYSTEM ====================

  /**
   * Execute a waterfall distribution.
   */
  executeWaterfall(name: string, revenue: number): WaterfallResult {
    const waterfall = this.waterfalls.get(name);
    if (!waterfall) {
      throw new Error(`Unknown waterfall: ${name}`);
    }

    let remainder = revenue;
    const tierResults: WaterfallTierResult[] = [];

    // Sort tiers by priority
    const sortedTiers = [...waterfall.tiers].sort((a, b) => a.priority - b.priority);

    for (const tier of sortedTiers) {
      const tierResult = this.executeTier(tier, remainder);
      tierResults.push(tierResult);
      remainder -= tierResult.paid;
    }

    const totalDistributed = revenue - remainder;

    return {
      name,
      totalRevenue: revenue,
      totalDistributed,
      remainder,
      tiers: tierResults,
    };
  }

  /**
   * Execute a single waterfall tier.
   */
  private executeTier(tier: WaterfallTier, available: number): WaterfallTierResult {
    // Check gate condition
    if (tier.condition) {
      const conditionMet = this.evaluateBoolean(tier.condition);
      if (!conditionMet) {
        return {
          priority: tier.priority,
          name: tier.name,
          requested: 0,
          paid: 0,
          shortfall: 0,
          reserveDrawn: 0,
          blocked: true,
          blockReason: 'Condition not met',
        };
      }
    }

    // Calculate requested amount
    let requested = 0;
    if (tier.payAmount) {
      requested = this.evaluate(tier.payAmount);
    } else if (tier.payTo) {
      // Paying into a reserve - calculate how much to reach target/until
      const reserveStatus = this.getReserveStatus(tier.payTo);
      if (tier.until) {
        // Pay until condition is met
        // The UNTIL condition is a comparison like "DebtServiceReserve >= 30_000_000"
        // We need to extract the target from the right side
        if (isComparisonExpression(tier.until)) {
          const targetAmount = this.evaluate(tier.until.right);
          requested = Math.max(0, targetAmount - reserveStatus.balance);
        } else {
          // If it's just a numeric expression, use it directly as the target
          const targetAmount = this.evaluate(tier.until);
          requested = Math.max(0, targetAmount - reserveStatus.balance);
        }
      } else {
        requested = Math.max(0, reserveStatus.target - reserveStatus.balance);
      }
    }

    // Determine how much we can pay from available funds
    let paid = Math.min(requested, available);
    let reserveDrawn = 0;
    let shortfall = requested - paid;

    // Handle shortfall by drawing from reserve if specified
    if (shortfall > 0 && tier.shortfall) {
      reserveDrawn = this.drawFromReserve(tier.shortfall, shortfall);
      paid += reserveDrawn;
      shortfall = requested - paid;
    }

    // If paying into a reserve, actually fund it
    if (tier.payTo && paid > 0) {
      this.fundReserve(tier.payTo, paid);
    }

    return {
      priority: tier.priority,
      name: tier.name,
      requested,
      paid,
      shortfall,
      reserveDrawn,
      blocked: false,
    };
  }

  /**
   * Get waterfall names.
   */
  getWaterfallNames(): string[] {
    return Array.from(this.waterfalls.keys());
  }

  /**
   * Get a waterfall statement.
   */
  getWaterfall(name: string): WaterfallStatement | undefined {
    return this.waterfalls.get(name);
  }

  /**
   * Check if project has waterfalls.
   */
  hasWaterfalls(): boolean {
    return this.waterfalls.size > 0;
  }

  // ==================== CONDITIONS PRECEDENT ====================

  /**
   * Get conditions precedent checklist status.
   */
  getCPChecklist(name: string): CPChecklistResult {
    const checklist = this.conditionsPrecedent.get(name);
    if (!checklist) {
      throw new Error(`Unknown conditions precedent checklist: ${name}`);
    }

    const cpStatuses = this.cpStatuses.get(name) ?? new Map<string, CPStatus>();
    const conditions: CPItemResult[] = [];
    let satisfied = 0;
    let pending = 0;
    let waived = 0;

    for (const cp of checklist.conditions) {
      const status = cpStatuses.get(cp.name) ?? cp.status;
      conditions.push({
        name: cp.name,
        description: cp.description,
        responsible: cp.responsible,
        status,
        satisfies: cp.satisfies,
      });

      if (status === 'satisfied') satisfied++;
      else if (status === 'pending') pending++;
      else if (status === 'waived') waived++;
    }

    const complete = pending === 0;

    return {
      name,
      section: checklist.section,
      totalConditions: checklist.conditions.length,
      satisfied,
      pending,
      waived,
      complete,
      conditions,
    };
  }

  /**
   * Update the status of a condition precedent.
   */
  updateCPStatus(checklistName: string, cpName: string, status: CPStatus): void {
    const checklist = this.conditionsPrecedent.get(checklistName);
    if (!checklist) {
      throw new Error(`Unknown conditions precedent checklist: ${checklistName}`);
    }

    const cp = checklist.conditions.find(c => c.name === cpName);
    if (!cp) {
      throw new Error(`Unknown CP '${cpName}' in checklist '${checklistName}'`);
    }

    let cpMap = this.cpStatuses.get(checklistName);
    if (!cpMap) {
      cpMap = new Map<string, CPStatus>();
      this.cpStatuses.set(checklistName, cpMap);
    }
    cpMap.set(cpName, status);

    // If satisfied, trigger any events the CP satisfies
    if (status === 'satisfied') {
      for (const event of cp.satisfies) {
        this.satisfiedConditions.add(event);
      }
    }
  }

  /**
   * Get all CP checklist names.
   */
  getCPChecklistNames(): string[] {
    return Array.from(this.conditionsPrecedent.keys());
  }

  /**
   * Check if project has conditions precedent.
   */
  hasConditionsPrecedent(): boolean {
    return this.conditionsPrecedent.size > 0;
  }

  /**
   * Check if a specific draw's conditions are met.
   */
  isDrawAllowed(checklistName: string): boolean {
    const result = this.getCPChecklist(checklistName);
    return result.complete;
  }

  // ==================== UTILITIES ====================

  getDefinedTerms(): string[] {
    return Array.from(this.definitions.keys());
  }

  getCovenantNames(): string[] {
    return Array.from(this.covenants.keys());
  }

  getBasketNames(): string[] {
    return Array.from(this.baskets.keys());
  }

  getConditionNames(): string[] {
    return Array.from(this.conditions.keys());
  }

  getProhibitionTargets(): string[] {
    return Array.from(this.prohibitions.keys());
  }

  setEventDefault(name: string): void {
    this.eventDefaults.add(name);
  }

  clearEventDefault(name: string): void {
    this.eventDefaults.delete(name);
  }

  hasEventDefault(name: string): boolean {
    return this.eventDefaults.has(name);
  }

  getBasketLedger(): BasketLedgerEntry[] {
    return [...this.basketLedger];
  }

  // ==================== CURE RIGHTS ====================

  /**
   * Check a covenant with cure rights information
   */
  checkCovenantWithCure(name: string): CovenantResultWithCure {
    const result = this.checkCovenant(name) as CovenantResultWithCure;
    const covenant = this.covenants.get(name);

    if (!result.compliant && covenant?.cure) {
      result.cureAvailable = this.canApplyCure(name);
      result.shortfall = this.calculateShortfall(result);
      result.cureState = this.cureStates.get(name);
      result.cureMechanism = covenant.cure;
    }

    return result;
  }

  /**
   * Check all covenants with cure information
   */
  checkAllCovenantsWithCure(): CovenantResultWithCure[] {
    const results: CovenantResultWithCure[] = [];
    for (const name of this.covenants.keys()) {
      results.push(this.checkCovenantWithCure(name));
    }
    return results;
  }

  /**
   * Check if cure mechanism is available for a covenant
   */
  canApplyCure(covenantName: string): boolean {
    const covenant = this.covenants.get(covenantName);
    if (!covenant?.cure) return false;

    const maxUses = covenant.cure.details?.maxUses;
    if (maxUses === undefined) return true;

    const used = this.cureUsage.get(covenant.cure.type) ?? 0;
    return used < maxUses;
  }

  /**
   * Apply a cure to a breached covenant
   */
  applyCure(covenantName: string, amount: number): CureResult {
    const covenant = this.covenants.get(covenantName);
    if (!covenant) {
      return { success: false, reason: `Unknown covenant: ${covenantName}` };
    }

    if (!covenant.cure) {
      return { success: false, reason: `Covenant ${covenantName} has no cure mechanism` };
    }

    // Check if cure is available
    if (!this.canApplyCure(covenantName)) {
      return { success: false, reason: 'No cure uses remaining' };
    }

    // Check amount is within limits
    if (covenant.cure.details?.maxAmount) {
      const maxAmount = this.evaluate(covenant.cure.details.maxAmount);
      if (amount > maxAmount) {
        return { success: false, reason: `Amount exceeds maximum cure of $${maxAmount.toLocaleString()}` };
      }
    }

    // Check the covenant status
    const covenantResult = this.checkCovenant(covenantName);
    if (covenantResult.compliant) {
      return { success: false, reason: 'Covenant is already compliant, no cure needed' };
    }

    // Calculate shortfall
    const shortfall = this.calculateShortfall(covenantResult);
    if (amount < shortfall) {
      return { success: false, reason: `Cure amount ($${amount.toLocaleString()}) is less than shortfall ($${shortfall.toLocaleString()})` };
    }

    // Track usage
    const used = this.cureUsage.get(covenant.cure.type) ?? 0;
    this.cureUsage.set(covenant.cure.type, used + 1);

    // Update or create cure state
    let state = this.cureStates.get(covenantName);
    if (!state) {
      state = {
        covenantName,
        breachDate: new Date(),
        cureDeadline: this.calculateCureDeadline(covenant),
        status: 'breach',
        cureAttempts: [],
      };
      this.cureStates.set(covenantName, state);
    }

    state.status = 'cured';
    state.cureAttempts.push({
      date: new Date(),
      mechanism: covenant.cure.type,
      amount,
      successful: true,
    });

    return { success: true, curedAmount: amount };
  }

  /**
   * Calculate the cure deadline based on covenant cure period
   */
  private calculateCureDeadline(covenant: CovenantStatement): Date {
    const deadline = new Date();
    const curePeriod = covenant.cure?.details?.curePeriod;

    if (curePeriod) {
      switch (curePeriod.unit) {
        case 'days':
          deadline.setDate(deadline.getDate() + curePeriod.amount);
          break;
        case 'months':
          deadline.setMonth(deadline.getMonth() + curePeriod.amount);
          break;
        case 'years':
          deadline.setFullYear(deadline.getFullYear() + curePeriod.amount);
          break;
      }
    } else {
      // Default 30-day cure period
      deadline.setDate(deadline.getDate() + 30);
    }

    return deadline;
  }

  /**
   * Calculate the shortfall amount needed to cure a covenant
   */
  calculateShortfall(result: CovenantResult): number {
    if (result.compliant) return 0;

    // For leverage covenant (actual <= threshold), shortfall is actual - threshold
    // This represents how much EBITDA increase (or debt decrease) is needed
    if (result.operator === '<=') {
      return result.actual - result.threshold;
    }
    // For coverage covenant (actual >= threshold), shortfall is threshold - actual
    if (result.operator === '>=') {
      return result.threshold - result.actual;
    }

    return Math.abs(result.actual - result.threshold);
  }

  /**
   * Get cure usage summary across all mechanisms
   */
  getCureUsage(): CureUsage[] {
    const usageMap = new Map<string, CureUsage>();

    for (const [, covenant] of this.covenants) {
      if (covenant.cure) {
        const mechanismType = covenant.cure.type;
        const maxUses = covenant.cure.details?.maxUses ?? Infinity;

        if (!usageMap.has(mechanismType)) {
          const totalUses = this.cureUsage.get(mechanismType) ?? 0;
          usageMap.set(mechanismType, {
            mechanism: mechanismType,
            usesRemaining: maxUses === Infinity ? Infinity : maxUses - totalUses,
            totalUses,
            maxUses,
            period: covenant.cure.details?.overPeriod ?? 'unlimited',
          });
        }
      }
    }

    return Array.from(usageMap.values());
  }

  /**
   * Get cure state for a specific covenant
   */
  getCureState(covenantName: string): CureState | undefined {
    return this.cureStates.get(covenantName);
  }

  /**
   * Record a covenant breach (starts cure period)
   */
  recordBreach(covenantName: string): void {
    const covenant = this.covenants.get(covenantName);
    if (!covenant) {
      throw new Error(`Unknown covenant: ${covenantName}`);
    }

    if (!this.cureStates.has(covenantName)) {
      this.cureStates.set(covenantName, {
        covenantName,
        breachDate: new Date(),
        cureDeadline: this.calculateCureDeadline(covenant),
        status: 'breach',
        cureAttempts: [],
      });
    }
  }

  /**
   * Get covenants that have cure mechanisms
   */
  getCovenantsWithCure(): string[] {
    const names: string[] = [];
    for (const [name, covenant] of this.covenants) {
      if (covenant.cure) {
        names.push(name);
      }
    }
    return names;
  }

  // ==================== AMENDMENTS ====================

  /**
   * Apply an amendment to the current agreement state
   */
  applyAmendment(amendment: AmendmentStatement): void {
    for (const directive of amendment.directives) {
      this.applyDirective(directive);
    }
    this.appliedAmendments.push(amendment);
  }

  private applyDirective(directive: AmendmentDirective): void {
    switch (directive.directive) {
      case 'replace':
        this.replaceStatement(directive.targetType, directive.targetName, directive.replacement);
        break;
      case 'add':
        this.loadStatement(directive.statement);
        break;
      case 'delete':
        this.deleteStatement(directive.targetType, directive.targetName);
        break;
      case 'modify':
        this.modifyStatement(directive.targetType, directive.targetName, directive.modifications);
        break;
    }
  }

  private replaceStatement(type: string, name: string, stmt: Statement): void {
    // First delete the old statement
    this.deleteStatement(type, name);
    // Then add the new one
    this.loadStatement(stmt);
  }

  private deleteStatement(type: string, name: string): void {
    switch (type) {
      case 'Define':
        if (!this.definitions.has(name)) {
          throw new Error(`Cannot delete: DEFINE ${name} not found`);
        }
        this.definitions.delete(name);
        break;
      case 'Covenant':
        if (!this.covenants.has(name)) {
          throw new Error(`Cannot delete: COVENANT ${name} not found`);
        }
        this.covenants.delete(name);
        break;
      case 'Basket':
        if (!this.baskets.has(name)) {
          throw new Error(`Cannot delete: BASKET ${name} not found`);
        }
        this.baskets.delete(name);
        this.basketUtilization.delete(name);
        this.basketAccumulation.delete(name);
        break;
      case 'Condition':
        if (!this.conditions.has(name)) {
          throw new Error(`Cannot delete: CONDITION ${name} not found`);
        }
        this.conditions.delete(name);
        break;
      case 'Prohibit':
        if (!this.prohibitions.has(name)) {
          throw new Error(`Cannot delete: PROHIBIT ${name} not found`);
        }
        this.prohibitions.delete(name);
        break;
      case 'Event':
        if (!this.events.has(name)) {
          throw new Error(`Cannot delete: EVENT ${name} not found`);
        }
        this.events.delete(name);
        break;
      case 'Phase':
        if (!this.phases.has(name)) {
          throw new Error(`Cannot delete: PHASE ${name} not found`);
        }
        this.phases.delete(name);
        // If deleting current phase, clear it
        if (this.currentPhase === name) {
          this.currentPhase = null;
        }
        break;
      case 'Transition':
        if (!this.transitions.has(name)) {
          throw new Error(`Cannot delete: TRANSITION ${name} not found`);
        }
        this.transitions.delete(name);
        break;
    }
  }

  private modifyStatement(type: string, name: string, modifications: ModificationClause[]): void {
    switch (type) {
      case 'Basket': {
        const basket = this.baskets.get(name);
        if (!basket) {
          throw new Error(`Cannot modify: BASKET ${name} not found`);
        }
        for (const mod of modifications) {
          switch (mod.type) {
            case 'capacity':
              basket.capacity = mod.value;
              break;
            case 'floor':
              basket.floor = mod.value;
              break;
            case 'maximum':
              basket.maximum = mod.value;
              break;
          }
        }
        break;
      }
      case 'Covenant': {
        const covenant = this.covenants.get(name);
        if (!covenant) {
          throw new Error(`Cannot modify: COVENANT ${name} not found`);
        }
        for (const mod of modifications) {
          switch (mod.type) {
            case 'requires':
              covenant.requires = mod.value;
              break;
            case 'tested':
              covenant.tested = mod.value as 'quarterly' | 'annually' | 'monthly';
              break;
          }
        }
        break;
      }
      default:
        throw new Error(`Modification not supported for ${type}`);
    }
  }

  /**
   * Get list of applied amendments
   */
  getAppliedAmendments(): AmendmentStatement[] {
    return [...this.appliedAmendments];
  }

  /**
   * Get event names
   */
  getEventNames(): string[] {
    return Array.from(this.events.keys());
  }
}
