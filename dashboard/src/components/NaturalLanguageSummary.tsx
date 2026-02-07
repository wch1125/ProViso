/**
 * Natural Language Summary Component
 *
 * Displays human-readable explanations for credit agreement elements.
 * Shows status, headroom, and next test dates in plain English.
 */

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

// =============================================================================
// STATUS HIGHLIGHT COMPONENT
// =============================================================================

type StatusType = 'compliant' | 'breach' | 'cured' | 'suspended' | 'at_risk' | 'achieved' | 'pending';

const statusColors: Record<StatusType, string> = {
  compliant: 'text-success font-semibold',
  breach: 'text-danger font-semibold',
  cured: 'text-warning font-semibold',
  suspended: 'text-gray-400 font-semibold',
  at_risk: 'text-warning font-semibold',
  achieved: 'text-success font-semibold',
  pending: 'text-gray-400 font-semibold',
};

/**
 * Highlights status keywords with appropriate colors
 */
function highlightStatus(text: string): React.ReactNode {
  // Pattern to match status keywords
  const pattern = /(COMPLIANT|BREACH|BREACHED|CURED|SUSPENDED|AT RISK|ACHIEVED|FULLY UTILIZED|FULLY FUNDED|BELOW MINIMUM|ON TRACK|PENDING)/gi;

  const parts = text.split(pattern);

  return parts.map((part, i) => {
    const upperPart = part.toUpperCase();
    let status: StatusType | null = null;

    if (upperPart === 'COMPLIANT' || upperPart === 'FULLY FUNDED' || upperPart === 'ACHIEVED' || upperPart === 'ON TRACK') {
      status = 'compliant';
    } else if (upperPart === 'BREACH' || upperPart === 'BREACHED' || upperPart === 'FULLY UTILIZED' || upperPart === 'BELOW MINIMUM') {
      status = 'breach';
    } else if (upperPart === 'CURED') {
      status = 'cured';
    } else if (upperPart === 'SUSPENDED') {
      status = 'suspended';
    } else if (upperPart === 'AT RISK') {
      status = 'at_risk';
    } else if (upperPart === 'PENDING') {
      status = 'pending';
    }

    if (status) {
      return (
        <span key={i} className={statusColors[status]}>
          {part}
        </span>
      );
    }

    return part;
  });
}

// =============================================================================
// NARRATIVE TEXT COMPONENT
// =============================================================================

interface NarrativeTextProps {
  summary: string;
  detail?: string;
  className?: string;
}

export function NarrativeText({ summary, detail, className = '' }: NarrativeTextProps) {
  return (
    <div className={`text-sm ${className}`}>
      <p className="text-gray-300">{highlightStatus(summary)}</p>
      {detail && (
        <p className="text-gray-500 mt-0.5">{highlightStatus(detail)}</p>
      )}
    </div>
  );
}

// =============================================================================
// COLLAPSIBLE NARRATIVE COMPONENT
// =============================================================================

interface CollapsibleNarrativeProps {
  summary: string;
  detail?: string;
  defaultExpanded?: boolean;
  className?: string;
}

export function CollapsibleNarrative({
  summary,
  detail,
  defaultExpanded = false,
  className = '',
}: CollapsibleNarrativeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!detail) {
    return <NarrativeText summary={summary} className={className} />;
  }

  return (
    <div className={`text-sm ${className}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-start gap-1 text-left w-full group"
      >
        <span className="text-gray-300 flex-1">{highlightStatus(summary)}</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5 group-hover:text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5 group-hover:text-gray-400" />
        )}
      </button>
      {expanded && (
        <p className="text-gray-500 mt-1 pl-0">{highlightStatus(detail)}</p>
      )}
    </div>
  );
}

// =============================================================================
// COVENANT SUMMARY COMPONENT
// =============================================================================

interface CovenantSummaryProps {
  name: string;
  actual: number;
  threshold: number;
  operator: string;
  compliant: boolean;
  headroom?: number;
  suspended?: boolean;
  className?: string;
}

export function CovenantSummary({
  name,
  actual,
  threshold,
  operator,
  compliant,
  headroom,
  suspended,
  className = '',
}: CovenantSummaryProps) {
  const formatValue = (v: number) => (v > 10 ? v.toFixed(1) : `${v.toFixed(2)}x`);
  const displayName = name.replace(/([A-Z])/g, ' $1').trim();

  if (suspended) {
    return (
      <NarrativeText
        summary={`${displayName} is SUSPENDED during current phase.`}
        className={className}
      />
    );
  }

  if (compliant) {
    const headroomText = headroom !== undefined
      ? ` ${formatValue(Math.abs(headroom))} headroom.`
      : '';

    return (
      <NarrativeText
        summary={`${displayName} is COMPLIANT at ${formatValue(actual)} (${operator} ${formatValue(threshold)}).${headroomText}`}
        className={className}
      />
    );
  }

  return (
    <NarrativeText
      summary={`${displayName} is in BREACH at ${formatValue(actual)} (${operator} ${formatValue(threshold)}).`}
      className={className}
    />
  );
}

// =============================================================================
// BASKET SUMMARY COMPONENT
// =============================================================================

interface BasketSummaryProps {
  name: string;
  used: number;
  capacity: number;
  className?: string;
}

export function BasketSummary({
  name,
  used,
  capacity,
  className = '',
}: BasketSummaryProps) {
  const formatCurrency = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
  };

  const available = capacity - used;
  const utilization = capacity > 0 ? (used / capacity) * 100 : 100;
  const displayName = name.replace(/([A-Z])/g, ' $1').trim();

  if (available <= 0) {
    return (
      <NarrativeText
        summary={`${displayName} is FULLY UTILIZED. No remaining capacity.`}
        className={className}
      />
    );
  }

  return (
    <NarrativeText
      summary={`${displayName}: ${formatCurrency(available)} available of ${formatCurrency(capacity)} (${utilization.toFixed(0)}% used).`}
      className={className}
    />
  );
}

// =============================================================================
// MILESTONE SUMMARY COMPONENT
// =============================================================================

interface MilestoneSummaryProps {
  name: string;
  status: string;
  targetDate?: string;
  daysRemaining?: number;
  className?: string;
}

export function MilestoneSummary({
  name,
  status,
  targetDate,
  daysRemaining,
  className = '',
}: MilestoneSummaryProps) {
  const displayName = name.replace(/([A-Z])/g, ' $1').trim();

  if (status === 'achieved') {
    return (
      <NarrativeText
        summary={`${displayName} ACHIEVED.`}
        className={className}
      />
    );
  }

  if (status === 'breached') {
    return (
      <NarrativeText
        summary={`${displayName} has BREACHED longstop date.`}
        className={className}
      />
    );
  }

  if (status === 'at_risk') {
    return (
      <NarrativeText
        summary={`${displayName} is AT RISK. Target date missed.`}
        className={className}
      />
    );
  }

  // On track or pending
  const daysText = daysRemaining !== undefined
    ? `. ${daysRemaining} days until target.`
    : targetDate
    ? `. Target: ${new Date(targetDate).toLocaleDateString()}.`
    : '.';

  return (
    <NarrativeText
      summary={`${displayName} is ON TRACK${daysText}`}
      className={className}
    />
  );
}

// =============================================================================
// GENERIC SUMMARY WITH ICON
// =============================================================================

interface SummaryWithIconProps {
  icon?: React.ReactNode;
  summary: string;
  detail?: string;
  status?: 'success' | 'warning' | 'error' | 'info' | 'muted';
  className?: string;
}

const statusBgColors: Record<string, string> = {
  success: 'bg-success/10 border-success/20',
  warning: 'bg-warning/10 border-warning/20',
  error: 'bg-danger/10 border-danger/20',
  info: 'bg-info/10 border-info/20',
  muted: 'bg-text-muted/10 border-text-muted/20',
};

export function SummaryWithIcon({
  icon,
  summary,
  detail,
  status = 'info',
  className = '',
}: SummaryWithIconProps) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border ${statusBgColors[status]} ${className}`}
    >
      {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200">{highlightStatus(summary)}</p>
        {detail && (
          <p className="text-xs text-gray-400 mt-1">{highlightStatus(detail)}</p>
        )}
      </div>
    </div>
  );
}
