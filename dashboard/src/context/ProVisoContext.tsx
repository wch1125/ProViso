/**
 * ProViso Context Provider
 *
 * Connects the React dashboard to the ProViso interpreter.
 * Provides computed covenant results, basket status, milestones, etc.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';

// Import from compiled proviso package - selective imports to avoid Node.js-only modules
import { parse } from '@proviso/parser.js';
import { ProVisoInterpreter } from '@proviso/interpreter.js';
import type {
  Program,
  CovenantResult,
  BasketStatus,
  MilestoneResult,
  ReserveStatus,
  WaterfallResult,
  WaterfallTierResult,
  CPChecklistResult,
  CPItemResult,
  TechnicalMilestoneResult,
  RegulatoryRequirementResult,
  PerformanceGuaranteeResult,
  DegradationResult,
  SeasonalAdjustmentResult,
  TaxEquityStructureResult,
  TaxCreditResult,
  DepreciationResult,
  FlipEventResult,
  SimpleFinancialData,
  MultiPeriodFinancialData,
  FinancialData,
} from '@proviso/types.js';

// Dashboard display types
import type {
  DashboardData,
  CovenantData,
  MilestoneData,
  ReserveData,
  WaterfallData,
  CPChecklistData,
  IndustryData,
  TechnicalMilestoneData,
  RegulatoryRequirementData,
  PerformanceGuaranteeData,
  DegradationData,
  SeasonalAdjustmentData,
  TaxEquityStructureData,
  TaxCreditData,
  DepreciationData,
  FlipEventData,
} from '../types';

// =============================================================================
// TRANSFORMERS - Map interpreter output to dashboard display types
// =============================================================================

function transformCovenant(result: CovenantResult, suspended: boolean = false): CovenantData {
  const data: CovenantData = {
    name: result.name,
    actual: result.actual,
    required: result.threshold,
    operator: result.operator as CovenantData['operator'],
    compliant: result.compliant,
    headroom: result.headroom,
    suspended,
  };

  // Pass step-down metadata if present
  if (result.originalThreshold !== undefined) {
    data.originalThreshold = result.originalThreshold;
  }
  if (result.activeStep) {
    data.activeStep = result.activeStep;
  }
  if (result.nextStep) {
    data.nextStep = result.nextStep;
  }

  return data;
}

function transformMilestone(result: MilestoneResult): MilestoneData {
  return {
    name: result.name,
    target: result.targetDate ?? '',
    longstop: result.longstopDate ?? '',
    status: result.status as MilestoneData['status'],
    achievedDate: result.achievedDate,
    percentComplete: undefined, // Standard milestones don't have progress
  };
}

function transformReserve(result: ReserveStatus): ReserveData {
  return {
    name: result.name,
    balance: result.balance,
    target: result.target,
    minimum: result.minimum,
  };
}

function transformWaterfall(result: WaterfallResult): WaterfallData {
  return {
    revenue: result.totalRevenue,
    tiers: result.tiers.map((tier: WaterfallTierResult) => ({
      name: tier.name,
      amount: tier.paid,
      blocked: tier.blocked,
      reason: tier.blockReason,
    })),
  };
}

function transformCPChecklist(result: CPChecklistResult): CPChecklistData {
  return {
    name: result.name,
    section: result.section ?? '',
    conditions: result.conditions.map((item: CPItemResult) => ({
      name: item.name,
      description: item.description ?? '',
      responsible: item.responsible ?? '',
      status: item.status as CPChecklistData['conditions'][0]['status'],
    })),
  };
}

function transformTechnicalMilestone(result: TechnicalMilestoneResult): TechnicalMilestoneData {
  return {
    name: result.name,
    target: result.targetDate ?? '',
    longstop: result.longstopDate ?? '',
    measurement: result.measurement ?? '',
    targetValue: result.targetValue ?? 0,
    currentValue: result.currentValue ?? 0,
    status: result.status as TechnicalMilestoneData['status'],
    percentComplete: result.completionPercent ?? 0,
  };
}

function transformRegulatoryRequirement(result: RegulatoryRequirementResult): RegulatoryRequirementData {
  return {
    name: result.name,
    agency: result.agency ?? '',
    type: result.requirementType ?? '',
    requiredFor: result.requiredFor ?? '',
    status: result.status as RegulatoryRequirementData['status'],
    approvalDate: result.approvalDate ?? undefined,
    dueDate: undefined,
  };
}

function transformPerformanceGuarantee(result: PerformanceGuaranteeResult): PerformanceGuaranteeData {
  return {
    name: result.name,
    metric: result.metric ?? '',
    p50: result.p50 ?? 0,
    p75: result.p75 ?? undefined,
    p90: result.p90 ?? undefined,
    p99: result.p99 ?? 0,
    actual: result.actual ?? 0,
    performanceLevel: (result.performanceLevel ?? 'below_p99') as PerformanceGuaranteeData['performanceLevel'],
    meetsGuarantee: result.meetsGuarantee,
    shortfall: result.shortfall,
    unit: undefined, // Not in interpreter result
  };
}

function transformDegradation(result: DegradationResult): DegradationData {
  return {
    name: result.name,
    assetType: result.assetType ?? '',
    initialCapacity: result.initialCapacity,
    currentYear: result.year,
    cumulativeDegradation: result.cumulativeDegradation,
    effectiveCapacity: result.effectiveCapacity,
    minimumCapacity: result.atMinimum ? result.effectiveCapacity : 0, // Use atMinimum flag
  };
}

function transformSeasonalAdjustment(result: SeasonalAdjustmentResult): SeasonalAdjustmentData {
  return {
    name: result.name,
    metric: result.metric ?? '',
    currentSeason: result.seasons.join(', '), // Combine all seasons
    adjustmentFactor: result.adjustmentFactor,
    active: result.active,
    reason: result.reason ?? undefined,
  };
}

function transformTaxEquityStructure(result: TaxEquityStructureResult): TaxEquityStructureData {
  return {
    name: result.name,
    structureType: (result.structureType ?? 'partnership_flip') as TaxEquityStructureData['structureType'],
    taxInvestor: result.taxInvestor ?? '',
    sponsor: result.sponsor ?? '',
    taxCreditAllocation: result.taxCreditAllocation ?? { investor: 0, sponsor: 0 },
    cashAllocation: result.cashAllocation ?? { investor: 0, sponsor: 0 },
    targetReturn: result.targetReturn ?? 0,
    currentIRR: undefined, // Not available in interpreter result
    hasFlipped: result.hasFlipped,
    flipDate: result.flipDate ?? undefined,
    buyoutPrice: result.buyoutPrice ?? undefined,
  };
}

function transformTaxCredit(result: TaxCreditResult): TaxCreditData {
  return {
    name: result.name,
    creditType: (result.creditType ?? 'itc') as TaxCreditData['creditType'],
    baseRate: result.baseRate ?? 0,
    effectiveRate: result.effectiveRate ?? 0,
    eligibleBasis: result.eligibleBasis ?? undefined,
    creditAmount: result.creditAmount ?? 0,
    adders: result.adders,
    vestingPeriod: undefined, // Interpreter has vestingPeriod as string, dashboard wants number
    percentVested: result.isVested ? 100 : undefined, // Convert boolean to percentage
  };
}

function transformDepreciation(result: DepreciationResult): DepreciationData {
  return {
    name: result.name,
    method: result.method ?? '',
    depreciableBasis: result.depreciableBasis ?? 0,
    bonusDepreciation: result.bonusDepreciation ?? 0,
    currentYear: result.year,
    yearlyDepreciation: result.totalDepreciation ?? 0, // Use totalDepreciation for yearly
    cumulativeDepreciation: result.cumulativeDepreciation ?? 0,
    remainingBasis: result.remainingBasis ?? 0,
  };
}

function transformFlipEvent(result: FlipEventResult): FlipEventData {
  // triggerValue can be number or string - extract numeric if possible
  const triggerValueNum = typeof result.triggerValue === 'number'
    ? result.triggerValue
    : undefined;

  return {
    name: result.name,
    trigger: (result.trigger ?? 'target_return') as FlipEventData['trigger'],
    targetValue: triggerValueNum,
    currentValue: undefined, // Not available in interpreter result
    projectedFlipDate: undefined, // Not available in interpreter result
    hasTriggered: result.hasTriggered,
    triggerDate: result.triggerDate ?? undefined,
    preFlipAllocation: result.preFlipAllocation ?? { investor: 0, sponsor: 0 },
    postFlipAllocation: result.postFlipAllocation ?? { investor: 0, sponsor: 0 },
  };
}

// =============================================================================
// CONTEXT TYPES
// =============================================================================

/** Per-covenant compliance trend: period → { actual, threshold, compliant } */
export interface ComplianceHistoryEntry {
  period: string;
  actual: number;
  threshold: number;
  compliant: boolean;
}

/** Compliance history keyed by covenant name */
export type ComplianceHistoryMap = Record<string, ComplianceHistoryEntry[]>;

interface ProVisoState {
  // Loading state
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;

  // Raw interpreter (for advanced use)
  interpreter: ProVisoInterpreter | null;

  // Source code (for export round-trip, v2.5)
  code: string;

  // Financial data
  financials: SimpleFinancialData;

  // Computed results
  covenants: CovenantData[];
  baskets: BasketStatus[];
  milestones: MilestoneData[];
  reserves: ReserveData[];
  waterfall: WaterfallData | null;
  conditionsPrecedent: CPChecklistData[];

  // Industry data (v2.1)
  industry: IndustryData | null;

  // Compliance history (v2.5)
  isMultiPeriod: boolean;
  complianceHistory: ComplianceHistoryMap;

  // Project metadata
  projectName: string;
  currentPhase: string | null;

  // Actions
  loadFromCode: (code: string, initialFinancials?: SimpleFinancialData, historicalData?: MultiPeriodFinancialData) => Promise<boolean>;
  loadFinancials: (data: SimpleFinancialData) => void;
  updateFinancial: (key: string, value: number) => void;
  refresh: () => void;
  executeWaterfall: (name: string, revenue: number) => WaterfallData | null;

  // Calculation drilldown (v2.2)
  getCalculationTree: (definitionName: string) => CalculationTree | null;
  getDefinitionNames: () => string[];

  // Raw CP data for closing pipeline (v2.5)
  getConditionsPrecedentRaw: () => CPChecklistResult[];

  // Computed dashboard data (convenience)
  dashboardData: DashboardData | null;
}

// Imported from interpreter but re-exported for dashboard use
export interface CalculationTree {
  name: string;
  value: number;
  formula?: string;
  children?: CalculationTree[];
  source: 'definition' | 'financial_data' | 'literal' | 'computed';
  rawDataKey?: string;
  valueType?: 'currency' | 'ratio' | 'percentage' | 'number';
}

const defaultState: ProVisoState = {
  isLoaded: false,
  isLoading: false,
  error: null,
  interpreter: null,
  code: '',
  financials: {},
  covenants: [],
  baskets: [],
  milestones: [],
  reserves: [],
  waterfall: null,
  conditionsPrecedent: [],
  industry: null,
  isMultiPeriod: false,
  complianceHistory: {},
  projectName: '',
  currentPhase: null,
  loadFromCode: async (_code: string, _financials?: SimpleFinancialData, _historicalData?: MultiPeriodFinancialData) => false,
  loadFinancials: () => {},
  updateFinancial: () => {},
  refresh: () => {},
  executeWaterfall: () => null,
  getCalculationTree: () => null,
  getDefinitionNames: () => [],
  getConditionsPrecedentRaw: () => [],
  dashboardData: null,
};

const ProVisoContext = createContext<ProVisoState>(defaultState);

// =============================================================================
// PROVIDER
// =============================================================================

interface ProVisoProviderProps {
  children: ReactNode;
  /** Optional initial code to load */
  initialCode?: string;
  /** Optional initial financial data */
  initialFinancials?: SimpleFinancialData;
}

export function ProVisoProvider({
  children,
  initialCode,
  initialFinancials,
}: ProVisoProviderProps) {
  const [interpreter, setInterpreter] = useState<ProVisoInterpreter | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [financials, setFinancials] = useState<SimpleFinancialData>(initialFinancials ?? {});

  // Computed state from interpreter
  const [covenants, setCovenants] = useState<CovenantData[]>([]);
  const [basketStatuses, setBasketStatuses] = useState<BasketStatus[]>([]);
  const [milestones, setMilestones] = useState<MilestoneData[]>([]);
  const [reserves, setReserves] = useState<ReserveData[]>([]);
  const [waterfall, setWaterfall] = useState<WaterfallData | null>(null);
  const [conditionsPrecedent, setConditionsPrecedent] = useState<CPChecklistData[]>([]);
  const [industry, setIndustry] = useState<IndustryData | null>(null);
  const [isMultiPeriod, setIsMultiPeriod] = useState(false);
  const [complianceHistory, setComplianceHistory] = useState<ComplianceHistoryMap>({});
  const [projectName, setProjectName] = useState('');
  const [currentPhase, setCurrentPhase] = useState<string | null>(null);

  // Refresh all computed state from interpreter
  const refresh = useCallback(() => {
    if (!interpreter) return;

    try {
      // Get suspended covenants list
      const suspendedNames = new Set(interpreter.getSuspendedCovenants());

      // Transform covenants (isolated try/catch so a single bad covenant doesn't kill the dashboard)
      try {
        const covenantResults = interpreter.checkAllCovenants();
        setCovenants(covenantResults.map(c => transformCovenant(c, suspendedNames.has(c.name))));
      } catch (covErr) {
        console.warn('Error checking covenants:', covErr);
        setCovenants([]);
      }

      // Transform baskets
      setBasketStatuses(interpreter.getAllBasketStatuses());

      // Transform milestones
      const milestoneResults = interpreter.getAllMilestoneStatuses();
      setMilestones(milestoneResults.map(transformMilestone));

      // Transform reserves
      const reserveResults = interpreter.getAllReserveStatuses();
      setReserves(reserveResults.map(transformReserve));

      // Transform CPs
      const cpNames = interpreter.getCPChecklistNames();
      const cpResults = cpNames.map(name => interpreter.getCPChecklist(name));
      setConditionsPrecedent(cpResults.map(transformCPChecklist));

      // Get current phase
      setCurrentPhase(interpreter.getCurrentPhase());

      // Build industry data if available
      const techMilestoneNames = interpreter.getTechnicalMilestoneNames();
      const regReqNames = interpreter.getRegulatoryRequirementNames();
      const perfGuaranteeNames = interpreter.getPerformanceGuaranteeNames();
      const degradationNames = interpreter.getDegradationScheduleNames();
      const seasonalNames = interpreter.getSeasonalAdjustmentNames();
      const taxEquityNames = interpreter.getTaxEquityStructureNames();
      const taxCreditNames = interpreter.getTaxCreditNames();
      const depreciationNames = interpreter.getDepreciationScheduleNames();
      const flipEventNames = interpreter.getFlipEventNames();

      const hasIndustryData =
        techMilestoneNames.length > 0 ||
        regReqNames.length > 0 ||
        perfGuaranteeNames.length > 0 ||
        taxEquityNames.length > 0;

      if (hasIndustryData) {
        const industryData: IndustryData = {};

        if (techMilestoneNames.length > 0) {
          industryData.technicalMilestones = techMilestoneNames
            .map(name => interpreter.getTechnicalMilestoneStatus(name))
            .map(transformTechnicalMilestone);
        }

        if (regReqNames.length > 0) {
          industryData.regulatoryRequirements = regReqNames
            .map(name => interpreter.getRegulatoryRequirementStatus(name))
            .map(transformRegulatoryRequirement);
        }

        if (perfGuaranteeNames.length > 0) {
          industryData.performanceGuarantees = perfGuaranteeNames
            .map(name => interpreter.getPerformanceGuaranteeStatus(name))
            .map(transformPerformanceGuarantee);
        }

        if (degradationNames.length > 0) {
          industryData.degradation = degradationNames
            .map(name => interpreter.getDegradedCapacity(name, 1))
            .map(transformDegradation);
        }

        if (seasonalNames.length > 0) {
          industryData.seasonalAdjustments = seasonalNames
            .map(name => interpreter.getSeasonalAdjustmentStatus(name))
            .map(transformSeasonalAdjustment);
        }

        // Tax equity section
        if (taxEquityNames.length > 0 || taxCreditNames.length > 0 || depreciationNames.length > 0 || flipEventNames.length > 0) {
          industryData.taxEquity = {};

          if (taxEquityNames.length > 0) {
            const structureResult = interpreter.getTaxEquityStructureStatus(taxEquityNames[0]!);
            industryData.taxEquity.structure = transformTaxEquityStructure(structureResult);
          }

          if (taxCreditNames.length > 0) {
            industryData.taxEquity.credits = taxCreditNames
              .map(name => interpreter.getTaxCreditStatus(name))
              .map(transformTaxCredit);
          }

          if (depreciationNames.length > 0) {
            industryData.taxEquity.depreciation = depreciationNames
              .map(name => interpreter.getDepreciationForYear(name, 1))
              .map(transformDepreciation);
          }

          if (flipEventNames.length > 0) {
            industryData.taxEquity.flipEvents = flipEventNames
              .map(name => interpreter.getFlipEventStatus(name))
              .map(transformFlipEvent);
          }
        }

        setIndustry(industryData);
      } else {
        setIndustry(null);
      }

      // Auto-execute primary waterfall if available
      const waterfallNames = interpreter.getWaterfallNames();
      if (waterfallNames.length > 0) {
        try {
          // Use revenue from financials, or a reasonable default
          const revenue = interpreter.evaluate('Revenue') ?? interpreter.evaluate('revenue') ?? 0;
          const result = interpreter.executeWaterfall(waterfallNames[0]!, revenue);
          setWaterfall(transformWaterfall(result));
        } catch {
          // Revenue identifier may not exist — that's OK, waterfall stays null
        }
      }

      // Build compliance history (v2.5)
      const multiPeriod = interpreter.hasMultiPeriodData();
      setIsMultiPeriod(multiPeriod);

      if (multiPeriod) {
        const history = interpreter.getComplianceHistory();
        const historyMap: ComplianceHistoryMap = {};

        for (const periodEntry of history) {
          for (const cov of periodEntry.covenants) {
            if (!historyMap[cov.name]) {
              historyMap[cov.name] = [];
            }
            historyMap[cov.name].push({
              period: periodEntry.period,
              actual: cov.actual,
              threshold: cov.threshold,
              compliant: cov.compliant,
            });
          }
        }

        setComplianceHistory(historyMap);
      } else {
        setComplianceHistory({});
      }
    } catch (e) {
      console.error('Error refreshing ProViso state:', e);
    }
  }, [interpreter]);

  // Load ProViso code (with optional initial financials and multi-period history)
  const loadFromCode = useCallback(async (code: string, initialFinancials?: SimpleFinancialData, historicalData?: MultiPeriodFinancialData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await parse(code);

      if (!result.success || !result.ast) {
        const errorMsg = result.error?.message ?? 'Parse failed';
        setError(errorMsg);
        setIsLoading(false);
        return false;
      }

      const newInterpreter = new ProVisoInterpreter(result.ast as Program);

      // Load financials - prefer multi-period data, then single-period, then existing state
      if (historicalData) {
        // Multi-period mode: load the full period array for compliance history
        newInterpreter.loadFinancials(historicalData as FinancialData);
        if (initialFinancials) {
          setFinancials(initialFinancials);
        }
      } else {
        const financialsToLoad = initialFinancials ?? (Object.keys(financials).length > 0 ? financials : null);
        if (financialsToLoad) {
          newInterpreter.loadFinancials(financialsToLoad);
          // Also update state if initialFinancials provided
          if (initialFinancials) {
            setFinancials(initialFinancials);
          }
        }
      }

      setInterpreter(newInterpreter);
      setCode(code);
      setIsLoaded(true);
      setIsLoading(false);

      // Extract project name from comments (first line starting with //)
      const firstLine = code.split('\n').find(l => l.trim().startsWith('//'));
      if (firstLine) {
        setProjectName(firstLine.replace('//', '').trim());
      }

      return true;
    } catch (e) {
      setError((e as Error).message);
      setIsLoading(false);
      return false;
    }
  }, [financials]);

  // Load financial data
  const loadFinancials = useCallback((data: SimpleFinancialData) => {
    setFinancials(data);
    if (interpreter) {
      interpreter.loadFinancials(data);
      refresh();
    }
  }, [interpreter, refresh]);

  // Update a single financial value
  const updateFinancial = useCallback((key: string, value: number) => {
    const newFinancials = { ...financials, [key]: value };
    setFinancials(newFinancials);
    if (interpreter) {
      interpreter.loadFinancials(newFinancials);
      refresh();
    }
  }, [financials, interpreter, refresh]);

  // Execute waterfall with specific revenue
  const executeWaterfallFn = useCallback((name: string, revenue: number): WaterfallData | null => {
    if (!interpreter) return null;

    try {
      const result = interpreter.executeWaterfall(name, revenue);
      const transformed = transformWaterfall(result);
      setWaterfall(transformed);
      return transformed;
    } catch (e) {
      console.error('Error executing waterfall:', e);
      return null;
    }
  }, [interpreter]);

  // Get calculation tree for a definition (v2.2)
  const getCalculationTree = useCallback((definitionName: string): CalculationTree | null => {
    if (!interpreter) return null;

    try {
      return interpreter.getCalculationTree(definitionName) as CalculationTree | null;
    } catch (e) {
      console.error('Error getting calculation tree:', e);
      return null;
    }
  }, [interpreter]);

  // Get all definition names (v2.2)
  const getDefinitionNames = useCallback((): string[] => {
    if (!interpreter) return [];
    return interpreter.getDefinitionNames();
  }, [interpreter]);

  // Get raw CP checklist results for closing pipeline (v2.5)
  const getConditionsPrecedentRaw = useCallback((): CPChecklistResult[] => {
    if (!interpreter) return [];
    try {
      const cpNames = interpreter.getCPChecklistNames();
      return cpNames.map(name => interpreter.getCPChecklist(name));
    } catch (e) {
      console.error('Error getting CP checklists:', e);
      return [];
    }
  }, [interpreter]);

  // Refresh when interpreter changes
  useEffect(() => {
    if (interpreter) {
      refresh();
    }
  }, [interpreter, refresh]);

  // Build full dashboard data object for convenience
  const dashboardData = useMemo((): DashboardData | null => {
    if (!isLoaded) return null;

    return {
      project: {
        name: projectName || 'Untitled Project',
        facility: '',
        sponsor: '',
        borrower: '',
      },
      phase: {
        current: currentPhase ?? 'Unknown',
        constructionStart: '',
        codTarget: '',
        maturity: '',
      },
      financials,
      covenants,
      baskets: basketStatuses.map(b => ({
        name: b.name,
        capacity: b.capacity,
        used: b.used,
        available: b.capacity - b.used,
        utilization: b.capacity > 0 ? (b.used / b.capacity) * 100 : 0,
      })),
      milestones,
      reserves,
      waterfall: waterfall ?? { revenue: 0, tiers: [] },
      conditionsPrecedent,
      industry: industry ?? undefined,
    };
  }, [isLoaded, projectName, currentPhase, financials, covenants, basketStatuses, milestones, reserves, waterfall, conditionsPrecedent, industry]);

  // Load initial code if provided
  useEffect(() => {
    if (initialCode && !isLoaded && !isLoading) {
      loadFromCode(initialCode);
    }
  }, [initialCode, isLoaded, isLoading, loadFromCode]);

  const value: ProVisoState = {
    isLoaded,
    isLoading,
    error,
    interpreter,
    code,
    financials,
    covenants,
    baskets: basketStatuses,
    milestones,
    reserves,
    waterfall,
    conditionsPrecedent,
    industry,
    isMultiPeriod,
    complianceHistory,
    projectName,
    currentPhase,
    loadFromCode,
    loadFinancials,
    updateFinancial,
    refresh,
    executeWaterfall: executeWaterfallFn,
    getCalculationTree,
    getDefinitionNames,
    getConditionsPrecedentRaw,
    dashboardData,
  };

  return (
    <ProVisoContext.Provider value={value}>
      {children}
    </ProVisoContext.Provider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Main hook for accessing ProViso state
 */
export function useProViso(): ProVisoState {
  const context = useContext(ProVisoContext);
  if (!context) {
    throw new Error('useProViso must be used within a ProVisoProvider');
  }
  return context;
}

/**
 * Hook for just the covenant data
 */
export function useCovenants(): CovenantData[] {
  const { covenants } = useProViso();
  return covenants;
}

/**
 * Hook for checking if data is loaded
 */
export function useProVisoStatus(): { isLoaded: boolean; isLoading: boolean; error: string | null } {
  const { isLoaded, isLoading, error } = useProViso();
  return { isLoaded, isLoading, error };
}
