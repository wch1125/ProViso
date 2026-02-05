/**
 * ProViso Defined Terms System
 *
 * Structure for tracking defined terms from credit agreements.
 * Based on the closing-demo sample_defined_terms.json pattern.
 *
 * Defined terms are critical in credit agreements because:
 * - They establish precise meanings for key concepts
 * - Cross-references must use the exact defined term
 * - Amendments often modify defined terms
 * - Calculation definitions (EBITDA, etc.) affect covenant compliance
 *
 * This module provides:
 * - Type definitions for defined terms
 * - Loading and parsing utilities
 * - Cross-reference tracking
 * - Integration with ProViso's DEFINE statements
 */

import { DefinedTermCategory } from './closing-enums.js';

// =============================================================================
// DEFINED TERM TYPES
// =============================================================================

/**
 * A defined term from the credit agreement
 *
 * Mirrors the structure from closing-demo's sample_defined_terms.json
 * with TypeScript typing and additional metadata support.
 */
export interface DefinedTerm {
  /** The defined term itself (e.g., "EBITDA", "Material Adverse Effect") */
  term: string;

  /** Full definition text from the credit agreement */
  definition: string;

  /** Source document (e.g., "credit_agreement", "security_agreement") */
  source: string;

  /** Section reference where defined (e.g., "Section 1.01") */
  sectionReference: string;

  /** Category for grouping and filtering (use DefinedTermCategory constants or custom strings) */
  category: string;

  /** Other defined terms referenced in this definition */
  crossReferences: string[];

  /** Optional notes (e.g., "Standard definition - safe to use as-is") */
  notes?: string;

  /** Version tracking for amendments */
  version?: number;

  /** Effective date of this definition */
  effectiveDate?: string;

  /** If this term was modified by an amendment */
  amendedBy?: string;
}

/**
 * A collection of defined terms with metadata
 */
export interface DefinedTermsRegistry {
  /** Source document identifier */
  source: string;

  /** Version of the registry */
  version?: string;

  /** When this registry was created/updated */
  lastUpdated?: string;

  /** The defined terms */
  terms: DefinedTerm[];
}

/**
 * Cross-reference between defined terms
 */
export interface TermCrossReference {
  /** The term that contains the reference */
  fromTerm: string;

  /** The term being referenced */
  toTerm: string;

  /** The specific text in the definition that references the term */
  referenceText?: string;
}

// =============================================================================
// RAW JSON TYPES (for loading from JSON files)
// =============================================================================

interface RawDefinedTerm {
  term: string;
  definition: string;
  source: string;
  section_reference: string;
  category: string;
  cross_references: string[];
  notes?: string;
  version?: number;
  effective_date?: string;
  amended_by?: string;
}

// =============================================================================
// LOADING UTILITIES
// =============================================================================

/**
 * Parse a raw defined term from JSON
 */
export function parseDefinedTerm(raw: RawDefinedTerm): DefinedTerm {
  return {
    term: raw.term,
    definition: raw.definition,
    source: raw.source,
    sectionReference: raw.section_reference,
    category: raw.category as DefinedTermCategory,
    crossReferences: raw.cross_references || [],
    notes: raw.notes,
    version: raw.version,
    effectiveDate: raw.effective_date,
    amendedBy: raw.amended_by,
  };
}

/**
 * Parse an array of raw defined terms
 */
export function parseDefinedTerms(raw: RawDefinedTerm[]): DefinedTerm[] {
  return raw.map(parseDefinedTerm);
}

/**
 * Load defined terms from a JSON string
 */
export function loadDefinedTermsFromJson(json: string): DefinedTerm[] {
  const raw = JSON.parse(json) as RawDefinedTerm[];
  return parseDefinedTerms(raw);
}

// =============================================================================
// REGISTRY UTILITIES
// =============================================================================

/**
 * Create a registry from an array of defined terms
 */
export function createTermsRegistry(
  terms: DefinedTerm[],
  source: string,
  version?: string
): DefinedTermsRegistry {
  return {
    source,
    version,
    lastUpdated: new Date().toISOString(),
    terms,
  };
}

/**
 * Find a term by name (case-insensitive)
 */
export function findTerm(
  registry: DefinedTermsRegistry,
  termName: string
): DefinedTerm | undefined {
  const normalizedName = termName.toLowerCase();
  return registry.terms.find((t) => t.term.toLowerCase() === normalizedName);
}

/**
 * Find terms by category
 */
export function findTermsByCategory(
  registry: DefinedTermsRegistry,
  category: string
): DefinedTerm[] {
  return registry.terms.filter((t) => t.category === category);
}

/**
 * Get all terms that reference a given term
 */
export function findReferencingTerms(
  registry: DefinedTermsRegistry,
  termName: string
): DefinedTerm[] {
  return registry.terms.filter((t) => t.crossReferences.includes(termName));
}

/**
 * Build a dependency graph of cross-references
 */
export function buildCrossReferenceGraph(
  registry: DefinedTermsRegistry
): TermCrossReference[] {
  const references: TermCrossReference[] = [];

  for (const term of registry.terms) {
    for (const ref of term.crossReferences) {
      references.push({
        fromTerm: term.term,
        toTerm: ref,
      });
    }
  }

  return references;
}

/**
 * Find circular references in the terms registry
 */
export function findCircularReferences(registry: DefinedTermsRegistry): string[][] {
  const graph = new Map<string, Set<string>>();

  // Build adjacency list
  for (const term of registry.terms) {
    graph.set(term.term, new Set(term.crossReferences));
  }

  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(node: string, path: string[]): void {
    visited.add(node);
    recursionStack.add(node);

    const neighbors = graph.get(node) || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, [...path, neighbor]);
      } else if (recursionStack.has(neighbor)) {
        // Found a cycle
        const cycleStart = path.indexOf(neighbor);
        if (cycleStart !== -1) {
          cycles.push(path.slice(cycleStart));
        } else {
          cycles.push([...path, neighbor]);
        }
      }
    }

    recursionStack.delete(node);
  }

  for (const term of registry.terms) {
    if (!visited.has(term.term)) {
      dfs(term.term, [term.term]);
    }
  }

  return cycles;
}

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Validate that all cross-references point to existing terms
 */
export function validateCrossReferences(registry: DefinedTermsRegistry): string[] {
  const errors: string[] = [];
  const termNames = new Set(registry.terms.map((t) => t.term));

  for (const term of registry.terms) {
    for (const ref of term.crossReferences) {
      if (!termNames.has(ref)) {
        errors.push(`Term "${term.term}" references undefined term "${ref}"`);
      }
    }
  }

  return errors;
}

/**
 * Find duplicate term definitions
 */
export function findDuplicateTerms(registry: DefinedTermsRegistry): string[] {
  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (const term of registry.terms) {
    const normalizedName = term.term.toLowerCase();
    if (seen.has(normalizedName)) {
      duplicates.push(term.term);
    } else {
      seen.add(normalizedName);
    }
  }

  return duplicates;
}

// =============================================================================
// CREDITLANG INTEGRATION
// =============================================================================

/**
 * Standard defined terms that map to ProViso DEFINE statements
 *
 * These are terms where the definition includes a calculation
 * that can be expressed in ProViso syntax.
 */
export const CALCULABLE_TERM_CATEGORIES = [
  'financial', // EBITDA, Net Income, etc.
  'ratio', // Leverage Ratio, Coverage Ratio, etc.
  'facility', // Commitment, Available Amount, etc.
] as const;

/**
 * Check if a defined term represents a calculable value
 */
export function isCalculableTerm(term: DefinedTerm): boolean {
  // Terms in certain categories are likely calculable
  if (CALCULABLE_TERM_CATEGORIES.includes(term.category as (typeof CALCULABLE_TERM_CATEGORIES)[number])) {
    return true;
  }

  // Terms with definitions that include math operators might be calculable
  const mathIndicators = [
    'equal to',
    'means the sum',
    'calculated as',
    'divided by',
    'multiplied by',
    'minus',
    'plus',
    'ratio of',
  ];

  const lowerDef = term.definition.toLowerCase();
  return mathIndicators.some((indicator) => lowerDef.includes(indicator));
}

/**
 * Extract potential ProViso identifiers from a term definition
 *
 * This helps identify which DEFINE statements need to exist
 * to implement a defined term in ProViso.
 */
export function extractPotentialIdentifiers(term: DefinedTerm): string[] {
  const identifiers: string[] = [];

  // Cross-references are the primary source
  identifiers.push(...term.crossReferences);

  // Also look for capitalized terms in the definition
  const capitalizedTerms = term.definition.match(/\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\b/g);
  if (capitalizedTerms) {
    for (const match of capitalizedTerms) {
      // Filter out common non-term words
      const skipWords = [
        'The', 'This', 'Such', 'Any', 'Each', 'All', 'No', 'Not', 'And', 'Or',
        'With', 'Without', 'For', 'From', 'To', 'In', 'On', 'At', 'By', 'As',
        'If', 'Then', 'Else', 'When', 'Where', 'Which', 'That', 'Than', 'But',
      ];
      if (!skipWords.includes(match) && !identifiers.includes(match)) {
        identifiers.push(match);
      }
    }
  }

  return identifiers;
}
