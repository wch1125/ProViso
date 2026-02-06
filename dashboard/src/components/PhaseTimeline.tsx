import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { Card, CardHeader, CardBody } from './Card';
import type { PhaseInfo } from '../types';

interface PhaseTimelineProps {
  phase: PhaseInfo;
}

interface PhaseNode {
  name: string;
  date: string;
  status: 'completed' | 'current' | 'upcoming';
}

export function PhaseTimeline({ phase }: PhaseTimelineProps) {
  const phases: PhaseNode[] = [
    {
      name: 'Financial Close',
      date: phase.constructionStart,
      status: 'completed',
    },
    {
      name: 'Construction',
      date: phase.constructionStart,
      status: phase.current === 'construction' ? 'current' : 'completed',
    },
    {
      name: 'COD',
      date: phase.codTarget,
      status: phase.current === 'operations' ? 'completed' : 'upcoming',
    },
    {
      name: 'Operations',
      date: phase.codTarget,
      status: phase.current === 'operations' ? 'current' : 'upcoming',
    },
    {
      name: 'Maturity',
      date: phase.maturity,
      status: 'upcoming',
    },
  ];

  // Calculate progress percentage
  const startDate = new Date(phase.constructionStart);
  const codDate = new Date(phase.codTarget);
  const maturityDate = new Date(phase.maturity);
  const now = new Date();

  let progressPercent = 0;
  if (phase.current === 'construction') {
    const totalConstruction = codDate.getTime() - startDate.getTime();
    const elapsedConstruction = now.getTime() - startDate.getTime();
    progressPercent = Math.min(50, (elapsedConstruction / totalConstruction) * 50);
  } else if (phase.current === 'operations') {
    const totalOps = maturityDate.getTime() - codDate.getTime();
    const elapsedOps = now.getTime() - codDate.getTime();
    progressPercent = 50 + Math.min(50, (elapsedOps / totalOps) * 50);
  }

  return (
    <Card>
      <CardHeader title="Project Timeline" subtitle="Construction to Maturity" />
      <CardBody>
        {/* Timeline Track */}
        <div className="relative">
          {/* Background Track */}
          <div className="absolute top-4 left-0 right-0 h-1 bg-surface-2 rounded-full" />

          {/* Progress Fill */}
          <div
            className="absolute top-4 left-0 h-1 bg-gradient-to-r from-gold-600 to-gold-400 rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Phase Nodes */}
          <div className="relative flex justify-between">
            {phases.map((p, index) => (
              <div key={index} className="flex flex-col items-center">
                {/* Node Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                    p.status === 'completed'
                      ? 'bg-gold-600'
                      : p.status === 'current'
                      ? 'bg-gold-500 ring-4 ring-gold-500/20'
                      : 'bg-surface-2'
                  }`}
                >
                  {p.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-text-primary" />
                  ) : p.status === 'current' ? (
                    <Clock className="w-4 h-4 text-text-primary animate-pulse" />
                  ) : (
                    <Circle className="w-4 h-4 text-text-muted" />
                  )}
                </div>

                {/* Label */}
                <div className="mt-3 text-center">
                  <p
                    className={`text-sm font-medium ${
                      p.status === 'current'
                        ? 'text-gold-500'
                        : p.status === 'completed'
                        ? 'text-text-secondary'
                        : 'text-text-muted'
                    }`}
                  >
                    {p.name}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {new Date(p.date).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Phase Details */}
        <div className="mt-8 pt-4 border-t border-border-DEFAULT">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-tertiary">Current Phase</p>
              <p className="text-lg font-medium text-text-primary capitalize">{phase.current}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-tertiary">Next Milestone</p>
              <p className="text-lg font-medium text-gold-500">
                COD -{' '}
                {new Date(phase.codTarget).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
