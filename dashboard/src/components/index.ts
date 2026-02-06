// Dashboard components (v1.0)
export { DashboardShell } from './DashboardShell';
export { Card, CardHeader, CardBody } from './Card';
export { StatusBadge } from './StatusBadge';
export { ExecutiveSummary } from './ExecutiveSummary';
export { PhaseTimeline } from './PhaseTimeline';
export { CovenantPanel } from './CovenantPanel';
export { WaterfallChart } from './WaterfallChart';
export { ReserveStatus } from './ReserveStatus';
export { MilestoneTracker } from './MilestoneTracker';
export { CPChecklist } from './CPChecklist';

// Base components (v2.0)
export { Button } from './base/Button';
export type { ButtonProps } from './base/Button';
export { Input } from './base/Input';
export type { InputProps } from './base/Input';
export { Select } from './base/Select';
export type { SelectProps } from './base/Select';
export { TextArea } from './base/TextArea';
export type { TextAreaProps } from './base/TextArea';
export { Modal } from './base/Modal';
export type { ModalProps } from './base/Modal';
export { DataTable } from './base/DataTable';
export type { DataTableProps, Column } from './base/DataTable';
export { Tabs, TabList, TabTrigger, TabPanel } from './base/Tabs';
export type { TabsProps, TabListProps, TabTriggerProps, TabPanelProps } from './base/Tabs';
export {
  Badge,
  SuccessBadge,
  WarningBadge,
  DangerBadge,
  InfoBadge,
  GoldBadge,
} from './base/Badge';
export type { BadgeProps } from './base/Badge';

// Skeleton components (v2.1 UI)
export {
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonChart,
  SkeletonStats,
} from './base/Skeleton';
export type { SkeletonProps } from './base/Skeleton';

// Collapsible Card (v2.4 Dashboard Redesign)
export { CollapsibleCard } from './base/CollapsibleCard';
export type { CollapsibleCardProps } from './base/CollapsibleCard';

// Empty State components (v2.1 UI)
export {
  EmptyState,
  NoResultsFound,
  NoDataYet,
  NoChanges,
} from './base/EmptyState';
export type { EmptyStateProps } from './base/EmptyState';

// Confirmation Modal (v2.1 UI)
export {
  ConfirmationModal,
  DeleteConfirmation,
  SubmitConfirmation,
} from './base/ConfirmationModal';
export type { ConfirmationModalProps } from './base/ConfirmationModal';

// Search & Filter (v2.1 UI)
export {
  SearchFilter,
  QuickFilters,
} from './base/SearchFilter';
export type { SearchFilterProps, FilterOption, QuickFilterOption, QuickFiltersProps } from './base/SearchFilter';

// Layout components (v2.1 UI + v2.4 TopNav)
export {
  DealPageLayout,
  DealPageContent,
  DealPageSidebar,
  DealPageWithSidebar,
  TopNav,
} from './layout';

// Post-Closing components (v2.0 Phase 6)
export {
  FinancialSubmissionForm,
  ComplianceTrendChart,
  ConnectedComplianceTrendChart,
  ComplianceTrendPanel,
  DrawRequestList,
  ScenarioSimulator,
  ConnectedScenarioSimulator,
} from './postclosing';

// Industry components (v2.1)
export {
  PerformanceChart,
  RegulatoryTracker,
  TechnicalProgress,
  TaxEquityPanel,
} from './industry';

// Financial Data Editor (v2.1 Dashboard Wiring)
export { FinancialDataEditor, FinancialDataQuickEdit } from './FinancialDataEditor';

// File Uploader (v2.1 Dashboard Wiring)
export { FileUploader } from './FileUploader';

// Natural Language Summaries (v2.2 Living Deal)
export {
  NarrativeText,
  CollapsibleNarrative,
  CovenantSummary,
  BasketSummary,
  MilestoneSummary,
  SummaryWithIcon,
} from './NaturalLanguageSummary';

// Source Code Viewer (v2.2 Living Deal)
export {
  HighlightedCode,
  SourceCodeViewer,
  CodeViewButton,
  InlineCodePreview,
} from './SourceCodeViewer';
export type { ElementType } from './SourceCodeViewer';

// Calculation Drilldown (v2.2 Living Deal)
export {
  CalculationDrilldown,
  ClickableValue,
  ValueWithDrilldown,
} from './CalculationDrilldown';
export type { CalculationNode } from './CalculationDrilldown';

// Editors (v2.2 Living Deal - Sprint 2)
export { CovenantEditor } from './editors/CovenantEditor';
export type { CovenantFormValues, CovenantEditorProps } from './editors/CovenantEditor';
export { BasketEditor } from './editors/BasketEditor';
export type { BasketFormValues, BasketEditorProps, BasketType } from './editors/BasketEditor';

// Deal Management (v2.2 Living Deal - Sprint 4)
export { CreateDealModal } from './CreateDealModal';
export { ActivityFeed, CollapsibleActivityFeed, ActivityPanel } from './ActivityFeed';

// Export functionality (v2.3 Public Demo - Phase 4)
export { ExportModal } from './export';

// Chart components (v2.4 Dashboard Redesign)
export { Sparkline, SparklineCard } from './charts';
export type { SparklineProps, SparklineCardProps } from './charts';
