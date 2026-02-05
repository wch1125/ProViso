/**
 * PerformanceChart - P50/P75/P90/P99 Performance Guarantee Visualization
 *
 * Shows actual performance against probability exceedance thresholds
 * with visual indicators for which threshold is being met.
 */
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../Card';
import type { PerformanceGuaranteeData, DegradationData } from '../../types';

interface PerformanceChartProps {
  guarantees: PerformanceGuaranteeData[];
  degradation?: DegradationData[];
  title?: string;
}

export function PerformanceChart({ guarantees, degradation, title = "Performance Guarantees" }: PerformanceChartProps) {
  // Get the primary performance guarantee (usually energy production)
  const primaryGuarantee = guarantees[0];

  if (!primaryGuarantee) {
    return null;
  }

  // Build chart data showing P-value thresholds
  const chartData = [
    { name: 'P99', value: primaryGuarantee.p99, threshold: 'p99' },
    primaryGuarantee.p90 && { name: 'P90', value: primaryGuarantee.p90, threshold: 'p90' },
    primaryGuarantee.p75 && { name: 'P75', value: primaryGuarantee.p75, threshold: 'p75' },
    { name: 'P50', value: primaryGuarantee.p50, threshold: 'p50' },
  ].filter(Boolean);

  // Determine color based on performance level
  const getStatusColor = (level: string) => {
    switch (level) {
      case 'p50': return 'text-emerald-400';
      case 'p75': return 'text-green-400';
      case 'p90': return 'text-yellow-400';
      case 'p99': return 'text-amber-400';
      default: return 'text-red-400';
    }
  };

  const getStatusBgColor = (level: string) => {
    switch (level) {
      case 'p50': return 'bg-emerald-500/10 border-emerald-500/30';
      case 'p75': return 'bg-green-500/10 border-green-500/30';
      case 'p90': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'p99': return 'bg-amber-500/10 border-amber-500/30';
      default: return 'bg-red-500/10 border-red-500/30';
    }
  };

  const getStatusIcon = (meetsGuarantee: boolean) => {
    return meetsGuarantee
      ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      : <AlertTriangle className="w-4 h-4 text-red-400" />;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number } }> }) => {
    if (!active || !payload || !payload[0]) return null;
    const data = payload[0].payload;

    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-sm font-medium text-white">{data.name} Threshold</p>
        <p className="text-sm text-gray-400">
          {data.value.toLocaleString()} {primaryGuarantee.unit || 'GWh'}
        </p>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader
        title={title}
        subtitle={`${primaryGuarantee.metric} performance tracking`}
        action={
          <div className="flex items-center gap-2">
            {getStatusIcon(primaryGuarantee.meetsGuarantee)}
            <span className={`text-sm font-medium ${primaryGuarantee.meetsGuarantee ? 'text-emerald-400' : 'text-red-400'}`}>
              {primaryGuarantee.meetsGuarantee ? 'Meeting Guarantee' : 'Below Guarantee'}
            </span>
          </div>
        }
      />
      <CardBody>
        {/* Primary metric display */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-3xl font-bold text-white">
              {primaryGuarantee.actual.toLocaleString()}
              <span className="text-lg text-gray-400 ml-1">{primaryGuarantee.unit || 'GWh'}</span>
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Actual vs P50: {primaryGuarantee.p50.toLocaleString()}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg border ${getStatusBgColor(primaryGuarantee.performanceLevel)}`}>
            <p className="text-xs text-gray-400">Performance Level</p>
            <p className={`text-lg font-bold ${getStatusColor(primaryGuarantee.performanceLevel)}`}>
              {primaryGuarantee.performanceLevel.toUpperCase()}
            </p>
          </div>
        </div>

        {/* P-value chart */}
        <div className="h-40 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#4b5563' }}
              />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#4b5563' }}
                tickFormatter={(v) => `${(v / 1).toFixed(0)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                fill="url(#performanceGradient)"
                strokeWidth={2}
              />
              {/* Actual value reference line */}
              <ReferenceLine
                y={primaryGuarantee.actual}
                stroke="#22c55e"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{
                  value: `Actual: ${primaryGuarantee.actual}`,
                  position: 'right',
                  fill: '#22c55e',
                  fontSize: 11,
                }}
              />
              <defs>
                <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* All guarantees breakdown */}
        <div className="space-y-2">
          {guarantees.map((g) => (
            <div
              key={g.name}
              className={`flex items-center justify-between p-3 rounded-lg ${
                g.meetsGuarantee ? 'bg-emerald-500/5' : 'bg-red-500/5'
              }`}
            >
              <div className="flex items-center gap-3">
                {g.meetsGuarantee ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-white">{g.name}</p>
                  <p className="text-xs text-gray-400">{g.metric}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${g.meetsGuarantee ? 'text-emerald-400' : 'text-red-400'}`}>
                  {g.actual.toLocaleString()} / {g.p99.toLocaleString()}
                </p>
                <p className={`text-xs ${getStatusColor(g.performanceLevel)}`}>
                  {g.performanceLevel.toUpperCase()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Degradation overlay if available */}
        {degradation && degradation.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <p className="text-sm font-medium text-gray-300 mb-2">Degradation Impact</p>
            <div className="grid grid-cols-2 gap-3">
              {degradation.slice(0, 2).map((d) => (
                <div key={d.name} className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">{d.assetType}</p>
                  <p className="text-sm font-medium text-white">
                    {d.effectiveCapacity.toFixed(1)}% capacity
                  </p>
                  <p className="text-xs text-amber-400">
                    -{d.cumulativeDegradation.toFixed(1)}% YTD
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
