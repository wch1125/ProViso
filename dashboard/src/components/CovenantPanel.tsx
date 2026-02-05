import { useState } from 'react';
import { CheckCircle2, XCircle, Pause, AlertTriangle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardBody } from './Card';
import { StatusBadge } from './StatusBadge';
import { CovenantSummary } from './NaturalLanguageSummary';
import { SourceCodeViewer, CodeViewButton } from './SourceCodeViewer';
import { getThresholdZone, getZoneStyle, type ThresholdZone } from '../utils/thresholds';
import { generateCovenantCode } from '../utils/codeGenerators';
import type { CovenantData } from '../types';

interface CovenantPanelProps {
  covenants: CovenantData[];
  /** Show natural language summaries below each covenant */
  showNarratives?: boolean;
  /** Show code view buttons */
  showCodeButtons?: boolean;
}

export function CovenantPanel({ covenants, showNarratives = true, showCodeButtons = true }: CovenantPanelProps) {
  const activeCovenants = covenants.filter(c => !c.suspended);
  const suspendedCovenants = covenants.filter(c => c.suspended);

  // Count covenants by zone for the header
  const zoneCounts = activeCovenants.reduce((acc, c) => {
    const zone = c.compliant
      ? getThresholdZone(c.actual, c.required, c.operator)
      : 'breach';
    acc[zone] = (acc[zone] || 0) + 1;
    return acc;
  }, {} as Record<ThresholdZone, number>);

  const warningCount = (zoneCounts.caution || 0) + (zoneCounts.danger || 0);

  return (
    <Card>
      <CardHeader
        title="Covenant Compliance"
        subtitle={
          <span className="flex items-center gap-2">
            <span>{activeCovenants.filter(c => c.compliant).length}/{activeCovenants.length} passing</span>
            {warningCount > 0 && (
              <span className="text-amber-400 text-xs">
                ({warningCount} approaching threshold)
              </span>
            )}
          </span>
        }
      />
      <CardBody className="p-0">
        {/* Active Covenants */}
        <div className="divide-y divide-slate-800">
          {activeCovenants.map((covenant) => (
            <CovenantRow
              key={covenant.name}
              covenant={covenant}
              showNarrative={showNarratives}
              showCodeButton={showCodeButtons}
            />
          ))}
        </div>

        {/* Suspended Covenants Section */}
        {suspendedCovenants.length > 0 && (
          <div className="border-t border-slate-700 bg-slate-900/30">
            <div className="px-5 py-3 flex items-center gap-2">
              <Pause className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-500">
                Suspended During Construction ({suspendedCovenants.length})
              </span>
            </div>
            <div className="divide-y divide-slate-800/50">
              {suspendedCovenants.map((covenant) => (
                <CovenantRow
                  key={covenant.name}
                  covenant={covenant}
                  showNarrative={showNarratives}
                  showCodeButton={showCodeButtons}
                />
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

interface CovenantRowProps {
  covenant: CovenantData;
  showNarrative?: boolean;
  showCodeButton?: boolean;
}

function CovenantRow({ covenant, showNarrative = true, showCodeButton = true }: CovenantRowProps) {
  const { name, actual, required, operator, compliant, headroom, suspended } = covenant;
  const [showCode, setShowCode] = useState(false);

  // Calculate threshold zone for styling
  const zone: ThresholdZone = suspended
    ? 'safe'
    : !compliant
    ? 'breach'
    : getThresholdZone(actual, required, operator);

  const zoneStyle = getZoneStyle(zone);

  // Calculate usage percentage for the bar
  let usagePercent = 0;

  if (operator === '<=') {
    // For max covenants (like leverage), usage is actual/required
    usagePercent = Math.min((actual / required) * 100, 100);
  } else if (operator === '>=') {
    // For min covenants (like coverage), usage is required/actual
    usagePercent = Math.min((required / actual) * 100, 100);
  }

  // Format covenant name for display
  const displayName = name.replace(/([A-Z])/g, ' $1').trim();

  // Format the ratio display
  const formatValue = (val: number) => {
    if (val >= 100) return val.toFixed(0);
    if (val >= 10) return val.toFixed(1);
    return val.toFixed(2);
  };

  // Get icon based on zone
  const Icon = suspended
    ? Pause
    : zone === 'breach'
    ? XCircle
    : zone === 'danger'
    ? AlertCircle
    : zone === 'caution'
    ? AlertTriangle
    : CheckCircle2;

  const iconColor = suspended
    ? 'text-gray-500'
    : zone === 'breach'
    ? 'text-red-500'
    : zone === 'danger'
    ? 'text-orange-500'
    : zone === 'caution'
    ? 'text-amber-500'
    : 'text-emerald-500';

  // Generate code for the viewer
  const metricName = name.replace(/^(Max|Min)/, '');
  const covenantCode = generateCovenantCode({
    name,
    metric: metricName,
    operator,
    threshold: required,
    tested: 'quarterly',
  });

  return (
    <>
      <div className={`px-5 py-4 ${suspended ? 'opacity-60' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Icon className={`w-5 h-5 ${iconColor} ${zoneStyle.pulseAnimation ? 'animate-pulse' : ''}`} />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{displayName}</span>
              {showCodeButton && (
                <CodeViewButton onClick={() => setShowCode(true)} />
              )}
              {suspended && (
                <StatusBadge status="suspended" label="Suspended" />
              )}
              {!suspended && zone === 'caution' && (
                <span className="text-xs text-amber-400 font-medium">80%+</span>
              )}
              {!suspended && zone === 'danger' && (
                <span className="text-xs text-orange-400 font-medium animate-pulse">90%+</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-baseline gap-2">
              <span className={`text-lg font-semibold tabular-nums ${
                suspended
                  ? 'text-gray-500'
                  : zone === 'breach'
                  ? 'text-red-400'
                  : zone === 'danger'
                  ? 'text-orange-400'
                  : zone === 'caution'
                  ? 'text-amber-400'
                  : 'text-white'
              }`}>
                {formatValue(actual)}x
              </span>
              <span className="text-sm text-gray-500">
                {operator} {formatValue(required)}x
              </span>
            </div>
            {headroom !== undefined && !suspended && (
              <span className={`text-xs ${
                zone === 'breach'
                  ? 'text-red-400'
                  : zone === 'danger'
                  ? 'text-orange-400'
                  : zone === 'caution'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}>
                {compliant ? '+' : ''}{formatValue(headroom)}x headroom
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar with Zone-based Colors */}
        <div className="progress-bar relative">
          {/* Zone markers */}
          {!suspended && (
            <>
              <div
                className="absolute top-0 bottom-0 w-px bg-amber-500/30"
                style={{ left: '80%' }}
                title="Caution zone (80%)"
              />
              <div
                className="absolute top-0 bottom-0 w-px bg-orange-500/30"
                style={{ left: '90%' }}
                title="Danger zone (90%)"
              />
            </>
          )}
          <div
            className={`progress-bar-fill ${
              suspended
                ? 'bg-gray-600'
                : zoneStyle.progressColor
            } ${zoneStyle.pulseAnimation ? 'animate-pulse' : ''}`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>

        {/* Visual Threshold Marker */}
        <div className="relative h-0">
          <div
            className="absolute -top-2 w-0.5 h-4 bg-gray-400"
            style={{ left: operator === '<=' ? '100%' : '0%' }}
          />
        </div>

        {/* Natural Language Summary */}
        {showNarrative && (
          <div className="mt-3">
            <CovenantSummary
              name={name}
              actual={actual}
              threshold={required}
              operator={operator}
              compliant={compliant}
              headroom={headroom}
              suspended={suspended}
              className="opacity-80"
            />
          </div>
        )}
      </div>

      {/* Source Code Viewer Modal */}
      <SourceCodeViewer
        isOpen={showCode}
        onClose={() => setShowCode(false)}
        elementType="covenant"
        elementName={name}
        code={covenantCode}
      />
    </>
  );
}
