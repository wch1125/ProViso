import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProVisoProvider, ClosingProvider, DealProvider } from './context';
import { LoadingScreen } from './components/landing';

// Lazy-loaded page components for code splitting
const Landing = lazy(() => import('./pages/Landing'));
const DealList = lazy(() => import('./pages/deals/DealList'));
const NegotiationStudio = lazy(() => import('./pages/negotiation/NegotiationStudio'));
const ClosingDashboard = lazy(() => import('./pages/closing/ClosingDashboard'));
const MonitoringDashboard = lazy(() => import('./pages/monitoring/MonitoringDashboard'));

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

              {/* Deal list */}
              <Route path="/deals" element={<DealList />} />

              {/* Deal-specific routes */}
              <Route path="/deals/:dealId/negotiate" element={<NegotiationStudio />} />
              <Route path="/deals/:dealId/closing" element={<ClosingProvider><ClosingDashboard /></ClosingProvider>} />
              <Route path="/deals/:dealId/monitor" element={<MonitoringDashboard />} />

              {/* Fallback - redirect unknown routes to landing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ProVisoProvider>
    </DealProvider>
  );
}

export default App;
