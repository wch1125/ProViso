/**
 * CPChecklist Component
 *
 * Displays conditions precedent as a checklist with status indicators
 * and action buttons for satisfy/waive.
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

  // Get unique categories
  const categories = Array.from(new Set(conditions.map((c) => c.category)));

  // Filter conditions
  const filteredConditions = conditions.filter((cp) => {
    if (filter === 'pending' && cp.status !== 'pending') return false;
    if (filter === 'satisfied' && cp.status === 'pending') return false;
    if (categoryFilter !== 'all' && cp.category !== categoryFilter) return false;
    return true;
  });

  // Group by category
  const groupedConditions = filteredConditions.reduce((groups, cp) => {
    const cat = cp.category;
    if (!groups[cat]) {
      groups[cat] = [];
    }
    groups[cat].push(cp);
    return groups;
  }, {} as Record<string, ConditionPrecedent[]>);

  const getStatusIcon = (cp: ConditionPrecedent) => {
    if (cp.status === 'satisfied') {
      return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    }
    if (cp.status === 'waived') {
      return <CheckCircle className="w-5 h-5 text-slate-400" />;
    }
    if (cp.isOverdue) {
      return <AlertTriangle className="w-5 h-5 text-red-400" />;
    }
    return <Circle className="w-5 h-5 text-slate-500" />;
  };

  const getStatusBadge = (cp: ConditionPrecedent) => {
    if (cp.status === 'satisfied') {
      return <Badge variant="success" size="sm">Satisfied</Badge>;
    }
    if (cp.status === 'waived') {
      return <Badge variant="muted" size="sm">Waived</Badge>;
    }
    if (cp.isOverdue) {
      return <Badge variant="danger" size="sm">Overdue</Badge>;
    }
    return <Badge variant="warning" size="sm">Pending</Badge>;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSatisfy = (cp: ConditionPrecedent) => {
    if (onSatisfy) {
      onSatisfy(cp.id);
    } else if (onStatusChange) {
      onStatusChange(cp.id, 'satisfied');
    }
  };

  const handleOpenWaiveModal = (cp: ConditionPrecedent) => {
    setSelectedCondition(cp);
    setWaiveNotes('');
    setWaiveApprovedBy('');
    setWaiveModalOpen(true);
  };

  const handleConfirmWaive = () => {
    if (!selectedCondition || !waiveNotes.trim()) return;

    if (onWaive) {
      onWaive(selectedCondition.id, waiveNotes.trim(), waiveApprovedBy.trim() || 'Admin');
    } else if (onStatusChange) {
      onStatusChange(selectedCondition.id, 'waived');
    }

    setWaiveModalOpen(false);
    setSelectedCondition(null);
    setWaiveNotes('');
    setWaiveApprovedBy('');
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400">Status:</span>
          <div className="flex gap-1">
            {(['all', 'pending', 'satisfied'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  filter === f
                    ? 'bg-accent-500/20 text-accent-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-sm text-white rounded px-2 py-1"
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
      <div className="flex gap-4 text-sm">
        <span className="text-slate-400">
          Showing {filteredConditions.length} of {conditions.length}
        </span>
        <span className="text-emerald-400">
          {conditions.filter((c) => c.status === 'satisfied').length} satisfied
        </span>
        <span className="text-amber-400">
          {conditions.filter((c) => c.status === 'pending').length} pending
        </span>
        <span className="text-red-400">
          {conditions.filter((c) => c.isOverdue && c.status === 'pending').length} overdue
        </span>
      </div>

      {/* Grouped List */}
      <div className="space-y-6">
        {Object.entries(groupedConditions).map(([category, cps]) => (
          <div key={category}>
            <h4 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">
              {categoryLabels[category] || category}
            </h4>
            <div className="space-y-2">
              {cps.map((cp) => (
                <div
                  key={cp.id}
                  className={`bg-slate-800/50 rounded-lg p-4 border-l-4 ${
                    cp.status === 'satisfied'
                      ? 'border-l-emerald-500'
                      : cp.status === 'waived'
                      ? 'border-l-slate-500'
                      : cp.isOverdue
                      ? 'border-l-red-500'
                      : 'border-l-amber-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getStatusIcon(cp)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-slate-500 font-mono">
                          {cp.sectionReference}
                        </span>
                        {getStatusBadge(cp)}
                      </div>
                      <h5 className="text-white font-medium mt-1">{cp.title}</h5>
                      <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                        {cp.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>{cp.responsiblePartyName}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(cp.dueDate)}
                        </span>
                      </div>
                      {cp.notes && cp.status === 'pending' && (
                        <p className="text-xs text-amber-400 mt-2">{cp.notes}</p>
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
        <div className="text-center py-8 text-slate-400">
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
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <p className="text-xs text-slate-500 font-mono mb-1">
                {selectedCondition.sectionReference}
              </p>
              <p className="text-white font-medium">{selectedCondition.title}</p>
              <p className="text-sm text-slate-400 mt-1">{selectedCondition.description}</p>
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
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Approved By
              </label>
              <input
                type="text"
                value={waiveApprovedBy}
                onChange={(e) => setWaiveApprovedBy(e.target.value)}
                placeholder="Name of approver (optional)"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-400">
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
