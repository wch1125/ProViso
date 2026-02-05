/**
 * ProViso Hub v2.0 — Drift Detector
 *
 * Detects differences between expected Word output and actual Word document text.
 * This is the "5% path" - handling cases where lawyers edit Word directly.
 */

import { generateWordDocument } from './generator.js';

// =============================================================================
// TYPES
// =============================================================================

export interface DriftReport {
  hasDrift: boolean;
  drifts: Drift[];
  stats: DriftStats;
}

export interface Drift {
  id: string;
  section: string;
  driftType: DriftType;
  severity: DriftSeverity;
  expectedText: string;
  actualText: string;
  classification: DriftClassification | null;
  suggestedCode: string | null;
  suggestedForm: string | null;
  confidence: number;
  resolved: boolean;
}

export type DriftType = 'addition' | 'modification' | 'deletion';
export type DriftSeverity = 'high' | 'medium' | 'low';

export interface DriftClassification {
  elementType: ElementType;
  changeCategory: ChangeCategory;
  explanation: string;
  confidence: number;
}

export type ElementType =
  | 'covenant'
  | 'basket'
  | 'definition'
  | 'condition'
  | 'phase'
  | 'milestone'
  | 'reserve'
  | 'waterfall'
  | 'cp'
  | 'other';

export type ChangeCategory =
  | 'threshold'
  | 'capacity'
  | 'definition'
  | 'timing'
  | 'structure'
  | 'cure'
  | 'condition'
  | 'other';

export interface DriftStats {
  totalDrifts: number;
  byType: Record<DriftType, number>;
  bySeverity: Record<DriftSeverity, number>;
  byCategory: Partial<Record<ChangeCategory, number>>;
}

export interface TextDiff {
  section: string;
  type: DriftType;
  expected: string;
  actual: string;
  lineNumber: number;
}

// =============================================================================
// DRIFT DETECTOR
// =============================================================================

export class DriftDetector {
  private idCounter = 0;

  /**
   * Detect drift between current code and actual Word document text.
   */
  async detectDrift(actualWordText: string, currentCode: string): Promise<DriftReport> {
    // 1. Generate expected Word from current code
    const expectedDoc = await generateWordDocument(currentCode, {
      dealName: 'Expected',
    });
    const expectedText = expectedDoc.fullText;

    // 2. Section-by-section diff
    const textDiffs = this.diffBySections(expectedText, actualWordText);

    // 3. Classify each diff
    const drifts: Drift[] = [];
    for (const diff of textDiffs) {
      const classification = this.classifyDrift(diff);
      const suggestedCode = classification
        ? this.suggestCode(diff, classification)
        : null;
      const suggestedForm = classification
        ? this.findMatchingForm(classification)
        : null;
      const severity = this.assessSeverity(classification);

      drifts.push({
        id: this.generateId(),
        section: diff.section,
        driftType: diff.type,
        severity,
        expectedText: diff.expected,
        actualText: diff.actual,
        classification,
        suggestedCode,
        suggestedForm,
        confidence: classification?.confidence ?? 0,
        resolved: false,
      });
    }

    // 4. Compute stats
    const stats = this.computeStats(drifts);

    return {
      hasDrift: drifts.length > 0,
      drifts,
      stats,
    };
  }

  /**
   * Diff two texts by sections.
   */
  diffBySections(expectedText: string, actualText: string): TextDiff[] {
    const diffs: TextDiff[] = [];

    // Split into sections (by looking for section patterns)
    const expectedSections = this.parseSections(expectedText);
    const actualSections = this.parseSections(actualText);

    // Find removed sections
    for (const [section, expected] of expectedSections) {
      if (!actualSections.has(section)) {
        diffs.push({
          section,
          type: 'deletion',
          expected,
          actual: '',
          lineNumber: 0,
        });
      }
    }

    // Find added and modified sections
    for (const [section, actual] of actualSections) {
      const expected = expectedSections.get(section);
      if (!expected) {
        diffs.push({
          section,
          type: 'addition',
          expected: '',
          actual,
          lineNumber: 0,
        });
      } else if (!this.textsMatch(expected, actual)) {
        diffs.push({
          section,
          type: 'modification',
          expected,
          actual,
          lineNumber: 0,
        });
      }
    }

    return diffs;
  }

  /**
   * Parse text into sections.
   */
  private parseSections(text: string): Map<string, string> {
    const sections = new Map<string, string>();

    // Match section patterns like (a), (b), 7.11(a), etc.
    const sectionPattern = /(?:^|\n)(?:\(([a-z]+)\)|(\d+\.\d+)(?:\(([a-z]+)\))?)\s*([^\n]+(?:\n(?!\([a-z]+\)|\d+\.\d+)[^\n]+)*)/gi;

    let match;
    while ((match = sectionPattern.exec(text)) !== null) {
      const subsection = match[1] || match[3] || '';
      const article = match[2] || '';
      const sectionKey = article ? `${article}(${subsection})` : `(${subsection})`;
      const content = match[4]?.trim() || '';

      if (sectionKey && content) {
        sections.set(sectionKey, content);
      }
    }

    // If no sections found, treat the whole text as one section
    if (sections.size === 0 && text.trim()) {
      sections.set('full', text.trim());
    }

    return sections;
  }

  /**
   * Check if two texts match (allowing minor formatting differences).
   */
  private textsMatch(a: string, b: string): boolean {
    // Normalize whitespace
    const normalizeA = a.replace(/\s+/g, ' ').trim().toLowerCase();
    const normalizeB = b.replace(/\s+/g, ' ').trim().toLowerCase();
    return normalizeA === normalizeB;
  }

  /**
   * Classify a drift to determine element type and change category.
   */
  classifyDrift(diff: TextDiff): DriftClassification | null {
    const text = diff.type === 'deletion' ? diff.expected : diff.actual;
    const lowerText = text.toLowerCase();

    // Detect element type
    let elementType: ElementType = 'other';
    let changeCategory: ChangeCategory = 'other';
    let explanation = '';
    let confidence = 0.5;

    // Covenant detection
    if (
      lowerText.includes('leverage') ||
      lowerText.includes('coverage') ||
      lowerText.includes('shall not permit') ||
      lowerText.includes('shall not exceed')
    ) {
      elementType = 'covenant';
      confidence = 0.8;

      // Detect change category
      if (this.hasThresholdChange(diff)) {
        changeCategory = 'threshold';
        explanation = 'Covenant threshold value has been modified';
        confidence = 0.9;
      } else if (lowerText.includes('cure')) {
        changeCategory = 'cure';
        explanation = 'Cure rights provision has been modified';
      } else {
        changeCategory = 'structure';
        explanation = 'Covenant structure has been modified';
      }
    }

    // Basket detection
    else if (
      lowerText.includes('basket') ||
      lowerText.includes('not to exceed') ||
      lowerText.includes('greater of') ||
      lowerText.includes('investments made')
    ) {
      elementType = 'basket';
      confidence = 0.8;

      if (this.hasCapacityChange(diff)) {
        changeCategory = 'capacity';
        explanation = 'Basket capacity has been modified';
        confidence = 0.9;
      } else if (lowerText.includes('pro forma') || lowerText.includes('subject to')) {
        changeCategory = 'condition';
        explanation = 'Basket condition has been modified';
      } else {
        changeCategory = 'structure';
        explanation = 'Basket structure has been modified';
      }
    }

    // Definition detection
    else if (lowerText.includes('" means') || lowerText.includes('"means')) {
      elementType = 'definition';
      changeCategory = 'definition';
      explanation = 'Definition has been modified';
      confidence = 0.85;
    }

    // Milestone detection
    else if (
      lowerText.includes('milestone') ||
      lowerText.includes('target date') ||
      lowerText.includes('longstop')
    ) {
      elementType = 'milestone';
      changeCategory = 'timing';
      explanation = 'Milestone timing has been modified';
      confidence = 0.8;
    }

    // Reserve detection
    else if (
      lowerText.includes('reserve') ||
      lowerText.includes('maintain a') ||
      lowerText.includes('funded by')
    ) {
      elementType = 'reserve';
      changeCategory = 'capacity';
      explanation = 'Reserve requirement has been modified';
      confidence = 0.75;
    }

    // Waterfall detection
    else if (
      lowerText.includes('waterfall') ||
      lowerText.includes('priority') ||
      lowerText.includes('payment date')
    ) {
      elementType = 'waterfall';
      changeCategory = 'structure';
      explanation = 'Waterfall structure has been modified';
      confidence = 0.75;
    }

    // Phase detection
    else if (
      lowerText.includes('construction period') ||
      lowerText.includes('operations period') ||
      lowerText.includes('phase')
    ) {
      elementType = 'phase';
      changeCategory = 'timing';
      explanation = 'Phase definition has been modified';
      confidence = 0.7;
    }

    // CP detection
    else if (
      lowerText.includes('conditions precedent') ||
      lowerText.includes('prior to') ||
      lowerText.includes('shall have been satisfied')
    ) {
      elementType = 'cp';
      changeCategory = 'condition';
      explanation = 'Condition precedent has been modified';
      confidence = 0.7;
    }

    if (elementType === 'other') {
      return null;
    }

    return {
      elementType,
      changeCategory,
      explanation,
      confidence,
    };
  }

  /**
   * Check if there's a threshold change (numbers differ).
   */
  private hasThresholdChange(diff: TextDiff): boolean {
    const expectedNumbers = this.extractNumbers(diff.expected);
    const actualNumbers = this.extractNumbers(diff.actual);

    // If the sets of numbers differ, there's a threshold change
    return JSON.stringify([...expectedNumbers].sort()) !==
      JSON.stringify([...actualNumbers].sort());
  }

  /**
   * Check if there's a capacity change.
   */
  private hasCapacityChange(diff: TextDiff): boolean {
    // Similar to threshold, look for numeric differences
    return this.hasThresholdChange(diff);
  }

  /**
   * Extract numbers from text.
   */
  private extractNumbers(text: string): Set<number> {
    const numbers = new Set<number>();
    const pattern = /\$?[\d,]+(?:\.\d+)?/g;

    let match;
    while ((match = pattern.exec(text)) !== null) {
      const numStr = match[0].replace(/[$,]/g, '');
      const num = parseFloat(numStr);
      if (!isNaN(num)) {
        numbers.add(num);
      }
    }

    return numbers;
  }

  /**
   * Suggest ProViso code for a drift.
   */
  suggestCode(diff: TextDiff, classification: DriftClassification): string | null {
    const text = diff.type === 'deletion' ? '' : diff.actual;

    switch (classification.elementType) {
      case 'covenant':
        return this.suggestCovenantCode(text);
      case 'basket':
        return this.suggestBasketCode(text);
      case 'definition':
        return this.suggestDefinitionCode(text);
      default:
        return null;
    }
  }

  /**
   * Suggest covenant code from text.
   */
  private suggestCovenantCode(text: string): string | null {
    // Try to extract key components
    const leverageMatch = text.match(/leverage.*?(\d+\.?\d*)/i);
    const coverageMatch = text.match(/coverage.*?(\d+\.?\d*)/i);

    if (leverageMatch) {
      const threshold = leverageMatch[1];
      return `COVENANT MaxLeverage
  REQUIRES Leverage <= ${threshold}
  TESTED QUARTERLY`;
    }

    if (coverageMatch) {
      const threshold = coverageMatch[1];
      return `COVENANT MinInterestCoverage
  REQUIRES InterestCoverage >= ${threshold}
  TESTED QUARTERLY`;
    }

    return null;
  }

  /**
   * Suggest basket code from text.
   */
  private suggestBasketCode(text: string): string | null {
    // Try to extract capacity
    const dollarMatch = text.match(/\$(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:million|M)?/i);
    const percentMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);

    if (dollarMatch && percentMatch) {
      const dollars = this.parseAmount(dollarMatch[0]);
      const percent = percentMatch[1];
      return `BASKET GeneralBasket
  CAPACITY GreaterOf($${dollars}, ${percent}% * EBITDA)`;
    }

    if (dollarMatch) {
      const dollars = this.parseAmount(dollarMatch[0]);
      return `BASKET GeneralBasket
  CAPACITY $${dollars}`;
    }

    return null;
  }

  /**
   * Suggest definition code from text.
   */
  private suggestDefinitionCode(text: string): string | null {
    const match = text.match(/"([^"]+)"\s*means?\s+([^.]+)/i);
    if (match) {
      const name = match[1]?.replace(/\s+/g, '') || 'CustomDefinition';
      return `DEFINE ${name} = [expression from: ${match[2]?.substring(0, 50)}...]`;
    }
    return null;
  }

  /**
   * Parse a dollar amount string.
   */
  private parseAmount(amountStr: string): number {
    const cleaned = amountStr.replace(/[$,]/g, '');
    let amount = parseFloat(cleaned);

    if (amountStr.toLowerCase().includes('million') || amountStr.includes('M')) {
      amount *= 1_000_000;
    } else if (amountStr.toLowerCase().includes('billion') || amountStr.includes('B')) {
      amount *= 1_000_000_000;
    }

    return amount;
  }

  /**
   * Find a matching form for a classification.
   */
  findMatchingForm(classification: DriftClassification): string | null {
    const formMap: Record<ElementType, string[]> = {
      covenant: ['covenant-simple', 'covenant-stepdown'],
      basket: ['basket-fixed', 'basket-grower', 'basket-builder'],
      definition: ['definition-simple', 'definition-ebitda'],
      condition: ['condition'],
      phase: ['phase'],
      milestone: ['milestone'],
      reserve: ['reserve'],
      waterfall: ['waterfall-tier'],
      cp: ['cp-item'],
      other: [],
    };

    const forms = formMap[classification.elementType];
    return forms?.[0] ?? null;
  }

  /**
   * Assess the severity of a drift.
   */
  assessSeverity(classification: DriftClassification | null): DriftSeverity {
    if (!classification) {
      return 'low';
    }

    // Threshold and capacity changes are high severity
    if (
      classification.changeCategory === 'threshold' ||
      classification.changeCategory === 'capacity'
    ) {
      return 'high';
    }

    // Cure and condition changes are medium
    if (
      classification.changeCategory === 'cure' ||
      classification.changeCategory === 'condition'
    ) {
      return 'medium';
    }

    // Timing and structure are medium
    if (
      classification.changeCategory === 'timing' ||
      classification.changeCategory === 'structure'
    ) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Compute drift statistics.
   */
  private computeStats(drifts: Drift[]): DriftStats {
    const stats: DriftStats = {
      totalDrifts: drifts.length,
      byType: { addition: 0, modification: 0, deletion: 0 },
      bySeverity: { high: 0, medium: 0, low: 0 },
      byCategory: {},
    };

    for (const drift of drifts) {
      stats.byType[drift.driftType]++;
      stats.bySeverity[drift.severity]++;

      if (drift.classification) {
        const cat = drift.classification.changeCategory;
        stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
      }
    }

    return stats;
  }

  /**
   * Generate a unique ID.
   */
  private generateId(): string {
    return `drift-${++this.idCounter}-${Date.now()}`;
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Create a new DriftDetector instance.
 */
export function createDriftDetector(): DriftDetector {
  return new DriftDetector();
}

/**
 * Detect drift between code and Word text.
 */
export async function detectDrift(
  actualWordText: string,
  currentCode: string
): Promise<DriftReport> {
  const detector = createDriftDetector();
  return detector.detectDrift(actualWordText, currentCode);
}
