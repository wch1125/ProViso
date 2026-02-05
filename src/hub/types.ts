/**
 * ProViso Hub v2.0 — Data Models
 *
 * These types define the deal lifecycle platform structures for:
 * - Negotiation: Deal versioning, change tracking
 * - Closing: Conditions precedent, documents, signatures
 * - Post-Closing: Financial submissions, draw requests
 */

import type { PartyRole, DocumentType, DocumentStatus, ConditionStatus } from '../closing-enums.js';

// =============================================================================
// DEAL & VERSION
// =============================================================================

/**
 * A credit deal/facility being negotiated, closed, or monitored.
 */
export interface Deal {
  id: string;
  name: string;
  dealType: DealType;
  facilityAmount: number;
  currency: string;
  status: DealStatus;

  /** Current active version ID */
  currentVersionId: string | null;
  /** All parties involved in the deal */
  parties: DealParty[];

  /** Target closing date */
  targetClosingDate: Date | null;
  /** Actual closing date when executed */
  actualClosingDate: Date | null;
  /** Facility maturity date */
  maturityDate: Date | null;

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export type DealType = 'corporate' | 'project_finance';

export type DealStatus = 'draft' | 'negotiation' | 'closing' | 'active' | 'matured';

/**
 * A version of a deal's ProViso code.
 * Each version represents a point in the negotiation.
 */
export interface DealVersion {
  id: string;
  dealId: string;
  versionNumber: number;
  versionLabel: string;

  /** The ProViso source code (.proviso) */
  creditLangCode: string;

  /** Who created this version */
  createdBy: string;
  /** Which party authored this version */
  authorParty: string;
  createdAt: Date;

  /** Parent version this was derived from (null for initial version) */
  parentVersionId: string | null;

  /** Version lifecycle status */
  status: VersionStatus;

  /** Path or base64 of generated Word document */
  generatedWordDoc: string | null;

  /** Summary of changes vs parent version */
  changeSummary: ChangeSummary | null;
}

export type VersionStatus = 'draft' | 'sent' | 'received' | 'superseded' | 'executed';

// =============================================================================
// PARTIES & CONTACTS
// =============================================================================

/**
 * A party involved in the deal (borrower, lender, counsel, etc.)
 */
export interface DealParty {
  id: string;
  dealId: string;
  name: string;
  shortName: string;
  role: PartyRole;
  partyType: PartyType;
  primaryContact: Contact;
  additionalContacts: Contact[];
  /** ID of party providing counsel to this party */
  counselPartyId: string | null;
}

export type PartyType = 'borrower' | 'lender' | 'agent' | 'law_firm' | 'consultant';

/**
 * Contact information for a party representative.
 */
export interface Contact {
  name: string;
  email: string;
  phone: string | null;
  title: string | null;
}

// =============================================================================
// CHANGE TRACKING
// =============================================================================

/**
 * Summary of changes between two versions.
 */
export interface ChangeSummary {
  versionFrom: number;
  versionTo: number;
  authorParty: string;
  createdAt: Date;

  /** Statistics */
  totalChanges: number;
  covenantChanges: number;
  definitionChanges: number;
  basketChanges: number;
  otherChanges: number;

  /** Impact classification */
  borrowerFavorable: number;
  lenderFavorable: number;
  neutral: number;

  /** Detailed change list */
  changes: Change[];
}

/**
 * A single change between versions.
 */
export interface Change {
  id: string;
  changeType: ChangeType;
  elementType: ElementType;

  /** Credit agreement section reference */
  sectionReference: string;
  /** Name of the changed element */
  elementName: string;

  /** Human-readable title */
  title: string;
  /** Human-readable description */
  description: string;
  /** Optional rationale for the change */
  rationale: string | null;

  /** Code before change */
  beforeCode: string | null;
  /** Code after change */
  afterCode: string | null;
  /** Value before (e.g., "5.00x") */
  beforeValue: string | null;
  /** Value after (e.g., "5.25x") */
  afterValue: string | null;

  /** Impact classification */
  impact: ChangeImpact;
  /** Description of impact (e.g., "+0.25x headroom") */
  impactDescription: string | null;

  /** Which form was used to make this change */
  sourceForm: string | null;
  /** Whether this was a manual code edit */
  isManualEdit: boolean;
}

export type ChangeType = 'added' | 'removed' | 'modified';

export type ElementType =
  | 'covenant'
  | 'basket'
  | 'definition'
  | 'condition'
  | 'phase'
  | 'milestone'
  | 'reserve'
  | 'waterfall'
  | 'cp'
  | 'other';

export type ChangeImpact = 'borrower_favorable' | 'lender_favorable' | 'neutral' | 'unclear';

// =============================================================================
// CONDITIONS PRECEDENT (CLOSING)
// =============================================================================

/**
 * A condition that must be satisfied before closing/funding.
 */
export interface ConditionPrecedent {
  id: string;
  dealId: string;
  versionId: string;

  /** Section reference in the credit agreement */
  sectionReference: string;
  category: CPCategory;

  title: string;
  description: string;

  /** Party responsible for satisfying this CP */
  responsiblePartyId: string;
  status: ConditionStatus;

  dueDate: Date | null;
  satisfiedAt: Date | null;
  /** Documents that satisfy this CP */
  satisfiedByDocumentIds: string[];

  waivedAt: Date | null;
  waiverApprovedBy: string | null;

  notes: string;
}

export type CPCategory =
  | 'corporate_documents'
  | 'credit_agreement'
  | 'security_documents'
  | 'ucc_filings'
  | 'legal_opinions'
  | 'certificates'
  | 'financial'
  | 'insurance'
  | 'kyc_aml'
  | 'other';

// =============================================================================
// DOCUMENTS & SIGNATURES
// =============================================================================

/**
 * A document in the deal's document vault.
 */
export interface Document {
  id: string;
  dealId: string;

  documentType: DocumentType;
  title: string;
  fileName: string;
  fileType: string;
  storagePath: string;

  status: DocumentStatus;
  responsiblePartyId: string | null;

  uploadedAt: Date;
  uploadedBy: string;
  dueDate: Date | null;

  signatures: Signature[];
  /** CP IDs that this document satisfies */
  satisfiesConditionIds: string[];
}

/**
 * A signature on a document.
 */
export interface Signature {
  id: string;
  documentId: string;
  partyId: string;
  signatoryName: string;
  signatoryTitle: string;
  status: SignatureStatus;
  signedAt: Date | null;
}

export type SignatureStatus = 'pending' | 'requested' | 'signed' | 'declined';

// =============================================================================
// FINANCIAL SUBMISSIONS (POST-CLOSING)
// =============================================================================

/**
 * A financial data submission for covenant testing.
 */
export interface FinancialSubmission {
  id: string;
  dealId: string;

  /** Period identifier (e.g., "2024-Q4") */
  period: string;
  periodType: 'monthly' | 'quarterly' | 'annual';
  periodEndDate: Date;

  /** Raw financial data */
  financialData: Record<string, number>;

  submittedBy: string;
  submittedAt: Date;

  verifiedBy: string | null;
  verifiedAt: Date | null;
  verificationStatus: VerificationStatus;

  /** Computed covenant results */
  covenantResults: CovenantResultSummary[];
  /** Computed basket capacities */
  basketCapacities: BasketCapacitySummary[];

  /** Link to compliance certificate document */
  complianceCertificateId: string | null;
}

export type VerificationStatus = 'pending' | 'verified' | 'disputed';

export interface CovenantResultSummary {
  name: string;
  compliant: boolean;
  actual: number;
  threshold: number;
  headroom: number;
}

export interface BasketCapacitySummary {
  name: string;
  capacity: number;
  used: number;
  available: number;
}

// =============================================================================
// DRAW REQUESTS (PROJECT FINANCE)
// =============================================================================

/**
 * A request to draw funds from the facility.
 */
export interface DrawRequest {
  id: string;
  dealId: string;
  drawNumber: number;

  requestedAmount: number;
  approvedAmount: number | null;
  fundedAmount: number | null;

  status: DrawRequestStatus;

  requestedAt: Date;
  approvedAt: Date | null;
  fundedAt: Date | null;

  /** Draw conditions that must be satisfied */
  conditions: DrawCondition[];
  /** Supporting document IDs */
  supportingDocumentIds: string[];
}

export type DrawRequestStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'funded'
  | 'rejected';

/**
 * A condition that must be satisfied for a draw.
 */
export interface DrawCondition {
  conditionId: string;
  title: string;
  status: DrawConditionStatus;
  satisfiedAt: Date | null;
}

export type DrawConditionStatus = 'pending' | 'satisfied' | 'waived';

// =============================================================================
// INPUT TYPES (for create/update operations)
// =============================================================================

/**
 * Input for creating a new deal.
 */
export interface CreateDealInput {
  name: string;
  dealType: DealType;
  facilityAmount: number;
  currency: string;
  createdBy: string;
  targetClosingDate?: Date | null;
  maturityDate?: Date | null;
}

/**
 * Input for updating a deal.
 */
export interface UpdateDealInput {
  name?: string;
  facilityAmount?: number;
  currency?: string;
  status?: DealStatus;
  targetClosingDate?: Date | null;
  actualClosingDate?: Date | null;
  maturityDate?: Date | null;
}

/**
 * Input for creating a new version.
 */
export interface CreateVersionInput {
  versionLabel: string;
  creditLangCode: string;
  createdBy: string;
  authorParty: string;
  parentVersionId?: string | null;
}

/**
 * Input for updating a version.
 */
export interface UpdateVersionInput {
  versionLabel?: string;
  creditLangCode?: string;
  status?: VersionStatus;
  generatedWordDoc?: string | null;
}

/**
 * Input for adding a party to a deal.
 */
export interface AddPartyInput {
  name: string;
  shortName: string;
  role: PartyRole;
  partyType: PartyType;
  primaryContact: Contact;
  additionalContacts?: Contact[];
  counselPartyId?: string | null;
}

// =============================================================================
// FILTER & QUERY TYPES
// =============================================================================

/**
 * Filter options for listing deals.
 */
export interface DealFilter {
  status?: DealStatus | DealStatus[];
  dealType?: DealType;
  createdBy?: string;
  searchTerm?: string;
}

/**
 * Filter options for listing versions.
 */
export interface VersionFilter {
  status?: VersionStatus | VersionStatus[];
  authorParty?: string;
}
