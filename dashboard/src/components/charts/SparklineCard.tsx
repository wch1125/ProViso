/**
 * SparklineCard - KPI card with embedded trend sparkline
 *
 * Combines a key metric value with a sparkline visualization
 * for compact trend display in dashboard summaries.
 */
import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Sparkline } from './Sparkline';

export interface SparklineCardProps {
  /** Label for the metric */
  label: string;
  /** Current value (formatted string) */
  value: string;
  /** Trend data for sparkline */
  data: number[];
  /** Sparkline height (default: 32) */
  sparklineHeight?: number;
  /** Sparkline color */
  color?: string;
  /** Threshold line for sparkline */
  threshold?: number;
  /** Change from previous period (for trend indicator) */
  change?: number;
  /** Change display format ('percent' | 'absolute') */
  changeFormat?: 'percent' | 'absolute';
  /** Whether higher values are better (affects trend color) */
  higherIsBetter?: boolean;
  /** Optional icon */
  icon?: ReactNode;
  /** Optional tooltip text */
  tooltip?: string;
  /** Additional class names */
  className?: string;
}

export function SparklineCard({
  label,
  value,
  data,
  sparklineHeight = 32,
  color,
  threshold,
  change,
  changeFormat = 'percent',
  higherIsBetter = true,
  icon,
  tooltip,
  className = '',
}: SparklineCardProps) {
  // Determine trend direction and color
  const getTrendInfo = () => {
    if (change === undefined || change === 0) {
      return {
        Icon: Minus,
        color: 'text-text-tertiary',
        label: 'No change',
      };
    }

    const isPositive = change > 0;
    const isGood = higherIsBetter ? isPositive : !isPositive;

    return {
      Icon: isPositive ? TrendingUp : TrendingDown,
      color: isGood ? 'text-success' : 'text-danger',
      label: isPositive ? 'Increasing' : 'Decreasing',
    };
  };

  const trend = getTrendInfo();
  const TrendIcon = trend.Icon;

  // Format the change value
  const formatChange = () => {
    if (change === undefined) return null;
    const sign = change >= 0 ? '+' : '';
    if (changeFormat === 'percent') {
      return `${sign}${change.toFixed(1)}%`;
    }
    return `${sign}${change.toFixed(2)}`;
  };

  // Determine sparkline color based on trend if not specified
  const sparklineColor = color || (change !== undefined
    ? (change >= 0
      ? (higherIsBetter ? '#10b981' : '#ef4444')
      : (higherIsBetter ? '#ef4444' : '#10b981'))
    : 'var(--industry-primary)');

  return (
    <div className={`p-4 ${className}`} title={tooltip}>
      {/* Label row */}
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-industry-textMuted">{icon}</span>}
        <span className="text-sm text-industry-textMuted">{label}</span>
      </div>

      {/* Value and sparkline row */}
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-industry-textPrimary tabular-nums">
            {value}
          </span>
          {change !== undefined && (
            <span className={`flex items-center gap-0.5 text-xs ${trend.color}`}>
              <TrendIcon className="w-3 h-3" />
              {formatChange()}
            </span>
          )}
        </div>

        {/* Sparkline */}
        {data.length > 1 && (
          <Sparkline
            data={data}
            height={sparklineHeight}
            width={80}
            color={sparklineColor}
            threshold={threshold}
            className="flex-shrink-0"
          />
        )}
      </div>
    </div>
  );
}

export default SparklineCard;
