/**
 * ReadinessMeter Component — v2.4 Design System
 *
 * Displays overall closing readiness with a progress bar and KPI stat cards.
 * Uses navy/gold palette with semantic status colors.
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

  const getProgressColor = () => {
    if (readinessPercentage >= 90) return 'bg-success';
    if (readinessPercentage >= 70) return 'bg-warning';
    return 'bg-danger';
  };

  const getDaysColor = () => {
    if (daysUntilClosing < 0) return 'text-danger';
    if (daysUntilClosing <= 3) return 'text-warning';
    if (daysUntilClosing <= 7) return 'text-warning';
    return 'text-text-primary';
  };

  return (
    <div className="space-y-6">
      {/* Main Progress Bar */}
      <div className="bg-surface-1 border border-border-DEFAULT rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-xl font-semibold text-text-primary">Closing Readiness</h3>
          <span className="text-2xl font-bold text-text-primary tabular-nums">{readinessPercentage}%</span>
        </div>
        <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} rounded-full transition-all duration-500`}
            style={{ width: `${readinessPercentage}%` }}
          />
        </div>
        <div className="mt-3 text-[13px] text-text-tertiary">
          Target: {targetDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Conditions Card */}
        <div className="bg-surface-1 border border-border-DEFAULT rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <FileCheck className="w-5 h-5 text-success" />
            </div>
            <span className="text-[13px] text-text-tertiary">Conditions</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[28px] font-bold text-text-primary tabular-nums">{conditionsDone}</span>
            <span className="text-text-tertiary">/ {conditions.total}</span>
          </div>
          {conditions.overdue > 0 && (
            <div className="mt-1.5 text-xs text-danger">
              {conditions.overdue} overdue
            </div>
          )}
        </div>

        {/* Documents Card */}
        <div className="bg-surface-1 border border-border-DEFAULT rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-info/10 rounded-lg">
              <FileText className="w-5 h-5 text-info" />
            </div>
            <span className="text-[13px] text-text-tertiary">Documents</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[28px] font-bold text-text-primary tabular-nums">{documentsDone}</span>
            <span className="text-text-tertiary">/ {documents.total}</span>
          </div>
          {documents.pending > 0 && (
            <div className="mt-1.5 text-xs text-warning">
              {documents.pending} pending
            </div>
          )}
        </div>

        {/* Signatures Card */}
        <div className="bg-surface-1 border border-border-DEFAULT rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gold-500/10 rounded-lg">
              <PenTool className="w-5 h-5 text-gold-500" />
            </div>
            <span className="text-[13px] text-text-tertiary">Signatures</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[28px] font-bold text-text-primary tabular-nums">{signaturesDone}</span>
            <span className="text-text-tertiary">/ {signatures.total}</span>
          </div>
          {signatures.requested > 0 && (
            <div className="mt-1.5 text-xs text-warning">
              {signatures.requested} requested
            </div>
          )}
        </div>

        {/* Days Left Card */}
        <div className="bg-surface-1 border border-border-DEFAULT rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Calendar className="w-5 h-5 text-warning" />
            </div>
            <span className="text-[13px] text-text-tertiary">Days Left</span>
          </div>
          <div className={`text-[28px] font-bold tabular-nums ${getDaysColor()}`}>
            {daysUntilClosing < 0 ? (
              <span>Overdue by {Math.abs(daysUntilClosing)}</span>
            ) : (
              daysUntilClosing
            )}
          </div>
          {daysUntilClosing <= 7 && daysUntilClosing >= 0 && (
            <div className="mt-1.5 text-xs text-warning">
              Closing soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReadinessMeter;
