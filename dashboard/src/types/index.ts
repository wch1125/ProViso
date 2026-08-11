// Dashboard types mirroring ProViso interpreter types

/**
 * Covenant status for risk-first ordering
 */
export type CovenantStatus =
  | 'breach'
  | 'at_the_line'
  | 'danger'
  | 'caution'
  | 'safe'
  | 'suspended';

/**
 * Priority order for covenant sorting (lower = higher priority)
 *
 * Must cover every ThresholdZone: CovenantPanel derives a status straight
 * from getThresholdZone, so a zone missing here yields `undefined` and turns
 * the sort comparator into NaN, which silently unsorts the list.
 */
export const COVENANT_STATUS_PRIORITY: Record<CovenantStatus, number> = {
  breach: 0,
  at_the_line: 1,
  danger: 2,
  caution: 3,
  safe: 4,
  suspended: 5,
};

export interface ProjectInfo {
  name: string;
  facility: string;
  sponsor: string;
  borrower: string;
}

export interface PhaseInfo {
  current: string;
  constructionStart: string;
  codTarget: string;
  maturity: string;
}

export interface CovenantData {
  name: string;
  actual: number;
  required: number;
  operator: '<=' | '>=' | '<' | '>' | '=' | '!=';
  compliant: boolean;
  headroom?: number;
  suspended?: boolean;
  /** If covenant has step-down, the original (initial) threshold */
  originalThreshold?: number;
  /** Currently active step-down entry */
  activeStep?: { afterDate: string; threshold: number };
  /** Next upcoming step-down (future tightening) */
  nextStep?: { afterDate: string; threshold: number };
}

export interface MilestoneData {
  name: string;
  target: string;
  longstop: string;
  status: 'pending' | 'achieved' | 'at_risk' | 'breached' | 'in_progress';
  achievedDate?: string;
  percentComplete?: number;
}

export interface ReserveData {
  name: string;
  balance: number;
  target: number;
  minimum: number;
}

export interface WaterfallTierData {
  name: string;
  amount: number;
  blocked?: boolean;
  reason?: string;
}

export interface WaterfallData {
  revenue: number;
  tiers: WaterfallTierData[];
}

export interface CPItemData {
  name: string;
  description: string;
  responsible: string;
  status: 'pending' | 'satisfied' | 'waived' | 'not_applicable';
}

export interface CPChecklistData {
  name: string;
  section: string;
  conditions: CPItemData[];
}

// ==================== v2.1 Industry Types ====================

export interface TechnicalMilestoneData {
  name: string;
  target: string;
  longstop: string;
  measurement: string;
  targetValue: number;
  currentValue: number;
  status: 'pending' | 'in_progress' | 'achieved' | 'at_risk' | 'breached';
  percentComplete: number;
}

export interface RegulatoryRequirementData {
  name: string;
  agency: string;
  type: string;
  requiredFor: string;
  status: 'pending' | 'submitted' | 'approved' | 'denied';
  approvalDate?: string;
  dueDate?: string;
}

export interface PerformanceGuaranteeData {
  name: string;
  metric: string;
  p50: number;
  p75?: number;
  p90?: number;
  p99: number;
  actual: number;
  performanceLevel: 'p50' | 'p75' | 'p90' | 'p99' | 'below_p99';
  meetsGuarantee: boolean;
  shortfall?: number;
  unit?: string;
}

export interface DegradationData {
  name: string;
  assetType: string;
  initialCapacity: number;
  currentYear: number;
  cumulativeDegradation: number;
  effectiveCapacity: number;
  minimumCapacity: number;
  yearlyData?: Array<{
    year: number;
    capacity: number;
  }>;
}

export interface SeasonalAdjustmentData {
  name: string;
  metric: string;
  currentSeason: string;
  adjustmentFactor: number;
  active: boolean;
  reason?: string;
}

export interface TaxEquityStructureData {
  name: string;
  structureType: 'partnership_flip' | 'sale_leaseback' | 'inverted_lease';
  taxInvestor: string;
  sponsor: string;
  taxCreditAllocation: { investor: number; sponsor: number };
  cashAllocation: { investor: number; sponsor: number };
  targetReturn: number;
  currentIRR?: number;
  hasFlipped: boolean;
  flipDate?: string;
  buyoutPrice?: number;
}

export interface TaxCreditData {
  name: string;
  creditType: 'itc' | 'ptc' | '45X';
  baseRate: number;
  effectiveRate: number;
  eligibleBasis?: number;
  creditAmount: number;
  adders: Array<{ name: string; bonus: number }>;
  vestingPeriod?: number;
  percentVested?: number;
}

export interface DepreciationData {
  name: string;
  method: string;
  depreciableBasis: number;
  bonusDepreciation: number;
  currentYear: number;
  yearlyDepreciation: number;
  cumulativeDepreciation: number;
  remainingBasis: number;
}

export interface FlipEventData {
  name: string;
  trigger: 'target_return' | 'date_certain' | 'pf_event';
  targetValue?: number;
  currentValue?: number;
  projectedFlipDate?: string;
  hasTriggered: boolean;
  triggerDate?: string;
  preFlipAllocation: { investor: number; sponsor: number };
  postFlipAllocation: { investor: number; sponsor: number };
}

// Combined industry data for v2.1
export interface IndustryData {
  technicalMilestones?: TechnicalMilestoneData[];
  regulatoryRequirements?: RegulatoryRequirementData[];
  performanceGuarantees?: PerformanceGuaranteeData[];
  degradation?: DegradationData[];
  seasonalAdjustments?: SeasonalAdjustmentData[];
  taxEquity?: {
    structure?: TaxEquityStructureData;
    credits?: TaxCreditData[];
    depreciation?: DepreciationData[];
    flipEvents?: FlipEventData[];
  };
}

export interface BasketData {
  name: string;
  capacity: number;
  used: number;
  available: number;
  /** Utilization percentage (0-100) */
  utilization: number;
}

export interface DashboardData {
  project: ProjectInfo;
  phase: PhaseInfo;
  financials: Record<string, number>;
  covenants: CovenantData[];
  baskets: BasketData[];
  milestones: MilestoneData[];
  reserves: ReserveData[];
  waterfall: WaterfallData;
  conditionsPrecedent: CPChecklistData[];
  // v2.1 Industry data
  industry?: IndustryData;
  /** v2.7 Credit facilities — absent when the deal declares none. */
  facilities?: FacilityData[];
}

// =============================================================================
// FACILITY (v2.7)
// =============================================================================

export interface TrancheData {
  name: string;
  trancheType: string;
  commitment: number;
  drawn: number;
  undrawn: number;
  /** Spread over the benchmark, in percentage points. */
  margin: number;
  /** Benchmark + margin, in percentage points. */
  allInRate: number;
  annualInterest: number;
  scheduledAmortization: number;
  maturity: string | null;
  lcOutstanding: number;
  /** Revolvers only. */
  availability: number | null;
  /** Revolvers only, as a percentage. */
  utilization: number | null;
  /** Name of the pricing grid supplying the margin, if any. */
  pricingGrid: string | null;
}

export interface FacilityData {
  name: string;
  /** Reference rate, in percentage points. */
  benchmark: number;
  totalCommitment: number;
  totalDrawn: number;
  totalUndrawn: number;
  weightedRate: number;
  annualInterest: number;
  scheduledAmortization: number;
  fees: number;
  debtService: number;
  revolverUtilization: number | null;
  tranches: TrancheData[];
  /** Pricing grid levels in effect, if the deal declares any. */
  pricingGrids?: PricingGridData[];
}

export interface PricingGridData {
  name: string;
  /** Name of the ratio the grid is read against. */
  basedOn: string;
  basisValue: number | null;
  activeLevel: number;
  /** Applicable margin in percentage points. */
  margin: number;
  levelDescription: string;
}
