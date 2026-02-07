/**
 * Prose Code Reveal Component
 *
 * Act 1: Side-by-side comparison of legal prose and ProViso code.
 */

import { FileText, Code } from 'lucide-react';
import { HighlightedCode } from '../SourceCodeViewer';
import { LEGAL_PROSE } from '../../utils/demoNarratives';
import { demoVersions } from '../../data/negotiation-demo';
import { useDemoNavigation } from '../../context/DemoContext';

export function ProseCodeReveal() {
  const { currentStep } = useDemoNavigation();

  // Get the latest version code for display
  const codeVersion = demoVersions[2]; // v3 - Lender's Counter
  const code = codeVersion?.creditLangCode ?? '';

  // Extract relevant sections for the demo
  const proseContent = LEGAL_PROSE.maxLeverage;

  // Show different views based on step
  if (currentStep === 1) {
    return <IntroView />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Two-column layout */}
      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        {/* Legal Prose Side */}
        <div
          className={`
            flex flex-col rounded-xl border overflow-hidden transition-all duration-500
            ${currentStep === 2
              ? 'border-gold-600/50 bg-surface-2'
              : 'border-border-DEFAULT bg-surface-2/50'
            }
          `}
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border-DEFAULT bg-surface-3/50">
            <FileText className="w-4 h-4 text-gold-400" />
            <span className="text-sm font-medium text-text-secondary">Legal Document</span>
            <span className="text-xs text-text-muted ml-auto">.docx</span>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <pre className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap font-serif">
              {proseContent}
            </pre>
          </div>
        </div>

        {/* ProViso Code Side */}
        <div
          className={`
            flex flex-col rounded-xl border overflow-hidden transition-all duration-500
            ${currentStep === 3
              ? 'border-gold-600/50 bg-surface-2'
              : 'border-border-DEFAULT bg-surface-2/50'
            }
          `}
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border-DEFAULT bg-surface-3/50">
            <Code className="w-4 h-4 text-gold-400" />
            <span className="text-sm font-medium text-text-secondary">ProViso Code</span>
            <span className="text-xs text-text-muted ml-auto">.proviso</span>
          </div>
          <div className="flex-1 overflow-auto p-4 bg-surface-0/50">
            <HighlightedCode code={code} showLineNumbers />
          </div>
        </div>
      </div>

      {/* Key insight callout */}
      <div className="mt-4 p-4 rounded-lg bg-gold-600/10 border border-gold-600/20">
        <p className="text-sm text-gold-400">
          {currentStep === 2 ? (
            <>
              <strong>Dense legal prose.</strong> Cross-references, defined terms, nested conditions.
              Every compliance check requires manual review by expensive lawyers.
            </>
          ) : (
            <>
              <strong>Same terms, but executable.</strong> The computer can now check compliance,
              calculate headroom, and simulate proposed transactions in milliseconds.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function IntroView() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="max-w-xl text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gold-600/20 border border-gold-600/30 flex items-center justify-center">
          <FileText className="w-10 h-10 text-gold-400" />
        </div>
        <h2 className="text-2xl font-semibold text-text-primary mb-4">
          Credit Agreements Today
        </h2>
        <p className="text-text-secondary leading-relaxed mb-6">
          200+ page documents full of definitions, covenants, and conditions.
          When the CFO asks <span className="text-gold-400">"Can we make this acquisition?"</span>,
          lawyers spend days finding the answer.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-text-muted">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center">
              1
            </span>
            <span>Parse legal text</span>
          </div>
          <span className="text-gold-600">→</span>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center">
              2
            </span>
            <span>Cross-reference definitions</span>
          </div>
          <span className="text-gold-600">→</span>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center">
              3
            </span>
            <span>Calculate manually</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProseCodeReveal;
