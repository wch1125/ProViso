/**
 * CP Transformer
 *
 * Maps interpreter CPChecklistResult[] → dashboard ConditionPrecedent[].
 * Bridges the gap between the ProViso grammar's CP items and the
 * closing dashboard's richer ConditionPrecedent type.
 *
 * Also provides a merge strategy to enrich live (interpreter-parsed) CPs
 * with rich demo metadata (due dates, document links, satisfied dates, notes).
 */

import type { CPChecklistResult } from '@proviso/types.js';
import type { ConditionPrecedent, CPCategory } from '../data/demo-scenarios';

/**
 * Transform interpreter CP checklists into dashboard ConditionPrecedent objects.
 * Dashboard-only fields (dueDate, documents, signatures) get sensible defaults
 * that the user can enrich via the closing UI.
 */
export function transformCPChecklistsToConditions(
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
        status: item.status === 'not_applicable' ? 'waived' : item.status,
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
 * Merge live interpreter CPs with rich demo closing data.
 *
 * The interpreter provides:
 *   - CP names and descriptions (from grammar)
 *   - Status (pending/satisfied/waived)
 *   - Category (inferred from keywords)
 *
 * The demo data adds:
 *   - Due dates, satisfied dates, document links
 *   - Party IDs matching the closing party roster
 *   - Notes and section references
 *
 * Strategy: Match by title similarity. For each live CP, find the best
 * matching demo CP and merge in the rich fields.
 */
export function mergeLiveWithDemoConditions(
  liveCPs: ConditionPrecedent[],
  demoCPs: ConditionPrecedent[],
): ConditionPrecedent[] {
  if (liveCPs.length === 0) return demoCPs;
  if (demoCPs.length === 0) return liveCPs;

  // Build lookup index from demo CPs by normalized title
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
      // Merge: live provides the structural identity + status from grammar,
      // demo provides rich metadata
      merged.push({
        // Identity from demo (preserves stable IDs for document/signature links)
        id: demoMatch.id,
        dealId: demoMatch.dealId,
        versionId: demoMatch.versionId,
        sectionReference: demoMatch.sectionReference || live.sectionReference,
        // Category from demo (hand-curated) takes priority over inference
        category: demoMatch.category,
        // Title/description from demo (better formatted)
        title: demoMatch.title,
        description: demoMatch.description || live.description,
        // Party from demo (actual party IDs)
        responsiblePartyId: demoMatch.responsiblePartyId,
        // Status from demo (has richer state: dates, documents)
        status: demoMatch.status,
        dueDate: demoMatch.dueDate,
        satisfiedAt: demoMatch.satisfiedAt,
        satisfiedByDocumentIds: demoMatch.satisfiedByDocumentIds,
        waivedAt: demoMatch.waivedAt,
        waiverApprovedBy: demoMatch.waiverApprovedBy,
        notes: demoMatch.notes || live.notes,
      });
    } else {
      // No demo match — use the live CP as-is (new CP from grammar)
      merged.push(live);
    }
  }

  return merged;
}

/**
 * Normalize a CP title for fuzzy matching.
 * Removes common words, converts to lowercase, collapses spaces.
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, '')      // Remove apostrophes
    .replace(/[-_]/g, ' ')     // Hyphens/underscores to spaces
    .replace(/\s+/g, ' ')      // Collapse whitespace
    .trim();
}

/**
 * Find the best matching demo CP using substring/keyword matching.
 * Returns null if no reasonable match is found.
 */
function findBestMatch(
  normalizedLive: string,
  demoByTitle: Map<string, ConditionPrecedent>,
): ConditionPrecedent | null {
  const liveWords = normalizedLive.split(' ').filter(w => w.length > 2);
  let bestMatch: ConditionPrecedent | null = null;
  let bestScore = 0;

  for (const [demoTitle, demoCP] of demoByTitle) {
    // Count how many significant words from the live title appear in the demo title
    let score = 0;
    for (const word of liveWords) {
      if (demoTitle.includes(word)) {
        score++;
      }
    }
    // Also check reverse: significant demo words in live
    const demoWords = demoTitle.split(' ').filter(w => w.length > 2);
    for (const word of demoWords) {
      if (normalizedLive.includes(word)) {
        score++;
      }
    }

    // Require at least 2 matching words (or 1 for short titles)
    const minScore = Math.min(liveWords.length, demoWords.length) >= 2 ? 2 : 1;
    if (score > bestScore && score >= minScore) {
      bestScore = score;
      bestMatch = demoCP;
    }
  }

  return bestMatch;
}

/**
 * Convert a PascalCase or snake_case CP name to a human-readable title.
 * e.g. "CertificateOfIncorporation" → "Certificate Of Incorporation"
 * e.g. "credit_agreement_execution" → "Credit Agreement Execution"
 */
export function formatCPTitle(name: string): string {
  if (name.includes('_')) {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  // PascalCase → spaced
  return name.replace(/([a-z])([A-Z])/g, '$1 $2');
}

/**
 * Infer a CPCategory from the CP name and description.
 * Uses keyword matching to assign the most likely category.
 */
export function inferCategory(name: string, description: string): CPCategory {
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
