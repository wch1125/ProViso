/**
 * ReadinessMeter Component
 *
 * Displays overall closing readiness with a progress bar and KPI cards.
 */

import { FileCheck, FileText, PenTool, Calendar } from 'lucide-react';

interface ReadinessMeterProps {
  readinessPercentage: number;
  conditions: {
    total: number;
    satisfied: number;
    pending: number;
    waived: number;
    overdue: number;
  };
  documents: {
    total: number;
    uploaded: number;
    pending: number;
  };
  signatures: {
    total: number;
    signed: number;
    pending: number;
    requested: number;
  };
  daysUntilClosing: number;
  targetDate: Date;
}

export function ReadinessMeter({
  readinessPercentage,
  conditions,
  documents,
  signatures,
  daysUntilClosing,
  targetDate,
}: ReadinessMeterProps) {
  const conditionsDone = conditions.satisfied + conditions.waived;
  const documentsDone = documents.uploaded;
  const signaturesDone = signatures.signed;

  // Determine progress bar color
  const getProgressColor = () => {
    if (readinessPercentage >= 90) return 'bg-emerald-500';
    if (readinessPercentage >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Determine days color
  const getDaysColor = () => {
    if (daysUntilClosing < 0) return 'text-red-400';
    if (daysUntilClosing <= 3) return 'text-amber-400';
    if (daysUntilClosing <= 7) return 'text-amber-300';
    return 'text-white';
  };

  return (
    <div className="space-y-6">
      {/* Main Progress Bar */}
      <div className="bg-slate-800/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Closing Readiness</h3>
          <span className="text-2xl font-bold text-white">{readinessPercentage}%</span>
        </div>
        <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-500`}
            style={{ width: `${readinessPercentage}%` }}
          />
        </div>
        <div className="mt-2 text-sm text-slate-400">
          Target: {targetDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Conditions Card */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-teal-500/20 rounded-lg">
              <FileCheck className="w-5 h-5 text-teal-400" />
            </div>
            <span className="text-sm text-slate-400">Conditions</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{conditionsDone}</span>
            <span className="text-slate-400">/ {conditions.total}</span>
          </div>
          {conditions.overdue > 0 && (
            <div className="mt-1 text-xs text-red-400">
              {conditions.overdue} overdue
            </div>
          )}
        </div>

        {/* Documents Card */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm text-slate-400">Documents</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{documentsDone}</span>
            <span className="text-slate-400">/ {documents.total}</span>
          </div>
          {documents.pending > 0 && (
            <div className="mt-1 text-xs text-amber-400">
              {documents.pending} pending
            </div>
          )}
        </div>

        {/* Signatures Card */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <PenTool className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm text-slate-400">Signatures</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{signaturesDone}</span>
            <span className="text-slate-400">/ {signatures.total}</span>
          </div>
          {signatures.requested > 0 && (
            <div className="mt-1 text-xs text-amber-400">
              {signatures.requested} requested
            </div>
          )}
        </div>

        {/* Days Left Card */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Calendar className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-sm text-slate-400">Days Left</span>
          </div>
          <div className={`text-2xl font-bold ${getDaysColor()}`}>
            {daysUntilClosing < 0 ? (
              <span>Overdue by {Math.abs(daysUntilClosing)}</span>
            ) : (
              daysUntilClosing
            )}
          </div>
          {daysUntilClosing <= 7 && daysUntilClosing >= 0 && (
            <div className="mt-1 text-xs text-amber-400">
              Closing soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReadinessMeter;
