/**
 * ProViso Hub v2.0 — Closing Dashboard Demo Data
 *
 * Realistic closing data for the ABC Acquisition Facility.
 */

// =============================================================================
// TYPES (local copies for dashboard)
// =============================================================================

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

export type ConditionStatus = 'pending' | 'satisfied' | 'waived';
export type DocumentStatus = 'pending' | 'uploaded' | 'executed';
export type SignatureStatus = 'pending' | 'requested' | 'signed' | 'declined';

export interface ConditionPrecedent {
  id: string;
  dealId: string;
  versionId: string;
  sectionReference: string;
  category: CPCategory;
  title: string;
  description: string;
  responsiblePartyId: string;
  status: ConditionStatus;
  dueDate: Date | null;
  satisfiedAt: Date | null;
  satisfiedByDocumentIds: string[];
  waivedAt: Date | null;
  waiverApprovedBy: string | null;
  notes: string;
}

export interface Document {
  id: string;
  dealId: string;
  documentType: string;
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
  satisfiesConditionIds: string[];
}

export interface Signature {
  id: string;
  documentId: string;
  partyId: string;
  signatoryName: string;
  signatoryTitle: string;
  status: SignatureStatus;
  signedAt: Date | null;
}

export interface DealParty {
  id: string;
  dealId: string;
  name: string;
  shortName: string;
  role: string;
  partyType: string;
}

export interface ClosingDeal {
  id: string;
  name: string;
  facilityAmount: number;
  currency: string;
  targetClosingDate: Date;
  status: string;
}

// =============================================================================
// DEMO DATA
// =============================================================================

export const closingDeal: ClosingDeal = {
  id: 'deal-closing-1',
  name: 'ABC Acquisition Facility',
  facilityAmount: 150_000_000,
  currency: 'USD',
  targetClosingDate: new Date('2026-02-15'),
  status: 'closing',
};

export const closingParties: DealParty[] = [
  {
    id: 'party-1',
    dealId: 'deal-closing-1',
    name: 'ABC Holdings, Inc.',
    shortName: 'Borrower',
    role: 'borrower',
    partyType: 'borrower',
  },
  {
    id: 'party-2',
    dealId: 'deal-closing-1',
    name: 'First National Bank',
    shortName: 'Agent',
    role: 'administrative_agent',
    partyType: 'agent',
  },
  {
    id: 'party-3',
    dealId: 'deal-closing-1',
    name: 'Regional Capital Partners',
    shortName: 'Lender 1',
    role: 'lender',
    partyType: 'lender',
  },
  {
    id: 'party-4',
    dealId: 'deal-closing-1',
    name: 'Midwest Credit Fund',
    shortName: 'Lender 2',
    role: 'lender',
    partyType: 'lender',
  },
  {
    id: 'party-5',
    dealId: 'deal-closing-1',
    name: 'Davis Polk & Wardwell',
    shortName: 'Borrower Counsel',
    role: 'counsel',
    partyType: 'law_firm',
  },
  {
    id: 'party-6',
    dealId: 'deal-closing-1',
    name: 'Simpson Thacher & Bartlett',
    shortName: 'Agent Counsel',
    role: 'counsel',
    partyType: 'law_firm',
  },
];

export const closingConditions: ConditionPrecedent[] = [
  // Corporate Documents
  {
    id: 'cp-1',
    dealId: 'deal-closing-1',
    versionId: 'version-3',
    sectionReference: '4.01(a)(i)',
    category: 'corporate_documents',
    title: 'Certificate of Incorporation',
    description: 'Certified copy of the Certificate of Incorporation of the Borrower',
    responsiblePartyId: 'party-1',
    status: 'satisfied',
    dueDate: new Date('2026-02-10'),
    satisfiedAt: new Date('2026-01-28'),
    satisfiedByDocumentIds: ['doc-1'],
    waivedAt: null,
    waiverApprovedBy: null,
    notes: '',
  },
  {
    id: 'cp-2',
    dealId: 'deal-closing-1',
    versionId: 'version-3',
    sectionReference: '4.01(a)(ii)',
    category: 'corporate_documents',
    title: 'Bylaws',
    description: 'Certified copy of the Bylaws of the Borrower',
    responsiblePartyId: 'party-1',
    status: 'satisfied',
    dueDate: new Date('2026-02-10'),
    satisfiedAt: new Date('2026-01-28'),
    satisfiedByDocumentIds: ['doc-2'],
    waivedAt: null,
    waiverApprovedBy: null,
    notes: '',
  },
  {
    id: 'cp-3',
    dealId: 'deal-closing-1',
    versionId: 'version-3',
    sectionReference: '4.01(a)(iii)',
    category: 'corporate_documents',
    title: 'Board Resolutions',
    description: 'Resolutions of the Board of Directors authorizing the execution and delivery of the Loan Documents',
    responsiblePartyId: 'party-1',
    status: 'satisfied',
    dueDate: new Date('2026-02-12'),
    satisfiedAt: new Date('2026-01-30'),
    satisfiedByDocumentIds: ['doc-3'],
    waivedAt: null,
    waiverApprovedBy: null,
    notes: '',
  },
  {
    id: 'cp-4',
    dealId: 'deal-closing-1',
    versionId: 'version-3',
    sectionReference: '4.01(a)(iv)',
    category: 'corporate_documents',
    title: 'Good Standing Certificate',
    description: 'Certificate of Good Standing from the Secretary of State of Delaware',
    responsiblePartyId: 'party-1',
    status: 'pending',
    dueDate: new Date('2026-02-14'),
    satisfiedAt: null,
    satisfiedByDocumentIds: [],
    waivedAt: null,
    waiverApprovedBy: null,
    notes: 'Requested from Delaware Secretary of State',
  },
  // Credit Agreement
  {
    id: 'cp-5',
    dealId: 'deal-closing-1',
    versionId: 'version-3',
    sectionReference: '4.01(b)(i)',
    category: 'credit_agreement',
    title: 'Credit Agreement Execution',
    description: 'Fully executed Credit Agreement',
    responsiblePartyId: 'party-5',
    status: 'pending',
    dueDate: new Date('2026-02-15'),
    satisfiedAt: null,
    satisfiedByDocumentIds: [],
    waivedAt: null,
    waiverApprovedBy: null,
    notes: 'Final signatures pending',
  },
  // Security Documents
  {
    id: 'cp-6',
    dealId: 'deal-closing-1',
    versionId: 'version-3',
    sectionReference: '4.01(c)(i)',
    category: 'security_documents',
    title: 'Security Agreement',
    description: 'Security Agreement granting a security interest in all assets',
    responsiblePartyId: 'party-5',
    status: 'satisfied',
    dueDate: new Date('2026-02-12'),
    satisfiedAt: new Date('2026-01-31'),
    satisfiedByDocumentIds: ['doc-5'],
    waivedAt: null,
    waiverApprovedBy: null,
    notes: '',
  },
  {
    id: 'cp-7',
    dealId: 'deal-closing-1',
    versionId: 'version-3',
    sectionReference: '4.01(c)(ii)',
    category: 'security_documents',
    title: 'Pledge Agreement',
    description: 'Pledge Agreement covering equity interests in subsidiaries',
    responsiblePartyId: 'party-5',
    status: 'satisfied',
    dueDate: new Date('2026-02-12'),
    satisfiedAt: new Date('2026-01-31'),
    satisfiedByDocumentIds: ['doc-6'],
    waivedAt: null,
    waiverApprovedBy: null,
    notes: '',
  },
  // UCC Filings
  {
    id: 'cp-8',
    dealId: 'deal-closing-1',
    versionId: 'version-3',
    sectionReference: '4.01(d)(i)',
    category: 'ucc_filings',
    title: 'UCC-1 Financing Statement',
    description: 'UCC-1 Financing Statement filed with Delaware Secretary of State',
    responsiblePartyId: 'party-6',
    status: 'pending',
    dueDate: new Date('2026-02-15'),
    satisfiedAt: null,
    satisfiedByDocumentIds: [],
    waivedAt: null,
    waiverApprovedBy: null,
    notes: 'Will file on closing date',
  },
  // Legal Opinions
  {
    id: 'cp-9',
    dealId: 'deal-closing-1',
    versionId: 'version-3',
    sectionReference: '4.01(e)(i)',
    category: 'legal_opinions',
    title: 'Borrower Counsel Opinion',
    description: 'Legal opinion of Davis Polk as to the Borrower',
    responsiblePartyId: 'party-5',
    status: 'pending',
    dueDate: new Date('2026-02-14'),
    satisfiedAt: null,
    satisfiedByDocumentIds: [],
    waivedAt: null,
    waiverApprovedBy: null,
    notes: 'Draft under review',
  },
  // Certificates
  {
    id: 'cp-10',
    dealId: 'deal-closing-1',
    versionId: 'version-3',
    sectionReference: '4.01(f)(i)',
    category: 'certificates',
    title: 'Officer\'s Certificate',
    description: 'Certificate of a Responsible Officer certifying conditions precedent',
    responsiblePartyId: 'party-1',
    status: 'pending',
    dueDate: new Date('2026-02-15'),
    satisfiedAt: null,
    satisfiedByDocumentIds: [],
    waivedAt: null,
    waiverApprovedBy: null,
    notes: '',
  },
  {
    id: 'cp-11',
    dealId: 'deal-closing-1',
    versionId: 'version-3',
    sectionReference: '4.01(f)(ii)',
    category: 'certificates',
    title: 'Solvency Certificate',
    description: 'Solvency Certificate from the CFO of the Borrower',
    responsiblePartyId: 'party-1',
    status: 'pending',
    dueDate: new Date('2026-02-14'),
    satisfiedAt: null,
    satisfiedByDocumentIds: [],
    waivedAt: null,
    waiverApprovedBy: null,
    notes: '',
  },
  // Insurance
  {
    id: 'cp-12',
    dealId: 'deal-closing-1',
    versionId: 'version-3',
    sectionReference: '4.01(g)(i)',
    category: 'insurance',
    title: 'Insurance Certificate',
    description: 'Certificate of insurance evidencing required coverage with Agent named as loss payee',
    responsiblePartyId: 'party-1',
    status: 'pending',
    dueDate: new Date('2026-02-01'),
    satisfiedAt: null,
    satisfiedByDocumentIds: [],
    waivedAt: null,
    waiverApprovedBy: null,
    notes: 'OVERDUE - Awaiting from insurance broker',
  },
  // KYC/AML
  {
    id: 'cp-13',
    dealId: 'deal-closing-1',
    versionId: 'version-3',
    sectionReference: '4.01(h)(i)',
    category: 'kyc_aml',
    title: 'KYC Documentation',
    description: 'Know Your Customer documentation for all Lenders',
    responsiblePartyId: 'party-1',
    status: 'satisfied',
    dueDate: new Date('2026-02-05'),
    satisfiedAt: new Date('2026-01-25'),
    satisfiedByDocumentIds: [],
    waivedAt: null,
    waiverApprovedBy: null,
    notes: '',
  },
  // Financial
  {
    id: 'cp-14',
    dealId: 'deal-closing-1',
    versionId: 'version-3',
    sectionReference: '4.01(i)(i)',
    category: 'financial',
    title: 'Financial Statements',
    description: 'Audited financial statements for fiscal year 2025',
    responsiblePartyId: 'party-1',
    status: 'satisfied',
    dueDate: new Date('2026-02-01'),
    satisfiedAt: new Date('2026-01-20'),
    satisfiedByDocumentIds: ['doc-10'],
    waivedAt: null,
    waiverApprovedBy: null,
    notes: '',
  },
  {
    id: 'cp-15',
    dealId: 'deal-closing-1',
    versionId: 'version-3',
    sectionReference: '4.01(i)(ii)',
    category: 'financial',
    title: 'Pro Forma Financial Model',
    description: 'Pro forma financial model showing projected covenant compliance',
    responsiblePartyId: 'party-1',
    status: 'satisfied',
    dueDate: new Date('2026-02-05'),
    satisfiedAt: new Date('2026-01-22'),
    satisfiedByDocumentIds: ['doc-11'],
    waivedAt: null,
    waiverApprovedBy: null,
    notes: '',
  },
];

export const closingDocuments: Document[] = [
  // Satisfied CP documents
  {
    id: 'doc-1',
    dealId: 'deal-closing-1',
    documentType: 'corporate',
    title: 'Certificate of Incorporation',
    fileName: 'ABC_Holdings_Certificate_of_Incorporation.pdf',
    fileType: 'application/pdf',
    storagePath: '/documents/doc-1.pdf',
    status: 'uploaded',
    responsiblePartyId: 'party-1',
    uploadedAt: new Date('2026-01-28'),
    uploadedBy: 'john.smith@abcholdings.com',
    dueDate: new Date('2026-02-10'),
    signatures: [],
    satisfiesConditionIds: ['cp-1'],
  },
  {
    id: 'doc-2',
    dealId: 'deal-closing-1',
    documentType: 'corporate',
    title: 'Bylaws',
    fileName: 'ABC_Holdings_Bylaws.pdf',
    fileType: 'application/pdf',
    storagePath: '/documents/doc-2.pdf',
    status: 'uploaded',
    responsiblePartyId: 'party-1',
    uploadedAt: new Date('2026-01-28'),
    uploadedBy: 'john.smith@abcholdings.com',
    dueDate: new Date('2026-02-10'),
    signatures: [],
    satisfiesConditionIds: ['cp-2'],
  },
  {
    id: 'doc-3',
    dealId: 'deal-closing-1',
    documentType: 'corporate',
    title: 'Board Resolutions',
    fileName: 'ABC_Holdings_Board_Resolutions.pdf',
    fileType: 'application/pdf',
    storagePath: '/documents/doc-3.pdf',
    status: 'uploaded',
    responsiblePartyId: 'party-1',
    uploadedAt: new Date('2026-01-30'),
    uploadedBy: 'john.smith@abcholdings.com',
    dueDate: new Date('2026-02-12'),
    signatures: [],
    satisfiesConditionIds: ['cp-3'],
  },
  // Credit Agreement - needs signatures
  {
    id: 'doc-4',
    dealId: 'deal-closing-1',
    documentType: 'credit_agreement',
    title: 'Credit Agreement',
    fileName: 'ABC_Acquisition_Credit_Agreement.pdf',
    fileType: 'application/pdf',
    storagePath: '/documents/doc-4.pdf',
    status: 'pending',
    responsiblePartyId: 'party-5',
    uploadedAt: new Date('2026-01-31'),
    uploadedBy: 'partner@davispolk.com',
    dueDate: new Date('2026-02-15'),
    signatures: [
      {
        id: 'sig-1',
        documentId: 'doc-4',
        partyId: 'party-1',
        signatoryName: 'John Smith',
        signatoryTitle: 'CEO',
        status: 'signed',
        signedAt: new Date('2026-01-31'),
      },
      {
        id: 'sig-2',
        documentId: 'doc-4',
        partyId: 'party-2',
        signatoryName: 'Sarah Johnson',
        signatoryTitle: 'Managing Director',
        status: 'signed',
        signedAt: new Date('2026-02-01'),
      },
      {
        id: 'sig-3',
        documentId: 'doc-4',
        partyId: 'party-3',
        signatoryName: 'Michael Brown',
        signatoryTitle: 'Partner',
        status: 'requested',
        signedAt: null,
      },
      {
        id: 'sig-4',
        documentId: 'doc-4',
        partyId: 'party-4',
        signatoryName: 'Emily Davis',
        signatoryTitle: 'Senior VP',
        status: 'pending',
        signedAt: null,
      },
    ],
    satisfiesConditionIds: ['cp-5'],
  },
  // Security Documents
  {
    id: 'doc-5',
    dealId: 'deal-closing-1',
    documentType: 'security',
    title: 'Security Agreement',
    fileName: 'ABC_Security_Agreement.pdf',
    fileType: 'application/pdf',
    storagePath: '/documents/doc-5.pdf',
    status: 'executed',
    responsiblePartyId: 'party-5',
    uploadedAt: new Date('2026-01-31'),
    uploadedBy: 'partner@davispolk.com',
    dueDate: new Date('2026-02-12'),
    signatures: [
      {
        id: 'sig-5',
        documentId: 'doc-5',
        partyId: 'party-1',
        signatoryName: 'John Smith',
        signatoryTitle: 'CEO',
        status: 'signed',
        signedAt: new Date('2026-01-31'),
      },
      {
        id: 'sig-6',
        documentId: 'doc-5',
        partyId: 'party-2',
        signatoryName: 'Sarah Johnson',
        signatoryTitle: 'Managing Director',
        status: 'signed',
        signedAt: new Date('2026-01-31'),
      },
    ],
    satisfiesConditionIds: ['cp-6'],
  },
  {
    id: 'doc-6',
    dealId: 'deal-closing-1',
    documentType: 'security',
    title: 'Pledge Agreement',
    fileName: 'ABC_Pledge_Agreement.pdf',
    fileType: 'application/pdf',
    storagePath: '/documents/doc-6.pdf',
    status: 'executed',
    responsiblePartyId: 'party-5',
    uploadedAt: new Date('2026-01-31'),
    uploadedBy: 'partner@davispolk.com',
    dueDate: new Date('2026-02-12'),
    signatures: [
      {
        id: 'sig-7',
        documentId: 'doc-6',
        partyId: 'party-1',
        signatoryName: 'John Smith',
        signatoryTitle: 'CEO',
        status: 'signed',
        signedAt: new Date('2026-01-31'),
      },
    ],
    satisfiesConditionIds: ['cp-7'],
  },
  // Financial documents
  {
    id: 'doc-10',
    dealId: 'deal-closing-1',
    documentType: 'financial',
    title: '2025 Audited Financial Statements',
    fileName: 'ABC_2025_Audited_Financials.pdf',
    fileType: 'application/pdf',
    storagePath: '/documents/doc-10.pdf',
    status: 'uploaded',
    responsiblePartyId: 'party-1',
    uploadedAt: new Date('2026-01-20'),
    uploadedBy: 'cfo@abcholdings.com',
    dueDate: new Date('2026-02-01'),
    signatures: [],
    satisfiesConditionIds: ['cp-14'],
  },
  {
    id: 'doc-11',
    dealId: 'deal-closing-1',
    documentType: 'financial',
    title: 'Pro Forma Financial Model',
    fileName: 'ABC_ProForma_Model.xlsx',
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    storagePath: '/documents/doc-11.xlsx',
    status: 'uploaded',
    responsiblePartyId: 'party-1',
    uploadedAt: new Date('2026-01-22'),
    uploadedBy: 'cfo@abcholdings.com',
    dueDate: new Date('2026-02-05'),
    signatures: [],
    satisfiesConditionIds: ['cp-15'],
  },
];

// =============================================================================
// COMPUTED SUMMARIES
// =============================================================================

/**
 * Get condition status counts.
 */
export function getConditionStats() {
  const stats = {
    total: closingConditions.length,
    satisfied: 0,
    pending: 0,
    waived: 0,
    overdue: 0,
  };

  const now = new Date();

  for (const cp of closingConditions) {
    if (cp.status === 'satisfied') {
      stats.satisfied++;
    } else if (cp.status === 'waived') {
      stats.waived++;
    } else {
      stats.pending++;
      if (cp.dueDate && cp.dueDate < now) {
        stats.overdue++;
      }
    }
  }

  return stats;
}

/**
 * Get document status counts.
 */
export function getDocumentStats() {
  const stats = {
    total: closingDocuments.length,
    uploaded: 0,
    executed: 0,
    pending: 0,
  };

  for (const doc of closingDocuments) {
    if (doc.status === 'executed') {
      stats.executed++;
    } else if (doc.status === 'uploaded') {
      stats.uploaded++;
    } else {
      stats.pending++;
    }
  }

  return stats;
}

/**
 * Get signature status counts.
 */
export function getSignatureStats() {
  const stats = {
    total: 0,
    signed: 0,
    requested: 0,
    pending: 0,
    declined: 0,
  };

  for (const doc of closingDocuments) {
    for (const sig of doc.signatures) {
      stats.total++;
      if (sig.status === 'signed') {
        stats.signed++;
      } else if (sig.status === 'requested') {
        stats.requested++;
      } else if (sig.status === 'declined') {
        stats.declined++;
      } else {
        stats.pending++;
      }
    }
  }

  return stats;
}

/**
 * Calculate days until target closing.
 */
export function getDaysUntilClosing(): number {
  const now = new Date();
  const target = closingDeal.targetClosingDate;
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate overall readiness percentage.
 */
export function getReadinessPercentage(): number {
  const condStats = getConditionStats();
  const docStats = getDocumentStats();
  const sigStats = getSignatureStats();

  const totalItems = condStats.total + docStats.total + sigStats.total;
  const completedItems =
    condStats.satisfied +
    condStats.waived +
    docStats.uploaded +
    docStats.executed +
    sigStats.signed;

  return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
}

/**
 * Get outstanding items sorted by priority.
 */
export function getOutstandingItems() {
  const items: Array<{
    id: string;
    type: 'condition' | 'document' | 'signature';
    title: string;
    responsibleParty: string;
    dueDate: Date | null;
    isOverdue: boolean;
    status: string;
  }> = [];

  const now = new Date();
  const partyMap = new Map(closingParties.map((p) => [p.id, p.shortName]));

  // Add pending conditions
  for (const cp of closingConditions) {
    if (cp.status !== 'satisfied' && cp.status !== 'waived') {
      items.push({
        id: cp.id,
        type: 'condition',
        title: cp.title,
        responsibleParty: partyMap.get(cp.responsiblePartyId) ?? 'Unknown',
        dueDate: cp.dueDate,
        isOverdue: cp.dueDate ? cp.dueDate < now : false,
        status: cp.status,
      });
    }
  }

  // Add pending documents
  for (const doc of closingDocuments) {
    if (doc.status === 'pending') {
      items.push({
        id: doc.id,
        type: 'document',
        title: doc.title,
        responsibleParty: doc.responsiblePartyId
          ? partyMap.get(doc.responsiblePartyId) ?? 'Unknown'
          : 'Unassigned',
        dueDate: doc.dueDate,
        isOverdue: doc.dueDate ? doc.dueDate < now : false,
        status: doc.status,
      });
    }
  }

  // Sort by overdue first, then by due date
  items.sort((a, b) => {
    if (a.isOverdue !== b.isOverdue) {
      return a.isOverdue ? -1 : 1;
    }
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime();
    }
    return a.dueDate ? -1 : 1;
  });

  return items;
}
