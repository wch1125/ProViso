/**
 * Covenant value formatting.
 *
 * A covenant's numbers are only meaningful in the unit its threshold was
 * written in. The engine derives that unit from the source literal and hands
 * it over as `CovenantData.unit`; everything that prints a covenant value
 * should route through here rather than guessing.
 *
 * Both consumers previously guessed, and both guessed differently:
 *   - CovenantPanel suffixed every value with "x", rendering an $84,000,000
 *     equity floor as "84000000x" and its cushion as "0.00x".
 *   - CovenantSummary used `v > 10 ? toFixed(1) : toFixed(2) + 'x'`, so the
 *     same covenant read "84000000.0" in the value and "0.00x" in the headroom
 *     — two different units in one sentence.
 */

import type { CovenantValueUnit } from '../types';

/** Significant digits scaled to magnitude, so 3.02 and 145 both read cleanly. */
export function formatMagnitude(val: number): string {
  const abs = Math.abs(val);
  if (abs >= 100) return val.toFixed(0);
  if (abs >= 10) return val.toFixed(1);
  return val.toFixed(2);
}

/**
 * Money at the scale credit agreements are written in. A threshold of
 * 84,000,000 is read as "$84.0M" by every practitioner; the raw digit string
 * is what made the old output look broken.
 */
export function formatCurrencyCompact(val: number): string {
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

/**
 * A unitless number, grouped so large magnitudes stay readable.
 *
 * `unit` is 'number' whenever the threshold is a computed expression rather
 * than a literal — `equity_contributed >= 0.30 * total_project_cost` is
 * currency on both sides, but nothing in the expression says so, and the
 * engine will not assert a unit it cannot derive. Grouping is what we can
 * honestly do: "84,000,000" rather than "84000000".
 */
function formatUnitless(val: number): string {
  const abs = Math.abs(val);
  if (abs >= 1000) return val.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return formatMagnitude(val);
}

/**
 * Render a covenant value in its declared unit.
 *
 * An absent unit yields a grouped bare number: that is the honest output when
 * the engine could not determine one, and it beats asserting a unit the
 * covenant may not have.
 */
export function formatCovenantValue(val: number, unit?: CovenantValueUnit): string {
  switch (unit) {
    case 'currency':
      return formatCurrencyCompact(val);
    case 'percentage':
      return `${formatMagnitude(val)}%`;
    case 'ratio':
      return `${formatMagnitude(val)}x`;
    default:
      return formatUnitless(val);
  }
}

/**
 * The `valueType` the calculation drilldown expects for a covenant's unit.
 * Kept here so the mapping lives next to the unit it derives from.
 */
export function drilldownValueType(unit?: CovenantValueUnit): 'currency' | 'ratio' | 'percentage' | 'number' {
  switch (unit) {
    case 'currency':
      return 'currency';
    case 'percentage':
      return 'percentage';
    case 'ratio':
      return 'ratio';
    default:
      return 'number';
  }
}
