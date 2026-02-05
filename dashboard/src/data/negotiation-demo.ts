/**
 * ProViso Hub v2.0 — Negotiation Demo Data
 *
 * Sample deal with 3 versions showing a realistic negotiation workflow.
 */

import { PartyRole } from '../../../src/closing-enums';

// Re-export types for dashboard usage
export type DealVersion = {
  id: string;
  dealId: string;
  versionNumber: number;
  versionLabel: string;
  creditLangCode: string;
  createdBy: string;
  authorParty: string;
  createdAt: Date;
  parentVersionId: string | null;
  status: 'draft' | 'sent' | 'received' | 'superseded' | 'executed';
  generatedWordDoc: string | null;
  changeSummary: ChangeSummary | null;
};

export type DealParty = {
  id: string;
  dealId: string;
  name: string;
  shortName: string;
  role: PartyRole;
  partyType: 'borrower' | 'lender' | 'agent' | 'law_firm' | 'consultant';
  primaryContact: Contact;
  additionalContacts: Contact[];
  counselPartyId: string | null;
};

export type Contact = {
  name: string;
  email: string;
  phone: string | null;
  title: string | null;
};

export type Deal = {
  id: string;
  name: string;
  dealType: 'corporate' | 'project_finance';
  facilityAmount: number;
  currency: string;
  status: 'draft' | 'negotiation' | 'closing' | 'active' | 'matured';
  currentVersionId: string | null;
  parties: DealParty[];
  targetClosingDate: Date | null;
  actualClosingDate: Date | null;
  maturityDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
};

export type ChangeImpact = 'borrower_favorable' | 'lender_favorable' | 'neutral' | 'unclear';

export type Change = {
  id: string;
  changeType: 'added' | 'removed' | 'modified';
  elementType: string;
  sectionReference: string;
  elementName: string;
  title: string;
  description: string;
  rationale: string | null;
  beforeCode: string | null;
  afterCode: string | null;
  beforeValue: string | null;
  afterValue: string | null;
  impact: ChangeImpact;
  impactDescription: string | null;
  sourceForm: string | null;
  isManualEdit: boolean;
};

export type ChangeSummary = {
  versionFrom: number;
  versionTo: number;
  authorParty: string;
  createdAt: Date;
  totalChanges: number;
  covenantChanges: number;
  definitionChanges: number;
  basketChanges: number;
  otherChanges: number;
  borrowerFavorable: number;
  lenderFavorable: number;
  neutral: number;
  changes: Change[];
};

// =============================================================================
// SAMPLE CREDITLANG CODE
// =============================================================================

const VERSION_1_CODE = `// ABC Acquisition Facility - Lender's Initial Draft
// Version 1.0 - Simpson Thacher

DEFINE EBITDA AS (
  NetIncome
  + InterestExpense
  + TaxExpense
  + DepreciationAmortization
) EXCLUDING extraordinary_items

DEFINE TotalDebt AS SeniorDebt + SubordinatedDebt

DEFINE Leverage AS TotalDebt / EBITDA

COVENANT MaxLeverage
  REQUIRES Leverage <= 5.00
  TESTED quarterly

COVENANT MinInterestCoverage
  REQUIRES EBITDA / InterestExpense >= 2.50
  TESTED quarterly

BASKET GeneralInvestments
  CAPACITY GreaterOf($25_000_000, 10% * EBITDA)

BASKET PermittedAcquisitions
  CAPACITY $50_000_000
  SUBJECT_TO ProFormaCompliance
`;

const VERSION_2_CODE = `// ABC Acquisition Facility - Borrower's Markup
// Version 2.0 - Davis Polk

DEFINE EBITDA AS (
  NetIncome
  + InterestExpense
  + TaxExpense
  + DepreciationAmortization
  + StockBasedComp        // Added per Borrower
) EXCLUDING extraordinary_items

DEFINE TotalDebt AS SeniorDebt + SubordinatedDebt

DEFINE Leverage AS TotalDebt / EBITDA

COVENANT MaxLeverage
  REQUIRES Leverage <= 5.25      // Increased from 5.00
  TESTED quarterly
  CURE EquityCure MAX_USES 2 OVER "rolling 4 quarters" MAX_AMOUNT $25_000_000

COVENANT MinInterestCoverage
  REQUIRES EBITDA / InterestExpense >= 2.25    // Decreased from 2.50
  TESTED quarterly

BASKET GeneralInvestments
  CAPACITY GreaterOf($35_000_000, 15% * EBITDA)   // Increased from $25M/10%

BASKET PermittedAcquisitions
  CAPACITY $75_000_000    // Increased from $50M
  SUBJECT_TO ProFormaCompliance
`;

const VERSION_3_CODE = `// ABC Acquisition Facility - Lender's Counter
// Version 3.0 - Simpson Thacher

DEFINE EBITDA AS (
  NetIncome
  + InterestExpense
  + TaxExpense
  + DepreciationAmortization
  + StockBasedComp        // Accepted
) EXCLUDING extraordinary_items
  CAP StockBasedComp AT $5_000_000 PER YEAR   // Added cap

DEFINE TotalDebt AS SeniorDebt + SubordinatedDebt

DEFINE Leverage AS TotalDebt / EBITDA

COVENANT MaxLeverage
  REQUIRES Leverage <= 5.00 UNTIL 2025-12-31, THEN <= 4.75   // Step-down
  TESTED quarterly
  CURE EquityCure MAX_USES 2 OVER "rolling 4 quarters" MAX_AMOUNT $20_000_000  // Reduced max

COVENANT MinInterestCoverage
  REQUIRES EBITDA / InterestExpense >= 2.25    // Accepted
  TESTED quarterly

BASKET GeneralInvestments
  CAPACITY GreaterOf($30_000_000, 12.5% * EBITDA)   // Compromise

BASKET PermittedAcquisitions
  CAPACITY $60_000_000    // Compromise from $50M/$75M
  SUBJECT_TO ProFormaCompliance
`;

// =============================================================================
// PARTIES
// =============================================================================

const parties: DealParty[] = [
  {
    id: 'party-borrower',
    dealId: 'deal-abc-facility',
    name: 'ABC Holdings, Inc.',
    shortName: 'ABC',
    role: PartyRole.BORROWER,
    partyType: 'borrower',
    primaryContact: {
      name: 'Jennifer Chen',
      email: 'jchen@abcholdings.com',
      phone: '+1 (212) 555-0101',
      title: 'CFO',
    },
    additionalContacts: [
      {
        name: 'Michael Rodriguez',
        email: 'mrodriguez@abcholdings.com',
        phone: '+1 (212) 555-0102',
        title: 'Treasurer',
      },
    ],
    counselPartyId: 'party-davis-polk',
  },
  {
    id: 'party-agent',
    dealId: 'deal-abc-facility',
    name: 'First National Bank',
    shortName: 'FNB',
    role: PartyRole.ADMINISTRATIVE_AGENT,
    partyType: 'agent',
    primaryContact: {
      name: 'Sarah Thompson',
      email: 'sthompson@fnb.com',
      phone: '+1 (212) 555-0201',
      title: 'Managing Director',
    },
    additionalContacts: [],
    counselPartyId: 'party-simpson-thacher',
  },
  {
    id: 'party-lender-1',
    dealId: 'deal-abc-facility',
    name: 'First National Bank',
    shortName: 'FNB',
    role: PartyRole.LENDER,
    partyType: 'lender',
    primaryContact: {
      name: 'James Wilson',
      email: 'jwilson@fnb.com',
      phone: '+1 (212) 555-0203',
      title: 'Director, Syndicated Loans',
    },
    additionalContacts: [],
    counselPartyId: null,
  },
  {
    id: 'party-lender-2',
    dealId: 'deal-abc-facility',
    name: 'Regional Credit Partners',
    shortName: 'RCP',
    role: PartyRole.LENDER,
    partyType: 'lender',
    primaryContact: {
      name: 'David Park',
      email: 'dpark@rcp.com',
      phone: '+1 (312) 555-0301',
      title: 'Principal',
    },
    additionalContacts: [],
    counselPartyId: null,
  },
  {
    id: 'party-davis-polk',
    dealId: 'deal-abc-facility',
    name: 'Davis Polk & Wardwell LLP',
    shortName: 'Davis Polk',
    role: PartyRole.BORROWER, // Acting as borrower counsel
    partyType: 'law_firm',
    primaryContact: {
      name: 'Elizabeth Warren',
      email: 'elizabeth.warren@davispolk.com',
      phone: '+1 (212) 555-0401',
      title: 'Partner',
    },
    additionalContacts: [
      {
        name: 'Robert Kim',
        email: 'robert.kim@davispolk.com',
        phone: '+1 (212) 555-0402',
        title: 'Associate',
      },
    ],
    counselPartyId: null,
  },
  {
    id: 'party-simpson-thacher',
    dealId: 'deal-abc-facility',
    name: 'Simpson Thacher & Bartlett LLP',
    shortName: 'Simpson Thacher',
    role: PartyRole.ADMINISTRATIVE_AGENT, // Acting as agent counsel
    partyType: 'law_firm',
    primaryContact: {
      name: 'William Harris',
      email: 'wharris@stblaw.com',
      phone: '+1 (212) 555-0501',
      title: 'Partner',
    },
    additionalContacts: [],
    counselPartyId: null,
  },
];

// =============================================================================
// CHANGE SUMMARIES
// =============================================================================

const changeSummaryV1toV2: ChangeSummary = {
  versionFrom: 1,
  versionTo: 2,
  authorParty: 'Davis Polk',
  createdAt: new Date('2026-01-15T14:30:00Z'),
  totalChanges: 5,
  covenantChanges: 2,
  definitionChanges: 1,
  basketChanges: 2,
  otherChanges: 0,
  borrowerFavorable: 5,
  lenderFavorable: 0,
  neutral: 0,
  changes: [
    {
      id: 'change-1',
      changeType: 'modified',
      elementType: 'covenant',
      sectionReference: '7.11(a)',
      elementName: 'MaxLeverage',
      title: 'Leverage ratio threshold increased',
      description: 'Maximum leverage ratio increased from 5.00x to 5.25x',
      rationale: 'Provides additional headroom for acquisition integration',
      beforeCode: 'REQUIRES Leverage <= 5.00',
      afterCode: 'REQUIRES Leverage <= 5.25',
      beforeValue: '5.00x',
      afterValue: '5.25x',
      impact: 'borrower_favorable',
      impactDescription: '+0.25x headroom at closing (~$11M additional debt capacity)',
      sourceForm: 'covenant-simple',
      isManualEdit: false,
    },
    {
      id: 'change-2',
      changeType: 'added',
      elementType: 'covenant',
      sectionReference: '7.11(a)',
      elementName: 'MaxLeverage',
      title: 'Equity cure right added',
      description: 'Added equity cure mechanism with 2 uses over rolling 4 quarters, max $25M',
      rationale: 'Standard borrower protection for covenant breach scenarios',
      beforeCode: null,
      afterCode: 'CURE EquityCure MAX_USES 2 OVER "rolling 4 quarters" MAX_AMOUNT $25_000_000',
      beforeValue: null,
      afterValue: '2 uses / $25M max',
      impact: 'borrower_favorable',
      impactDescription: 'Provides cure rights for leverage covenant breaches',
      sourceForm: 'covenant-cure',
      isManualEdit: false,
    },
    {
      id: 'change-3',
      changeType: 'modified',
      elementType: 'covenant',
      sectionReference: '7.11(b)',
      elementName: 'MinInterestCoverage',
      title: 'Interest coverage threshold decreased',
      description: 'Minimum interest coverage reduced from 2.50x to 2.25x',
      rationale: null,
      beforeCode: 'REQUIRES EBITDA / InterestExpense >= 2.50',
      afterCode: 'REQUIRES EBITDA / InterestExpense >= 2.25',
      beforeValue: '2.50x',
      afterValue: '2.25x',
      impact: 'borrower_favorable',
      impactDescription: '-0.25x requirement provides more operational flexibility',
      sourceForm: 'covenant-simple',
      isManualEdit: false,
    },
    {
      id: 'change-4',
      changeType: 'modified',
      elementType: 'basket',
      sectionReference: '7.02(f)',
      elementName: 'GeneralInvestments',
      title: 'General investment basket increased',
      description: 'Capacity increased from $25M/10% to $35M/15%',
      rationale: null,
      beforeCode: 'CAPACITY GreaterOf($25_000_000, 10% * EBITDA)',
      afterCode: 'CAPACITY GreaterOf($35_000_000, 15% * EBITDA)',
      beforeValue: '$25M / 10%',
      afterValue: '$35M / 15%',
      impact: 'borrower_favorable',
      impactDescription: '+$10M fixed capacity, +5% grower component',
      sourceForm: 'basket-grower',
      isManualEdit: false,
    },
    {
      id: 'change-5',
      changeType: 'modified',
      elementType: 'basket',
      sectionReference: '7.02(g)',
      elementName: 'PermittedAcquisitions',
      title: 'Acquisition basket increased',
      description: 'Capacity increased from $50M to $75M',
      rationale: null,
      beforeCode: 'CAPACITY $50_000_000',
      afterCode: 'CAPACITY $75_000_000',
      beforeValue: '$50M',
      afterValue: '$75M',
      impact: 'borrower_favorable',
      impactDescription: '+$25M additional acquisition capacity',
      sourceForm: 'basket-fixed',
      isManualEdit: false,
    },
  ],
};

const changeSummaryV2toV3: ChangeSummary = {
  versionFrom: 2,
  versionTo: 3,
  authorParty: 'Simpson Thacher',
  createdAt: new Date('2026-01-20T10:15:00Z'),
  totalChanges: 5,
  covenantChanges: 2,
  definitionChanges: 1,
  basketChanges: 2,
  otherChanges: 0,
  borrowerFavorable: 0,
  lenderFavorable: 3,
  neutral: 2,
  changes: [
    {
      id: 'change-6',
      changeType: 'modified',
      elementType: 'covenant',
      sectionReference: '7.11(a)',
      elementName: 'MaxLeverage',
      title: 'Leverage step-down added',
      description: 'Opening 5.00x stepping to 4.75x after Dec 2025',
      rationale: 'Compromise on opening ratio with step-down for deleveraging',
      beforeCode: 'REQUIRES Leverage <= 5.25',
      afterCode: 'REQUIRES Leverage <= 5.00 UNTIL 2025-12-31, THEN <= 4.75',
      beforeValue: '5.25x',
      afterValue: '5.00x → 4.75x',
      impact: 'lender_favorable',
      impactDescription: 'Reverts to original 5.00x opening, adds step-down',
      sourceForm: 'covenant-stepdown',
      isManualEdit: false,
    },
    {
      id: 'change-7',
      changeType: 'modified',
      elementType: 'covenant',
      sectionReference: '7.11(a)',
      elementName: 'MaxLeverage',
      title: 'Cure maximum reduced',
      description: 'Maximum cure amount reduced from $25M to $20M',
      rationale: null,
      beforeCode: 'MAX_AMOUNT $25_000_000',
      afterCode: 'MAX_AMOUNT $20_000_000',
      beforeValue: '$25M',
      afterValue: '$20M',
      impact: 'lender_favorable',
      impactDescription: '-$5M cure capacity',
      sourceForm: 'covenant-cure',
      isManualEdit: false,
    },
    {
      id: 'change-8',
      changeType: 'modified',
      elementType: 'definition',
      sectionReference: '1.01',
      elementName: 'EBITDA',
      title: 'Stock-based comp add-back capped',
      description: 'Accepted SBC add-back but with $5M annual cap',
      rationale: 'Compromise: accept add-back but limit exposure',
      beforeCode: '+ StockBasedComp',
      afterCode: '+ StockBasedComp\n  CAP StockBasedComp AT $5_000_000 PER YEAR',
      beforeValue: 'Unlimited',
      afterValue: '$5M cap',
      impact: 'lender_favorable',
      impactDescription: 'Limits EBITDA benefit to $5M annually',
      sourceForm: 'definition-ebitda',
      isManualEdit: false,
    },
    {
      id: 'change-9',
      changeType: 'modified',
      elementType: 'basket',
      sectionReference: '7.02(f)',
      elementName: 'GeneralInvestments',
      title: 'Investment basket compromise',
      description: 'Capacity set to $30M/12.5% (between $25M/10% and $35M/15%)',
      rationale: null,
      beforeCode: 'CAPACITY GreaterOf($35_000_000, 15% * EBITDA)',
      afterCode: 'CAPACITY GreaterOf($30_000_000, 12.5% * EBITDA)',
      beforeValue: '$35M / 15%',
      afterValue: '$30M / 12.5%',
      impact: 'neutral',
      impactDescription: 'Split the difference on basket sizing',
      sourceForm: 'basket-grower',
      isManualEdit: false,
    },
    {
      id: 'change-10',
      changeType: 'modified',
      elementType: 'basket',
      sectionReference: '7.02(g)',
      elementName: 'PermittedAcquisitions',
      title: 'Acquisition basket compromise',
      description: 'Capacity set to $60M (between $50M and $75M)',
      rationale: null,
      beforeCode: 'CAPACITY $75_000_000',
      afterCode: 'CAPACITY $60_000_000',
      beforeValue: '$75M',
      afterValue: '$60M',
      impact: 'neutral',
      impactDescription: 'Split the difference on acquisition capacity',
      sourceForm: 'basket-fixed',
      isManualEdit: false,
    },
  ],
};

// =============================================================================
// VERSIONS
// =============================================================================

const versions: DealVersion[] = [
  {
    id: 'version-1',
    dealId: 'deal-abc-facility',
    versionNumber: 1,
    versionLabel: "Lender's Initial Draft",
    creditLangCode: VERSION_1_CODE,
    createdBy: 'wharris@stblaw.com',
    authorParty: 'Simpson Thacher',
    createdAt: new Date('2026-01-10T09:00:00Z'),
    parentVersionId: null,
    status: 'superseded',
    generatedWordDoc: null,
    changeSummary: null,
  },
  {
    id: 'version-2',
    dealId: 'deal-abc-facility',
    versionNumber: 2,
    versionLabel: "Borrower's Markup",
    creditLangCode: VERSION_2_CODE,
    createdBy: 'elizabeth.warren@davispolk.com',
    authorParty: 'Davis Polk',
    createdAt: new Date('2026-01-15T14:30:00Z'),
    parentVersionId: 'version-1',
    status: 'superseded',
    generatedWordDoc: null,
    changeSummary: changeSummaryV1toV2,
  },
  {
    id: 'version-3',
    dealId: 'deal-abc-facility',
    versionNumber: 3,
    versionLabel: "Lender's Counter",
    creditLangCode: VERSION_3_CODE,
    createdBy: 'wharris@stblaw.com',
    authorParty: 'Simpson Thacher',
    createdAt: new Date('2026-01-20T10:15:00Z'),
    parentVersionId: 'version-2',
    status: 'draft',
    generatedWordDoc: null,
    changeSummary: changeSummaryV2toV3,
  },
];

// =============================================================================
// DEAL
// =============================================================================

export const demoDeal: Deal = {
  id: 'deal-abc-facility',
  name: 'ABC Acquisition Facility',
  dealType: 'corporate',
  facilityAmount: 150_000_000,
  currency: 'USD',
  status: 'negotiation',
  currentVersionId: 'version-3',
  parties,
  targetClosingDate: new Date('2026-03-15'),
  actualClosingDate: null,
  maturityDate: new Date('2031-03-15'),
  createdAt: new Date('2026-01-08T10:00:00Z'),
  updatedAt: new Date('2026-01-20T10:15:00Z'),
  createdBy: 'sthompson@fnb.com',
};

export const demoVersions = versions;
export const demoParties = parties;
export const demoChangeSummaryV1toV2 = changeSummaryV1toV2;
export const demoChangeSummaryV2toV3 = changeSummaryV2toV3;

// Export for easy access
export const negotiationDemo = {
  deal: demoDeal,
  versions: demoVersions,
  parties: demoParties,
  changeSummaries: {
    v1ToV2: demoChangeSummaryV1toV2,
    v2ToV3: demoChangeSummaryV2toV3,
  },
};

export default negotiationDemo;
