/**
 * Activity Feed Component
 *
 * Shows recent system activity with timestamps, icons, and contextual information.
 * Can be used as a sidebar panel or embedded within dashboards.
 */

import { useState } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Calculator,
  BarChart3,
  PenLine,
  Send,
  Stamp,
  ChevronDown,
  ChevronRight,
  Clock,
  X,
} from 'lucide-react';
import type { Activity, ActivityType } from '../context/DealContext';

// =============================================================================
// ICON MAPPING
// =============================================================================

const activityIcons: Record<ActivityType, React.ReactNode> = {
  deal_created: <FileText className="w-4 h-4" />,
  deal_updated: <PenLine className="w-4 h-4" />,
  version_created: <FileText className="w-4 h-4" />,
  version_sent: <Send className="w-4 h-4" />,
  condition_satisfied: <CheckCircle2 className="w-4 h-4" />,
  condition_waived: <Stamp className="w-4 h-4" />,
  document_uploaded: <Upload className="w-4 h-4" />,
  signature_received: <PenLine className="w-4 h-4" />,
  financial_updated: <BarChart3 className="w-4 h-4" />,
  simulation_run: <Calculator className="w-4 h-4" />,
  file_loaded: <Upload className="w-4 h-4" />,
  covenant_alert: <AlertTriangle className="w-4 h-4" />,
};

const activityColors: Record<ActivityType, string> = {
  deal_created: 'bg-success/10 text-success',
  deal_updated: 'bg-gold-500/10 text-gold-500',
  version_created: 'bg-gold-500/10 text-gold-500',
  version_sent: 'bg-gold-500/10 text-gold-500',
  condition_satisfied: 'bg-success/10 text-success',
  condition_waived: 'bg-warning/10 text-warning',
  document_uploaded: 'bg-gold-500/10 text-gold-500',
  signature_received: 'bg-success/10 text-success',
  financial_updated: 'bg-gold-500/10 text-gold-500',
  simulation_run: 'bg-purple-500/10 text-purple-400',
  file_loaded: 'bg-gold-500/10 text-gold-500',
  covenant_alert: 'bg-danger/10 text-danger',
};

// =============================================================================
// TIME FORMATTING
// =============================================================================

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// =============================================================================
// ACTIVITY ITEM
// =============================================================================

interface ActivityItemProps {
  activity: Activity;
}

function ActivityItem({ activity }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border-DEFAULT last:border-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${activityColors[activity.type]}`}>
        {activityIcons[activity.type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-text-primary truncate">
            {activity.title}
          </p>
          <span className="text-xs text-text-muted flex-shrink-0">
            {formatRelativeTime(activity.timestamp)}
          </span>
        </div>
        {activity.description && (
          <p className="text-sm text-text-tertiary truncate mt-0.5">
            {activity.description}
          </p>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
  maxItems?: number;
  showEmpty?: boolean;
  onClear?: () => void;
  className?: string;
}

export function ActivityFeed({
  activities,
  title = 'Recent Activity',
  maxItems = 10,
  showEmpty = true,
  onClear,
  className = '',
}: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems);
  const hasMore = activities.length > maxItems;

  if (!showEmpty && activities.length === 0) {
    return null;
  }

  return (
    <div className={`bg-surface-1 border border-border-DEFAULT rounded-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-DEFAULT">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-text-tertiary" />
          <h3 className="text-sm font-medium text-text-primary">{title}</h3>
          {activities.length > 0 && (
            <span className="text-xs text-text-muted">
              ({activities.length})
            </span>
          )}
        </div>
        {onClear && activities.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Activity List */}
      <div className="px-4">
        {activities.length === 0 ? (
          <div className="py-8 text-center">
            <Clock className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-muted">No recent activity</p>
          </div>
        ) : (
          <>
            {displayedActivities.map(activity => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
            {hasMore && (
              <div className="py-3 text-center">
                <span className="text-xs text-text-muted">
                  +{activities.length - maxItems} more
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// COLLAPSIBLE VARIANT
// =============================================================================

interface CollapsibleActivityFeedProps extends ActivityFeedProps {
  defaultExpanded?: boolean;
}

export function CollapsibleActivityFeed({
  defaultExpanded = false,
  ...props
}: CollapsibleActivityFeedProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`bg-surface-1 border border-border-DEFAULT rounded-xl ${props.className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-3/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-text-tertiary" />
          <span className="text-sm font-medium text-text-primary">{props.title ?? 'Recent Activity'}</span>
          {props.activities.length > 0 && (
            <span className="text-xs text-text-muted bg-surface-3 px-1.5 py-0.5 rounded">
              {props.activities.length}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-text-tertiary" />
        ) : (
          <ChevronRight className="w-4 h-4 text-text-tertiary" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-border-DEFAULT">
          <div className="px-4">
            {props.activities.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-text-muted">No recent activity</p>
              </div>
            ) : (
              props.activities.slice(0, props.maxItems ?? 10).map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// SLIDE-OUT PANEL
// =============================================================================

interface ActivityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activities: Activity[];
  onClear?: () => void;
}

export function ActivityPanel({ isOpen, onClose, activities, onClear }: ActivityPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-surface-0 border-l border-surface-2 z-50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border-DEFAULT">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-text-tertiary" />
            <h2 className="text-lg font-semibold text-text-primary">Activity Feed</h2>
          </div>
          <div className="flex items-center gap-2">
            {onClear && activities.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-text-tertiary hover:text-text-primary px-2 py-1 rounded hover:bg-surface-2 transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Activity List */}
        <div className="overflow-y-auto h-[calc(100vh-65px)]">
          {activities.length === 0 ? (
            <div className="py-16 text-center">
              <Clock className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-text-muted">No recent activity</p>
              <p className="text-sm text-text-muted mt-1">
                Actions you take will appear here
              </p>
            </div>
          ) : (
            <div className="px-4">
              {activities.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ActivityFeed;
