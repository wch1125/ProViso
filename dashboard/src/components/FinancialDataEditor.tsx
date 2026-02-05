/**
 * FinancialDataEditor - Edit financial data with live covenant updates
 *
 * Allows users to modify financial metrics and see instant impact on
 * covenant compliance, headroom, and other calculated values.
 */
import { useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronRight, DollarSign, RefreshCw, RotateCcw } from 'lucide-react';
import { useProViso } from '../context';
import { Input } from './base/Input';
import { Button } from './base/Button';
import { DEFAULT_FINANCIALS } from '../data/default-financials';

/**
 * Field group configuration
 */
interface FieldGroup {
  name: string;
  description: string;
  fields: FieldConfig[];
}

interface FieldConfig {
  key: string;
  label: string;
  helpText?: string;
}

/**
 * Field groups organized by category
 */
const FIELD_GROUPS: FieldGroup[] = [
  {
    name: 'Income Statement',
    description: 'Revenue and expense items',
    fields: [
      { key: 'Revenue', label: 'Revenue', helpText: 'Total revenue for the period' },
      { key: 'net_income', label: 'Net Income', helpText: 'Bottom line profit' },
      { key: 'interest_expense', label: 'Interest Expense', helpText: 'Total interest paid on debt' },
      { key: 'tax_expense', label: 'Tax Expense', helpText: 'Income tax expense' },
      { key: 'depreciation', label: 'Depreciation', helpText: 'Non-cash depreciation expense' },
      { key: 'amortization', label: 'Amortization', helpText: 'Non-cash amortization expense' },
    ],
  },
  {
    name: 'Debt Structure',
    description: 'Outstanding debt and service',
    fields: [
      { key: 'senior_debt', label: 'Senior Debt', helpText: 'Outstanding senior debt balance' },
      { key: 'subordinated_debt', label: 'Subordinated Debt', helpText: 'Outstanding subordinated debt' },
      { key: 'senior_interest', label: 'Senior Interest', helpText: 'Senior debt interest payment' },
      { key: 'senior_principal', label: 'Senior Principal', helpText: 'Senior debt principal payment' },
    ],
  },
  {
    name: 'Project Metrics',
    description: 'Project cost and equity',
    fields: [
      { key: 'total_project_cost', label: 'Total Project Cost', helpText: 'Total cost of the project' },
      { key: 'equity_contributed', label: 'Equity Contributed', helpText: 'Equity invested by sponsors' },
    ],
  },
  {
    name: 'Cash Flow',
    description: 'Operating cash flows',
    fields: [
      { key: 'operating_expenses', label: 'Operating Expenses', helpText: 'Total operating expenses' },
      { key: 'monthly_debt_service', label: 'Monthly Debt Service', helpText: 'Monthly P&I payment' },
      { key: 'annual_capex_budget', label: 'Annual CapEx Budget', helpText: 'Capital expenditure budget' },
      { key: 'distributions', label: 'Distributions', helpText: 'Cash distributed to equity' },
    ],
  },
  {
    name: 'Balance Sheet',
    description: 'Asset values',
    fields: [
      { key: 'total_assets', label: 'Total Assets', helpText: 'Total asset value' },
    ],
  },
];

/**
 * Format a number as currency
 */
function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

/**
 * Parse a currency string back to number
 */
function parseCurrencyInput(value: string): number {
  // Remove currency symbols, commas, and spaces
  const cleaned = value.replace(/[$,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Collapsible field group component
 */
function FieldGroupSection({
  group,
  values,
  onChange,
  expanded,
  onToggle,
}: {
  group: FieldGroup;
  values: Record<string, number>;
  onChange: (key: string, value: number) => void;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      {/* Group header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
          <span className="font-medium text-white">{group.name}</span>
          <span className="text-xs text-slate-500">({group.fields.length} fields)</span>
        </div>
        <span className="text-xs text-slate-400">{group.description}</span>
      </button>

      {/* Group fields */}
      {expanded && (
        <div className="p-4 bg-slate-900/30 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {group.fields.map((field) => (
            <div key={field.key}>
              <Input
                label={field.label}
                type="number"
                value={values[field.key]?.toString() ?? '0'}
                onChange={(e) => onChange(field.key, parseCurrencyInput(e.target.value))}
                helpText={field.helpText}
                icon={<DollarSign className="w-4 h-4" />}
                size="sm"
              />
              <div className="mt-1 text-xs text-slate-500 text-right">
                {formatCurrency(values[field.key] ?? 0)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Main Financial Data Editor component
 */
export function FinancialDataEditor({
  className = '',
  onClose,
}: {
  className?: string;
  onClose?: () => void;
}) {
  const { financials, loadFinancials, refresh } = useProViso();

  // Local state for editing (to allow "Apply" workflow)
  const [localValues, setLocalValues] = useState<Record<string, number>>(() => ({
    ...DEFAULT_FINANCIALS,
    ...financials,
  }));

  // Track which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(['Income Statement', 'Debt Structure'])
  );

  // Track if there are unsaved changes
  const hasChanges = useMemo(() => {
    return Object.keys(localValues).some(
      (key) => localValues[key] !== financials[key]
    );
  }, [localValues, financials]);

  // Handle field change
  const handleChange = useCallback((key: string, value: number) => {
    setLocalValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Toggle group expansion
  const toggleGroup = useCallback((groupName: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  }, []);

  // Apply changes
  const handleApply = useCallback(() => {
    loadFinancials(localValues);
    refresh();
  }, [localValues, loadFinancials, refresh]);

  // Reset to defaults
  const handleReset = useCallback(() => {
    setLocalValues({ ...DEFAULT_FINANCIALS });
  }, []);

  // Sync with current financials
  const handleSync = useCallback(() => {
    setLocalValues({ ...DEFAULT_FINANCIALS, ...financials });
  }, [financials]);

  return (
    <div className={`bg-slate-900/50 border border-slate-800 rounded-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-semibold text-white">Financial Data</h3>
          <p className="text-sm text-slate-400">
            Edit values to see live impact on covenants
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={handleReset}
            title="Reset to defaults"
          >
            Reset
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Field groups */}
      <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
        {FIELD_GROUPS.map((group) => (
          <FieldGroupSection
            key={group.name}
            group={group}
            values={localValues}
            onChange={handleChange}
            expanded={expandedGroups.has(group.name)}
            onToggle={() => toggleGroup(group.name)}
          />
        ))}
      </div>

      {/* Footer with actions */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800 bg-slate-800/30">
        <div className="text-sm text-slate-400">
          {hasChanges ? (
            <span className="text-amber-400">Unsaved changes</span>
          ) : (
            <span className="text-green-400">All changes applied</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={handleSync}
            disabled={!hasChanges}
          >
            Discard
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleApply}
            disabled={!hasChanges}
          >
            Apply & Recalculate
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact inline editor for quick adjustments
 */
export function FinancialDataQuickEdit({
  className = '',
}: {
  className?: string;
}) {
  const { financials, updateFinancial } = useProViso();

  // Quick edit fields - most commonly adjusted
  const quickFields: FieldConfig[] = [
    { key: 'Revenue', label: 'Revenue' },
    { key: 'net_income', label: 'Net Income' },
    { key: 'senior_debt', label: 'Senior Debt' },
    { key: 'interest_expense', label: 'Interest' },
  ];

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {quickFields.map((field) => (
        <div key={field.key} className="flex items-center gap-2">
          <span className="text-xs text-slate-400 whitespace-nowrap">{field.label}:</span>
          <input
            type="number"
            value={financials[field.key]?.toString() ?? '0'}
            onChange={(e) => updateFinancial(field.key, parseCurrencyInput(e.target.value))}
            className="w-24 px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-white focus:outline-none focus:border-accent-500"
          />
        </div>
      ))}
    </div>
  );
}

export default FinancialDataEditor;
