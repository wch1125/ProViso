/**
 * Monitoring Dashboard - Post-Closing Dashboard (v1.0 + v2.1 Industry)
 *
 * This is the existing v1.0 dashboard with v2.1 industry components.
 * Shows project finance monitoring: phases, covenants, waterfalls, reserves, milestones,
 * plus industry-specific: performance guarantees, regulatory tracking, technical progress, tax equity.
 *
 * Now wired to the ProViso interpreter for live data.
 */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Settings, AlertTriangle, RefreshCw, DollarSign, X, Upload } from 'lucide-react';
import { Button } from '../../components/base/Button';
import { Skeleton, SkeletonCard, SkeletonChart } from '../../components/base/Skeleton';
import { EmptyState } from '../../components/base/EmptyState';
import { DealPageLayout, DealPageContent } from '../../components/layout';
import {
  ExecutiveSummary,
  PhaseTimeline,
  CovenantPanel,
  WaterfallChart,
  ReserveStatus,
  MilestoneTracker,
  CPChecklist,
  FinancialDataEditor,
  ConnectedScenarioSimulator,
  ComplianceTrendPanel,
  FileUploader,
  Modal,
  ExportModal,
  // v2.1 Industry components
  PerformanceChart,
  RegulatoryTracker,
  TechnicalProgress,
  TaxEquityPanel,
} from '../../components';
import { useProViso, useDeal } from '../../context';
import { CollapsibleActivityFeed } from '../../components/ActivityFeed';
import { DEFAULT_PROVISO_CODE } from '../../data/default-code';
import { DEFAULT_FINANCIALS } from '../../data/default-financials';
import { getScenarioById } from '../../data/demo-scenarios';

/**
 * Loading skeleton for the dashboard
 */
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Executive Summary Skeleton */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-2">
              <Skeleton width="60%" height="14px" />
              <Skeleton width="40%" height="24px" />
            </div>
          ))}
        </div>
      </div>

      {/* Phase Timeline Skeleton */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
        <Skeleton width="150px" height="16px" className="mb-4" />
        <Skeleton width="100%" height="60px" />
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SkeletonCard />
        <div className="space-y-6">
          <SkeletonChart height="200px" />
          <SkeletonCard />
        </div>
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}

/**
 * Error state component
 */
function ErrorDisplay({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <EmptyState
        icon={AlertTriangle}
        title="Failed to load dashboard"
        description={error}
        action={{
          label: 'Retry',
          onClick: onRetry,
          variant: 'primary',
          icon: <RefreshCw className="w-4 h-4" />,
        }}
        size="lg"
      />
    </div>
  );
}

export function MonitoringDashboard() {
  const { dealId } = useParams<{ dealId: string }>();
  const {
    isLoaded,
    isLoading,
    error,
    dashboardData,
    loadFromCode,
    refresh,
  } = useProViso();
  const { logActivity, getActivitiesForDeal } = useDeal();

  // Get activities for this deal (or all activities if no deal)
  const activities = dealId ? getActivitiesForDeal(dealId) : [];

  // State for financial editor panel
  const [showFinancialEditor, setShowFinancialEditor] = useState(false);

  // State for file upload modal
  const [showFileUploader, setShowFileUploader] = useState(false);

  // State for export modal
  const [showExportModal, setShowExportModal] = useState(false);

  // Get the current ProViso code (from scenario or default)
  const currentScenario = dealId ? getScenarioById(dealId) : undefined;
  const currentCode = currentScenario?.code ?? DEFAULT_PROVISO_CODE;
  const currentFinancials = currentScenario?.financials ?? DEFAULT_FINANCIALS;

  // Track the currently loaded dealId to detect changes
  const [loadedDealId, setLoadedDealId] = useState<string | null>(null);

  // Initialize on mount OR when dealId changes
  useEffect(() => {
    async function initialize() {
      // Load if not loaded yet, OR if dealId changed
      const shouldLoad = (!isLoaded && !isLoading && !error) || (dealId !== loadedDealId && !isLoading);

      if (shouldLoad) {
        // Check if there's a demo scenario for this dealId
        const scenario = dealId ? getScenarioById(dealId) : undefined;

        if (scenario) {
          // Load the scenario's code AND financials together (avoids race condition)
          await loadFromCode(scenario.code, scenario.financials);
        } else {
          // Fall back to default code and financials
          await loadFromCode(DEFAULT_PROVISO_CODE, DEFAULT_FINANCIALS);
        }

        setLoadedDealId(dealId ?? null);
      }
    }
    initialize();
  }, [dealId, loadedDealId, isLoaded, isLoading, error, loadFromCode]);

  // Retry handler
  const handleRetry = async () => {
    const scenario = dealId ? getScenarioById(dealId) : undefined;

    if (scenario) {
      await loadFromCode(scenario.code, scenario.financials);
    } else {
      await loadFromCode(DEFAULT_PROVISO_CODE, DEFAULT_FINANCIALS);
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    refresh();
  };

  // Toggle financial editor
  const toggleFinancialEditor = () => {
    setShowFinancialEditor((prev) => !prev);
  };

  // Toggle file uploader
  const toggleFileUploader = () => {
    setShowFileUploader((prev) => !prev);
  };

  // Handle successful file upload
  const handleUploadSuccess = () => {
    if (dealId) {
      logActivity({
        type: 'file_loaded',
        dealId,
        title: 'File uploaded',
        description: 'ProViso file or financial data loaded',
      });
    }
    // Close the modal after a brief delay to show the success message
    setTimeout(() => {
      setShowFileUploader(false);
    }, 1500);
  };

  // Loading state - also show loading when dealId changes
  if (isLoading || (!isLoaded && !error) || (dealId !== loadedDealId && loadedDealId !== null)) {
    return (
      <DealPageLayout
        dealId={dealId || 'unknown'}
        dealName="Loading..."
        dealStatus="active"
        subtitle=""
      >
        <DealPageContent>
          <DashboardSkeleton />
        </DealPageContent>
      </DealPageLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DealPageLayout
        dealId={dealId || 'unknown'}
        dealName="Error"
        dealStatus="active"
        subtitle=""
      >
        <DealPageContent>
          <ErrorDisplay error={error} onRetry={handleRetry} />
        </DealPageContent>
      </DealPageLayout>
    );
  }

  // No data state (shouldn't happen if loading worked)
  if (!dashboardData) {
    return (
      <DealPageLayout
        dealId={dealId || 'unknown'}
        dealName="No Data"
        dealStatus="active"
        subtitle=""
      >
        <DealPageContent>
          <EmptyState
            title="No data available"
            description="Load a ProViso file to see dashboard data."
            size="lg"
          />
        </DealPageContent>
      </DealPageLayout>
    );
  }

  // Success state - render with live data
  const data = dashboardData;

  return (
    <DealPageLayout
      dealId={dealId || 'unknown'}
      dealName={data.project.name}
      dealStatus="active"
      subtitle={data.project.facility}
      actions={
        <>
          <Button
            variant="ghost"
            icon={<Upload className="w-4 h-4" />}
            size="sm"
            onClick={toggleFileUploader}
          >
            Upload
          </Button>
          <Button
            variant={showFinancialEditor ? 'secondary' : 'ghost'}
            icon={<DollarSign className="w-4 h-4" />}
            size="sm"
            onClick={toggleFinancialEditor}
          >
            {showFinancialEditor ? 'Hide Editor' : 'Edit Financials'}
          </Button>
          <Button
            variant="ghost"
            icon={<RefreshCw className="w-4 h-4" />}
            size="sm"
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button
            variant="ghost"
            icon={<FileText className="w-4 h-4" />}
            size="sm"
            onClick={() => setShowExportModal(true)}
          >
            Export Report
          </Button>
          <Button variant="ghost" icon={<Settings className="w-4 h-4" />} size="sm">
            Settings
          </Button>
        </>
      }
    >
      {/* Financial Data Editor Slide-out Panel */}
      {showFinancialEditor && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 sm:hidden"
            onClick={() => setShowFinancialEditor(false)}
          />
          {/* Panel */}
          <div className="relative ml-auto w-full sm:w-[480px] bg-slate-900 border-l border-slate-800 shadow-2xl overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setShowFinancialEditor(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            {/* Editor content */}
            <div className="pt-4">
              <FinancialDataEditor onClose={() => setShowFinancialEditor(false)} />
            </div>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      <Modal
        isOpen={showFileUploader}
        onClose={() => setShowFileUploader(false)}
        title="Upload Files"
        size="md"
      >
        <FileUploader onSuccess={handleUploadSuccess} />
      </Modal>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        dashboardData={dashboardData}
        provisoCode={currentCode}
        financials={currentFinancials}
      />

      <DealPageContent>
        {/* Executive Summary - Full Width */}
        <ExecutiveSummary data={data} />

        {/* Phase Timeline - Full Width */}
        <div className="mt-6">
          <PhaseTimeline phase={data.phase} />
        </div>

        {/* Main Grid - 3 Column Layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Covenants */}
          <div className="lg:col-span-1">
            <CovenantPanel covenants={data.covenants} />
          </div>

          {/* Middle Column - Waterfall + Reserves */}
          <div className="lg:col-span-1 space-y-6">
            <WaterfallChart waterfall={data.waterfall} />
            <ReserveStatus reserves={data.reserves} />
          </div>

          {/* Right Column - Milestones + CPs */}
          <div className="lg:col-span-1 space-y-6">
            <MilestoneTracker milestones={data.milestones} />
            <CPChecklist checklists={data.conditionsPrecedent} />
          </div>
        </div>

        {/* Scenario Analysis Section */}
        <div className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white">Scenario Analysis</h2>
            <p className="text-sm text-gray-400">Test "what if" scenarios on covenant compliance</p>
          </div>
          <ConnectedScenarioSimulator />
        </div>

        {/* Compliance History Section */}
        <div className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white">Compliance History</h2>
            <p className="text-sm text-gray-400">Covenant trends over time (simulated historical data)</p>
          </div>
          <ComplianceTrendPanel periods={6} />
        </div>

        {/* v2.1 Industry Section */}
        {data.industry && (
          <>
            <div className="mt-8 mb-4">
              <h2 className="text-xl font-bold text-white">Industry Analytics</h2>
              <p className="text-sm text-gray-400">Performance, regulatory, and tax equity tracking</p>
            </div>

            {/* Industry Grid - 2x2 Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance & Technical */}
              {data.industry.performanceGuarantees && (
                <PerformanceChart
                  guarantees={data.industry.performanceGuarantees}
                  degradation={data.industry.degradation}
                />
              )}
              {data.industry.technicalMilestones && (
                <TechnicalProgress milestones={data.industry.technicalMilestones} />
              )}

              {/* Regulatory & Tax Equity */}
              {data.industry.regulatoryRequirements && (
                <RegulatoryTracker requirements={data.industry.regulatoryRequirements} />
              )}
              {data.industry.taxEquity && (
                <TaxEquityPanel
                  structure={data.industry.taxEquity.structure}
                  credits={data.industry.taxEquity.credits}
                  depreciation={data.industry.taxEquity.depreciation}
                  flipEvents={data.industry.taxEquity.flipEvents}
                />
              )}
            </div>
          </>
        )}

        {/* Activity Feed */}
        {activities.length > 0 && (
          <div className="mt-8">
            <CollapsibleActivityFeed
              activities={activities}
              title="Recent Activity"
              maxItems={5}
              defaultExpanded={false}
            />
          </div>
        )}
      </DealPageContent>
    </DealPageLayout>
  );
}

export default MonitoringDashboard;
