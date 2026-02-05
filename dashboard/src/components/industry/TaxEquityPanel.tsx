/**
 * TaxEquityPanel - Tax Equity Structure Visualization
 *
 * Shows tax credit status, depreciation schedule, partnership allocations,
 * and flip event tracking.
 */
import { DollarSign, TrendingUp, Calendar, ArrowRight, PieChart, Percent } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../Card';
import type {
  TaxEquityStructureData,
  TaxCreditData,
  DepreciationData,
  FlipEventData,
} from '../../types';

interface TaxEquityPanelProps {
  structure?: TaxEquityStructureData;
  credits?: TaxCreditData[];
  depreciation?: DepreciationData[];
  flipEvents?: FlipEventData[];
  title?: string;
}

export function TaxEquityPanel({
  structure,
  credits,
  depreciation,
  flipEvents,
  title = "Tax Equity Status",
}: TaxEquityPanelProps) {
  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  // Calculate total credits
  const totalCredits = credits?.reduce((sum, c) => sum + c.creditAmount, 0) || 0;

  // Find primary flip event
  const primaryFlip = flipEvents?.find((f) => f.trigger === 'target_return') || flipEvents?.[0];

  // Calculate flip progress if target return trigger
  const flipProgress = primaryFlip && primaryFlip.targetValue && primaryFlip.currentValue
    ? (primaryFlip.currentValue / primaryFlip.targetValue) * 100
    : 0;

  return (
    <Card>
      <CardHeader
        title={title}
        subtitle={structure?.structureType.replace('_', ' ') || 'Tax structure overview'}
        action={
          structure && (
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                structure.hasFlipped
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-blue-500/10 text-blue-400'
              }`}>
                {structure.hasFlipped ? 'Post-Flip' : 'Pre-Flip'}
              </span>
            </div>
          )
        }
      />
      <CardBody>
        {/* Partnership Structure */}
        {structure && (
          <div className="mb-6 p-4 bg-slate-800/50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-300">Partnership Allocations</p>
              <PieChart className="w-4 h-4 text-gray-400" />
            </div>

            {/* Allocation bars */}
            <div className="space-y-3">
              {/* Tax Credit Allocation */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400">Tax Credits</span>
                  <span className="text-gray-300">
                    {structure.taxCreditAllocation.investor}/{structure.taxCreditAllocation.sponsor}
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${structure.taxCreditAllocation.investor}%` }}
                  />
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${structure.taxCreditAllocation.sponsor}%` }}
                  />
                </div>
              </div>

              {/* Cash Allocation */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400">Cash Distribution</span>
                  <span className="text-gray-300">
                    {structure.cashAllocation.investor}/{structure.cashAllocation.sponsor}
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${structure.cashAllocation.investor}%` }}
                  />
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${structure.cashAllocation.sponsor}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded" />
                <span className="text-gray-400">Tax Investor</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald-500 rounded" />
                <span className="text-gray-400">Sponsor</span>
              </div>
            </div>

            {/* IRR tracking */}
            {structure.targetReturn && (
              <div className="mt-4 pt-3 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Target IRR</p>
                    <p className="text-lg font-bold text-white">{structure.targetReturn}%</p>
                  </div>
                  {structure.currentIRR !== undefined && (
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Current IRR</p>
                      <p className={`text-lg font-bold ${
                        structure.currentIRR >= structure.targetReturn
                          ? 'text-emerald-400'
                          : 'text-blue-400'
                      }`}>
                        {structure.currentIRR}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tax Credits */}
        {credits && credits.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-300">Tax Credits</p>
              <p className="text-sm font-bold text-gold-400">{formatCurrency(totalCredits)}</p>
            </div>
            <div className="space-y-2">
              {credits.map((credit) => (
                <div
                  key={credit.name}
                  className="p-3 bg-slate-800/50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gold-400" />
                      <span className="text-sm font-medium text-white">{credit.name}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-gold-500/10 text-gold-400 uppercase">
                      {credit.creditType}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-gray-400">Base Rate</p>
                      <p className="text-white font-medium">{credit.baseRate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Effective</p>
                      <p className="text-emerald-400 font-medium">{credit.effectiveRate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Amount</p>
                      <p className="text-white font-medium">{formatCurrency(credit.creditAmount)}</p>
                    </div>
                  </div>
                  {credit.adders && credit.adders.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-700">
                      <p className="text-xs text-gray-400 mb-1">Adders:</p>
                      <div className="flex gap-2 flex-wrap">
                        {credit.adders.map((adder) => (
                          <span
                            key={adder.name}
                            className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400"
                          >
                            +{adder.bonus}% {adder.name.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {credit.vestingPeriod && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${(credit.percentVested || 0)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">
                        {credit.percentVested || 0}% vested
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Depreciation */}
        {depreciation && depreciation.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-300 mb-3">Depreciation</p>
            <div className="space-y-2">
              {depreciation.map((dep) => (
                <div
                  key={dep.name}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{dep.name}</p>
                    <p className="text-xs text-gray-400">{dep.method.replace('_', ' ').toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {formatCurrency(dep.cumulativeDepreciation)}
                    </p>
                    <p className="text-xs text-gray-400">
                      of {formatCurrency(dep.depreciableBasis)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flip Events */}
        {flipEvents && flipEvents.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-300 mb-3">Flip Events</p>
            <div className="space-y-2">
              {flipEvents.map((flip) => (
                <div
                  key={flip.name}
                  className={`p-3 rounded-lg border ${
                    flip.hasTriggered
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : 'bg-slate-800/50 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {flip.trigger === 'target_return' ? (
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Calendar className="w-4 h-4 text-amber-400" />
                      )}
                      <span className="text-sm font-medium text-white">{flip.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      flip.hasTriggered
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-gray-500/10 text-gray-400'
                    }`}>
                      {flip.hasTriggered ? 'Triggered' : 'Pending'}
                    </span>
                  </div>

                  {/* Flip progress for target return */}
                  {flip.trigger === 'target_return' && flip.targetValue && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">Progress to {flip.targetValue}% IRR</span>
                        <span className="text-gray-300">
                          {flip.currentValue?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            flip.hasTriggered ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(flipProgress, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Date certain display */}
                  {flip.trigger === 'date_certain' && flip.projectedFlipDate && (
                    <p className="text-xs text-gray-400">
                      Flip date: {new Date(flip.projectedFlipDate).toLocaleDateString()}
                    </p>
                  )}

                  {/* Allocation change indicator */}
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="text-gray-400">
                      {flip.preFlipAllocation.investor}/{flip.preFlipAllocation.sponsor}
                    </span>
                    <ArrowRight className="w-3 h-3 text-gray-500" />
                    <span className={flip.hasTriggered ? 'text-emerald-400' : 'text-gray-400'}>
                      {flip.postFlipAllocation.investor}/{flip.postFlipAllocation.sponsor}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!structure && !credits?.length && !depreciation?.length && !flipEvents?.length && (
          <div className="text-center py-8">
            <Percent className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No tax equity structure configured</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
