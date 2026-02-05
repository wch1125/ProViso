/**
 * ProViso Closing Room Enums
 *
 * TypeScript equivalents of the closing-demo Python enums.
 * These provide standardized vocabulary for credit agreement closings:
 * - Transaction types (revolver, term loans, etc.)
 * - Document types (credit agreement, certificates, opinions, etc.)
 * - Document lifecycle status
 * - Party roles
 * - Condition precedent status
 *
 * These are intended for v1.0 UI/API work, providing proper vocabulary
 * for dropdowns, status badges, and structured data.
 */

// =============================================================================
// TRANSACTION TYPES
// =============================================================================

/**
 * Types of credit facilities
 */
export const TransactionType = {
  REVOLVING_CREDIT: 'revolving_credit',
  TERM_LOAN_A: 'term_loan_a',
  TERM_LOAN_B: 'term_loan_b',
  DELAYED_DRAW: 'delayed_draw',
  BRIDGE_LOAN: 'bridge_loan',
  ABL: 'asset_based_loan',
  MULTI_TRANCHE: 'multi_tranche',
} as const;

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

// =============================================================================
// DOCUMENT TYPES
// =============================================================================

/**
 * Types of closing deliverables
 */
export const DocumentType = {
  // Core Agreement Documents
  CREDIT_AGREEMENT: 'credit_agreement',
  AMENDMENT: 'amendment',
  WAIVER: 'waiver',
  CONSENT: 'consent',
  JOINDER: 'joinder',

  // Corporate Documents
  OFFICERS_CERTIFICATE: 'officers_certificate',
  SECRETARY_CERTIFICATE: 'secretary_certificate',
  INCUMBENCY_CERTIFICATE: 'incumbency_certificate',
  GOOD_STANDING: 'good_standing',
  CHARTER_DOCUMENTS: 'charter_documents',
  BYLAWS: 'bylaws',
  RESOLUTIONS: 'resolutions',

  // Security Documents
  PLEDGE_AGREEMENT: 'pledge_agreement',
  SECURITY_AGREEMENT: 'security_agreement',
  GUARANTY: 'guaranty',
  PERFECTION_CERTIFICATE: 'perfection_certificate',
  UCC_FINANCING_STATEMENT: 'ucc_financing_statement',
  IP_SECURITY_AGREEMENT: 'ip_security_agreement',

  // Opinions and Certificates
  LEGAL_OPINION: 'legal_opinion',
  SOLVENCY_CERTIFICATE: 'solvency_certificate',
  COMPLIANCE_CERTIFICATE: 'compliance_certificate',
  BORROWING_BASE_CERTIFICATE: 'borrowing_base_certificate',

  // Financial Documents
  FINANCIAL_STATEMENTS: 'financial_statements',
  PRO_FORMA: 'pro_forma',

  // Notices and Requests
  BORROWING_REQUEST: 'borrowing_request',
  NOTICE_OF_BORROWING: 'notice_of_borrowing',
  CLOSING_CERTIFICATE: 'closing_certificate',

  // Other
  FEE_LETTER: 'fee_letter',
  SIDE_LETTER: 'side_letter',
  EXHIBIT: 'exhibit',
  SCHEDULE: 'schedule',
  OTHER: 'other',
} as const;

export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

// =============================================================================
// DOCUMENT STATUS
// =============================================================================

/**
 * Lifecycle status of a document
 */
export const DocumentStatus = {
  NOT_STARTED: 'not_started',
  DRAFTING: 'drafting',
  INTERNAL_REVIEW: 'internal_review',
  OUT_FOR_REVIEW: 'out_for_review',
  COMMENTS_RECEIVED: 'comments_received',
  FINAL: 'final',
  UPLOADED: 'uploaded', // Document has been uploaded but not yet executed
  EXECUTED: 'executed',
  FILED: 'filed', // For UCC filings, etc.
  SUPERSEDED: 'superseded',
} as const;

export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus];

// =============================================================================
// PARTY ROLES
// =============================================================================

/**
 * Roles parties play in a transaction
 */
export const PartyRole = {
  BORROWER: 'borrower',
  CO_BORROWER: 'co_borrower',
  GUARANTOR: 'guarantor',
  ADMINISTRATIVE_AGENT: 'administrative_agent',
  COLLATERAL_AGENT: 'collateral_agent',
  LENDER: 'lender',
  LEAD_ARRANGER: 'lead_arranger',
  SYNDICATION_AGENT: 'syndication_agent',
  DOCUMENTATION_AGENT: 'documentation_agent',
  ISSUING_BANK: 'issuing_bank',
  SWINGLINE_LENDER: 'swingline_lender',
} as const;

export type PartyRole = (typeof PartyRole)[keyof typeof PartyRole];

// =============================================================================
// CONDITION PRECEDENT STATUS
// =============================================================================

/**
 * Status of a condition precedent
 */
export const ConditionStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  SATISFIED: 'satisfied',
  WAIVED: 'waived',
  NOT_APPLICABLE: 'not_applicable',
} as const;

export type ConditionStatus = (typeof ConditionStatus)[keyof typeof ConditionStatus];

// =============================================================================
// DEFINED TERM CATEGORIES
// =============================================================================

/**
 * Categories for defined terms (from closing-demo sample)
 */
export const DefinedTermCategory = {
  PARTY: 'party',
  DOCUMENT: 'document',
  FACILITY: 'facility',
  COLLATERAL: 'collateral',
  DATE: 'date',
  COVENANT: 'covenant',
  GENERAL: 'general',
} as const;

export type DefinedTermCategory = (typeof DefinedTermCategory)[keyof typeof DefinedTermCategory];

// =============================================================================
// DOCUMENT CATEGORY (for closing checklist grouping)
// =============================================================================

/**
 * Categories for grouping documents in checklists
 */
export const DocumentCategory = {
  CORE_AGREEMENT: 'Core Agreement',
  CORPORATE_DOCUMENTS: 'Corporate Documents',
  SECURITY_DOCUMENTS: 'Security Documents',
  UCC_FILINGS: 'UCC Filings',
  LEGAL_OPINIONS: 'Legal Opinions',
  CERTIFICATES: 'Certificates',
  FINANCIAL: 'Financial',
  FEE_LETTERS: 'Fee Letters',
  INSURANCE: 'Insurance',
  KYC_AML: 'KYC/AML',
  GENERAL_CONDITIONS: 'General Conditions',
} as const;

export type DocumentCategory = (typeof DocumentCategory)[keyof typeof DocumentCategory];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a value is a valid TransactionType
 */
export function isTransactionType(value: string): value is TransactionType {
  return Object.values(TransactionType).includes(value as TransactionType);
}

/**
 * Check if a value is a valid DocumentType
 */
export function isDocumentType(value: string): value is DocumentType {
  return Object.values(DocumentType).includes(value as DocumentType);
}

/**
 * Check if a value is a valid DocumentStatus
 */
export function isDocumentStatus(value: string): value is DocumentStatus {
  return Object.values(DocumentStatus).includes(value as DocumentStatus);
}

/**
 * Check if a value is a valid PartyRole
 */
export function isPartyRole(value: string): value is PartyRole {
  return Object.values(PartyRole).includes(value as PartyRole);
}

/**
 * Check if a value is a valid ConditionStatus
 */
export function isConditionStatus(value: string): value is ConditionStatus {
  return Object.values(ConditionStatus).includes(value as ConditionStatus);
}

/**
 * Get human-readable label for a transaction type
 */
export function getTransactionTypeLabel(type: TransactionType): string {
  const labels: Record<TransactionType, string> = {
    [TransactionType.REVOLVING_CREDIT]: 'Revolving Credit',
    [TransactionType.TERM_LOAN_A]: 'Term Loan A',
    [TransactionType.TERM_LOAN_B]: 'Term Loan B',
    [TransactionType.DELAYED_DRAW]: 'Delayed Draw',
    [TransactionType.BRIDGE_LOAN]: 'Bridge Loan',
    [TransactionType.ABL]: 'Asset-Based Loan',
    [TransactionType.MULTI_TRANCHE]: 'Multi-Tranche',
  };
  return labels[type];
}

/**
 * Get human-readable label for a document status
 */
export function getDocumentStatusLabel(status: DocumentStatus): string {
  const labels: Record<DocumentStatus, string> = {
    [DocumentStatus.NOT_STARTED]: 'Not Started',
    [DocumentStatus.DRAFTING]: 'Drafting',
    [DocumentStatus.INTERNAL_REVIEW]: 'Internal Review',
    [DocumentStatus.OUT_FOR_REVIEW]: 'Out for Review',
    [DocumentStatus.COMMENTS_RECEIVED]: 'Comments Received',
    [DocumentStatus.FINAL]: 'Final',
    [DocumentStatus.UPLOADED]: 'Uploaded',
    [DocumentStatus.EXECUTED]: 'Executed',
    [DocumentStatus.FILED]: 'Filed',
    [DocumentStatus.SUPERSEDED]: 'Superseded',
  };
  return labels[status];
}

/**
 * Get human-readable label for a party role
 */
export function getPartyRoleLabel(role: PartyRole): string {
  const labels: Record<PartyRole, string> = {
    [PartyRole.BORROWER]: 'Borrower',
    [PartyRole.CO_BORROWER]: 'Co-Borrower',
    [PartyRole.GUARANTOR]: 'Guarantor',
    [PartyRole.ADMINISTRATIVE_AGENT]: 'Administrative Agent',
    [PartyRole.COLLATERAL_AGENT]: 'Collateral Agent',
    [PartyRole.LENDER]: 'Lender',
    [PartyRole.LEAD_ARRANGER]: 'Lead Arranger',
    [PartyRole.SYNDICATION_AGENT]: 'Syndication Agent',
    [PartyRole.DOCUMENTATION_AGENT]: 'Documentation Agent',
    [PartyRole.ISSUING_BANK]: 'Issuing Bank',
    [PartyRole.SWINGLINE_LENDER]: 'Swingline Lender',
  };
  return labels[role];
}

/**
 * Get human-readable label for a condition status
 */
export function getConditionStatusLabel(status: ConditionStatus): string {
  const labels: Record<ConditionStatus, string> = {
    [ConditionStatus.PENDING]: 'Pending',
    [ConditionStatus.IN_PROGRESS]: 'In Progress',
    [ConditionStatus.SATISFIED]: 'Satisfied',
    [ConditionStatus.WAIVED]: 'Waived',
    [ConditionStatus.NOT_APPLICABLE]: 'N/A',
  };
  return labels[status];
}
