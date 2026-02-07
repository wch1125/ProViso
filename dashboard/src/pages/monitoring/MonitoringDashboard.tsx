/**
 * Monitoring Dashboard - Post-Closing Dashboard (v1.0 + v2.1 Industry)
 *
 * This is the existing v1.0 dashboard with v2.1 industry components.
 * Shows project finance monitoring: phases, covenants, waterfalls, reserves, milestones,
 * plus industry-specific: performance guarantees, regulatory tracking, technical progress, tax equity.
 *
 * Now wired to the ProViso interpreter for live data.
 */
import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, AlertTriangle, RefreshCw, DollarSign, X, Upload, TrendingUp, BarChart3, Activity, Download, RotateCcw } from 'lucide-react';
import { Button } from '../../components/base/Button';
import { Skeleton, SkeletonCard, SkeletonChart } from '../../components/base/Skeleton';
import { EmptyState } from '../../components/base/EmptyState';
import { CollapsibleCard } from '../../components/base/CollapsibleCard';
import { DealPageLayout, DealPageContent } from '../../components/layout';
import { ConfirmationModal } from '../../components/base/ConfirmationModal';
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
  // Distressed covenant workflow
  CureRightsOptimizer,
  WaiverRequestPortal,
  AmendmentOverlay,
} from '../../components';
import { useProViso, useDeal } from '../../context';
import { CollapsibleActivityFeed } from '../../components/ActivityFeed';
import { DEFAULT_PROVISO_CODE } from '../../data/default-code';
import { DEFAULT_FINANCIALS } from '../../data/default-financials';
import { getScenarioById } from '../../data/demo-scenarios';
import { downloadAsFile } from '../../utils/complianceExport';
import { convertHistoricalToMultiPeriod, getCurrentPeriodLabel } from '../../utils/historicalDataConverter';

/**
 * Loading skeleton for the dashboard
 */
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Executive Summary Skeleton */}
      <div className="bg-surface-0/50 border border-surface-2 rounded-xl p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-2">
              <Skeleton width="60%" height="14px" />
              <Skeleton width="40%" height="24px" />
            </div>
          ))}
        </div>
      </div>

      {/* Phase Timeline Skeleton */}
      <div className="bg-surface-0/50 border border-surface-2 rounded-xl p-5">
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
  const navigate = useNavigate();
  const {
    isLoaded,
    isLoading,
    error,
    dashboardData,
    code: contextCode,
    financials: contextFinancials,
    isMultiPeriod,
    loadFromCode,
    refresh,
  } = useProViso();
  const { logActivity, getActivitiesForDeal, currentDeal, getPartiesForDeal } = useDeal();

  // Get activities for this deal (or all activities if no deal)
  const activities = dealId ? getActivitiesForDeal(dealId) : [];

  // State for financial editor panel
  const [showFinancialEditor, setShowFinancialEditor] = useState(false);

  // State for file upload modal
  const [showFileUploader, setShowFileUploader] = useState(false);

  // State for export modal
  const [showExportModal, setShowExportModal] = useState(false);

  // Distressed covenant workflow state
  const [showCureOptimizer, setShowCureOptimizer] = useState(false);
  const [showWaiverPortal, setShowWaiverPortal] = useState(false);
  const [showAmendmentOverlay, setShowAmendmentOverlay] = useState(false);
  const [selectedBreachedCovenant, setSelectedBreachedCovenant] = useState<import('../../types').CovenantData | null>(null);

  // Reset demo state
  const [showResetModal, setShowResetModal] = useState(false);

  const handleResetDemo = () => {
    localStorage.clear();
    setShowResetModal(false);
    navigate('/');
  };

  // Get the current ProViso code (from scenario or default)
  const currentScenario = dealId ? getScenarioById(dealId) : undefined;
  const currentCode = currentScenario?.code ?? DEFAULT_PROVISO_CODE;
  const currentFinancials = currentScenario?.financials ?? DEFAULT_FINANCIALS;

  // Track the currently loaded dealId to detect changes
  const [loadedDealId, setLoadedDealId] = useState<string | null>(null);

  // Enrich dashboard data with deal metadata (must be called unconditionally — Rules of Hooks)
  const data = useMemo(() => {
    if (!dashboardData) return null;

    // Enrich project metadata from DealContext when available
    if (currentDeal && dealId) {
      const parties = getPartiesForDeal(dealId);
      const borrower = parties.find(p => p.partyType === 'borrower');
      const sponsor = parties.find(p => p.role?.toLowerCase().includes('sponsor'));
      return {
        ...dashboardData,
        project: {
          name: dashboardData.project.name || currentDeal.name,
          facility: dashboardData.project.facility || `$${(currentDeal.facilityAmount / 1_000_000).toFixed(0)}M ${currentDeal.dealType === 'project_finance' ? 'Project Finance' : 'Corporate'} Facility`,
          sponsor: dashboardData.project.sponsor || sponsor?.name || '',
          borrower: dashboardData.project.borrower || borrower?.name || currentDeal.name,
        },
      };
    }
    return dashboardData;
  }, [dashboardData, currentDeal, dealId, getPartiesForDeal]);

  // Initialize on mount OR when dealId changes
  useEffect(() => {
    async function initialize() {
      // Load if not loaded yet, OR if dealId changed
      const shouldLoad = (!isLoaded && !isLoading && !error) || (dealId !== loadedDealId && !isLoading);

      if (shouldLoad) {
        // Check if there's a demo scenario for this dealId
        const scenario = dealId ? getScenarioById(dealId) : undefined;

        if (scenario) {
          // Convert historical data to multi-period format for live compliance history
          const multiPeriodData = scenario.historicalData?.length > 0
            ? convertHistoricalToMultiPeriod(
                scenario.historicalData,
                scenario.financials,
                getCurrentPeriodLabel(),
              )
            : undefined;

          // Load the scenario's code, financials, AND historical data together
          await loadFromCode(scenario.code, scenario.financials, multiPeriodData);
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
      const multiPeriodData = scenario.historicalData?.length > 0
        ? convertHistoricalToMultiPeriod(
            scenario.historicalData,
            scenario.financials,
            getCurrentPeriodLabel(),
          )
        : undefined;
      await loadFromCode(scenario.code, scenario.financials, multiPeriodData);
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

  // Download current ProViso code as .proviso file
  const handleDownloadCode = () => {
    try {
      const codeToExport = contextCode || currentCode;
      const projectName = dashboardData?.project.name || 'agreement';
      const sanitized = projectName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      downloadAsFile(codeToExport, `${sanitized}.proviso`, 'text/plain');
    } catch (err) {
      console.error('Failed to download code:', err);
    }
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
  if (!dashboardData || !data) {
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

  // Identify breached covenants for distressed workflow
  const breachedCovenants = data.covenants.filter(c => !c.compliant && !c.suspended);

  const handleCureApplied = (covenantName: string, mechanism: string, amount: number) => {
    if (dealId) {
      logActivity({
        type: 'covenant_alert',
        dealId,
        title: 'Cure applied',
        description: `${mechanism} of $${amount.toLocaleString()} applied to ${covenantName}`,
      });
    }
    refresh();
  };

  const handleWaiverSubmitted = () => {
    if (dealId && selectedBreachedCovenant) {
      logActivity({
        type: 'covenant_alert',
        dealId,
        title: 'Waiver request submitted',
        description: `Waiver requested for ${selectedBreachedCovenant.name}`,
      });
    }
  };

  const handleAmendmentGenerated = (amendmentCode: string) => {
    if (dealId) {
      logActivity({
        type: 'covenant_alert',
        dealId,
        title: 'Amendment drafted',
        description: `Amendment code generated (${amendmentCode.split('\n').length} lines)`,
      });
    }
  };

  // Determine current phase from phase data
  const currentPhase = data.phase.current?.toLowerCase().includes('construction')
    ? 'construction' as const
    : 'operations' as const;

  return (
    <DealPageLayout
      dealId={dealId || 'unknown'}
      dealName={data.project.name}
      dealStatus="active"
      subtitle={data.project.facility}
      currentPhase={currentPhase}
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
            icon={<Download className="w-4 h-4" />}
            size="sm"
            onClick={handleDownloadCode}
          >
            Download Code
          </Button>
          <Button
            variant="ghost"
            icon={<FileText className="w-4 h-4" />}
            size="sm"
            onClick={() => setShowExportModal(true)}
          >
            Export Report
          </Button>
          <Button
            variant="ghost"
            icon={<RotateCcw className="w-4 h-4" />}
            size="sm"
            onClick={() => setShowResetModal(true)}
          >
            Reset Demo
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
          <div className="relative ml-auto w-full sm:w-[480px] bg-surface-0 border-l border-surface-2 shadow-2xl overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setShowFinancialEditor(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-text-tertiary hover:text-text-primary transition-colors z-10"
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
        <FileUploader onSuccess={handleUploadSuccess} demoMode={!!currentScenario} />
      </Modal>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        dashboardData={dashboardData}
        provisoCode={contextCode || currentCode}
        financials={Object.keys(contextFinancials).length > 0 ? contextFinancials : currentFinancials}
      />

      {/* Distressed Covenant Workflow Modals */}
      <CureRightsOptimizer
        isOpen={showCureOptimizer}
        onClose={() => setShowCureOptimizer(false)}
        covenant={selectedBreachedCovenant}
        onCureApplied={handleCureApplied}
      />
      <WaiverRequestPortal
        isOpen={showWaiverPortal}
        onClose={() => setShowWaiverPortal(false)}
        covenant={selectedBreachedCovenant}
        allBreachedCovenants={breachedCovenants}
        onSubmit={handleWaiverSubmitted}
        dealName={data.project.name}
        borrowerName={data.project.borrower || data.project.sponsor}
      />
      <AmendmentOverlay
        isOpen={showAmendmentOverlay}
        onClose={() => setShowAmendmentOverlay(false)}
        currentCode={contextCode || currentCode}
        triggerCovenant={selectedBreachedCovenant}
        onGenerate={handleAmendmentGenerated}
      />

      <DealPageContent>
        {/* Executive Summary - Full Width */}
        <ExecutiveSummary data={data} />

        {/* Phase Timeline - Full Width */}
        <div className="mt-6">
          <PhaseTimeline phase={data.phase} />
        </div>

        {/* Main Grid - 3 Column Layout */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {/* Left Column - Covenants + Baskets */}
          <div className="min-w-[280px] md:col-span-2 xl:col-span-1 space-y-4 lg:space-y-6">
            <CovenantPanel
              covenants={data.covenants}
              onRequestCure={(c) => { setSelectedBreachedCovenant(c); setShowCureOptimizer(true); }}
              onRequestWaiver={(c) => { setSelectedBreachedCovenant(c); setShowWaiverPortal(true); }}
              onRequestAmendment={(c) => { setSelectedBreachedCovenant(c); setShowAmendmentOverlay(true); }}
            />
            {data.baskets.length > 0 && (
              <div className="bg-surface-0/80 backdrop-blur-sm border border-surface-2 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-surface-2">
                  <h3 className="text-sm font-semibold text-text-primary">Basket Utilization</h3>
                </div>
                <div className="p-4 space-y-3">
                  {data.baskets.map(basket => {
                    const pct = Math.min(basket.utilization, 100);
                    const barColor = pct >= 90 ? 'bg-danger' : pct >= 75 ? 'bg-warning' : 'bg-accent';
                    return (
                      <div key={basket.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-text-primary">{basket.name}</span>
                          <span className="text-xs text-text-secondary">{pct.toFixed(0)}% used</span>
                        </div>
                        <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between mt-0.5">
                          <span className="text-[10px] text-text-tertiary">
                            ${basket.used >= 1e6 ? `${(basket.used / 1e6).toFixed(1)}M` : `${(basket.used / 1e3).toFixed(0)}K`} used
                          </span>
                          <span className="text-[10px] text-text-tertiary">
                            ${basket.available >= 1e6 ? `${(basket.available / 1e6).toFixed(1)}M` : `${(basket.available / 1e3).toFixed(0)}K`} available
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Middle Column - Waterfall + Reserves */}
          <div className="min-w-[280px] space-y-4 lg:space-y-6">
            <WaterfallChart waterfall={data.waterfall} />
            <ReserveStatus reserves={data.reserves} />
          </div>

          {/* Right Column - Milestones + CPs */}
          <div className="min-w-[280px] space-y-4 lg:space-y-6">
            <MilestoneTracker milestones={data.milestones} />
            <CPChecklist checklists={data.conditionsPrecedent} />
          </div>
        </div>

        {/* Scenario Analysis Section - Collapsed by default */}
        <div className="mt-8">
          <CollapsibleCard
            title="Scenario Analysis"
            subtitle="Test 'what if' scenarios on covenant compliance"
            icon={<TrendingUp className="w-5 h-5 text-industry-primary" />}
            defaultExpanded={false}
          >
            <ConnectedScenarioSimulator />
          </CollapsibleCard>
        </div>

        {/* Compliance History Section - Collapsed by default */}
        <div className="mt-8">
          <CollapsibleCard
            title="Compliance History"
            subtitle={isMultiPeriod
              ? "Covenant trends from multi-period financial data"
              : "Covenant trends over time (simulated historical data)"
            }
            icon={<BarChart3 className="w-5 h-5 text-industry-primary" />}
            defaultExpanded={false}
          >
            <ComplianceTrendPanel periods={6} />
          </CollapsibleCard>
        </div>

        {/* v2.1 Industry Section - Collapsed by default */}
        {data.industry && (
          <div className="mt-8">
            <CollapsibleCard
              title="Industry Analytics"
              subtitle="Performance, regulatory, and tax equity tracking"
              icon={<Activity className="w-5 h-5 text-industry-primary" />}
              defaultExpanded={false}
            >
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
            </CollapsibleCard>
          </div>
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

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetDemo}
        variant="danger"
        title="Reset Demo?"
        message="This will reset all demo data and return to the home page. Any changes you've made will be lost."
        confirmLabel="Reset"
        cancelLabel="Cancel"
      />
    </DealPageLayout>
  );
}

export default MonitoringDashboard;
