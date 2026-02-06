import { CheckCircle2, Clock, AlertTriangle, XCircle, Circle } from 'lucide-react';
import { Card, CardHeader, CardBody } from './Card';
import { StatusBadge } from './StatusBadge';
import type { MilestoneData } from '../types';

interface MilestoneTrackerProps {
  milestones: MilestoneData[];
}

export function MilestoneTracker({ milestones }: MilestoneTrackerProps) {
  const achieved = milestones.filter(m => m.status === 'achieved').length;
  const atRisk = milestones.filter(m => m.status === 'at_risk' || m.status === 'breached').length;

  return (
    <Card>
      <CardHeader
        title="Construction Milestones"
        subtitle={`${achieved}/${milestones.length} completed`}
        action={
          atRisk > 0 && (
            <StatusBadge status="warning" label={`${atRisk} at risk`} />
          )
        }
      />
      <CardBody className="p-0">
        <div className="divide-y divide-border-DEFAULT">
          {milestones.map((milestone, index) => (
            <MilestoneRow
              key={milestone.name}
              milestone={milestone}
              isLast={index === milestones.length - 1}
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

interface MilestoneRowProps {
  milestone: MilestoneData;
  isLast: boolean;
}

function MilestoneRow({ milestone }: MilestoneRowProps) {
  const { name, target, longstop, status, achievedDate, percentComplete } = milestone;

  const getStatusIcon = () => {
    switch (status) {
      case 'achieved':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-gold-500 animate-pulse" />;
      case 'at_risk':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'breached':
        return <XCircle className="w-5 h-5 text-danger" />;
      default:
        return <Circle className="w-5 h-5 text-text-muted" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'achieved':
        return <StatusBadge status="achieved" label="Achieved" />;
      case 'in_progress':
        return <StatusBadge status="pending" label="In Progress" />;
      case 'at_risk':
        return <StatusBadge status="warning" label="At Risk" />;
      case 'breached':
        return <StatusBadge status="breach" label="Breached" />;
      default:
        return <StatusBadge status="pending" label="Pending" />;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntil = (dateStr: string) => {
    const target = new Date(dateStr);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysToTarget = getDaysUntil(target);
  const daysToLongstop = getDaysUntil(longstop);

  // Format milestone name for display
  const displayName = name.replace(/([A-Z])/g, ' $1').trim();

  return (
    <div className="px-5 py-4">
      <div className="flex items-start gap-4">
        {/* Status Icon */}
        <div className="mt-0.5">{getStatusIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-medium text-text-primary">{displayName}</h3>
              {status === 'achieved' && achievedDate && (
                <p className="text-xs text-success mt-0.5">
                  Completed {formatDate(achievedDate)}
                </p>
              )}
            </div>
            {getStatusBadge()}
          </div>

          {/* Progress bar for in-progress milestones */}
          {status === 'in_progress' && percentComplete !== undefined && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-text-muted">Progress</span>
                <span className="text-xs font-medium text-gold-500">{percentComplete}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill bg-gradient-to-r from-gold-600 to-gold-400"
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
            </div>
          )}

          {/* Dates for non-achieved milestones */}
          {status !== 'achieved' && (
            <div className="flex items-center gap-4 mt-2 text-xs">
              <div>
                <span className="text-gray-500">Target: </span>
                <span className={`font-medium ${
                  daysToTarget < 0
                    ? 'text-warning'
                    : daysToTarget < 14
                    ? 'text-warning/80'
                    : 'text-text-secondary'
                }`}>
                  {formatDate(target)}
                  <span className="text-text-muted ml-1">
                  ({daysToTarget > 0 ? `${daysToTarget}d` : `${Math.abs(daysToTarget)}d past`})
                </span>
                </span>
              </div>
              <div>
                <span className="text-gray-500">Longstop: </span>
                <span className={`font-medium ${
                  daysToLongstop < 0
                    ? 'text-danger'
                    : daysToLongstop < 30
                    ? 'text-warning/80'
                    : 'text-text-tertiary'
                }`}>
                  {formatDate(longstop)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
