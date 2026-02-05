/**
 * Compliance Trend Chart
 *
 * Visualizes covenant compliance history over time using Recharts.
 * Shows actual values, thresholds, and compliance status per period.
 */
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, CheckCircle, XCircle } from 'lucide-react';

interface CovenantTrend {
  period: string;
  actual: number;
  threshold: number;
  compliant: boolean;
}

interface ComplianceTrendChartProps {
  covenantName: string;
  data: CovenantTrend[];
  operator: '<=' | '>=' | '<' | '>' | '=' | '!=';
  className?: string;
}

export function ComplianceTrendChart({
  covenantName,
  data,
  operator,
  className = '',
}: ComplianceTrendChartProps) {
  const threshold = data[0]?.threshold ?? 0;
  const latestValue = data[data.length - 1]?.actual ?? 0;
  const latestCompliant = data[data.length - 1]?.compliant ?? true;
  const isMaxThreshold = operator === '<=' || operator === '<';

  // Calculate min/max for Y axis
  const allValues = data.flatMap((d) => [d.actual, d.threshold]);
  const minValue = Math.min(...allValues) * 0.8;
  const maxValue = Math.max(...allValues) * 1.2;

  // Determine compliance trend
  const recentTrend = data.length >= 2
    ? data[data.length - 1]!.actual - data[data.length - 2]!.actual
    : 0;

  const trendDirection = isMaxThreshold
    ? recentTrend < 0 ? 'improving' : recentTrend > 0 ? 'worsening' : 'stable'
    : recentTrend > 0 ? 'improving' : recentTrend < 0 ? 'worsening' : 'stable';

  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <TrendingUp className="h-5 w-5 text-teal-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{covenantName}</h3>
            <p className="text-sm text-slate-400">
              Threshold: {operator} {threshold.toFixed(2)}x
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-slate-400">Current</div>
            <div className={`text-xl font-bold ${latestCompliant ? 'text-green-400' : 'text-red-400'}`}>
              {latestValue.toFixed(2)}x
            </div>
          </div>
          {latestCompliant ? (
            <CheckCircle className="h-8 w-8 text-green-400" />
          ) : (
            <XCircle className="h-8 w-8 text-red-400" />
          )}
        </div>
      </div>

      {/* Trend Indicator */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-sm px-2 py-1 rounded ${
          trendDirection === 'improving'
            ? 'bg-green-500/10 text-green-400'
            : trendDirection === 'worsening'
            ? 'bg-red-500/10 text-red-400'
            : 'bg-slate-700 text-slate-400'
        }`}>
          {trendDirection === 'improving' ? '↑ Improving' :
           trendDirection === 'worsening' ? '↓ Worsening' : '→ Stable'}
        </span>
        <span className="text-sm text-slate-400">
          over last period
        </span>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="period"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={{ stroke: '#475569' }}
            />
            <YAxis
              domain={[minValue, maxValue]}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={{ stroke: '#475569' }}
              tickFormatter={(v: number) => `${v.toFixed(1)}x`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#f8fafc' }}
              formatter={(value: number, name: string) => [
                `${value.toFixed(2)}x`,
                name === 'actual' ? 'Actual' : 'Threshold',
              ]}
            />
            <Legend
              wrapperStyle={{ color: '#94a3b8' }}
              formatter={(value: string) =>
                value === 'actual' ? 'Actual' : 'Threshold'
              }
            />
            <ReferenceLine
              y={threshold}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: 'Threshold',
                position: 'right',
                fill: '#f59e0b',
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#14b8a6"
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload } = props;
                return (
                  <circle
                    key={payload.period}
                    cx={cx}
                    cy={cy}
                    r={6}
                    fill={payload.compliant ? '#22c55e' : '#ef4444'}
                    stroke="#1e293b"
                    strokeWidth={2}
                  />
                );
              }}
              activeDot={{ r: 8, fill: '#14b8a6', stroke: '#0d9488' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Period Summary */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="text-slate-400">
          {data.filter((d) => d.compliant).length} of {data.length} periods compliant
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-slate-400">Compliant</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <span className="text-slate-400">Breach</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplianceTrendChart;
