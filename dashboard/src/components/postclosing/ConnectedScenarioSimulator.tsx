/**
 * Connected Scenario Simulator
 *
 * Wraps ScenarioSimulator with ProViso context integration.
 * Provides real financial fields and covenant calculation from the interpreter.
 */
import { useMemo, useCallback } from 'react';
import { useProViso } from '../../context';
import { ScenarioSimulator } from './ScenarioSimulator';

/**
 * Format field key to human-readable label
 */
function formatFieldLabel(key: string): string {
  // Map of known field keys to labels
  const labelMap: Record<string, string> = {
    net_income: 'Net Income',
    interest_expense: 'Interest Expense',
    tax_expense: 'Tax Expense',
    depreciation: 'Depreciation',
    amortization: 'Amortization',
    senior_debt: 'Senior Debt',
    subordinated_debt: 'Subordinated Debt',
    senior_interest: 'Senior Interest',
    senior_principal: 'Senior Principal',
    total_project_cost: 'Total Project Cost',
    equity_contributed: 'Equity Contributed',
    monthly_debt_service: 'Monthly Debt Service',
    annual_capex_budget: 'Annual CapEx Budget',
    operating_expenses: 'Operating Expenses',
    distributions: 'Distributions',
    Revenue: 'Revenue',
    total_assets: 'Total Assets',
  };

  // Check if we have a specific label
  if (labelMap[key]) {
    return labelMap[key];
  }

  // Otherwise, convert snake_case to Title Case
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Connected ScenarioSimulator that uses live interpreter data
 */
export function ConnectedScenarioSimulator({
  className = '',
}: {
  className?: string;
}) {
  const { financials, interpreter, isLoaded } = useProViso();

  // Build adjustment fields from current financials
  const fields = useMemo(() => {
    if (!financials || Object.keys(financials).length === 0) {
      return [];
    }

    return Object.entries(financials)
      .filter(([_, value]) => typeof value === 'number')
      .map(([key, value]) => ({
        key,
        label: formatFieldLabel(key),
        currentValue: value as number,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [financials]);

  // Calculate covenants with given financial data
  const calculateCovenants = useCallback(
    (testFinancials: Record<string, number>) => {
      if (!interpreter) {
        return [];
      }

      // Save original financials
      const originalFinancials = { ...financials };

      try {
        // Load test financials
        interpreter.loadFinancials(testFinancials);

        // Get covenant results
        const results = interpreter.checkAllCovenants();

        // Transform to expected format
        return results.map((r) => ({
          name: r.name,
          actual: r.actual,
          threshold: r.threshold,
          compliant: r.compliant,
          headroom: r.headroom ?? 0,
        }));
      } finally {
        // Restore original financials
        interpreter.loadFinancials(originalFinancials);
      }
    },
    [interpreter, financials]
  );

  // Don't render if not loaded or no fields
  if (!isLoaded || fields.length === 0) {
    return (
      <div className={`bg-slate-800 rounded-lg border border-slate-700 p-6 ${className}`}>
        <div className="text-center text-slate-400">
          <p>Load financial data to use the Scenario Simulator</p>
        </div>
      </div>
    );
  }

  return (
    <ScenarioSimulator
      fields={fields}
      calculateCovenants={calculateCovenants}
      className={className}
    />
  );
}

export default ConnectedScenarioSimulator;
