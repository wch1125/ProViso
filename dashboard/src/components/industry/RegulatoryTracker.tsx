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
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'submitted':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'denied':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-emerald-400 bg-emerald-500/10';
      case 'submitted':
        return 'text-blue-400 bg-blue-500/10';
      case 'pending':
        return 'text-amber-400 bg-amber-500/10';
      case 'denied':
        return 'text-red-400 bg-red-500/10';
      default:
        return 'text-gray-400 bg-gray-500/10';
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
            <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${(stats.approved / stats.total) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-emerald-400">
              {Math.round((stats.approved / stats.total) * 100)}%
            </span>
          </div>
        }
      />
      <CardBody>
        {/* Stats summary */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-emerald-500/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-emerald-400">{stats.approved}</p>
            <p className="text-xs text-gray-400">Approved</p>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-blue-400">{stats.submitted}</p>
            <p className="text-xs text-gray-400">Submitted</p>
          </div>
          <div className="bg-amber-500/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-amber-400">{stats.pending}</p>
            <p className="text-xs text-gray-400">Pending</p>
          </div>
          <div className="bg-red-500/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-red-400">{stats.denied}</p>
            <p className="text-xs text-gray-400">Denied</p>
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
                  approved === total ? 'bg-emerald-500/10' : 'bg-slate-800'
                }`}
              >
                <p className="text-gray-400 capitalize">{phase}</p>
                <p className={`font-medium ${approved === total ? 'text-emerald-400' : 'text-white'}`}>
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
              <div key={agency} className="border border-slate-800 rounded-lg overflow-hidden">
                {/* Agency header */}
                <button
                  onClick={() => setExpandedAgency(isExpanded ? null : agency)}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">{agency}</p>
                      <p className="text-xs text-gray-400">{reqs.length} permit{reqs.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            completion === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        completion === 100 ? 'text-emerald-400' : 'text-gray-400'
                      }`}>
                        {completion}%
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded permits */}
                {isExpanded && (
                  <div className="border-t border-slate-800 divide-y divide-slate-800">
                    {reqs.map((req) => (
                      <div key={req.name} className="p-3 bg-slate-900/50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2">
                            {getStatusIcon(req.status)}
                            <div>
                              <p className="text-sm font-medium text-white">{req.name}</p>
                              <p className="text-xs text-gray-400">{req.type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(req.status)}`}>
                              {req.status}
                            </span>
                            {req.approvalDate && (
                              <p className="text-xs text-gray-500 mt-1">{formatDate(req.approvalDate)}</p>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-gray-500">Required for:</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-gray-300">
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
