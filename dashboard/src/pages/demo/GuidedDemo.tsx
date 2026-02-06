/**
 * Guided Demo Page
 *
 * 4-act interactive demo showcasing ProViso's value proposition:
 * Act 1: The Reveal - Legal prose vs executable code
 * Act 2: The Power - Interactive terminal with real interpreter
 * Act 3: Negotiation - Version comparison with computed diffs
 * Act 4: Single Source - CP extraction from code
 */

import { DemoProvider, useDemoNavigation } from '../../context/DemoContext';
import { TopNav } from '../../components/layout';
import {
  DemoNavigation,
  StepGuide,
  ProseCodeReveal,
  InteractiveTerminal,
  NegotiationDemo,
  ClosingDemo,
} from '../../components/demo';

function GuidedDemoContent() {
  const { currentAct } = useDemoNavigation();

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      {/* Global navigation with breadcrumb */}
      <TopNav breadcrumbs={[{ label: 'Interactive Demo' }]} />

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
