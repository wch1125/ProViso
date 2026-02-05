/**
 * ProViso Hub v2.0 — Word Integration Module
 *
 * Exports for Word document generation, drift detection, and round-trip validation.
 */

// Generator
export {
  WordGenerator,
  createWordGenerator,
  generateWordDocument,
  generateRedline,
  type DocumentMetadata,
  type GeneratedDocument,
  type GeneratedArticle,
  type RedlineResult,
} from './generator.js';

// Templates
export {
  renderCovenantToWord,
  renderBasketToWord,
  renderDefinitionToWord,
  renderConditionToWord,
  renderPhaseToWord,
  renderMilestoneToWord,
  renderReserveToWord,
  renderWaterfallToWord,
  renderConditionsPrecedentToWord,
  renderStatementToWord,
  getTemplate,
  wordTemplates,
  formatCurrency,
  formatRatio,
  formatPercentage,
  formatOperator,
  formatFrequency,
  getMetricDisplayName,
  type WordTemplate,
  type WordTemplateContext,
  type GeneratedSection,
} from './templates.js';

// Drift Detection
export {
  DriftDetector,
  createDriftDetector,
  detectDrift,
  type DriftReport,
  type Drift,
  type DriftType,
  type DriftSeverity,
  type DriftClassification,
  type ChangeCategory,
  type DriftStats,
  type TextDiff,
} from './drift.js';

// Round-Trip Validation
export {
  RoundTripValidator,
  createRoundTripValidator,
  validateRoundTrip,
  validateCodeRepresentation,
  type RoundTripResult,
  type RoundTripDifference,
  type AcceptableVariation,
  type VariationType,
  type RoundTripStats,
} from './round-trip.js';
