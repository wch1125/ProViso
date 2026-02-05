import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, Lock } from 'lucide-react';
import { Card, CardHeader, CardBody } from './Card';
import type { WaterfallData } from '../types';

interface WaterfallChartProps {
  waterfall: WaterfallData;
}

interface ChartDataItem {
  name: string;
  amount: number;
  blocked?: boolean;
  reason?: string;
  cumulative: number;
}

export function WaterfallChart({ waterfall }: WaterfallChartProps) {
  const { revenue, tiers } = waterfall;

  // Note: ChartDataItem interface is used for CustomTooltip typing

  // Calculate totals
  const totalDistributed = tiers.filter(t => !t.blocked).reduce((sum, t) => sum + t.amount, 0);
  const blockedAmount = tiers.filter(t => t.blocked).reduce((sum, t) => sum + t.amount, 0);
  const remainder = revenue - totalDistributed - blockedAmount;

  // Colors for the bars
  const getBarColor = (index: number, blocked: boolean) => {
    if (blocked) return '#4b5563'; // gray-600
    const colors = ['#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e'];
    return colors[index % colors.length];
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataItem }> }) => {
    if (!active || !payload || !payload[0]) return null;
    const data = payload[0].payload;

    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-sm font-medium text-white">{data.name}</p>
        <p className="text-sm text-gray-400">
          ${(data.amount / 1_000_000).toFixed(2)}M
        </p>
        {data.blocked && (
          <p className="text-xs text-amber-400 mt-1">{data.reason}</p>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader
        title="Cash Flow Waterfall"
        subtitle="Monthly distribution priority"
        action={
          <div className="text-right">
            <p className="text-sm text-gray-400">Revenue</p>
            <p className="text-lg font-semibold text-white">${(revenue / 1_000_000).toFixed(1)}M</p>
          </div>
        }
      />
      <CardBody>
        {/* Stacked Horizontal Bar Chart */}
        <div className="h-24 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={[{ name: 'Distribution', ...Object.fromEntries(tiers.map((t, i) => [`tier${i}`, t.amount])) }]}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <XAxis type="number" hide domain={[0, revenue]} />
              <YAxis type="category" hide dataKey="name" />
              <Tooltip content={<CustomTooltip />} />
              {tiers.map((tier, index) => (
                <Bar
                  key={index}
                  dataKey={`tier${index}`}
                  stackId="a"
                  fill={getBarColor(index, !!tier.blocked)}
                  radius={index === 0 ? [4, 0, 0, 4] : index === tiers.length - 1 ? [0, 4, 4, 0] : 0}
                >
                  {tier.blocked && (
                    <Cell
                      key={`cell-${index}`}
                      fill="#4b5563"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="4 2"
                    />
                  )}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / Breakdown */}
        <div className="space-y-2">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                tier.blocked ? 'bg-amber-500/5 border border-amber-500/20' : 'hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: getBarColor(index, !!tier.blocked) }}
                />
                <span className={`text-sm ${tier.blocked ? 'text-gray-400' : 'text-gray-300'}`}>
                  {tier.name}
                </span>
                {tier.blocked && (
                  <span className="flex items-center gap-1 text-xs text-amber-400">
                    <Lock className="w-3 h-3" />
                    {tier.reason}
                  </span>
                )}
              </div>
              <span className={`text-sm font-medium tabular-nums ${
                tier.blocked ? 'text-gray-500' : 'text-white'
              }`}>
                ${(tier.amount / 1_000_000).toFixed(2)}M
              </span>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500">Distributed</p>
            <p className="text-lg font-semibold text-emerald-400">
              ${(totalDistributed / 1_000_000).toFixed(2)}M
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Blocked</p>
            <p className="text-lg font-semibold text-amber-400">
              ${(blockedAmount / 1_000_000).toFixed(2)}M
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Remainder</p>
            <p className="text-lg font-semibold text-white">
              ${(remainder / 1_000_000).toFixed(2)}M
            </p>
          </div>
        </div>

        {/* Warning if blocked */}
        {blockedAmount > 0 && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-amber-400 font-medium">Distribution Gate Active</p>
              <p className="text-xs text-gray-400 mt-0.5">
                DSCR must exceed 1.50x before distributions can be released
              </p>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
