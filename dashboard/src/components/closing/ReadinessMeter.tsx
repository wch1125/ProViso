/**
 * ReadinessMeter Component — v2.5 Closing Dashboard Redesign
 *
 * Displays weighted closing readiness with a stacked progress bar segmented
 * by document layer. Each segment is clickable to filter the CP checklist.
 * KPI stat cards show conditions, documents, signatures, and days left.
 */

import { useState } from 'react';
import { FileCheck, FileText, PenTool, Calendar } from 'lucide-react';
import type { LayerStats } from '../../utils/documentLayers';

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
  /** New: layer stats for stacked bar */
  layerStats?: LayerStats[];
  /** New: weighted percentage (replaces flat readinessPercentage when present) */
  weightedReadinessPercentage?: number;
  /** New: number of gating (overdue) items */
  gatingCount?: number;
  /** New: currently active layer filter */
  activeLayerFilter?: string | null;
  /** New: callback when a bar segment is clicked */
  onLayerClick?: (layerId: string | null) => void;
}

export function ReadinessMeter({
  readinessPercentage,
  conditions,
  documents,
  signatures,
  daysUntilClosing,
  targetDate,
  layerStats,
  weightedReadinessPercentage,
  gatingCount,
  activeLayerFilter,
  onLayerClick,
}: ReadinessMeterProps) {
  const conditionsDone = conditions.satisfied + conditions.waived;
  const documentsDone = documents.uploaded;
  const signaturesDone = signatures.signed;

  // Use weighted readiness when available, else fall back
  const displayPercentage = weightedReadinessPercentage ?? readinessPercentage;
  const hasLayers = layerStats && layerStats.length > 0;

  // Tooltip state for segment hover
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null);

  const getDaysColor = () => {
    if (daysUntilClosing < 0) return 'text-danger';
    if (daysUntilClosing <= 7) return 'text-warning';
    return 'text-text-primary';
  };

  return (
    <div className="space-y-6">
      {/* Main Progress Bar */}
      <div className="bg-surface-1 border border-border-DEFAULT rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-xl font-semibold text-text-primary">Ready to Close</h3>
          <span className="text-2xl font-bold text-text-primary tabular-nums">{displayPercentage}%</span>
        </div>

        {/* Stacked progress bar (if layers available) or fallback to single bar */}
        {hasLayers ? (
          <div className="relative">
            <div className="h-3 bg-surface-2 rounded-full overflow-hidden flex">
              {layerStats.map((ls) => (
                <div
                  key={ls.layer.id}
                  className={`relative h-full transition-opacity duration-200 ${
                    activeLayerFilter && activeLayerFilter !== ls.layer.id ? 'opacity-40' : ''
                  }`}
                  style={{ width: `${ls.layer.weight}%` }}
                  onClick={() => onLayerClick?.(activeLayerFilter === ls.layer.id ? null : ls.layer.id)}
                  onMouseEnter={() => setHoveredLayer(ls.layer.id)}
                  onMouseLeave={() => setHoveredLayer(null)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onLayerClick?.(activeLayerFilter === ls.layer.id ? null : ls.layer.id);
                    }
                  }}
                  aria-label={`${ls.layer.name}: ${ls.completed}/${ls.total} complete`}
                >
                  {/* Filled portion within this segment */}
                  <div
                    className={`h-full ${ls.layer.color} transition-all duration-500`}
                    style={{ width: `${ls.completionPct}%` }}
                  />
                  {/* Segment border (thin right divider except last) */}
                  <div className="absolute right-0 top-0 h-full w-px bg-surface-1/60" />

                  {/* Tooltip on hover */}
                  {hoveredLayer === ls.layer.id && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none">
                      <div className="bg-navy-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                        <div className="font-semibold">{ls.layer.name}</div>
                        <div className="text-white/70 mt-0.5">
                          {ls.completed}/{ls.total} conditions ({ls.completionPct}%)
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Legend row */}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              {layerStats.map((ls) => (
                <button
                  key={ls.layer.id}
                  className={`flex items-center gap-1.5 text-[13px] transition-opacity ${
                    activeLayerFilter && activeLayerFilter !== ls.layer.id
                      ? 'opacity-40'
                      : 'text-text-tertiary'
                  }`}
                  onClick={() => onLayerClick?.(activeLayerFilter === ls.layer.id ? null : ls.layer.id)}
                >
                  <span className={`w-2 h-2 rounded-full ${ls.layer.color} flex-shrink-0`} />
                  <span>{ls.layer.name}</span>
                  <span className="tabular-nums">{ls.completed}/{ls.total}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Fallback: single progress bar */
          <div className="h-3 bg-surface-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${displayPercentage >= 90 ? 'bg-success' : displayPercentage >= 70 ? 'bg-warning' : 'bg-danger'} rounded-full transition-all duration-500`}
              style={{ width: `${displayPercentage}%` }}
            />
          </div>
        )}

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
          {(gatingCount ?? 0) > 0 && (
            <div className="mt-1.5 text-xs text-danger">
              {gatingCount} gating item{gatingCount !== 1 ? 's' : ''} remain
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReadinessMeter;
