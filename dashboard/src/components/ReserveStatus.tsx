import { PiggyBank, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from './Card';
import type { ReserveData } from '../types';

interface ReserveStatusProps {
  reserves: ReserveData[];
}

export function ReserveStatus({ reserves }: ReserveStatusProps) {
  return (
    <Card>
      <CardHeader
        title="Reserve Accounts"
        subtitle={`${reserves.length} active reserves`}
      />
      <CardBody className="space-y-4">
        {reserves.map((reserve) => (
          <ReserveCard key={reserve.name} reserve={reserve} />
        ))}
      </CardBody>
    </Card>
  );
}

interface ReserveCardProps {
  reserve: ReserveData;
}

function ReserveCard({ reserve }: ReserveCardProps) {
  const { name, balance, target, minimum } = reserve;

  const fundedPercent = (balance / target) * 100;
  const minimumPercent = (minimum / target) * 100;
  const balancePercent = Math.min(fundedPercent, 100);
  const belowMinimum = balance < minimum;
  const fullyFunded = balance >= target;

  // Format currency
  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val.toFixed(0)}`;
  };

  // Format reserve name for display
  const displayName = name.replace(/([A-Z])/g, ' $1').trim();

  return (
    <div className="p-4 rounded-lg bg-surface-1 border border-border-DEFAULT">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${
            belowMinimum
              ? 'bg-danger/10'
              : fullyFunded
              ? 'bg-success/10'
              : 'bg-gold-500/10'
          }`}>
            <PiggyBank className={`w-5 h-5 ${
              belowMinimum
                ? 'text-danger'
                : fullyFunded
                ? 'text-success'
                : 'text-gold-500'
            }`} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">{displayName}</p>
            <p className="text-xs text-text-muted">
              {belowMinimum ? 'Below minimum' : fullyFunded ? 'Fully funded' : 'Funding in progress'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {belowMinimum ? (
            <AlertCircle className="w-4 h-4 text-danger" />
          ) : fullyFunded ? (
            <CheckCircle2 className="w-4 h-4 text-success" />
          ) : null}
          <span className={`text-lg font-semibold tabular-nums ${
            belowMinimum
              ? 'text-danger'
              : fullyFunded
              ? 'text-success'
              : 'text-text-primary'
          }`}>
            {fundedPercent.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        {/* Background */}
        <div className="h-3 bg-surface-3 rounded-full overflow-hidden">
          {/* Balance Fill */}
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              belowMinimum
                ? 'bg-gradient-to-r from-red-600 to-danger'
                : fullyFunded
                ? 'bg-gradient-to-r from-emerald-600 to-success'
                : 'bg-gradient-to-r from-gold-600 to-gold-500'
            }`}
            style={{ width: `${balancePercent}%` }}
          />
        </div>

        {/* Minimum Marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-warning"
          style={{ left: `${minimumPercent}%` }}
        >
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-[10px] text-warning font-medium">MIN</span>
          </div>
        </div>

        {/* Target Marker (100%) */}
        <div className="absolute top-0 bottom-0 right-0 w-0.5 bg-text-muted">
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-[10px] text-text-muted font-medium">TARGET</span>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="flex items-center justify-between mt-4 text-xs">
        <div>
          <span className="text-text-muted">Balance:</span>
          <span className="text-text-primary font-medium">{formatCurrency(balance)}</span>
        </div>
        <div>
          <span className="text-text-muted">Min:</span>
          <span className="text-warning font-medium">{formatCurrency(minimum)}</span>
        </div>
        <div>
          <span className="text-text-muted">Target:</span>
          <span className="text-text-tertiary font-medium">{formatCurrency(target)}</span>
        </div>
      </div>

      {/* Available for Release */}
      {balance > minimum && (
        <div className="mt-3 pt-3 border-t border-border-DEFAULT/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Available for Release</span>
            <span className="text-sm font-medium text-success">
              {formatCurrency(balance - minimum)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
