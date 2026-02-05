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
  deal_created: 'bg-emerald-500/10 text-emerald-400',
  deal_updated: 'bg-accent-500/10 text-accent-400',
  version_created: 'bg-accent-500/10 text-accent-400',
  version_sent: 'bg-accent-500/10 text-accent-400',
  condition_satisfied: 'bg-emerald-500/10 text-emerald-400',
  condition_waived: 'bg-amber-500/10 text-amber-400',
  document_uploaded: 'bg-accent-500/10 text-accent-400',
  signature_received: 'bg-emerald-500/10 text-emerald-400',
  financial_updated: 'bg-accent-500/10 text-accent-400',
  simulation_run: 'bg-purple-500/10 text-purple-400',
  file_loaded: 'bg-accent-500/10 text-accent-400',
  covenant_alert: 'bg-red-500/10 text-red-400',
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
    <div className="flex items-start gap-3 py-3 border-b border-slate-800 last:border-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${activityColors[activity.type]}`}>
        {activityIcons[activity.type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-white truncate">
            {activity.title}
          </p>
          <span className="text-xs text-slate-500 flex-shrink-0">
            {formatRelativeTime(activity.timestamp)}
          </span>
        </div>
        {activity.description && (
          <p className="text-sm text-slate-400 truncate mt-0.5">
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
    <div className={`bg-slate-800/50 border border-slate-700 rounded-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-medium text-white">{title}</h3>
          {activities.length > 0 && (
            <span className="text-xs text-slate-500">
              ({activities.length})
            </span>
          )}
        </div>
        {onClear && activities.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Activity List */}
      <div className="px-4">
        {activities.length === 0 ? (
          <div className="py-8 text-center">
            <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No recent activity</p>
          </div>
        ) : (
          <>
            {displayedActivities.map(activity => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
            {hasMore && (
              <div className="py-3 text-center">
                <span className="text-xs text-slate-500">
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
    <div className={`bg-slate-800/50 border border-slate-700 rounded-xl ${props.className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-white">{props.title ?? 'Recent Activity'}</span>
          {props.activities.length > 0 && (
            <span className="text-xs text-slate-500 bg-slate-700 px-1.5 py-0.5 rounded">
              {props.activities.length}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-slate-700">
          <div className="px-4">
            {props.activities.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-slate-500">No recent activity</p>
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
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-800 z-50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-white">Activity Feed</h2>
          </div>
          <div className="flex items-center gap-2">
            {onClear && activities.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
              <p className="text-slate-500">No recent activity</p>
              <p className="text-sm text-slate-600 mt-1">
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
