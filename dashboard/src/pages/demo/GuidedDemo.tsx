/**
 * Guided Demo Page
 *
 * 4-act interactive demo showcasing ProViso's value proposition:
 * Act 1: The Reveal - Legal prose vs executable code
 * Act 2: The Power - Interactive terminal with real interpreter
 * Act 3: Negotiation - Version comparison with computed diffs
 * Act 4: Single Source - CP extraction from code
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DemoProvider, useDemoNavigation } from '../../context/DemoContext';
import {
  DemoNavigation,
  StepGuide,
  ProseCodeReveal,
  InteractiveTerminal,
  NegotiationDemo,
  ClosingDemo,
} from '../../components/demo';

function GuidedDemoContent() {
  const navigate = useNavigate();
  const { currentAct } = useDemoNavigation();

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      {/* Top Bar */}
      <header className="bg-surface-1 border-b border-border-DEFAULT">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold-600 rounded-lg flex items-center justify-center">
              <span className="font-display font-semibold text-navy-600">P</span>
            </div>
            <span className="font-display font-medium text-white">
              Pro<span className="text-gold-400">Viso</span>
            </span>
            <span className="text-text-muted ml-2">Interactive Demo</span>
          </div>

          <div className="w-[100px]" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Act Navigation */}
      <DemoNavigation />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 pb-40">
        <ActContent act={currentAct} />
      </main>

      {/* Step Guide */}
      <StepGuide />
    </div>
  );
}

function ActContent({ act }: { act: number }) {
  switch (act) {
    case 1:
      return <ProseCodeReveal />;
    case 2:
      return <InteractiveTerminal />;
    case 3:
      return <NegotiationDemo />;
    case 4:
      return <ClosingDemo />;
    default:
      return null;
  }
}

export function GuidedDemo() {
  return (
    <DemoProvider>
      <GuidedDemoContent />
    </DemoProvider>
  );
}

export default GuidedDemo;
