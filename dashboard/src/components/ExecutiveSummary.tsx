import { CheckCircle2, AlertTriangle, XCircle, DollarSign, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardBody } from './Card';
import { generateAlerts } from '../utils/thresholds';
import type { DashboardData } from '../types';

interface ExecutiveSummaryProps {
  data: DashboardData;
}

export function ExecutiveSummary({ data }: ExecutiveSummaryProps) {
  // Calculate key metrics
  const totalCovenants = data.covenants.length;
  const activeCovenants = data.covenants.filter(c => !c.suspended);
  const compliantCount = activeCovenants.filter(c => c.compliant).length;
  const activeCount = activeCovenants.length;

  const milestonesAchieved = data.milestones.filter(m => m.status === 'achieved').length;
  const milestonesAtRisk = data.milestones.filter(m => m.status === 'at_risk' || m.status === 'breached').length;

  const totalReserveBalance = data.reserves.reduce((sum, r) => sum + r.balance, 0);
  const totalReserveTarget = data.reserves.reduce((sum, r) => sum + r.target, 0);
  const reserveFunding = totalReserveTarget > 0 ? (totalReserveBalance / totalReserveTarget) * 100 : 0;

  const waterfallDistributed = data.waterfall.tiers
    .filter(t => !t.blocked)
    .reduce((sum, t) => sum + t.amount, 0);
  const blockedDistribution = data.waterfall.tiers
    .filter(t => t.blocked)
    .reduce((sum, t) => sum + t.amount, 0);

  // Overall status
  const allCompliant = activeCovenants.every(c => c.compliant);
  const hasWarnings = milestonesAtRisk > 0 || blockedDistribution > 0;

  // Generate early warning alerts
  const alertSummary = generateAlerts(
    activeCovenants.map(c => ({
      name: c.name,
      actual: c.actual,
      required: c.required,
      operator: c.operator,
      suspended: c.suspended,
    }))
  );

  // Combine all alert conditions
  const showAlertBanner = !allCompliant || hasWarnings || alertSummary.hasAlerts;

  return (
    <Card className="col-span-full">
      <CardBody className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Overall Compliance */}
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="metric-label mb-1">Overall Status</p>
                <div className="flex items-center gap-2">
                  {!allCompliant ? (
                    <XCircle className="w-6 h-6 text-red-500" />
                  ) : alertSummary.dangerCount > 0 ? (
                    <AlertCircle className="w-6 h-6 text-orange-500 animate-pulse" />
                  ) : alertSummary.cautionCount > 0 ? (
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  )}
                  <span className={`text-xl font-semibold ${
                    !allCompliant
                      ? 'text-red-400'
                      : alertSummary.dangerCount > 0
                      ? 'text-orange-400'
                      : alertSummary.cautionCount > 0
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}>
                    {!allCompliant
                      ? 'Breach'
                      : alertSummary.dangerCount > 0
                      ? 'At Risk'
                      : alertSummary.cautionCount > 0
                      ? 'Monitor'
                      : 'Compliant'}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              {compliantCount}/{activeCount} active covenants passing
              {totalCovenants - activeCount > 0 && (
                <span className="text-gray-600"> ({totalCovenants - activeCount} suspended)</span>
              )}
            </p>
          </div>

          {/* Project Progress */}
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="metric-label mb-1">Milestones</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-accent-500" />
                  <span className="metric-value">
                    {milestonesAchieved}/{data.milestones.length}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              {milestonesAtRisk > 0 ? (
                <span className="text-amber-400">{milestonesAtRisk} at risk or breached</span>
              ) : (
                'All milestones on track'
              )}
            </p>
          </div>

          {/* Reserve Funding */}
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="metric-label mb-1">Reserve Funding</p>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-accent-500" />
                  <span className="metric-value">{reserveFunding.toFixed(0)}%</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              ${(totalReserveBalance / 1_000_000).toFixed(1)}M of ${(totalReserveTarget / 1_000_000).toFixed(1)}M target
            </p>
          </div>

          {/* Cash Flow */}
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="metric-label mb-1">Monthly Revenue</p>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-accent-500" />
                  <span className="metric-value">${(data.waterfall.revenue / 1_000_000).toFixed(1)}M</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              {blockedDistribution > 0 ? (
                <span className="text-amber-400">
                  ${(blockedDistribution / 1_000_000).toFixed(1)}M blocked
                </span>
              ) : (
                `$${(waterfallDistributed / 1_000_000).toFixed(1)}M distributed`
              )}
            </p>
          </div>

          {/* COD Target */}
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="metric-label mb-1">COD Target</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-accent-500" />
                  <span className="metric-value text-lg">
                    {data.phase.codTarget ? new Date(data.phase.codTarget).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    }) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              {data.phase.codTarget ? `${getDaysUntil(data.phase.codTarget)} days remaining` : 'No target set'}
            </p>
          </div>
        </div>

        {/* Alert Banner - Enhanced with Early Warning */}
        {showAlertBanner && (
          <AlertBanner
            allCompliant={allCompliant}
            alertSummary={alertSummary}
            milestonesAtRisk={milestonesAtRisk}
            hasBlockedDistribution={blockedDistribution > 0}
          />
        )}
      </CardBody>
    </Card>
  );
}

interface AlertBannerProps {
  allCompliant: boolean;
  alertSummary: ReturnType<typeof generateAlerts>;
  milestonesAtRisk: number;
  hasBlockedDistribution: boolean;
}

function AlertBanner({ allCompliant, alertSummary, milestonesAtRisk, hasBlockedDistribution }: AlertBannerProps) {
  // Determine alert severity and message
  let severity: 'critical' | 'warning' | 'caution' = 'caution';
  const messages: string[] = [];

  if (!allCompliant) {
    severity = 'critical';
    messages.push('Covenant breach detected - review required');
  }

  if (alertSummary.dangerCount > 0) {
    if (severity !== 'critical') severity = 'warning';
    const dangerAlerts = alertSummary.alerts.filter(a => a.zone === 'danger');
    const names = dangerAlerts.slice(0, 2).map(a => a.name.replace(/([A-Z])/g, ' $1').trim());
    messages.push(`${alertSummary.dangerCount} covenant${alertSummary.dangerCount > 1 ? 's' : ''} approaching threshold: ${names.join(', ')}`);
  }

  if (alertSummary.cautionCount > 0 && messages.length < 2) {
    messages.push(`${alertSummary.cautionCount} covenant${alertSummary.cautionCount > 1 ? 's' : ''} to monitor`);
  }

  if (milestonesAtRisk > 0 && messages.length < 2) {
    if (severity !== 'critical') severity = 'warning';
    messages.push(`${milestonesAtRisk} milestone${milestonesAtRisk > 1 ? 's' : ''} at risk`);
  }

  if (hasBlockedDistribution && messages.length < 2) {
    messages.push('Distribution blocked - DSCR gate not met');
  }

  const bgColor = severity === 'critical'
    ? 'bg-red-500/5 border-red-500/20'
    : severity === 'warning'
    ? 'bg-orange-500/5 border-orange-500/20'
    : 'bg-amber-500/5 border-amber-500/20';

  const textColor = severity === 'critical'
    ? 'text-red-400'
    : severity === 'warning'
    ? 'text-orange-400'
    : 'text-amber-400';

  const Icon = severity === 'critical'
    ? XCircle
    : severity === 'warning'
    ? AlertCircle
    : AlertTriangle;

  return (
    <div className={`px-5 py-3 border-t ${bgColor}`}>
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 ${textColor} flex-shrink-0 mt-0.5 ${severity === 'warning' ? 'animate-pulse' : ''}`} />
        <div className="flex flex-col gap-0.5">
          {messages.map((msg, i) => (
            <span key={i} className={`text-sm ${i === 0 ? `font-medium ${textColor}` : 'text-gray-400'}`}>
              {msg}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
