/**
 * Step Guide Component
 *
 * Bottom popover with narrative text and navigation controls.
 */

import { ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import { useDemoNavigation } from '../../context/DemoContext';
import { getStepNarrative, getTotalSteps, getActInfo } from '../../utils/demoNarratives';

export function StepGuide() {
  const { currentAct, currentStep, nextStep, prevStep } = useDemoNavigation();

  const narrative = getStepNarrative(currentAct, currentStep);
  const actInfo = getActInfo(currentAct);
  const totalSteps = getTotalSteps(currentAct);
  const isFirstStep = currentAct === 1 && currentStep === 1;
  const isLastStep = currentAct === 4 && currentStep === totalSteps;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-4xl mx-auto px-4 pb-4">
        <div
          className="
            bg-surface-2/95 backdrop-blur-sm
            border border-border-DEFAULT rounded-xl
            shadow-2xl shadow-black/20
            overflow-hidden
          "
        >
          {/* Header with act info */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border-DEFAULT bg-surface-3/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gold-400">
                Act {currentAct}: {actInfo.title}
              </span>
              <span className="text-text-muted">|</span>
              <span className="text-xs text-text-tertiary">
                Step {currentStep} of {totalSteps}
              </span>
            </div>

            {/* Step dots */}
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`
                    w-2 h-2 rounded-full transition-colors
                    ${i + 1 === currentStep
                      ? 'bg-gold-400'
                      : i + 1 < currentStep
                        ? 'bg-gold-400/50'
                        : 'bg-surface-4'
                    }
                  `}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {narrative.title}
            </h3>
            <p className="text-text-secondary leading-relaxed">
              {narrative.content}
            </p>

            {/* Hint */}
            {narrative.hint && (
              <div className="flex items-start gap-2 mt-3 text-sm text-gold-400/80">
                <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{narrative.hint}</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-DEFAULT bg-surface-3/30">
            <button
              onClick={prevStep}
              disabled={isFirstStep}
              className={`
                flex items-center gap-1 px-3 py-1.5 rounded-lg
                text-sm font-medium transition-colors
                ${isFirstStep
                  ? 'text-text-muted cursor-not-allowed'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-3'
                }
              `}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={nextStep}
              disabled={isLastStep}
              className={`
                flex items-center gap-1 px-4 py-1.5 rounded-lg
                text-sm font-medium transition-colors
                ${isLastStep
                  ? 'bg-success/20 text-success'
                  : 'bg-gold-600 text-navy-900 hover:bg-gold-500'
                }
              `}
            >
              {isLastStep ? (
                'Demo Complete!'
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StepGuide;
