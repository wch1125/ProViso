/**
 * ProViso Hub v2.0 — Unit Tests
 *
 * Tests for the Hub data layer: store, API, and types.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  InMemoryStore,
  generateId,
  createDeal,
  getDeal,
  listDeals,
  updateDeal,
  deleteDeal,
  transitionDealStatus,
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
  addParty,
  removeParty,
  listParties,
  compareVersions,
} from '../src/hub/index.js';
import { PartyRole } from '../src/closing-enums.js';
import type { CreateDealInput, CreateVersionInput, AddPartyInput } from '../src/hub/types.js';

// =============================================================================
// ID GENERATION
// =============================================================================

describe('generateId', () => {
  it('should generate unique IDs', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(100);
  });

  it('should generate valid UUID format', () => {
    const id = generateId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });
});

// =============================================================================
// STORE ISOLATION
// =============================================================================

describe('Store Isolation', () => {
  it('should maintain separate state between store instances', async () => {
    const store1 = new InMemoryStore();
    const store2 = new InMemoryStore();

    await store1.createDeal({
      name: 'Deal 1',
      dealType: 'corporate',
      facilityAmount: 100_000_000,
      currency: 'USD',
      createdBy: 'user1',
    });

    await store2.createDeal({
      name: 'Deal 2',
      dealType: 'project_finance',
      facilityAmount: 200_000_000,
      currency: 'USD',
      createdBy: 'user2',
    });

    const deals1 = await store1.listDeals();
    const deals2 = await store2.listDeals();

    expect(deals1).toHaveLength(1);
    expect(deals1[0].name).toBe('Deal 1');
    expect(deals2).toHaveLength(1);
    expect(deals2[0].name).toBe('Deal 2');
  });

  it('should clear all data', async () => {
    const store = new InMemoryStore();

    await store.createDeal({
      name: 'Test Deal',
      dealType: 'corporate',
      facilityAmount: 100_000_000,
      currency: 'USD',
      createdBy: 'user',
    });

    expect((await store.listDeals()).length).toBe(1);

    await store.clear();

    expect((await store.listDeals()).length).toBe(0);
  });
});

// =============================================================================
// DEAL CRUD
// =============================================================================

describe('Deal Operations', () => {
  let store: InMemoryStore;

  beforeEach(async () => {
    store = new InMemoryStore();
  });

  const sampleDealInput: CreateDealInput = {
    name: 'Test Facility',
    dealType: 'corporate',
    facilityAmount: 150_000_000,
    currency: 'USD',
    createdBy: 'test@example.com',
  };

  describe('createDeal', () => {
    it('should create a deal with correct properties', async () => {
      const deal = await createDeal(sampleDealInput, store);

      expect(deal.id).toBeDefined();
      expect(deal.name).toBe('Test Facility');
      expect(deal.dealType).toBe('corporate');
      expect(deal.facilityAmount).toBe(150_000_000);
      expect(deal.currency).toBe('USD');
      expect(deal.status).toBe('draft');
      expect(deal.currentVersionId).toBeNull();
      expect(deal.parties).toEqual([]);
      expect(deal.createdAt).toBeInstanceOf(Date);
      expect(deal.updatedAt).toBeInstanceOf(Date);
    });

    it('should set optional dates', async () => {
      const deal = await createDeal(
        {
          ...sampleDealInput,
          targetClosingDate: new Date('2026-06-01'),
          maturityDate: new Date('2031-06-01'),
        },
        store
      );

      expect(deal.targetClosingDate).toEqual(new Date('2026-06-01'));
      expect(deal.maturityDate).toEqual(new Date('2031-06-01'));
    });
  });

  describe('getDeal', () => {
    it('should retrieve a deal by ID', async () => {
      const created = await createDeal(sampleDealInput, store);
      const retrieved = await getDeal(created.id, store);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe('Test Facility');
    });

    it('should return null for non-existent ID', async () => {
      const retrieved = await getDeal('non-existent-id', store);
      expect(retrieved).toBeNull();
    });
  });

  describe('listDeals', () => {
    beforeEach(async () => {
      await createDeal(sampleDealInput, store);
      await createDeal(
        { ...sampleDealInput, name: 'Second Deal', dealType: 'project_finance' },
        store
      );
      await createDeal(
        { ...sampleDealInput, name: 'Third Deal', createdBy: 'other@example.com' },
        store
      );
    });

    it('should list all deals', async () => {
      const deals = await listDeals(undefined, store);
      expect(deals).toHaveLength(3);
    });

    it('should filter by dealType', async () => {
      const deals = await listDeals({ dealType: 'project_finance' }, store);
      expect(deals).toHaveLength(1);
      expect(deals[0].name).toBe('Second Deal');
    });

    it('should filter by createdBy', async () => {
      const deals = await listDeals({ createdBy: 'other@example.com' }, store);
      expect(deals).toHaveLength(1);
      expect(deals[0].name).toBe('Third Deal');
    });

    it('should filter by searchTerm', async () => {
      const deals = await listDeals({ searchTerm: 'second' }, store);
      expect(deals).toHaveLength(1);
      expect(deals[0].name).toBe('Second Deal');
    });
  });

  describe('updateDeal', () => {
    it('should update deal properties', async () => {
      const deal = await createDeal(sampleDealInput, store);
      const updated = await updateDeal(
        deal.id,
        { name: 'Updated Facility', facilityAmount: 200_000_000 },
        store
      );

      expect(updated?.name).toBe('Updated Facility');
      expect(updated?.facilityAmount).toBe(200_000_000);
      // updatedAt should be >= createdAt (may be same timestamp if fast)
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(deal.updatedAt.getTime());
    });

    it('should return null for non-existent ID', async () => {
      const updated = await updateDeal('non-existent-id', { name: 'New Name' }, store);
      expect(updated).toBeNull();
    });
  });

  describe('deleteDeal', () => {
    it('should delete a deal and its versions', async () => {
      const deal = await createDeal(sampleDealInput, store);
      await createVersion(
        deal.id,
        {
          versionLabel: 'v1',
          creditLangCode: '// test',
          createdBy: 'user',
          authorParty: 'Lender',
        },
        store
      );

      const deleted = await deleteDeal(deal.id, store);
      expect(deleted).toBe(true);

      const retrieved = await getDeal(deal.id, store);
      expect(retrieved).toBeNull();

      const versions = await listVersions(deal.id, undefined, store);
      expect(versions).toHaveLength(0);
    });

    it('should return false for non-existent ID', async () => {
      const deleted = await deleteDeal('non-existent-id', store);
      expect(deleted).toBe(false);
    });
  });

  describe('transitionDealStatus', () => {
    it('should transition from draft to negotiation', async () => {
      const deal = await createDeal(sampleDealInput, store);
      const updated = await transitionDealStatus(deal.id, 'negotiation', store);

      expect(updated?.status).toBe('negotiation');
    });

    it('should reject invalid transitions', async () => {
      const deal = await createDeal(sampleDealInput, store);

      await expect(
        transitionDealStatus(deal.id, 'active', store)
      ).rejects.toThrow("Invalid status transition");
    });

    it('should allow negotiation to closing', async () => {
      const deal = await createDeal(sampleDealInput, store);
      await transitionDealStatus(deal.id, 'negotiation', store);
      const updated = await transitionDealStatus(deal.id, 'closing', store);

      expect(updated?.status).toBe('closing');
    });
  });
});

// =============================================================================
// VERSION CRUD
// =============================================================================

describe('Version Operations', () => {
  let store: InMemoryStore;
  let dealId: string;

  beforeEach(async () => {
    store = new InMemoryStore();
    const deal = await createDeal(
      {
        name: 'Test Facility',
        dealType: 'corporate',
        facilityAmount: 100_000_000,
        currency: 'USD',
        createdBy: 'user@example.com',
      },
      store
    );
    dealId = deal.id;
  });

  const sampleVersionInput: CreateVersionInput = {
    versionLabel: "Lender's Draft",
    creditLangCode: 'COVENANT Test REQUIRES X <= 5.0',
    createdBy: 'user@example.com',
    authorParty: 'Lender Counsel',
  };

  describe('createVersion', () => {
    it('should create a version with incrementing numbers', async () => {
      const v1 = await createVersion(dealId, sampleVersionInput, store);
      const v2 = await createVersion(
        dealId,
        { ...sampleVersionInput, versionLabel: 'v2', parentVersionId: v1.id },
        store
      );

      expect(v1.versionNumber).toBe(1);
      expect(v2.versionNumber).toBe(2);
    });

    it('should set deal currentVersionId', async () => {
      const version = await createVersion(dealId, sampleVersionInput, store);
      const deal = await getDeal(dealId, store);

      expect(deal?.currentVersionId).toBe(version.id);
    });

    it('should throw for non-existent deal', async () => {
      await expect(
        createVersion('non-existent', sampleVersionInput, store)
      ).rejects.toThrow('Deal not found');
    });
  });

  describe('getVersion', () => {
    it('should retrieve version by ID', async () => {
      const created = await createVersion(dealId, sampleVersionInput, store);
      const retrieved = await getVersion(created.id, store);

      expect(retrieved?.versionLabel).toBe("Lender's Draft");
      expect(retrieved?.creditLangCode).toBe('COVENANT Test REQUIRES X <= 5.0');
    });
  });

  describe('listVersions', () => {
    beforeEach(async () => {
      const v1 = await createVersion(dealId, sampleVersionInput, store);
      await updateVersion(v1.id, { status: 'sent' }, store);

      await createVersion(
        dealId,
        { ...sampleVersionInput, authorParty: 'Borrower Counsel', parentVersionId: v1.id },
        store
      );
    });

    it('should list all versions for a deal', async () => {
      const versions = await listVersions(dealId, undefined, store);
      expect(versions).toHaveLength(2);
    });

    it('should filter by status', async () => {
      const versions = await listVersions(dealId, { status: 'sent' }, store);
      expect(versions).toHaveLength(1);
    });

    it('should filter by authorParty', async () => {
      const versions = await listVersions(
        dealId,
        { authorParty: 'Borrower Counsel' },
        store
      );
      expect(versions).toHaveLength(1);
    });

    it('should return versions in chronological order', async () => {
      const versions = await listVersions(dealId, undefined, store);
      expect(versions[0].versionNumber).toBe(1);
      expect(versions[1].versionNumber).toBe(2);
    });
  });

  describe('updateVersion', () => {
    it('should update version properties', async () => {
      const version = await createVersion(dealId, sampleVersionInput, store);
      const updated = await updateVersion(
        version.id,
        { status: 'sent', versionLabel: 'Final Draft' },
        store
      );

      expect(updated?.status).toBe('sent');
      expect(updated?.versionLabel).toBe('Final Draft');
    });
  });

  describe('sendVersion', () => {
    it('should mark version as sent', async () => {
      const version = await createVersion(dealId, sampleVersionInput, store);
      const sent = await sendVersion(version.id, store);

      expect(sent?.status).toBe('sent');
    });

    it('should reject non-draft versions', async () => {
      const version = await createVersion(dealId, sampleVersionInput, store);
      await sendVersion(version.id, store);

      await expect(sendVersion(version.id, store)).rejects.toThrow(
        "Cannot send version with status 'sent'"
      );
    });
  });

  describe('receiveVersion', () => {
    it('should create received version and supersede parent', async () => {
      const v1 = await createVersion(dealId, sampleVersionInput, store);
      await sendVersion(v1.id, store);

      const v2 = await receiveVersion(
        dealId,
        {
          versionLabel: "Borrower's Markup",
          creditLangCode: 'COVENANT Test REQUIRES X <= 5.5',
          createdBy: 'borrower@example.com',
          authorParty: 'Borrower Counsel',
          parentVersionId: v1.id,
        },
        store
      );

      expect(v2.status).toBe('received');

      const v1Updated = await getVersion(v1.id, store);
      expect(v1Updated?.status).toBe('superseded');
    });
  });

  describe('createMarkup', () => {
    it('should create markup from parent version', async () => {
      const v1 = await createVersion(dealId, sampleVersionInput, store);
      const markup = await createMarkup(
        v1.id,
        'COVENANT Test REQUIRES X <= 6.0',
        'Borrower Counsel',
        'borrower@example.com',
        store
      );

      expect(markup.parentVersionId).toBe(v1.id);
      expect(markup.authorParty).toBe('Borrower Counsel');
      expect(markup.versionLabel).toBe("Borrower Counsel's Markup");
    });
  });

  describe('getVersionHistory', () => {
    it('should return chronological version history', async () => {
      const v1 = await createVersion(dealId, sampleVersionInput, store);
      const v2 = await createVersion(
        dealId,
        { ...sampleVersionInput, parentVersionId: v1.id },
        store
      );
      const v3 = await createVersion(
        dealId,
        { ...sampleVersionInput, parentVersionId: v2.id },
        store
      );

      const history = await getVersionHistory(dealId, store);

      expect(history).toHaveLength(3);
      expect(history[0].id).toBe(v1.id);
      expect(history[1].id).toBe(v2.id);
      expect(history[2].id).toBe(v3.id);
    });
  });

  describe('getCurrentVersion', () => {
    it('should return current version', async () => {
      await createVersion(dealId, sampleVersionInput, store);
      const v2 = await createVersion(
        dealId,
        { ...sampleVersionInput, versionLabel: 'v2' },
        store
      );

      const current = await getCurrentVersion(dealId, store);
      expect(current?.id).toBe(v2.id);
    });

    it('should return null if no versions', async () => {
      const deal = await createDeal(
        {
          name: 'Empty Deal',
          dealType: 'corporate',
          facilityAmount: 100,
          currency: 'USD',
          createdBy: 'user',
        },
        store
      );

      const current = await getCurrentVersion(deal.id, store);
      expect(current).toBeNull();
    });
  });

  describe('getDealWithCurrentVersion', () => {
    it('should return deal with its current version', async () => {
      const version = await createVersion(dealId, sampleVersionInput, store);
      const result = await getDealWithCurrentVersion(dealId, store);

      expect(result).not.toBeNull();
      expect(result?.deal.id).toBe(dealId);
      expect(result?.currentVersion?.id).toBe(version.id);
    });
  });
});

// =============================================================================
// PARTY MANAGEMENT
// =============================================================================

describe('Party Operations', () => {
  let store: InMemoryStore;
  let dealId: string;

  beforeEach(async () => {
    store = new InMemoryStore();
    const deal = await createDeal(
      {
        name: 'Test Facility',
        dealType: 'corporate',
        facilityAmount: 100_000_000,
        currency: 'USD',
        createdBy: 'user@example.com',
      },
      store
    );
    dealId = deal.id;
  });

  const samplePartyInput: AddPartyInput = {
    name: 'ABC Holdings, Inc.',
    shortName: 'ABC',
    role: PartyRole.BORROWER,
    partyType: 'borrower',
    primaryContact: {
      name: 'John Doe',
      email: 'jdoe@abc.com',
      phone: '+1-555-0100',
      title: 'CFO',
    },
  };

  describe('addParty', () => {
    it('should add a party to a deal', async () => {
      const party = await addParty(dealId, samplePartyInput, store);

      expect(party.id).toBeDefined();
      expect(party.dealId).toBe(dealId);
      expect(party.name).toBe('ABC Holdings, Inc.');
      expect(party.role).toBe(PartyRole.BORROWER);
    });

    it('should include party in deal.parties', async () => {
      await addParty(dealId, samplePartyInput, store);
      const deal = await getDeal(dealId, store);

      expect(deal?.parties).toHaveLength(1);
      expect(deal?.parties[0].name).toBe('ABC Holdings, Inc.');
    });
  });

  describe('listParties', () => {
    it('should list all parties for a deal', async () => {
      await addParty(dealId, samplePartyInput, store);
      await addParty(
        dealId,
        { ...samplePartyInput, name: 'First National Bank', role: PartyRole.LENDER },
        store
      );

      const parties = await listParties(dealId, store);
      expect(parties).toHaveLength(2);
    });
  });

  describe('removeParty', () => {
    it('should remove a party from a deal', async () => {
      const party = await addParty(dealId, samplePartyInput, store);
      const removed = await removeParty(dealId, party.id, store);

      expect(removed).toBe(true);

      const parties = await listParties(dealId, store);
      expect(parties).toHaveLength(0);
    });

    it('should return false for non-existent party', async () => {
      const removed = await removeParty(dealId, 'non-existent', store);
      expect(removed).toBe(false);
    });
  });
});

// =============================================================================
// CHANGE TRACKING
// =============================================================================

describe('Change Tracking', () => {
  it('should detect added elements', () => {
    const fromVersion = {
      id: 'v1',
      dealId: 'd1',
      versionNumber: 1,
      versionLabel: 'v1',
      creditLangCode: 'COVENANT A REQUIRES X <= 5',
      createdBy: 'user',
      authorParty: 'Lender',
      createdAt: new Date(),
      parentVersionId: null,
      status: 'sent' as const,
      generatedWordDoc: null,
      changeSummary: null,
    };

    const toVersion = {
      ...fromVersion,
      id: 'v2',
      versionNumber: 2,
      creditLangCode: 'COVENANT A REQUIRES X <= 5\nCOVENANT B REQUIRES Y >= 2',
      authorParty: 'Borrower',
    };

    const summary = compareVersions(fromVersion, toVersion);

    expect(summary.totalChanges).toBeGreaterThan(0);
    expect(summary.versionFrom).toBe(1);
    expect(summary.versionTo).toBe(2);
    expect(summary.authorParty).toBe('Borrower');
  });

  it('should detect removed elements', () => {
    const fromVersion = {
      id: 'v1',
      dealId: 'd1',
      versionNumber: 1,
      versionLabel: 'v1',
      creditLangCode: 'BASKET A CAPACITY $50_000_000\nBASKET B CAPACITY $25_000_000',
      createdBy: 'user',
      authorParty: 'Lender',
      createdAt: new Date(),
      parentVersionId: null,
      status: 'sent' as const,
      generatedWordDoc: null,
      changeSummary: null,
    };

    const toVersion = {
      ...fromVersion,
      id: 'v2',
      versionNumber: 2,
      creditLangCode: 'BASKET A CAPACITY $50_000_000',
      authorParty: 'Borrower',
    };

    const summary = compareVersions(fromVersion, toVersion);

    expect(summary.totalChanges).toBeGreaterThan(0);
    expect(summary.changes.some((c) => c.changeType === 'removed')).toBe(true);
  });

  it('should classify element types correctly', () => {
    const fromVersion = {
      id: 'v1',
      dealId: 'd1',
      versionNumber: 1,
      versionLabel: 'v1',
      creditLangCode: '',
      createdBy: 'user',
      authorParty: 'Lender',
      createdAt: new Date(),
      parentVersionId: null,
      status: 'sent' as const,
      generatedWordDoc: null,
      changeSummary: null,
    };

    const toVersion = {
      ...fromVersion,
      id: 'v2',
      versionNumber: 2,
      creditLangCode: `
        COVENANT Test REQUIRES X <= 5
        BASKET Investments CAPACITY $10M
        DEFINE EBITDA AS Revenue - Expenses
        PHASE Construction UNTIL COD
        MILESTONE Foundation TARGET 2026-06-01
        RESERVE DebtService TARGET $5M
      `,
    };

    const summary = compareVersions(fromVersion, toVersion);

    expect(summary.covenantChanges).toBeGreaterThan(0);
    expect(summary.basketChanges).toBeGreaterThan(0);
    expect(summary.definitionChanges).toBeGreaterThan(0);
  });
});

// =============================================================================
// STORE COUNTS (DEBUG UTILITY)
// =============================================================================

describe('Store Utility Methods', () => {
  it('should return correct counts', async () => {
    const store = new InMemoryStore();

    const deal = await store.createDeal({
      name: 'Test',
      dealType: 'corporate',
      facilityAmount: 100,
      currency: 'USD',
      createdBy: 'user',
    });

    await store.createVersion(deal.id, {
      versionLabel: 'v1',
      creditLangCode: '// test',
      createdBy: 'user',
      authorParty: 'Lender',
    });

    await store.addParty(deal.id, {
      name: 'Party',
      shortName: 'P',
      role: PartyRole.BORROWER,
      partyType: 'borrower',
      primaryContact: { name: 'Test', email: 'test@test.com', phone: null, title: null },
    });

    const counts = store.getCounts();

    expect(counts.deals).toBe(1);
    expect(counts.versions).toBe(1);
    expect(counts.parties).toBe(1);
  });
});
