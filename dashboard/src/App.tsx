import { lazy, Suspense, useState, useEffect, useMemo, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProVisoProvider, ClosingProvider, DealProvider, IndustryThemeProvider, useProViso } from './context';
import { LoadingScreen } from './components/landing';
import { transformCPChecklistsToConditions } from './utils/cpTransformer';

// Lazy-loaded page components for code splitting
const Landing = lazy(() => import('./pages/Landing'));
const About = lazy(() => import('./pages/About'));
const GuidedDemo = lazy(() => import('./pages/demo/GuidedDemo'));
const DealList = lazy(() => import('./pages/deals/DealList'));
const NegotiationStudio = lazy(() => import('./pages/negotiation/NegotiationStudio'));
const ClosingDashboard = lazy(() => import('./pages/closing/ClosingDashboard'));
const MonitoringDashboard = lazy(() => import('./pages/monitoring/MonitoringDashboard'));

/**
 * Bridge component: reads interpreter CPs from ProVisoContext
 * and passes them to ClosingProvider as initial conditions.
 */
function ClosingProviderWithInterpreter({ children }: { children: ReactNode }) {
  const { getConditionsPrecedentRaw, isLoaded } = useProViso();

  const interpreterConditions = useMemo(() => {
    if (!isLoaded) return undefined;
    const raw = getConditionsPrecedentRaw();
    if (raw.length === 0) return undefined;
    return transformCPChecklistsToConditions(raw, 'current', 'current');
  }, [isLoaded, getConditionsPrecedentRaw]);

  return (
    <ClosingProvider interpreterConditions={interpreterConditions}>
      {children}
    </ClosingProvider>
  );
}

// Loading fallback component for route transitions
function PageLoader() {
  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gold-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-tertiary">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [hasShownLoadingScreen, setHasShownLoadingScreen] = useState(false);

  useEffect(() => {
    // Only show loading screen on first visit in this session
    const hasVisited = sessionStorage.getItem('proviso-visited');
    if (!hasVisited && !hasShownLoadingScreen) {
      setShowLoadingScreen(true);
      sessionStorage.setItem('proviso-visited', 'true');
    }
  }, [hasShownLoadingScreen]);

  const handleLoadingComplete = () => {
    setShowLoadingScreen(false);
    setHasShownLoadingScreen(true);
  };

  return (
    <DealProvider>
      <ProVisoProvider>
        <BrowserRouter>
          <IndustryThemeProvider>
            {/* Loading screen on first visit */}
            {showLoadingScreen && (
              <LoadingScreen
                minDisplayTime={1600}
                onComplete={handleLoadingComplete}
              />
            )}

            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Landing page - public entry point */}
                <Route path="/" element={<Landing />} />

                {/* About page - value proposition */}
                <Route path="/about" element={<About />} />

                {/* Interactive guided demo */}
                <Route path="/demo" element={<GuidedDemo />} />

                {/* Deal list */}
                <Route path="/deals" element={<DealList />} />

                {/* Deal-specific routes */}
                <Route path="/deals/:dealId/negotiate" element={<NegotiationStudio />} />
                <Route path="/deals/:dealId/closing" element={<ClosingProviderWithInterpreter><ClosingDashboard /></ClosingProviderWithInterpreter>} />
                <Route path="/deals/:dealId/monitor" element={<MonitoringDashboard />} />

                {/* Fallback - redirect unknown routes to landing */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </IndustryThemeProvider>
        </BrowserRouter>
      </ProVisoProvider>
    </DealProvider>
  );
}

export default App;
