/**
 * Closing Context Provider
 *
 * Manages state for the Closing Dashboard: conditions precedent, documents, and signatures.
 * Persists state to localStorage for demo purposes.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

import {
  getScenarioById,
  abcScenario,
  type ConditionPrecedent,
  type ClosingDocument as Document,
  type Signature,
  type ClosingDeal,
  type ClosingParty as DealParty,
} from '../data/demo-scenarios';

// Default to ABC scenario for backwards compatibility
const defaultClosingData = abcScenario.closing;
const defaultClosingDeal = defaultClosingData.deal;
const defaultClosingConditions = defaultClosingData.conditions;
const defaultClosingDocuments = defaultClosingData.documents;
const defaultClosingParties = defaultClosingData.parties;

// =============================================================================
// TYPES
// =============================================================================

export interface ClosingStats {
  conditions: {
    total: number;
    satisfied: number;
    pending: number;
    waived: number;
    overdue: number;
  };
  documents: {
    total: number;
    uploaded: number;
    executed: number;
    pending: number;
  };
  signatures: {
    total: number;
    signed: number;
    requested: number;
    pending: number;
    declined: number;
  };
}

export interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface ClosingContextValue {
  // Data
  deal: ClosingDeal;
  conditions: ConditionPrecedent[];
  documents: Document[];
  parties: DealParty[];

  // Computed
  stats: ClosingStats;
  readinessPercentage: number;
  daysUntilClosing: number;

  // Condition Actions
  satisfyCondition: (id: string, notes?: string) => void;
  waiveCondition: (id: string, notes: string, approvedBy: string) => void;

  // Document Actions
  uploadDocument: (documentId: string, fileName: string) => void;
  markDocumentExecuted: (documentId: string) => void;

  // Signature Actions
  requestSignature: (documentId: string, signatureId: string) => void;
  markSigned: (documentId: string, signatureId: string) => void;
  declineSignature: (documentId: string, signatureId: string) => void;

  // Toast notifications
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // Scenario loading
  loadScenario: (dealId: string) => void;

  // Reset
  resetToDefaults: () => void;
}

const ClosingContext = createContext<ClosingContextValue | null>(null);

// =============================================================================
// STORAGE KEYS
// =============================================================================

const STORAGE_KEY_CONDITIONS = 'proviso_closing_conditions';
const STORAGE_KEY_DOCUMENTS = 'proviso_closing_documents';

// =============================================================================
// HELPERS
// =============================================================================

function generateId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function calculateStats(
  conditions: ConditionPrecedent[],
  documents: Document[]
): ClosingStats {
  const now = new Date();

  const conditionStats = {
    total: conditions.length,
    satisfied: 0,
    pending: 0,
    waived: 0,
    overdue: 0,
  };

  for (const cp of conditions) {
    if (cp.status === 'satisfied') {
      conditionStats.satisfied++;
    } else if (cp.status === 'waived') {
      conditionStats.waived++;
    } else {
      conditionStats.pending++;
      if (cp.dueDate && new Date(cp.dueDate) < now) {
        conditionStats.overdue++;
      }
    }
  }

  const documentStats = {
    total: documents.length,
    uploaded: 0,
    executed: 0,
    pending: 0,
  };

  for (const doc of documents) {
    if (doc.status === 'executed') {
      documentStats.executed++;
    } else if (doc.status === 'uploaded') {
      documentStats.uploaded++;
    } else {
      documentStats.pending++;
    }
  }

  const signatureStats = {
    total: 0,
    signed: 0,
    requested: 0,
    pending: 0,
    declined: 0,
  };

  for (const doc of documents) {
    for (const sig of doc.signatures) {
      signatureStats.total++;
      if (sig.status === 'signed') {
        signatureStats.signed++;
      } else if (sig.status === 'requested') {
        signatureStats.requested++;
      } else if (sig.status === 'declined') {
        signatureStats.declined++;
      } else {
        signatureStats.pending++;
      }
    }
  }

  return {
    conditions: conditionStats,
    documents: documentStats,
    signatures: signatureStats,
  };
}

function calculateReadinessPercentage(stats: ClosingStats): number {
  const totalItems =
    stats.conditions.total + stats.documents.total + stats.signatures.total;
  const completedItems =
    stats.conditions.satisfied +
    stats.conditions.waived +
    stats.documents.uploaded +
    stats.documents.executed +
    stats.signatures.signed;

  return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
}

function calculateDaysUntilClosing(targetDate: Date): number {
  const now = new Date();
  const diffMs = new Date(targetDate).getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// Deep clone for state to avoid mutation issues
function cloneConditions(conditions: ConditionPrecedent[]): ConditionPrecedent[] {
  return conditions.map(cp => ({
    ...cp,
    dueDate: cp.dueDate ? new Date(cp.dueDate) : null,
    satisfiedAt: cp.satisfiedAt ? new Date(cp.satisfiedAt) : null,
    waivedAt: cp.waivedAt ? new Date(cp.waivedAt) : null,
    satisfiedByDocumentIds: [...cp.satisfiedByDocumentIds],
  }));
}

function cloneDocuments(documents: Document[]): Document[] {
  return documents.map(doc => ({
    ...doc,
    uploadedAt: new Date(doc.uploadedAt),
    dueDate: doc.dueDate ? new Date(doc.dueDate) : null,
    signatures: doc.signatures.map(sig => ({
      ...sig,
      signedAt: sig.signedAt ? new Date(sig.signedAt) : null,
    })),
    satisfiesConditionIds: [...doc.satisfiesConditionIds],
  }));
}

// =============================================================================
// PROVIDER
// =============================================================================

interface ClosingProviderProps {
  children: ReactNode;
}

export function ClosingProvider({ children }: ClosingProviderProps) {
  // Current deal state
  const [deal, setDeal] = useState<ClosingDeal>(defaultClosingDeal);
  const [parties, setParties] = useState<DealParty[]>(defaultClosingParties);

  // Initialize from localStorage or defaults
  const [conditions, setConditions] = useState<ConditionPrecedent[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONDITIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Restore Date objects
        return parsed.map((cp: ConditionPrecedent) => ({
          ...cp,
          dueDate: cp.dueDate ? new Date(cp.dueDate) : null,
          satisfiedAt: cp.satisfiedAt ? new Date(cp.satisfiedAt) : null,
          waivedAt: cp.waivedAt ? new Date(cp.waivedAt) : null,
        }));
      }
    } catch (e) {
      console.warn('Failed to load conditions from localStorage:', e);
    }
    return cloneConditions(defaultClosingConditions);
  });

  const [documents, setDocuments] = useState<Document[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DOCUMENTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((doc: Document) => ({
          ...doc,
          uploadedAt: new Date(doc.uploadedAt),
          dueDate: doc.dueDate ? new Date(doc.dueDate) : null,
          signatures: doc.signatures.map((sig: Signature) => ({
            ...sig,
            signedAt: sig.signedAt ? new Date(sig.signedAt) : null,
          })),
        }));
      }
    } catch (e) {
      console.warn('Failed to load documents from localStorage:', e);
    }
    return cloneDocuments(defaultClosingDocuments);
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONDITIONS, JSON.stringify(conditions));
  }, [conditions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DOCUMENTS, JSON.stringify(documents));
  }, [documents]);

  // Auto-dismiss toasts after 5 seconds
  useEffect(() => {
    if (toasts.length === 0) return;

    const timer = setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 5000);

    return () => clearTimeout(timer);
  }, [toasts]);

  // Calculate computed values
  const stats = calculateStats(conditions, documents);
  const readinessPercentage = calculateReadinessPercentage(stats);
  const daysUntilClosing = calculateDaysUntilClosing(deal.targetClosingDate);

  // Toast management
  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    setToasts(prev => [...prev, { ...toast, id: generateId() }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Condition Actions
  const satisfyCondition = useCallback((id: string, notes?: string) => {
    setConditions(prev => prev.map(cp => {
      if (cp.id !== id) return cp;
      return {
        ...cp,
        status: 'satisfied' as const,
        satisfiedAt: new Date(),
        notes: notes || cp.notes,
      };
    }));

    const condition = conditions.find(c => c.id === id);
    addToast({
      type: 'success',
      title: 'Condition Satisfied',
      message: condition?.title,
    });
  }, [conditions, addToast]);

  const waiveCondition = useCallback((id: string, notes: string, approvedBy: string) => {
    setConditions(prev => prev.map(cp => {
      if (cp.id !== id) return cp;
      return {
        ...cp,
        status: 'waived' as const,
        waivedAt: new Date(),
        waiverApprovedBy: approvedBy,
        notes,
      };
    }));

    const condition = conditions.find(c => c.id === id);
    addToast({
      type: 'info',
      title: 'Condition Waived',
      message: condition?.title,
    });
  }, [conditions, addToast]);

  // Document Actions
  const uploadDocument = useCallback((documentId: string, fileName: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== documentId) return doc;
      return {
        ...doc,
        status: 'uploaded' as const,
        fileName,
        uploadedAt: new Date(),
      };
    }));

    const document = documents.find(d => d.id === documentId);
    addToast({
      type: 'success',
      title: 'Document Uploaded',
      message: document?.title,
    });

    // Also satisfy any linked conditions
    const doc = documents.find(d => d.id === documentId);
    if (doc?.satisfiesConditionIds.length) {
      setConditions(prev => prev.map(cp => {
        if (!doc.satisfiesConditionIds.includes(cp.id)) return cp;
        if (cp.status !== 'pending') return cp;
        return {
          ...cp,
          status: 'satisfied' as const,
          satisfiedAt: new Date(),
          satisfiedByDocumentIds: [...cp.satisfiedByDocumentIds, documentId],
        };
      }));
    }
  }, [documents, addToast]);

  const markDocumentExecuted = useCallback((documentId: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== documentId) return doc;
      return {
        ...doc,
        status: 'executed' as const,
      };
    }));

    const document = documents.find(d => d.id === documentId);
    addToast({
      type: 'success',
      title: 'Document Fully Executed',
      message: document?.title,
    });
  }, [documents, addToast]);

  // Signature Actions
  const requestSignature = useCallback((documentId: string, signatureId: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== documentId) return doc;
      return {
        ...doc,
        signatures: doc.signatures.map(sig => {
          if (sig.id !== signatureId) return sig;
          return {
            ...sig,
            status: 'requested' as const,
          };
        }),
      };
    }));

    const doc = documents.find(d => d.id === documentId);
    const sig = doc?.signatures.find(s => s.id === signatureId);
    const party = parties.find(p => p.id === sig?.partyId);

    addToast({
      type: 'info',
      title: 'Signature Requested',
      message: `Request sent to ${party?.shortName || 'party'}`,
    });
  }, [documents, addToast]);

  const markSigned = useCallback((documentId: string, signatureId: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== documentId) return doc;

      const updatedSignatures = doc.signatures.map(sig => {
        if (sig.id !== signatureId) return sig;
        return {
          ...sig,
          status: 'signed' as const,
          signedAt: new Date(),
        };
      });

      // Check if all signatures are now signed
      const allSigned = updatedSignatures.every(sig => sig.status === 'signed');

      return {
        ...doc,
        signatures: updatedSignatures,
        status: allSigned ? 'executed' as const : doc.status,
      };
    }));

    const doc = documents.find(d => d.id === documentId);
    const sig = doc?.signatures.find(s => s.id === signatureId);
    const party = parties.find(p => p.id === sig?.partyId);

    // Check if document is now fully executed
    const updatedDoc = documents.find(d => d.id === documentId);
    const willBeFullyExecuted = updatedDoc?.signatures.filter(s => s.id !== signatureId && s.status !== 'signed').length === 0;

    if (willBeFullyExecuted) {
      addToast({
        type: 'success',
        title: 'Document Fully Executed',
        message: doc?.title,
      });
    } else {
      addToast({
        type: 'success',
        title: 'Signature Received',
        message: `${party?.shortName || 'Party'} signed ${doc?.title}`,
      });
    }
  }, [documents, addToast]);

  const declineSignature = useCallback((documentId: string, signatureId: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== documentId) return doc;
      return {
        ...doc,
        signatures: doc.signatures.map(sig => {
          if (sig.id !== signatureId) return sig;
          return {
            ...sig,
            status: 'declined' as const,
          };
        }),
      };
    }));

    const doc = documents.find(d => d.id === documentId);
    const sig = doc?.signatures.find(s => s.id === signatureId);
    const party = parties.find(p => p.id === sig?.partyId);

    addToast({
      type: 'error',
      title: 'Signature Declined',
      message: `${party?.shortName || 'Party'} declined to sign ${doc?.title}`,
    });
  }, [documents, addToast]);

  // Scenario loading - loads closing data from demo-scenarios based on dealId
  const loadScenario = useCallback((dealId: string) => {
    const scenario = getScenarioById(dealId);
    if (scenario?.closing) {
      const closingData = scenario.closing;
      setDeal(closingData.deal);
      setParties(closingData.parties);
      setConditions(cloneConditions(closingData.conditions));
      setDocuments(cloneDocuments(closingData.documents));
      // Clear localStorage for fresh scenario data
      localStorage.removeItem(STORAGE_KEY_CONDITIONS);
      localStorage.removeItem(STORAGE_KEY_DOCUMENTS);
    }
  }, []);

  // Reset
  const resetToDefaults = useCallback(() => {
    setDeal(defaultClosingDeal);
    setParties(defaultClosingParties);
    setConditions(cloneConditions(defaultClosingConditions));
    setDocuments(cloneDocuments(defaultClosingDocuments));
    localStorage.removeItem(STORAGE_KEY_CONDITIONS);
    localStorage.removeItem(STORAGE_KEY_DOCUMENTS);
    addToast({
      type: 'info',
      title: 'Reset Complete',
      message: 'All closing data has been reset to defaults',
    });
  }, [addToast]);

  const value: ClosingContextValue = {
    deal,
    conditions,
    documents,
    parties,
    stats,
    readinessPercentage,
    daysUntilClosing,
    satisfyCondition,
    waiveCondition,
    uploadDocument,
    markDocumentExecuted,
    requestSignature,
    markSigned,
    declineSignature,
    toasts,
    addToast,
    removeToast,
    loadScenario,
    resetToDefaults,
  };

  return (
    <ClosingContext.Provider value={value}>
      {children}
    </ClosingContext.Provider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

export function useClosing() {
  const context = useContext(ClosingContext);
  if (!context) {
    throw new Error('useClosing must be used within a ClosingProvider');
  }
  return context;
}
