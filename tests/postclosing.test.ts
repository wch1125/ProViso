/**
 * Post-Closing Module Tests
 *
 * Tests for financial submissions, draw requests, and scenario simulation.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  // Financial Submissions
  createFinancialSubmission,
  getFinancialSubmission,
  listFinancialSubmissions,
  updateFinancialSubmission,
  verifySubmission,
  disputeSubmission,
  deleteFinancialSubmission,
  // Draw Requests
  createDrawRequest,
  getDrawRequest,
  listDrawRequests,
  submitDrawRequest,
  startDrawReview,
  approveDrawRequest,
  rejectDrawRequest,
  fundDrawRequest,
  satisfyDrawCondition,
  waiveDrawCondition,
  getDrawRequestSummary,
  deleteDrawRequest,
  // Compliance History
  getComplianceHistory,
  // Scenario Simulation
  runScenario,
  // Store management
  clearPostClosingData,
} from '../src/hub/postclosing/index.js';
import type { CovenantResultSummary } from '../src/hub/types.js';

describe('Post-Closing Module', () => {
  beforeEach(() => {
    clearPostClosingData();
  });

  // ===========================================================================
  // FINANCIAL SUBMISSIONS
  // ===========================================================================

  describe('Financial Submissions', () => {
    it('should create a financial submission', () => {
      const submission = createFinancialSubmission({
        dealId: 'deal-1',
        period: '2024-Q4',
        periodType: 'quarterly',
        periodEndDate: new Date('2024-12-31'),
        financialData: {
          revenue: 10_000_000,
          ebitda: 2_500_000,
          total_debt: 5_000_000,
        },
        submittedBy: 'user-1',
      });

      expect(submission.id).toBeTruthy();
      expect(submission.dealId).toBe('deal-1');
      expect(submission.period).toBe('2024-Q4');
      expect(submission.periodType).toBe('quarterly');
      expect(submission.financialData.revenue).toBe(10_000_000);
      expect(submission.verificationStatus).toBe('pending');
    });

    it('should get a financial submission by ID', () => {
      const created = createFinancialSubmission({
        dealId: 'deal-1',
        period: '2024-Q4',
        periodType: 'quarterly',
        periodEndDate: new Date('2024-12-31'),
        financialData: { revenue: 10_000_000 },
        submittedBy: 'user-1',
      });

      const retrieved = getFinancialSubmission(created.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
    });

    it('should return null for non-existent submission', () => {
      const result = getFinancialSubmission('non-existent');
      expect(result).toBeNull();
    });

    it('should list submissions for a deal sorted by period', () => {
      createFinancialSubmission({
        dealId: 'deal-1',
        period: '2024-Q2',
        periodType: 'quarterly',
        periodEndDate: new Date('2024-06-30'),
        financialData: { revenue: 8_000_000 },
        submittedBy: 'user-1',
      });

      createFinancialSubmission({
        dealId: 'deal-1',
        period: '2024-Q4',
        periodType: 'quarterly',
        periodEndDate: new Date('2024-12-31'),
        financialData: { revenue: 10_000_000 },
        submittedBy: 'user-1',
      });

      createFinancialSubmission({
        dealId: 'deal-2',
        period: '2024-Q4',
        periodType: 'quarterly',
        periodEndDate: new Date('2024-12-31'),
        financialData: { revenue: 5_000_000 },
        submittedBy: 'user-1',
      });

      const deal1Submissions = listFinancialSubmissions('deal-1');
      expect(deal1Submissions.length).toBe(2);
      // Should be sorted newest first
      expect(deal1Submissions[0]?.period).toBe('2024-Q4');
      expect(deal1Submissions[1]?.period).toBe('2024-Q2');
    });

    it('should update a financial submission', () => {
      const submission = createFinancialSubmission({
        dealId: 'deal-1',
        period: '2024-Q4',
        periodType: 'quarterly',
        periodEndDate: new Date('2024-12-31'),
        financialData: { revenue: 10_000_000 },
        submittedBy: 'user-1',
      });

      const updated = updateFinancialSubmission(submission.id, {
        financialData: { revenue: 12_000_000, ebitda: 3_000_000 },
        covenantResults: [
          { name: 'Leverage', compliant: true, actual: 2.0, threshold: 4.0, headroom: 2.0 },
        ],
      });

      expect(updated?.financialData.revenue).toBe(12_000_000);
      expect(updated?.financialData.ebitda).toBe(3_000_000);
      expect(updated?.covenantResults.length).toBe(1);
    });

    it('should verify a submission', () => {
      const submission = createFinancialSubmission({
        dealId: 'deal-1',
        period: '2024-Q4',
        periodType: 'quarterly',
        periodEndDate: new Date('2024-12-31'),
        financialData: { revenue: 10_000_000 },
        submittedBy: 'user-1',
      });

      const verified = verifySubmission(submission.id, 'verifier-1');

      expect(verified?.verificationStatus).toBe('verified');
      expect(verified?.verifiedBy).toBe('verifier-1');
      expect(verified?.verifiedAt).not.toBeNull();
    });

    it('should dispute a submission', () => {
      const submission = createFinancialSubmission({
        dealId: 'deal-1',
        period: '2024-Q4',
        periodType: 'quarterly',
        periodEndDate: new Date('2024-12-31'),
        financialData: { revenue: 10_000_000 },
        submittedBy: 'user-1',
      });

      const disputed = disputeSubmission(submission.id);
      expect(disputed?.verificationStatus).toBe('disputed');
    });

    it('should delete a financial submission', () => {
      const submission = createFinancialSubmission({
        dealId: 'deal-1',
        period: '2024-Q4',
        periodType: 'quarterly',
        periodEndDate: new Date('2024-12-31'),
        financialData: { revenue: 10_000_000 },
        submittedBy: 'user-1',
      });

      const deleted = deleteFinancialSubmission(submission.id);
      expect(deleted).toBe(true);

      const retrieved = getFinancialSubmission(submission.id);
      expect(retrieved).toBeNull();
    });
  });

  // ===========================================================================
  // DRAW REQUESTS
  // ===========================================================================

  describe('Draw Requests', () => {
    it('should create a draw request', () => {
      const request = createDrawRequest({
        dealId: 'deal-1',
        requestedAmount: 5_000_000,
        conditions: [
          { conditionId: 'cp-1', title: 'Compliance Certificate' },
          { conditionId: 'cp-2', title: 'Insurance Certificate' },
        ],
      });

      expect(request.id).toBeTruthy();
      expect(request.dealId).toBe('deal-1');
      expect(request.drawNumber).toBe(1);
      expect(request.requestedAmount).toBe(5_000_000);
      expect(request.status).toBe('draft');
      expect(request.conditions.length).toBe(2);
      expect(request.conditions[0]?.status).toBe('pending');
    });

    it('should auto-increment draw numbers', () => {
      const r1 = createDrawRequest({
        dealId: 'deal-1',
        requestedAmount: 1_000_000,
      });
      const r2 = createDrawRequest({
        dealId: 'deal-1',
        requestedAmount: 2_000_000,
      });

      expect(r1.drawNumber).toBe(1);
      expect(r2.drawNumber).toBe(2);
    });

    it('should get a draw request by ID', () => {
      const created = createDrawRequest({
        dealId: 'deal-1',
        requestedAmount: 5_000_000,
      });

      const retrieved = getDrawRequest(created.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
    });

    it('should list draw requests for a deal', () => {
      createDrawRequest({ dealId: 'deal-1', requestedAmount: 1_000_000 });
      createDrawRequest({ dealId: 'deal-1', requestedAmount: 2_000_000 });
      createDrawRequest({ dealId: 'deal-2', requestedAmount: 3_000_000 });

      const deal1Requests = listDrawRequests('deal-1');
      expect(deal1Requests.length).toBe(2);
    });

    it('should submit a draw request', () => {
      const request = createDrawRequest({
        dealId: 'deal-1',
        requestedAmount: 5_000_000,
      });

      const submitted = submitDrawRequest(request.id);
      expect(submitted?.status).toBe('submitted');
    });

    it('should follow draw request workflow', () => {
      const request = createDrawRequest({
        dealId: 'deal-1',
        requestedAmount: 5_000_000,
      });

      // Submit
      let updated = submitDrawRequest(request.id);
      expect(updated?.status).toBe('submitted');

      // Start review
      updated = startDrawReview(request.id);
      expect(updated?.status).toBe('under_review');

      // Approve
      updated = approveDrawRequest(request.id, 4_500_000);
      expect(updated?.status).toBe('approved');
      expect(updated?.approvedAmount).toBe(4_500_000);
      expect(updated?.approvedAt).not.toBeNull();

      // Fund
      updated = fundDrawRequest(request.id, 4_500_000);
      expect(updated?.status).toBe('funded');
      expect(updated?.fundedAmount).toBe(4_500_000);
      expect(updated?.fundedAt).not.toBeNull();
    });

    it('should reject a draw request', () => {
      const request = createDrawRequest({
        dealId: 'deal-1',
        requestedAmount: 5_000_000,
      });

      submitDrawRequest(request.id);
      startDrawReview(request.id);
      const rejected = rejectDrawRequest(request.id);

      expect(rejected?.status).toBe('rejected');
    });

    it('should satisfy a draw condition', () => {
      const request = createDrawRequest({
        dealId: 'deal-1',
        requestedAmount: 5_000_000,
        conditions: [
          { conditionId: 'cp-1', title: 'Compliance Certificate' },
        ],
      });

      const updated = satisfyDrawCondition(request.id, 'cp-1');
      expect(updated?.conditions[0]?.status).toBe('satisfied');
      expect(updated?.conditions[0]?.satisfiedAt).not.toBeNull();
    });

    it('should waive a draw condition', () => {
      const request = createDrawRequest({
        dealId: 'deal-1',
        requestedAmount: 5_000_000,
        conditions: [
          { conditionId: 'cp-1', title: 'Insurance Certificate' },
        ],
      });

      const updated = waiveDrawCondition(request.id, 'cp-1');
      expect(updated?.conditions[0]?.status).toBe('waived');
    });

    it('should calculate draw request summary', () => {
      createDrawRequest({ dealId: 'deal-1', requestedAmount: 1_000_000 });
      const r2 = createDrawRequest({ dealId: 'deal-1', requestedAmount: 2_000_000 });
      const r3 = createDrawRequest({ dealId: 'deal-1', requestedAmount: 3_000_000 });

      // Approve and fund r2
      submitDrawRequest(r2.id);
      approveDrawRequest(r2.id, 2_000_000);
      fundDrawRequest(r2.id, 2_000_000);

      // Submit r3
      submitDrawRequest(r3.id);

      const summary = getDrawRequestSummary('deal-1');

      expect(summary.totalRequested).toBe(6_000_000);
      expect(summary.totalApproved).toBe(2_000_000);
      expect(summary.totalFunded).toBe(2_000_000);
      expect(summary.pendingRequests).toBe(2); // draft + submitted
    });

    it('should delete a draw request', () => {
      const request = createDrawRequest({
        dealId: 'deal-1',
        requestedAmount: 5_000_000,
      });

      const deleted = deleteDrawRequest(request.id);
      expect(deleted).toBe(true);

      const retrieved = getDrawRequest(request.id);
      expect(retrieved).toBeNull();
    });
  });

  // ===========================================================================
  // COMPLIANCE HISTORY
  // ===========================================================================

  describe('Compliance History', () => {
    it('should get compliance history from submissions', () => {
      const s1 = createFinancialSubmission({
        dealId: 'deal-1',
        period: '2024-Q3',
        periodType: 'quarterly',
        periodEndDate: new Date('2024-09-30'),
        financialData: { revenue: 9_000_000 },
        submittedBy: 'user-1',
      });

      const s2 = createFinancialSubmission({
        dealId: 'deal-1',
        period: '2024-Q4',
        periodType: 'quarterly',
        periodEndDate: new Date('2024-12-31'),
        financialData: { revenue: 10_000_000 },
        submittedBy: 'user-1',
      });

      // Add covenant results to submissions
      updateFinancialSubmission(s1.id, {
        covenantResults: [
          { name: 'Leverage', compliant: true, actual: 2.5, threshold: 4.0, headroom: 1.5 },
        ],
      });

      updateFinancialSubmission(s2.id, {
        covenantResults: [
          { name: 'Leverage', compliant: true, actual: 2.0, threshold: 4.0, headroom: 2.0 },
        ],
      });

      const history = getComplianceHistory('deal-1');

      expect(history.dealId).toBe('deal-1');
      expect(history.periods.length).toBe(2);
      expect(history.periods[0]?.overallCompliant).toBe(true);
    });

    it('should identify non-compliant periods', () => {
      const s1 = createFinancialSubmission({
        dealId: 'deal-1',
        period: '2024-Q4',
        periodType: 'quarterly',
        periodEndDate: new Date('2024-12-31'),
        financialData: { revenue: 10_000_000 },
        submittedBy: 'user-1',
      });

      updateFinancialSubmission(s1.id, {
        covenantResults: [
          { name: 'Leverage', compliant: false, actual: 5.0, threshold: 4.0, headroom: -1.0 },
        ],
      });

      const history = getComplianceHistory('deal-1');
      expect(history.periods[0]?.overallCompliant).toBe(false);
    });
  });

  // ===========================================================================
  // SCENARIO SIMULATION
  // ===========================================================================

  describe('Scenario Simulation', () => {
    // Simple covenant calculator for testing
    const simpleCovenantCalculator = (
      financials: Record<string, number>
    ): CovenantResultSummary[] => {
      const leverage = (financials.total_debt ?? 0) / (financials.ebitda ?? 1);
      const threshold = 4.0;

      return [
        {
          name: 'Leverage',
          actual: leverage,
          threshold,
          compliant: leverage <= threshold,
          headroom: threshold - leverage,
        },
      ];
    };

    it('should run a scenario with absolute adjustments', () => {
      const result = runScenario(
        {
          baseFinancials: {
            ebitda: 10_000_000,
            total_debt: 30_000_000,
          },
          adjustments: [{ field: 'ebitda', type: 'absolute', value: 2_000_000 }],
          label: 'EBITDA +$2M',
        },
        simpleCovenantCalculator
      );

      expect(result.label).toBe('EBITDA +$2M');
      expect(result.adjustedFinancials.ebitda).toBe(12_000_000);
      expect(result.covenantResults[0]?.actual).toBeCloseTo(2.5);
      expect(result.allCompliant).toBe(true);
    });

    it('should run a scenario with percentage adjustments', () => {
      const result = runScenario(
        {
          baseFinancials: {
            ebitda: 10_000_000,
            total_debt: 30_000_000,
          },
          adjustments: [{ field: 'ebitda', type: 'percentage', value: 20 }],
          label: 'EBITDA +20%',
        },
        simpleCovenantCalculator
      );

      expect(result.adjustedFinancials.ebitda).toBe(12_000_000);
    });

    it('should compare baseline and scenario results', () => {
      const result = runScenario(
        {
          baseFinancials: {
            ebitda: 10_000_000,
            total_debt: 30_000_000,
          },
          adjustments: [{ field: 'ebitda', type: 'percentage', value: 50 }],
        },
        simpleCovenantCalculator
      );

      expect(result.comparison.length).toBe(1);
      const comparison = result.comparison[0]!;
      expect(comparison.baselineActual).toBeCloseTo(3.0);
      expect(comparison.scenarioActual).toBeCloseTo(2.0);
      expect(comparison.impactType).toBe('improved');
    });

    it('should identify worsening scenarios', () => {
      const result = runScenario(
        {
          baseFinancials: {
            ebitda: 10_000_000,
            total_debt: 30_000_000,
          },
          adjustments: [{ field: 'ebitda', type: 'percentage', value: -30 }],
        },
        simpleCovenantCalculator
      );

      const comparison = result.comparison[0]!;
      expect(comparison.scenarioActual).toBeGreaterThan(comparison.baselineActual);
      expect(comparison.impactType).toBe('worsened');
    });

    it('should handle scenario that causes covenant breach', () => {
      const result = runScenario(
        {
          baseFinancials: {
            ebitda: 10_000_000,
            total_debt: 30_000_000,
          },
          adjustments: [{ field: 'ebitda', type: 'percentage', value: -50 }],
        },
        simpleCovenantCalculator
      );

      // Leverage goes from 3.0x to 6.0x (breach at 4.0x)
      expect(result.allCompliant).toBe(false);
      expect(result.comparison[0]?.baselineCompliant).toBe(true);
      expect(result.comparison[0]?.scenarioCompliant).toBe(false);
    });

    it('should handle multiple adjustments', () => {
      const result = runScenario(
        {
          baseFinancials: {
            ebitda: 10_000_000,
            total_debt: 30_000_000,
          },
          adjustments: [
            { field: 'ebitda', type: 'percentage', value: 10 },
            { field: 'total_debt', type: 'absolute', value: -5_000_000 },
          ],
        },
        simpleCovenantCalculator
      );

      expect(result.adjustedFinancials.ebitda).toBe(11_000_000);
      expect(result.adjustedFinancials.total_debt).toBe(25_000_000);
      // Leverage = 25M / 11M ≈ 2.27x
      expect(result.covenantResults[0]?.actual).toBeCloseTo(2.27, 1);
    });
  });
});
