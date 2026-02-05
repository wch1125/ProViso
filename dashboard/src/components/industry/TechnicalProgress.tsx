/**
 * TechnicalProgress - Technical Milestone Tracking
 *
 * Shows MW installed vs target, completion percentages, and critical path.
 */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Zap, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../Card';
import type { TechnicalMilestoneData } from '../../types';

interface TechnicalProgressProps {
  milestones: TechnicalMilestoneData[];
  title?: string;
}

export function TechnicalProgress({ milestones, title = "Technical Progress" }: TechnicalProgressProps) {
  // Calculate overall progress
  const totalTargetValue = milestones.reduce((sum, m) => sum + m.targetValue, 0);
  const totalCurrentValue = milestones.reduce((sum, m) => sum + m.currentValue, 0);
  const overallProgress = totalTargetValue > 0 ? (totalCurrentValue / totalTargetValue) * 100 : 0;

  // Find key capacity milestone (usually MW or primary metric)
  const capacityMilestone = milestones.find(
    (m) => m.measurement.toLowerCase().includes('mw') || m.measurement.toLowerCase().includes('capacity')
  ) || milestones[0];

  // Calculate stats
  const stats = {
    achieved: milestones.filter((m) => m.status === 'achieved').length,
    inProgress: milestones.filter((m) => m.status === 'in_progress').length,
    pending: milestones.filter((m) => m.status === 'pending').length,
    atRisk: milestones.filter((m) => m.status === 'at_risk').length,
    breached: milestones.filter((m) => m.status === 'breached').length,
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved':
        return '#22c55e'; // emerald-500
      case 'in_progress':
        return '#3b82f6'; // blue-500
      case 'pending':
        return '#6b7280'; // gray-500
      case 'at_risk':
        return '#f59e0b'; // amber-500
      case 'breached':
        return '#ef4444'; // red-500
      default:
        return '#6b7280';
    }
  };

  const getStatusBgClass = (status: string) => {
    switch (status) {
      case 'achieved':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'in_progress':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'pending':
        return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
      case 'at_risk':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'breached':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'achieved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'at_risk':
      case 'breached':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Prepare chart data
  const chartData = milestones.slice(0, 6).map((m) => ({
    name: m.name.length > 15 ? m.name.substring(0, 12) + '...' : m.name,
    fullName: m.name,
    current: m.currentValue,
    target: m.targetValue,
    percent: m.percentComplete,
    status: m.status,
    measurement: m.measurement,
  }));

  // Custom tooltip
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: (typeof chartData)[0];
    }>;
  }) => {
    if (!active || !payload || !payload[0]) return null;
    const data = payload[0].payload;

    return (
      <div className="bg-industry-cardBg border border-industry-borderDefault rounded-lg px-3 py-2 shadow-lg">
        <p className="text-sm font-medium text-industry-textPrimary">{data.fullName}</p>
        <p className="text-sm text-industry-textSecondary">
          {data.current.toLocaleString()} / {data.target.toLocaleString()} {data.measurement}
        </p>
        <p className="text-xs text-industry-textMuted mt-1">{data.percent}% complete</p>
      </div>
    );
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate days to target
  const daysToTarget = (dateStr: string) => {
    const target = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <Card>
      <CardHeader
        title={title}
        subtitle={`${stats.achieved}/${milestones.length} milestones achieved`}
        action={
          capacityMilestone && (
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-gold-400" />
              <span className="text-lg font-bold text-white">
                {capacityMilestone.currentValue}
                <span className="text-gray-400 text-sm">/{capacityMilestone.targetValue}</span>
              </span>
              <span className="text-sm text-gray-400">{capacityMilestone.measurement}</span>
            </div>
          )
        }
      />
      <CardBody>
        {/* Overall progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-industry-textSecondary">Overall Technical Progress</span>
            <span className="text-sm font-medium text-industry-textPrimary">{overallProgress.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-industry-headerBg rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          <div className="bg-emerald-500/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-emerald-400">{stats.achieved}</p>
            <p className="text-xs text-gray-400">Done</p>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-blue-400">{stats.inProgress}</p>
            <p className="text-xs text-gray-400">Active</p>
          </div>
          <div className="bg-gray-500/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-gray-400">{stats.pending}</p>
            <p className="text-xs text-gray-400">Pending</p>
          </div>
          <div className="bg-amber-500/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-amber-400">{stats.atRisk}</p>
            <p className="text-xs text-gray-400">At Risk</p>
          </div>
          <div className="bg-red-500/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-red-400">{stats.breached}</p>
            <p className="text-xs text-gray-400">Breached</p>
          </div>
        </div>

        {/* Progress chart */}
        <div className="h-36 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                axisLine={{ stroke: '#4b5563' }}
                angle={-15}
                textAnchor="end"
                height={40}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="percent" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Milestone list */}
        <div className="space-y-2">
          {milestones.map((m) => (
            <div
              key={m.name}
              className={`flex items-center justify-between p-3 rounded-lg border ${getStatusBgClass(m.status)}`}
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(m.status)}
                <div>
                  <p className="text-sm font-medium text-white">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.measurement}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-white tabular-nums">
                    {m.currentValue.toLocaleString()} / {m.targetValue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">{m.percentComplete}%</p>
                </div>
                <div className="text-right min-w-[60px]">
                  <p className="text-xs text-gray-400">{formatDate(m.target)}</p>
                  {m.status !== 'achieved' && (
                    <p
                      className={`text-xs ${
                        daysToTarget(m.target) < 0
                          ? 'text-red-400'
                          : daysToTarget(m.target) < 30
                          ? 'text-amber-400'
                          : 'text-gray-500'
                      }`}
                    >
                      {daysToTarget(m.target) < 0
                        ? `${Math.abs(daysToTarget(m.target))}d overdue`
                        : `${daysToTarget(m.target)}d left`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Critical path indicator */}
        {milestones.filter((m) => m.status === 'in_progress').length > 0 && (
          <div className="mt-4 pt-4 border-t border-industry-borderDefault">
            <p className="text-xs text-gray-400 mb-2">Critical Path</p>
            <div className="flex items-center gap-2 flex-wrap">
              {milestones
                .filter((m) => m.status === 'in_progress' || m.status === 'pending')
                .slice(0, 4)
                .map((m, index, arr) => (
                  <div key={m.name} className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        m.status === 'in_progress'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {m.name}
                    </span>
                    {index < arr.length - 1 && <ArrowRight className="w-3 h-3 text-gray-600" />}
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
