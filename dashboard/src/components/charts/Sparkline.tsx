/**
 * Sparkline - Minimal trend line visualization
 *
 * A compact chart for showing trends in KPI cards and inline data.
 * Uses Recharts with minimal chrome (no axes, legends, or labels).
 */
import { LineChart, Line, ResponsiveContainer, ReferenceLine } from 'recharts';

export interface SparklineProps {
  /** Array of numeric values to plot */
  data: number[];
  /** Height of the sparkline in pixels (default: 24) */
  height?: number;
  /** Width of the sparkline (default: 100%) */
  width?: number | string;
  /** Line color (default: currentColor) */
  color?: string;
  /** Optional threshold line to display */
  threshold?: number;
  /** Threshold line color (default: #ef4444 red) */
  thresholdColor?: string;
  /** Whether to show dots at data points */
  showDots?: boolean;
  /** Additional class names */
  className?: string;
}

export function Sparkline({
  data,
  height = 24,
  width = '100%',
  color = 'currentColor',
  threshold,
  thresholdColor = '#ef4444',
  showDots = false,
  className = '',
}: SparklineProps) {
  // Convert data array to chart format
  const chartData = data.map((value, index) => ({
    index,
    value,
  }));

  // Note: domain calculation available if needed for YAxis in future
  // const minValue = Math.min(...data);
  // const maxValue = Math.max(...data);
  // const padding = (maxValue - minValue) * 0.1 || 1;

  return (
    <div className={`inline-flex items-center ${className}`} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
        >
          {threshold !== undefined && (
            <ReferenceLine
              y={threshold}
              stroke={thresholdColor}
              strokeDasharray="2 2"
              strokeWidth={1}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={showDots ? { r: 2, fill: color } : false}
            activeDot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Sparkline;
