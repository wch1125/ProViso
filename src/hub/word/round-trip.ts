/**
 * ProViso Hub v2.0 — Round-Trip Validator
 *
 * Validates that Word → Code → Word produces acceptable results.
 * Identifies acceptable stylistic variations vs material differences.
 */

import { generateWordDocument } from './generator.js';

// =============================================================================
// TYPES
// =============================================================================

export interface RoundTripResult {
  isValid: boolean;
  differences: RoundTripDifference[];
  acceptableVariations: AcceptableVariation[];
  stats: RoundTripStats;
}

export interface RoundTripDifference {
  section: string;
  original: string;
  regenerated: string;
  isMaterial: boolean;
  reason: string;
}

export interface AcceptableVariation {
  section: string;
  variationType: VariationType;
  explanation: string;
}

export type VariationType =
  | 'stylistic'
  | 'punctuation'
  | 'whitespace'
  | 'ordering'
  | 'formatting';

export interface RoundTripStats {
  totalSections: number;
  matchingSections: number;
  acceptableVariations: number;
  materialDifferences: number;
}

// =============================================================================
// KNOWN STYLISTIC PATTERNS
// =============================================================================

/**
 * Patterns that are acceptable variations in legal prose.
 */
interface StylisticPattern {
  from: RegExp;
  to: RegExp;
  description: string;
}

const STYLISTIC_PATTERNS: StylisticPattern[] = [
  {
    from: /in accordance with/gi,
    to: /pursuant to/gi,
    description: 'Alternative phrasing for "in accordance with"',
  },
  {
    from: /shall not/gi,
    to: /may not/gi,
    description: 'Alternative phrasing for prohibition',
  },
  {
    from: /shall/gi,
    to: /will/gi,
    description: 'Alternative auxiliary verb',
  },
  {
    from: /provided\s+that/gi,
    to: /provided,?\s+however,?\s+that/gi,
    description: 'Alternative proviso phrasing',
  },
  {
    from: /notwithstanding\s+the\s+foregoing/gi,
    to: /notwithstanding\s+anything\s+to\s+the\s+contrary/gi,
    description: 'Alternative notwithstanding clause',
  },
  {
    from: /with\s+respect\s+to/gi,
    to: /in\s+respect\s+of/gi,
    description: 'Alternative prepositional phrase',
  },
  {
    from: /as\s+of\s+the\s+date\s+hereof/gi,
    to: /on\s+the\s+date\s+of\s+this\s+agreement/gi,
    description: 'Alternative date reference',
  },
];

/**
 * Punctuation variations that are acceptable.
 */
const PUNCTUATION_PATTERNS: Array<{ from: RegExp; to: string }> = [
  { from: /\s*;\s*/g, to: '; ' },
  { from: /\s*,\s*/g, to: ', ' },
  { from: /\s*\.\s*/g, to: '. ' },
  { from: /\s*:\s*/g, to: ': ' },
  { from: /\s+/g, to: ' ' },
];

// =============================================================================
// ROUND TRIP VALIDATOR
// =============================================================================

export class RoundTripValidator {
  /**
   * Validate that Word text can round-trip through code generation.
   */
  async validate(
    originalWordText: string,
    generatedCode: string
  ): Promise<RoundTripResult> {
    // Generate Word from the code
    const regeneratedDoc = await generateWordDocument(generatedCode, {
      dealName: 'Regenerated',
    });
    const regeneratedText = regeneratedDoc.fullText;

    // Parse into sections
    const originalSections = this.parseSections(originalWordText);
    const regeneratedSections = this.parseSections(regeneratedText);

    const differences: RoundTripDifference[] = [];
    const acceptableVariations: AcceptableVariation[] = [];

    let matchingSections = 0;

    // Compare each section
    for (const [section, original] of originalSections) {
      const regenerated = regeneratedSections.get(section);

      if (!regenerated) {
        // Section exists in original but not regenerated
        differences.push({
          section,
          original,
          regenerated: '',
          isMaterial: true,
          reason: 'Section not regenerated from code',
        });
        continue;
      }

      // Normalize both texts
      const normalizedOriginal = this.normalize(original);
      const normalizedRegenerated = this.normalize(regenerated);

      if (normalizedOriginal === normalizedRegenerated) {
        matchingSections++;
        continue;
      }

      // Check for acceptable variations
      const variation = this.checkAcceptableVariation(original, regenerated);
      if (variation) {
        acceptableVariations.push({
          section,
          variationType: variation.type,
          explanation: variation.explanation,
        });
        continue;
      }

      // This is a material difference
      const reason = this.describeDifference(original, regenerated);
      differences.push({
        section,
        original,
        regenerated,
        isMaterial: true,
        reason,
      });
    }

    // Check for sections in regenerated that weren't in original
    for (const [section, regenerated] of regeneratedSections) {
      if (!originalSections.has(section)) {
        differences.push({
          section,
          original: '',
          regenerated,
          isMaterial: true,
          reason: 'New section generated from code',
        });
      }
    }

    // Compute stats
    const stats: RoundTripStats = {
      totalSections: originalSections.size,
      matchingSections,
      acceptableVariations: acceptableVariations.length,
      materialDifferences: differences.filter((d) => d.isMaterial).length,
    };

    return {
      isValid: differences.filter((d) => d.isMaterial).length === 0,
      differences,
      acceptableVariations,
      stats,
    };
  }

  /**
   * Check if a code-generated text faithfully represents the original.
   */
  validateCodeRepresentation(
    originalText: string,
    codeGeneratedText: string
  ): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Extract key elements from original
    const originalNumbers = this.extractNumbers(originalText);
    const codeNumbers = this.extractNumbers(codeGeneratedText);

    // Check that all numbers are preserved
    for (const num of originalNumbers) {
      if (!codeNumbers.has(num)) {
        issues.push(`Number ${num} from original not found in generated text`);
      }
    }

    // Check that key phrases are preserved
    const keyPhrases = this.extractKeyPhrases(originalText);
    const normalizedCode = codeGeneratedText.toLowerCase();

    for (const phrase of keyPhrases) {
      if (!normalizedCode.includes(phrase.toLowerCase())) {
        issues.push(`Key phrase "${phrase}" not found in generated text`);
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  // ===========================================================================
  // PRIVATE METHODS
  // ===========================================================================

  /**
   * Parse text into sections.
   */
  private parseSections(text: string): Map<string, string> {
    const sections = new Map<string, string>();

    // Split by section patterns
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
   * Normalize text for comparison.
   */
  private normalize(text: string): string {
    let normalized = text.toLowerCase();

    // Apply punctuation normalization
    for (const pattern of PUNCTUATION_PATTERNS) {
      normalized = normalized.replace(pattern.from, pattern.to);
    }

    // Trim and collapse whitespace
    normalized = normalized.trim().replace(/\s+/g, ' ');

    return normalized;
  }

  /**
   * Check if difference is an acceptable variation.
   */
  private checkAcceptableVariation(
    original: string,
    regenerated: string
  ): { type: VariationType; explanation: string } | null {
    // Check stylistic patterns
    for (const pattern of STYLISTIC_PATTERNS) {
      const normalizedOriginal = original
        .replace(pattern.from, '###PLACEHOLDER###')
        .toLowerCase();
      const normalizedRegenerated = regenerated
        .replace(pattern.to, '###PLACEHOLDER###')
        .toLowerCase();

      if (
        this.normalize(normalizedOriginal) ===
        this.normalize(normalizedRegenerated)
      ) {
        return {
          type: 'stylistic',
          explanation: pattern.description,
        };
      }
    }

    // Check if only punctuation differs
    const originalNoPunct = original.replace(/[.,;:!?]/g, '').toLowerCase();
    const regeneratedNoPunct = regenerated.replace(/[.,;:!?]/g, '').toLowerCase();

    if (this.normalize(originalNoPunct) === this.normalize(regeneratedNoPunct)) {
      return {
        type: 'punctuation',
        explanation: 'Only punctuation differs',
      };
    }

    // Check if only whitespace differs
    const originalNoWhitespace = original.replace(/\s+/g, '').toLowerCase();
    const regeneratedNoWhitespace = regenerated.replace(/\s+/g, '').toLowerCase();

    if (originalNoWhitespace === regeneratedNoWhitespace) {
      return {
        type: 'whitespace',
        explanation: 'Only whitespace formatting differs',
      };
    }

    return null;
  }

  /**
   * Describe the material difference between two texts.
   */
  private describeDifference(original: string, regenerated: string): string {
    // Check for number differences
    const originalNumbers = this.extractNumbers(original);
    const regeneratedNumbers = this.extractNumbers(regenerated);

    const missingNumbers: number[] = [];
    for (const num of originalNumbers) {
      if (!regeneratedNumbers.has(num)) {
        missingNumbers.push(num);
      }
    }

    const addedNumbers: number[] = [];
    for (const num of regeneratedNumbers) {
      if (!originalNumbers.has(num)) {
        addedNumbers.push(num);
      }
    }

    if (missingNumbers.length > 0 || addedNumbers.length > 0) {
      const parts: string[] = [];
      if (missingNumbers.length > 0) {
        parts.push(`Missing values: ${missingNumbers.join(', ')}`);
      }
      if (addedNumbers.length > 0) {
        parts.push(`Added values: ${addedNumbers.join(', ')}`);
      }
      return parts.join('; ');
    }

    // Generic difference
    return 'Text content differs materially';
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
   * Extract key legal phrases from text.
   */
  private extractKeyPhrases(text: string): string[] {
    const phrases: string[] = [];

    // Look for defined terms
    const definedTerms = text.match(/"[^"]+"/g) || [];
    phrases.push(...definedTerms.map((t) => t.replace(/"/g, '')));

    // Look for legal keywords
    const keywords = [
      'shall not exceed',
      'shall not be less than',
      'greater of',
      'lesser of',
      'pro forma',
      'notwithstanding',
      'provided that',
      'subject to',
    ];

    for (const keyword of keywords) {
      if (text.toLowerCase().includes(keyword)) {
        phrases.push(keyword);
      }
    }

    return phrases;
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Create a new RoundTripValidator instance.
 */
export function createRoundTripValidator(): RoundTripValidator {
  return new RoundTripValidator();
}

/**
 * Validate round-trip conversion.
 */
export async function validateRoundTrip(
  originalWordText: string,
  generatedCode: string
): Promise<RoundTripResult> {
  const validator = createRoundTripValidator();
  return validator.validate(originalWordText, generatedCode);
}

/**
 * Check if code faithfully represents original text.
 */
export function validateCodeRepresentation(
  originalText: string,
  codeGeneratedText: string
): { isValid: boolean; issues: string[] } {
  const validator = createRoundTripValidator();
  return validator.validateCodeRepresentation(originalText, codeGeneratedText);
}
