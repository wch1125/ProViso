/**
 * ProViso Hub v2.0 — Post-Closing API
 *
 * API functions for managing post-closing operations:
 * - Financial submissions
 * - Draw requests
 * - Compliance history
 * - Scenario simulation
 */

import { generateId } from '../store.js';
import type {
  FinancialSubmission,
  DrawRequest,
  DrawCondition,
  CovenantResultSummary,
} from '../types.js';
import type {
  CreateFinancialSubmissionInput,
  UpdateFinancialSubmissionInput,
  CreateDrawRequestInput,
  UpdateDrawRequestInput,
  ComplianceHistory,
  CompliancePeriod,
  ScenarioInput,
  ScenarioResult,
  ScenarioComparison,
  DrawRequestSummary,
} from './types.js';

// =============================================================================
// IN-MEMORY STORES (for MVP)
// =============================================================================

const submissionsStore = new Map<string, FinancialSubmission>();
const drawRequestsStore = new Map<string, DrawRequest>();
let drawRequestCounter = 0;

// =============================================================================
// FINANCIAL SUBMISSION OPERATIONS
// =============================================================================

/**
 * Create a new financial submission.
 */
export function createFinancialSubmission(
  input: CreateFinancialSubmissionInput
): FinancialSubmission {
  const id = generateId();
  const now = new Date();

  const submission: FinancialSubmission = {
    id,
    dealId: input.dealId,
    period: input.period,
    periodType: input.periodType,
    periodEndDate: input.periodEndDate,
    financialData: { ...input.financialData },
    submittedBy: input.submittedBy,
    submittedAt: now,
    verifiedBy: null,
    verifiedAt: null,
    verificationStatus: 'pending',
    covenantResults: [],
    basketCapacities: [],
    complianceCertificateId: null,
  };

  submissionsStore.set(id, submission);
  return submission;
}

/**
 * Get a financial submission by ID.
 */
export function getFinancialSubmission(id: string): FinancialSubmission | null {
  return submissionsStore.get(id) ?? null;
}

/**
 * List financial submissions for a deal.
 */
export function listFinancialSubmissions(dealId: string): FinancialSubmission[] {
  return Array.from(submissionsStore.values())
    .filter((s) => s.dealId === dealId)
    .sort((a, b) => new Date(b.periodEndDate).getTime() - new Date(a.periodEndDate).getTime());
}

/**
 * Update a financial submission.
 */
export function updateFinancialSubmission(
  id: string,
  updates: UpdateFinancialSubmissionInput
): FinancialSubmission | null {
  const submission = submissionsStore.get(id);
  if (!submission) return null;

  const updated: FinancialSubmission = {
    ...submission,
    ...(updates.financialData && { financialData: { ...updates.financialData } }),
    ...(updates.verifiedBy !== undefined && { verifiedBy: updates.verifiedBy }),
    ...(updates.verifiedAt !== undefined && { verifiedAt: updates.verifiedAt }),
    ...(updates.verificationStatus && { verificationStatus: updates.verificationStatus }),
    ...(updates.covenantResults && { covenantResults: [...updates.covenantResults] }),
    ...(updates.basketCapacities && { basketCapacities: [...updates.basketCapacities] }),
    ...(updates.complianceCertificateId !== undefined && {
      complianceCertificateId: updates.complianceCertificateId,
    }),
  };

  submissionsStore.set(id, updated);
  return updated;
}

/**
 * Verify a financial submission.
 */
export function verifySubmission(
  id: string,
  verifiedBy: string
): FinancialSubmission | null {
  return updateFinancialSubmission(id, {
    verifiedBy,
    verifiedAt: new Date(),
    verificationStatus: 'verified',
  });
}

/**
 * Mark a submission as disputed.
 */
export function disputeSubmission(id: string): FinancialSubmission | null {
  return updateFinancialSubmission(id, {
    verificationStatus: 'disputed',
  });
}

/**
 * Delete a financial submission.
 */
export function deleteFinancialSubmission(id: string): boolean {
  return submissionsStore.delete(id);
}

// =============================================================================
// DRAW REQUEST OPERATIONS
// =============================================================================

/**
 * Create a new draw request.
 */
export function createDrawRequest(input: CreateDrawRequestInput): DrawRequest {
  const id = generateId();
  const now = new Date();
  drawRequestCounter++;

  const conditions: DrawCondition[] = (input.conditions ?? []).map((c) => ({
    conditionId: c.conditionId,
    title: c.title,
    status: 'pending' as const,
    satisfiedAt: null,
  }));

  const drawRequest: DrawRequest = {
    id,
    dealId: input.dealId,
    drawNumber: drawRequestCounter,
    requestedAmount: input.requestedAmount,
    approvedAmount: null,
    fundedAmount: null,
    status: 'draft',
    requestedAt: now,
    approvedAt: null,
    fundedAt: null,
    conditions,
    supportingDocumentIds: input.supportingDocumentIds ?? [],
  };

  drawRequestsStore.set(id, drawRequest);
  return drawRequest;
}

/**
 * Get a draw request by ID.
 */
export function getDrawRequest(id: string): DrawRequest | null {
  return drawRequestsStore.get(id) ?? null;
}

/**
 * List draw requests for a deal.
 */
export function listDrawRequests(dealId: string): DrawRequest[] {
  return Array.from(drawRequestsStore.values())
    .filter((r) => r.dealId === dealId)
    .sort((a, b) => a.drawNumber - b.drawNumber);
}

/**
 * Update a draw request.
 */
export function updateDrawRequest(
  id: string,
  updates: UpdateDrawRequestInput
): DrawRequest | null {
  const request = drawRequestsStore.get(id);
  if (!request) return null;

  const updated: DrawRequest = {
    ...request,
    ...(updates.requestedAmount !== undefined && { requestedAmount: updates.requestedAmount }),
    ...(updates.approvedAmount !== undefined && { approvedAmount: updates.approvedAmount }),
    ...(updates.fundedAmount !== undefined && { fundedAmount: updates.fundedAmount }),
    ...(updates.status && { status: updates.status }),
    ...(updates.approvedAt !== undefined && { approvedAt: updates.approvedAt }),
    ...(updates.fundedAt !== undefined && { fundedAt: updates.fundedAt }),
    ...(updates.supportingDocumentIds && {
      supportingDocumentIds: [...updates.supportingDocumentIds],
    }),
  };

  drawRequestsStore.set(id, updated);
  return updated;
}

/**
 * Submit a draw request for review.
 */
export function submitDrawRequest(id: string): DrawRequest | null {
  return updateDrawRequest(id, { status: 'submitted' });
}

/**
 * Start review of a draw request.
 */
export function startDrawReview(id: string): DrawRequest | null {
  return updateDrawRequest(id, { status: 'under_review' });
}

/**
 * Approve a draw request.
 */
export function approveDrawRequest(
  id: string,
  approvedAmount: number
): DrawRequest | null {
  return updateDrawRequest(id, {
    status: 'approved',
    approvedAmount,
    approvedAt: new Date(),
  });
}

/**
 * Reject a draw request.
 */
export function rejectDrawRequest(id: string): DrawRequest | null {
  return updateDrawRequest(id, { status: 'rejected' });
}

/**
 * Fund a draw request.
 */
export function fundDrawRequest(
  id: string,
  fundedAmount: number
): DrawRequest | null {
  return updateDrawRequest(id, {
    status: 'funded',
    fundedAmount,
    fundedAt: new Date(),
  });
}

/**
 * Satisfy a draw condition.
 */
export function satisfyDrawCondition(
  requestId: string,
  conditionId: string
): DrawRequest | null {
  const request = drawRequestsStore.get(requestId);
  if (!request) return null;

  const conditions = request.conditions.map((c) =>
    c.conditionId === conditionId
      ? { ...c, status: 'satisfied' as const, satisfiedAt: new Date() }
      : c
  );

  const updated = { ...request, conditions };
  drawRequestsStore.set(requestId, updated);
  return updated;
}

/**
 * Waive a draw condition.
 */
export function waiveDrawCondition(
  requestId: string,
  conditionId: string
): DrawRequest | null {
  const request = drawRequestsStore.get(requestId);
  if (!request) return null;

  const conditions = request.conditions.map((c) =>
    c.conditionId === conditionId
      ? { ...c, status: 'waived' as const, satisfiedAt: new Date() }
      : c
  );

  const updated = { ...request, conditions };
  drawRequestsStore.set(requestId, updated);
  return updated;
}

/**
 * Get draw request summary for a deal.
 */
export function getDrawRequestSummary(dealId: string): DrawRequestSummary {
  const requests = listDrawRequests(dealId);

  const totalRequested = requests.reduce((sum, r) => sum + r.requestedAmount, 0);
  const totalApproved = requests.reduce((sum, r) => sum + (r.approvedAmount ?? 0), 0);
  const totalFunded = requests.reduce((sum, r) => sum + (r.fundedAmount ?? 0), 0);
  const pendingRequests = requests.filter(
    (r) => r.status === 'draft' || r.status === 'submitted' || r.status === 'under_review'
  ).length;

  return {
    dealId,
    totalRequested,
    totalApproved,
    totalFunded,
    pendingRequests,
    requests,
  };
}

/**
 * Delete a draw request.
 */
export function deleteDrawRequest(id: string): boolean {
  return drawRequestsStore.delete(id);
}

// =============================================================================
// COMPLIANCE HISTORY
// =============================================================================

/**
 * Get compliance history for a deal.
 */
export function getComplianceHistory(dealId: string): ComplianceHistory {
  const submissions = listFinancialSubmissions(dealId);

  const periods: CompliancePeriod[] = submissions
    .filter((s) => s.covenantResults.length > 0)
    .map((s) => ({
      period: s.period,
      periodEndDate: s.periodEndDate,
      covenants: s.covenantResults,
      overallCompliant: s.covenantResults.every((c) => c.compliant),
    }));

  return {
    dealId,
    periods,
  };
}

// =============================================================================
// SCENARIO SIMULATION
// =============================================================================

/**
 * Run a scenario simulation.
 */
export function runScenario(
  input: ScenarioInput,
  covenantCalculator: (financials: Record<string, number>) => CovenantResultSummary[]
): ScenarioResult {
  // Apply adjustments to create adjusted financials
  const adjustedFinancials = { ...input.baseFinancials };

  for (const adj of input.adjustments) {
    const currentValue = adjustedFinancials[adj.field] ?? 0;
    if (adj.type === 'absolute') {
      adjustedFinancials[adj.field] = currentValue + adj.value;
    } else {
      // Percentage adjustment
      adjustedFinancials[adj.field] = currentValue * (1 + adj.value / 100);
    }
  }

  // Calculate covenant results for both baseline and scenario
  const baselineResults = covenantCalculator(input.baseFinancials);
  const scenarioResults = covenantCalculator(adjustedFinancials);

  // Build comparison
  const comparison: ScenarioComparison[] = baselineResults.map((baseline) => {
    const scenario = scenarioResults.find((s) => s.name === baseline.name);
    if (!scenario) {
      return {
        covenantName: baseline.name,
        baselineActual: baseline.actual,
        scenarioActual: baseline.actual,
        change: 0,
        changePercent: 0,
        baselineCompliant: baseline.compliant,
        scenarioCompliant: baseline.compliant,
        impactType: 'unchanged' as const,
      };
    }

    const change = scenario.actual - baseline.actual;
    const changePercent = baseline.actual !== 0 ? (change / baseline.actual) * 100 : 0;

    let impactType: 'improved' | 'worsened' | 'unchanged';
    if (scenario.compliant && !baseline.compliant) {
      impactType = 'improved';
    } else if (!scenario.compliant && baseline.compliant) {
      impactType = 'worsened';
    } else if (Math.abs(change) < 0.001) {
      impactType = 'unchanged';
    } else {
      // For ratios, direction of improvement depends on the covenant type
      // Assuming higher headroom is better
      impactType = scenario.headroom > baseline.headroom ? 'improved' : 'worsened';
    }

    return {
      covenantName: baseline.name,
      baselineActual: baseline.actual,
      scenarioActual: scenario.actual,
      change,
      changePercent,
      baselineCompliant: baseline.compliant,
      scenarioCompliant: scenario.compliant,
      impactType,
    };
  });

  return {
    label: input.label ?? 'Scenario',
    adjustedFinancials,
    covenantResults: scenarioResults,
    allCompliant: scenarioResults.every((c) => c.compliant),
    comparison,
  };
}

// =============================================================================
// STORE MANAGEMENT (for testing)
// =============================================================================

/**
 * Clear all post-closing data (for testing).
 */
export function clearPostClosingData(): void {
  submissionsStore.clear();
  drawRequestsStore.clear();
  drawRequestCounter = 0;
}

/**
 * Load submissions and draw requests from arrays (for demo/testing).
 */
export function loadPostClosingData(
  submissions: FinancialSubmission[],
  drawRequests: DrawRequest[]
): void {
  for (const s of submissions) {
    submissionsStore.set(s.id, s);
  }
  for (const r of drawRequests) {
    drawRequestsStore.set(r.id, r);
    if (r.drawNumber > drawRequestCounter) {
      drawRequestCounter = r.drawNumber;
    }
  }
}
