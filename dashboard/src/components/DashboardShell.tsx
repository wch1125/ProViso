import { ReactNode } from 'react';
import { FileCode2, Building2, Clock } from 'lucide-react';

interface DashboardShellProps {
  projectName: string;
  facility: string;
  currentPhase: string;
  children: ReactNode;
}

export function DashboardShell({ projectName, facility, currentPhase, children }: DashboardShellProps) {
  const phaseLabel = currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-925/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center shadow-glow">
                  <FileCode2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-white">ProViso</span>
              </div>
              <div className="h-8 w-px bg-slate-700" />
              <div>
                <h1 className="text-lg font-medium text-white">{projectName}</h1>
                <p className="text-sm text-gray-400">{facility}</p>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-6">
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
      <footer className="border-t border-slate-800 py-4 mt-8">
        <div className="max-w-[1920px] mx-auto px-6">
          <p className="text-center text-sm text-gray-500">
            ProViso v1.0 | Credit agreements as code
          </p>
        </div>
      </footer>
    </div>
  );
}
