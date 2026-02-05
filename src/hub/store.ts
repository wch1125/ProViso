/**
 * ProViso Hub v2.0 — Persistence Layer
 *
 * In-memory store implementation with a clean interface that can be
 * swapped for PostgreSQL or other backends later.
 */

/* eslint-disable @typescript-eslint/require-await */
// Note: Methods are async to match StoreInterface for future PostgreSQL implementation

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
  ConditionPrecedent,
  Document,
  FinancialSubmission,
  DrawRequest,
} from './types.js';

// =============================================================================
// STORE INTERFACE
// =============================================================================

/**
 * Abstract interface for the persistence layer.
 * Allows swapping in-memory store for database later.
 */
export interface StoreInterface {
  // Deal operations
  createDeal(input: CreateDealInput): Promise<Deal>;
  getDeal(id: string): Promise<Deal | null>;
  listDeals(filter?: DealFilter): Promise<Deal[]>;
  updateDeal(id: string, updates: UpdateDealInput): Promise<Deal | null>;
  deleteDeal(id: string): Promise<boolean>;

  // Version operations
  createVersion(dealId: string, input: CreateVersionInput): Promise<DealVersion>;
  getVersion(id: string): Promise<DealVersion | null>;
  listVersions(dealId: string, filter?: VersionFilter): Promise<DealVersion[]>;
  updateVersion(id: string, updates: UpdateVersionInput): Promise<DealVersion | null>;

  // Party operations
  addParty(dealId: string, input: AddPartyInput): Promise<DealParty>;
  removeParty(dealId: string, partyId: string): Promise<boolean>;
  listParties(dealId: string): Promise<DealParty[]>;

  // Utility
  generateId(): string;
  clear(): Promise<void>;
}

// =============================================================================
// ID GENERATION
// =============================================================================

/**
 * Generate a unique ID using crypto.randomUUID if available,
 * otherwise fall back to a simple implementation.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// =============================================================================
// IN-MEMORY STORE IMPLEMENTATION
// =============================================================================

/**
 * In-memory implementation of the store.
 * Data is stored in Maps and lost when the process exits.
 */
export class InMemoryStore implements StoreInterface {
  private deals: Map<string, Deal> = new Map();
  private versions: Map<string, DealVersion> = new Map();
  private parties: Map<string, DealParty> = new Map();
  private conditions: Map<string, ConditionPrecedent> = new Map();
  private documents: Map<string, Document> = new Map();
  private submissions: Map<string, FinancialSubmission> = new Map();
  private drawRequests: Map<string, DrawRequest> = new Map();

  // Version counter per deal for incrementing version numbers
  private versionCounters: Map<string, number> = new Map();

  // -------------------------------------------------------------------------
  // Deal Operations
  // -------------------------------------------------------------------------

  async createDeal(input: CreateDealInput): Promise<Deal> {
    const id = this.generateId();
    const now = new Date();

    const deal: Deal = {
      id,
      name: input.name,
      dealType: input.dealType,
      facilityAmount: input.facilityAmount,
      currency: input.currency,
      status: 'draft',
      currentVersionId: null,
      parties: [],
      targetClosingDate: input.targetClosingDate ?? null,
      actualClosingDate: null,
      maturityDate: input.maturityDate ?? null,
      createdAt: now,
      updatedAt: now,
      createdBy: input.createdBy,
    };

    this.deals.set(id, deal);
    this.versionCounters.set(id, 0);

    return deal;
  }

  async getDeal(id: string): Promise<Deal | null> {
    const deal = this.deals.get(id);
    if (!deal) return null;

    // Populate parties
    const parties = await this.listParties(id);
    return { ...deal, parties };
  }

  async listDeals(filter?: DealFilter): Promise<Deal[]> {
    let deals = Array.from(this.deals.values());

    if (filter) {
      if (filter.status) {
        const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
        deals = deals.filter((d) => statuses.includes(d.status));
      }

      if (filter.dealType) {
        deals = deals.filter((d) => d.dealType === filter.dealType);
      }

      if (filter.createdBy) {
        deals = deals.filter((d) => d.createdBy === filter.createdBy);
      }

      if (filter.searchTerm) {
        const term = filter.searchTerm.toLowerCase();
        deals = deals.filter((d) => d.name.toLowerCase().includes(term));
      }
    }

    // Sort by updatedAt descending
    deals.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    // Populate parties for each deal
    return Promise.all(
      deals.map(async (deal) => ({
        ...deal,
        parties: await this.listParties(deal.id),
      }))
    );
  }

  async updateDeal(id: string, updates: UpdateDealInput): Promise<Deal | null> {
    const deal = this.deals.get(id);
    if (!deal) return null;

    const updatedDeal: Deal = {
      ...deal,
      ...updates,
      updatedAt: new Date(),
    };

    this.deals.set(id, updatedDeal);

    return this.getDeal(id);
  }

  async deleteDeal(id: string): Promise<boolean> {
    if (!this.deals.has(id)) return false;

    // Delete all associated versions
    for (const [versionId, version] of this.versions.entries()) {
      if (version.dealId === id) {
        this.versions.delete(versionId);
      }
    }

    // Delete all associated parties
    for (const [partyId, party] of this.parties.entries()) {
      if (party.dealId === id) {
        this.parties.delete(partyId);
      }
    }

    // Delete the deal itself
    this.deals.delete(id);
    this.versionCounters.delete(id);

    return true;
  }

  // -------------------------------------------------------------------------
  // Version Operations
  // -------------------------------------------------------------------------

  async createVersion(dealId: string, input: CreateVersionInput): Promise<DealVersion> {
    const deal = this.deals.get(dealId);
    if (!deal) {
      throw new Error(`Deal not found: ${dealId}`);
    }

    const id = this.generateId();
    const currentCount = this.versionCounters.get(dealId) ?? 0;
    const versionNumber = currentCount + 1;
    this.versionCounters.set(dealId, versionNumber);

    const version: DealVersion = {
      id,
      dealId,
      versionNumber,
      versionLabel: input.versionLabel,
      creditLangCode: input.creditLangCode,
      createdBy: input.createdBy,
      authorParty: input.authorParty,
      createdAt: new Date(),
      parentVersionId: input.parentVersionId ?? null,
      status: 'draft',
      generatedWordDoc: null,
      changeSummary: null,
    };

    this.versions.set(id, version);

    // Update deal's current version
    this.deals.set(dealId, {
      ...deal,
      currentVersionId: id,
      updatedAt: new Date(),
    });

    return version;
  }

  async getVersion(id: string): Promise<DealVersion | null> {
    return this.versions.get(id) ?? null;
  }

  async listVersions(dealId: string, filter?: VersionFilter): Promise<DealVersion[]> {
    let versions = Array.from(this.versions.values()).filter((v) => v.dealId === dealId);

    if (filter) {
      if (filter.status) {
        const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
        versions = versions.filter((v) => statuses.includes(v.status));
      }

      if (filter.authorParty) {
        versions = versions.filter((v) => v.authorParty === filter.authorParty);
      }
    }

    // Sort by version number ascending
    versions.sort((a, b) => a.versionNumber - b.versionNumber);

    return versions;
  }

  async updateVersion(id: string, updates: UpdateVersionInput): Promise<DealVersion | null> {
    const version = this.versions.get(id);
    if (!version) return null;

    const updatedVersion: DealVersion = {
      ...version,
      ...updates,
    };

    this.versions.set(id, updatedVersion);

    return updatedVersion;
  }

  /**
   * Get version history (lineage) for a deal.
   * Returns versions in chronological order with parent→child relationships.
   */
  async getVersionHistory(dealId: string): Promise<DealVersion[]> {
    const versions = await this.listVersions(dealId);
    return versions; // Already sorted chronologically
  }

  // -------------------------------------------------------------------------
  // Party Operations
  // -------------------------------------------------------------------------

  async addParty(dealId: string, input: AddPartyInput): Promise<DealParty> {
    const deal = this.deals.get(dealId);
    if (!deal) {
      throw new Error(`Deal not found: ${dealId}`);
    }

    const id = this.generateId();

    const party: DealParty = {
      id,
      dealId,
      name: input.name,
      shortName: input.shortName,
      role: input.role,
      partyType: input.partyType,
      primaryContact: input.primaryContact,
      additionalContacts: input.additionalContacts ?? [],
      counselPartyId: input.counselPartyId ?? null,
    };

    this.parties.set(id, party);

    // Update deal's updatedAt
    this.deals.set(dealId, {
      ...deal,
      updatedAt: new Date(),
    });

    return party;
  }

  async removeParty(dealId: string, partyId: string): Promise<boolean> {
    const party = this.parties.get(partyId);
    if (!party || party.dealId !== dealId) return false;

    this.parties.delete(partyId);

    const deal = this.deals.get(dealId);
    if (deal) {
      this.deals.set(dealId, {
        ...deal,
        updatedAt: new Date(),
      });
    }

    return true;
  }

  async listParties(dealId: string): Promise<DealParty[]> {
    return Array.from(this.parties.values()).filter((p) => p.dealId === dealId);
  }

  // -------------------------------------------------------------------------
  // Utility
  // -------------------------------------------------------------------------

  generateId(): string {
    return generateId();
  }

  /**
   * Clear all data from the store.
   */
  async clear(): Promise<void> {
    this.deals.clear();
    this.versions.clear();
    this.parties.clear();
    this.conditions.clear();
    this.documents.clear();
    this.submissions.clear();
    this.drawRequests.clear();
    this.versionCounters.clear();
  }

  /**
   * Get counts for debugging/testing.
   */
  getCounts(): { deals: number; versions: number; parties: number } {
    return {
      deals: this.deals.size,
      versions: this.versions.size,
      parties: this.parties.size,
    };
  }
}

// =============================================================================
// DEFAULT STORE INSTANCE
// =============================================================================

/**
 * Singleton store instance for convenience.
 * Can be replaced with a different implementation.
 */
export const store = new InMemoryStore();
