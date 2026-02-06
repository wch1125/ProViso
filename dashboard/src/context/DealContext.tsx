/**
 * Deal Context Provider
 *
 * Manages deal state across all dashboard modules (Negotiation, Closing, Monitoring).
 * Persists deals to localStorage for demo continuity.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';

import {
  getScenarioById,
  demoScenarios,
  type Deal,
  type DealVersion,
  type DealParty,
  type ChangeSummary,
} from '../data/demo-scenarios';

// Known scenario IDs for filtering out stale data
const KNOWN_SCENARIO_IDS = new Set(Object.keys(demoScenarios));

// Re-export types for convenience
export type { Deal, DealVersion, DealParty, ChangeSummary };

// =============================================================================
// ACTIVITY TYPES
// =============================================================================

export type ActivityType =
  | 'deal_created'
  | 'deal_updated'
  | 'version_created'
  | 'version_sent'
  | 'condition_satisfied'
  | 'condition_waived'
  | 'document_uploaded'
  | 'signature_received'
  | 'financial_updated'
  | 'simulation_run'
  | 'file_loaded'
  | 'covenant_alert';

export interface Activity {
  id: string;
  timestamp: Date;
  type: ActivityType;
  dealId: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// DEAL STATUS
// =============================================================================

export type DealStatus = 'draft' | 'negotiation' | 'closing' | 'active' | 'matured';

// =============================================================================
// CREATE DEAL INPUT
// =============================================================================

export interface CreateDealInput {
  name: string;
  dealType: 'corporate' | 'project_finance';
  facilityAmount: number;
  currency?: string;
  borrowerName: string;
  agentName?: string;
  targetClosingDate: Date | null;
}

// =============================================================================
// CONTEXT VALUE
// =============================================================================

interface DealContextValue {
  // State
  deals: Deal[];
  currentDeal: Deal | null;
  currentDealId: string | null;
  versions: DealVersion[];
  parties: DealParty[];
  activities: Activity[];

  // Deal operations
  createDeal: (input: CreateDealInput) => Deal;
  updateDeal: (dealId: string, updates: Partial<Deal>) => void;
  deleteDeal: (dealId: string) => void;
  selectDeal: (dealId: string | null) => void;
  getDeal: (dealId: string) => Deal | undefined;
  transitionDealStatus: (dealId: string, newStatus: DealStatus) => void;

  // Version operations
  getVersionsForDeal: (dealId: string) => DealVersion[];
  getCurrentVersion: (dealId: string) => DealVersion | undefined;
  createVersion: (dealId: string, code: string, label: string) => DealVersion;

  // Change summary cache (v2.5)
  getCachedChangeSummary: (fromId: string, toId: string) => ChangeSummary | undefined;
  cacheChangeSummary: (fromId: string, toId: string, summary: ChangeSummary) => void;

  // Party operations
  getPartiesForDeal: (dealId: string) => DealParty[];
  addParty: (party: Omit<DealParty, 'id'>) => DealParty;

  // Activity operations
  logActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  getActivitiesForDeal: (dealId: string) => Activity[];
  clearActivities: () => void;

  // Scenario loading
  loadScenario: (dealId: string) => void;

  // Reset
  resetToDefaults: () => void;
}

const DealContext = createContext<DealContextValue | null>(null);

// =============================================================================
// STORAGE KEYS
// =============================================================================

const STORAGE_KEY_DEALS = 'proviso_hub_deals';
const STORAGE_KEY_VERSIONS = 'proviso_hub_versions';
const STORAGE_KEY_PARTIES = 'proviso_hub_parties';
const STORAGE_KEY_ACTIVITIES = 'proviso_hub_activities';
const STORAGE_KEY_CURRENT_DEAL = 'proviso_hub_current_deal';

// =============================================================================
// HELPERS
// =============================================================================

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function cloneDeals(deals: Deal[]): Deal[] {
  return deals.map(deal => ({
    ...deal,
    targetClosingDate: deal.targetClosingDate ? new Date(deal.targetClosingDate) : null,
    actualClosingDate: deal.actualClosingDate ? new Date(deal.actualClosingDate) : null,
    maturityDate: deal.maturityDate ? new Date(deal.maturityDate) : null,
    createdAt: new Date(deal.createdAt),
    updatedAt: new Date(deal.updatedAt),
    parties: [], // Parties are stored separately
  }));
}

function cloneVersions(versions: DealVersion[]): DealVersion[] {
  return versions.map(v => ({
    ...v,
    createdAt: new Date(v.createdAt),
    changeSummary: v.changeSummary ? {
      ...v.changeSummary,
      createdAt: new Date(v.changeSummary.createdAt),
    } : null,
  }));
}

function cloneParties(parties: DealParty[]): DealParty[] {
  return parties.map(p => ({ ...p }));
}

function cloneActivities(activities: Activity[]): Activity[] {
  return activities.map(a => ({
    ...a,
    timestamp: new Date(a.timestamp),
  }));
}

// =============================================================================
// INITIAL DATA
// =============================================================================

function getInitialDeals(): Deal[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_DEALS);
    if (stored) {
      const parsed = JSON.parse(stored) as Deal[];
      // Filter out deals with old/unknown IDs to prevent duplicates
      const validDeals = parsed.filter(d => KNOWN_SCENARIO_IDS.has(d.id));
      if (validDeals.length > 0) {
        return cloneDeals(validDeals);
      }
    }
  } catch (e) {
    console.warn('Failed to load deals from localStorage:', e);
  }
  // Start fresh with no deals - they'll be loaded on demand via loadScenario
  return [];
}

function getInitialVersions(): DealVersion[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_VERSIONS);
    if (stored) {
      const parsed = JSON.parse(stored) as DealVersion[];
      // Filter out versions with old/unknown deal IDs
      const validVersions = parsed.filter(v => KNOWN_SCENARIO_IDS.has(v.dealId));
      if (validVersions.length > 0) {
        return cloneVersions(validVersions);
      }
    }
  } catch (e) {
    console.warn('Failed to load versions from localStorage:', e);
  }
  return [];
}

function getInitialParties(): DealParty[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PARTIES);
    if (stored) {
      const parsed = JSON.parse(stored) as DealParty[];
      // Filter out parties with old/unknown deal IDs
      const validParties = parsed.filter(p => KNOWN_SCENARIO_IDS.has(p.dealId));
      if (validParties.length > 0) {
        return cloneParties(validParties);
      }
    }
  } catch (e) {
    console.warn('Failed to load parties from localStorage:', e);
  }
  return [];
}

function getInitialActivities(): Activity[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
    if (stored) {
      return cloneActivities(JSON.parse(stored));
    }
  } catch (e) {
    console.warn('Failed to load activities from localStorage:', e);
  }
  return [];
}

function getInitialCurrentDeal(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CURRENT_DEAL);
    return stored ?? null;
  } catch {
    return null;
  }
}

// =============================================================================
// PROVIDER
// =============================================================================

interface DealProviderProps {
  children: ReactNode;
}

export function DealProvider({ children }: DealProviderProps) {
  const [deals, setDeals] = useState<Deal[]>(getInitialDeals);
  const [versions, setVersions] = useState<DealVersion[]>(getInitialVersions);
  const [parties, setParties] = useState<DealParty[]>(getInitialParties);
  const [activities, setActivities] = useState<Activity[]>(getInitialActivities);
  const [currentDealId, setCurrentDealId] = useState<string | null>(getInitialCurrentDeal);

  // Change summary cache (v2.5) — keyed by "fromId:toId"
  const [changeSummaryCache, setChangeSummaryCache] = useState<Map<string, ChangeSummary>>(new Map());

  const getCachedChangeSummary = useCallback((fromId: string, toId: string): ChangeSummary | undefined => {
    return changeSummaryCache.get(`${fromId}:${toId}`);
  }, [changeSummaryCache]);

  const cacheChangeSummary = useCallback((fromId: string, toId: string, summary: ChangeSummary) => {
    setChangeSummaryCache(prev => {
      const next = new Map(prev);
      next.set(`${fromId}:${toId}`, summary);
      return next;
    });
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DEALS, JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VERSIONS, JSON.stringify(versions));
  }, [versions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PARTIES, JSON.stringify(parties));
  }, [parties]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    if (currentDealId) {
      localStorage.setItem(STORAGE_KEY_CURRENT_DEAL, currentDealId);
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_DEAL);
    }
  }, [currentDealId]);

  // Current deal derived from ID
  const currentDeal = useMemo(() => {
    if (!currentDealId) return null;
    return deals.find(d => d.id === currentDealId) ?? null;
  }, [deals, currentDealId]);

  // Activity logging
  const logActivity = useCallback((activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      ...activity,
      id: generateId('activity'),
      timestamp: new Date(),
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 100)); // Keep last 100
  }, []);

  // Deal operations
  const createDeal = useCallback((input: CreateDealInput): Deal => {
    const now = new Date();
    const dealId = generateId('deal');

    const newDeal: Deal = {
      id: dealId,
      name: input.name,
      dealType: input.dealType,
      facilityAmount: input.facilityAmount,
      currency: input.currency ?? 'USD',
      status: 'draft',
      currentVersionId: null,
      parties: [],
      targetClosingDate: input.targetClosingDate,
      actualClosingDate: null,
      maturityDate: null,
      createdAt: now,
      updatedAt: now,
      createdBy: 'user@proviso.dev',
    };

    setDeals(prev => [...prev, newDeal]);

    // Create borrower party
    const borrowerParty: DealParty = {
      id: generateId('party'),
      dealId,
      name: input.borrowerName,
      shortName: input.borrowerName.split(' ')[0] ?? input.borrowerName,
      role: 'borrower' as unknown as DealParty['role'],
      partyType: 'borrower',
      primaryContact: {
        name: '',
        email: '',
        phone: null,
        title: null,
      },
      additionalContacts: [],
      counselPartyId: null,
    };
    setParties(prev => [...prev, borrowerParty]);

    // Create agent party if provided
    if (input.agentName) {
      const agentParty: DealParty = {
        id: generateId('party'),
        dealId,
        name: input.agentName,
        shortName: input.agentName.split(' ')[0] ?? input.agentName,
        role: 'administrative_agent' as unknown as DealParty['role'],
        partyType: 'agent',
        primaryContact: {
          name: '',
          email: '',
          phone: null,
          title: null,
        },
        additionalContacts: [],
        counselPartyId: null,
      };
      setParties(prev => [...prev, agentParty]);
    }

    logActivity({
      type: 'deal_created',
      dealId,
      title: 'Deal created',
      description: input.name,
    });

    return newDeal;
  }, [logActivity]);

  const updateDeal = useCallback((dealId: string, updates: Partial<Deal>) => {
    setDeals(prev => prev.map(deal => {
      if (deal.id !== dealId) return deal;
      return {
        ...deal,
        ...updates,
        updatedAt: new Date(),
      };
    }));

    logActivity({
      type: 'deal_updated',
      dealId,
      title: 'Deal updated',
      description: Object.keys(updates).join(', '),
    });
  }, [logActivity]);

  const deleteDeal = useCallback((dealId: string) => {
    setDeals(prev => prev.filter(d => d.id !== dealId));
    setVersions(prev => prev.filter(v => v.dealId !== dealId));
    setParties(prev => prev.filter(p => p.dealId !== dealId));
    if (currentDealId === dealId) {
      setCurrentDealId(null);
    }
  }, [currentDealId]);

  const selectDeal = useCallback((dealId: string | null) => {
    setCurrentDealId(dealId);
  }, []);

  const getDeal = useCallback((dealId: string): Deal | undefined => {
    return deals.find(d => d.id === dealId);
  }, [deals]);

  const transitionDealStatus = useCallback((dealId: string, newStatus: DealStatus) => {
    setDeals(prev => prev.map(deal => {
      if (deal.id !== dealId) return deal;
      return {
        ...deal,
        status: newStatus,
        updatedAt: new Date(),
        // Set closing date if transitioning to active
        actualClosingDate: newStatus === 'active' ? new Date() : deal.actualClosingDate,
      };
    }));

    logActivity({
      type: 'deal_updated',
      dealId,
      title: `Status changed to ${newStatus}`,
    });
  }, [logActivity]);

  // Version operations
  const getVersionsForDeal = useCallback((dealId: string): DealVersion[] => {
    return versions.filter(v => v.dealId === dealId).sort((a, b) => a.versionNumber - b.versionNumber);
  }, [versions]);

  const getCurrentVersion = useCallback((dealId: string): DealVersion | undefined => {
    const deal = deals.find(d => d.id === dealId);
    if (!deal?.currentVersionId) return undefined;
    return versions.find(v => v.id === deal.currentVersionId);
  }, [deals, versions]);

  const createVersion = useCallback((dealId: string, code: string, label: string): DealVersion => {
    const existingVersions = versions.filter(v => v.dealId === dealId);
    const nextVersionNumber = existingVersions.length + 1;
    const parentVersion = existingVersions.length > 0
      ? existingVersions[existingVersions.length - 1]
      : null;

    const newVersion: DealVersion = {
      id: generateId('version'),
      dealId,
      versionNumber: nextVersionNumber,
      versionLabel: label,
      creditLangCode: code,
      createdBy: 'user@proviso.dev',
      authorParty: 'User',
      createdAt: new Date(),
      parentVersionId: parentVersion?.id ?? null,
      status: 'draft',
      generatedWordDoc: null,
      changeSummary: null,
    };

    setVersions(prev => [...prev, newVersion]);

    // Update deal's current version
    setDeals(prev => prev.map(deal => {
      if (deal.id !== dealId) return deal;
      return {
        ...deal,
        currentVersionId: newVersion.id,
        status: deal.status === 'draft' ? 'negotiation' : deal.status,
        updatedAt: new Date(),
      };
    }));

    logActivity({
      type: 'version_created',
      dealId,
      title: 'Version created',
      description: `v${nextVersionNumber}: ${label}`,
    });

    return newVersion;
  }, [versions, logActivity]);

  // Party operations
  const getPartiesForDeal = useCallback((dealId: string): DealParty[] => {
    return parties.filter(p => p.dealId === dealId);
  }, [parties]);

  const addParty = useCallback((party: Omit<DealParty, 'id'>): DealParty => {
    const newParty: DealParty = {
      ...party,
      id: generateId('party'),
    };
    setParties(prev => [...prev, newParty]);
    return newParty;
  }, []);

  // Activity operations
  const getActivitiesForDeal = useCallback((dealId: string): Activity[] => {
    return activities.filter(a => a.dealId === dealId);
  }, [activities]);

  const clearActivities = useCallback(() => {
    setActivities([]);
  }, []);

  // Scenario loading - loads deal data from demo-scenarios based on dealId
  const loadScenario = useCallback((dealId: string) => {
    const scenario = getScenarioById(dealId);
    if (scenario?.negotiation) {
      const { deal, versions: scenarioVersions, parties: scenarioParties } = scenario.negotiation;

      // Check if deal already exists
      const existingDeal = deals.find(d => d.id === dealId);
      if (!existingDeal) {
        // Add the deal if it doesn't exist
        setDeals(prev => [...prev.filter(d => d.id !== dealId), cloneDeals([deal])[0]]);
      }

      // Check if versions already exist for this deal
      const existingVersions = versions.filter(v => v.dealId === dealId);
      if (existingVersions.length === 0) {
        setVersions(prev => [...prev, ...cloneVersions(scenarioVersions)]);
      }

      // Check if parties already exist for this deal
      const existingParties = parties.filter(p => p.dealId === dealId);
      if (existingParties.length === 0) {
        setParties(prev => [...prev, ...cloneParties(scenarioParties)]);
      }

      // Select this deal
      setCurrentDealId(dealId);
    }
  }, [deals, versions, parties]);

  // Reset
  const resetToDefaults = useCallback(() => {
    // Clear all data - scenarios will be loaded fresh on demand
    setDeals([]);
    setVersions([]);
    setParties([]);
    setActivities([]);
    setCurrentDealId(null);
    localStorage.removeItem(STORAGE_KEY_DEALS);
    localStorage.removeItem(STORAGE_KEY_VERSIONS);
    localStorage.removeItem(STORAGE_KEY_PARTIES);
    localStorage.removeItem(STORAGE_KEY_ACTIVITIES);
    localStorage.removeItem(STORAGE_KEY_CURRENT_DEAL);
  }, []);

  const value: DealContextValue = {
    deals,
    currentDeal,
    currentDealId,
    versions,
    parties,
    activities,
    createDeal,
    updateDeal,
    deleteDeal,
    selectDeal,
    getDeal,
    transitionDealStatus,
    getVersionsForDeal,
    getCurrentVersion,
    createVersion,
    getCachedChangeSummary,
    cacheChangeSummary,
    getPartiesForDeal,
    addParty,
    logActivity,
    getActivitiesForDeal,
    clearActivities,
    loadScenario,
    resetToDefaults,
  };

  return (
    <DealContext.Provider value={value}>
      {children}
    </DealContext.Provider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

export function useDeal(): DealContextValue {
  const context = useContext(DealContext);
  if (!context) {
    throw new Error('useDeal must be used within a DealProvider');
  }
  return context;
}

/**
 * Hook for getting the current deal from URL params
 */
export function useCurrentDealFromParams(dealId: string | undefined): Deal | null {
  const { deals, selectDeal } = useDeal();

  useEffect(() => {
    if (dealId) {
      selectDeal(dealId);
    }
  }, [dealId, selectDeal]);

  if (!dealId) return null;
  return deals.find(d => d.id === dealId) ?? null;
}

/**
 * Hook for getting activities
 */
export function useActivities() {
  const { activities, logActivity, clearActivities, getActivitiesForDeal } = useDeal();
  return { activities, logActivity, clearActivities, getActivitiesForDeal };
}
