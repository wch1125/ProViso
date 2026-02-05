/**
 * ProViso Hub v2.0 — Public Exports
 *
 * Deal lifecycle platform for negotiation, closing, and monitoring.
 */

// Types
export * from './types.js';

// Store
export { InMemoryStore, store, generateId, type StoreInterface } from './store.js';

// API
export {
  // Deal operations
  createDeal,
  getDeal,
  listDeals,
  updateDeal,
  deleteDeal,
  transitionDealStatus,

  // Version operations
  createVersion,
  getVersion,
  listVersions,
  updateVersion,
  getVersionHistory,
  sendVersion,
  receiveVersion,
  createMarkup,
  getCurrentVersion,
  getDealWithCurrentVersion,

  // Party operations
  addParty,
  removeParty,
  listParties,

  // Change tracking
  compareVersions,
} from './api.js';

// Forms (v2.0 Phase 2)
export * from './forms/index.js';

// Versioning (v2.0 Phase 3)
export * from './versioning/index.js';

// Word Integration (v2.0 Phase 4)
export * from './word/index.js';

// Closing (v2.0 Phase 5)
export * from './closing/index.js';

// Post-Closing (v2.0 Phase 6)
export * from './postclosing/index.js';
