/**
 * ProViso Hub v2.0 — Closing Module Types
 *
 * Additional types specific to the closing dashboard and workflow.
 */

import type {
  CPCategory,
  SignatureStatus as SignatureStatusType,
} from '../types.js';
import type { ConditionStatus, DocumentStatus, DocumentType } from '../../closing-enums.js';

// =============================================================================
// CLOSING READINESS
// =============================================================================

/**
 * Overall closing readiness summary.
 */
export interface ClosingReadiness {
  /** Overall readiness percentage (0-100) */
  readinessPercentage: number;

  /** Conditions precedent summary */
  conditions: {
    total: number;
    satisfied: number;
    pending: number;
    waived: number;
    overdue: number;
  };

  /** Documents summary */
  documents: {
    total: number;
    uploaded: number;
    pending: number;
    overdue: number;
  };

  /** Signatures summary */
  signatures: {
    total: number;
    signed: number;
    pending: number;
    requested: number;
    declined: number;
  };

  /** Days until target closing */
  daysUntilClosing: number | null;

  /** Target closing date */
  targetClosingDate: Date | null;

  /** List of outstanding items (not yet satisfied/uploaded/signed) */
  outstandingItems: OutstandingItem[];

  /** List of overdue items */
  overdueItems: OutstandingItem[];
}

/**
 * An outstanding item that needs attention before closing.
 */
export interface OutstandingItem {
  id: string;
  type: 'condition' | 'document' | 'signature';
  title: string;
  responsibleParty: string;
  responsiblePartyId: string;
  dueDate: Date | null;
  isOverdue: boolean;
  status: string;
  priority: 'high' | 'medium' | 'low';
}

// =============================================================================
// INPUT TYPES
// =============================================================================

/**
 * Input for creating a condition precedent.
 */
export interface CreateCPInput {
  dealId: string;
  versionId: string;
  sectionReference: string;
  category: CPCategory;
  title: string;
  description: string;
  responsiblePartyId: string;
  dueDate?: Date | null;
  notes?: string;
}

/**
 * Input for updating a condition precedent.
 */
export interface UpdateCPInput {
  title?: string;
  description?: string;
  responsiblePartyId?: string;
  status?: ConditionStatus;
  dueDate?: Date | null;
  satisfiedAt?: Date | null;
  satisfiedByDocumentIds?: string[];
  waivedAt?: Date | null;
  waiverApprovedBy?: string | null;
  notes?: string;
}

/**
 * Input for creating a document.
 */
export interface CreateDocumentInput {
  dealId: string;
  documentType: DocumentType;
  title: string;
  fileName: string;
  fileType: string;
  storagePath: string;
  responsiblePartyId?: string | null;
  uploadedBy: string;
  dueDate?: Date | null;
  satisfiesConditionIds?: string[];
}

/**
 * Input for updating a document.
 */
export interface UpdateDocumentInput {
  title?: string;
  status?: DocumentStatus;
  responsiblePartyId?: string | null;
  dueDate?: Date | null;
  satisfiesConditionIds?: string[];
}

/**
 * Input for creating a signature.
 */
export interface CreateSignatureInput {
  documentId: string;
  partyId: string;
  signatoryName: string;
  signatoryTitle: string;
}

/**
 * Input for updating a signature.
 */
export interface UpdateSignatureInput {
  signatoryName?: string;
  signatoryTitle?: string;
  status?: SignatureStatusType;
  signedAt?: Date | null;
}

// =============================================================================
// CLOSING CHECKLIST ITEM
// =============================================================================

/**
 * A unified view of a closing checklist item (CP, document, or signature).
 */
export interface ClosingChecklistItem {
  id: string;
  type: 'condition' | 'document' | 'signature';
  title: string;
  description: string;
  category: string;
  sectionReference: string | null;
  responsiblePartyId: string;
  responsiblePartyName: string;
  status: string;
  dueDate: Date | null;
  completedAt: Date | null;
  isOverdue: boolean;
  linkedDocuments: string[];
  linkedConditions: string[];
}

// =============================================================================
// SIGNATURE BLOCK
// =============================================================================

/**
 * A signature block for a document showing all required signatories.
 */
export interface SignatureBlock {
  documentId: string;
  documentTitle: string;
  signatures: SignatureStatusDetail[];
  allSigned: boolean;
  pendingCount: number;
  signedCount: number;
}

/**
 * Detailed signature status with party information.
 * Note: Named SignatureStatusDetail to avoid collision with SignatureStatus type alias in ../types.js
 */
export interface SignatureStatusDetail {
  id: string;
  partyId: string;
  partyName: string;
  signatoryName: string;
  signatoryTitle: string;
  status: SignatureStatusType;
  signedAt: Date | null;
}
