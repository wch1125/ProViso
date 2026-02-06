import { useMemo } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, DollarSign, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardBody } from './Card';
import { Sparkline } from './charts';
import { useIndustryTheme } from '../context';
import { generateAlerts } from '../utils/thresholds';
import type { DashboardData } from '../types';

/**
 * Generate simulated historical trend data for sparklines
 * In a real app, this would come from the backend
 */
function generateTrendData(currentValue: number, periods: number = 6, volatility: number = 0.1): number[] {
  const data: number[] = [];
  let value = currentValue * (1 - volatility * (periods / 2) * 0.5);

  for (let i = 0; i < periods - 1; i++) {
    data.push(value);
    // Gradual trend toward current value with some noise
    const trend = (currentValue - value) / (periods - i);
    const noise = (Math.random() - 0.5) * currentValue * volatility * 0.5;
    value += trend + noise;
  }
  data.push(currentValue);
  return data;
}

interface ExecutiveSummaryProps {
  data: DashboardData;
}

export function ExecutiveSummary({ data }: ExecutiveSummaryProps) {
  const { colors } = useIndustryTheme();

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

  // Generate trend data for sparklines (simulated - in production this would come from the backend)
  const reserveTrendData = useMemo(
    () => generateTrendData(reserveFunding, 6, 0.08),
    [reserveFunding]
  );
  const revenueTrendData = useMemo(
    () => generateTrendData(data.waterfall.revenue, 6, 0.12),
    [data.waterfall.revenue]
  );

  return (
    <Card className="col-span-full">
      <CardBody className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-industry-borderDefault">
          {/* Overall Compliance */}
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="metric-label mb-1">Overall Status</p>
                <div className="flex items-center gap-2">
                  {!allCompliant ? (
                    <XCircle className="w-6 h-6 text-danger" />
                  ) : alertSummary.dangerCount > 0 ? (
                    <AlertCircle className="w-6 h-6 text-orange-500 animate-pulse" />
                  ) : alertSummary.cautionCount > 0 ? (
                    <AlertTriangle className="w-6 h-6 text-warning" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  )}
                  <span className={`text-xl font-semibold ${
                    !allCompliant
                      ? 'text-danger'
                      : alertSummary.dangerCount > 0
                      ? 'text-orange-400'
                      : alertSummary.cautionCount > 0
                      ? 'text-warning'
                      : 'text-success'
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
            <p className="text-sm text-text-muted mt-3">
              {compliantCount}/{activeCount} active covenants passing
              {totalCovenants - activeCount > 0 && (
                <span className="text-text-muted"> ({totalCovenants - activeCount} suspended)</span>
              )}
            </p>
          </div>

          {/* Project Progress */}
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="metric-label mb-1">Milestones</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-industry-primary" style={{ color: colors.primary }} />
                  <span className="metric-value">
                    {milestonesAchieved}/{data.milestones.length}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-text-muted mt-3">
              {milestonesAtRisk > 0 ? (
                <span className="text-warning">{milestonesAtRisk} at risk or breached</span>
              ) : (
                'All milestones on track'
              )}
            </p>
          </div>

          {/* Reserve Funding */}
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="metric-label mb-1">Reserve Funding</p>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-industry-primary" style={{ color: colors.primary }} />
                  <span className="metric-value">{reserveFunding.toFixed(0)}%</span>
                </div>
              </div>
              <Sparkline
                data={reserveTrendData}
                height={28}
                width={64}
                color={reserveFunding >= 80 ? '#10b981' : reserveFunding >= 50 ? '#f59e0b' : '#ef4444'}
                threshold={100}
                thresholdColor="#10b981"
              />
            </div>
            <p className="text-sm text-text-muted mt-3">
              ${(totalReserveBalance / 1_000_000).toFixed(1)}M of ${(totalReserveTarget / 1_000_000).toFixed(1)}M target
            </p>
          </div>

          {/* Cash Flow */}
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="metric-label mb-1">Monthly Revenue</p>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-industry-primary" style={{ color: colors.primary }} />
                  <span className="metric-value">${(data.waterfall.revenue / 1_000_000).toFixed(1)}M</span>
                </div>
              </div>
              <Sparkline
                data={revenueTrendData}
                height={28}
                width={64}
                color={blockedDistribution > 0 ? '#f59e0b' : '#10b981'}
              />
            </div>
            <p className="text-sm text-text-muted mt-3">
              {blockedDistribution > 0 ? (
                <span className="text-warning">
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
                  <Calendar className="w-6 h-6 text-industry-primary" style={{ color: colors.primary }} />
                  <span className="metric-value text-lg">
                    {data.phase.codTarget ? new Date(data.phase.codTarget).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    }) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-text-muted mt-3">
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
    ? 'bg-danger/5 border-danger/20'
    : severity === 'warning'
    ? 'bg-orange-500/5 border-orange-500/20'
    : 'bg-warning/5 border-warning/20';

  const textColor = severity === 'critical'
    ? 'text-danger'
    : severity === 'warning'
    ? 'text-orange-400'
    : 'text-warning';

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
            <span key={i} className={`text-sm ${i === 0 ? `font-medium ${textColor}` : 'text-text-tertiary'}`}>
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
