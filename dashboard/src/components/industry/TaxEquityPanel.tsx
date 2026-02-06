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
                  ? 'bg-success/10 text-success'
                  : 'bg-info/10 text-info'
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
          <div className="mb-6 p-4 bg-surface-2/50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-text-secondary">Partnership Allocations</p>
              <PieChart className="w-4 h-4 text-text-tertiary" />
            </div>

            {/* Allocation bars */}
            <div className="space-y-3">
              {/* Tax Credit Allocation */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-text-tertiary">Tax Credits</span>
                  <span className="text-text-secondary">
                    {structure.taxCreditAllocation.investor}/{structure.taxCreditAllocation.sponsor}
                  </span>
                </div>
                <div className="h-2 bg-surface-3 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-info"
                    style={{ width: `${structure.taxCreditAllocation.investor}%` }}
                  />
                  <div
                    className="h-full bg-success"
                    style={{ width: `${structure.taxCreditAllocation.sponsor}%` }}
                  />
                </div>
              </div>

              {/* Cash Allocation */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-text-tertiary">Cash Distribution</span>
                  <span className="text-text-secondary">
                    {structure.cashAllocation.investor}/{structure.cashAllocation.sponsor}
                  </span>
                </div>
                <div className="h-2 bg-surface-3 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-info"
                    style={{ width: `${structure.cashAllocation.investor}%` }}
                  />
                  <div
                    className="h-full bg-success"
                    style={{ width: `${structure.cashAllocation.sponsor}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-info rounded" />
                <span className="text-text-tertiary">Tax Investor</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-success rounded" />
                <span className="text-text-tertiary">Sponsor</span>
              </div>
            </div>

            {/* IRR tracking */}
            {structure.targetReturn && (
              <div className="mt-4 pt-3 border-t border-border-DEFAULT">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-text-tertiary">Target IRR</p>
                    <p className="text-lg font-bold text-text-primary">{structure.targetReturn}%</p>
                  </div>
                  {structure.currentIRR !== undefined && (
                    <div className="text-right">
                      <p className="text-xs text-text-tertiary">Current IRR</p>
                      <p className={`text-lg font-bold ${
                        structure.currentIRR >= structure.targetReturn
                          ? 'text-success'
                          : 'text-info'
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
              <p className="text-sm font-medium text-text-secondary">Tax Credits</p>
              <p className="text-sm font-bold text-gold-400">{formatCurrency(totalCredits)}</p>
            </div>
            <div className="space-y-2">
              {credits.map((credit) => (
                <div
                  key={credit.name}
                  className="p-3 bg-surface-2/50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gold-400" />
                      <span className="text-sm font-medium text-text-primary">{credit.name}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-gold-500/10 text-gold-400 uppercase">
                      {credit.creditType}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-text-tertiary">Base Rate</p>
                      <p className="text-text-primary font-medium">{credit.baseRate}%</p>
                    </div>
                    <div>
                      <p className="text-text-tertiary">Effective</p>
                      <p className="text-success font-medium">{credit.effectiveRate}%</p>
                    </div>
                    <div>
                      <p className="text-text-tertiary">Amount</p>
                      <p className="text-text-primary font-medium">{formatCurrency(credit.creditAmount)}</p>
                    </div>
                  </div>
                  {credit.adders && credit.adders.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border-DEFAULT">
                      <p className="text-xs text-text-tertiary mb-1">Adders:</p>
                      <div className="flex gap-2 flex-wrap">
                        {credit.adders.map((adder) => (
                          <span
                            key={adder.name}
                            className="text-xs px-2 py-0.5 rounded bg-success/10 text-success"
                          >
                            +{adder.bonus}% {adder.name.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {credit.vestingPeriod && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success"
                          style={{ width: `${(credit.percentVested || 0)}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-tertiary">
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
            <p className="text-sm font-medium text-text-secondary mb-3">Depreciation</p>
            <div className="space-y-2">
              {depreciation.map((dep) => (
                <div
                  key={dep.name}
                  className="flex items-center justify-between p-3 bg-surface-2/50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">{dep.name}</p>
                    <p className="text-xs text-text-tertiary">{dep.method.replace('_', ' ').toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-text-primary">
                      {formatCurrency(dep.cumulativeDepreciation)}
                    </p>
                    <p className="text-xs text-text-tertiary">
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
            <p className="text-sm font-medium text-text-secondary mb-3">Flip Events</p>
            <div className="space-y-2">
              {flipEvents.map((flip) => (
                <div
                  key={flip.name}
                  className={`p-3 rounded-lg border ${
                    flip.hasTriggered
                      ? 'bg-success/5 border-success/30'
                      : 'bg-surface-2/50 border-border-DEFAULT'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {flip.trigger === 'target_return' ? (
                        <TrendingUp className="w-4 h-4 text-info" />
                      ) : (
                        <Calendar className="w-4 h-4 text-warning" />
                      )}
                      <span className="text-sm font-medium text-text-primary">{flip.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      flip.hasTriggered
                        ? 'bg-success/10 text-success'
                        : 'bg-gray-500/10 text-text-tertiary'
                    }`}>
                      {flip.hasTriggered ? 'Triggered' : 'Pending'}
                    </span>
                  </div>

                  {/* Flip progress for target return */}
                  {flip.trigger === 'target_return' && flip.targetValue && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-text-tertiary">Progress to {flip.targetValue}% IRR</span>
                        <span className="text-text-secondary">
                          {flip.currentValue?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            flip.hasTriggered ? 'bg-success' : 'bg-info'
                          }`}
                          style={{ width: `${Math.min(flipProgress, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Date certain display */}
                  {flip.trigger === 'date_certain' && flip.projectedFlipDate && (
                    <p className="text-xs text-text-tertiary">
                      Flip date: {new Date(flip.projectedFlipDate).toLocaleDateString()}
                    </p>
                  )}

                  {/* Allocation change indicator */}
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="text-text-tertiary">
                      {flip.preFlipAllocation.investor}/{flip.preFlipAllocation.sponsor}
                    </span>
                    <ArrowRight className="w-3 h-3 text-text-muted" />
                    <span className={flip.hasTriggered ? 'text-success' : 'text-text-tertiary'}>
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
            <Percent className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-tertiary">No tax equity structure configured</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
