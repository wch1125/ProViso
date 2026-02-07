import { ReactNode } from 'react';
import { Building2, Clock } from 'lucide-react';

interface DashboardShellProps {
  projectName: string;
  facility: string;
  currentPhase: string;
  children: ReactNode;
}

export function DashboardShell({ projectName, facility, currentPhase, children }: DashboardShellProps) {
  const phaseLabel = currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1);

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-925/80 backdrop-blur-lg border-b border-border-strong">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold text-white tracking-tight">Pro<span className="text-blue-500 font-bold">V</span>iso</span>
              </div>
              <div className="h-8 w-px bg-surface-2" />
              <div>
                <h1 className="text-lg font-medium text-white">{projectName}</h1>
                <p className="text-sm text-gray-400">{facility}</p>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">
                  Phase: <span className="text-accent-400 font-medium">{phaseLabel}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">
                  {new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto px-6 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border-strong py-4 mt-8">
        <div className="max-w-[1920px] mx-auto px-6">
          <p className="text-center text-sm text-gray-500">
            ProViso v1.0 | Credit agreements as code
          </p>
        </div>
      </footer>
    </div>
  );
}
