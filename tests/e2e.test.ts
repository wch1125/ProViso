/**
 * ProViso Hub v2.0 — End-to-End Integration Tests
 *
 * These tests verify complete workflows across multiple modules,
 * simulating real-world usage patterns.
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Hub core
import {
  InMemoryStore,
  createDeal,
  getDeal,
  transitionDealStatus,
  createVersion,
  sendVersion,
  receiveVersion,
  createMarkup,
  getCurrentVersion,
  addParty,
  listParties,
  compareVersions,
} from '../src/hub/index.js';
import { PartyRole } from '../src/closing-enums.js';

// Closing module
import {
  createConditionPrecedent,
  listConditionsPrecedent,
  satisfyCondition,
  waiveCondition,
  createDocument,
  listDocuments,
  markDocumentUploaded,
  markDocumentExecuted,
  addSignature,
  markSignatureSigned,
  requestSignature,
  calculateClosingReadiness,
  getClosingChecklist,
  clearClosingData,
} from '../src/hub/closing/api.js';

// Post-closing module
import {
  createFinancialSubmission,
  listFinancialSubmissions,
  verifySubmission,
  createDrawRequest,
  listDrawRequests,
  submitDrawRequest,
  approveDrawRequest,
  fundDrawRequest,
  satisfyDrawCondition,
  runScenario,
  clearPostClosingData,
} from '../src/hub/postclosing/index.js';

// Versioning
import {
  compileToState,
  diffStates,
  classifyChange,
  generateChangeSummary,
} from '../src/hub/versioning/index.js';

// =============================================================================
// SHARED TEST DATA
// =============================================================================

const sampleCode = {
  v1: `DEFINE EBITDA AS NetIncome + InterestExpense + TaxExpense + DepreciationAmortization

DEFINE TotalDebt AS SeniorDebt + SubordinatedDebt

DEFINE Leverage AS TotalDebt / EBITDA

COVENANT MaxLeverage
  REQUIRES Leverage <= 5.00
  TESTED QUARTERLY

BASKET GeneralInvestments
  CAPACITY $25_000_000`,

  v2: `DEFINE EBITDA AS NetIncome + InterestExpense + TaxExpense + DepreciationAmortization + StockBasedComp

DEFINE TotalDebt AS SeniorDebt + SubordinatedDebt

DEFINE Leverage AS TotalDebt / EBITDA

COVENANT MaxLeverage
  REQUIRES Leverage <= 5.50
  TESTED QUARTERLY

BASKET GeneralInvestments
  CAPACITY $35_000_000`,
};

// =============================================================================
// E2E: DEAL NEGOTIATION WORKFLOW
// =============================================================================

describe('E2E: Deal Negotiation Workflow', () => {
  let store: InstanceType<typeof InMemoryStore>;

  beforeEach(async () => {
    store = new InMemoryStore();
  });

  it('should complete a full negotiation cycle: create deal -> versions -> compare', async () => {
    // Step 1: Create a new deal
    const deal = await store.createDeal({
      name: 'Test Acquisition Facility',
      dealType: 'corporate',
      facilityAmount: 150_000_000,
      currency: 'USD',
      createdBy: 'admin@testbank.com',
    });

    expect(deal.id).toBeTruthy();
    expect(deal.status).toBe('draft');
    expect(deal.name).toBe('Test Acquisition Facility');

    // Step 2: Add parties to the deal
    const borrower = await store.addParty(deal.id, {
      name: 'ABC Holdings, Inc.',
      shortName: 'ABC',
      role: PartyRole.BORROWER,
      partyType: 'borrower',
      primaryContact: {
        name: 'Jane Smith',
        email: 'jsmith@abc.com',
        phone: '+1-555-0100',
        title: 'CFO',
      },
    });

    const agent = await store.addParty(deal.id, {
      name: 'First National Bank',
      shortName: 'FNB',
      role: PartyRole.ADMINISTRATIVE_AGENT,
      partyType: 'agent',
      primaryContact: {
        name: 'John Doe',
        email: 'jdoe@fnb.com',
        phone: '+1-555-0200',
        title: 'Managing Director',
      },
    });

    const parties = await store.listParties(deal.id);
    expect(parties).toHaveLength(2);

    // Step 3: Create initial version (Lender's draft)
    const version1 = await store.createVersion(deal.id, {
      creditLangCode: sampleCode.v1,
      versionLabel: "Lender's Initial Draft",
      authorParty: 'First National Bank',
      createdBy: 'jdoe@fnb.com',
    });

    expect(version1.versionNumber).toBe(1);
    expect(version1.status).toBe('draft');

    // Step 4: Transition deal to negotiation status
    const updatedDeal = await store.updateDeal(deal.id, { status: 'negotiation' });
    expect(updatedDeal.status).toBe('negotiation');

    // Step 5: Send version (mark as sent)
    const sentVersion = await store.updateVersion(version1.id, { status: 'sent' });
    expect(sentVersion.status).toBe('sent');

    // Step 6: Borrower receives and creates markup
    await store.updateVersion(version1.id, { status: 'received' });

    const version2 = await store.createVersion(deal.id, {
      creditLangCode: sampleCode.v2,
      versionLabel: "Borrower's Markup",
      authorParty: 'ABC Holdings',
      createdBy: 'jsmith@abc.com',
      parentVersionId: version1.id,
    });

    expect(version2.versionNumber).toBe(2);
    expect(version2.parentVersionId).toBe(version1.id);

    // Step 7: Compile states and diff
    const state1 = await compileToState(sampleCode.v1);
    const state2 = await compileToState(sampleCode.v2);
    const result = diffStates(state1, state2);

    expect(result.success).toBe(true);
    expect(result.diffs.length).toBeGreaterThan(0);
  });

  it('should track version lineage correctly', async () => {
    const deal = await store.createDeal({
      name: 'Lineage Test Deal',
      dealType: 'corporate',
      facilityAmount: 50_000_000,
      currency: 'USD',
      createdBy: 'test@test.com',
    });

    // Create chain of versions
    const v1 = await store.createVersion(deal.id, {
      creditLangCode: sampleCode.v1,
      versionLabel: 'v1',
      authorParty: 'Lender',
      createdBy: 'test@test.com',
    });

    const v2 = await store.createVersion(deal.id, {
      creditLangCode: sampleCode.v2,
      versionLabel: 'v2',
      authorParty: 'Borrower',
      createdBy: 'test@test.com',
      parentVersionId: v1.id,
    });

    const v3 = await store.createVersion(deal.id, {
      creditLangCode: sampleCode.v1, // Reverted
      versionLabel: 'v3',
      authorParty: 'Lender',
      createdBy: 'test@test.com',
      parentVersionId: v2.id,
    });

    // Verify lineage
    expect(v1.parentVersionId).toBeNull();
    expect(v2.parentVersionId).toBe(v1.id);
    expect(v3.parentVersionId).toBe(v2.id);

    // Verify version numbers
    expect(v1.versionNumber).toBe(1);
    expect(v2.versionNumber).toBe(2);
    expect(v3.versionNumber).toBe(3);
  });
});

// =============================================================================
// E2E: CLOSING WORKFLOW
// =============================================================================

describe('E2E: Closing Workflow', () => {
  beforeEach(() => {
    clearClosingData();
  });

  it('should complete a full closing cycle: CPs -> documents -> signatures -> readiness', () => {
    const dealId = 'deal-closing-test';
    const versionId = 'version-3';

    // Step 1: Create conditions precedent
    const cpCorp = createConditionPrecedent({
      dealId,
      versionId,
      sectionReference: '4.01(a)(i)',
      category: 'corporate_documents',
      title: 'Certificate of Incorporation',
      description: 'Certified copy of the Certificate of Incorporation',
      responsiblePartyId: 'party-borrower',
      dueDate: new Date('2026-02-10'),
    });

    const cpLegal = createConditionPrecedent({
      dealId,
      versionId,
      sectionReference: '4.01(e)(i)',
      category: 'legal_opinions',
      title: 'Legal Opinion',
      description: 'Legal opinion of borrower counsel',
      responsiblePartyId: 'party-counsel',
      dueDate: new Date('2026-02-14'),
    });

    const cpKyc = createConditionPrecedent({
      dealId,
      versionId,
      sectionReference: '4.01(h)(i)',
      category: 'kyc_aml',
      title: 'KYC Documentation',
      description: 'Know Your Customer documentation',
      responsiblePartyId: 'party-borrower',
      dueDate: new Date('2026-02-05'),
    });

    // Step 2: Create documents
    const docCert = createDocument({
      dealId,
      documentType: 'corporate',
      title: 'Certificate of Incorporation',
      fileName: 'cert_of_inc.pdf',
      fileType: 'application/pdf',
      responsiblePartyId: 'party-borrower',
      satisfiesConditionIds: [cpCorp.id],
    });

    const docCredit = createDocument({
      dealId,
      documentType: 'credit_agreement',
      title: 'Credit Agreement',
      fileName: 'credit_agreement.pdf',
      fileType: 'application/pdf',
      responsiblePartyId: 'party-counsel',
    });

    // Step 3: Add signatures to credit agreement
    const sigBorrower = addSignature({
      documentId: docCredit.id,
      partyId: 'party-borrower',
      signatoryName: 'Jane Smith',
      signatoryTitle: 'CEO',
    });

    const sigAgent = addSignature({
      documentId: docCredit.id,
      partyId: 'party-agent',
      signatoryName: 'John Doe',
      signatoryTitle: 'Managing Director',
    });

    // Step 4: Satisfy some conditions
    satisfyCondition(cpCorp.id, [docCert.id]);
    waiveCondition(cpKyc.id, 'party-agent', 'Existing customer, waived per policy');

    // Step 5: Process documents and signatures
    markDocumentUploaded(docCert.id, 'uploader@abc.com');
    requestSignature(sigBorrower!.id);
    requestSignature(sigAgent!.id);
    markSignatureSigned(sigBorrower!.id);

    // Step 6: Get and verify conditions
    const conditions = listConditionsPrecedent(dealId);
    expect(conditions).toHaveLength(3);

    const satisfiedCondition = conditions.find((c) => c.id === cpCorp.id);
    expect(satisfiedCondition?.status).toBe('satisfied');

    const waivedCondition = conditions.find((c) => c.id === cpKyc.id);
    expect(waivedCondition?.status).toBe('waived');

    // Step 7: Get and verify documents
    const documents = listDocuments(dealId);
    expect(documents).toHaveLength(2);

    // Step 8: Get closing checklist
    const checklist = getClosingChecklist(dealId, conditions, documents);
    expect(checklist.length).toBeGreaterThan(0);

    // Step 9: Complete remaining items
    satisfyCondition(cpLegal.id, []);
    markSignatureSigned(sigAgent!.id);
    markDocumentExecuted(docCredit.id);

    // Verify final state
    const finalConditions = listConditionsPrecedent(dealId);
    const allSatisfiedOrWaived = finalConditions.every(
      (c) => c.status === 'satisfied' || c.status === 'waived'
    );
    expect(allSatisfiedOrWaived).toBe(true);
  });

  it('should track overdue items correctly', () => {
    const dealId = 'deal-overdue-test';

    // Create a condition with past due date
    createConditionPrecedent({
      dealId,
      versionId: 'version-1',
      sectionReference: '4.01(a)',
      category: 'corporate_documents',
      title: 'Overdue Document',
      description: 'This is overdue',
      responsiblePartyId: 'party-1',
      dueDate: new Date('2026-01-01'), // Past due
    });

    const conditions = listConditionsPrecedent(dealId);
    expect(conditions).toHaveLength(1);

    // Check that it's still pending (overdue but not satisfied)
    expect(conditions[0].status).toBe('pending');
    expect(conditions[0].dueDate).toBeDefined();
    expect(new Date(conditions[0].dueDate!) < new Date()).toBe(true);
  });
});

// =============================================================================
// E2E: POST-CLOSING WORKFLOW
// =============================================================================

describe('E2E: Post-Closing Workflow', () => {
  beforeEach(() => {
    clearPostClosingData();
  });

  it('should complete a full post-closing cycle: submissions -> compliance -> draws -> scenarios', () => {
    const dealId = 'deal-post-closing-test';

    // Step 1: Submit quarterly financials
    const q1Submission = createFinancialSubmission({
      dealId,
      period: '2026-Q1',
      periodType: 'quarterly',
      periodEndDate: new Date('2026-03-31'),
      financialData: {
        revenue: 50_000_000,
        ebitda: 12_500_000,
        total_debt: 45_000_000,
        interest_expense: 3_000_000,
      },
      submittedBy: 'cfo@borrower.com',
    });

    expect(q1Submission.verificationStatus).toBe('pending');

    // Step 2: Agent verifies submission
    const verifiedSubmission = verifySubmission(q1Submission.id, 'agent@bank.com');
    expect(verifiedSubmission.verificationStatus).toBe('verified');

    // Step 3: Submit more periods for trending
    createFinancialSubmission({
      dealId,
      period: '2026-Q2',
      periodType: 'quarterly',
      periodEndDate: new Date('2026-06-30'),
      financialData: {
        revenue: 55_000_000,
        ebitda: 14_000_000,
        total_debt: 42_000_000,
        interest_expense: 2_800_000,
      },
      submittedBy: 'cfo@borrower.com',
    });

    const submissions = listFinancialSubmissions(dealId);
    expect(submissions).toHaveLength(2);

    // Step 4: Create a draw request
    const drawRequest = createDrawRequest({
      dealId,
      requestedAmount: 5_000_000,
      conditions: [
        { conditionId: 'draw-cp-1', title: 'Borrowing Base Certificate' },
        { conditionId: 'draw-cp-2', title: 'Compliance Certificate' },
      ],
    });

    expect(drawRequest.status).toBe('draft');
    expect(drawRequest.requestedAmount).toBe(5_000_000);

    // Step 5: Submit draw request
    submitDrawRequest(drawRequest.id);
    const draws = listDrawRequests(dealId);
    const submittedDraw = draws.find((d) => d.id === drawRequest.id);
    expect(submittedDraw?.status).toBe('submitted');

    // Step 6: Satisfy draw conditions (using conditionId)
    satisfyDrawCondition(drawRequest.id, 'draw-cp-1');
    satisfyDrawCondition(drawRequest.id, 'draw-cp-2');

    // Step 7: Approve and fund draw (second param is amount)
    approveDrawRequest(drawRequest.id, 5_000_000);
    const fundedDraw = fundDrawRequest(drawRequest.id, 5_000_000);
    expect(fundedDraw?.status).toBe('funded');

    // Step 8: Run scenario simulation with a covenant calculator
    const covenantCalculator = (financials: Record<string, number>) => {
      const leverage = (financials.total_debt ?? 0) / (financials.ebitda ?? 1);
      const coverage = (financials.ebitda ?? 0) / (financials.interest_expense ?? 1);
      return [
        {
          name: 'MaxLeverage',
          actual: leverage,
          threshold: 5.0,
          compliant: leverage <= 5.0,
          headroom: 5.0 - leverage,
        },
        {
          name: 'MinInterestCoverage',
          actual: coverage,
          threshold: 2.5,
          compliant: coverage >= 2.5,
          headroom: coverage - 2.5,
        },
      ];
    };

    const scenario = runScenario(
      {
        baseFinancials: {
          revenue: 55_000_000,
          ebitda: 14_000_000,
          total_debt: 42_000_000,
          interest_expense: 2_800_000,
        },
        adjustments: [{ field: 'revenue', type: 'percentage', value: -10 }],
        label: 'Revenue Stress Test',
      },
      covenantCalculator
    );

    expect(scenario.adjustedFinancials.revenue).toBe(49_500_000); // -10%
    expect(scenario.covenantResults).toHaveLength(2);
    expect(scenario.allCompliant).toBeDefined();
  });

  it('should track compliance history across periods', () => {
    const dealId = 'deal-compliance-history-test';

    // Create multiple period submissions
    const periods = ['2025-Q4', '2026-Q1', '2026-Q2', '2026-Q3'];
    const financialTrends = [
      { revenue: 40_000_000, ebitda: 10_000_000, total_debt: 50_000_000 },
      { revenue: 45_000_000, ebitda: 11_250_000, total_debt: 48_000_000 },
      { revenue: 50_000_000, ebitda: 12_500_000, total_debt: 45_000_000 },
      { revenue: 55_000_000, ebitda: 13_750_000, total_debt: 42_000_000 },
    ];

    periods.forEach((period, i) => {
      createFinancialSubmission({
        dealId,
        period,
        periodType: 'quarterly',
        periodEndDate: new Date(`2025-${(i + 1) * 3}-30`),
        financialData: financialTrends[i],
        submittedBy: 'cfo@borrower.com',
      });
    });

    const submissions = listFinancialSubmissions(dealId);
    expect(submissions).toHaveLength(4);

    // Verify they're sorted newest first (descending)
    expect(submissions[0].period).toBe('2026-Q3');
    expect(submissions[3].period).toBe('2025-Q4');
  });
});

// =============================================================================
// E2E: VERSIONING & DIFF WORKFLOW
// =============================================================================

describe('E2E: Versioning & Diff Workflow', () => {
  it('should compile, diff, and classify changes between versions', async () => {
    // Step 1: Compile both versions to state (async, returns Maps)
    const state1 = await compileToState(sampleCode.v1);
    const state2 = await compileToState(sampleCode.v2);

    expect(state1.covenants.size).toBe(1);
    expect(state1.baskets.size).toBe(1);
    expect(state1.definitions.size).toBe(3);

    // Step 2: Diff the states (returns {success, diffs})
    const result = diffStates(state1, state2);
    expect(result.success).toBe(true);
    expect(result.diffs.length).toBeGreaterThan(0);

    // Step 3: Classify each diff
    const classifiedChanges = result.diffs.map((diff) => classifyChange(diff));

    // Find the leverage covenant change
    const leverageChange = classifiedChanges.find(
      (c) => c.elementName === 'MaxLeverage' && c.changeType === 'modified'
    );
    expect(leverageChange).toBeDefined();
    expect(leverageChange?.impact).toBe('borrower_favorable'); // Threshold increased

    // Find the basket change
    const basketChange = classifiedChanges.find(
      (c) => c.elementName === 'GeneralInvestments' && c.changeType === 'modified'
    );
    expect(basketChange).toBeDefined();
    expect(basketChange?.impact).toBe('borrower_favorable'); // Capacity increased
  });

  it('should generate a complete change summary', async () => {
    const fromVersion = {
      id: 'v1',
      versionNumber: 1,
      creditLangCode: sampleCode.v1,
      authorParty: 'Lender',
      createdAt: new Date('2026-01-10'),
    };

    const toVersion = {
      id: 'v2',
      versionNumber: 2,
      creditLangCode: sampleCode.v2,
      authorParty: 'Borrower',
      createdAt: new Date('2026-01-15'),
    };

    const summary = await generateChangeSummary(fromVersion, toVersion);

    expect(summary.versionFrom).toBe(1);
    expect(summary.versionTo).toBe(2);
    expect(summary.authorParty).toBe('Borrower');
    expect(summary.totalChanges).toBeGreaterThan(0);
    expect(summary.changes).toHaveLength(summary.totalChanges);
  });
});

// =============================================================================
// E2E: FULL DEAL LIFECYCLE
// =============================================================================

describe('E2E: Full Deal Lifecycle', () => {
  let store: InstanceType<typeof InMemoryStore>;

  beforeEach(async () => {
    store = new InMemoryStore();
    clearClosingData();
    clearPostClosingData();
  });

  it('should transition through all deal statuses: draft -> negotiation -> closing -> active', async () => {
    // PHASE 1: Draft
    const deal = await store.createDeal({
      name: 'Full Lifecycle Test Deal',
      dealType: 'corporate',
      facilityAmount: 100_000_000,
      currency: 'USD',
      createdBy: 'test@test.com',
      targetClosingDate: new Date('2026-03-15'),
    });
    expect(deal.status).toBe('draft');

    // Add parties
    await store.addParty(deal.id, {
      name: 'Test Borrower',
      shortName: 'Borrower',
      role: PartyRole.BORROWER,
      partyType: 'borrower',
      primaryContact: { name: 'Test', email: 'test@test.com', phone: null, title: null },
    });

    // Create initial version
    await store.createVersion(deal.id, {
      creditLangCode: sampleCode.v1,
      versionLabel: 'Initial Draft',
      authorParty: 'Lender',
      createdBy: 'test@test.com',
    });

    // PHASE 2: Negotiation
    const negotiatingDeal = await store.updateDeal(deal.id, { status: 'negotiation' });
    expect(negotiatingDeal.status).toBe('negotiation');

    // Create markup
    const versions = await store.listVersions(deal.id);
    const currentVersion = versions[versions.length - 1];
    await store.createVersion(deal.id, {
      creditLangCode: sampleCode.v2,
      versionLabel: 'Borrower Markup',
      authorParty: 'Borrower',
      createdBy: 'test@test.com',
      parentVersionId: currentVersion.id,
    });

    // PHASE 3: Closing
    const closingDeal = await store.updateDeal(deal.id, { status: 'closing' });
    expect(closingDeal.status).toBe('closing');

    // Create closing CPs
    const cp = createConditionPrecedent({
      dealId: deal.id,
      versionId: 'test-version',
      sectionReference: '4.01(a)',
      category: 'corporate_documents',
      title: 'Test CP',
      description: 'Test condition',
      responsiblePartyId: 'party-1',
    });

    // Satisfy CP
    satisfyCondition(cp.id, []);

    const conditions = listConditionsPrecedent(deal.id);
    expect(conditions[0].status).toBe('satisfied');

    // PHASE 4: Active
    const activeDeal = await store.updateDeal(deal.id, { status: 'active' });
    expect(activeDeal.status).toBe('active');

    // Post-closing: Submit financials
    const submission = createFinancialSubmission({
      dealId: deal.id,
      period: '2026-Q2',
      periodType: 'quarterly',
      periodEndDate: new Date('2026-06-30'),
      financialData: { revenue: 25_000_000, ebitda: 6_000_000 },
      submittedBy: 'test@test.com',
    });

    expect(submission.dealId).toBe(deal.id);

    // Verify final state
    const finalDeal = await store.getDeal(deal.id);
    expect(finalDeal?.status).toBe('active');
  });
});
