/**
 * Deal List Page
 *
 * Shows all deals with their status and quick actions.
 * Entry point to the Hub platform.
 * Includes search and filter functionality.
 */
import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Plus,
  Activity,
  RotateCcw,
} from 'lucide-react';
import { Card, CardBody } from '../../components/Card';
import { Badge } from '../../components/base/Badge';
import { Button } from '../../components/base/Button';
import { SearchFilter, QuickFilters } from '../../components/base/SearchFilter';
import { NoResultsFound, NoDataYet } from '../../components/base/EmptyState';
import { SkeletonCard } from '../../components/base/Skeleton';
import { CreateDealModal } from '../../components/CreateDealModal';
import { ActivityPanel } from '../../components/ActivityFeed';
import { TopNav } from '../../components/layout';
import { useDeal, type CreateDealInput, type DealStatus } from '../../context';
import { demoScenarios } from '../../data/demo-scenarios';

const statusConfig: Record<
  DealStatus,
  { label: string; variant: 'success' | 'warning' | 'info' | 'muted' }
> = {
  draft: { label: 'Draft', variant: 'muted' },
  negotiation: { label: 'Negotiation', variant: 'warning' },
  closing: { label: 'Closing', variant: 'info' },
  active: { label: 'Active', variant: 'success' },
  matured: { label: 'Matured', variant: 'muted' },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

function formatDate(date: Date | null): string {
  if (!date) return '-';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function DealList() {
  const navigate = useNavigate();
  const {
    deals,
    activities,
    createDeal,
    getCurrentVersion,
    clearActivities,
    resetToDefaults,
    loadScenario,
  } = useDeal();

  // Load all demo scenarios on mount
  useEffect(() => {
    Object.keys(demoScenarios).forEach(scenarioId => {
      loadScenario(scenarioId);
    });
  }, [loadScenario]);

  // UI state
  const [isLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isActivityPanelOpen, setIsActivityPanelOpen] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Use deals from context
  const allDeals = deals;

  // Compute deal counts by status
  const dealCounts = useMemo(() => {
    return {
      all: allDeals.length,
      negotiation: allDeals.filter((d) => d.status === 'negotiation').length,
      closing: allDeals.filter((d) => d.status === 'closing').length,
      active: allDeals.filter((d) => d.status === 'active').length,
    };
  }, [allDeals]);

  // Filter deals based on search and status
  const filteredDeals = useMemo(() => {
    return allDeals.filter((deal) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = deal.name.toLowerCase().includes(query);
        // Could extend to search other fields
        if (!matchesName) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && deal.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [allDeals, searchQuery, statusFilter]);

  // Quick filter options with counts
  const quickFilterOptions = [
    { id: 'all', label: 'All Deals', count: dealCounts.all },
    { id: 'negotiation', label: 'Negotiation', count: dealCounts.negotiation },
    { id: 'closing', label: 'Closing', count: dealCounts.closing },
    { id: 'active', label: 'Active', count: dealCounts.active },
  ];

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  const handleCreateDeal = (input: CreateDealInput) => {
    const newDeal = createDeal(input);
    // Navigate to negotiation for the new deal
    navigate(`/deals/${newDeal.id}/negotiate`);
  };

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Global navigation with breadcrumb */}
      <TopNav breadcrumbs={[{ label: 'Deal Pipeline' }]} />

      {/* Content */}
      <main className="max-w-screen-2xl mx-auto px-8 py-8">
        {/* Page title row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-display font-semibold text-text-primary">
              Deal Pipeline
            </h1>
            <Badge variant="gold" size="sm">
              v2.1
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={resetToDefaults}
              title="Reset demo data"
            >
              Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Activity className="w-4 h-4" />}
              onClick={() => setIsActivityPanelOpen(true)}
            >
              Activity
              {activities.length > 0 && (
                <span className="ml-1 text-xs bg-gold-500 text-navy-900 px-1.5 py-0.5 rounded-full">
                  {activities.length}
                </span>
              )}
            </Button>
            <Button
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              New Deal
            </Button>
          </div>
        </div>
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<FileText className="w-5 h-5" />}
            label="Total Deals"
            value={dealCounts.all.toString()}
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="In Negotiation"
            value={dealCounts.negotiation.toString()}
            variant="warning"
          />
          <StatCard
            icon={<AlertCircle className="w-5 h-5" />}
            label="Closing"
            value={dealCounts.closing.toString()}
            variant="info"
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5" />}
            label="Active"
            value={dealCounts.active.toString()}
            variant="success"
          />
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          <SearchFilter
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search deals by name..."
          />
          <QuickFilters
            options={quickFilterOptions}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>

        {/* Deal Cards */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading state
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : filteredDeals.length === 0 ? (
            // Empty state
            allDeals.length === 0 ? (
              <NoDataYet
                itemType="deals"
                onCreate={() => {/* Would open new deal modal */}}
                createLabel="Create your first deal"
              />
            ) : (
              <NoResultsFound
                searchTerm={searchQuery || undefined}
                onClear={clearFilters}
              />
            )
          ) : (
            // Deal list
            filteredDeals.map((deal) => {
              const status = statusConfig[deal.status as DealStatus];
              const latestVersion = getCurrentVersion(deal.id);

              return (
                <Card key={deal.id} className="hover:bg-surface-2/50 transition-colors">
                  <CardBody>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-text-primary">
                            {deal.name}
                          </h3>
                          <Badge variant={status.variant} dot>
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-text-tertiary">
                          <span>{formatCurrency(deal.facilityAmount)}</span>
                          <span className="text-text-muted">|</span>
                          <span>
                            Target Close: {formatDate(deal.targetClosingDate)}
                          </span>
                          {latestVersion && (
                            <>
                              <span className="text-text-muted">|</span>
                              <span>
                                {latestVersion.versionLabel} (v
                                {latestVersion.versionNumber})
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link to={`/deals/${deal.id}/negotiate`}>
                          <Button variant="ghost" size="sm">
                            Negotiate
                          </Button>
                        </Link>
                        <Link to={`/deals/${deal.id}/closing`}>
                          <Button variant="ghost" size="sm">
                            Closing
                          </Button>
                        </Link>
                        <Link to={`/deals/${deal.id}/monitor`}>
                          <Button variant="ghost" size="sm">
                            Monitor
                          </Button>
                        </Link>
                        <ChevronRight className="w-5 h-5 text-text-muted" />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })
          )}
        </div>
      </main>

      {/* Create Deal Modal */}
      <CreateDealModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateDeal}
      />

      {/* Activity Panel */}
      <ActivityPanel
        isOpen={isActivityPanelOpen}
        onClose={() => setIsActivityPanelOpen(false)}
        activities={activities}
        onClear={clearActivities}
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
}

function StatCard({ icon, label, value, variant = 'default' }: StatCardProps) {
  const colors: Record<string, string> = {
    default: 'text-text-tertiary',
    success: 'text-success',
    warning: 'text-warning',
    info: 'text-gold-500',
  };

  return (
    <Card>
      <CardBody>
        <div className="flex items-center gap-3">
          <div className={colors[variant]}>{icon}</div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{value}</div>
            <div className="text-sm text-text-tertiary">{label}</div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default DealList;
