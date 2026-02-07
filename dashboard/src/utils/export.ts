/**
 * Export Utilities
 *
 * Generate downloadable checklists and reports for the Closing Dashboard.
 */

import type { ClosingStats } from '../context/ClosingContext';

interface ConditionForExport {
  sectionReference: string;
  title: string;
  description: string;
  status: 'pending' | 'satisfied' | 'waived';
  responsiblePartyName: string;
  category: string;
  dueDate: Date | null;
  notes: string;
}

interface DocumentForExport {
  title: string;
  fileName: string;
  status: 'pending' | 'uploaded' | 'executed';
  documentType: string;
  responsiblePartyName: string | null;
  signatures: Array<{
    partyName: string;
    signatoryName: string;
    status: string;
    signedAt: Date | null;
  }>;
}

interface DealForExport {
  name: string;
  facilityAmount: number;
  currency: string;
  targetClosingDate: Date;
}

/**
 * Format currency with commas and symbol
 */
function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date in a readable format
 */
function formatDate(date: Date | null): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get status emoji
 */
function getStatusEmoji(status: string): string {
  switch (status) {
    case 'satisfied':
    case 'signed':
    case 'executed':
      return '[x]';
    case 'waived':
      return '[~]';
    case 'requested':
      return '[>]';
    case 'declined':
      return '[!]';
    case 'uploaded':
      return '[^]';
    default:
      return '[ ]';
  }
}

/**
 * Group conditions by category
 */
function groupByCategory<T extends { category: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((groups, item) => {
    const cat = item.category;
    if (!groups[cat]) {
      groups[cat] = [];
    }
    groups[cat].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

const categoryLabels: Record<string, string> = {
  corporate_documents: 'Corporate Documents',
  credit_agreement: 'Credit Agreement',
  security_documents: 'Security Documents',
  ucc_filings: 'UCC Filings',
  legal_opinions: 'Legal Opinions',
  certificates: 'Certificates',
  financial: 'Financial',
  insurance: 'Insurance',
  kyc_aml: 'KYC/AML',
  other: 'Other',
  corporate: 'Corporate',
  security: 'Security',
  opinion: 'Legal Opinion',
  certificate: 'Certificate',
};

/**
 * Generate a closing checklist in Markdown format
 */
export function generateClosingChecklist(
  deal: DealForExport,
  conditions: ConditionForExport[],
  documents: DocumentForExport[],
  stats: ClosingStats
): string {
  const lines: string[] = [];
  const now = new Date();

  // Header
  lines.push(`# Closing Checklist`);
  lines.push('');
  lines.push(`**Deal:** ${deal.name}`);
  lines.push(`**Facility Amount:** ${formatCurrency(deal.facilityAmount, deal.currency)}`);
  lines.push(`**Target Closing Date:** ${formatDate(deal.targetClosingDate)}`);
  lines.push(`**Generated:** ${formatDate(now)}`);
  lines.push('');

  // Summary
  lines.push('## Summary');
  lines.push('');
  lines.push('| Category | Complete | Pending | Total |');
  lines.push('|----------|----------|---------|-------|');
  lines.push(`| Conditions | ${stats.conditions.satisfied + stats.conditions.waived} | ${stats.conditions.pending} | ${stats.conditions.total} |`);
  lines.push(`| Documents | ${stats.documents.uploaded + stats.documents.executed} | ${stats.documents.pending} | ${stats.documents.total} |`);
  lines.push(`| Signatures | ${stats.signatures.signed} | ${stats.signatures.pending + stats.signatures.requested} | ${stats.signatures.total} |`);
  lines.push('');

  // Legend
  lines.push('### Legend');
  lines.push('- `[x]` = Complete/Satisfied/Signed');
  lines.push('- `[~]` = Waived');
  lines.push('- `[>]` = Requested');
  lines.push('- `[^]` = Uploaded');
  lines.push('- `[ ]` = Pending');
  lines.push('- `[!]` = Declined/Issue');
  lines.push('');

  // Conditions Precedent
  lines.push('## Conditions Precedent');
  lines.push('');

  const groupedConditions = groupByCategory(conditions);
  for (const [category, cps] of Object.entries(groupedConditions)) {
    lines.push(`### ${categoryLabels[category] || category}`);
    lines.push('');
    for (const cp of cps) {
      const status = getStatusEmoji(cp.status);
      const dueInfo = cp.dueDate ? ` (Due: ${formatDate(cp.dueDate)})` : '';
      lines.push(`${status} **${cp.sectionReference}** - ${cp.title}`);
      lines.push(`    - ${cp.description}`);
      lines.push(`    - Responsible: ${cp.responsiblePartyName}${dueInfo}`);
      if (cp.notes && cp.status === 'pending') {
        lines.push(`    - Note: ${cp.notes}`);
      }
      lines.push('');
    }
  }

  // Documents
  lines.push('## Documents');
  lines.push('');

  const groupedDocs = documents.reduce((groups, doc) => {
    const type = doc.documentType;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(doc);
    return groups;
  }, {} as Record<string, DocumentForExport[]>);

  for (const [type, docs] of Object.entries(groupedDocs)) {
    lines.push(`### ${categoryLabels[type] || type}`);
    lines.push('');
    for (const doc of docs) {
      const status = getStatusEmoji(doc.status);
      lines.push(`${status} **${doc.title}**`);
      lines.push(`    - File: ${doc.fileName}`);
      if (doc.responsiblePartyName) {
        lines.push(`    - Responsible: ${doc.responsiblePartyName}`);
      }

      // Signatures
      if (doc.signatures.length > 0) {
        lines.push(`    - Signatures:`);
        for (const sig of doc.signatures) {
          const sigStatus = getStatusEmoji(sig.status);
          const signedInfo = sig.signedAt ? ` (${formatDate(sig.signedAt)})` : '';
          lines.push(`        ${sigStatus} ${sig.partyName} - ${sig.signatoryName}${signedInfo}`);
        }
      }
      lines.push('');
    }
  }

  // Footer
  lines.push('---');
  lines.push('');
  lines.push(`*Generated by ProViso at ${now.toISOString()}*`);

  return lines.join('\n');
}

/**
 * Download content as a file
 */
export function downloadAsFile(content: string, filename: string, mimeType: string = 'text/plain'): boolean {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Failed to download file:', err);
    return false;
  }
}

/**
 * Copy content to clipboard
 */
export async function copyToClipboard(content: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}
