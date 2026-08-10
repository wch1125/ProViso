/**
 * Command Runner for Demo Terminal
 *
 * Parses terminal commands and executes them against the ProViso interpreter.
 * Returns formatted output for display.
 */

import type { ProVisoInterpreter } from '@proviso/interpreter.js';
import type { CovenantResult, BasketStatus } from '@proviso/types.js';

// =============================================================================
// TYPES
// =============================================================================

export interface CommandResult {
  output: string;
  type: 'success' | 'error' | 'info' | 'clear';
  data?: unknown;
}

interface ParsedCommand {
  name: string;
  args: string[];
  raw: string;
}

// =============================================================================
// COMMAND PARSING
// =============================================================================

function parseCommand(input: string): ParsedCommand {
  const trimmed = input.trim();
  const parts = trimmed.split(/\s+/);
  const name = (parts[0] ?? '').toLowerCase();
  const args = parts.slice(1);

  return { name, args, raw: trimmed };
}

// =============================================================================
// FORMATTERS
// =============================================================================

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  } else if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function formatRatio(value: number): string {
  return `${value.toFixed(2)}x`;
}

function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Format a covenant value in the unit the engine reports.
 *
 * Previously inferred from magnitude (`actual < 100` meant "ratio"), which
 * printed a percentage covenant of 15 as "15.00x" and would misread any
 * sub-$100 currency figure.
 */
function formatCovenantValue(value: number, unit: CovenantResult['unit']): string {
  switch (unit) {
    case 'currency': return formatCurrency(value);
    case 'percentage': return formatPercentage(value);
    case 'ratio': return formatRatio(value);
    default: return formatRatio(value);
  }
}

function formatHeadroom(headroom: number, unit: CovenantResult['unit']): string {
  return formatCovenantValue(Math.abs(headroom), unit);
}

function getComplianceIndicator(compliant: boolean): string {
  return compliant ? '[PASS]' : '[FAIL]';
}

function formatStatus(interpreter: ProVisoInterpreter): string {
  const covenants = interpreter.checkAllCovenants();
  const baskets = interpreter.getAllBasketStatuses();

  const lines: string[] = [];
  lines.push('='.repeat(50));
  lines.push('  PROVISO STATUS REPORT');
  lines.push('='.repeat(50));
  lines.push('');

  // Covenants section
  lines.push('COVENANTS');
  lines.push('-'.repeat(50));

  const allCompliant = covenants.every(c => c.compliant);
  const failedCount = covenants.filter(c => !c.compliant).length;

  if (allCompliant) {
    lines.push('  Status: ALL COVENANTS PASSING');
  } else {
    lines.push(`  Status: ${failedCount} COVENANT${failedCount > 1 ? 'S' : ''} IN BREACH`);
  }
  lines.push('');

  for (const cov of covenants) {
    const indicator = getComplianceIndicator(cov.compliant);
    const actualStr = formatCovenantValue(cov.actual, cov.unit);
    const thresholdStr = formatCovenantValue(cov.threshold, cov.unit);
    const headroomStr = cov.headroom !== undefined
      ? ` (headroom: ${formatHeadroom(cov.headroom, cov.unit)})`
      : '';

    lines.push(`  ${indicator} ${cov.name}`);
    lines.push(`      Actual: ${actualStr} ${cov.operator} ${thresholdStr}${headroomStr}`);
  }
  lines.push('');

  // Baskets section
  lines.push('BASKETS');
  lines.push('-'.repeat(50));

  for (const basket of baskets) {
    const utilPct = basket.capacity > 0
      ? ((basket.used / basket.capacity) * 100).toFixed(0)
      : '0';
    const available = basket.capacity - basket.used;

    lines.push(`  ${basket.name}`);
    lines.push(`      Capacity: ${formatCurrency(basket.capacity)}`);
    lines.push(`      Used: ${formatCurrency(basket.used)} (${utilPct}%)`);
    lines.push(`      Available: ${formatCurrency(available)}`);
  }

  lines.push('');
  lines.push('='.repeat(50));

  return lines.join('\n');
}

function formatCovenants(covenants: CovenantResult[]): string {
  const lines: string[] = [];
  lines.push('COVENANT COMPLIANCE CHECK');
  lines.push('-'.repeat(40));
  lines.push('');

  const allCompliant = covenants.every(c => c.compliant);

  for (const cov of covenants) {
    const indicator = getComplianceIndicator(cov.compliant);
    const actualStr = formatCovenantValue(cov.actual, cov.unit);
    const thresholdStr = formatCovenantValue(cov.threshold, cov.unit);

    lines.push(`${indicator} ${cov.name}`);
    lines.push(`   ${actualStr} ${cov.operator} ${thresholdStr}`);

    if (cov.headroom !== undefined) {
      const headroomLabel = cov.compliant ? 'Headroom' : 'Shortfall';
      lines.push(`   ${headroomLabel}: ${formatHeadroom(cov.headroom, cov.unit)}`);
    }
    lines.push('');
  }

  if (allCompliant) {
    lines.push('Result: ALL COVENANTS PASSING');
  } else {
    const failedCount = covenants.filter(c => !c.compliant).length;
    lines.push(`Result: ${failedCount} COVENANT${failedCount > 1 ? 'S' : ''} IN BREACH`);
  }

  return lines.join('\n');
}

function formatBaskets(baskets: BasketStatus[]): string {
  const lines: string[] = [];
  lines.push('BASKET UTILIZATION');
  lines.push('-'.repeat(40));
  lines.push('');

  for (const basket of baskets) {
    // A zero-capacity basket is exhausted if anything has been drawn against
    // it, otherwise empty. Deriving the bar and the percentage from one ratio
    // keeps them from disagreeing.
    const utilization = basket.capacity > 0
      ? basket.used / basket.capacity
      : basket.used > 0 ? 1 : 0;
    const utilPct = (utilization * 100).toFixed(0);
    const available = basket.capacity - basket.used;

    // Create a simple bar visualization. The fill is clamped to [0, barWidth]:
    // an over-utilized basket (used > capacity) is an expected state, and
    // without the clamp repeat() throws on the resulting negative count.
    const barWidth = 20;
    const filledWidth = Math.max(0, Math.min(barWidth, Math.round(utilization * barWidth)));
    const bar = '[' + '='.repeat(filledWidth) + ' '.repeat(barWidth - filledWidth) + ']';

    lines.push(`${basket.name}`);
    lines.push(`  ${bar} ${utilPct}%`);
    lines.push(`  Capacity:  ${formatCurrency(basket.capacity)}`);
    lines.push(`  Used:      ${formatCurrency(basket.used)}`);
    lines.push(`  Available: ${formatCurrency(available)}`);
    lines.push('');
  }

  return lines.join('\n');
}

function formatSimulation(
  interpreter: ProVisoInterpreter,
  changes: Record<string, number>
): string {
  const lines: string[] = [];
  lines.push('PRO FORMA SIMULATION');
  lines.push('-'.repeat(40));
  lines.push('');

  lines.push('Proposed Changes:');
  for (const [key, value] of Object.entries(changes)) {
    lines.push(`  ${key}: ${formatCurrency(value)}`);
  }
  lines.push('');

  // Get current state before changes
  const currentCovenants = interpreter.checkAllCovenants();

  // Delegate to the engine's own pro forma, which snapshots and restores the
  // whole financial object. The previous approach applied changes with
  // loadFinancials and restored key by key, so a key that did not exist
  // beforehand had no prior value to restore and leaked its simulated value
  // into the shared dashboard interpreter for the rest of the session.
  const proFormaCovenants = interpreter.simulate(changes).covenants;

  lines.push('Pro Forma Impact:');
  lines.push('');

  for (let i = 0; i < currentCovenants.length; i++) {
    const current = currentCovenants[i]!;
    const proForma = proFormaCovenants[i]!;

    const currentStr = formatCovenantValue(current.actual, current.unit);
    const proFormaStr = formatCovenantValue(proForma.actual, proForma.unit);

    const currentIndicator = getComplianceIndicator(current.compliant);
    const proFormaIndicator = getComplianceIndicator(proForma.compliant);

    lines.push(`${current.name}`);
    lines.push(`  Current:   ${currentStr} ${currentIndicator}`);
    lines.push(`  Pro Forma: ${proFormaStr} ${proFormaIndicator}`);

    if (current.compliant && !proForma.compliant) {
      lines.push(`  WARNING: Would breach covenant!`);
    } else if (!current.compliant && proForma.compliant) {
      lines.push(`  NOTE: Would cure breach`);
    }
    lines.push('');
  }

  // No manual restore needed — interpreter.simulate() restores its own state.

  return lines.join('\n');
}

function formatQuery(
  interpreter: ProVisoInterpreter,
  basketName: string,
  amount: number
): string {
  const baskets = interpreter.getAllBasketStatuses();
  const basket = baskets.find(b =>
    b.name.toLowerCase() === basketName.toLowerCase() ||
    b.name.toLowerCase().includes(basketName.toLowerCase())
  );

  if (!basket) {
    return `Error: Basket "${basketName}" not found.\nAvailable baskets: ${baskets.map(b => b.name).join(', ')}`;
  }

  const available = basket.capacity - basket.used;
  const permitted = amount <= available;

  const lines: string[] = [];
  lines.push('BASKET QUERY');
  lines.push('-'.repeat(40));
  lines.push('');
  lines.push(`Basket: ${basket.name}`);
  lines.push(`Requested Amount: ${formatCurrency(amount)}`);
  lines.push(`Available Capacity: ${formatCurrency(available)}`);
  lines.push('');

  if (permitted) {
    lines.push(`Result: PERMITTED`);
    lines.push(`Remaining after use: ${formatCurrency(available - amount)}`);
  } else {
    lines.push(`Result: NOT PERMITTED`);
    lines.push(`Shortfall: ${formatCurrency(amount - available)}`);
  }

  return lines.join('\n');
}

const HELP_TEXT = `
PROVISO DEMO COMMANDS
=====================

  status      Full compliance report (covenants + baskets)
  check       Covenant compliance check with headroom
  baskets     Basket utilization summary
  simulate    Pro forma impact analysis
              Usage: simulate <key>=<value> [<key>=<value> ...]
              Example: simulate SeniorDebt=180000000
  query       Check if an action is permitted
              Usage: query <basket_name> <amount>
              Example: query Investments 5000000
  help        Show this help message
  clear       Clear terminal history

Examples:
  > status
  > check
  > baskets
  > simulate SeniorDebt=180000000
  > query GeneralInvestments 10000000
`.trim();

// =============================================================================
// MAIN EXECUTOR
// =============================================================================

export function executeCommand(
  input: string,
  interpreter: ProVisoInterpreter | null
): CommandResult {
  const { name, args } = parseCommand(input);

  // Handle commands that don't need interpreter
  if (name === 'help' || name === '?') {
    return { output: HELP_TEXT, type: 'info' };
  }

  if (name === 'clear' || name === 'cls') {
    return { output: '', type: 'clear' };
  }

  // Validate interpreter exists
  if (!interpreter) {
    return {
      output: 'Error: Interpreter not loaded. Please wait for initialization.',
      type: 'error',
    };
  }

  // Execute commands
  switch (name) {
    case 'status': {
      return { output: formatStatus(interpreter), type: 'success' };
    }

    case 'check': {
      const covenants = interpreter.checkAllCovenants();
      return { output: formatCovenants(covenants), type: 'success' };
    }

    case 'baskets': {
      const baskets = interpreter.getAllBasketStatuses();
      return { output: formatBaskets(baskets), type: 'success' };
    }

    case 'simulate': {
      if (args.length === 0) {
        return {
          output: 'Usage: simulate <key>=<value> [<key>=<value> ...]\nExample: simulate SeniorDebt=180000000',
          type: 'error',
        };
      }

      const changes: Record<string, number> = {};
      for (const arg of args) {
        const [key, valueStr] = arg.split('=');
        if (!key || !valueStr) {
          return {
            output: `Invalid argument: "${arg}". Use format: key=value`,
            type: 'error',
          };
        }
        const value = parseFloat(valueStr.replace(/[_,]/g, ''));
        if (isNaN(value)) {
          return {
            output: `Invalid number: "${valueStr}"`,
            type: 'error',
          };
        }
        changes[key] = value;
      }

      return { output: formatSimulation(interpreter, changes), type: 'success' };
    }

    case 'query': {
      if (args.length < 2) {
        return {
          output: 'Usage: query <basket_name> <amount>\nExample: query GeneralInvestments 5000000',
          type: 'error',
        };
      }

      const basketName = args[0]!;
      const amount = parseFloat((args[1] ?? '').replace(/[_,]/g, ''));

      if (isNaN(amount)) {
        return {
          output: `Invalid amount: "${args[1]}"`,
          type: 'error',
        };
      }

      return { output: formatQuery(interpreter, basketName, amount), type: 'success' };
    }

    default:
      return {
        output: `Unknown command: "${name}". Type "help" for available commands.`,
        type: 'error',
      };
  }
}

// =============================================================================
// UTILITIES
// =============================================================================

export function getSuggestedCommands(): Array<{ command: string; description: string }> {
  return [
    { command: 'status', description: 'Full compliance report' },
    { command: 'check', description: 'Covenant check' },
    { command: 'baskets', description: 'Basket utilization' },
    { command: 'simulate SeniorDebt=180000000', description: 'Pro forma +$20M debt' },
    { command: 'query GeneralInvestments 10000000', description: 'Check $10M investment' },
  ];
}
