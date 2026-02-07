/**
 * Closing Demo Component
 *
 * Act 4: CP extraction display showing single source of truth.
 */

import { CheckSquare, Check, Clock, FileText, Code } from 'lucide-react';
import { useDemoNavigation } from '../../context/DemoContext';
import { HighlightedCode } from '../SourceCodeViewer';
import { DEMO_CPS, CP_CODE_SAMPLE } from '../../utils/demoNarratives';

export function ClosingDemo() {
  const { currentStep } = useDemoNavigation();

  if (currentStep === 1) {
    return <ClosingIntro />;
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Conditions Precedent</h2>
          <p className="text-sm text-text-muted">Extracted from ProViso code</p>
        </div>
        <CPStats />
      </div>

      {/* Main content: Code + Checklist */}
      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        {/* ProViso Code */}
        <div className="flex flex-col rounded-xl border border-border-DEFAULT overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border-DEFAULT bg-surface-3/50">
            <Code className="w-4 h-4 text-gold-400" />
            <span className="text-sm font-medium text-text-secondary">Source Code</span>
            <span className="text-xs text-text-muted ml-auto">.proviso</span>
          </div>
          <div className="flex-1 overflow-auto p-4 bg-surface-0/50">
            <HighlightedCode code={CP_CODE_SAMPLE} showLineNumbers />
          </div>
        </div>

        {/* Generated Checklist */}
        <div className="flex flex-col rounded-xl border border-border-DEFAULT overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border-DEFAULT bg-surface-3/50">
            <CheckSquare className="w-4 h-4 text-gold-400" />
            <span className="text-sm font-medium text-text-secondary">Generated Checklist</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {DEMO_CPS.map((cp) => (
              <CPItem key={cp.id} cp={cp} />
            ))}
          </div>
        </div>
      </div>

      {/* Key insight */}
      <div className="p-4 rounded-lg bg-gold-600/10 border border-gold-600/20">
        <p className="text-sm text-gold-400">
          <strong>Single source of truth.</strong> When the agreement changes, the checklist
          updates automatically. No spreadsheets drifting out of sync. No manual reconciliation.
        </p>
      </div>
    </div>
  );
}

function ClosingIntro() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="max-w-xl text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gold-600/20 border border-gold-600/30 flex items-center justify-center">
          <CheckSquare className="w-10 h-10 text-gold-400" />
        </div>
        <h2 className="text-2xl font-semibold text-text-primary mb-4">
          From Code to Closing
        </h2>
        <p className="text-text-secondary leading-relaxed mb-6">
          Before any loan can fund, dozens of conditions must be satisfied:
          documents executed, opinions delivered, certificates provided.
          These requirements come directly from the credit agreement.
        </p>
        <div className="flex flex-col items-center gap-3 text-sm text-text-muted">
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 rounded-full bg-surface-3">ProViso Code</span>
            <span className="text-gold-600">→</span>
            <span className="px-3 py-1 rounded-full bg-surface-3">CP Checklist</span>
            <span className="text-gold-600">→</span>
            <span className="px-3 py-1 rounded-full bg-surface-3">Closing Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CPStats() {
  const satisfied = DEMO_CPS.filter(cp => cp.status === 'satisfied').length;
  const total = DEMO_CPS.length;
  const pct = Math.round((satisfied / total) * 100);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 bg-surface-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-success rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-sm text-text-muted">
          {satisfied}/{total} satisfied
        </span>
      </div>
    </div>
  );
}

interface CPItemProps {
  cp: {
    id: string;
    section: string;
    title: string;
    description: string;
    responsible: string;
    status: 'satisfied' | 'pending';
  };
}

function CPItem({ cp }: CPItemProps) {
  const isSatisfied = cp.status === 'satisfied';

  return (
    <div
      className={`
        flex items-start gap-3 p-3 mb-2 rounded-lg border transition-colors
        ${isSatisfied
          ? 'border-success/30 bg-success/5'
          : 'border-border-DEFAULT bg-surface-3/30'
        }
      `}
    >
      {/* Status Icon */}
      <div
        className={`
          w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
          ${isSatisfied ? 'bg-success text-white' : 'bg-surface-4 text-text-muted'}
        `}
      >
        {isSatisfied ? (
          <Check className="w-4 h-4" />
        ) : (
          <Clock className="w-4 h-4" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-text-muted">{cp.section}</span>
          <span className="text-sm font-medium text-text-primary">{cp.title}</span>
        </div>
        <p className="text-xs text-text-secondary mb-1">{cp.description}</p>
        <div className="flex items-center gap-2">
          <FileText className="w-3 h-3 text-text-muted" />
          <span className="text-xs text-text-muted">{cp.responsible}</span>
        </div>
      </div>
    </div>
  );
}

export default ClosingDemo;
