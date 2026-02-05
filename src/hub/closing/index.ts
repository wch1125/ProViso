/**
 * ProViso Hub v2.0 — Closing Module
 *
 * Exports for closing workflow management.
 */

// Types
export * from './types.js';

// API
export {
  // Conditions Precedent
  createConditionPrecedent,
  getConditionPrecedent,
  listConditionsPrecedent,
  updateConditionPrecedent,
  satisfyCondition,
  waiveCondition,
  deleteConditionPrecedent,
  // Documents
  createDocument,
  getDocument,
  listDocuments,
  updateDocument,
  markDocumentUploaded,
  markDocumentExecuted,
  deleteDocument,
  // Signatures
  addSignature,
  updateSignature,
  markSignatureSigned,
  requestSignature,
  getSignatureBlocks,
  // Readiness
  calculateClosingReadiness,
  getClosingChecklist,
  // Store management
  clearClosingData,
  loadClosingData,
} from './api.js';
