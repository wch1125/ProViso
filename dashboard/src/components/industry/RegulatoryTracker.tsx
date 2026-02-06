/**
 * RegulatoryTracker - Permit and Regulatory Requirement Status
 *
 * Shows permits grouped by agency with approval status and timeline.
 */
import { useState } from 'react';
import { Building2, CheckCircle2, Clock, AlertCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../Card';
import type { RegulatoryRequirementData } from '../../types';

interface RegulatoryTrackerProps {
  requirements: RegulatoryRequirementData[];
  title?: string;
}

export function RegulatoryTracker({ requirements, title = "Regulatory Status" }: RegulatoryTrackerProps) {
  const [expandedAgency, setExpandedAgency] = useState<string | null>(null);

  // Group requirements by agency
  const byAgency = requirements.reduce<Record<string, RegulatoryRequirementData[]>>((acc, req) => {
    if (!acc[req.agency]) {
      acc[req.agency] = [];
    }
    acc[req.agency].push(req);
    return acc;
  }, {});

  // Calculate stats
  const stats = {
    total: requirements.length,
    approved: requirements.filter((r) => r.status === 'approved').length,
    pending: requirements.filter((r) => r.status === 'pending').length,
    submitted: requirements.filter((r) => r.status === 'submitted').length,
    denied: requirements.filter((r) => r.status === 'denied').length,
  };

  // Group by phase
  const byPhase = {
    development: requirements.filter((r) => r.requiredFor === 'Development'),
    construction: requirements.filter((r) => r.requiredFor === 'Construction'),
    operations: requirements.filter((r) => r.requiredFor === 'Operations'),
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'submitted':
        return <Clock className="w-4 h-4 text-info" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case 'denied':
        return <XCircle className="w-4 h-4 text-danger" />;
      default:
        return <Clock className="w-4 h-4 text-text-tertiary" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-success bg-success/10';
      case 'submitted':
        return 'text-info bg-info/10';
      case 'pending':
        return 'text-warning bg-warning/10';
      case 'denied':
        return 'text-danger bg-danger/10';
      default:
        return 'text-text-tertiary bg-gray-500/10';
    }
  };

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calculate agency completion
  const getAgencyCompletion = (reqs: RegulatoryRequirementData[]) => {
    const approved = reqs.filter((r) => r.status === 'approved').length;
    return Math.round((approved / reqs.length) * 100);
  };

  return (
    <Card>
      <CardHeader
        title={title}
        subtitle={`${stats.approved}/${stats.total} permits approved`}
        action={
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-surface-3 rounded-full overflow-hidden">
              <div
                className="h-full bg-success transition-all"
                style={{ width: `${(stats.approved / stats.total) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-success">
              {Math.round((stats.approved / stats.total) * 100)}%
            </span>
          </div>
        }
      />
      <CardBody>
        {/* Stats summary */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-success/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-success">{stats.approved}</p>
            <p className="text-xs text-text-tertiary">Approved</p>
          </div>
          <div className="bg-info/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-info">{stats.submitted}</p>
            <p className="text-xs text-text-tertiary">Submitted</p>
          </div>
          <div className="bg-warning/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-warning">{stats.pending}</p>
            <p className="text-xs text-text-tertiary">Pending</p>
          </div>
          <div className="bg-danger/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-danger">{stats.denied}</p>
            <p className="text-xs text-text-tertiary">Denied</p>
          </div>
        </div>

        {/* Phase breakdown */}
        <div className="flex gap-2 mb-4 text-xs">
          {Object.entries(byPhase).map(([phase, reqs]) => {
            const approved = reqs.filter((r) => r.status === 'approved').length;
            const total = reqs.length;
            return (
              <div
                key={phase}
                className={`flex-1 px-2 py-1.5 rounded-lg ${
                  approved === total ? 'bg-success/10' : 'bg-surface-2'
                }`}
              >
                <p className="text-text-tertiary capitalize">{phase}</p>
                <p className={`font-medium ${approved === total ? 'text-success' : 'text-text-primary'}`}>
                  {approved}/{total}
                </p>
              </div>
            );
          })}
        </div>

        {/* Agency breakdown */}
        <div className="space-y-2">
          {Object.entries(byAgency).map(([agency, reqs]) => {
            const isExpanded = expandedAgency === agency;
            const completion = getAgencyCompletion(reqs);

            return (
              <div key={agency} className="border border-border-DEFAULT rounded-lg overflow-hidden">
                {/* Agency header */}
                <button
                  onClick={() => setExpandedAgency(isExpanded ? null : agency)}
                  className="w-full flex items-center justify-between p-3 hover:bg-surface-2/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-text-tertiary" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-text-primary">{agency}</p>
                      <p className="text-xs text-text-tertiary">{reqs.length} permit{reqs.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            completion === 100 ? 'bg-success' : 'bg-info'
                          }`}
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        completion === 100 ? 'text-success' : 'text-text-tertiary'
                      }`}>
                        {completion}%
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-text-tertiary" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-text-tertiary" />
                    )}
                  </div>
                </button>

                {/* Expanded permits */}
                {isExpanded && (
                  <div className="border-t border-border-DEFAULT divide-y divide-border-DEFAULT">
                    {reqs.map((req) => (
                      <div key={req.name} className="p-3 bg-surface-0/50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2">
                            {getStatusIcon(req.status)}
                            <div>
                              <p className="text-sm font-medium text-text-primary">{req.name}</p>
                              <p className="text-xs text-text-tertiary">{req.type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(req.status)}`}>
                              {req.status}
                            </span>
                            {req.approvalDate && (
                              <p className="text-xs text-text-muted mt-1">{formatDate(req.approvalDate)}</p>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-text-muted">Required for:</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-surface-2 text-text-secondary">
                            {req.requiredFor}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
