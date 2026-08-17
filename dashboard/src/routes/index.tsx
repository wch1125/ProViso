import { lazy, useMemo, type ReactNode } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import {
  ProVisoProvider,
  ClosingProvider,
  DealProvider,
  IndustryThemeProvider,
  useProViso,
} from '../context';
import { transformCPChecklistsToConditions, mergeLiveWithDemoConditions } from '../utils/cpTransformer';
import { getScenarioById } from '../data/demo-scenarios';

// Lazy-loaded page components for code splitting.
// Lazy so each page ships as its own chunk.
const Landing = lazy(() => import('../pages/Landing'));
const About = lazy(() => import('../pages/About'));
const Legal = lazy(() => import('../pages/Legal'));
const GuidedDemo = lazy(() => import('../pages/demo/GuidedDemo'));
const DealList = lazy(() => import('../pages/deals/DealList'));
const NegotiationStudio = lazy(() => import('../pages/negotiation/NegotiationStudio'));
const ClosingDashboard = lazy(() => import('../pages/closing/ClosingDashboard'));
const MonitoringDashboard = lazy(() => import('../pages/monitoring/MonitoringDashboard'));

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

/**
 * Resolves a URL dealId to its industry via the demo scenarios.
 *
 * Passed into IndustryThemeProvider rather than imported by it, so that the
 * public bundle — which has no scenarios — never pulls in demo-scenarios.ts.
 */
function industryForDeal(dealId: string | null) {
  if (!dealId) return null;
  return getScenarioById(dealId)?.metadata?.industry ?? null;
}

/**
 * The gated app: every route, served only from app.proviso.finance.
 *
 * Landing/about/legal are mounted here too, so the app origin remains a
 * complete, self-contained site for anyone who has been granted access.
 */
const AppRoutes = () => (
  <DealProvider>
    <ProVisoProvider>
      <IndustryThemeProvider resolveIndustry={industryForDeal}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
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
      </IndustryThemeProvider>
    </ProVisoProvider>
  </DealProvider>
);

export default AppRoutes;
