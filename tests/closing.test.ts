/**
 * ProViso Hub v2.0 — Closing Module Tests
 *
 * Tests for conditions precedent, documents, signatures, and readiness calculation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createConditionPrecedent,
  getConditionPrecedent,
  listConditionsPrecedent,
  updateConditionPrecedent,
  satisfyCondition,
  waiveCondition,
  deleteConditionPrecedent,
  createDocument,
  getDocument,
  listDocuments,
  updateDocument,
  markDocumentUploaded,
  markDocumentExecuted,
  deleteDocument,
  addSignature,
  updateSignature,
  markSignatureSigned,
  requestSignature,
  getSignatureBlocks,
  calculateClosingReadiness,
  getClosingChecklist,
  clearClosingData,
} from '../src/hub/closing/api.js';
import type { Deal, DealParty } from '../src/hub/types.js';

// =============================================================================
// TEST SETUP
// =============================================================================

const mockDeal: Deal = {
  id: 'deal-test-1',
  name: 'Test Acquisition Facility',
  facilityAmount: 100_000_000,
  currency: 'USD',
  status: 'closing',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  targetClosingDate: new Date('2026-02-15'),
  borrowerName: 'Test Borrower Inc.',
  agentName: 'Test Bank',
  versions: [],
};

const mockParties: DealParty[] = [
  {
    id: 'party-1',
    dealId: 'deal-test-1',
    name: 'Test Borrower Inc.',
    shortName: 'Borrower',
    role: 'borrower',
    partyType: 'borrower',
  },
  {
    id: 'party-2',
    dealId: 'deal-test-1',
    name: 'Test Bank',
    shortName: 'Agent',
    role: 'administrative_agent',
    partyType: 'agent',
  },
  {
    id: 'party-3',
    dealId: 'deal-test-1',
    name: 'Lender Corp',
    shortName: 'Lender 1',
    role: 'lender',
    partyType: 'lender',
  },
];

describe('Closing Module', () => {
  beforeEach(() => {
    clearClosingData();
  });

  // ===========================================================================
  // CONDITIONS PRECEDENT TESTS
  // ===========================================================================

  describe('Conditions Precedent', () => {
    it('should create a condition precedent', () => {
      const cp = createConditionPrecedent({
        dealId: 'deal-test-1',
        versionId: 'version-1',
        sectionReference: '4.01(a)(i)',
        category: 'corporate_documents',
        title: 'Certificate of Incorporation',
        description: 'Certified copy of the Certificate of Incorporation',
        responsiblePartyId: 'party-1',
      });

      expect(cp).toBeDefined();
      expect(cp.id).toBeDefined();
      expect(cp.title).toBe('Certificate of Incorporation');
      expect(cp.status).toBe('pending');
      expect(cp.satisfiedAt).toBeNull();
    });

    it('should get a condition precedent by ID', () => {
      const created = createConditionPrecedent({
        dealId: 'deal-test-1',
        versionId: 'version-1',
        sectionReference: '4.01(a)(i)',
        category: 'corporate_documents',
        title: 'Certificate of Incorporation',
        description: 'Certified copy',
        responsiblePartyId: 'party-1',
      });

      const retrieved = getConditionPrecedent(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.title).toBe('Certificate of Incorporation');
    });

    it('should return null for non-existent condition', () => {
      const result = getConditionPrecedent('non-existent-id');
      expect(result).toBeNull();
    });

    it('should list conditions for a deal', () => {
      createConditionPrecedent({
        dealId: 'deal-test-1',
        versionId: 'version-1',
        sectionReference: '4.01(a)(i)',
        category: 'corporate_documents',
        title: 'Certificate of Incorporation',
        description: 'Certified copy',
        responsiblePartyId: 'party-1',
      });

      createConditionPrecedent({
        dealId: 'deal-test-1',
        versionId: 'version-1',
        sectionReference: '4.01(a)(ii)',
        category: 'corporate_documents',
        title: 'Bylaws',
        description: 'Certified copy of Bylaws',
        responsiblePartyId: 'party-1',
      });

      createConditionPrecedent({
        dealId: 'deal-other',
        versionId: 'version-1',
        sectionReference: '4.01(a)(i)',
        category: 'corporate_documents',
        title: 'Other Deal CP',
        description: 'Should not be in list',
        responsiblePartyId: 'party-1',
      });

      const conditions = listConditionsPrecedent('deal-test-1');
      expect(conditions.length).toBe(2);
    });

    it('should update a condition precedent', () => {
      const created = createConditionPrecedent({
        dealId: 'deal-test-1',
        versionId: 'version-1',
        sectionReference: '4.01(a)(i)',
        category: 'corporate_documents',
        title: 'Certificate of Incorporation',
        description: 'Certified copy',
        responsiblePartyId: 'party-1',
      });

      const updated = updateConditionPrecedent(created.id, {
        title: 'Updated Title',
        notes: 'Updated notes',
      });

      expect(updated).toBeDefined();
      expect(updated?.title).toBe('Updated Title');
      expect(updated?.notes).toBe('Updated notes');
    });

    it('should mark a condition as satisfied', () => {
      const created = createConditionPrecedent({
        dealId: 'deal-test-1',
        versionId: 'version-1',
        sectionReference: '4.01(a)(i)',
        category: 'corporate_documents',
        title: 'Certificate of Incorporation',
        description: 'Certified copy',
        responsiblePartyId: 'party-1',
      });

      const satisfied = satisfyCondition(created.id, ['doc-1', 'doc-2']);

      expect(satisfied).toBeDefined();
      expect(satisfied?.status).toBe('satisfied');
      expect(satisfied?.satisfiedAt).toBeDefined();
      expect(satisfied?.satisfiedByDocumentIds).toEqual(['doc-1', 'doc-2']);
    });

    it('should mark a condition as waived', () => {
      const created = createConditionPrecedent({
        dealId: 'deal-test-1',
        versionId: 'version-1',
        sectionReference: '4.01(a)(i)',
        category: 'corporate_documents',
        title: 'Certificate of Incorporation',
        description: 'Certified copy',
        responsiblePartyId: 'party-1',
      });

      const waived = waiveCondition(created.id, 'admin@bank.com');

      expect(waived).toBeDefined();
      expect(waived?.status).toBe('waived');
      expect(waived?.waivedAt).toBeDefined();
      expect(waived?.waiverApprovedBy).toBe('admin@bank.com');
    });

    it('should delete a condition precedent', () => {
      const created = createConditionPrecedent({
        dealId: 'deal-test-1',
        versionId: 'version-1',
        sectionReference: '4.01(a)(i)',
        category: 'corporate_documents',
        title: 'Certificate of Incorporation',
        description: 'Certified copy',
        responsiblePartyId: 'party-1',
      });

      const deleted = deleteConditionPrecedent(created.id);
      expect(deleted).toBe(true);

      const retrieved = getConditionPrecedent(created.id);
      expect(retrieved).toBeNull();
    });

    it('should create condition with due date', () => {
      const dueDate = new Date('2026-02-10');
      const cp = createConditionPrecedent({
        dealId: 'deal-test-1',
        versionId: 'version-1',
        sectionReference: '4.01(a)(i)',
        category: 'corporate_documents',
        title: 'Certificate of Incorporation',
        description: 'Certified copy',
        responsiblePartyId: 'party-1',
        dueDate,
      });

      expect(cp.dueDate).toEqual(dueDate);
    });
  });

  // ===========================================================================
  // DOCUMENT TESTS
  // ===========================================================================

  describe('Documents', () => {
    it('should create a document', () => {
      const doc = createDocument({
        dealId: 'deal-test-1',
        documentType: 'corporate',
        title: 'Certificate of Incorporation',
        fileName: 'cert_of_inc.pdf',
        fileType: 'application/pdf',
        storagePath: '/documents/cert_of_inc.pdf',
        uploadedBy: 'john@borrower.com',
      });

      expect(doc).toBeDefined();
      expect(doc.id).toBeDefined();
      expect(doc.title).toBe('Certificate of Incorporation');
      expect(doc.status).toBe('not_started');
      expect(doc.signatures).toEqual([]);
    });

    it('should get a document by ID', () => {
      const created = createDocument({
        dealId: 'deal-test-1',
        documentType: 'corporate',
        title: 'Certificate of Incorporation',
        fileName: 'cert_of_inc.pdf',
        fileType: 'application/pdf',
        storagePath: '/documents/cert_of_inc.pdf',
        uploadedBy: 'john@borrower.com',
      });

      const retrieved = getDocument(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.title).toBe('Certificate of Incorporation');
    });

    it('should return null for non-existent document', () => {
      const result = getDocument('non-existent-id');
      expect(result).toBeNull();
    });

    it('should list documents for a deal', () => {
      createDocument({
        dealId: 'deal-test-1',
        documentType: 'corporate',
        title: 'Certificate of Incorporation',
        fileName: 'cert_of_inc.pdf',
        fileType: 'application/pdf',
        storagePath: '/documents/cert_of_inc.pdf',
        uploadedBy: 'john@borrower.com',
      });

      createDocument({
        dealId: 'deal-test-1',
        documentType: 'corporate',
        title: 'Bylaws',
        fileName: 'bylaws.pdf',
        fileType: 'application/pdf',
        storagePath: '/documents/bylaws.pdf',
        uploadedBy: 'john@borrower.com',
      });

      createDocument({
        dealId: 'deal-other',
        documentType: 'corporate',
        title: 'Other Deal Doc',
        fileName: 'other.pdf',
        fileType: 'application/pdf',
        storagePath: '/documents/other.pdf',
        uploadedBy: 'other@other.com',
      });

      const documents = listDocuments('deal-test-1');
      expect(documents.length).toBe(2);
    });

    it('should update a document', () => {
      const created = createDocument({
        dealId: 'deal-test-1',
        documentType: 'corporate',
        title: 'Certificate of Incorporation',
        fileName: 'cert_of_inc.pdf',
        fileType: 'application/pdf',
        storagePath: '/documents/cert_of_inc.pdf',
        uploadedBy: 'john@borrower.com',
      });

      const updated = updateDocument(created.id, {
        title: 'Updated Document Title',
      });

      expect(updated).toBeDefined();
      expect(updated?.title).toBe('Updated Document Title');
    });

    it('should mark a document as uploaded', () => {
      const created = createDocument({
        dealId: 'deal-test-1',
        documentType: 'corporate',
        title: 'Certificate of Incorporation',
        fileName: 'cert_of_inc.pdf',
        fileType: 'application/pdf',
        storagePath: '/documents/cert_of_inc.pdf',
        uploadedBy: 'john@borrower.com',
      });

      const uploaded = markDocumentUploaded(created.id);

      expect(uploaded).toBeDefined();
      expect(uploaded?.status).toBe('uploaded');
    });

    it('should mark a document as executed', () => {
      const created = createDocument({
        dealId: 'deal-test-1',
        documentType: 'credit_agreement',
        title: 'Credit Agreement',
        fileName: 'credit_agreement.pdf',
        fileType: 'application/pdf',
        storagePath: '/documents/credit_agreement.pdf',
        uploadedBy: 'partner@lawfirm.com',
      });

      const executed = markDocumentExecuted(created.id);

      expect(executed).toBeDefined();
      expect(executed?.status).toBe('executed');
    });

    it('should delete a document', () => {
      const created = createDocument({
        dealId: 'deal-test-1',
        documentType: 'corporate',
        title: 'Certificate of Incorporation',
        fileName: 'cert_of_inc.pdf',
        fileType: 'application/pdf',
        storagePath: '/documents/cert_of_inc.pdf',
        uploadedBy: 'john@borrower.com',
      });

      const deleted = deleteDocument(created.id);
      expect(deleted).toBe(true);

      const retrieved = getDocument(created.id);
      expect(retrieved).toBeNull();
    });

    it('should create document with linked conditions', () => {
      const doc = createDocument({
        dealId: 'deal-test-1',
        documentType: 'corporate',
        title: 'Certificate of Incorporation',
        fileName: 'cert_of_inc.pdf',
        fileType: 'application/pdf',
        storagePath: '/documents/cert_of_inc.pdf',
        uploadedBy: 'john@borrower.com',
        satisfiesConditionIds: ['cp-1', 'cp-2'],
      });

      expect(doc.satisfiesConditionIds).toEqual(['cp-1', 'cp-2']);
    });
  });

  // ===========================================================================
  // SIGNATURE TESTS
  // ===========================================================================

  describe('Signatures', () => {
    it('should add a signature to a document', () => {
      const doc = createDocument({
        dealId: 'deal-test-1',
        documentType: 'credit_agreement',
        title: 'Credit Agreement',
        fileName: 'credit_agreement.pdf',
        fileType: 'application/pdf',
        storagePath: '/documents/credit_agreement.pdf',
        uploadedBy: 'partner@lawfirm.com',
      });

      const signature = addSignature({
        documentId: doc.id,
        partyId: 'party-1',
        signatoryName: 'John Smith',
        signatoryTitle: 'CEO',
      });

      expect(signature).toBeDefined();
      expect(signature?.id).toBeDefined();
      expect(signature?.signatoryName).toBe('John Smith');
      expect(signature?.status).toBe('pending');
    });

    it('should return null when adding signature to non-existent document', () => {
      const result = addSignature({
        documentId: 'non-existent',
        partyId: 'party-1',
        signatoryName: 'John Smith',
        signatoryTitle: 'CEO',
      });

      expect(result).toBeNull();
    });

    it('should update a signature status', () => {
      const doc = createDocument({
        dealId: 'deal-test-1',
        documentType: 'credit_agreement',
        title: 'Credit Agreement',
        fileName: 'credit_agreement.pdf',
        fileType: 'application/pdf',
        storagePath: '/documents/credit_agreement.pdf',
        uploadedBy: 'partner@lawfirm.com',
      });

      const signature = addSignature({
        documentId: doc.id,
        partyId: 'party-1',
        signatoryName: 'John Smith',
        signatoryTitle: 'CEO',
      });

      const updated = updateSignature(doc.id, signature!.id, {
        signatoryTitle: 'President & CEO',
      });

      expect(updated).toBeDefined();
      expect(updated?.signatoryTitle).toBe('President & CEO');
    });

    it('should mark a signature as signed', () => {
      const doc = createDocument({
        dealId: 'deal-test-1',
        documentType: 'credit_agreement',
        title: 'Credit Agreement',
        fileName: 'credit_agreement.pdf',
        fileType: 'application/pdf',
        storagePath: '/documents/credit_agreement.pdf',
        uploadedBy: 'partner@lawfirm.com',
      });

      const signature = addSignature({
        documentId: doc.id,
        partyId: 'party-1',
        signatoryName: 'John Smith',
        signatoryTitle: 'CEO',
      });

      const signed = markSignatureSigned(doc.id, signature!.id);

      expect(signed).toBeDefined();
      expect(signed?.status).toBe('signed');
      expect(signed?.signedAt).toBeDefined();
    });

    it('should request a signature', () => {
      const doc = createDocument({
        dealId: 'deal-test-1',
        documentType: 'credit_agreement',
        title: 'Credit Agreement',
        fileName: 'credit_agreement.pdf',
        fileType: 'application/pdf',
        storagePath: '/documents/credit_agreement.pdf',
        uploadedBy: 'partner@lawfirm.com',
      });

      const signature = addSignature({
        documentId: doc.id,
        partyId: 'party-1',
        signatoryName: 'John Smith',
        signatoryTitle: 'CEO',
      });

      const requested = requestSignature(doc.id, signature!.id);

      expect(requested).toBeDefined();
      expect(requested?.status).toBe('requested');
    });

    it('should get signature blocks for a deal', () => {
      const doc = createDocument({
        dealId: 'deal-test-1',
        documentType: 'credit_agreement',
        title: 'Credit Agreement',
        fileName: 'credit_agreement.pdf',
        fileType: 'application/pdf',
        storagePath: '/documents/credit_agreement.pdf',
        uploadedBy: 'partner@lawfirm.com',
      });

      const sig1 = addSignature({
        documentId: doc.id,
        partyId: 'party-1',
        signatoryName: 'John Smith',
        signatoryTitle: 'CEO',
      });
      markSignatureSigned(doc.id, sig1!.id);

      addSignature({
        documentId: doc.id,
        partyId: 'party-2',
        signatoryName: 'Sarah Johnson',
        signatoryTitle: 'Managing Director',
      });

      const blocks = getSignatureBlocks('deal-test-1', mockParties);

      expect(blocks.length).toBe(1);
      expect(blocks[0]?.documentTitle).toBe('Credit Agreement');
      expect(blocks[0]?.signedCount).toBe(1);
      expect(blocks[0]?.pendingCount).toBe(1);
      expect(blocks[0]?.allSigned).toBe(false);
    });
  });

  // ===========================================================================
  // READINESS CALCULATION TESTS
  // ===========================================================================

  describe('Closing Readiness', () => {
    it('should calculate readiness with no items', () => {
      const readiness = calculateClosingReadiness(mockDeal, mockParties);

      expect(readiness.readinessPercentage).toBe(0);
      expect(readiness.conditions.total).toBe(0);
      expect(readiness.documents.total).toBe(0);
      expect(readiness.signatures.total).toBe(0);
    });

    it('should calculate readiness with pending items', () => {
      createConditionPrecedent({
        dealId: 'deal-test-1',
        versionId: 'version-1',
        sectionReference: '4.01(a)(i)',
        category: 'corporate_documents',
        title: 'Certificate of Incorporation',
        description: 'Certified copy',
        responsiblePartyId: 'party-1',
      });

      createDocument({
        dealId: 'deal-test-1',
        documentType: 'corporate',
        title: 'Certificate of Incorporation',
        fileName: 'cert_of_inc.pdf',
        fileType: 'application/pdf',
        storagePath: '/documents/cert_of_inc.pdf',
        uploadedBy: 'john@borrower.com',
      });

      const readiness = calculateClosingReadiness(mockDeal, mockParties);

      expect(readiness.readinessPercentage).toBe(0);
      expect(readiness.conditions.pending).toBe(1);
      expect(readiness.documents.pending).toBe(1);
    });

    it('should calculate readiness with satisfied items', () => {
      const cp = createConditionPrecedent({
        dealId: 'deal-test-1',
        versionId: 'version-1',
        sectionReference: '4.01(a)(i)',
        category: 'corporate_documents',
        title: 'Certificate of Incorporation',
        description: 'Certified copy',
        responsiblePartyId: 'party-1',
      });
      satisfyCondition(cp.id);

      const doc = createDocument({
        dealId: 'deal-test-1',
        documentType: 'corporate',
        title: 'Certificate of Incorporation',
        fileName: 'cert_of_inc.pdf',
        fileType: 'application/pdf',
        storagePath: '/documents/cert_of_inc.pdf',
        uploadedBy: 'john@borrower.com',
      });
      markDocumentUploaded(doc.id);

      const readiness = calculateClosingReadiness(mockDeal, mockParties);

      expect(readiness.readinessPercentage).toBe(100);
      expect(readiness.conditions.satisfied).toBe(1);
      expect(readiness.documents.uploaded).toBe(1);
    });

    it('should identify overdue items', () => {
      createConditionPrecedent({
        dealId: 'deal-test-1',
        versionId: 'version-1',
        sectionReference: '4.01(a)(i)',
        category: 'corporate_documents',
        title: 'Certificate of Incorporation',
        description: 'Certified copy',
        responsiblePartyId: 'party-1',
        dueDate: new Date('2020-01-01'), // Past date
      });

      const readiness = calculateClosingReadiness(mockDeal, mockParties);

      expect(readiness.conditions.overdue).toBe(1);
      expect(readiness.overdueItems.length).toBe(1);
    });

    it('should calculate days until closing', () => {
      const readiness = calculateClosingReadiness(mockDeal, mockParties);

      expect(readiness.daysUntilClosing).toBeDefined();
      expect(readiness.targetClosingDate).toBeDefined();
    });

    it('should prioritize outstanding items correctly', () => {
      // Create an overdue item
      createConditionPrecedent({
        dealId: 'deal-test-1',
        versionId: 'version-1',
        sectionReference: '4.01(a)(i)',
        category: 'corporate_documents',
        title: 'Overdue Condition',
        description: 'Overdue item',
        responsiblePartyId: 'party-1',
        dueDate: new Date('2020-01-01'),
      });

      // Create a future item
      createConditionPrecedent({
        dealId: 'deal-test-1',
        versionId: 'version-1',
        sectionReference: '4.01(a)(ii)',
        category: 'corporate_documents',
        title: 'Future Condition',
        description: 'Future item',
        responsiblePartyId: 'party-1',
        dueDate: new Date('2030-01-01'),
      });

      const readiness = calculateClosingReadiness(mockDeal, mockParties);

      expect(readiness.outstandingItems.length).toBe(2);
      expect(readiness.outstandingItems[0]?.title).toBe('Overdue Condition');
      expect(readiness.outstandingItems[0]?.priority).toBe('high');
      expect(readiness.outstandingItems[1]?.priority).toBe('medium');
    });

    it('should count waived conditions as complete', () => {
      const cp = createConditionPrecedent({
        dealId: 'deal-test-1',
        versionId: 'version-1',
        sectionReference: '4.01(a)(i)',
        category: 'corporate_documents',
        title: 'Waived Condition',
        description: 'This will be waived',
        responsiblePartyId: 'party-1',
      });
      waiveCondition(cp.id, 'admin@bank.com');

      const readiness = calculateClosingReadiness(mockDeal, mockParties);

      expect(readiness.conditions.waived).toBe(1);
      expect(readiness.readinessPercentage).toBe(100);
    });

    it('should count signatures in readiness', () => {
      const doc = createDocument({
        dealId: 'deal-test-1',
        documentType: 'credit_agreement',
        title: 'Credit Agreement',
        fileName: 'credit_agreement.pdf',
        fileType: 'application/pdf',
        storagePath: '/documents/credit_agreement.pdf',
        uploadedBy: 'partner@lawfirm.com',
      });

      const sig1 = addSignature({
        documentId: doc.id,
        partyId: 'party-1',
        signatoryName: 'John Smith',
        signatoryTitle: 'CEO',
      });
      markSignatureSigned(doc.id, sig1!.id);

      addSignature({
        documentId: doc.id,
        partyId: 'party-2',
        signatoryName: 'Sarah Johnson',
        signatoryTitle: 'Managing Director',
      });

      const readiness = calculateClosingReadiness(mockDeal, mockParties);

      expect(readiness.signatures.total).toBe(2);
      expect(readiness.signatures.signed).toBe(1);
      expect(readiness.signatures.pending).toBe(1);
    });
  });

  // ===========================================================================
  // CLOSING CHECKLIST TESTS
  // ===========================================================================

  describe('Closing Checklist', () => {
    it('should return empty checklist for empty deal', () => {
      const checklist = getClosingChecklist('deal-test-1', mockParties);
      expect(checklist.length).toBe(0);
    });

    it('should include conditions in checklist', () => {
      createConditionPrecedent({
        dealId: 'deal-test-1',
        versionId: 'version-1',
        sectionReference: '4.01(a)(i)',
        category: 'corporate_documents',
        title: 'Certificate of Incorporation',
        description: 'Certified copy',
        responsiblePartyId: 'party-1',
      });

      const checklist = getClosingChecklist('deal-test-1', mockParties);

      expect(checklist.length).toBe(1);
      expect(checklist[0]?.type).toBe('condition');
      expect(checklist[0]?.title).toBe('Certificate of Incorporation');
      expect(checklist[0]?.responsiblePartyName).toBe('Test Borrower Inc.');
    });

    it('should include documents in checklist', () => {
      createDocument({
        dealId: 'deal-test-1',
        documentType: 'corporate',
        title: 'Certificate of Incorporation',
        fileName: 'cert_of_inc.pdf',
        fileType: 'application/pdf',
        storagePath: '/documents/cert_of_inc.pdf',
        uploadedBy: 'john@borrower.com',
        responsiblePartyId: 'party-1',
      });

      const checklist = getClosingChecklist('deal-test-1', mockParties);

      expect(checklist.length).toBe(1);
      expect(checklist[0]?.type).toBe('document');
      expect(checklist[0]?.title).toBe('Certificate of Incorporation');
    });

    it('should mark overdue items correctly', () => {
      createConditionPrecedent({
        dealId: 'deal-test-1',
        versionId: 'version-1',
        sectionReference: '4.01(a)(i)',
        category: 'corporate_documents',
        title: 'Overdue Condition',
        description: 'This is overdue',
        responsiblePartyId: 'party-1',
        dueDate: new Date('2020-01-01'),
      });

      const checklist = getClosingChecklist('deal-test-1', mockParties);

      expect(checklist[0]?.isOverdue).toBe(true);
    });

    it('should include linked documents for conditions', () => {
      const cp = createConditionPrecedent({
        dealId: 'deal-test-1',
        versionId: 'version-1',
        sectionReference: '4.01(a)(i)',
        category: 'corporate_documents',
        title: 'Certificate of Incorporation',
        description: 'Certified copy',
        responsiblePartyId: 'party-1',
      });
      satisfyCondition(cp.id, ['doc-1', 'doc-2']);

      const checklist = getClosingChecklist('deal-test-1', mockParties);

      expect(checklist[0]?.linkedDocuments).toEqual(['doc-1', 'doc-2']);
    });

    it('should include linked conditions for documents', () => {
      createDocument({
        dealId: 'deal-test-1',
        documentType: 'corporate',
        title: 'Certificate of Incorporation',
        fileName: 'cert_of_inc.pdf',
        fileType: 'application/pdf',
        storagePath: '/documents/cert_of_inc.pdf',
        uploadedBy: 'john@borrower.com',
        satisfiesConditionIds: ['cp-1', 'cp-2'],
      });

      const checklist = getClosingChecklist('deal-test-1', mockParties);

      expect(checklist[0]?.linkedConditions).toEqual(['cp-1', 'cp-2']);
    });
  });
});
