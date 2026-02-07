/**
 * DealPageLayout - Unified layout for all deal-specific pages
 *
 * v2.6 Design System: Single consolidated header below TopNav.
 * Deal name + badges + nav tabs + page actions in one bar.
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, CheckCircle, BarChart3, HardHat, Zap } from 'lucide-react';
import { Badge } from '../base/Badge';
import { TopNav } from './TopNav';
import type { Breadcrumb } from './TopNav';

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
  const currentView = getCurrentView(location.pathname);
  const status = statusConfig[dealStatus];

  // Build breadcrumbs: Deals > Deal Name > Current Tab
  const viewLabels: Record<string, string> = {
    negotiate: 'Negotiate',
    closing: 'Closing',
    monitor: 'Monitor',
  };
  const breadcrumbs: Breadcrumb[] = [
    { label: 'Deals', to: '/deals' },
    { label: dealName, to: currentView ? `/deals/${dealId}/${currentView}` : undefined },
    ...(currentView ? [{ label: viewLabels[currentView] }] : []),
  ];

  return (
    <div className="min-h-screen bg-surface-0" data-phase={currentPhase}>
      {/* Global navigation with breadcrumbs */}
      <TopNav breadcrumbs={breadcrumbs} />

      {/* Unified Deal Header: identity + tabs + actions in one bar */}
      <header className="bg-surface-1 border-b border-border-strong sm:sticky sm:top-16 z-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8">
          {/* Top row: deal identity left, actions right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 pb-1 gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="font-display text-lg sm:text-xl font-semibold text-text-primary truncate">
                {dealName}
              </h1>
              <Badge variant={status.variant} dot>
                {status.label}
              </Badge>
              {currentPhase && <PhaseBadge phase={currentPhase} />}
              {subtitle && (
                <span className="hidden lg:inline text-[13px] text-text-tertiary">
                  {subtitle}
                </span>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {actions}
              </div>
            )}
          </div>
          {/* Bottom row: nav tabs */}
          <DealNavigation dealId={dealId} currentView={currentView} />
        </div>
      </header>

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
    <nav className="flex h-11" aria-label="Deal sections">
      {navItems.map((item) => {
        const isActive = currentView === item.id;
        const Icon = item.icon;

        return (
          <Link
            key={item.id}
            to={`/deals/${dealId}/${item.id}`}
            className={`
              flex items-center gap-2 px-4 h-full
              text-sm font-medium border-b-[3px]
              transition-all duration-200
              ${isActive
                ? 'border-gold-500 text-gold-500'
                : 'border-transparent text-text-tertiary hover:text-text-secondary hover:bg-surface-2/50'
              }
            `}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="w-4 h-4" />
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
}: {
  children: React.ReactNode;
  width?: string;
}) {
  return (
    <aside
      className="hidden md:block md:w-64 shrink-0 min-h-[calc(100vh-152px)] bg-surface-1 border-r border-border-DEFAULT p-4"
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
    <div className="flex flex-col md:flex-row">
      <DealPageSidebar>{sidebar}</DealPageSidebar>
      <div className="flex-1">
        <DealPageContent>{children}</DealPageContent>
      </div>
    </div>
  );
}

export default DealPageLayout;
