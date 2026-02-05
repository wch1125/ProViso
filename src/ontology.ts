/**
 * ProViso Ontology System
 *
 * Declarative configuration pattern for standard deal templates.
 * Based on the closing-demo ontology pattern, adapted for ProViso.
 *
 * The ontology provides:
 * - Standard document templates for closing checklists
 * - Standard condition precedent templates (Article 4.01 items)
 * - Standard covenant templates (future)
 * - Standard basket configurations (future)
 *
 * This enables rapid setup of new deals by applying a template,
 * rather than manually configuring every document and condition.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { DocumentType } from './closing-enums.js';

// =============================================================================
// ONTOLOGY TYPES
// =============================================================================

/**
 * A document template for closing checklists
 */
export interface DocumentTemplate {
  /** Unique key for this document template */
  key: string;
  /** The type of document */
  documentType: DocumentType;
  /** Default title for this document */
  defaultTitle: string;
  /** Category for grouping in checklists (use DocumentCategory constants or custom strings) */
  category: string;
  /** Which party is typically responsible for preparing this (use PartyRole constants or custom strings) */
  defaultResponsibleRole: string;
  /** Which date field to use for the due date */
  defaultDueDateField: string;
}

/**
 * A condition precedent template
 */
export interface ConditionTemplate {
  /** Section reference in the credit agreement (e.g., "4.01(a)") */
  sectionReference: string;
  /** Short title */
  title: string;
  /** Full description text */
  description: string;
  /** Category for grouping (use DocumentCategory constants or custom strings) */
  category: string;
  /** Document template keys that satisfy this condition */
  expectedDocumentKeys: string[];
}

/**
 * A covenant template (for standard financial covenants)
 */
export interface CovenantTemplate {
  /** Unique key for this covenant */
  key: string;
  /** Display name */
  name: string;
  /** Description of what this covenant tests */
  description: string;
  /** The metric being tested (e.g., "TotalLeverage", "InterestCoverage") */
  metric: string;
  /** Default operator */
  defaultOperator: '<=' | '>=' | '<' | '>' | '=';
  /** Common thresholds by transaction type */
  commonThresholds?: Record<string, number>;
  /** Testing frequency */
  defaultFrequency: 'quarterly' | 'annually' | 'monthly';
}

/**
 * A basket template (for standard baskets)
 */
export interface BasketTemplate {
  /** Unique key for this basket */
  key: string;
  /** Display name */
  name: string;
  /** Description of what this basket permits */
  description: string;
  /** Basket type */
  basketType: 'fixed' | 'grower' | 'builder';
  /** Common capacities by transaction type */
  commonCapacities?: Record<string, string>;
}

/**
 * The complete ontology configuration
 */
export interface OntologyConfig {
  /** Name of this ontology */
  name: string;
  /** Version string */
  version?: string;
  /** Document templates */
  documentTemplates: DocumentTemplate[];
  /** Condition precedent templates */
  conditionTemplates: ConditionTemplate[];
  /** Covenant templates (optional) */
  covenantTemplates?: CovenantTemplate[];
  /** Basket templates (optional) */
  basketTemplates?: BasketTemplate[];
}

/**
 * Raw JSON structure (uses snake_case from the reference files)
 */
interface RawDocumentTemplate {
  key: string;
  document_type: string;
  default_title: string;
  category: string;
  default_responsible_role: string;
  default_due_date_field: string;
}

interface RawConditionTemplate {
  section_reference: string;
  title: string;
  description: string;
  category: string;
  expected_document_keys: string[];
}

interface RawOntologyConfig {
  name: string;
  version?: string;
  document_templates?: RawDocumentTemplate[];
  condition_templates?: RawConditionTemplate[];
  covenant_templates?: CovenantTemplate[];
  basket_templates?: BasketTemplate[];
}

// =============================================================================
// ONTOLOGY LOADER
// =============================================================================

/**
 * Load an ontology configuration from a JSON file
 *
 * @param configPath - Path to the JSON configuration file
 * @returns Parsed ontology configuration
 */
export function loadOntology(configPath: string): OntologyConfig {
  const absolutePath = resolve(configPath);
  const content = readFileSync(absolutePath, 'utf-8');
  const raw = JSON.parse(content) as RawOntologyConfig;

  return normalizeOntology(raw);
}

/**
 * Load a built-in ontology by name
 *
 * @param name - Name of the built-in ontology (e.g., "credit-agreement-v1")
 * @returns Parsed ontology configuration
 */
export function loadBuiltinOntology(name: string): OntologyConfig {
  // Get the directory of this module
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Built-in ontologies are in ../ontology/ relative to src/
  const ontologyPath = resolve(__dirname, '..', 'ontology', `${name}.json`);

  return loadOntology(ontologyPath);
}

/**
 * Normalize raw JSON config to TypeScript interface
 */
function normalizeOntology(raw: RawOntologyConfig): OntologyConfig {
  return {
    name: raw.name,
    version: raw.version,
    documentTemplates: (raw.document_templates || []).map(normalizeDocumentTemplate),
    conditionTemplates: (raw.condition_templates || []).map(normalizeConditionTemplate),
    covenantTemplates: raw.covenant_templates,
    basketTemplates: raw.basket_templates,
  };
}

function normalizeDocumentTemplate(raw: RawDocumentTemplate): DocumentTemplate {
  return {
    key: raw.key,
    documentType: raw.document_type as DocumentType,
    defaultTitle: raw.default_title,
    category: raw.category,
    defaultResponsibleRole: raw.default_responsible_role,
    defaultDueDateField: raw.default_due_date_field,
  };
}

function normalizeConditionTemplate(raw: RawConditionTemplate): ConditionTemplate {
  return {
    sectionReference: raw.section_reference,
    title: raw.title,
    description: raw.description,
    category: raw.category,
    expectedDocumentKeys: raw.expected_document_keys,
  };
}

// =============================================================================
// ONTOLOGY UTILITIES
// =============================================================================

/**
 * Get all document templates for a category
 */
export function getDocumentsByCategory(
  ontology: OntologyConfig,
  category: string
): DocumentTemplate[] {
  return ontology.documentTemplates.filter((t) => t.category === category);
}

/**
 * Get condition template by section reference
 */
export function getConditionBySection(
  ontology: OntologyConfig,
  sectionRef: string
): ConditionTemplate | undefined {
  return ontology.conditionTemplates.find((t) => t.sectionReference === sectionRef);
}

/**
 * Get all unique categories from document templates
 */
export function getDocumentCategories(ontology: OntologyConfig): string[] {
  const categories = new Set(ontology.documentTemplates.map((t) => t.category));
  return Array.from(categories);
}

/**
 * Get all unique categories from condition templates
 */
export function getConditionCategories(ontology: OntologyConfig): string[] {
  const categories = new Set(ontology.conditionTemplates.map((t) => t.category));
  return Array.from(categories);
}

/**
 * Get document template by key
 */
export function getDocumentByKey(
  ontology: OntologyConfig,
  key: string
): DocumentTemplate | undefined {
  return ontology.documentTemplates.find((t) => t.key === key);
}

/**
 * Validate that all condition templates reference valid document keys
 */
export function validateOntology(ontology: OntologyConfig): string[] {
  const errors: string[] = [];
  const documentKeys = new Set(ontology.documentTemplates.map((t) => t.key));

  for (const condition of ontology.conditionTemplates) {
    for (const docKey of condition.expectedDocumentKeys) {
      if (!documentKeys.has(docKey)) {
        errors.push(
          `Condition "${condition.sectionReference}" references unknown document key: ${docKey}`
        );
      }
    }
  }

  return errors;
}
