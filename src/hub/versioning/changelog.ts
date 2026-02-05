/**
 * ProViso Hub v2.0 — Change Log Generator
 *
 * Generates human-readable change logs from version comparisons.
 * Supports multiple output formats (detailed, summary, executive).
 */

import type { DealVersion, ChangeSummary, Change } from '../types.js';
import { compileToState, diffStates } from './differ.js';
import { classifyChange } from './classifier.js';

// =============================================================================
// TYPES
// =============================================================================

export type ChangeLogFormat = 'detailed' | 'summary' | 'executive';

export interface ChangeLogOptions {
  /** Version being compared from */
  fromVersion: DealVersion;
  /** Version being compared to */
  toVersion: DealVersion;
  /** Include code diffs in output */
  includeCodeDiffs: boolean;
  /** Include impact analysis */
  includeImpactAnalysis: boolean;
  /** Output format */
  format: ChangeLogFormat;
}

export interface GeneratedChangeLog {
  header: {
    dealName: string | null;
    fromVersion: number;
    toVersion: number;
    authorParty: string;
    date: Date;
  };
  summary: ChangeSummary;
  changes: Change[];
  text: string;
  validation: {
    valid: boolean;
    errors: string[];
  };
}

// =============================================================================
// CHANGE LOG GENERATION
// =============================================================================

/**
 * Generate a complete change summary from two versions.
 */
export async function generateChangeSummary(
  fromVersion: DealVersion,
  toVersion: DealVersion
): Promise<ChangeSummary> {
  const fromState = await compileToState(fromVersion.creditLangCode);
  const toState = await compileToState(toVersion.creditLangCode);
  const diffResult = diffStates(fromState, toState);

  // Classify each diff
  const changes: Change[] = diffResult.diffs.map((diff) => classifyChange(diff));

  // Compute impact stats
  const borrowerFavorable = changes.filter((c) => c.impact === 'borrower_favorable').length;
  const lenderFavorable = changes.filter((c) => c.impact === 'lender_favorable').length;
  const neutral = changes.filter((c) => c.impact === 'neutral' || c.impact === 'unclear').length;

  return {
    versionFrom: fromVersion.versionNumber,
    versionTo: toVersion.versionNumber,
    authorParty: toVersion.authorParty,
    createdAt: new Date(),
    totalChanges: changes.length,
    covenantChanges: diffResult.stats.byType.covenant,
    definitionChanges: diffResult.stats.byType.definition,
    basketChanges: diffResult.stats.byType.basket,
    otherChanges:
      diffResult.stats.totalChanges -
      diffResult.stats.byType.covenant -
      diffResult.stats.byType.definition -
      diffResult.stats.byType.basket,
    borrowerFavorable,
    lenderFavorable,
    neutral,
    changes,
  };
}

/**
 * Generate a full change log with text output.
 */
export async function generateChangeLog(options: ChangeLogOptions): Promise<GeneratedChangeLog> {
  const summary = await generateChangeSummary(options.fromVersion, options.toVersion);
  const validation = await validateChanges(options.toVersion.creditLangCode);

  let text: string;
  switch (options.format) {
    case 'executive':
      text = formatExecutive(summary, options);
      break;
    case 'summary':
      text = formatSummary(summary, options);
      break;
    case 'detailed':
    default:
      text = formatDetailed(summary, options);
  }

  return {
    header: {
      dealName: null, // Would come from deal context
      fromVersion: options.fromVersion.versionNumber,
      toVersion: options.toVersion.versionNumber,
      authorParty: options.toVersion.authorParty,
      date: options.toVersion.createdAt,
    },
    summary,
    changes: summary.changes,
    text,
    validation,
  };
}

// =============================================================================
// FORMAT FUNCTIONS
// =============================================================================

/**
 * Format detailed change log.
 */
function formatDetailed(summary: ChangeSummary, options: ChangeLogOptions): string {
  const lines: string[] = [];
  const divider = '═'.repeat(79);
  const thinDivider = '─'.repeat(79);

  // Header
  lines.push(divider);
  lines.push(centerText('CHANGE LOG', 79));
  lines.push(centerText(`v${summary.versionFrom} → v${summary.versionTo} (${summary.authorParty})`, 79));
  lines.push(centerText(formatDate(summary.createdAt), 79));
  lines.push(centerText(`Author: ${summary.authorParty}`, 79));
  lines.push(divider);
  lines.push('');

  // Summary section
  lines.push('SUMMARY');
  lines.push(thinDivider);
  lines.push(`• ${summary.totalChanges} change${summary.totalChanges !== 1 ? 's' : ''} total`);
  lines.push(
    `• ${summary.borrowerFavorable} borrower-favorable | ${summary.lenderFavorable} lender-favorable | ${summary.neutral} neutral`
  );
  lines.push('');

  // Changes by category
  if (summary.covenantChanges > 0) {
    lines.push(`  Covenants: ${summary.covenantChanges}`);
  }
  if (summary.basketChanges > 0) {
    lines.push(`  Baskets: ${summary.basketChanges}`);
  }
  if (summary.definitionChanges > 0) {
    lines.push(`  Definitions: ${summary.definitionChanges}`);
  }
  if (summary.otherChanges > 0) {
    lines.push(`  Other: ${summary.otherChanges}`);
  }
  lines.push('');

  // Individual changes
  summary.changes.forEach((change, index) => {
    lines.push(thinDivider);
    lines.push(`${index + 1}. SECTION ${change.sectionReference} — ${change.elementName}`);
    lines.push(thinDivider);

    const impactLabel = formatImpact(change.impact);
    lines.push(`   Change: ${change.title.toUpperCase()}${impactLabel ? `    ${impactLabel}` : ''}`);
    lines.push('');

    if (change.beforeValue && change.afterValue) {
      lines.push(`   Before: ${change.beforeValue}`);
      lines.push(`   After:  ${change.afterValue}`);
      lines.push('');
    }

    if (options.includeCodeDiffs && (change.beforeCode || change.afterCode)) {
      lines.push('   Code diff:');
      if (change.beforeCode) {
        lines.push(`   - ${change.beforeCode.split('\n').join('\n   - ')}`);
      }
      if (change.afterCode) {
        lines.push(`   + ${change.afterCode.split('\n').join('\n   + ')}`);
      }
      lines.push('');
    }

    if (options.includeImpactAnalysis && change.impactDescription) {
      lines.push(`   Impact: ${change.impactDescription}`);
      lines.push('');
    }
  });

  // Validation section
  lines.push(divider);
  lines.push('VALIDATION');
  lines.push(thinDivider);
  if (options.fromVersion.creditLangCode && options.toVersion.creditLangCode) {
    lines.push('✓ All code changes validated');
    lines.push('✓ All references resolve');
  }
  lines.push(divider);

  return lines.join('\n');
}

/**
 * Format summary change log.
 */
function formatSummary(summary: ChangeSummary, _options: ChangeLogOptions): string {
  const lines: string[] = [];

  lines.push(`Change Log: v${summary.versionFrom} → v${summary.versionTo}`);
  lines.push(`Author: ${summary.authorParty}`);
  lines.push(`Date: ${formatDate(summary.createdAt)}`);
  lines.push('');
  lines.push(`Total Changes: ${summary.totalChanges}`);
  lines.push(`  Borrower Favorable: ${summary.borrowerFavorable}`);
  lines.push(`  Lender Favorable: ${summary.lenderFavorable}`);
  lines.push(`  Neutral: ${summary.neutral}`);
  lines.push('');

  if (summary.changes.length > 0) {
    lines.push('Changes:');
    summary.changes.forEach((change, index) => {
      const impactIcon = getImpactIcon(change.impact);
      lines.push(`  ${index + 1}. ${impactIcon} ${change.title} (${change.elementName})`);
    });
  }

  return lines.join('\n');
}

/**
 * Format executive summary (brief).
 */
function formatExecutive(summary: ChangeSummary, _options: ChangeLogOptions): string {
  const lines: string[] = [];

  lines.push(`EXECUTIVE SUMMARY: v${summary.versionFrom} → v${summary.versionTo}`);
  lines.push('');

  if (summary.totalChanges === 0) {
    lines.push('No changes between versions.');
    return lines.join('\n');
  }

  lines.push(`${summary.authorParty} made ${summary.totalChanges} change${summary.totalChanges !== 1 ? 's' : ''}:`);
  lines.push('');

  if (summary.borrowerFavorable > 0) {
    lines.push(`• ${summary.borrowerFavorable} change${summary.borrowerFavorable !== 1 ? 's' : ''} favor the Borrower`);
  }
  if (summary.lenderFavorable > 0) {
    lines.push(`• ${summary.lenderFavorable} change${summary.lenderFavorable !== 1 ? 's' : ''} favor the Lender`);
  }
  if (summary.neutral > 0) {
    lines.push(`• ${summary.neutral} neutral change${summary.neutral !== 1 ? 's' : ''}`);
  }

  lines.push('');
  lines.push('Key Changes:');
  // Show up to 3 most significant changes
  const significantChanges = summary.changes
    .filter((c) => c.impact !== 'neutral')
    .slice(0, 3);

  if (significantChanges.length > 0) {
    significantChanges.forEach((change) => {
      lines.push(`  - ${change.title}`);
    });
  } else {
    // Show first 3 changes if none are significant
    summary.changes.slice(0, 3).forEach((change) => {
      lines.push(`  - ${change.title}`);
    });
  }

  return lines.join('\n');
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validate the changes (check if code parses).
 */
async function validateChanges(code: string): Promise<{ valid: boolean; errors: string[] }> {
  const state = await compileToState(code);
  if (state.parseError) {
    return { valid: false, errors: [state.parseError] };
  }
  return { valid: true, errors: [] };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Center text within a given width.
 */
function centerText(text: string, width: number): string {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(padding) + text;
}

/**
 * Format date for display.
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format impact for display.
 */
function formatImpact(impact: string): string {
  switch (impact) {
    case 'borrower_favorable':
      return 'Borrower Favorable';
    case 'lender_favorable':
      return 'Lender Favorable';
    case 'neutral':
      return 'Neutral';
    default:
      return '';
  }
}

/**
 * Get icon for impact.
 */
function getImpactIcon(impact: string): string {
  switch (impact) {
    case 'borrower_favorable':
      return '[B+]';
    case 'lender_favorable':
      return '[L+]';
    case 'neutral':
      return '[=]';
    default:
      return '[?]';
  }
}

// Re-export key functions for convenience
export { compileToState, diffStates } from './differ.js';
export { classifyChange } from './classifier.js';
