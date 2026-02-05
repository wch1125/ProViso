/**
 * BasketEditor - v2.2 Negotiation Editor
 *
 * Form-based editor for creating and editing investment/action baskets.
 * Supports fixed, grower (GreaterOf), and builder basket types.
 * Generates both ProViso code and Word prose in real-time.
 */
import { useState, useMemo, useCallback } from 'react';
import { FileCode, FileText, Copy, Check } from 'lucide-react';
import { Modal } from '../base/Modal';
import { Input } from '../base/Input';
import { Select } from '../base/Select';
import { Button } from '../base/Button';
import { Tabs, TabList, TabTrigger, TabPanel } from '../base/Tabs';
import { HighlightedCode } from '../SourceCodeViewer';
import {
  generateBasketCode,
  formatCurrencyCode,
  type BasketCodeInput,
} from '../../utils/codeGenerators';

// =============================================================================
// TYPES
// =============================================================================

export type BasketType = 'fixed' | 'grower' | 'builder';

export interface BasketFormValues {
  name: string;
  displayTitle: string;
  type: BasketType;
  sectionRef: string;

  // Fixed basket
  fixedCapacity: number;

  // Grower basket
  growerBase: number;
  growerPercentage: number;
  growerMetric: string;
  growerFloor: number;
  hasFloor: boolean;

  // Builder basket
  builderSource: string;
  builderStarting: number;
  builderMaximum: number;
  hasMaximum: boolean;

  // Common
  subjectTo: string[];
  hasSubjectTo: boolean;
}

export interface BasketEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (code: string, prose: string, values: BasketFormValues) => void;
  initialValues?: Partial<BasketFormValues>;
  mode?: 'create' | 'edit';
}

const defaultValues: BasketFormValues = {
  name: '',
  displayTitle: '',
  type: 'fixed',
  sectionRef: '7.02(f)',

  fixedCapacity: 25000000,

  growerBase: 25000000,
  growerPercentage: 15,
  growerMetric: 'EBITDA',
  growerFloor: 20000000,
  hasFloor: true,

  builderSource: 'RetainedExcessCashFlow',
  builderStarting: 0,
  builderMaximum: 50000000,
  hasMaximum: true,

  subjectTo: [],
  hasSubjectTo: false,
};

// =============================================================================
// CONSTANTS
// =============================================================================

const METRIC_OPTIONS = [
  { value: 'EBITDA', label: 'Consolidated EBITDA' },
  { value: 'TotalAssets', label: 'Total Assets' },
  { value: 'Revenue', label: 'Total Revenue' },
  { value: 'TangibleNetWorth', label: 'Tangible Net Worth' },
];

const BUILDER_SOURCE_OPTIONS = [
  { value: 'RetainedExcessCashFlow', label: 'Retained Excess Cash Flow' },
  { value: 'AssetSaleProceeds', label: 'Asset Sale Proceeds' },
  { value: 'EquityIssuanceProceeds', label: 'Equity Issuance Proceeds' },
  { value: 'ExtraordinaryReceipts', label: 'Extraordinary Receipts' },
];

const SUBJECT_TO_OPTIONS = [
  { id: 'no-default', label: 'no Event of Default exists', code: 'NoDefault' },
  { id: 'pf-leverage', label: 'pro forma leverage test satisfied', code: 'ProFormaLeverage' },
  { id: 'pf-coverage', label: 'pro forma coverage test satisfied', code: 'ProFormaCoverage' },
  { id: 'payment-condition', label: 'Payment Condition satisfied', code: 'PaymentCondition' },
];

// =============================================================================
// PROSE GENERATION
// =============================================================================

function generateWordProse(values: BasketFormValues): string {
  let prose = `(${values.sectionRef}) ${values.displayTitle || values.name}; `;

  switch (values.type) {
    case 'fixed':
      prose += `investments made pursuant to this clause (${values.sectionRef.split('(')[1] || 'f)'} `;
      prose += `not to exceed ${formatCurrencyDisplay(values.fixedCapacity)}`;
      break;

    case 'grower':
      prose += `investments made pursuant to this clause (${values.sectionRef.split('(')[1] || 'f)'} `;
      prose += `not to exceed the greater of (x) ${formatCurrencyDisplay(values.growerBase)} `;
      prose += `and (y) ${values.growerPercentage}% of ${getMetricDisplayName(values.growerMetric)}`;
      if (values.hasFloor && values.growerFloor > 0) {
        prose += ` (but in no event less than ${formatCurrencyDisplay(values.growerFloor)})`;
      }
      break;

    case 'builder':
      prose += `investments made pursuant to this clause (${values.sectionRef.split('(')[1] || 'f)'} `;
      prose += `not to exceed an amount equal to `;
      if (values.builderStarting > 0) {
        prose += `${formatCurrencyDisplay(values.builderStarting)} plus `;
      }
      prose += `the cumulative amount of ${getSourceDisplayName(values.builderSource)} `;
      prose += `received by the Borrower since the Closing Date`;
      if (values.hasMaximum && values.builderMaximum > 0) {
        prose += ` (but not to exceed ${formatCurrencyDisplay(values.builderMaximum)} in the aggregate)`;
      }
      break;
  }

  prose += ' in the aggregate outstanding at any time';

  if (values.hasSubjectTo && values.subjectTo.length > 0) {
    prose += `; provided that, at the time of making any such investment `;
    prose += `and after giving pro forma effect thereto, `;
    prose += values.subjectTo.map(s => getSubjectToDisplay(s)).join(' and ');
  }

  prose += '.';

  return prose;
}

function formatCurrencyDisplay(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)} billion`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(0)} million`;
  }
  return `$${value.toLocaleString('en-US')}`;
}

function getMetricDisplayName(metric: string): string {
  const map: Record<string, string> = {
    EBITDA: 'Consolidated EBITDA',
    TotalAssets: 'Total Assets',
    Revenue: 'Total Revenue',
    TangibleNetWorth: 'Tangible Net Worth',
  };
  return map[metric] || metric;
}

function getSourceDisplayName(source: string): string {
  const map: Record<string, string> = {
    RetainedExcessCashFlow: 'Retained Excess Cash Flow',
    AssetSaleProceeds: 'Asset Sale Proceeds',
    EquityIssuanceProceeds: 'Equity Issuance Proceeds',
    ExtraordinaryReceipts: 'Extraordinary Receipts',
  };
  return map[source] || source;
}

function getSubjectToDisplay(condition: string): string {
  const opt = SUBJECT_TO_OPTIONS.find(o => o.code === condition);
  return opt?.label || condition;
}

// =============================================================================
// VALIDATION
// =============================================================================

interface ValidationErrors {
  name?: string;
  fixedCapacity?: string;
  growerBase?: string;
  growerPercentage?: string;
  builderMaximum?: string;
}

function validateForm(values: BasketFormValues): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!values.name) {
    errors.name = 'Basket name is required';
  } else if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(values.name)) {
    errors.name = 'Must start with a letter and contain only letters, numbers, and underscores';
  }

  if (values.type === 'fixed' && values.fixedCapacity <= 0) {
    errors.fixedCapacity = 'Capacity must be greater than 0';
  }

  if (values.type === 'grower') {
    if (values.growerBase <= 0) {
      errors.growerBase = 'Base amount must be greater than 0';
    }
    if (values.growerPercentage <= 0 || values.growerPercentage > 100) {
      errors.growerPercentage = 'Percentage must be between 1 and 100';
    }
  }

  if (values.type === 'builder' && values.hasMaximum && values.builderMaximum <= 0) {
    errors.builderMaximum = 'Maximum must be greater than 0';
  }

  return errors;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function BasketEditor({
  isOpen,
  onClose,
  onSave,
  initialValues,
  mode = 'create',
}: BasketEditorProps) {
  const [values, setValues] = useState<BasketFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedProse, setCopiedProse] = useState(false);

  // Generate code preview
  const generatedCode = useMemo(() => {
    const input: BasketCodeInput = {
      name: values.name || 'BasketName',
      type: values.type,
      subjectTo: values.hasSubjectTo ? values.subjectTo : undefined,
    };

    switch (values.type) {
      case 'fixed':
        input.capacity = values.fixedCapacity;
        break;
      case 'grower':
        input.base = values.growerBase;
        input.percentage = values.growerPercentage;
        input.metric = values.growerMetric;
        if (values.hasFloor) {
          input.floor = values.growerFloor;
        }
        break;
      case 'builder':
        input.buildsFrom = values.builderSource;
        input.starting = values.builderStarting;
        if (values.hasMaximum) {
          input.maximum = values.builderMaximum;
        }
        break;
    }

    return generateBasketCode(input);
  }, [values]);

  // Generate prose preview
  const generatedProse = useMemo(() => {
    return generateWordProse(values);
  }, [values]);

  const updateField = useCallback(<K extends keyof BasketFormValues>(
    field: K,
    value: BasketFormValues[K]
  ) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const toggleSubjectTo = (code: string) => {
    const current = values.subjectTo;
    if (current.includes(code)) {
      updateField('subjectTo', current.filter(c => c !== code));
    } else {
      updateField('subjectTo', [...current, code]);
    }
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyProse = async () => {
    await navigator.clipboard.writeText(generatedProse);
    setCopiedProse(true);
    setTimeout(() => setCopiedProse(false), 2000);
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

  const modalTitle = mode === 'create' ? 'Add Basket' : 'Edit Basket';

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
              label="Basket Name"
              placeholder="e.g., GeneralInvestmentsBasket"
              value={values.name}
              onChange={(e) => updateField('name', e.target.value)}
              error={errors.name}
              helpText="Internal name (letters, numbers, underscores only)"
            />

            <Input
              label="Display Title"
              placeholder="e.g., General Investments Basket"
              value={values.displayTitle}
              onChange={(e) => updateField('displayTitle', e.target.value)}
              helpText="Title for legal documents"
            />

            <Input
              label="Section Reference"
              placeholder="7.02(f)"
              value={values.sectionRef}
              onChange={(e) => updateField('sectionRef', e.target.value)}
            />
          </div>

          {/* Basket Type Tabs */}
          <div className="border border-slate-700 rounded-lg overflow-hidden">
            <Tabs
              defaultTab={values.type}
              onChange={(type) => updateField('type', type as BasketType)}
            >
              <TabList className="bg-slate-800 border-b border-slate-700 px-4">
                <TabTrigger id="fixed">Fixed</TabTrigger>
                <TabTrigger id="grower">Grower</TabTrigger>
                <TabTrigger id="builder">Builder</TabTrigger>
              </TabList>

              {/* Fixed Basket */}
              <TabPanel id="fixed" className="p-4 space-y-3">
                <p className="text-sm text-slate-400 mb-3">
                  A fixed dollar amount that doesn&apos;t change with company performance.
                </p>
                <Input
                  label="Capacity"
                  type="number"
                  value={values.fixedCapacity}
                  onChange={(e) => updateField('fixedCapacity', parseInt(e.target.value) || 0)}
                  error={errors.fixedCapacity}
                  helpText={values.fixedCapacity > 0 ? formatCurrencyCode(values.fixedCapacity) : undefined}
                />
              </TabPanel>

              {/* Grower Basket */}
              <TabPanel id="grower" className="p-4 space-y-3">
                <p className="text-sm text-slate-400 mb-3">
                  Capacity that scales with company size - the greater of a fixed amount or percentage of a metric.
                </p>

                <Input
                  label="Base Amount"
                  type="number"
                  value={values.growerBase}
                  onChange={(e) => updateField('growerBase', parseInt(e.target.value) || 0)}
                  error={errors.growerBase}
                  helpText={values.growerBase > 0 ? formatCurrencyCode(values.growerBase) : undefined}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Percentage"
                    type="number"
                    value={values.growerPercentage}
                    onChange={(e) => updateField('growerPercentage', parseFloat(e.target.value) || 0)}
                    error={errors.growerPercentage}
                    helpText="%"
                  />

                  <Select
                    label="Of Metric"
                    value={values.growerMetric}
                    onChange={(e) => updateField('growerMetric', e.target.value)}
                    options={METRIC_OPTIONS}
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={values.hasFloor}
                    onChange={(e) => updateField('hasFloor', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-accent-500 focus:ring-accent-500"
                  />
                  <span className="text-sm text-slate-300">Include Floor</span>
                </label>

                {values.hasFloor && (
                  <Input
                    label="Floor Amount"
                    type="number"
                    value={values.growerFloor}
                    onChange={(e) => updateField('growerFloor', parseInt(e.target.value) || 0)}
                    helpText={values.growerFloor > 0 ? formatCurrencyCode(values.growerFloor) : undefined}
                  />
                )}
              </TabPanel>

              {/* Builder Basket */}
              <TabPanel id="builder" className="p-4 space-y-3">
                <p className="text-sm text-slate-400 mb-3">
                  Capacity that accumulates over time from a specified source.
                </p>

                <Select
                  label="Builds From"
                  value={values.builderSource}
                  onChange={(e) => updateField('builderSource', e.target.value)}
                  options={BUILDER_SOURCE_OPTIONS}
                />

                <Input
                  label="Starting Amount"
                  type="number"
                  value={values.builderStarting}
                  onChange={(e) => updateField('builderStarting', parseInt(e.target.value) || 0)}
                  helpText={values.builderStarting > 0 ? formatCurrencyCode(values.builderStarting) : 'Initial capacity on closing date'}
                />

                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={values.hasMaximum}
                    onChange={(e) => updateField('hasMaximum', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-accent-500 focus:ring-accent-500"
                  />
                  <span className="text-sm text-slate-300">Include Maximum Cap</span>
                </label>

                {values.hasMaximum && (
                  <Input
                    label="Maximum"
                    type="number"
                    value={values.builderMaximum}
                    onChange={(e) => updateField('builderMaximum', parseInt(e.target.value) || 0)}
                    error={errors.builderMaximum}
                    helpText={values.builderMaximum > 0 ? formatCurrencyCode(values.builderMaximum) : undefined}
                  />
                )}
              </TabPanel>
            </Tabs>
          </div>

          {/* Subject To Conditions */}
          <div className="border border-slate-700 rounded-lg p-4 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={values.hasSubjectTo}
                onChange={(e) => updateField('hasSubjectTo', e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-accent-500 focus:ring-accent-500"
              />
              <span className="text-sm font-medium text-white">Subject To Conditions</span>
            </label>

            {values.hasSubjectTo && (
              <div className="space-y-2 pt-2">
                {SUBJECT_TO_OPTIONS.map((option) => (
                  <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={values.subjectTo.includes(option.code)}
                      onChange={() => toggleSubjectTo(option.code)}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-accent-500 focus:ring-accent-500"
                    />
                    <span className="text-sm text-slate-300">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="space-y-4">
          {/* Code Preview */}
          <div className="border border-slate-700 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-white">ProViso Code</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyCode}
                icon={copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              >
                {copiedCode ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <div className="p-4 max-h-48 overflow-auto">
              <HighlightedCode code={generatedCode} />
            </div>
          </div>

          {/* Prose Preview */}
          <div className="border border-slate-700 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-white">Word Document</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyProse}
                icon={copiedProse ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              >
                {copiedProse ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <div className="p-4 max-h-64 overflow-auto">
              <p className="text-sm text-slate-300 whitespace-pre-wrap font-serif leading-relaxed">
                {generatedProse}
              </p>
            </div>
          </div>

          {/* Basket Type Description */}
          <div className="border border-slate-700 rounded-lg p-4 bg-slate-800/50">
            <h4 className="text-sm font-medium text-white mb-2">
              {values.type === 'fixed' && 'Fixed Basket'}
              {values.type === 'grower' && 'Grower Basket'}
              {values.type === 'builder' && 'Builder Basket'}
            </h4>
            <p className="text-xs text-slate-400">
              {values.type === 'fixed' && 'Simple dollar limit. Commonly used for de minimis exceptions or specific permitted actions.'}
              {values.type === 'grower' && 'Capacity scales with company size. The "greater of" test ensures a minimum capacity floor while allowing growth.'}
              {values.type === 'builder' && 'Capacity accumulates from a defined source. Often used for retained cash flow or asset sale proceeds.'}
            </p>
          </div>

          {/* Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="border border-red-500/30 bg-red-500/10 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-400 mb-2">Please fix the following errors:</h4>
              <ul className="list-disc list-inside text-sm text-red-300 space-y-1">
                {Object.values(errors).map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
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

export default BasketEditor;
