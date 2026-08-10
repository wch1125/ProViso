/**
 * ProViso Hub v2.0 — Word Generator
 *
 * Generates Word document prose from ProViso code.
 * This is the deterministic "95% path" - code → Word.
 */

import { parse as parseAsync } from '../../parser.js';
import type { Program, Statement } from '../../types.js';
import {
  renderCovenantToWord,
  renderBasketToWord,
  renderDefinitionToWord,
  renderConditionToWord,
  renderPhaseToWord,
  renderMilestoneToWord,
  renderReserveToWord,
  renderWaterfallToWord,
  renderConditionsPrecedentToWord,
  renderFacilityToWord,
  type WordTemplateContext,
  type GeneratedSection,
} from './templates.js';

// =============================================================================
// TYPES
// =============================================================================

export interface DocumentMetadata {
  dealName: string;
  facilityAmount?: number;
  currency?: string;
  closingDate?: string;
  version?: string;
  author?: string;
}

export interface GeneratedDocument {
  metadata: DocumentMetadata;
  articles: GeneratedArticle[];
  fullText: string;
}

export interface GeneratedArticle {
  articleNumber: number;
  title: string;
  sections: GeneratedSection[];
}

export interface RedlineResult {
  hasChanges: boolean;
  addedSections: GeneratedSection[];
  removedSections: GeneratedSection[];
  modifiedSections: Array<{
    sectionReference: string;
    oldContent: string;
    newContent: string;
  }>;
  fullRedline: string;
}

// =============================================================================
// WORD GENERATOR CLASS
// =============================================================================

export class WordGenerator {
  /**
   * Generate a complete document from ProViso code.
   */
  async generateDocument(
    code: string,
    metadata: DocumentMetadata
  ): Promise<GeneratedDocument> {
    const parseResult = await parseAsync(code);

    if (!parseResult.success || !parseResult.ast) {
      throw new Error(
        `Failed to parse ProViso code: ${parseResult.error?.message}`
      );
    }

    const articles = this.organizeIntoArticles(parseResult.ast);
    const fullText = this.buildFullText(articles, metadata);

    return {
      metadata,
      articles,
      fullText,
    };
  }

  /**
   * Generate just one section from a statement.
   */
  generateSection(statement: Statement, context?: WordTemplateContext): GeneratedSection {
    const content = this.renderStatement(statement, context);
    const sectionRef = context?.sectionPrefix || '';
    const subsection = context?.subsectionLabel || '';

    return {
      sectionReference: `${sectionRef}${subsection}`,
      sectionPrefix: sectionRef,
      title: this.getStatementName(statement),
      content,
      elementType: statement.type,
      elementName: this.getStatementName(statement),
    };
  }

  /**
   * Generate a redline document comparing two versions.
   */
  async generateRedline(oldCode: string, newCode: string): Promise<RedlineResult> {
    const oldDoc = await this.generateDocument(oldCode, { dealName: 'Old Version' });
    const newDoc = await this.generateDocument(newCode, { dealName: 'New Version' });

    const addedSections: GeneratedSection[] = [];
    const removedSections: GeneratedSection[] = [];
    const modifiedSections: Array<{
      sectionReference: string;
      oldContent: string;
      newContent: string;
    }> = [];

    // Build lookup maps
    const oldSections = new Map<string, GeneratedSection>();
    const newSections = new Map<string, GeneratedSection>();

    for (const article of oldDoc.articles) {
      for (const section of article.sections) {
        oldSections.set(section.elementName, section);
      }
    }

    for (const article of newDoc.articles) {
      for (const section of article.sections) {
        newSections.set(section.elementName, section);
      }
    }

    // Find removed sections
    for (const [name, oldSection] of oldSections) {
      if (!newSections.has(name)) {
        removedSections.push(oldSection);
      }
    }

    // Find added and modified sections
    for (const [name, newSection] of newSections) {
      const oldSection = oldSections.get(name);
      if (!oldSection) {
        addedSections.push(newSection);
      } else if (oldSection.content !== newSection.content) {
        modifiedSections.push({
          sectionReference: newSection.sectionReference,
          oldContent: oldSection.content,
          newContent: newSection.content,
        });
      }
    }

    // Build redline text
    const fullRedline = this.buildRedlineText(
      addedSections,
      removedSections,
      modifiedSections
    );

    return {
      hasChanges:
        addedSections.length > 0 ||
        removedSections.length > 0 ||
        modifiedSections.length > 0,
      addedSections,
      removedSections,
      modifiedSections,
      fullRedline,
    };
  }

  /**
   * Generate Word prose for a specific element type.
   */
  generateForElement(
    elementType: string,
    elementName: string,
    code: string
  ): string | null {
    // This would parse the code and extract the specific element
    // For now, return the entire generated output for the code
    return code;
  }

  // ===========================================================================
  // PRIVATE METHODS
  // ===========================================================================

  /**
   * Build a subsection label for a zero-based index: (a), (b), ... (z), (aa),
   * (ab), ...
   *
   * `String.fromCharCode(97 + i)` produced '{', '|', '}' past 26 elements, and
   * several call sites suppressed the label for i === 0, which made lettering
   * start at (b) and skip (a) entirely.
   */
  private subsectionLabel(index: number): string {
    let n = index;
    let label = '';
    do {
      label = String.fromCharCode(97 + (n % 26)) + label;
      n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    return `(${label})`;
  }

  /**
   * Organize statements into articles.
   */
  private organizeIntoArticles(ast: Program): GeneratedArticle[] {
    const articles: GeneratedArticle[] = [];

    // Article 1: Definitions
    const definitions = ast.statements.filter((s) => s.type === 'Define');
    if (definitions.length > 0) {
      articles.push({
        articleNumber: 1,
        title: 'Definitions',
        sections: definitions.map((s, i) =>
          this.generateSection(s, {
            sectionPrefix: '1.01',
            subsectionLabel: this.subsectionLabel(i),
          })
        ),
      });
    }

    // Article 2: The Credits — commitments and tranches
    const facilities = ast.statements.filter((s) => s.type === 'Facility');
    if (facilities.length > 0) {
      articles.push({
        articleNumber: 2,
        title: 'The Credits',
        sections: facilities.map((s, i) =>
          this.generateSection(s, {
            sectionPrefix: '2.01',
            subsectionLabel: this.subsectionLabel(i),
          })
        ),
      });
    }

    // Article 4: Conditions Precedent
    const cps = ast.statements.filter((s) => s.type === 'ConditionsPrecedent');
    if (cps.length > 0) {
      articles.push({
        articleNumber: 4,
        title: 'Conditions Precedent',
        sections: cps.map((s, i) =>
          this.generateSection(s, {
            sectionPrefix: '4.01',
            subsectionLabel: this.subsectionLabel(i),
          })
        ),
      });
    }

    // Article 5: Project Phases (if applicable)
    const phases = ast.statements.filter((s) => s.type === 'Phase');
    if (phases.length > 0) {
      articles.push({
        articleNumber: 5,
        title: 'Project Phases',
        sections: phases.map((s, i) =>
          this.generateSection(s, {
            sectionPrefix: '5.01',
            subsectionLabel: this.subsectionLabel(i),
          })
        ),
      });
    }

    // Article 6: Milestones (if applicable)
    const milestones = ast.statements.filter((s) => s.type === 'Milestone');
    if (milestones.length > 0) {
      articles.push({
        articleNumber: 6,
        title: 'Construction Milestones',
        sections: milestones.map((s, i) =>
          this.generateSection(s, {
            sectionPrefix: '6.01',
            subsectionLabel: this.subsectionLabel(i),
          })
        ),
      });
    }

    // Article 7: Covenants (including baskets)
    const covenants = ast.statements.filter((s) => s.type === 'Covenant');
    const baskets = ast.statements.filter((s) => s.type === 'Basket');
    // Conditions could be used for Article 8 in future
    // const conditions = ast.statements.filter((s) => s.type === 'Condition');

    if (covenants.length > 0 || baskets.length > 0) {
      const covenantSections: GeneratedSection[] = [];

      // 7.11: Financial Covenants
      covenants.forEach((s, i) => {
        covenantSections.push(
          this.generateSection(s, {
            sectionPrefix: '7.11',
            subsectionLabel: this.subsectionLabel(i),
          })
        );
      });

      // 7.02: Baskets (Investments, Indebtedness, etc.)
      baskets.forEach((s, i) => {
        covenantSections.push(
          this.generateSection(s, {
            sectionPrefix: '7.02',
            subsectionLabel: this.subsectionLabel(i),
          })
        );
      });

      articles.push({
        articleNumber: 7,
        title: 'Covenants',
        sections: covenantSections,
      });
    }

    // Article 9: Reserve Accounts (if applicable)
    const reserves = ast.statements.filter((s) => s.type === 'Reserve');
    if (reserves.length > 0) {
      articles.push({
        articleNumber: 9,
        title: 'Reserve Accounts',
        sections: reserves.map((s, i) =>
          this.generateSection(s, {
            sectionPrefix: '9.01',
            subsectionLabel: this.subsectionLabel(i),
          })
        ),
      });
    }

    // Article 10: Cash Waterfalls (if applicable)
    const waterfalls = ast.statements.filter((s) => s.type === 'Waterfall');
    if (waterfalls.length > 0) {
      articles.push({
        articleNumber: 10,
        title: 'Cash Waterfalls',
        sections: waterfalls.map((s, i) =>
          this.generateSection(s, {
            sectionPrefix: '10.01',
            subsectionLabel: this.subsectionLabel(i),
          })
        ),
      });
    }

    return articles.sort((a, b) => a.articleNumber - b.articleNumber);
  }

  /**
   * Render a statement to Word prose.
   */
  private renderStatement(statement: Statement, context?: WordTemplateContext): string {
    switch (statement.type) {
      case 'Covenant':
        return renderCovenantToWord(statement, context);
      case 'Basket':
        return renderBasketToWord(statement, context);
      case 'Define':
        return renderDefinitionToWord(statement, context);
      case 'Condition':
        return renderConditionToWord(statement, context);
      case 'Phase':
        return renderPhaseToWord(statement, context);
      case 'Milestone':
        return renderMilestoneToWord(statement, context);
      case 'Reserve':
        return renderReserveToWord(statement, context);
      case 'Waterfall':
        return renderWaterfallToWord(statement, context);
      case 'ConditionsPrecedent':
        return renderConditionsPrecedentToWord(statement, context);
      case 'Facility':
        return renderFacilityToWord(statement, context);
      default:
        return `[Unknown statement type: ${statement.type}]`;
    }
  }

  /**
   * Get the name of a statement.
   */
  private getStatementName(statement: Statement): string {
    switch (statement.type) {
      case 'Covenant':
      case 'Basket':
      case 'Define':
      case 'Condition':
      case 'Phase':
      case 'Milestone':
      case 'Reserve':
      case 'Waterfall':
      case 'ConditionsPrecedent':
      case 'Facility':
        return statement.name;
      case 'Prohibit':
        return statement.target;
      case 'Event':
        return statement.name;
      default:
        return 'Unknown';
    }
  }

  /**
   * Build the full document text.
   */
  private buildFullText(articles: GeneratedArticle[], metadata: DocumentMetadata): string {
    const lines: string[] = [];

    // Document header
    lines.push('═'.repeat(80));
    lines.push(`                          CREDIT AGREEMENT`);
    lines.push(`                            ${metadata.dealName}`);
    if (metadata.facilityAmount) {
      lines.push(`                     ${this.formatCurrency(metadata.facilityAmount)}`);
    }
    lines.push('═'.repeat(80));
    lines.push('');

    // Articles
    for (const article of articles) {
      lines.push(`ARTICLE ${article.articleNumber}`);
      lines.push(article.title.toUpperCase());
      lines.push('─'.repeat(40));
      lines.push('');

      for (const section of article.sections) {
        // Prefix the article-level section number. Each element group restarts
        // its subsection lettering at (a), so a bare "(a)" is ambiguous across
        // groups — the first covenant and the first basket both produced "(a)"
        // and collided when the document was re-parsed for drift detection.
        // Section content already opens with its own subsection label, so
        // "7.11" + "(a) MaxLeverage." composes into "7.11(a) MaxLeverage."
        lines.push(`${section.sectionPrefix}${section.content}`);
        lines.push('');
      }

      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Build redline text showing changes.
   */
  private buildRedlineText(
    added: GeneratedSection[],
    removed: GeneratedSection[],
    modified: Array<{ sectionReference: string; oldContent: string; newContent: string }>
  ): string {
    const lines: string[] = [];

    lines.push('═'.repeat(80));
    lines.push('                              REDLINE');
    lines.push('═'.repeat(80));
    lines.push('');

    if (added.length > 0) {
      lines.push('ADDED SECTIONS:');
      lines.push('─'.repeat(40));
      for (const section of added) {
        lines.push(`[+] ${section.elementName}`);
        lines.push(`    ${section.content}`);
        lines.push('');
      }
    }

    if (removed.length > 0) {
      lines.push('REMOVED SECTIONS:');
      lines.push('─'.repeat(40));
      for (const section of removed) {
        lines.push(`[-] ${section.elementName}`);
        lines.push(`    ${section.content}`);
        lines.push('');
      }
    }

    if (modified.length > 0) {
      lines.push('MODIFIED SECTIONS:');
      lines.push('─'.repeat(40));
      for (const mod of modified) {
        lines.push(`[~] ${mod.sectionReference}`);
        lines.push(`    OLD: ${mod.oldContent}`);
        lines.push(`    NEW: ${mod.newContent}`);
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  /**
   * Format currency for display.
   */
  private formatCurrency(value: number): string {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)} Billion`;
    }
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(0)} Million`;
    }
    return `$${value.toLocaleString('en-US')}`;
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Create a new WordGenerator instance.
 */
export function createWordGenerator(): WordGenerator {
  return new WordGenerator();
}

/**
 * Generate a document from ProViso code.
 */
export async function generateWordDocument(
  code: string,
  metadata: DocumentMetadata
): Promise<GeneratedDocument> {
  const generator = createWordGenerator();
  return generator.generateDocument(code, metadata);
}

/**
 * Generate a redline between two versions.
 */
export async function generateRedline(
  oldCode: string,
  newCode: string
): Promise<RedlineResult> {
  const generator = createWordGenerator();
  return generator.generateRedline(oldCode, newCode);
}
