import { Suspense, useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeModeProvider } from './context/ThemeModeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingScreen } from './components/landing';
import SiteRoutes from './routes';

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
      <ThemeModeProvider>
        <BrowserRouter>
          {/* Loading screen on first visit */}
          {showLoadingScreen && (
            <LoadingScreen
              minDisplayTime={1600}
              onComplete={handleLoadingComplete}
            />
          )}

          <Suspense fallback={<PageLoader />}>
            <SiteRoutes />
          </Suspense>
        </BrowserRouter>
      </ThemeModeProvider>
    </ErrorBoundary>
  );
}

export default App;
