/**
 * ProViso Hub v2.0 — Post-Closing Module Types
 *
 * Types for financial submissions, draw requests, and monitoring.
 */

import type {
  FinancialSubmission,
  DrawRequest,
  DrawCondition,
  CovenantResultSummary,
  BasketCapacitySummary,
  VerificationStatus,
  DrawRequestStatus,
  DrawConditionStatus,
} from '../types.js';

// Re-export for convenience
export type {
  FinancialSubmission,
  DrawRequest,
  DrawCondition,
  CovenantResultSummary,
  BasketCapacitySummary,
  VerificationStatus,
  DrawRequestStatus,
  DrawConditionStatus,
};

// =============================================================================
// INPUT TYPES
// =============================================================================

/**
 * Input for creating a financial submission.
 */
export interface CreateFinancialSubmissionInput {
  dealId: string;
  period: string;
  periodType: 'monthly' | 'quarterly' | 'annual';
  periodEndDate: Date;
  financialData: Record<string, number>;
  submittedBy: string;
}

/**
 * Input for updating a financial submission.
 */
export interface UpdateFinancialSubmissionInput {
  financialData?: Record<string, number>;
  verifiedBy?: string | null;
  verifiedAt?: Date | null;
  verificationStatus?: VerificationStatus;
  covenantResults?: CovenantResultSummary[];
  basketCapacities?: BasketCapacitySummary[];
  complianceCertificateId?: string | null;
}

/**
 * Input for creating a draw request.
 */
export interface CreateDrawRequestInput {
  dealId: string;
  requestedAmount: number;
  conditions?: Array<{ conditionId: string; title: string }>;
  supportingDocumentIds?: string[];
}

/**
 * Input for updating a draw request.
 */
export interface UpdateDrawRequestInput {
  requestedAmount?: number;
  approvedAmount?: number | null;
  fundedAmount?: number | null;
  status?: DrawRequestStatus;
  approvedAt?: Date | null;
  fundedAt?: Date | null;
  supportingDocumentIds?: string[];
}

// =============================================================================
// COMPLIANCE HISTORY
// =============================================================================

/**
 * A single period's compliance snapshot for trend analysis.
 */
export interface CompliancePeriod {
  period: string;
  periodEndDate: Date;
  covenants: CovenantResultSummary[];
  overallCompliant: boolean;
}

/**
 * Historical compliance data for trend charts.
 */
export interface ComplianceHistory {
  dealId: string;
  periods: CompliancePeriod[];
}

// =============================================================================
// SCENARIO SIMULATION
// =============================================================================

/**
 * Input for running a scenario simulation.
 */
export interface ScenarioInput {
  /** Base financial data to modify */
  baseFinancials: Record<string, number>;
  /** Adjustments to apply (can be absolute or percentage) */
  adjustments: ScenarioAdjustment[];
  /** Label for this scenario */
  label?: string;
}

/**
 * A single adjustment in a scenario.
 */
export interface ScenarioAdjustment {
  /** Field to adjust */
  field: string;
  /** Type of adjustment */
  type: 'absolute' | 'percentage';
  /** Value to apply (absolute amount or percentage change) */
  value: number;
}

/**
 * Result of a scenario simulation.
 */
export interface ScenarioResult {
  label: string;
  /** Adjusted financials after applying scenario */
  adjustedFinancials: Record<string, number>;
  /** Covenant results under the scenario */
  covenantResults: CovenantResultSummary[];
  /** Whether all covenants pass under this scenario */
  allCompliant: boolean;
  /** Comparison to baseline */
  comparison: ScenarioComparison[];
}

/**
 * Comparison of a covenant between baseline and scenario.
 */
export interface ScenarioComparison {
  covenantName: string;
  baselineActual: number;
  scenarioActual: number;
  change: number;
  changePercent: number;
  baselineCompliant: boolean;
  scenarioCompliant: boolean;
  impactType: 'improved' | 'worsened' | 'unchanged';
}

// =============================================================================
// DRAW REQUEST SUMMARY
// =============================================================================

/**
 * Summary of draw requests for a deal.
 */
export interface DrawRequestSummary {
  dealId: string;
  totalRequested: number;
  totalApproved: number;
  totalFunded: number;
  pendingRequests: number;
  requests: DrawRequest[];
}
