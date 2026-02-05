/**
 * ProViso Hub v2.0 — API Layer
 *
 * Business logic functions for deal and version management.
 * These functions operate on the store and provide higher-level operations.
 */

import type {
  Deal,
  DealVersion,
  DealParty,
  CreateDealInput,
  UpdateDealInput,
  CreateVersionInput,
  UpdateVersionInput,
  AddPartyInput,
  DealFilter,
  VersionFilter,
  ChangeSummary,
  Change,
  ElementType,
} from './types.js';
import { store as defaultStore, type StoreInterface, generateId } from './store.js';

// =============================================================================
// DEAL OPERATIONS
// =============================================================================

/**
 * Create a new deal.
 */
export async function createDeal(
  input: CreateDealInput,
  storeInstance: StoreInterface = defaultStore
): Promise<Deal> {
  return storeInstance.createDeal(input);
}

/**
 * Get a deal by ID.
 */
export async function getDeal(
  id: string,
  storeInstance: StoreInterface = defaultStore
): Promise<Deal | null> {
  return storeInstance.getDeal(id);
}

/**
 * List deals with optional filtering.
 */
export async function listDeals(
  filter?: DealFilter,
  storeInstance: StoreInterface = defaultStore
): Promise<Deal[]> {
  return storeInstance.listDeals(filter);
}

/**
 * Update a deal.
 */
export async function updateDeal(
  id: string,
  updates: UpdateDealInput,
  storeInstance: StoreInterface = defaultStore
): Promise<Deal | null> {
  return storeInstance.updateDeal(id, updates);
}

/**
 * Delete a deal and all its versions and parties.
 */
export async function deleteDeal(
  id: string,
  storeInstance: StoreInterface = defaultStore
): Promise<boolean> {
  return storeInstance.deleteDeal(id);
}

/**
 * Transition a deal to a new status.
 * Validates the status transition is allowed.
 */
export async function transitionDealStatus(
  id: string,
  newStatus: Deal['status'],
  storeInstance: StoreInterface = defaultStore
): Promise<Deal | null> {
  const deal = await storeInstance.getDeal(id);
  if (!deal) return null;

  // Define valid transitions
  const validTransitions: Record<Deal['status'], Deal['status'][]> = {
    draft: ['negotiation'],
    negotiation: ['closing', 'draft'],
    closing: ['active', 'negotiation'],
    active: ['matured'],
    matured: [],
  };

  if (!validTransitions[deal.status].includes(newStatus)) {
    throw new Error(
      `Invalid status transition: cannot go from '${deal.status}' to '${newStatus}'`
    );
  }

  return storeInstance.updateDeal(id, { status: newStatus });
}

// =============================================================================
// VERSION OPERATIONS
// =============================================================================

/**
 * Create a new version of a deal.
 */
export async function createVersion(
  dealId: string,
  input: CreateVersionInput,
  storeInstance: StoreInterface = defaultStore
): Promise<DealVersion> {
  return storeInstance.createVersion(dealId, input);
}

/**
 * Get a version by ID.
 */
export async function getVersion(
  id: string,
  storeInstance: StoreInterface = defaultStore
): Promise<DealVersion | null> {
  return storeInstance.getVersion(id);
}

/**
 * List versions for a deal.
 */
export async function listVersions(
  dealId: string,
  filter?: VersionFilter,
  storeInstance: StoreInterface = defaultStore
): Promise<DealVersion[]> {
  return storeInstance.listVersions(dealId, filter);
}

/**
 * Update a version.
 */
export async function updateVersion(
  id: string,
  updates: UpdateVersionInput,
  storeInstance: StoreInterface = defaultStore
): Promise<DealVersion | null> {
  return storeInstance.updateVersion(id, updates);
}

/**
 * Get version history (lineage) for a deal.
 * Returns versions in chronological order.
 */
export async function getVersionHistory(
  dealId: string,
  storeInstance: StoreInterface = defaultStore
): Promise<DealVersion[]> {
  return storeInstance.listVersions(dealId);
}

/**
 * Mark a version as sent to counterparty.
 */
export async function sendVersion(
  id: string,
  storeInstance: StoreInterface = defaultStore
): Promise<DealVersion | null> {
  const version = await storeInstance.getVersion(id);
  if (!version) return null;

  if (version.status !== 'draft') {
    throw new Error(`Cannot send version with status '${version.status}' - must be 'draft'`);
  }

  return storeInstance.updateVersion(id, { status: 'sent' });
}

/**
 * Mark a version as received from counterparty.
 */
export async function receiveVersion(
  dealId: string,
  input: CreateVersionInput,
  storeInstance: StoreInterface = defaultStore
): Promise<DealVersion> {
  const version = await storeInstance.createVersion(dealId, input);
  await storeInstance.updateVersion(version.id, { status: 'received' });

  // Supersede the parent version if provided
  if (input.parentVersionId) {
    await storeInstance.updateVersion(input.parentVersionId, { status: 'superseded' });
  }

  return (await storeInstance.getVersion(version.id))!;
}

/**
 * Create a new version based on an existing version (markup).
 */
export async function createMarkup(
  parentVersionId: string,
  creditLangCode: string,
  authorParty: string,
  createdBy: string,
  storeInstance: StoreInterface = defaultStore
): Promise<DealVersion> {
  const parentVersion = await storeInstance.getVersion(parentVersionId);
  if (!parentVersion) {
    throw new Error(`Parent version not found: ${parentVersionId}`);
  }

  return storeInstance.createVersion(parentVersion.dealId, {
    versionLabel: `${authorParty}'s Markup`,
    creditLangCode,
    createdBy,
    authorParty,
    parentVersionId,
  });
}

// =============================================================================
// PARTY OPERATIONS
// =============================================================================

/**
 * Add a party to a deal.
 */
export async function addParty(
  dealId: string,
  input: AddPartyInput,
  storeInstance: StoreInterface = defaultStore
): Promise<DealParty> {
  return storeInstance.addParty(dealId, input);
}

/**
 * Remove a party from a deal.
 */
export async function removeParty(
  dealId: string,
  partyId: string,
  storeInstance: StoreInterface = defaultStore
): Promise<boolean> {
  return storeInstance.removeParty(dealId, partyId);
}

/**
 * List parties for a deal.
 */
export async function listParties(
  dealId: string,
  storeInstance: StoreInterface = defaultStore
): Promise<DealParty[]> {
  return storeInstance.listParties(dealId);
}

// =============================================================================
// CHANGE TRACKING
// =============================================================================

/**
 * Compare two versions and generate a change summary.
 * This is a simplified implementation - full implementation would parse
 * and diff the ProViso ASTs.
 */
export function compareVersions(
  fromVersion: DealVersion,
  toVersion: DealVersion
): ChangeSummary {
  const changes: Change[] = [];

  // Simple line-based diff for now
  // In Phase 3, this will use AST diffing
  const fromLines = fromVersion.creditLangCode.split('\n');
  const toLines = toVersion.creditLangCode.split('\n');

  const fromSet = new Set(fromLines.map((l) => l.trim()).filter((l) => l));
  const toSet = new Set(toLines.map((l) => l.trim()).filter((l) => l));

  // Find removed lines
  for (const line of fromSet) {
    if (!toSet.has(line) && line) {
      const elementType = detectElementType(line);
      changes.push({
        id: generateId(),
        changeType: 'removed',
        elementType,
        sectionReference: '',
        elementName: extractElementName(line),
        title: `${elementType} removed`,
        description: `Removed: ${line.substring(0, 50)}...`,
        rationale: null,
        beforeCode: line,
        afterCode: null,
        beforeValue: null,
        afterValue: null,
        impact: 'unclear',
        impactDescription: null,
        sourceForm: null,
        isManualEdit: true,
      });
    }
  }

  // Find added lines
  for (const line of toSet) {
    if (!fromSet.has(line) && line) {
      const elementType = detectElementType(line);
      changes.push({
        id: generateId(),
        changeType: 'added',
        elementType,
        sectionReference: '',
        elementName: extractElementName(line),
        title: `${elementType} added`,
        description: `Added: ${line.substring(0, 50)}...`,
        rationale: null,
        beforeCode: null,
        afterCode: line,
        beforeValue: null,
        afterValue: null,
        impact: 'unclear',
        impactDescription: null,
        sourceForm: null,
        isManualEdit: true,
      });
    }
  }

  // Classify impacts
  const covenantChanges = changes.filter((c) => c.elementType === 'covenant').length;
  const definitionChanges = changes.filter((c) => c.elementType === 'definition').length;
  const basketChanges = changes.filter((c) => c.elementType === 'basket').length;
  const otherChanges = changes.length - covenantChanges - definitionChanges - basketChanges;

  return {
    versionFrom: fromVersion.versionNumber,
    versionTo: toVersion.versionNumber,
    authorParty: toVersion.authorParty,
    createdAt: new Date(),
    totalChanges: changes.length,
    covenantChanges,
    definitionChanges,
    basketChanges,
    otherChanges,
    borrowerFavorable: 0, // Would be computed from impact analysis
    lenderFavorable: 0,
    neutral: changes.length,
    changes,
  };
}

/**
 * Detect element type from a code line.
 */
function detectElementType(line: string): ElementType {
  const upper = line.toUpperCase().trim();
  if (upper.startsWith('COVENANT')) return 'covenant';
  if (upper.startsWith('BASKET')) return 'basket';
  if (upper.startsWith('DEFINE')) return 'definition';
  if (upper.startsWith('CONDITION')) return 'condition';
  if (upper.startsWith('PHASE')) return 'phase';
  if (upper.startsWith('MILESTONE')) return 'milestone';
  if (upper.startsWith('RESERVE')) return 'reserve';
  if (upper.startsWith('WATERFALL')) return 'waterfall';
  if (upper.startsWith('CONDITIONS_PRECEDENT')) return 'cp';
  return 'other';
}

/**
 * Extract element name from a code line.
 */
function extractElementName(line: string): string {
  const match = line.match(/^(?:COVENANT|BASKET|DEFINE|CONDITION|PHASE|MILESTONE|RESERVE)\s+(\w+)/i);
  return match && match[1] ? match[1] : 'Unknown';
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Get the current version of a deal.
 */
export async function getCurrentVersion(
  dealId: string,
  storeInstance: StoreInterface = defaultStore
): Promise<DealVersion | null> {
  const deal = await storeInstance.getDeal(dealId);
  if (!deal || !deal.currentVersionId) return null;
  return storeInstance.getVersion(deal.currentVersionId);
}

/**
 * Get a deal with its current version populated.
 */
export async function getDealWithCurrentVersion(
  dealId: string,
  storeInstance: StoreInterface = defaultStore
): Promise<{ deal: Deal; currentVersion: DealVersion | null } | null> {
  const deal = await storeInstance.getDeal(dealId);
  if (!deal) return null;

  const currentVersion = deal.currentVersionId
    ? await storeInstance.getVersion(deal.currentVersionId)
    : null;

  return { deal, currentVersion };
}
