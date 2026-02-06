/**
 * Dashboard Utility Functions
 */

// Narrative generation (v2.2 Living Deal - Sprint 1)
export {
  formatCurrency,
  formatRatio,
  formatPercentage,
  formatDays,
  formatRelativeDate,
  formatDisplayName,
  generateCovenantNarrative,
  generateBasketNarrative,
  generateMilestoneNarrative,
  generateReserveNarrative,
  generateDealStatusSummary,
} from './narratives';

export type {
  CovenantNarrativeStatus,
  CovenantNarrativeInput,
  CovenantNarrative,
  BasketNarrativeInput,
  BasketNarrative,
  MilestoneNarrativeStatus,
  MilestoneNarrativeInput,
  MilestoneNarrative,
  ReserveNarrativeInput,
  ReserveNarrative,
  DealStatusSummaryInput,
  DealStatusSummary,
} from './narratives';

// Threshold zones / Early Warning System (v2.2 Living Deal - Sprint 1)
export {
  getThresholdZone,
  getUtilizationPercent,
  getDistanceToBreach,
  getZoneStyle,
  zoneStyles,
  generateAlerts,
  analyzeTrend,
} from './thresholds';

export type {
  ThresholdZone,
  ZoneThresholds,
  ZoneStyle,
  DistanceToBreach,
  CovenantAlert,
  AlertSummary,
  TrendAnalysis,
} from './thresholds';

// Code generators (v2.2 Living Deal - Sprint 1)
export {
  formatCurrencyCode,
  formatRatioCode,
  formatPercentageCode,
  generateCovenantCode,
  generateBasketCode,
  generateDefinitionCode,
  generateMilestoneCode,
  generateReserveCode,
  generatePhaseCode,
  generateCovenantCodeFromData,
  generateBasketCodeFromData,
  PROVISO_KEYWORDS,
  PROVISO_OPERATORS,
} from './codeGenerators';

export type {
  CovenantCodeInput,
  BasketCodeInput,
  DefinitionCodeInput,
  MilestoneCodeInput,
  ReserveCodeInput,
  PhaseCodeInput,
} from './codeGenerators';

// Word document generation (v2.2 Living Deal - Sprint 2)
export {
  generateWordDocument,
  copyDocumentToClipboard,
  downloadDocument,
} from './wordGenerator';

export type {
  DocumentMetadata,
  GeneratedDocument,
  DocumentSection,
} from './wordGenerator';

// Compliance export (v2.3 Public Demo - Phase 4)
export {
  generateComplianceReport,
  generateFullExport,
  downloadAsFile,
} from './complianceExport';

export type {
  FullExportData,
} from './complianceExport';

// Closing checklist export (v2.2 Closing)
export {
  generateClosingChecklist,
  downloadAsFile as downloadClosingFile,
  copyToClipboard,
} from './export';

// Analytics tracking (v2.3 Public Demo - Phase 5)
export {
  trackEvent,
  trackDemoStarted,
  trackExportDownloaded,
  trackScenarioSimulated,
  trackCalculationViewed,
  trackSourceCodeViewed,
  trackFileUploaded,
  trackFinancialsEdited,
  trackFeatureDiscovered,
} from './analytics';
