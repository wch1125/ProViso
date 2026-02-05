/**
 * Financial Submission Form
 *
 * Form component for submitting quarterly/monthly financial data.
 * Allows entry of key financial metrics for covenant testing.
 */
import { useState, ChangeEvent } from 'react';
import { DollarSign, Calendar, Send, AlertCircle } from 'lucide-react';
import { Button, Input, Select } from '../base';

interface FinancialField {
  key: string;
  label: string;
  helpText?: string;
}

interface FinancialSubmissionFormProps {
  dealId: string;
  onSubmit: (data: {
    period: string;
    periodType: 'monthly' | 'quarterly' | 'annual';
    periodEndDate: string;
    financialData: Record<string, number>;
  }) => void;
  isSubmitting?: boolean;
  fields?: FinancialField[];
}

const defaultFields: FinancialField[] = [
  { key: 'Revenue', label: 'Revenue', helpText: 'Total revenue for the period' },
  { key: 'EBITDA', label: 'EBITDA', helpText: 'Earnings before interest, taxes, depreciation, and amortization' },
  { key: 'net_income', label: 'Net Income', helpText: 'Net income after all expenses' },
  { key: 'total_debt', label: 'Total Debt', helpText: 'Total outstanding debt' },
  { key: 'senior_debt', label: 'Senior Debt', helpText: 'Senior secured debt only' },
  { key: 'interest_expense', label: 'Interest Expense', helpText: 'Total interest paid during period' },
  { key: 'total_assets', label: 'Total Assets', helpText: 'Total assets on balance sheet' },
  { key: 'debt_service', label: 'Debt Service', helpText: 'Total debt service (principal + interest)' },
];

const periodTypeOptions = [
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
];

const quarterOptions = [
  { value: 'Q1', label: 'Q1 (Jan-Mar)' },
  { value: 'Q2', label: 'Q2 (Apr-Jun)' },
  { value: 'Q3', label: 'Q3 (Jul-Sep)' },
  { value: 'Q4', label: 'Q4 (Oct-Dec)' },
];

export function FinancialSubmissionForm({
  dealId: _dealId,
  onSubmit,
  isSubmitting = false,
  fields = defaultFields,
}: FinancialSubmissionFormProps) {
  const currentYear = new Date().getFullYear();
  const [periodType, setPeriodType] = useState<'monthly' | 'quarterly' | 'annual'>('quarterly');
  const [year, setYear] = useState(currentYear.toString());
  const [quarter, setQuarter] = useState('Q4');
  const [month, setMonth] = useState('12');
  const [financialData, setFinancialData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString(),
  }));

  const monthOptions = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const handleFieldChange = (key: string, e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFinancialData((prev) => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const getPeriodString = (): string => {
    if (periodType === 'quarterly') {
      return `${year}-${quarter}`;
    } else if (periodType === 'monthly') {
      return `${year}-${month.padStart(2, '0')}`;
    } else {
      return `${year}`;
    }
  };

  const getPeriodEndDate = (): string => {
    if (periodType === 'quarterly') {
      const quarterEnd: Record<string, string> = {
        Q1: '03-31',
        Q2: '06-30',
        Q3: '09-30',
        Q4: '12-31',
      };
      return `${year}-${quarterEnd[quarter]}`;
    } else if (periodType === 'monthly') {
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      return `${year}-${month.padStart(2, '0')}-${lastDay}`;
    } else {
      return `${year}-12-31`;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Check required fields have values
    for (const field of fields) {
      const value = financialData[field.key];
      if (!value || value.trim() === '') {
        newErrors[field.key] = `${field.label} is required`;
      } else {
        const numValue = parseFloat(value.replace(/,/g, ''));
        if (isNaN(numValue)) {
          newErrors[field.key] = `${field.label} must be a valid number`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const numericData: Record<string, number> = {};
    for (const field of fields) {
      const value = financialData[field.key];
      if (value) {
        numericData[field.key] = parseFloat(value.replace(/,/g, ''));
      }
    }

    onSubmit({
      period: getPeriodString(),
      periodType,
      periodEndDate: getPeriodEndDate(),
      financialData: numericData,
    });
  };

  const formatNumber = (value: string): string => {
    const num = value.replace(/,/g, '');
    if (!num || isNaN(parseFloat(num))) return value;
    return parseFloat(num).toLocaleString();
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gold-500/10 rounded-lg">
          <DollarSign className="h-5 w-5 text-gold-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Financial Submission</h3>
          <p className="text-sm text-slate-400">Submit financial data for covenant testing</p>
        </div>
      </div>

      {/* Period Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Select
          label="Period Type"
          options={periodTypeOptions}
          value={periodType}
          onChange={(e) => setPeriodType(e.target.value as 'monthly' | 'quarterly' | 'annual')}
        />
        <Select
          label="Year"
          options={yearOptions}
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        {periodType === 'quarterly' && (
          <Select
            label="Quarter"
            options={quarterOptions}
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
          />
        )}
        {periodType === 'monthly' && (
          <Select
            label="Month"
            options={monthOptions}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        )}
      </div>

      {/* Period End Date Display */}
      <div className="flex items-center gap-2 mb-6 p-3 bg-slate-700/50 rounded-lg">
        <Calendar className="h-4 w-4 text-slate-400" />
        <span className="text-sm text-slate-400">Period End Date:</span>
        <span className="text-sm text-white font-medium">{getPeriodEndDate()}</span>
      </div>

      {/* Financial Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {fields.map((field) => (
          <div key={field.key}>
            <Input
              label={field.label}
              value={financialData[field.key] || ''}
              onChange={(e) => handleFieldChange(field.key, e)}
              onBlur={() => {
                const value = financialData[field.key];
                if (value) {
                  setFinancialData((prev) => ({
                    ...prev,
                    [field.key]: formatNumber(value),
                  }));
                }
              }}
              placeholder="0"
            />
            {field.helpText && !errors[field.key] && (
              <p className="mt-1 text-xs text-slate-500">{field.helpText}</p>
            )}
            {errors[field.key] && (
              <p className="mt-1 text-xs text-red-400">{errors[field.key]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Validation Errors */}
      {Object.keys(errors).length > 0 && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Please fix the errors above before submitting</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          variant="gold"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Submitting...' : 'Submit Financial Data'}
        </Button>
      </div>
    </div>
  );
}

export default FinancialSubmissionForm;
