/**
 * ProViso Hub v2.0 — Versioning Module
 *
 * State diffing, change classification, and change log generation.
 */

// State differ
export {
  compileToState,
  diffStates,
  expressionToString,
  type CompiledState,
  type ElementDiff,
  type FieldChange,
  type DiffResult,
  type DiffStats,
} from './differ.js';

// Change classifier
export {
  classifyChange,
  classifyImpact,
  generateTitleAndDescription,
  generateImpactDescription,
  type ClassifiedChange,
} from './classifier.js';

// Change log generator
export {
  generateChangeSummary,
  generateChangeLog,
  type ChangeLogFormat,
  type ChangeLogOptions,
  type GeneratedChangeLog,
} from './changelog.js';
