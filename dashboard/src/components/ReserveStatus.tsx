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
    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${
            belowMinimum
              ? 'bg-red-500/10'
              : fullyFunded
              ? 'bg-emerald-500/10'
              : 'bg-accent-500/10'
          }`}>
            <PiggyBank className={`w-5 h-5 ${
              belowMinimum
                ? 'text-red-400'
                : fullyFunded
                ? 'text-emerald-400'
                : 'text-accent-400'
            }`} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{displayName}</p>
            <p className="text-xs text-gray-500">
              {belowMinimum ? 'Below minimum' : fullyFunded ? 'Fully funded' : 'Funding in progress'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {belowMinimum ? (
            <AlertCircle className="w-4 h-4 text-red-400" />
          ) : fullyFunded ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : null}
          <span className={`text-lg font-semibold tabular-nums ${
            belowMinimum
              ? 'text-red-400'
              : fullyFunded
              ? 'text-emerald-400'
              : 'text-white'
          }`}>
            {fundedPercent.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        {/* Background */}
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          {/* Balance Fill */}
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              belowMinimum
                ? 'bg-gradient-to-r from-red-600 to-red-500'
                : fullyFunded
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500'
                : 'bg-gradient-to-r from-accent-600 to-accent-500'
            }`}
            style={{ width: `${balancePercent}%` }}
          />
        </div>

        {/* Minimum Marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-amber-500"
          style={{ left: `${minimumPercent}%` }}
        >
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-[10px] text-amber-500 font-medium">MIN</span>
          </div>
        </div>

        {/* Target Marker (100%) */}
        <div className="absolute top-0 bottom-0 right-0 w-0.5 bg-gray-500">
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-[10px] text-gray-500 font-medium">TARGET</span>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="flex items-center justify-between mt-4 text-xs">
        <div>
          <span className="text-gray-500">Balance: </span>
          <span className="text-white font-medium">{formatCurrency(balance)}</span>
        </div>
        <div>
          <span className="text-gray-500">Min: </span>
          <span className="text-amber-400 font-medium">{formatCurrency(minimum)}</span>
        </div>
        <div>
          <span className="text-gray-500">Target: </span>
          <span className="text-gray-400 font-medium">{formatCurrency(target)}</span>
        </div>
      </div>

      {/* Available for Release */}
      {balance > minimum && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Available for Release</span>
            <span className="text-sm font-medium text-emerald-400">
              {formatCurrency(balance - minimum)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
