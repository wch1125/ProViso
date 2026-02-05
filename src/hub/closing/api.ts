/**
 * ProViso Hub v2.0 — Closing API
 *
 * API functions for managing closing workflow:
 * - Conditions precedent
 * - Documents
 * - Signatures
 * - Readiness calculation
 */

import { generateId } from '../store.js';
import type {
  Deal,
  DealParty,
  ConditionPrecedent,
  Document,
  Signature,
} from '../types.js';
import {
  ConditionStatus,
  DocumentStatus,
} from '../../closing-enums.js';
import type {
  ClosingReadiness,
  OutstandingItem,
  CreateCPInput,
  UpdateCPInput,
  CreateDocumentInput,
  UpdateDocumentInput,
  CreateSignatureInput,
  UpdateSignatureInput,
  ClosingChecklistItem,
  SignatureBlock,
  SignatureStatusDetail,
} from './types.js';

// =============================================================================
// IN-MEMORY STORES (for MVP)
// =============================================================================

const conditionsStore = new Map<string, ConditionPrecedent>();
const documentsStore = new Map<string, Document>();

// =============================================================================
// CONDITIONS PRECEDENT OPERATIONS
// =============================================================================

/**
 * Create a new condition precedent.
 */
export function createConditionPrecedent(input: CreateCPInput): ConditionPrecedent {
  const cp: ConditionPrecedent = {
    id: generateId(),
    dealId: input.dealId,
    versionId: input.versionId,
    sectionReference: input.sectionReference,
    category: input.category,
    title: input.title,
    description: input.description,
    responsiblePartyId: input.responsiblePartyId,
    status: ConditionStatus.PENDING,
    dueDate: input.dueDate ?? null,
    satisfiedAt: null,
    satisfiedByDocumentIds: [],
    waivedAt: null,
    waiverApprovedBy: null,
    notes: input.notes ?? '',
  };

  conditionsStore.set(cp.id, cp);
  return cp;
}

/**
 * Get a condition precedent by ID.
 */
export function getConditionPrecedent(id: string): ConditionPrecedent | null {
  return conditionsStore.get(id) ?? null;
}

/**
 * List conditions precedent for a deal.
 */
export function listConditionsPrecedent(dealId: string): ConditionPrecedent[] {
  const results: ConditionPrecedent[] = [];
  for (const cp of conditionsStore.values()) {
    if (cp.dealId === dealId) {
      results.push(cp);
    }
  }
  return results;
}

/**
 * Update a condition precedent.
 */
export function updateConditionPrecedent(
  id: string,
  input: UpdateCPInput
): ConditionPrecedent | null {
  const cp = conditionsStore.get(id);
  if (!cp) return null;

  const updated: ConditionPrecedent = {
    ...cp,
    ...input,
  };

  conditionsStore.set(id, updated);
  return updated;
}

/**
 * Mark a condition as satisfied.
 */
export function satisfyCondition(
  id: string,
  documentIds: string[] = []
): ConditionPrecedent | null {
  return updateConditionPrecedent(id, {
    status: ConditionStatus.SATISFIED,
    satisfiedAt: new Date(),
    satisfiedByDocumentIds: documentIds,
  });
}

/**
 * Mark a condition as waived.
 */
export function waiveCondition(
  id: string,
  approvedBy: string
): ConditionPrecedent | null {
  return updateConditionPrecedent(id, {
    status: ConditionStatus.WAIVED,
    waivedAt: new Date(),
    waiverApprovedBy: approvedBy,
  });
}

/**
 * Delete a condition precedent.
 */
export function deleteConditionPrecedent(id: string): boolean {
  return conditionsStore.delete(id);
}

// =============================================================================
// DOCUMENT OPERATIONS
// =============================================================================

/**
 * Create a new document.
 */
export function createDocument(input: CreateDocumentInput): Document {
  const doc: Document = {
    id: generateId(),
    dealId: input.dealId,
    documentType: input.documentType,
    title: input.title,
    fileName: input.fileName,
    fileType: input.fileType,
    storagePath: input.storagePath,
    status: DocumentStatus.NOT_STARTED,
    responsiblePartyId: input.responsiblePartyId ?? null,
    uploadedAt: new Date(),
    uploadedBy: input.uploadedBy,
    dueDate: input.dueDate ?? null,
    signatures: [],
    satisfiesConditionIds: input.satisfiesConditionIds ?? [],
  };

  documentsStore.set(doc.id, doc);
  return doc;
}

/**
 * Get a document by ID.
 */
export function getDocument(id: string): Document | null {
  return documentsStore.get(id) ?? null;
}

/**
 * List documents for a deal.
 */
export function listDocuments(dealId: string): Document[] {
  const results: Document[] = [];
  for (const doc of documentsStore.values()) {
    if (doc.dealId === dealId) {
      results.push(doc);
    }
  }
  return results;
}

/**
 * Update a document.
 */
export function updateDocument(
  id: string,
  input: UpdateDocumentInput
): Document | null {
  const doc = documentsStore.get(id);
  if (!doc) return null;

  const updated: Document = {
    ...doc,
    ...input,
  };

  documentsStore.set(id, updated);
  return updated;
}

/**
 * Mark a document as uploaded/ready.
 */
export function markDocumentUploaded(id: string): Document | null {
  return updateDocument(id, {
    status: DocumentStatus.UPLOADED,
  });
}

/**
 * Mark a document as executed (all signatures obtained).
 */
export function markDocumentExecuted(id: string): Document | null {
  return updateDocument(id, {
    status: DocumentStatus.EXECUTED,
  });
}

/**
 * Delete a document.
 */
export function deleteDocument(id: string): boolean {
  return documentsStore.delete(id);
}

// =============================================================================
// SIGNATURE OPERATIONS
// =============================================================================

/**
 * Add a signature to a document.
 */
export function addSignature(input: CreateSignatureInput): Signature | null {
  const doc = documentsStore.get(input.documentId);
  if (!doc) return null;

  const signature: Signature = {
    id: generateId(),
    documentId: input.documentId,
    partyId: input.partyId,
    signatoryName: input.signatoryName,
    signatoryTitle: input.signatoryTitle,
    status: 'pending',
    signedAt: null,
  };

  doc.signatures.push(signature);
  documentsStore.set(doc.id, doc);

  return signature;
}

/**
 * Update a signature status.
 */
export function updateSignature(
  documentId: string,
  signatureId: string,
  input: UpdateSignatureInput
): Signature | null {
  const doc = documentsStore.get(documentId);
  if (!doc) return null;

  const sigIndex = doc.signatures.findIndex((s) => s.id === signatureId);
  if (sigIndex === -1) return null;

  const signature = doc.signatures[sigIndex];
  if (!signature) return null;

  const updated: Signature = {
    ...signature,
    ...input,
  };

  doc.signatures[sigIndex] = updated;
  documentsStore.set(doc.id, doc);

  return updated;
}

/**
 * Mark a signature as signed.
 */
export function markSignatureSigned(
  documentId: string,
  signatureId: string
): Signature | null {
  return updateSignature(documentId, signatureId, {
    status: 'signed',
    signedAt: new Date(),
  });
}

/**
 * Request a signature.
 */
export function requestSignature(
  documentId: string,
  signatureId: string
): Signature | null {
  return updateSignature(documentId, signatureId, {
    status: 'requested',
  });
}

/**
 * Get signature blocks for a deal's documents.
 */
export function getSignatureBlocks(
  dealId: string,
  parties: DealParty[]
): SignatureBlock[] {
  const docs = listDocuments(dealId);
  const partyMap = new Map(parties.map((p) => [p.id, p]));

  return docs
    .filter((doc) => doc.signatures.length > 0)
    .map((doc) => {
      const signatures: SignatureStatusDetail[] = doc.signatures.map((sig) => {
        const party = partyMap.get(sig.partyId);
        return {
          id: sig.id,
          partyId: sig.partyId,
          partyName: party?.name ?? 'Unknown',
          signatoryName: sig.signatoryName,
          signatoryTitle: sig.signatoryTitle,
          status: sig.status,
          signedAt: sig.signedAt,
        };
      });

      const signedCount = signatures.filter((s) => s.status === 'signed').length;
      const pendingCount = signatures.filter(
        (s) => s.status === 'pending' || s.status === 'requested'
      ).length;

      return {
        documentId: doc.id,
        documentTitle: doc.title,
        signatures,
        allSigned: signedCount === signatures.length,
        pendingCount,
        signedCount,
      };
    });
}

// =============================================================================
// READINESS CALCULATION
// =============================================================================

/**
 * Calculate closing readiness for a deal.
 */
export function calculateClosingReadiness(
  deal: Deal,
  parties: DealParty[]
): ClosingReadiness {
  const conditions = listConditionsPrecedent(deal.id);
  const documents = listDocuments(deal.id);
  const now = new Date();

  // Party lookup
  const partyMap = new Map(parties.map((p) => [p.id, p]));
  const getPartyName = (id: string) => partyMap.get(id)?.name ?? 'Unknown';

  // Count conditions by status
  const conditionStats = {
    total: conditions.length,
    satisfied: 0,
    pending: 0,
    waived: 0,
    overdue: 0,
  };

  for (const cp of conditions) {
    if (cp.status === ConditionStatus.SATISFIED) {
      conditionStats.satisfied++;
    } else if (cp.status === ConditionStatus.WAIVED) {
      conditionStats.waived++;
    } else {
      conditionStats.pending++;
      if (cp.dueDate && new Date(cp.dueDate) < now) {
        conditionStats.overdue++;
      }
    }
  }

  // Count documents by status
  const documentStats = {
    total: documents.length,
    uploaded: 0,
    pending: 0,
    overdue: 0,
  };

  for (const doc of documents) {
    if (doc.status === DocumentStatus.UPLOADED || doc.status === DocumentStatus.EXECUTED) {
      documentStats.uploaded++;
    } else {
      documentStats.pending++;
      if (doc.dueDate && new Date(doc.dueDate) < now) {
        documentStats.overdue++;
      }
    }
  }

  // Count signatures
  const signatureStats = {
    total: 0,
    signed: 0,
    pending: 0,
    requested: 0,
    declined: 0,
  };

  for (const doc of documents) {
    for (const sig of doc.signatures) {
      signatureStats.total++;
      switch (sig.status) {
        case 'signed':
          signatureStats.signed++;
          break;
        case 'requested':
          signatureStats.requested++;
          break;
        case 'declined':
          signatureStats.declined++;
          break;
        default:
          signatureStats.pending++;
      }
    }
  }

  // Calculate days until closing
  let daysUntilClosing: number | null = null;
  if (deal.targetClosingDate) {
    const target = new Date(deal.targetClosingDate);
    const diffMs = target.getTime() - now.getTime();
    daysUntilClosing = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  // Build outstanding items list
  const outstandingItems: OutstandingItem[] = [];
  const overdueItems: OutstandingItem[] = [];

  for (const cp of conditions) {
    if (cp.status !== ConditionStatus.SATISFIED && cp.status !== ConditionStatus.WAIVED) {
      const isOverdue = cp.dueDate ? new Date(cp.dueDate) < now : false;
      const item: OutstandingItem = {
        id: cp.id,
        type: 'condition',
        title: cp.title,
        responsibleParty: getPartyName(cp.responsiblePartyId),
        responsiblePartyId: cp.responsiblePartyId,
        dueDate: cp.dueDate,
        isOverdue,
        status: cp.status,
        priority: isOverdue ? 'high' : cp.dueDate ? 'medium' : 'low',
      };

      outstandingItems.push(item);
      if (isOverdue) {
        overdueItems.push(item);
      }
    }
  }

  for (const doc of documents) {
    if (doc.status !== DocumentStatus.UPLOADED && doc.status !== DocumentStatus.EXECUTED) {
      const isOverdue = doc.dueDate ? new Date(doc.dueDate) < now : false;
      const item: OutstandingItem = {
        id: doc.id,
        type: 'document',
        title: doc.title,
        responsibleParty: doc.responsiblePartyId
          ? getPartyName(doc.responsiblePartyId)
          : 'Unassigned',
        responsiblePartyId: doc.responsiblePartyId ?? '',
        dueDate: doc.dueDate,
        isOverdue,
        status: doc.status,
        priority: isOverdue ? 'high' : doc.dueDate ? 'medium' : 'low',
      };

      outstandingItems.push(item);
      if (isOverdue) {
        overdueItems.push(item);
      }
    }
  }

  // Sort outstanding items by priority and due date
  outstandingItems.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return a.dueDate ? -1 : 1;
  });

  // Calculate overall readiness percentage
  const totalItems =
    conditionStats.total + documentStats.total + signatureStats.total;
  const completedItems =
    conditionStats.satisfied +
    conditionStats.waived +
    documentStats.uploaded +
    signatureStats.signed;

  const readinessPercentage =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return {
    readinessPercentage,
    conditions: conditionStats,
    documents: documentStats,
    signatures: signatureStats,
    daysUntilClosing,
    targetClosingDate: deal.targetClosingDate,
    outstandingItems,
    overdueItems,
  };
}

/**
 * Get closing checklist items for a deal.
 */
export function getClosingChecklist(
  dealId: string,
  parties: DealParty[]
): ClosingChecklistItem[] {
  const conditions = listConditionsPrecedent(dealId);
  const documents = listDocuments(dealId);
  const now = new Date();

  const partyMap = new Map(parties.map((p) => [p.id, p]));
  const getPartyName = (id: string) => partyMap.get(id)?.name ?? 'Unknown';

  const items: ClosingChecklistItem[] = [];

  // Add conditions
  for (const cp of conditions) {
    items.push({
      id: cp.id,
      type: 'condition',
      title: cp.title,
      description: cp.description,
      category: cp.category,
      sectionReference: cp.sectionReference,
      responsiblePartyId: cp.responsiblePartyId,
      responsiblePartyName: getPartyName(cp.responsiblePartyId),
      status: cp.status,
      dueDate: cp.dueDate,
      completedAt: cp.satisfiedAt ?? cp.waivedAt ?? null,
      isOverdue:
        cp.status !== ConditionStatus.SATISFIED &&
        cp.status !== ConditionStatus.WAIVED &&
        cp.dueDate !== null &&
        new Date(cp.dueDate) < now,
      linkedDocuments: cp.satisfiedByDocumentIds,
      linkedConditions: [],
    });
  }

  // Add documents
  for (const doc of documents) {
    items.push({
      id: doc.id,
      type: 'document',
      title: doc.title,
      description: doc.fileName,
      category: doc.documentType,
      sectionReference: null,
      responsiblePartyId: doc.responsiblePartyId ?? '',
      responsiblePartyName: doc.responsiblePartyId
        ? getPartyName(doc.responsiblePartyId)
        : 'Unassigned',
      status: doc.status,
      dueDate: doc.dueDate,
      completedAt:
        doc.status === DocumentStatus.UPLOADED || doc.status === DocumentStatus.EXECUTED
          ? doc.uploadedAt
          : null,
      isOverdue:
        doc.status !== DocumentStatus.UPLOADED &&
        doc.status !== DocumentStatus.EXECUTED &&
        doc.dueDate !== null &&
        new Date(doc.dueDate) < now,
      linkedDocuments: [],
      linkedConditions: doc.satisfiesConditionIds,
    });
  }

  return items;
}

// =============================================================================
// STORE MANAGEMENT (for testing)
// =============================================================================

/**
 * Clear all closing data (for testing).
 */
export function clearClosingData(): void {
  conditionsStore.clear();
  documentsStore.clear();
}

/**
 * Load conditions and documents from arrays (for demo/testing).
 */
export function loadClosingData(
  conditions: ConditionPrecedent[],
  documents: Document[]
): void {
  for (const cp of conditions) {
    conditionsStore.set(cp.id, cp);
  }
  for (const doc of documents) {
    documentsStore.set(doc.id, doc);
  }
}
