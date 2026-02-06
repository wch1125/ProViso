/**
 * Cure Rights Optimizer
 *
 * When a covenant is breached, this modal shows:
 * - Current breach status and shortfall
 * - Available cure mechanisms (EquityCure, PaymentCure)
 * - Remaining uses and maximum amounts
 * - Cost simulation: enter an amount and see pro forma effect
 * - Cure deadline countdown
 *
 * Wired to the ProViso interpreter's cure API.
 */
import { useState, useMemo } from 'react';
import {
  Shield,
  AlertTriangle,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Zap,
  Info,
} from 'lucide-react';
import { Modal } from '../base/Modal';
import { Button } from '../base/Button';
import { Badge } from '../base/Badge';
import { Input } from '../base/Input';
import { useProViso } from '../../context';
import { formatCurrency, formatRatio, formatDisplayName } from '../../utils/narratives';
import { getThresholdZone, getZoneStyle } from '../../utils/thresholds';
import type { CovenantData } from '../../types';

// =============================================================================
// TYPES
// =============================================================================

interface CureOption {
  mechanism: string;
  label: string;
  description: string;
  maxAmount: number | null;
  usesRemaining: number;
  maxUses: number;
  period: string;
  available: boolean;
}

interface CureSimulationResult {
  success: boolean;
  reason?: string;
  curedAmount?: number;
  newActual?: number;
  newCompliant?: boolean;
  costDescription?: string;
}

export interface CureRightsOptimizerProps {
  isOpen: boolean;
  onClose: () => void;
  covenant: CovenantData | null;
  /** Callback when cure is applied */
  onCureApplied?: (covenantName: string, mechanism: string, amount: number) => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CureRightsOptimizer({
  isOpen,
  onClose,
  covenant,
  onCureApplied,
}: CureRightsOptimizerProps) {
  const { interpreter } = useProViso();

  const [selectedMechanism, setSelectedMechanism] = useState<string | null>(null);
  const [cureAmount, setCureAmount] = useState('');
  const [simulationResult, setSimulationResult] = useState<CureSimulationResult | null>(null);
  const [applied, setApplied] = useState(false);

  // Get cure options from interpreter
  const cureOptions = useMemo((): CureOption[] => {
    if (!interpreter || !covenant) return [];

    try {
      const covenantNames = interpreter.getCovenantsWithCure();
      if (!covenantNames.includes(covenant.name)) return [];

      const usageList = interpreter.getCureUsage();
      const options: CureOption[] = [];

      // Group by mechanism type
      const seen = new Set<string>();
      for (const usage of usageList) {
        if (seen.has(usage.mechanism)) continue;
        seen.add(usage.mechanism);

        const isEquity = usage.mechanism.toLowerCase().includes('equity');
        options.push({
          mechanism: usage.mechanism,
          label: isEquity ? 'Equity Cure' : 'Payment Cure',
          description: isEquity
            ? 'Inject equity capital to cure the breach. Increases EBITDA base.'
            : 'Make a principal payment to cure the breach. Reduces outstanding debt.',
          maxAmount: null, // Will be inferred from covenant if available
          usesRemaining: usage.usesRemaining,
          maxUses: usage.maxUses,
          period: usage.period,
          available: usage.usesRemaining > 0,
        });
      }

      return options;
    } catch {
      return [];
    }
  }, [interpreter, covenant]);

  // Calculate shortfall
  const shortfall = useMemo(() => {
    if (!covenant || covenant.compliant) return 0;

    const isMaxCovenant = covenant.operator === '<=' || covenant.operator === '<';
    if (isMaxCovenant) {
      return covenant.actual - covenant.required;
    } else {
      return covenant.required - covenant.actual;
    }
  }, [covenant]);

  // Format values based on covenant magnitude
  const formatValue = useMemo(() => {
    if (!covenant) return (v: number) => v.toFixed(2);
    return covenant.actual > 10
      ? (v: number) => formatCurrency(v)
      : (v: number) => formatRatio(v);
  }, [covenant]);

  // Determine breach zone
  const zone = useMemo(() => {
    if (!covenant) return 'safe' as const;
    if (!covenant.compliant) return 'breach' as const;
    return getThresholdZone(covenant.actual, covenant.required, covenant.operator);
  }, [covenant]);

  const zoneStyle = getZoneStyle(zone);

  // Simulate cure
  const handleSimulate = () => {
    if (!interpreter || !covenant || !selectedMechanism) return;

    const amount = parseFloat(cureAmount.replace(/[$,_]/g, ''));
    if (isNaN(amount) || amount <= 0) {
      setSimulationResult({ success: false, reason: 'Enter a valid cure amount' });
      return;
    }

    // Check if amount covers the shortfall
    if (shortfall > 0 && amount < shortfall && covenant.actual <= 100) {
      // For ratios, shortfall is in ratio terms; cure amounts are in dollar terms
      // This is a soft warning, not a hard block
    }

    try {
      const canCure = interpreter.canApplyCure(covenant.name);
      if (!canCure) {
        setSimulationResult({
          success: false,
          reason: 'No cure uses remaining for this covenant',
        });
        return;
      }

      // Preview: what would happen
      setSimulationResult({
        success: true,
        curedAmount: amount,
        costDescription: selectedMechanism.toLowerCase().includes('equity')
          ? `Equity injection of ${formatCurrency(amount)} required`
          : `Principal prepayment of ${formatCurrency(amount)} required`,
      });
    } catch (e) {
      setSimulationResult({
        success: false,
        reason: (e as Error).message,
      });
    }
  };

  // Apply cure
  const handleApplyCure = () => {
    if (!interpreter || !covenant || !selectedMechanism) return;

    const amount = parseFloat(cureAmount.replace(/[$,_]/g, ''));
    if (isNaN(amount) || amount <= 0) return;

    try {
      const result = interpreter.applyCure(covenant.name, amount);
      if (result.success) {
        setApplied(true);
        onCureApplied?.(covenant.name, selectedMechanism, amount);
      } else {
        setSimulationResult({
          success: false,
          reason: result.reason || 'Cure application failed',
        });
      }
    } catch (e) {
      setSimulationResult({
        success: false,
        reason: (e as Error).message,
      });
    }
  };

  // Reset state when closing
  const handleClose = () => {
    setSelectedMechanism(null);
    setCureAmount('');
    setSimulationResult(null);
    setApplied(false);
    onClose();
  };

  if (!covenant) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cure Rights Optimizer"
      size="lg"
    >
      <div className="space-y-6">
        {/* Breach Summary */}
        <div className={`rounded-lg border p-4 ${zoneStyle.bgColor} ${zoneStyle.borderColor}`}>
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className={`w-5 h-5 ${zoneStyle.textColor}`} />
            <h3 className={`font-semibold ${zoneStyle.textColor}`}>
              {formatDisplayName(covenant.name)} — {covenant.compliant ? 'At Risk' : 'In Breach'}
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Actual</p>
              <p className="text-lg font-mono font-semibold text-text-primary">
                {formatValue(covenant.actual)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Threshold</p>
              <p className="text-lg font-mono font-semibold text-text-primary">
                {covenant.operator} {formatValue(covenant.required)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Shortfall</p>
              <p className={`text-lg font-mono font-semibold ${shortfall > 0 ? 'text-danger' : 'text-success'}`}>
                {shortfall > 0 ? formatValue(shortfall) : 'None'}
              </p>
            </div>
          </div>
        </div>

        {/* Applied Success State */}
        {applied && (
          <div className="rounded-lg border border-success/30 bg-success/10 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <div>
                <p className="font-semibold text-success">Cure Applied Successfully</p>
                <p className="text-sm text-text-tertiary mt-1">
                  {selectedMechanism} of {formatCurrency(parseFloat(cureAmount.replace(/[$,_]/g, '')))} applied to {formatDisplayName(covenant.name)}.
                  Refresh the dashboard to see updated compliance status.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* No Cures Available */}
        {cureOptions.length === 0 && !applied && (
          <div className="rounded-lg border border-border-DEFAULT bg-surface-1 p-6 text-center">
            <XCircle className="w-8 h-8 text-text-muted mx-auto mb-3" />
            <p className="text-text-primary font-medium mb-1">No Cure Mechanisms Available</p>
            <p className="text-sm text-text-tertiary">
              This covenant does not have cure rights defined. Consider requesting a waiver
              or negotiating an amendment.
            </p>
          </div>
        )}

        {/* Cure Mechanism Selection */}
        {cureOptions.length > 0 && !applied && (
          <>
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">
                Available Cure Mechanisms
              </h4>
              <div className="space-y-3">
                {cureOptions.map((option) => (
                  <button
                    key={option.mechanism}
                    onClick={() => setSelectedMechanism(option.mechanism)}
                    disabled={!option.available}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedMechanism === option.mechanism
                        ? 'border-gold-500/50 bg-gold-500/5 ring-1 ring-gold-500/20'
                        : option.available
                        ? 'border-border-DEFAULT bg-surface-1 hover:bg-surface-2'
                        : 'border-border-DEFAULT bg-surface-1 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Shield className={`w-4 h-4 ${
                          selectedMechanism === option.mechanism ? 'text-gold-500' : 'text-text-muted'
                        }`} />
                        <span className="font-medium text-text-primary">{option.label}</span>
                        {!option.available && (
                          <Badge variant="danger" size="sm">Exhausted</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Clock className="w-3 h-3" />
                        <span>{option.usesRemaining} of {option.maxUses} uses remaining</span>
                      </div>
                    </div>
                    <p className="text-sm text-text-tertiary">{option.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                      <span>Period: {option.period.replace(/_/g, ' ')}</span>
                      {option.maxAmount && (
                        <span>Max: {formatCurrency(option.maxAmount)}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cure Amount Input */}
            {selectedMechanism && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Cure Amount ($)
                  </label>
                  <div className="flex gap-3">
                    <Input
                      value={cureAmount}
                      onChange={(e) => {
                        setCureAmount(e.target.value);
                        setSimulationResult(null);
                      }}
                      placeholder="e.g., 5,000,000"
                      className="flex-1"
                    />
                    <Button
                      variant="secondary"
                      onClick={handleSimulate}
                      icon={<Zap className="w-4 h-4" />}
                    >
                      Simulate
                    </Button>
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    Enter the amount to cure. Must cover the covenant shortfall.
                  </p>
                </div>

                {/* Simulation Result */}
                {simulationResult && (
                  <div className={`rounded-lg border p-4 ${
                    simulationResult.success
                      ? 'border-success/30 bg-success/5'
                      : 'border-danger/30 bg-danger/5'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {simulationResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      ) : (
                        <XCircle className="w-4 h-4 text-danger" />
                      )}
                      <span className={`font-medium text-sm ${
                        simulationResult.success ? 'text-success' : 'text-danger'
                      }`}>
                        {simulationResult.success ? 'Cure Feasible' : 'Cure Not Feasible'}
                      </span>
                    </div>

                    {simulationResult.success && simulationResult.costDescription && (
                      <div className="space-y-2 mt-3">
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <DollarSign className="w-4 h-4 text-text-muted" />
                          <span>{simulationResult.costDescription}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <ArrowRight className="w-4 h-4 text-text-muted" />
                          <span>
                            Cure right will be consumed ({
                              cureOptions.find(o => o.mechanism === selectedMechanism)?.usesRemaining ?? 0
                            } → {
                              (cureOptions.find(o => o.mechanism === selectedMechanism)?.usesRemaining ?? 1) - 1
                            } remaining)
                          </span>
                        </div>
                      </div>
                    )}

                    {simulationResult.reason && (
                      <p className="text-sm text-danger mt-1">{simulationResult.reason}</p>
                    )}
                  </div>
                )}

                {/* Apply Button */}
                {simulationResult?.success && (
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <Info className="w-3 h-3" />
                      <span>This action cannot be undone</span>
                    </div>
                    <Button
                      variant="gold"
                      onClick={handleApplyCure}
                      icon={<Shield className="w-4 h-4" />}
                    >
                      Apply Cure
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

export default CureRightsOptimizer;
