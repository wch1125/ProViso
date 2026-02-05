/**
 * DealPageLayout - Unified layout for all deal-specific pages
 *
 * Provides consistent header, navigation, and structure across
 * Negotiation, Closing, and Monitoring views.
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, BarChart3 } from 'lucide-react';
import { Badge } from '../base/Badge';

type DealView = 'negotiate' | 'closing' | 'monitor';
type DealStatus = 'draft' | 'negotiation' | 'closing' | 'active' | 'matured';

export interface DealPageLayoutProps {
  dealId: string;
  dealName: string;
  dealStatus: DealStatus;
  subtitle?: string;
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

export function DealPageLayout({
  dealId,
  dealName,
  dealStatus,
  subtitle,
  actions,
  children,
}: DealPageLayoutProps) {
  const location = useLocation();
  const currentView = getCurrentView(location.pathname);
  const status = statusConfig[dealStatus];

  return (
    <div className="min-h-screen bg-industry-pageBg">
      {/* Header */}
      <header className="bg-industry-headerBg border-b border-industry-borderDefault sticky top-0 z-20">
        <div className="px-6">
          {/* Top row: Back + Deal info + Actions */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="p-2 -ml-2 text-industry-textSecondary hover:text-industry-textPrimary hover:bg-industry-cardBg rounded-lg transition-colors"
                aria-label="Back to home"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-industry-textPrimary">
                    {dealName}
                  </h1>
                  <Badge variant={status.variant} dot>
                    {status.label}
                  </Badge>
                </div>
                {subtitle && (
                  <p className="text-sm text-industry-textSecondary mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>

          {/* Navigation tabs */}
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
    <nav className="flex -mb-px" aria-label="Deal sections">
      {navItems.map((item) => {
        const isActive = currentView === item.id;
        const Icon = item.icon;

        return (
          <Link
            key={item.id}
            to={`/deals/${dealId}/${item.id}`}
            className={`
              flex items-center gap-2 px-4 py-3
              text-sm font-medium border-b-2
              transition-colors
              ${isActive
                ? 'border-industry-primary text-industry-primary'
                : 'border-transparent text-industry-textSecondary hover:text-industry-textPrimary hover:border-industry-borderStrong'
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
    <div className={`p-6 ${className}`}>
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
      className="min-h-[calc(100vh-121px)] bg-industry-headerBg border-r border-industry-borderDefault p-4"
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
