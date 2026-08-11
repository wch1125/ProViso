import { Landmark, TrendingDown, CircleDollarSign } from 'lucide-react';
import { Card, CardHeader, CardBody } from './Card';
import type { FacilityData, TrancheData, PricingGridData } from '../types';

interface FacilityPanelProps {
  facilities: FacilityData[];
}

/** Tranche types as they read in an agreement. */
const TRANCHE_LABELS: Record<string, string> = {
  revolving_credit: 'Revolving Credit',
  term_loan_a: 'Term Loan A',
  term_loan_b: 'Term Loan B',
  delayed_draw: 'Delayed Draw',
  bridge_loan: 'Bridge',
  asset_based_loan: 'Asset-Based',
};

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

/** Rates are already in percentage points; two decimals is how they are papered. */
function formatRate(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatMaturity(iso: string | null): string | null {
  if (!iso) return null;
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return iso;
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${months[Number(match[2]) - 1]} ${Number(match[3])}, ${match[1]}`;
}

export function FacilityPanel({ facilities }: FacilityPanelProps) {
  if (facilities.length === 0) return null;

  const trancheCount = facilities.reduce((sum, f) => sum + f.tranches.length, 0);

  return (
    <Card>
      <CardHeader
        title="Credit Facilities"
        subtitle={`${trancheCount} tranche${trancheCount === 1 ? '' : 's'} across ${
          facilities.length
        } facilit${facilities.length === 1 ? 'y' : 'ies'}`}
      />
      <CardBody className="space-y-6">
        {facilities.map((facility) => (
          <FacilityCard key={facility.name} facility={facility} />
        ))}
      </CardBody>
    </Card>
  );
}

function FacilityCard({ facility }: { facility: FacilityData }) {
  const displayName = facility.name.replace(/([A-Z])/g, ' $1').trim();
  const drawnPercent = facility.totalCommitment > 0
    ? (facility.totalDrawn / facility.totalCommitment) * 100
    : 0;

  return (
    <div className="space-y-3">
      {/* Facility header: commitment drawn against total */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gold-500/10">
            <Landmark className="w-5 h-5 text-gold-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">{displayName}</p>
            <p className="text-xs text-text-muted">
              {formatCurrency(facility.totalDrawn)} drawn of{' '}
              {formatCurrency(facility.totalCommitment)}
              {facility.benchmark > 0 && ` · benchmark ${formatRate(facility.benchmark)}`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-semibold tabular-nums text-text-primary">
            {formatRate(facility.weightedRate)}
          </span>
          <p className="text-xs text-text-muted">weighted rate</p>
        </div>
      </div>

      {/* Drawn vs. commitment */}
      <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-500 transition-all duration-500"
          style={{ width: `${Math.max(0, Math.min(100, drawnPercent))}%` }}
        />
      </div>

      {/* Pricing grids — which level the deal is currently priced at */}
      {facility.pricingGrids && facility.pricingGrids.length > 0 && (
        <div className="space-y-2">
          {facility.pricingGrids.map((grid) => (
            <PricingGridRow key={grid.name} grid={grid} />
          ))}
        </div>
      )}

      {/* Tranches */}
      <div className="space-y-2">
        {facility.tranches.map((tranche) => (
          <TrancheRow key={tranche.name} tranche={tranche} />
        ))}
      </div>

      {/* Facility totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border-DEFAULT">
        <Metric label="Undrawn" value={formatCurrency(facility.totalUndrawn)} />
        <Metric label="Annual interest" value={formatCurrency(facility.annualInterest)} />
        <Metric label="Fees" value={formatCurrency(facility.fees)} />
        <Metric label="Debt service" value={formatCurrency(facility.debtService)} emphasis />
      </div>
    </div>
  );
}

function PricingGridRow({ grid }: { grid: PricingGridData }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-2 border border-border-DEFAULT">
      <div className="flex items-center gap-2 min-w-0">
        <TrendingDown className="w-4 h-4 text-gold-500 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-primary truncate">
            {grid.name.replace(/([A-Z])/g, ' $1').trim()}
          </p>
          <p className="text-xs text-text-muted truncate">
            {grid.basedOn}
            {grid.basisValue !== null && ` ${grid.basisValue.toFixed(2)}x`}
            {' · '}
            Level {grid.activeLevel} ({grid.levelDescription})
          </p>
        </div>
      </div>
      <span className="text-sm font-semibold tabular-nums text-text-primary shrink-0 ml-3">
        {formatRate(grid.margin)}
      </span>
    </div>
  );
}

function TrancheRow({ tranche }: { tranche: TrancheData }) {
  const label = TRANCHE_LABELS[tranche.trancheType] ?? tranche.trancheType;
  const maturity = formatMaturity(tranche.maturity);
  const isRevolver = tranche.availability !== null;

  return (
    <div className="p-3 rounded-lg bg-surface-1 border border-border-DEFAULT">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <CircleDollarSign className="w-4 h-4 text-text-muted shrink-0" />
            <p className="text-sm font-medium text-text-primary truncate">
              {tranche.name.replace(/([A-Z])/g, ' $1').trim()}
            </p>
            <span className="text-xs px-1.5 py-0.5 rounded bg-surface-3 text-text-muted shrink-0">
              {label}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            {formatCurrency(tranche.drawn)} drawn of {formatCurrency(tranche.commitment)}
            {maturity && ` · matures ${maturity}`}
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-sm font-semibold tabular-nums text-text-primary">
            {formatRate(tranche.allInRate)}
          </span>
          <p className="text-xs text-text-muted">
            {/* Naming the grid makes clear the rate is derived, not typed in. */}
            {tranche.pricingGrid
              ? `${formatRate(tranche.margin)} (grid)`
              : `+${formatRate(tranche.margin)}`}
          </p>
        </div>
      </div>

      {/* Revolver availability, net of letters of credit */}
      {isRevolver && (
        <div className="mt-2.5 pt-2.5 border-t border-border-DEFAULT flex items-center justify-between text-xs">
          <span className="text-text-muted">
            Available {formatCurrency(tranche.availability ?? 0)}
            {tranche.lcOutstanding > 0 &&
              ` · LC ${formatCurrency(tranche.lcOutstanding)}`}
          </span>
          {tranche.utilization !== null && (
            <span className="tabular-nums text-text-secondary">
              {tranche.utilization.toFixed(0)}% utilized
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p
        className={`text-sm tabular-nums ${
          emphasis ? 'font-semibold text-text-primary' : 'text-text-secondary'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
