/**
 * Scenario Simulator
 *
 * "What if" analysis tool for pro forma covenant testing.
 * Allows users to adjust financial inputs and see real-time covenant impact.
 */
import { useState, useMemo, ChangeEvent } from 'react';
import { Calculator, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button, Input, Select } from '../base';
import { trackScenarioSimulated } from '../../utils/analytics';

interface CovenantResult {
  name: string;
  actual: number;
  threshold: number;
  compliant: boolean;
  headroom: number;
}

interface AdjustmentField {
  key: string;
  label: string;
  currentValue: number;
}

interface ScenarioSimulatorProps {
  fields: AdjustmentField[];
  calculateCovenants: (financials: Record<string, number>) => CovenantResult[];
  className?: string;
}

interface Adjustment {
  field: string;
  type: 'absolute' | 'percentage';
  value: string;
}

const formatCurrency = (amount: number): string => {
  if (Math.abs(amount) >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(0)}`;
};

const adjustmentTypeOptions = [
  { value: 'percentage', label: '%' },
  { value: 'absolute', label: '$' },
];

export function ScenarioSimulator({
  fields,
  calculateCovenants,
  className = '',
}: ScenarioSimulatorProps) {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([
    { field: fields[0]?.key ?? '', type: 'percentage', value: '' },
  ]);
  const [showResults, setShowResults] = useState(false);

  // Calculate baseline financials
  const baselineFinancials = useMemo(() => {
    const result: Record<string, number> = {};
    for (const field of fields) {
      result[field.key] = field.currentValue;
    }
    return result;
  }, [fields]);

  // Calculate adjusted financials
  const adjustedFinancials = useMemo(() => {
    const result = { ...baselineFinancials };

    for (const adj of adjustments) {
      if (!adj.field || !adj.value || adj.value.trim() === '') continue;

      const numValue = parseFloat(adj.value);
      if (isNaN(numValue)) continue;

      const currentValue = result[adj.field] ?? 0;
      if (adj.type === 'percentage') {
        result[adj.field] = currentValue * (1 + numValue / 100);
      } else {
        result[adj.field] = currentValue + numValue;
      }
    }

    return result;
  }, [baselineFinancials, adjustments]);

  // Calculate covenant results
  const baselineResults = useMemo(
    () => calculateCovenants(baselineFinancials),
    [calculateCovenants, baselineFinancials]
  );

  const scenarioResults = useMemo(
    () => calculateCovenants(adjustedFinancials),
    [calculateCovenants, adjustedFinancials]
  );

  // Build comparison
  const comparison = useMemo(() => {
    return baselineResults.map((baseline) => {
      const scenario = scenarioResults.find((s) => s.name === baseline.name);
      if (!scenario) return null;

      const change = scenario.actual - baseline.actual;
      const changePercent = baseline.actual !== 0 ? (change / baseline.actual) * 100 : 0;

      let impactType: 'improved' | 'worsened' | 'unchanged';
      if (Math.abs(change) < 0.001) {
        impactType = 'unchanged';
      } else if (scenario.headroom > baseline.headroom) {
        impactType = 'improved';
      } else {
        impactType = 'worsened';
      }

      return {
        name: baseline.name,
        baselineActual: baseline.actual,
        scenarioActual: scenario.actual,
        baselineCompliant: baseline.compliant,
        scenarioCompliant: scenario.compliant,
        change,
        changePercent,
        impactType,
        threshold: baseline.threshold,
      };
    }).filter(Boolean);
  }, [baselineResults, scenarioResults]);

  const allCompliant = scenarioResults.every((c) => c.compliant);

  const handleAddAdjustment = () => {
    setAdjustments([...adjustments, { field: '', type: 'percentage', value: '' }]);
  };

  const handleRemoveAdjustment = (index: number) => {
    setAdjustments(adjustments.filter((_, i) => i !== index));
  };

  const handleAdjustmentChange = (
    index: number,
    key: keyof Adjustment,
    e: ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const newAdjustments = [...adjustments];
    newAdjustments[index] = { ...newAdjustments[index]!, [key]: e.target.value };
    setAdjustments(newAdjustments);
  };

  const handleReset = () => {
    setAdjustments([{ field: fields[0]?.key ?? '', type: 'percentage', value: '' }]);
    setShowResults(false);
  };

  const handleSimulate = () => {
    trackScenarioSimulated();
    setShowResults(true);
  };

  const fieldOptions = fields.map((f) => ({
    value: f.key,
    label: f.label,
  }));

  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Calculator className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Scenario Simulator</h3>
            <p className="text-sm text-slate-400">
              Test "what if" scenarios on covenant compliance
            </p>
          </div>
        </div>
      </div>

      {/* Adjustments */}
      <div className="p-6 border-b border-slate-700">
        <h4 className="text-sm font-medium text-slate-400 mb-4">Adjustments</h4>
        <div className="space-y-3">
          {adjustments.map((adj, index) => (
            <div key={index} className="flex items-end gap-3">
              <div className="flex-1">
                <Select
                  label={index === 0 ? 'Field' : undefined}
                  options={fieldOptions}
                  value={adj.field}
                  onChange={(v) => handleAdjustmentChange(index, 'field', v)}
                  placeholder="Select field..."
                />
              </div>
              <div className="w-24">
                <Select
                  label={index === 0 ? 'Type' : undefined}
                  options={adjustmentTypeOptions}
                  value={adj.type}
                  onChange={(v) => handleAdjustmentChange(index, 'type', v)}
                />
              </div>
              <div className="w-32">
                <Input
                  label={index === 0 ? 'Change' : undefined}
                  value={adj.value}
                  onChange={(v) => handleAdjustmentChange(index, 'value', v)}
                  placeholder={adj.type === 'percentage' ? '+10' : '+1M'}
                />
              </div>
              {adjustments.length > 1 && (
                <button
                  onClick={() => handleRemoveAdjustment(index)}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleAddAdjustment}
            className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
          >
            + Add adjustment
          </button>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button variant="gold" onClick={handleSimulate}>
            <Calculator className="h-4 w-4 mr-2" />
            Run Scenario
          </Button>
          <Button variant="ghost" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>

      {/* Results */}
      {showResults && (
        <div className="p-6">
          {/* Overall Status */}
          <div className={`mb-6 p-4 rounded-lg ${
            allCompliant ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
          }`}>
            <div className="flex items-center gap-3">
              {allCompliant ? (
                <CheckCircle className="h-6 w-6 text-green-400" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-red-400" />
              )}
              <div>
                <div className={`font-semibold ${allCompliant ? 'text-green-400' : 'text-red-400'}`}>
                  {allCompliant ? 'All Covenants Pass' : 'Covenant Breach Detected'}
                </div>
                <div className="text-sm text-slate-400">
                  {scenarioResults.filter((c) => c.compliant).length} of {scenarioResults.length} covenants compliant under this scenario
                </div>
              </div>
            </div>
          </div>

          {/* Adjusted Values */}
          <h4 className="text-sm font-medium text-slate-400 mb-3">Adjusted Financials</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {fields.map((field) => {
              const baseline = baselineFinancials[field.key] ?? 0;
              const adjusted = adjustedFinancials[field.key] ?? 0;
              const change = adjusted - baseline;
              const changePercent = baseline !== 0 ? (change / baseline) * 100 : 0;

              return (
                <div key={field.key} className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-1">{field.label}</div>
                  <div className="text-white font-medium">{formatCurrency(adjusted)}</div>
                  {change !== 0 && (
                    <div className={`text-xs ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {change > 0 ? '+' : ''}{changePercent.toFixed(1)}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Covenant Impact */}
          <h4 className="text-sm font-medium text-slate-400 mb-3">Covenant Impact</h4>
          <div className="space-y-3">
            {comparison.map((c) => {
              if (!c) return null;

              return (
                <div
                  key={c.name}
                  className={`p-4 rounded-lg border ${
                    c.scenarioCompliant
                      ? 'bg-slate-700/30 border-slate-600'
                      : 'bg-red-500/10 border-red-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {c.impactType === 'improved' ? (
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      ) : c.impactType === 'worsened' ? (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      ) : (
                        <Minus className="h-4 w-4 text-slate-400" />
                      )}
                      <div>
                        <div className="text-white font-medium">{c.name}</div>
                        <div className="text-sm text-slate-400">
                          Threshold: {c.threshold.toFixed(2)}x
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-3">
                        <div className="text-slate-400">
                          {c.baselineActual.toFixed(2)}x
                        </div>
                        <span className="text-slate-500">→</span>
                        <div className={c.scenarioCompliant ? 'text-green-400' : 'text-red-400'}>
                          {c.scenarioActual.toFixed(2)}x
                        </div>
                      </div>
                      <div className={`text-sm ${
                        c.impactType === 'improved'
                          ? 'text-green-400'
                          : c.impactType === 'worsened'
                          ? 'text-red-400'
                          : 'text-slate-400'
                      }`}>
                        {c.change > 0 ? '+' : ''}{c.changePercent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ScenarioSimulator;
