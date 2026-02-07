/**
 * CovenantEditor - v2.2 Negotiation Editor
 *
 * Form-based editor for creating and editing financial covenants.
 * Generates both ProViso code and Word prose in real-time.
 */
import { useState, useMemo, useCallback } from 'react';
import { FileCode, FileText, Copy, Check, Plus, Trash2 } from 'lucide-react';
import { Modal } from '../base/Modal';
import { Input } from '../base/Input';
import { Select } from '../base/Select';
import { Button } from '../base/Button';
import { Badge } from '../base/Badge';
import { HighlightedCode } from '../SourceCodeViewer';
import {
  generateCovenantCode,
  formatCurrencyCode,
  type CovenantCodeInput,
} from '../../utils/codeGenerators';

// =============================================================================
// TYPES
// =============================================================================

export interface CovenantFormValues {
  name: string;
  displayTitle: string;
  metric: string;
  customExpression: string;
  operator: '<=' | '>=' | '<' | '>';
  threshold: number;
  testFrequency: 'quarterly' | 'monthly' | 'annually' | 'semi-annually';
  hasCure: boolean;
  cureType: 'EquityCure' | 'PaymentCure';
  cureMaxUses: number;
  cureOverPeriod: string;
  cureMaxAmount: number;
  curePeriod: string;
  hasStepDowns: boolean;
  stepDowns: Array<{ date: string; threshold: number }>;
  sectionRef: string;
}

export interface CovenantEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (code: string, prose: string, values: CovenantFormValues) => void;
  initialValues?: Partial<CovenantFormValues>;
  mode?: 'create' | 'edit';
}

const defaultValues: CovenantFormValues = {
  name: '',
  displayTitle: '',
  metric: 'Leverage',
  customExpression: '',
  operator: '<=',
  threshold: 5.0,
  testFrequency: 'quarterly',
  hasCure: false,
  cureType: 'EquityCure',
  cureMaxUses: 2,
  cureOverPeriod: 'rolling 4 quarters',
  cureMaxAmount: 10000000,
  curePeriod: '10 business days',
  hasStepDowns: false,
  stepDowns: [],
  sectionRef: '7.11(a)',
};

// =============================================================================
// CONSTANTS
// =============================================================================

const METRIC_OPTIONS = [
  { value: 'Leverage', label: 'Leverage Ratio', description: 'Total Debt / EBITDA' },
  { value: 'InterestCoverage', label: 'Interest Coverage', description: 'EBITDA / Interest Expense' },
  { value: 'DSCR', label: 'Debt Service Coverage', description: 'Cash Flow / Debt Service' },
  { value: 'FixedChargeCoverage', label: 'Fixed Charge Coverage', description: 'EBITDA / Fixed Charges' },
  { value: 'MinEBITDA', label: 'Minimum EBITDA', description: 'Absolute EBITDA amount' },
  { value: 'MaxCapEx', label: 'Maximum CapEx', description: 'Capital Expenditure limit' },
  { value: 'MinLiquidity', label: 'Minimum Liquidity', description: 'Cash + available revolving' },
  { value: 'Custom', label: 'Custom Expression', description: 'Define custom calculation' },
];

const OPERATOR_OPTIONS = [
  { value: '<=', label: 'shall not exceed (\u2264)' },
  { value: '>=', label: 'shall not be less than (\u2265)' },
  { value: '<', label: 'shall be less than (<)' },
  { value: '>', label: 'shall be greater than (>)' },
];

const FREQUENCY_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi-annually', label: 'Semi-Annually' },
  { value: 'annually', label: 'Annually' },
];

const CURE_TYPE_OPTIONS = [
  { value: 'EquityCure', label: 'Equity Cure' },
  { value: 'PaymentCure', label: 'Payment Cure' },
];

// =============================================================================
// PROSE GENERATION
// =============================================================================

function getMetricDisplayName(metric: string): string {
  const map: Record<string, string> = {
    Leverage: 'Leverage Ratio (Total Debt to Consolidated EBITDA)',
    InterestCoverage: 'Interest Coverage Ratio (Consolidated EBITDA to Interest Expense)',
    DSCR: 'Debt Service Coverage Ratio',
    FixedChargeCoverage: 'Fixed Charge Coverage Ratio',
    MinEBITDA: 'Consolidated EBITDA',
    MaxCapEx: 'Capital Expenditures',
    MinLiquidity: 'Liquidity',
  };
  return map[metric] || metric;
}

function getOperatorDisplay(operator: string): string {
  const map: Record<string, string> = {
    '<=': 'exceed',
    '>=': 'be less than',
    '<': 'equal or exceed',
    '>': 'be less than or equal to',
  };
  return map[operator] || operator;
}

function getFrequencyDisplay(frequency: string): string {
  const map: Record<string, string> = {
    monthly: 'fiscal month',
    quarterly: 'fiscal quarter',
    'semi-annually': 'semi-annual period',
    annually: 'fiscal year',
  };
  return map[frequency] || frequency;
}

function generateWordProse(values: CovenantFormValues): string {
  const metricDisplay = values.metric === 'Custom'
    ? values.customExpression
    : getMetricDisplayName(values.metric);
  const operatorDisplay = getOperatorDisplay(values.operator);
  const frequencyDisplay = getFrequencyDisplay(values.testFrequency);
  const thresholdDisplay = values.threshold.toFixed(2);

  let prose = `(${values.sectionRef}) ${values.displayTitle || values.name}. `;
  prose += `The Borrower shall not permit the ${metricDisplay} `;
  prose += `as of the last day of any ${frequencyDisplay} `;
  prose += `to ${operatorDisplay} ${thresholdDisplay} to 1.00`;

  if (values.hasCure) {
    prose += `; provided that the Borrower may exercise a ${values.cureType} `;
    prose += `with respect to any failure to comply with this Section ${values.sectionRef} `;
    prose += `in accordance with Section 8.05`;
  }

  prose += '.';

  if (values.hasStepDowns && values.stepDowns.length > 0) {
    prose += '\n\nStep-Down Schedule:\n';
    for (const step of values.stepDowns) {
      prose += `  - On or after ${step.date}: ${step.threshold.toFixed(2)} to 1.00\n`;
    }
  }

  return prose;
}

// =============================================================================
// VALIDATION
// =============================================================================

interface ValidationErrors {
  name?: string;
  threshold?: string;
  customExpression?: string;
  cureMaxUses?: string;
  cureMaxAmount?: string;
}

function validateForm(values: CovenantFormValues): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!values.name) {
    errors.name = 'Covenant name is required';
  } else if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(values.name)) {
    errors.name = 'Must start with a letter and contain only letters, numbers, and underscores';
  }

  if (values.threshold <= 0) {
    errors.threshold = 'Threshold must be greater than 0';
  }

  if (values.metric === 'Custom' && !values.customExpression) {
    errors.customExpression = 'Custom expression is required';
  }

  if (values.hasCure) {
    if (values.cureMaxUses <= 0) {
      errors.cureMaxUses = 'Max uses must be at least 1';
    }
    if (values.cureMaxAmount <= 0) {
      errors.cureMaxAmount = 'Max amount must be greater than 0';
    }
  }

  return errors;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CovenantEditor({
  isOpen,
  onClose,
  onSave,
  initialValues,
  mode = 'create',
}: CovenantEditorProps) {
  const [values, setValues] = useState<CovenantFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedProse, setCopiedProse] = useState(false);

  // Generate code preview
  const generatedCode = useMemo(() => {
    const input: CovenantCodeInput = {
      name: values.name || 'CovenantName',
      metric: values.metric === 'Custom' ? values.customExpression : values.metric,
      operator: values.operator,
      threshold: values.threshold,
      tested: values.testFrequency as 'quarterly' | 'annually' | 'monthly',
    };

    if (values.hasCure) {
      input.cure = {
        type: values.cureType,
        maxUses: values.cureMaxUses,
        overPeriod: values.cureOverPeriod,
        maxAmount: values.cureMaxAmount,
        curePeriod: values.curePeriod,
      };
    }

    return generateCovenantCode(input);
  }, [values]);

  // Generate prose preview
  const generatedProse = useMemo(() => {
    return generateWordProse(values);
  }, [values]);

  const updateField = useCallback(<K extends keyof CovenantFormValues>(
    field: K,
    value: CovenantFormValues[K]
  ) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyProse = async () => {
    try {
      await navigator.clipboard.writeText(generatedProse);
      setCopiedProse(true);
      setTimeout(() => setCopiedProse(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSave = () => {
    const validationErrors = validateForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave(generatedCode, generatedProse, values);
    onClose();
  };

  const addStepDown = () => {
    const newStep = { date: '', threshold: values.threshold - 0.25 };
    updateField('stepDowns', [...values.stepDowns, newStep]);
  };

  const removeStepDown = (index: number) => {
    updateField('stepDowns', values.stepDowns.filter((_, i) => i !== index));
  };

  const updateStepDown = (index: number, field: 'date' | 'threshold', value: string | number) => {
    const updated = [...values.stepDowns];
    const step = updated[index];
    if (step) {
      if (field === 'date') {
        step.date = value as string;
      } else {
        step.threshold = value as number;
      }
    }
    updateField('stepDowns', updated);
  };

  const modalTitle = mode === 'create' ? 'Add Financial Covenant' : 'Edit Covenant';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="xl"
    >
      <div className="grid grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
        {/* Left Column: Form */}
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-3">
            <Input
              label="Covenant Name"
              placeholder="e.g., MaxLeverage"
              value={values.name}
              onChange={(e) => updateField('name', e.target.value)}
              error={errors.name}
              helpText="Internal name (letters, numbers, underscores only)"
            />

            <Input
              label="Display Title"
              placeholder="e.g., Maximum Leverage Ratio"
              value={values.displayTitle}
              onChange={(e) => updateField('displayTitle', e.target.value)}
              helpText="Title for legal documents"
            />
          </div>

          {/* Covenant Test */}
          <div className="border border-border-DEFAULT rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-medium text-text-primary mb-2">Covenant Test</h3>

            <Select
              label="Financial Metric"
              value={values.metric}
              onChange={(e) => updateField('metric', e.target.value)}
              options={METRIC_OPTIONS.map(m => ({ value: m.value, label: `${m.label} - ${m.description}` }))}
            />

            {values.metric === 'Custom' && (
              <Input
                label="Custom Expression"
                placeholder="e.g., TotalDebt / EBITDA"
                value={values.customExpression}
                onChange={(e) => updateField('customExpression', e.target.value)}
                error={errors.customExpression}
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Operator"
                value={values.operator}
                onChange={(e) => updateField('operator', e.target.value as CovenantFormValues['operator'])}
                options={OPERATOR_OPTIONS}
              />

              <Input
                label="Threshold"
                type="number"
                step="0.01"
                value={values.threshold}
                onChange={(e) => updateField('threshold', parseFloat(e.target.value) || 0)}
                error={errors.threshold}
              />
            </div>

            <Select
              label="Testing Frequency"
              value={values.testFrequency}
              onChange={(e) => updateField('testFrequency', e.target.value as CovenantFormValues['testFrequency'])}
              options={FREQUENCY_OPTIONS}
            />

            <Input
              label="Section Reference"
              placeholder="7.11(a)"
              value={values.sectionRef}
              onChange={(e) => updateField('sectionRef', e.target.value)}
              helpText="Credit agreement section number"
            />
          </div>

          {/* Cure Rights */}
          <div className="border border-border-DEFAULT rounded-lg p-4 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={values.hasCure}
                onChange={(e) => updateField('hasCure', e.target.checked)}
                className="w-4 h-4 rounded border-border-strong bg-surface-2 text-gold-500 focus:ring-gold-500"
              />
              <span className="text-sm font-medium text-text-primary">Include Cure Rights</span>
            </label>

            {values.hasCure && (
              <div className="space-y-3 pt-2">
                <Select
                  label="Cure Type"
                  value={values.cureType}
                  onChange={(e) => updateField('cureType', e.target.value as CovenantFormValues['cureType'])}
                  options={CURE_TYPE_OPTIONS}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Max Uses"
                    type="number"
                    value={values.cureMaxUses}
                    onChange={(e) => updateField('cureMaxUses', parseInt(e.target.value) || 0)}
                    error={errors.cureMaxUses}
                  />

                  <Input
                    label="Over Period"
                    placeholder="rolling 4 quarters"
                    value={values.cureOverPeriod}
                    onChange={(e) => updateField('cureOverPeriod', e.target.value)}
                  />
                </div>

                <Input
                  label="Max Amount"
                  type="number"
                  value={values.cureMaxAmount}
                  onChange={(e) => updateField('cureMaxAmount', parseInt(e.target.value) || 0)}
                  error={errors.cureMaxAmount}
                  helpText={values.cureMaxAmount > 0 ? formatCurrencyCode(values.cureMaxAmount) : undefined}
                />

                <Input
                  label="Cure Period"
                  placeholder="10 business days"
                  value={values.curePeriod}
                  onChange={(e) => updateField('curePeriod', e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Step-Downs (Future enhancement) */}
          <div className="border border-border-DEFAULT rounded-lg p-4 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={values.hasStepDowns}
                onChange={(e) => updateField('hasStepDowns', e.target.checked)}
                className="w-4 h-4 rounded border-border-strong bg-surface-2 text-gold-500 focus:ring-gold-500"
              />
              <span className="text-sm font-medium text-text-primary">Include Step-Downs</span>
              <Badge variant="muted" size="sm">Optional</Badge>
            </label>

            {values.hasStepDowns && (
              <div className="space-y-2 pt-2">
                {values.stepDowns.map((step, idx) => (
                  <div key={idx} className="flex items-end gap-2">
                    <Input
                      label={idx === 0 ? "Date" : undefined}
                      type="date"
                      value={step.date}
                      onChange={(e) => updateStepDown(idx, 'date', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      label={idx === 0 ? "Threshold" : undefined}
                      type="number"
                      step="0.01"
                      value={step.threshold}
                      onChange={(e) => updateStepDown(idx, 'threshold', parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStepDown(idx)}
                      icon={<Trash2 className="w-4 h-4" />}
                    />
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addStepDown}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Step-Down
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="space-y-4">
          {/* Code Preview */}
          <div className="border border-border-DEFAULT rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-surface-3 border-b border-border-DEFAULT">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-text-tertiary" />
                <span className="text-sm font-medium text-text-primary">ProViso Code</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyCode}
                icon={copiedCode ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              >
                {copiedCode ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <div className="p-4 max-h-48 overflow-auto">
              <HighlightedCode code={generatedCode} />
            </div>
          </div>

          {/* Prose Preview */}
          <div className="border border-border-DEFAULT rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-surface-3 border-b border-border-DEFAULT">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-text-tertiary" />
                <span className="text-sm font-medium text-text-primary">Word Document</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyProse}
                icon={copiedProse ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              >
                {copiedProse ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <div className="p-4 max-h-64 overflow-auto">
              <p className="text-sm text-text-secondary whitespace-pre-wrap font-serif leading-relaxed">
                {generatedProse}
              </p>
            </div>
          </div>

          {/* Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="border border-danger/30 bg-danger/10 rounded-lg p-4">
              <h4 className="text-sm font-medium text-danger mb-2">Please fix the following errors:</h4>
              <ul className="list-disc list-inside text-sm text-danger/80 space-y-1">
                {Object.values(errors).map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-DEFAULT">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="gold" onClick={handleSave}>
          {mode === 'create' ? 'Add to Agreement' : 'Save Changes'}
        </Button>
      </div>
    </Modal>
  );
}

export default CovenantEditor;
