/**
 * Negotiation Demo Component
 *
 * Act 3: Version comparison with computed diffs.
 */

import { useState, useMemo } from 'react';
import { GitCompare, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useDemoNavigation, useDemoInterpreter } from '../../context/DemoContext';
import { DiffViewer } from '../diff/DiffViewer';
import { VERSION_LABELS } from '../../utils/demoNarratives';
import { demoChangeSummaryV1toV2, demoChangeSummaryV2toV3 } from '../../data/negotiation-demo';
import type { ChangeSummary, Change } from '../../data/negotiation-demo';

export function NegotiationDemo() {
  const { currentStep } = useDemoNavigation();
  const { getVersionCode } = useDemoInterpreter();

  // Version selection state
  const [fromVersion, setFromVersion] = useState(0);
  const [toVersion, setToVersion] = useState(1);

  // Adjust versions based on step
  useMemo(() => {
    if (currentStep === 2) {
      setFromVersion(0);
      setToVersion(1);
    } else if (currentStep === 3) {
      setFromVersion(1);
      setToVersion(2);
    }
  }, [currentStep]);

  // Get code for diff
  const fromCode = getVersionCode(fromVersion);
  const toCode = getVersionCode(toVersion);

  // Get change summary
  const changeSummary = useMemo(() => {
    if (fromVersion === 0 && toVersion === 1) {
      return demoChangeSummaryV1toV2;
    } else if (fromVersion === 1 && toVersion === 2) {
      return demoChangeSummaryV2toV3;
    }
    return null;
  }, [fromVersion, toVersion]);

  if (currentStep === 1) {
    return <NegotiationIntro />;
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Version Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <VersionSelector
            value={fromVersion}
            onChange={setFromVersion}
            max={toVersion - 1}
            label="From"
          />
          <ArrowRight className="w-5 h-5 text-text-muted" />
          <VersionSelector
            value={toVersion}
            onChange={setToVersion}
            min={fromVersion + 1}
            label="To"
          />
        </div>

        {/* Change Summary Badge */}
        {changeSummary && (
          <ChangeSummaryBadge summary={changeSummary} />
        )}
      </div>

      {/* Main content: Diff + Changes */}
      <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
        {/* Diff Viewer */}
        <div className="col-span-2 min-h-0">
          <DiffViewer
            fromCode={fromCode}
            toCode={toCode}
            fromLabel={VERSION_LABELS[fromVersion]?.short ?? `v${fromVersion + 1}`}
            toLabel={VERSION_LABELS[toVersion]?.short ?? `v${toVersion + 1}`}
            maxHeight="100%"
          />
        </div>

        {/* Change List */}
        <div className="overflow-hidden flex flex-col bg-surface-2 rounded-xl border border-border-DEFAULT">
          <div className="px-4 py-3 border-b border-border-DEFAULT bg-surface-3/50">
            <h3 className="text-sm font-medium text-text-secondary">
              {changeSummary?.totalChanges ?? 0} Changes Detected
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {changeSummary?.changes.map((change) => (
              <ChangeItem key={change.id} change={change} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NegotiationIntro() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="max-w-xl text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gold-600/20 border border-gold-600/30 flex items-center justify-center">
          <GitCompare className="w-10 h-10 text-gold-400" />
        </div>
        <h2 className="text-2xl font-semibold text-text-primary mb-4">
          Negotiation Tracking
        </h2>
        <p className="text-text-secondary leading-relaxed mb-6">
          Credit agreements go through multiple rounds of negotiation.
          Each side proposes changes. Tracking who changed what—and understanding
          the impact—is critical.
        </p>
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-text-muted">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span>Borrower favorable</span>
          </div>
          <div className="flex items-center gap-2 text-text-muted">
            <div className="w-3 h-3 rounded-full bg-danger" />
            <span>Lender favorable</span>
          </div>
          <div className="flex items-center gap-2 text-text-muted">
            <div className="w-3 h-3 rounded-full bg-text-muted" />
            <span>Neutral</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface VersionSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
}

function VersionSelector({ value, onChange, min = 0, max = 2, label }: VersionSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-muted">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="
          px-3 py-1.5 text-sm font-medium
          bg-surface-3 border border-border-DEFAULT rounded-lg
          text-text-primary
          focus:outline-none focus:ring-2 focus:ring-gold-600/50
        "
      >
        {VERSION_LABELS.map((v, i) => (
          <option key={i} value={i} disabled={i < min || i > max}>
            {v.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ChangeSummaryBadge({ summary }: { summary: ChangeSummary }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-text-muted">By {summary.authorParty}</span>
      <div className="flex items-center gap-2">
        {summary.borrowerFavorable > 0 && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/20 text-success text-xs">
            <TrendingUp className="w-3 h-3" />
            {summary.borrowerFavorable} borrower
          </span>
        )}
        {summary.lenderFavorable > 0 && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-danger/20 text-danger text-xs">
            <TrendingDown className="w-3 h-3" />
            {summary.lenderFavorable} lender
          </span>
        )}
        {summary.neutral > 0 && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-4 text-text-muted text-xs">
            <Minus className="w-3 h-3" />
            {summary.neutral} neutral
          </span>
        )}
      </div>
    </div>
  );
}

function ChangeItem({ change }: { change: Change }) {
  const impactColors = {
    borrower_favorable: 'border-l-success bg-success/5',
    lender_favorable: 'border-l-danger bg-danger/5',
    neutral: 'border-l-text-muted bg-surface-3/50',
    unclear: 'border-l-warning bg-warning/5',
  };

  const typeLabels = {
    added: { text: 'Added', color: 'text-success' },
    removed: { text: 'Removed', color: 'text-danger' },
    modified: { text: 'Modified', color: 'text-warning' },
  };

  const typeInfo = typeLabels[change.changeType];

  return (
    <div
      className={`
        p-3 mb-2 rounded-lg border-l-4
        ${impactColors[change.impact]}
      `}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-text-secondary">
          {change.elementName}
        </span>
        <span className={`text-xs font-medium ${typeInfo.color}`}>
          {typeInfo.text}
        </span>
      </div>
      <p className="text-xs text-text-muted mb-2 line-clamp-2">
        {change.description}
      </p>
      {change.impactDescription && (
        <p className="text-xs text-text-tertiary italic">
          {change.impactDescription}
        </p>
      )}
    </div>
  );
}

export default NegotiationDemo;
