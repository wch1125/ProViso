import { lazy, Suspense, useState, useEffect, useMemo, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ProVisoProvider, ClosingProvider, DealProvider, IndustryThemeProvider, useProViso } from './context';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingScreen } from './components/landing';
import { transformCPChecklistsToConditions, mergeLiveWithDemoConditions } from './utils/cpTransformer';
import { getScenarioById } from './data/demo-scenarios';

// Lazy-loaded page components for code splitting
const Landing = lazy(() => import('./pages/Landing'));
const About = lazy(() => import('./pages/About'));
const Legal = lazy(() => import('./pages/Legal'));
const GuidedDemo = lazy(() => import('./pages/demo/GuidedDemo'));
const DealList = lazy(() => import('./pages/deals/DealList'));
const NegotiationStudio = lazy(() => import('./pages/negotiation/NegotiationStudio'));
const ClosingDashboard = lazy(() => import('./pages/closing/ClosingDashboard'));
const MonitoringDashboard = lazy(() => import('./pages/monitoring/MonitoringDashboard'));

/**
 * Bridge component: reads interpreter CPs from ProVisoContext
 * and passes them to ClosingProvider as initial conditions.
 *
 * Merges live (parsed) CPs with rich demo closing data so that
 * interpreter-sourced conditions inherit due dates, document links,
 * party assignments, and notes from the demo scenario.
 */
function ClosingProviderWithInterpreter({ children, dealId }: { children: ReactNode; dealId?: string }) {
  const { getConditionsPrecedentRaw, isLoaded } = useProViso();

  const interpreterConditions = useMemo(() => {
    if (!isLoaded) return undefined;
    const raw = getConditionsPrecedentRaw();
    if (raw.length === 0) return undefined;

    // Transform raw interpreter CPs to dashboard format
    const liveCPs = transformCPChecklistsToConditions(raw, dealId ?? 'current', 'current');

    // If we have a matching demo scenario, merge with its rich closing data
    if (dealId) {
      const scenario = getScenarioById(dealId);
      if (scenario?.closing?.conditions) {
        return mergeLiveWithDemoConditions(liveCPs, scenario.closing.conditions);
      }
    }

    return liveCPs;
  }, [isLoaded, getConditionsPrecedentRaw, dealId]);

  return (
    <ClosingProvider dealId={dealId} interpreterConditions={interpreterConditions}>
      {children}
    </ClosingProvider>
  );
}

/**
 * Route wrapper: extracts dealId from URL params and passes it
 * to ClosingProviderWithInterpreter for demo-data merging.
 */
function ClosingRoute() {
  // useParams must be inside <Routes>
  const { dealId } = useParams();
  return (
    <ClosingProviderWithInterpreter dealId={dealId}>
      <ClosingDashboard />
    </ClosingProviderWithInterpreter>
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
    <ErrorBoundary>
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

                {/* Legal page - terms and privacy */}
                <Route path="/legal" element={<Legal />} />

                {/* Interactive guided demo */}
                <Route path="/demo" element={<GuidedDemo />} />

                {/* Deal list */}
                <Route path="/deals" element={<DealList />} />

                {/* Deal-specific routes */}
                <Route path="/deals/:dealId/negotiate" element={<NegotiationStudio />} />
                <Route path="/deals/:dealId/closing" element={<ClosingRoute />} />
                <Route path="/deals/:dealId/monitor" element={<MonitoringDashboard />} />

                {/* Fallback - redirect unknown routes to landing */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </IndustryThemeProvider>
        </BrowserRouter>
      </ProVisoProvider>
    </DealProvider>
    </ErrorBoundary>
  );
}

export default App;
