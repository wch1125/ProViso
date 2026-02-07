/**
 * CPChecklist Component — v2.5 Closing Dashboard Redesign
 *
 * Displays conditions precedent grouped by priority tier (Gating, Needs Attention,
 * In Progress, Completed) with collapsed completed section. Supports layer-based
 * filtering via the ReadinessMeter stacked bar.
 */

import { useState } from 'react';
import { CheckCircle, Circle, AlertTriangle, Clock, Filter, Check, Ban, ChevronDown, ChevronRight, X } from 'lucide-react';
import { Badge } from '../base/Badge';
import { Button } from '../base/Button';
import { Modal } from '../base/Modal';
import { TextArea } from '../base/TextArea';
import {
  groupByPriority,
  getLayerForCategory,
  DOCUMENT_LAYERS,
  PRIORITY_TIER_CONFIG,
  type LayerStats,
  type PriorityTier,
} from '../../utils/documentLayers';

interface ConditionPrecedent {
  id: string;
  sectionReference: string;
  category: string;
  title: string;
  description: string;
  responsiblePartyId: string;
  responsiblePartyName: string;
  status: 'pending' | 'satisfied' | 'waived';
  dueDate: Date | null;
  isOverdue: boolean;
  notes: string;
}

interface CPChecklistProps {
  conditions: ConditionPrecedent[];
  onSatisfy?: (id: string, notes?: string) => void;
  onWaive?: (id: string, notes: string, approvedBy: string) => void;
  onStatusChange?: (id: string, status: 'satisfied' | 'waived') => void;
  /** New: layer stats for priority grouping */
  layerStats?: LayerStats[];
  /** New: active layer filter from ReadinessMeter click */
  activeLayerFilter?: string | null;
  /** New: callback to change layer filter */
  onLayerFilterChange?: (layerId: string | null) => void;
}

const categoryLabels: Record<string, string> = {
  corporate_documents: 'Corporate Documents',
  credit_agreement: 'Credit Agreement',
  security_documents: 'Security Documents',
  ucc_filings: 'UCC Filings',
  legal_opinions: 'Legal Opinions',
  certificates: 'Certificates',
  financial: 'Financial',
  insurance: 'Insurance',
  kyc_aml: 'KYC/AML',
  permits: 'Permits & Approvals',
  technical: 'Technical / Engineering',
  tax_equity: 'Tax Equity',
  offtake: 'Offtake & Revenue',
  real_estate: 'Real Estate & Title',
  project_documents: 'Project Documents',
  construction: 'Construction',
  accounts: 'Accounts & Funds Flow',
  post_closing: 'Post-Closing',
  due_diligence: 'Due Diligence',
  consents: 'Third-Party Consents',
  other: 'Other',
};

export function CPChecklist({
  conditions,
  onSatisfy,
  onWaive,
  onStatusChange,
  layerStats,
  activeLayerFilter,
  onLayerFilterChange,
}: CPChecklistProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'satisfied'>('all');
  const [layerFilter, setLayerFilter] = useState<string>('all');
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [waiveModalOpen, setWaiveModalOpen] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<ConditionPrecedent | null>(null);
  const [waiveNotes, setWaiveNotes] = useState('');
  const [waiveApprovedBy, setWaiveApprovedBy] = useState('');

  const usePriorityGrouping = !!layerStats;

  // Apply filters
  const filteredConditions = conditions.filter((cp) => {
    if (filter === 'pending' && cp.status !== 'pending') return false;
    if (filter === 'satisfied' && cp.status === 'pending') return false;
    // Layer filter from dropdown
    if (layerFilter !== 'all') {
      const layer = getLayerForCategory(cp.category);
      if (layer.id !== layerFilter) return false;
    }
    // Layer filter from ReadinessMeter click
    if (activeLayerFilter) {
      const layer = getLayerForCategory(cp.category);
      if (layer.id !== activeLayerFilter) return false;
    }
    return true;
  });

  // Priority grouping or category grouping
  const priorityGroups = usePriorityGrouping
    ? groupByPriority(filteredConditions)
    : null;

  const categoryGroups = !usePriorityGrouping
    ? filteredConditions.reduce((groups, cp) => {
        const cat = cp.category;
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(cp);
        return groups;
      }, {} as Record<string, ConditionPrecedent[]>)
    : null;

  const getStatusIcon = (cp: ConditionPrecedent) => {
    if (cp.status === 'satisfied') return <CheckCircle className="w-5 h-5 text-success" />;
    if (cp.status === 'waived') return <CheckCircle className="w-5 h-5 text-text-tertiary" />;
    if (cp.isOverdue) return <AlertTriangle className="w-5 h-5 text-danger" />;
    return <Circle className="w-5 h-5 text-text-muted" />;
  };

  const getStatusBadge = (cp: ConditionPrecedent) => {
    if (cp.status === 'satisfied') return <Badge variant="success" size="sm">Satisfied</Badge>;
    if (cp.status === 'waived') return <Badge variant="muted" size="sm">Waived</Badge>;
    if (cp.isOverdue) return <Badge variant="danger" size="sm">Overdue</Badge>;
    return <Badge variant="warning" size="sm">Pending</Badge>;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSatisfy = (cp: ConditionPrecedent) => {
    if (onSatisfy) onSatisfy(cp.id);
    else if (onStatusChange) onStatusChange(cp.id, 'satisfied');
  };

  const handleOpenWaiveModal = (cp: ConditionPrecedent) => {
    setSelectedCondition(cp);
    setWaiveNotes('');
    setWaiveApprovedBy('');
    setWaiveModalOpen(true);
  };

  const handleConfirmWaive = () => {
    if (!selectedCondition || !waiveNotes.trim()) return;
    if (onWaive) onWaive(selectedCondition.id, waiveNotes.trim(), waiveApprovedBy.trim() || 'Admin');
    else if (onStatusChange) onStatusChange(selectedCondition.id, 'waived');
    setWaiveModalOpen(false);
    setSelectedCondition(null);
    setWaiveNotes('');
    setWaiveApprovedBy('');
  };

  const activeLayerName = activeLayerFilter
    ? DOCUMENT_LAYERS.find(l => l.id === activeLayerFilter)?.name ?? activeLayerFilter
    : null;

  /** Render a single condition card */
  const renderConditionCard = (cp: ConditionPrecedent, tier: PriorityTier | null) => {
    const isCompleted = tier === 'completed';
    const tierConfig = tier ? PRIORITY_TIER_CONFIG[tier] : null;
    const layerName = getLayerForCategory(cp.category).name;

    return (
      <div
        key={cp.id}
        className={`bg-surface-1 border border-border-DEFAULT rounded-lg p-5 border-l-4 hover:border-border-strong transition-colors ${
          isCompleted
            ? 'border-l-success/30'
            : tierConfig
              ? tierConfig.borderColor
              : cp.isOverdue ? 'border-l-danger' : cp.status === 'satisfied' ? 'border-l-success' : cp.status === 'waived' ? 'border-l-text-muted' : 'border-l-warning'
        } ${isCompleted ? 'opacity-75' : ''}`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{getStatusIcon(cp)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-text-muted font-mono">
                {cp.sectionReference}
              </span>
              {getStatusBadge(cp)}
              {usePriorityGrouping && (
                <Badge variant="muted" size="sm">{layerName}</Badge>
              )}
            </div>
            <h5 className={`font-medium mt-1.5 ${isCompleted ? 'text-text-secondary' : 'text-text-primary'}`}>
              {cp.title}
            </h5>
            <p className={`text-sm mt-1 line-clamp-2 ${isCompleted ? 'text-text-muted' : 'text-text-secondary'}`}>
              {cp.description}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-text-tertiary">
              <span>{cp.responsiblePartyName}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(cp.dueDate)}
              </span>
            </div>
            {cp.notes && cp.status === 'pending' && (
              <p className="text-xs text-warning mt-2">{cp.notes}</p>
            )}
          </div>

          {/* Action Buttons */}
          {cp.status === 'pending' && (onSatisfy || onWaive || onStatusChange) && (
            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="ghost"
                icon={<Check className="w-4 h-4" />}
                onClick={() => handleSatisfy(cp)}
                title="Mark as Satisfied"
              >
                Satisfy
              </Button>
              <Button
                size="sm"
                variant="ghost"
                icon={<Ban className="w-4 h-4" />}
                onClick={() => handleOpenWaiveModal(cp)}
                title="Waive Condition"
              >
                Waive
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  /** Render a priority tier section */
  const renderTierSection = (tier: PriorityTier, items: ConditionPrecedent[]) => {
    if (items.length === 0) return null;

    const config = PRIORITY_TIER_CONFIG[tier];
    const isCompleted = tier === 'completed';

    return (
      <div key={tier}>
        {/* Section header */}
        {isCompleted ? (
          <button
            className="w-full flex items-center gap-2 text-left mb-3 pb-3 border-b-2 border-border-DEFAULT group"
            onClick={() => setCompletedExpanded(!completedExpanded)}
          >
            <span className={`w-2.5 h-2.5 rounded-full bg-success flex-shrink-0`} />
            <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-[1.5px]">
              {config.label}
            </span>
            <Badge variant="success" size="sm">{items.length}</Badge>
            <span className="flex-1" />
            <span className="text-xs text-text-muted group-hover:text-text-tertiary transition-colors flex items-center gap-1">
              {completedExpanded ? (
                <>Hide <ChevronDown className="w-3.5 h-3.5" /></>
              ) : (
                <>Show <ChevronRight className="w-3.5 h-3.5" /></>
              )}
            </span>
          </button>
        ) : (
          <div className="flex items-center gap-2 mb-3 pb-3 border-b-2 border-border-DEFAULT">
            <span className={`w-2.5 h-2.5 rounded-full ${
              tier === 'gating' ? 'bg-danger' : tier === 'attention' ? 'bg-warning' : 'bg-info'
            } flex-shrink-0`} />
            <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-[1.5px]">
              {config.label}
            </span>
            <Badge variant={config.badgeVariant} size="sm">{items.length}</Badge>
          </div>
        )}

        {/* Cards (collapsed for completed) */}
        {(!isCompleted || completedExpanded) && (
          <div className="space-y-3">
            {items.map((cp) => renderConditionCard(cp, tier))}
          </div>
        )}

        {/* Collapsed summary for completed */}
        {isCompleted && !completedExpanded && (
          <div className="text-sm text-text-muted py-2">
            {items.length} condition{items.length !== 1 ? 's' : ''} completed
          </div>
        )}
      </div>
    );
  };

  const tierOrder: PriorityTier[] = ['gating', 'attention', 'in_progress', 'completed'];

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-surface-1 border border-border-DEFAULT rounded-lg px-4 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-tertiary" />
          <span className="text-[13px] text-text-tertiary">Status:</span>
          <div className="flex gap-1">
            {(['all', 'pending', 'satisfied'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  filter === f
                    ? 'bg-gold-500/10 text-gold-500'
                    : 'text-text-tertiary hover:text-text-primary hover:bg-surface-2'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[13px] text-text-tertiary">
            {usePriorityGrouping ? 'Document Layer:' : 'Category:'}
          </span>
          {usePriorityGrouping ? (
            <select
              value={layerFilter}
              onChange={(e) => {
                setLayerFilter(e.target.value);
                // Clear the ReadinessMeter filter when using dropdown
                if (onLayerFilterChange) onLayerFilterChange(null);
              }}
              className="bg-surface-2 border border-border-DEFAULT text-sm text-text-primary rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gold-500/30"
            >
              <option value="all">All Layers</option>
              {DOCUMENT_LAYERS.map((layer) => (
                <option key={layer.id} value={layer.id}>
                  {layer.name}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={layerFilter}
              onChange={(e) => setLayerFilter(e.target.value)}
              className="bg-surface-2 border border-border-DEFAULT text-sm text-text-primary rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gold-500/30"
            >
              <option value="all">All Categories</option>
              {Array.from(new Set(conditions.map((c) => c.category))).map((cat) => (
                <option key={cat} value={cat}>
                  {categoryLabels[cat] || cat}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Active layer filter pill (from ReadinessMeter click) */}
      {activeLayerFilter && activeLayerName && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-500/10 text-gold-500 rounded-full text-xs font-medium">
            Showing: {activeLayerName}
            <button
              onClick={() => onLayerFilterChange?.(null)}
              className="hover:text-gold-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-4 text-[13px]">
        <span className="text-text-tertiary">
          Showing {filteredConditions.length} of {conditions.length}
        </span>
        <span className="text-success">
          {conditions.filter((c) => c.status === 'satisfied').length} satisfied
        </span>
        <span className="text-warning">
          {conditions.filter((c) => c.status === 'pending').length} pending
        </span>
        <span className="text-danger">
          {conditions.filter((c) => c.isOverdue && c.status === 'pending').length} overdue
        </span>
      </div>

      {/* Priority-grouped or category-grouped list */}
      <div className="space-y-8">
        {priorityGroups
          ? tierOrder.map((tier) => renderTierSection(tier, priorityGroups[tier]))
          : categoryGroups && Object.entries(categoryGroups).map(([category, cps]) => (
              <div key={category}>
                <h4 className="text-[11px] font-semibold text-text-tertiary mb-3 uppercase tracking-[1.5px] pb-3 border-b-2 border-border-DEFAULT">
                  {categoryLabels[category] || category}
                </h4>
                <div className="space-y-3">
                  {cps.map((cp) => renderConditionCard(cp, null))}
                </div>
              </div>
            ))
        }
      </div>

      {filteredConditions.length === 0 && (
        <div className="text-center py-8 text-text-tertiary">
          No conditions match the current filters.
        </div>
      )}

      {/* Waive Modal */}
      <Modal
        isOpen={waiveModalOpen}
        onClose={() => setWaiveModalOpen(false)}
        title="Waive Condition"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setWaiveModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmWaive}
              disabled={!waiveNotes.trim()}
            >
              Confirm Waiver
            </Button>
          </>
        }
      >
        {selectedCondition && (
          <div className="space-y-4">
            <div className="bg-surface-2 rounded-lg p-4 border border-border-DEFAULT">
              <p className="text-xs text-text-muted font-mono mb-1">
                {selectedCondition.sectionReference}
              </p>
              <p className="text-text-primary font-medium">{selectedCondition.title}</p>
              <p className="text-sm text-text-secondary mt-1">{selectedCondition.description}</p>
            </div>

            <TextArea
              label="Waiver Reason"
              placeholder="Explain why this condition is being waived..."
              value={waiveNotes}
              onChange={(e) => setWaiveNotes(e.target.value)}
              rows={3}
              required
              error={!waiveNotes.trim() ? 'Waiver reason is required' : undefined}
            />

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Approved By
              </label>
              <input
                type="text"
                value={waiveApprovedBy}
                onChange={(e) => setWaiveApprovedBy(e.target.value)}
                placeholder="Name of approver (optional)"
                className="w-full bg-white/5 border border-border-DEFAULT rounded-md px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
              />
            </div>

            <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 text-sm text-warning">
              <strong>Note:</strong> Waiving a condition means this requirement will be considered
              complete without being satisfied. This action will be logged.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default CPChecklist;
