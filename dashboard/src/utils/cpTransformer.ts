/**
 * CP Transformer
 *
 * Maps interpreter CPChecklistResult[] → dashboard ConditionPrecedent[].
 * Bridges the gap between the ProViso grammar's CP items and the
 * closing dashboard's richer ConditionPrecedent type.
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
 * Convert a PascalCase or snake_case CP name to a human-readable title.
 * e.g. "CertificateOfIncorporation" → "Certificate Of Incorporation"
 * e.g. "credit_agreement_execution" → "Credit Agreement Execution"
 */
function formatCPTitle(name: string): string {
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
function inferCategory(name: string, description: string): CPCategory {
  const text = `${name} ${description}`.toLowerCase();

  if (text.includes('certificate') && (text.includes('incorporat') || text.includes('formation') || text.includes('good standing'))) {
    return 'corporate_documents';
  }
  if (text.includes('bylaw') || text.includes('resolution') || text.includes('board')) {
    return 'corporate_documents';
  }
  if (text.includes('credit agreement') || text.includes('loan agreement') || text.includes('facility agreement')) {
    return 'credit_agreement';
  }
  if (text.includes('security') || text.includes('pledge') || text.includes('mortgage') || text.includes('collateral') || text.includes('lien')) {
    return 'security_documents';
  }
  if (text.includes('ucc') || text.includes('filing')) {
    return 'ucc_filings';
  }
  if (text.includes('opinion') || text.includes('legal')) {
    return 'legal_opinions';
  }
  if (text.includes('insurance') || text.includes('policy')) {
    return 'insurance';
  }
  if (text.includes('kyc') || text.includes('aml') || text.includes('know your') || text.includes('anti-money')) {
    return 'kyc_aml';
  }
  if (text.includes('financial') || text.includes('audit') || text.includes('balance sheet') || text.includes('income statement')) {
    return 'financial';
  }
  if (text.includes('permit') || text.includes('regulatory') || text.includes('license') || text.includes('approval') || text.includes('nepa') || text.includes('zoning')) {
    return 'permits';
  }
  if (text.includes('technical') || text.includes('engineer') || text.includes('construction') || text.includes('epc')) {
    return 'technical';
  }
  if (text.includes('tax') || text.includes('equity') || text.includes('flip') || text.includes('depreciation')) {
    return 'tax_equity';
  }
  if (text.includes('offtake') || text.includes('ppa') || text.includes('power purchase')) {
    return 'offtake';
  }
  if (text.includes('certificate') || text.includes('compliance') || text.includes('officer')) {
    return 'certificates';
  }

  return 'other';
}
