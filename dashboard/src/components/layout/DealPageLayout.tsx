/**
 * DealPageLayout - Unified layout for all deal-specific pages
 *
 * v2.4 Design System: Two-tier header below TopNav.
 * Tier 1: Deal context header (72px) — back arrow, deal name, status, actions
 * Tier 2: Sub-navigation tabs (56px) — Negotiate | Closing | Monitor
 */
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, BarChart3, HardHat, Zap, RotateCcw } from 'lucide-react';
import { Badge } from '../base/Badge';
import { Button } from '../base/Button';
import { TopNav } from './TopNav';

type DealView = 'negotiate' | 'closing' | 'monitor';
type DealStatus = 'draft' | 'negotiation' | 'closing' | 'active' | 'matured';
type ProjectPhase = 'construction' | 'operations' | 'operating';

export interface DealPageLayoutProps {
  dealId: string;
  dealName: string;
  dealStatus: DealStatus;
  subtitle?: string;
  /** Current project phase for phase-aware styling */
  currentPhase?: ProjectPhase;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const statusConfig: Record<DealStatus, { label: string; variant: 'success' | 'warning' | 'info' | 'muted' }> = {
  draft: { label: 'Draft', variant: 'muted' },
  negotiation: { label: 'Negotiation', variant: 'warning' },
  closing: { label: 'Closing', variant: 'info' },
  active: { label: 'Active', variant: 'success' },
  matured: { label: 'Matured', variant: 'muted' },
};

const navItems: { id: DealView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'negotiate', label: 'Negotiate', icon: FileText },
  { id: 'closing', label: 'Closing', icon: CheckCircle },
  { id: 'monitor', label: 'Monitor', icon: BarChart3 },
];

/**
 * Phase badge component
 */
function PhaseBadge({ phase }: { phase: ProjectPhase }) {
  const isConstruction = phase === 'construction';
  const Icon = isConstruction ? HardHat : Zap;
  const label = isConstruction ? 'Construction Phase' : 'Operating Phase';

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-phase-badgeBg text-phase-badgeText border border-phase-accent/20">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

export function DealPageLayout({
  dealId,
  dealName,
  dealStatus,
  subtitle,
  currentPhase,
  actions,
  children,
}: DealPageLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentView = getCurrentView(location.pathname);
  const status = statusConfig[dealStatus];

  const handleResetDemo = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-surface-0" data-phase={currentPhase}>
      {/* Global navigation */}
      <TopNav />

      {/* Deal Context Header */}
      <header className="bg-surface-1 border-b border-border-strong sticky top-16 z-20">
        <div className="max-w-screen-2xl mx-auto px-8">
          {/* Deal info row */}
          <div className="flex items-center justify-between h-[72px]">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="
                  p-2 -ml-2 rounded-lg
                  text-text-tertiary hover:text-text-primary
                  hover:bg-surface-2
                  transition-colors duration-200
                "
                aria-label="Back to home"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-display text-2xl font-semibold text-text-primary">
                    {dealName}
                  </h1>
                  <Badge variant={status.variant} dot>
                    {status.label}
                  </Badge>
                  {currentPhase && <PhaseBadge phase={currentPhase} />}
                </div>
                {subtitle && (
                  <p className="text-[13px] text-text-tertiary mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {actions}
              <Button
                variant="ghost"
                size="sm"
                icon={<RotateCcw className="w-4 h-4" />}
                onClick={handleResetDemo}
              >
                Reset Demo
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Sub-Navigation Tabs */}
      <div className="bg-surface-0 border-b border-border-DEFAULT sticky top-[128px] z-10">
        <div className="max-w-screen-2xl mx-auto px-8">
          <DealNavigation dealId={dealId} currentView={currentView} />
        </div>
      </div>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}

interface DealNavigationProps {
  dealId: string;
  currentView: DealView | null;
}

function DealNavigation({ dealId, currentView }: DealNavigationProps) {
  return (
    <nav className="flex h-14" aria-label="Deal sections">
      {navItems.map((item) => {
        const isActive = currentView === item.id;
        const Icon = item.icon;

        return (
          <Link
            key={item.id}
            to={`/deals/${dealId}/${item.id}`}
            className={`
              flex items-center gap-2 px-4 h-full
              text-[15px] font-medium border-b-[3px]
              transition-all duration-200
              ${isActive
                ? 'border-gold-500 text-gold-500 bg-gold-500/10'
                : 'border-transparent text-text-tertiary hover:text-text-secondary hover:bg-surface-2/50'
              }
            `}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="w-[18px] h-[18px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function getCurrentView(pathname: string): DealView | null {
  if (pathname.includes('/negotiate')) return 'negotiate';
  if (pathname.includes('/closing')) return 'closing';
  if (pathname.includes('/monitor')) return 'monitor';
  return null;
}

/**
 * DealPageContent - Standard content wrapper with padding
 */
export function DealPageContent({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-screen-2xl mx-auto p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  );
}

/**
 * DealPageSidebar - For pages with sidebar layout (like NegotiationStudio)
 */
export function DealPageSidebar({
  children,
  width = '256px',
}: {
  children: React.ReactNode;
  width?: string;
}) {
  return (
    <aside
      className="min-h-[calc(100vh-184px)] bg-surface-1 border-r border-border-DEFAULT p-4"
      style={{ width }}
    >
      {children}
    </aside>
  );
}

/**
 * DealPageWithSidebar - Layout helper for pages with sidebar
 */
export function DealPageWithSidebar({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <DealPageSidebar>{sidebar}</DealPageSidebar>
      <div className="flex-1">
        <DealPageContent>{children}</DealPageContent>
      </div>
    </div>
  );
}

export default DealPageLayout;
