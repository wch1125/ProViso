/**
 * Post-Closing Components
 *
 * Components for Phase 6+ features:
 * - Financial submission form
 * - Compliance trend charts
 * - Draw request workflow
 * - Scenario simulator
 * - Cure rights optimizer (distressed covenant workflow)
 * - Waiver request portal (distressed covenant workflow)
 * - Amendment overlay diff (distressed covenant workflow)
 */

export { FinancialSubmissionForm } from './FinancialSubmissionForm';
export { ComplianceTrendChart } from './ComplianceTrendChart';
export { ConnectedComplianceTrendChart, ComplianceTrendPanel } from './ConnectedComplianceTrendChart';
export { DrawRequestList } from './DrawRequestList';
export { ScenarioSimulator } from './ScenarioSimulator';
export { ConnectedScenarioSimulator } from './ConnectedScenarioSimulator';
export { CureRightsOptimizer } from './CureRightsOptimizer';
export type { CureRightsOptimizerProps } from './CureRightsOptimizer';
export { WaiverRequestPortal } from './WaiverRequestPortal';
export type { WaiverRequestPortalProps, WaiverRequestData, WaiverType, WaiverUrgency } from './WaiverRequestPortal';
export { AmendmentOverlay } from './AmendmentOverlay';
export type { AmendmentOverlayProps, AmendmentDirective, AmendmentDirectiveType } from './AmendmentOverlay';
