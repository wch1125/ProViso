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
        return 'bg-success/10 border-success/30 text-success';
      case 'in_progress':
        return 'bg-info/10 border-info/30 text-info';
      case 'pending':
        return 'bg-gray-500/10 border-gray-500/30 text-text-tertiary';
      case 'at_risk':
        return 'bg-warning/10 border-warning/30 text-warning';
      case 'breached':
        return 'bg-danger/10 border-danger/30 text-danger';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-text-tertiary';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'achieved':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-info" />;
      case 'at_risk':
      case 'breached':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return <Clock className="w-4 h-4 text-text-tertiary" />;
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
              <span className="text-lg font-bold text-text-primary">
                {capacityMilestone.currentValue}
                <span className="text-text-tertiary text-sm">/{capacityMilestone.targetValue}</span>
              </span>
              <span className="text-sm text-text-tertiary">{capacityMilestone.measurement}</span>
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
          <div className="bg-success/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-success">{stats.achieved}</p>
            <p className="text-xs text-text-tertiary">Done</p>
          </div>
          <div className="bg-info/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-info">{stats.inProgress}</p>
            <p className="text-xs text-text-tertiary">Active</p>
          </div>
          <div className="bg-gray-500/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-text-tertiary">{stats.pending}</p>
            <p className="text-xs text-text-tertiary">Pending</p>
          </div>
          <div className="bg-warning/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-warning">{stats.atRisk}</p>
            <p className="text-xs text-text-tertiary">At Risk</p>
          </div>
          <div className="bg-danger/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-danger">{stats.breached}</p>
            <p className="text-xs text-text-tertiary">Breached</p>
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
                  <p className="text-sm font-medium text-text-primary">{m.name}</p>
                  <p className="text-xs text-text-tertiary">{m.measurement}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-text-primary tabular-nums">
                    {m.currentValue.toLocaleString()} / {m.targetValue.toLocaleString()}
                  </p>
                  <p className="text-xs text-text-tertiary">{m.percentComplete}%</p>
                </div>
                <div className="text-right min-w-[60px]">
                  <p className="text-xs text-text-tertiary">{formatDate(m.target)}</p>
                  {m.status !== 'achieved' && (
                    <p
                      className={`text-xs ${
                        daysToTarget(m.target) < 0
                          ? 'text-danger'
                          : daysToTarget(m.target) < 30
                          ? 'text-warning'
                          : 'text-text-muted'
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
            <p className="text-xs text-text-tertiary mb-2">Critical Path</p>
            <div className="flex items-center gap-2 flex-wrap">
              {milestones
                .filter((m) => m.status === 'in_progress' || m.status === 'pending')
                .slice(0, 4)
                .map((m, index, arr) => (
                  <div key={m.name} className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        m.status === 'in_progress'
                          ? 'bg-info/20 text-info'
                          : 'bg-gray-500/20 text-text-tertiary'
                      }`}
                    >
                      {m.name}
                    </span>
                    {index < arr.length - 1 && <ArrowRight className="w-3 h-3 text-text-muted" />}
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
