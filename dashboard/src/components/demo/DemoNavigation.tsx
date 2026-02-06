/**
 * Demo Navigation Component
 *
 * Act tabs with progress indicator for the guided demo.
 */

import { Eye, Terminal, GitCompare, CheckSquare } from 'lucide-react';
import { useDemoNavigation } from '../../context/DemoContext';
import { ACTS, getTotalSteps } from '../../utils/demoNarratives';
import type { DemoAct } from '../../context/DemoContext';

const ACT_ICONS = {
  reveal: Eye,
  power: Terminal,
  negotiate: GitCompare,
  close: CheckSquare,
};

export function DemoNavigation() {
  const { currentAct, currentStep, setAct, maxActVisited } = useDemoNavigation();

  return (
    <div className="bg-surface-2 border-b border-border-DEFAULT">
      <div className="max-w-6xl mx-auto px-4">
        <nav className="flex items-center justify-between py-3">
          {/* Act Tabs */}
          <div className="flex items-center gap-1">
            {ACTS.map((act) => {
              const Icon = ACT_ICONS[act.icon];
              const isActive = currentAct === act.id;
              const isAccessible = act.id <= maxActVisited;
              const totalSteps = getTotalSteps(act.id);

              return (
                <button
                  key={act.id}
                  onClick={() => isAccessible && setAct(act.id)}
                  disabled={!isAccessible}
                  className={`
                    relative flex items-center gap-2 px-4 py-2 rounded-lg
                    transition-all duration-200
                    ${isActive
                      ? 'bg-gold-600/20 text-gold-400 border border-gold-600/30'
                      : isAccessible
                        ? 'text-text-secondary hover:bg-surface-3 hover:text-text-primary'
                        : 'text-text-muted opacity-50 cursor-not-allowed'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-medium">Act {act.id}</span>
                    <span className="text-xs opacity-70">{act.title}</span>
                  </div>

                  {/* Step indicator dots */}
                  {isActive && (
                    <div className="flex gap-0.5 ml-2">
                      {Array.from({ length: totalSteps }, (_, i) => (
                        <div
                          key={i}
                          className={`
                            w-1.5 h-1.5 rounded-full transition-colors
                            ${i + 1 <= currentStep ? 'bg-gold-400' : 'bg-gold-400/30'}
                          `}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Overall Progress */}
          <div className="flex items-center gap-3">
            <OverallProgress currentAct={currentAct} currentStep={currentStep} />
          </div>
        </nav>
      </div>
    </div>
  );
}

function OverallProgress({ currentAct, currentStep }: { currentAct: DemoAct; currentStep: number }) {
  // Calculate total progress
  let completedSteps = 0;
  let totalSteps = 0;

  for (const act of ACTS) {
    const stepsInAct = getTotalSteps(act.id);
    totalSteps += stepsInAct;

    if (act.id < currentAct) {
      completedSteps += stepsInAct;
    } else if (act.id === currentAct) {
      completedSteps += currentStep - 1;
    }
  }

  const progressPct = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-1.5 bg-surface-3 rounded-full overflow-hidden">
        <div
          className="h-full bg-gold-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <span className="text-xs text-text-muted">
        {Math.round(progressPct)}%
      </span>
    </div>
  );
}

export default DemoNavigation;
