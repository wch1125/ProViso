/**
 * CPChecklist Component — v2.4 Design System
 *
 * Displays conditions precedent as a checklist with status indicators,
 * filters, and action buttons for satisfy/waive.
 */

import { useState } from 'react';
import { CheckCircle, Circle, AlertTriangle, Clock, Filter, Check, Ban } from 'lucide-react';
import { Badge } from '../base/Badge';
import { Button } from '../base/Button';
import { Modal } from '../base/Modal';
import { TextArea } from '../base/TextArea';

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
  other: 'Other',
};

export function CPChecklist({ conditions, onSatisfy, onWaive, onStatusChange }: CPChecklistProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'satisfied'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [waiveModalOpen, setWaiveModalOpen] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<ConditionPrecedent | null>(null);
  const [waiveNotes, setWaiveNotes] = useState('');
  const [waiveApprovedBy, setWaiveApprovedBy] = useState('');

  const categories = Array.from(new Set(conditions.map((c) => c.category)));

  const filteredConditions = conditions.filter((cp) => {
    if (filter === 'pending' && cp.status !== 'pending') return false;
    if (filter === 'satisfied' && cp.status === 'pending') return false;
    if (categoryFilter !== 'all' && cp.category !== categoryFilter) return false;
    return true;
  });

  const groupedConditions = filteredConditions.reduce((groups, cp) => {
    const cat = cp.category;
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(cp);
    return groups;
  }, {} as Record<string, ConditionPrecedent[]>);

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

  const getLeftBorderColor = (cp: ConditionPrecedent) => {
    if (cp.status === 'satisfied') return 'border-l-success';
    if (cp.status === 'waived') return 'border-l-text-muted';
    if (cp.isOverdue) return 'border-l-danger';
    return 'border-l-warning';
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
          <span className="text-[13px] text-text-tertiary">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-surface-2 border border-border-DEFAULT text-sm text-text-primary rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gold-500/30"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {categoryLabels[cat] || cat}
              </option>
            ))}
          </select>
        </div>
      </div>

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

      {/* Grouped List */}
      <div className="space-y-8">
        {Object.entries(groupedConditions).map(([category, cps]) => (
          <div key={category}>
            <h4 className="text-[11px] font-semibold text-text-tertiary mb-3 uppercase tracking-[1.5px] pb-3 border-b-2 border-border-DEFAULT">
              {categoryLabels[category] || category}
            </h4>
            <div className="space-y-3">
              {cps.map((cp) => (
                <div
                  key={cp.id}
                  className={`bg-surface-1 border border-border-DEFAULT rounded-lg p-5 border-l-4 hover:border-border-strong transition-colors ${getLeftBorderColor(cp)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getStatusIcon(cp)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-text-muted font-mono">
                          {cp.sectionReference}
                        </span>
                        {getStatusBadge(cp)}
                      </div>
                      <h5 className="text-text-primary font-medium mt-1.5">{cp.title}</h5>
                      <p className="text-sm text-text-secondary mt-1 line-clamp-2">
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
              ))}
            </div>
          </div>
        ))}
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
