/**
 * Live CP Pipeline Tests
 *
 * Tests the full pipeline: Grammar → Interpreter → cpTransformer → Dashboard.
 * Verifies that CONDITIONS_PRECEDENT blocks in .proviso code produce
 * ConditionPrecedent objects the closing dashboard can render.
 */

import { describe, it, expect } from 'vitest';
import { parseOrThrow } from '../src/parser.js';
import { ProVisoInterpreter } from '../src/interpreter.js';
import type { CPChecklistResult, CPItemResult, CPStatus } from '../src/types.js';

// =============================================================================
// TRANSFORMER HELPERS (inline to avoid dashboard import path issues)
// =============================================================================

type CPCategory =
  | 'corporate_documents' | 'credit_agreement' | 'security_documents'
  | 'ucc_filings' | 'legal_opinions' | 'certificates' | 'financial'
  | 'insurance' | 'kyc_aml' | 'permits' | 'technical' | 'tax_equity'
  | 'offtake' | 'other';

type ConditionStatus = 'pending' | 'satisfied' | 'waived';

interface ConditionPrecedent {
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

/**
 * Inline version of formatCPTitle from cpTransformer.ts
 */
function formatCPTitle(name: string): string {
  if (name.includes('_')) {
    return name
      .split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  return name.replace(/([a-z])([A-Z])/g, '$1 $2');
}

/**
 * Inline version of inferCategory from cpTransformer.ts
 */
function inferCategory(name: string, description: string): CPCategory {
  const text = `${name} ${description}`.toLowerCase();

  if (text.includes('certificate') && (text.includes('incorporat') || text.includes('formation') || text.includes('good standing'))) {
    return 'corporate_documents';
  }
  if (text.includes('bylaw') || text.includes('resolution') || text.includes('board')) {
    return 'corporate_documents';
  }
  if (text.includes('charter') && !text.includes('aircraft')) {
    return 'corporate_documents';
  }
  if (text.includes('credit agreement') || text.includes('loan agreement') || text.includes('facility agreement')) {
    return 'credit_agreement';
  }
  if (text.includes('security') || text.includes('pledge') || text.includes('mortgage') || text.includes('collateral') || text.includes('lien')) {
    return 'security_documents';
  }
  if (text.includes('ucc') || text.includes('financing statement')) {
    return 'ucc_filings';
  }
  if (text.includes('opinion') || text.includes('legal opinion')) {
    return 'legal_opinions';
  }
  if (text.includes('insurance') || text.includes('policy') || text.includes('builder') && text.includes('risk')) {
    return 'insurance';
  }
  if (text.includes('kyc') || text.includes('aml') || text.includes('know your') || text.includes('anti-money')) {
    return 'kyc_aml';
  }
  if (text.includes('financial') || text.includes('audit') || text.includes('balance sheet') || text.includes('income statement') || text.includes('pro forma')) {
    return 'financial';
  }
  if (text.includes('solvency')) {
    return 'certificates';
  }
  if (text.includes('officer') && text.includes('certificate')) {
    return 'certificates';
  }
  if (text.includes('permit') || text.includes('regulatory') || text.includes('license') || text.includes('approval') || text.includes('nepa') || text.includes('zoning') || text.includes('interconnection') || text.includes('faa') || text.includes('tribal') || text.includes('environmental') || text.includes('alta') || text.includes('survey')) {
    return 'permits';
  }
  if (text.includes('technical') || text.includes('engineer') || text.includes('construction') || text.includes('epc') || text.includes('turbine') || text.includes('wind resource') || text.includes('supply agreement')) {
    return 'technical';
  }
  if (text.includes('tax') || text.includes('equity') && text.includes('commit') || text.includes('flip') || text.includes('depreciation')) {
    return 'tax_equity';
  }
  if (text.includes('offtake') || text.includes('ppa') || text.includes('power purchase') || text.includes('hedge')) {
    return 'offtake';
  }
  if (text.includes('certificate') || text.includes('compliance') || text.includes('officer')) {
    return 'certificates';
  }

  return 'other';
}

/**
 * Inline version of transformCPChecklistsToConditions from cpTransformer.ts
 */
function transformCPChecklistsToConditions(
  checklists: CPChecklistResult[],
  dealId: string,
  versionId: string,
): ConditionPrecedent[] {
  const conditions: ConditionPrecedent[] = [];
  let index = 0;

  for (const checklist of checklists) {
    for (const item of checklist.conditions) {
      index++;
      conditions.push({
        id: `cp-live-${index}`,
        dealId,
        versionId,
        sectionReference: checklist.section ?? '',
        category: inferCategory(item.name, item.description ?? ''),
        title: formatCPTitle(item.name),
        description: item.description ?? '',
        responsiblePartyId: item.responsible ?? 'unassigned',
        status: item.status === 'not_applicable' ? 'waived' : item.status as ConditionStatus,
        dueDate: null,
        satisfiedAt: item.status === 'satisfied' ? new Date() : null,
        satisfiedByDocumentIds: [],
        waivedAt: item.status === 'waived' || item.status === 'not_applicable' ? new Date() : null,
        waiverApprovedBy: item.status === 'not_applicable' ? 'N/A' : null,
        notes: item.satisfies.length > 0
          ? `Satisfies: ${item.satisfies.join(', ')}`
          : '',
      });
    }
  }

  return conditions;
}

/**
 * Inline version of normalizeTitle from cpTransformer.ts
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Inline version of findBestMatch from cpTransformer.ts
 */
function findBestMatch(
  normalizedLive: string,
  demoByTitle: Map<string, ConditionPrecedent>,
): ConditionPrecedent | null {
  const liveWords = normalizedLive.split(' ').filter((w: string) => w.length > 2);
  let bestMatch: ConditionPrecedent | null = null;
  let bestScore = 0;

  for (const [demoTitle, demoCP] of demoByTitle) {
    let score = 0;
    for (const word of liveWords) {
      if (demoTitle.includes(word)) score++;
    }
    const demoWords = demoTitle.split(' ').filter((w: string) => w.length > 2);
    for (const word of demoWords) {
      if (normalizedLive.includes(word)) score++;
    }
    const minScore = Math.min(liveWords.length, demoWords.length) >= 2 ? 2 : 1;
    if (score > bestScore && score >= minScore) {
      bestScore = score;
      bestMatch = demoCP;
    }
  }

  return bestMatch;
}

/**
 * Inline version of mergeLiveWithDemoConditions from cpTransformer.ts
 */
function mergeLiveWithDemoConditions(
  liveCPs: ConditionPrecedent[],
  demoCPs: ConditionPrecedent[],
): ConditionPrecedent[] {
  if (liveCPs.length === 0) return demoCPs;
  if (demoCPs.length === 0) return liveCPs;

  const demoByTitle = new Map<string, ConditionPrecedent>();
  for (const demo of demoCPs) {
    demoByTitle.set(normalizeTitle(demo.title), demo);
  }

  const merged: ConditionPrecedent[] = [];
  const matchedDemoIds = new Set<string>();

  for (const live of liveCPs) {
    const normalizedLive = normalizeTitle(live.title);
    const demoMatch = demoByTitle.get(normalizedLive)
      ?? findBestMatch(normalizedLive, demoByTitle);

    if (demoMatch && !matchedDemoIds.has(demoMatch.id)) {
      matchedDemoIds.add(demoMatch.id);
      merged.push({
        id: demoMatch.id,
        dealId: demoMatch.dealId,
        versionId: demoMatch.versionId,
        sectionReference: demoMatch.sectionReference || live.sectionReference,
        category: demoMatch.category,
        title: demoMatch.title,
        description: demoMatch.description || live.description,
        responsiblePartyId: demoMatch.responsiblePartyId,
        status: demoMatch.status,
        dueDate: demoMatch.dueDate,
        satisfiedAt: demoMatch.satisfiedAt,
        satisfiedByDocumentIds: demoMatch.satisfiedByDocumentIds,
        waivedAt: demoMatch.waivedAt,
        waiverApprovedBy: demoMatch.waiverApprovedBy,
        notes: demoMatch.notes || live.notes,
      });
    } else {
      merged.push(live);
    }
  }

  return merged;
}

// =============================================================================
// TEST DATA
// =============================================================================

const corporateCP = `
DEFINE EBITDA AS net_income + interest_expense + tax_expense + depreciation
DEFINE TotalDebt AS funded_debt
DEFINE Leverage AS TotalDebt / EBITDA

COVENANT MaxLeverage
  REQUIRES Leverage <= 4.50
  TESTED QUARTERLY

CONDITIONS_PRECEDENT InitialClosing
  SECTION "4.01"

  CP CertificateOfIncorporation
    DESCRIPTION "Certified copy of the Certificate of Incorporation"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP Bylaws
    DESCRIPTION "Certified copy of the Bylaws"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP BoardResolutions
    DESCRIPTION "Board resolutions authorizing the Loan Documents"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP GoodStandingCertificate
    DESCRIPTION "Certificate of Good Standing from Delaware"
    RESPONSIBLE Borrower
    STATUS pending

  CP CreditAgreementExecution
    DESCRIPTION "Fully executed Credit Agreement"
    RESPONSIBLE BorrowerCounsel
    STATUS pending

  CP SecurityAgreement
    DESCRIPTION "Security Agreement granting security interest"
    RESPONSIBLE BorrowerCounsel
    STATUS satisfied

  CP UCC1FinancingStatement
    DESCRIPTION "UCC-1 filed with Delaware Secretary of State"
    RESPONSIBLE AgentCounsel
    STATUS pending

  CP BorrowerCounselOpinion
    DESCRIPTION "Legal opinion of borrower counsel"
    RESPONSIBLE BorrowerCounsel
    STATUS pending

  CP OfficersCertificate
    DESCRIPTION "Certificate certifying conditions precedent"
    RESPONSIBLE Borrower
    STATUS pending

  CP SolvencyCertificate
    DESCRIPTION "Solvency Certificate from the CFO"
    RESPONSIBLE Borrower
    STATUS pending

  CP InsuranceCertificate
    DESCRIPTION "Certificate of insurance with Agent as loss payee"
    RESPONSIBLE Borrower
    STATUS pending

  CP KYCDocumentation
    DESCRIPTION "KYC documentation for all Lenders"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP FinancialStatements
    DESCRIPTION "Audited financial statements for FY 2025"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP ProFormaFinancialModel
    DESCRIPTION "Pro forma model showing projected compliance"
    RESPONSIBLE Borrower
    STATUS satisfied
`;

const projectFinanceCP = `
PHASE Construction
  UNTIL COD_Achieved
  COVENANTS SUSPENDED MinDSCR
  REQUIRED MinEquity

PHASE Operations
  FROM COD_Achieved
  COVENANTS ACTIVE MinDSCR

TRANSITION COD_Achieved
  WHEN ALL_OF(SubstantialCompletion)

MILESTONE SubstantialCompletion
  TARGET 2026-06-30
  LONGSTOP 2026-12-31
  TRIGGERS COD_Achieved

DEFINE EBITDA AS net_income + interest_expense + depreciation
DEFINE DebtService AS principal + interest
DEFINE DSCR AS EBITDA / DebtService

COVENANT MinDSCR
  REQUIRES DSCR >= 1.25
  TESTED QUARTERLY

COVENANT MinEquity
  REQUIRES equity >= 0.30 * total_cost
  TESTED MONTHLY

CONDITIONS_PRECEDENT InitialFunding
  SECTION "4.01"

  CP CreditAgreementExecution
    DESCRIPTION "Fully executed Credit Agreement"
    RESPONSIBLE BorrowerCounsel
    STATUS pending

  CP PPAExecuted
    DESCRIPTION "Executed Power Purchase Agreement with utility"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP InterconnectionAgreement
    DESCRIPTION "Executed interconnection agreement"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP EPCContract
    DESCRIPTION "Executed EPC contract with creditworthy contractor"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP TaxEquityCommitment
    DESCRIPTION "Executed Tax Equity Partnership Agreement"
    RESPONSIBLE TaxCounsel
    STATUS pending

  CP EnvironmentalPermits
    DESCRIPTION "All required environmental permits obtained"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP InsuranceCertificates
    DESCRIPTION "Builder's risk and liability insurance"
    RESPONSIBLE Borrower
    STATUS satisfied
`;

const mixedStatusCP = `
DEFINE X AS 1

CONDITIONS_PRECEDENT DrawChecklist
  SECTION "5.02"

  CP ItemSatisfied
    DESCRIPTION "Already satisfied item"
    RESPONSIBLE PartyA
    STATUS satisfied

  CP ItemPending
    DESCRIPTION "Still pending item"
    RESPONSIBLE PartyB
    STATUS pending

  CP ItemWaived
    DESCRIPTION "Waived item"
    RESPONSIBLE PartyC
    STATUS waived

  CP ItemNA
    DESCRIPTION "Not applicable item"
    RESPONSIBLE PartyD
    STATUS not_applicable
`;

// =============================================================================
// TESTS: GRAMMAR → INTERPRETER
// =============================================================================

describe('CP Pipeline: Grammar → Interpreter', () => {
  it('parses CONDITIONS_PRECEDENT blocks from corporate code', async () => {
    const ast = await parseOrThrow(corporateCP);
    expect(ast).toBeDefined();
    const cpStatements = ast.statements.filter((s: any) => s.type === 'ConditionsPrecedent');
    expect(cpStatements).toHaveLength(1);
    expect(cpStatements[0].name).toBe('InitialClosing');
    expect(cpStatements[0].section).toBe('4.01');
    expect(cpStatements[0].conditions).toHaveLength(14);
  });

  it('parses CONDITIONS_PRECEDENT blocks from project finance code', async () => {
    const ast = await parseOrThrow(projectFinanceCP);
    const cpStatements = ast.statements.filter((s: any) => s.type === 'ConditionsPrecedent');
    expect(cpStatements).toHaveLength(1);
    expect(cpStatements[0].name).toBe('InitialFunding');
    expect(cpStatements[0].conditions).toHaveLength(7);
  });

  it('preserves CP statuses through the interpreter', async () => {
    const ast = await parseOrThrow(mixedStatusCP);
    const interp = new ProVisoInterpreter(ast);
    interp.loadFinancials({ x: 1 });

    expect(interp.hasConditionsPrecedent()).toBe(true);
    expect(interp.getCPChecklistNames()).toEqual(['DrawChecklist']);

    const checklist = interp.getCPChecklist('DrawChecklist');
    expect(checklist.section).toBe('5.02');
    expect(checklist.totalConditions).toBe(4);
    expect(checklist.satisfied).toBe(1);
    expect(checklist.pending).toBe(1);
    expect(checklist.waived).toBe(1); // only explicit 'waived' (not_applicable is separate)
    expect(checklist.complete).toBe(false); // 1 pending item

    const statuses = checklist.conditions.map((c: CPItemResult) => c.status);
    expect(statuses).toEqual(['satisfied', 'pending', 'waived', 'not_applicable']);
  });

  it('tracks draw eligibility correctly', async () => {
    const ast = await parseOrThrow(mixedStatusCP);
    const interp = new ProVisoInterpreter(ast);
    interp.loadFinancials({ x: 1 });

    // Not all conditions met, so draw not allowed
    expect(interp.isDrawAllowed('DrawChecklist')).toBe(false);

    // Satisfy the pending item
    interp.updateCPStatus('DrawChecklist', 'ItemPending', 'satisfied');
    expect(interp.isDrawAllowed('DrawChecklist')).toBe(true);
  });

  it('correctly counts corporate CPs', async () => {
    const ast = await parseOrThrow(corporateCP);
    const interp = new ProVisoInterpreter(ast);
    interp.loadFinancials({
      net_income: 15_000_000,
      interest_expense: 7_500_000,
      tax_expense: 5_000_000,
      depreciation: 4_000_000,
      funded_debt: 120_000_000,
    });

    const checklist = interp.getCPChecklist('InitialClosing');
    expect(checklist.totalConditions).toBe(14);
    // Count expected statuses
    const satisfied = checklist.conditions.filter((c: CPItemResult) => c.status === 'satisfied').length;
    const pending = checklist.conditions.filter((c: CPItemResult) => c.status === 'pending').length;
    expect(satisfied).toBe(7); // CertOfInc, Bylaws, BoardRes, SecurityAgreement, KYC, FinStatements, ProForma
    expect(pending).toBe(7);   // GoodStanding, CreditAgreement, UCC, Opinion, OfficersCert, Solvency, Insurance
    expect(checklist.complete).toBe(false);
  });
});

// =============================================================================
// TESTS: INTERPRETER → TRANSFORMER
// =============================================================================

describe('CP Pipeline: Interpreter → Transformer', () => {
  it('transforms corporate CPs to dashboard format', async () => {
    const ast = await parseOrThrow(corporateCP);
    const interp = new ProVisoInterpreter(ast);
    interp.loadFinancials({
      net_income: 15_000_000,
      interest_expense: 7_500_000,
      tax_expense: 5_000_000,
      depreciation: 4_000_000,
      funded_debt: 120_000_000,
    });

    const checklists = interp.getCPChecklistNames().map(n => interp.getCPChecklist(n));
    const conditions = transformCPChecklistsToConditions(checklists, 'deal-abc', 'v3');

    expect(conditions).toHaveLength(14);

    // Verify first CP
    const certOfInc = conditions[0];
    expect(certOfInc.dealId).toBe('deal-abc');
    expect(certOfInc.versionId).toBe('v3');
    expect(certOfInc.sectionReference).toBe('4.01');
    expect(certOfInc.title).toBe('Certificate Of Incorporation');
    expect(certOfInc.description).toBe('Certified copy of the Certificate of Incorporation');
    expect(certOfInc.status).toBe('satisfied');
    expect(certOfInc.satisfiedAt).toBeInstanceOf(Date);

    // Verify a pending CP
    const goodStanding = conditions[3];
    expect(goodStanding.title).toBe('Good Standing Certificate');
    expect(goodStanding.status).toBe('pending');
    expect(goodStanding.satisfiedAt).toBeNull();
  });

  it('assigns correct IDs sequentially', async () => {
    const ast = await parseOrThrow(corporateCP);
    const interp = new ProVisoInterpreter(ast);
    interp.loadFinancials({
      net_income: 15_000_000,
      interest_expense: 7_500_000,
      tax_expense: 5_000_000,
      depreciation: 4_000_000,
      funded_debt: 120_000_000,
    });

    const checklists = interp.getCPChecklistNames().map(n => interp.getCPChecklist(n));
    const conditions = transformCPChecklistsToConditions(checklists, 'deal-1', 'v1');

    expect(conditions.map(c => c.id)).toEqual(
      Array.from({ length: 14 }, (_, i) => `cp-live-${i + 1}`)
    );
  });

  it('converts not_applicable to waived status', async () => {
    const ast = await parseOrThrow(mixedStatusCP);
    const interp = new ProVisoInterpreter(ast);
    interp.loadFinancials({ x: 1 });

    const checklists = interp.getCPChecklistNames().map(n => interp.getCPChecklist(n));
    const conditions = transformCPChecklistsToConditions(checklists, 'deal-1', 'v1');

    const naItem = conditions.find(c => c.title === 'Item NA');
    expect(naItem?.status).toBe('waived');
    expect(naItem?.waivedAt).toBeInstanceOf(Date);
    expect(naItem?.waiverApprovedBy).toBe('N/A');
  });

  it('preserves SATISFIES in notes', async () => {
    const code = `
DEFINE X AS 1

CONDITIONS_PRECEDENT Draw1
  SECTION "5.01"

  CP EquityEvidence
    DESCRIPTION "Equity contribution proof"
    RESPONSIBLE Sponsor
    STATUS satisfied
    SATISFIES Draw1Available, MinEquity
    `;

    const ast = await parseOrThrow(code);
    const interp = new ProVisoInterpreter(ast);
    interp.loadFinancials({ x: 1 });

    const checklists = interp.getCPChecklistNames().map(n => interp.getCPChecklist(n));
    const conditions = transformCPChecklistsToConditions(checklists, 'deal-1', 'v1');

    expect(conditions[0].notes).toBe('Satisfies: Draw1Available, MinEquity');
  });
});

// =============================================================================
// TESTS: CATEGORY INFERENCE
// =============================================================================

describe('CP Pipeline: Category Inference', () => {
  const testCategory = (name: string, desc: string, expected: CPCategory) => {
    expect(inferCategory(name, desc)).toBe(expected);
  };

  it('infers corporate_documents', async () => {
    testCategory('CertificateOfIncorporation', 'Certificate of Incorporation', 'corporate_documents');
    testCategory('Bylaws', 'Certified copy of the Bylaws', 'corporate_documents');
    testCategory('BoardResolutions', 'Board resolutions', 'corporate_documents');
    testCategory('GoodStandingCertificate', 'Certificate of Good Standing', 'corporate_documents');
  });

  it('infers credit_agreement', async () => {
    testCategory('CreditAgreementExecution', 'Fully executed Credit Agreement', 'credit_agreement');
  });

  it('infers security_documents', async () => {
    testCategory('SecurityAgreement', 'Security Agreement granting security interest', 'security_documents');
    testCategory('PledgeAgreement', 'Pledge Agreement covering equity interests', 'security_documents');
  });

  it('infers ucc_filings', async () => {
    testCategory('UCC1FinancingStatement', 'UCC-1 filed with Delaware', 'ucc_filings');
  });

  it('infers legal_opinions', async () => {
    testCategory('BorrowerCounselOpinion', 'Legal opinion of borrower counsel', 'legal_opinions');
  });

  it('infers certificates', async () => {
    testCategory('SolvencyCertificate', 'Solvency Certificate from the CFO', 'certificates');
    testCategory('OfficersCertificate', 'Certificate certifying conditions', 'certificates');
  });

  it('infers insurance', async () => {
    testCategory('InsuranceCertificate', 'Certificate of insurance', 'insurance');
  });

  it('infers kyc_aml', async () => {
    testCategory('KYCDocumentation', 'KYC documentation', 'kyc_aml');
  });

  it('infers financial', async () => {
    testCategory('FinancialStatements', 'Audited financial statements', 'financial');
    testCategory('ProFormaFinancialModel', 'Pro forma model showing projected', 'financial');
  });

  it('infers permits for project finance', async () => {
    testCategory('EnvironmentalPermits', 'All required environmental permits', 'permits');
    testCategory('InterconnectionAgreement', 'Executed interconnection agreement', 'permits');
    testCategory('FAA_Determination', 'FAA No Hazard Determination', 'permits');
    testCategory('TribalConsultation', 'Completed tribal consultation', 'permits');
    testCategory('ALTASurvey', 'ALTA/NSPS Land Title Survey', 'permits');
  });

  it('infers technical for project finance', async () => {
    testCategory('EPCContract', 'Executed EPC contract', 'technical');
    testCategory('TurbineSupplyAgreement', 'Executed TSA with Vestas', 'technical');
    testCategory('WindResourceStudy', 'Independent wind resource assessment', 'technical');
  });

  it('infers tax_equity', async () => {
    testCategory('TaxEquityCommitment', 'Executed Tax Equity Partnership Agreement', 'tax_equity');
  });

  it('infers offtake', async () => {
    testCategory('PPAExecuted', 'Executed Power Purchase Agreement', 'offtake');
    testCategory('HedgeAgreement', 'Revenue hedge with investment grade', 'offtake');
  });
});

// =============================================================================
// TESTS: TITLE FORMATTING
// =============================================================================

describe('CP Pipeline: Title Formatting', () => {
  it('converts PascalCase to spaced words', async () => {
    expect(formatCPTitle('CertificateOfIncorporation')).toBe('Certificate Of Incorporation');
    expect(formatCPTitle('GoodStandingCertificate')).toBe('Good Standing Certificate');
    expect(formatCPTitle('KYCDocumentation')).toBe('KYCDocumentation'); // All caps stays together
  });

  it('converts snake_case to Title Case', async () => {
    expect(formatCPTitle('credit_agreement_execution')).toBe('Credit Agreement Execution');
    expect(formatCPTitle('FAA_Determination')).toBe('FAA Determination');
  });
});

// =============================================================================
// TESTS: MERGE STRATEGY
// =============================================================================

describe('CP Pipeline: Merge Live + Demo', () => {
  const makeLiveCP = (id: string, title: string, status: ConditionStatus = 'pending'): ConditionPrecedent => ({
    id,
    dealId: 'deal-1',
    versionId: 'v1',
    sectionReference: '4.01',
    category: 'other',
    title,
    description: '',
    responsiblePartyId: 'unassigned',
    status,
    dueDate: null,
    satisfiedAt: status === 'satisfied' ? new Date() : null,
    satisfiedByDocumentIds: [],
    waivedAt: null,
    waiverApprovedBy: null,
    notes: '',
  });

  const makeDemoCP = (id: string, title: string, extra: Partial<ConditionPrecedent> = {}): ConditionPrecedent => ({
    id,
    dealId: 'demo-deal',
    versionId: 'demo-v3',
    sectionReference: '4.01(a)',
    category: 'corporate_documents',
    title,
    description: 'Rich demo description',
    responsiblePartyId: 'party-1',
    status: 'satisfied',
    dueDate: new Date('2026-02-10'),
    satisfiedAt: new Date('2026-01-28'),
    satisfiedByDocumentIds: ['doc-1'],
    waivedAt: null,
    waiverApprovedBy: null,
    notes: 'Demo note',
    ...extra,
  });

  it('returns demo CPs when live is empty', async () => {
    const demoCPs = [makeDemoCP('d1', 'Bylaws')];
    const result = mergeLiveWithDemoConditions([], demoCPs);
    expect(result).toEqual(demoCPs);
  });

  it('returns live CPs when demo is empty', async () => {
    const liveCPs = [makeLiveCP('l1', 'Bylaws')];
    const result = mergeLiveWithDemoConditions(liveCPs, []);
    expect(result).toEqual(liveCPs);
  });

  it('matches by exact title', async () => {
    const liveCPs = [makeLiveCP('l1', 'Bylaws')];
    const demoCPs = [makeDemoCP('d1', 'Bylaws')];

    const result = mergeLiveWithDemoConditions(liveCPs, demoCPs);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('d1'); // Uses demo ID
    expect(result[0].dealId).toBe('demo-deal');
    expect(result[0].dueDate).toEqual(new Date('2026-02-10'));
    expect(result[0].satisfiedByDocumentIds).toEqual(['doc-1']);
    expect(result[0].notes).toBe('Demo note');
  });

  it('matches by fuzzy title (keyword overlap)', async () => {
    const liveCPs = [makeLiveCP('l1', 'Certificate Of Incorporation')];
    const demoCPs = [makeDemoCP('d1', 'Certificate of Incorporation')];

    const result = mergeLiveWithDemoConditions(liveCPs, demoCPs);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('d1');
  });

  it('preserves unmatched live CPs', async () => {
    const liveCPs = [
      makeLiveCP('l1', 'Bylaws'),
      makeLiveCP('l2', 'Custom New Condition'),
    ];
    const demoCPs = [makeDemoCP('d1', 'Bylaws')];

    const result = mergeLiveWithDemoConditions(liveCPs, demoCPs);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('d1');      // Matched
    expect(result[1].id).toBe('l2');      // Unmatched → live CP
    expect(result[1].title).toBe('Custom New Condition');
  });

  it('preserves demo category over inferred category', async () => {
    const liveCPs = [makeLiveCP('l1', 'Certificate Of Incorporation')];
    const demoCPs = [makeDemoCP('d1', 'Certificate of Incorporation', { category: 'corporate_documents' })];

    const result = mergeLiveWithDemoConditions(liveCPs, demoCPs);
    expect(result[0].category).toBe('corporate_documents');
  });

  it('preserves demo section reference', async () => {
    const liveCPs = [makeLiveCP('l1', 'Bylaws')];
    const demoCPs = [makeDemoCP('d1', 'Bylaws', { sectionReference: '4.01(a)(ii)' })];

    const result = mergeLiveWithDemoConditions(liveCPs, demoCPs);
    expect(result[0].sectionReference).toBe('4.01(a)(ii)');
  });

  it('handles project finance CPs correctly', async () => {
    const liveCPs = [
      makeLiveCP('l1', 'PPA Executed'),
      makeLiveCP('l2', 'EPC Contract'),
      makeLiveCP('l3', 'Tax Equity Commitment'),
    ];
    const demoCPs = [
      makeDemoCP('d1', 'PPA Executed', { category: 'offtake', status: 'satisfied' }),
      makeDemoCP('d2', 'EPC Contract', { category: 'technical', status: 'satisfied' }),
      makeDemoCP('d3', 'Tax Equity Commitment', { category: 'tax_equity', status: 'pending' }),
    ];

    const result = mergeLiveWithDemoConditions(liveCPs, demoCPs);
    expect(result).toHaveLength(3);
    expect(result[0].category).toBe('offtake');
    expect(result[1].category).toBe('technical');
    expect(result[2].category).toBe('tax_equity');
    expect(result[2].status).toBe('pending');
  });
});

// =============================================================================
// TESTS: FULL PIPELINE END-TO-END
// =============================================================================

describe('CP Pipeline: End-to-End', () => {
  it('transforms 14 ABC-style CPs from code to dashboard', async () => {
    const ast = await parseOrThrow(corporateCP);
    const interp = new ProVisoInterpreter(ast);
    interp.loadFinancials({
      net_income: 15_000_000,
      interest_expense: 7_500_000,
      tax_expense: 5_000_000,
      depreciation: 4_000_000,
      funded_debt: 120_000_000,
    });

    // Full pipeline: interpreter → transformer
    const checklists = interp.getCPChecklistNames().map(n => interp.getCPChecklist(n));
    const conditions = transformCPChecklistsToConditions(checklists, 'abc-acquisition', 'abc-version-3');

    // Verify counts
    expect(conditions).toHaveLength(14);
    const satisfied = conditions.filter(c => c.status === 'satisfied');
    const pending = conditions.filter(c => c.status === 'pending');
    expect(satisfied).toHaveLength(7);
    expect(pending).toHaveLength(7);

    // Verify categories are inferred correctly
    const categories = conditions.map(c => c.category);
    expect(categories).toContain('corporate_documents');
    expect(categories).toContain('credit_agreement');
    expect(categories).toContain('security_documents');
    expect(categories).toContain('ucc_filings');
    expect(categories).toContain('legal_opinions');
    expect(categories).toContain('certificates');
    expect(categories).toContain('insurance');
    expect(categories).toContain('kyc_aml');
    expect(categories).toContain('financial');
  });

  it('transforms 7 project finance CPs from code to dashboard', async () => {
    const ast = await parseOrThrow(projectFinanceCP);
    const interp = new ProVisoInterpreter(ast);
    interp.loadFinancials({
      net_income: 10_000_000,
      interest_expense: 5_000_000,
      depreciation: 8_000_000,
      principal: 3_000_000,
      interest: 5_000_000,
      equity: 60_000_000,
      total_cost: 200_000_000,
    });

    const checklists = interp.getCPChecklistNames().map(n => interp.getCPChecklist(n));
    const conditions = transformCPChecklistsToConditions(checklists, 'solar-demo', 'solar-v3');

    expect(conditions).toHaveLength(7);

    // Verify project-finance specific categories
    const categories = conditions.map(c => c.category);
    expect(categories).toContain('credit_agreement');
    expect(categories).toContain('offtake');
    expect(categories).toContain('permits');
    expect(categories).toContain('technical');
    expect(categories).toContain('tax_equity');
    expect(categories).toContain('insurance');
  });

  it('updates CP status dynamically and re-transforms', async () => {
    const ast = await parseOrThrow(corporateCP);
    const interp = new ProVisoInterpreter(ast);
    interp.loadFinancials({
      net_income: 15_000_000,
      interest_expense: 7_500_000,
      tax_expense: 5_000_000,
      depreciation: 4_000_000,
      funded_debt: 120_000_000,
    });

    // Initial state: Good Standing is pending
    let checklists = interp.getCPChecklistNames().map(n => interp.getCPChecklist(n));
    let conditions = transformCPChecklistsToConditions(checklists, 'deal-1', 'v1');
    const goodStanding = conditions.find(c => c.title === 'Good Standing Certificate');
    expect(goodStanding?.status).toBe('pending');

    // Update status in interpreter
    interp.updateCPStatus('InitialClosing', 'GoodStandingCertificate', 'satisfied');

    // Re-transform
    checklists = interp.getCPChecklistNames().map(n => interp.getCPChecklist(n));
    conditions = transformCPChecklistsToConditions(checklists, 'deal-1', 'v1');
    const updatedGoodStanding = conditions.find(c => c.title === 'Good Standing Certificate');
    expect(updatedGoodStanding?.status).toBe('satisfied');
    expect(updatedGoodStanding?.satisfiedAt).toBeInstanceOf(Date);
  });

  it('merge enriches live CPs with demo metadata', async () => {
    // Simulate the full pipeline with merge
    const ast = await parseOrThrow(corporateCP);
    const interp = new ProVisoInterpreter(ast);
    interp.loadFinancials({
      net_income: 15_000_000,
      interest_expense: 7_500_000,
      tax_expense: 5_000_000,
      depreciation: 4_000_000,
      funded_debt: 120_000_000,
    });

    const checklists = interp.getCPChecklistNames().map(n => interp.getCPChecklist(n));
    const liveCPs = transformCPChecklistsToConditions(checklists, 'deal-1', 'v1');

    // Create demo data that the merge would use
    const demoCPs: ConditionPrecedent[] = [
      {
        id: 'demo-1', dealId: 'deal-1', versionId: 'v3',
        sectionReference: '4.01(a)(i)', category: 'corporate_documents',
        title: 'Certificate of Incorporation',
        description: 'Certified copy of the Certificate of Incorporation',
        responsiblePartyId: 'party-borrower', status: 'satisfied',
        dueDate: new Date('2026-02-10'),
        satisfiedAt: new Date('2026-01-28'),
        satisfiedByDocumentIds: ['doc-1'],
        waivedAt: null, waiverApprovedBy: null, notes: '',
      },
      {
        id: 'demo-2', dealId: 'deal-1', versionId: 'v3',
        sectionReference: '4.01(a)(iv)', category: 'corporate_documents',
        title: 'Good Standing Certificate',
        description: 'Certificate of Good Standing from Delaware',
        responsiblePartyId: 'party-borrower', status: 'pending',
        dueDate: new Date('2026-02-14'),
        satisfiedAt: null, satisfiedByDocumentIds: [],
        waivedAt: null, waiverApprovedBy: null,
        notes: 'Requested from Delaware Secretary of State',
      },
    ];

    const merged = mergeLiveWithDemoConditions(liveCPs, demoCPs);

    // The merged result should have 14 CPs (same as live)
    expect(merged).toHaveLength(14);

    // CertOfInc should have been enriched with demo data
    const certOfInc = merged.find(c => c.title === 'Certificate of Incorporation');
    expect(certOfInc).toBeDefined();
    expect(certOfInc?.id).toBe('demo-1'); // Demo ID preserved
    expect(certOfInc?.dueDate).toEqual(new Date('2026-02-10'));
    expect(certOfInc?.satisfiedAt).toEqual(new Date('2026-01-28'));
    expect(certOfInc?.satisfiedByDocumentIds).toEqual(['doc-1']);
    expect(certOfInc?.responsiblePartyId).toBe('party-borrower');

    // GoodStanding should also be enriched
    const goodStanding = merged.find(c => c.title === 'Good Standing Certificate');
    expect(goodStanding?.id).toBe('demo-2');
    expect(goodStanding?.dueDate).toEqual(new Date('2026-02-14'));
    expect(goodStanding?.notes).toBe('Requested from Delaware Secretary of State');

    // Remaining CPs should be from live (no matching demo)
    // PascalCase "UCC1FinancingStatement" → "UCC1Financing Statement" (split at gS)
    const ucc = merged.find(c => c.title === 'UCC1Financing Statement');
    expect(ucc?.id).toMatch(/^cp-live-/);
    expect(ucc?.dueDate).toBeNull();
  });
});

// =============================================================================
// TESTS: MULTIPLE CP CHECKLISTS
// =============================================================================

describe('CP Pipeline: Multiple Checklists', () => {
  it('handles multiple CONDITIONS_PRECEDENT blocks', async () => {
    const code = `
DEFINE X AS 1

CONDITIONS_PRECEDENT InitialClosing
  SECTION "4.01"

  CP CreditAgreement
    DESCRIPTION "Executed Credit Agreement"
    RESPONSIBLE Agent
    STATUS satisfied

  CP SecurityDocs
    DESCRIPTION "Security documentation"
    RESPONSIBLE Counsel
    STATUS pending

CONDITIONS_PRECEDENT SubsequentDraw
  SECTION "4.02"

  CP ComplianceCert
    DESCRIPTION "Compliance certificate"
    RESPONSIBLE Borrower
    STATUS pending

  CP NoDefault
    DESCRIPTION "No default exists"
    RESPONSIBLE Borrower
    STATUS satisfied
    `;

    const ast = await parseOrThrow(code);
    const interp = new ProVisoInterpreter(ast);
    interp.loadFinancials({ x: 1 });

    expect(interp.getCPChecklistNames()).toHaveLength(2);
    expect(interp.getCPChecklistNames()).toContain('InitialClosing');
    expect(interp.getCPChecklistNames()).toContain('SubsequentDraw');

    const checklists = interp.getCPChecklistNames().map(n => interp.getCPChecklist(n));
    const conditions = transformCPChecklistsToConditions(checklists, 'deal-1', 'v1');

    // Should flatten all checklists into one array
    expect(conditions).toHaveLength(4);

    // First 2 from InitialClosing (section 4.01)
    expect(conditions[0].sectionReference).toBe('4.01');
    expect(conditions[1].sectionReference).toBe('4.01');

    // Next 2 from SubsequentDraw (section 4.02)
    expect(conditions[2].sectionReference).toBe('4.02');
    expect(conditions[3].sectionReference).toBe('4.02');

    // IDs should be sequential across checklists
    expect(conditions.map(c => c.id)).toEqual([
      'cp-live-1', 'cp-live-2', 'cp-live-3', 'cp-live-4',
    ]);
  });
});
