/**
 * TopNav - Global navigation bar for all pages
 *
 * v2.4 Design System: Sticky, 64px height, navy-900/95% opacity with backdrop-blur.
 * Shows on every page. Contains logo, nav links, optional breadcrumbs, and utility actions.
 */
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface Breadcrumb {
  label: string;
  to?: string;
}

export interface TopNavProps {
  breadcrumbs?: Breadcrumb[];
}

const navLinks = [
  { to: '/about', label: 'About ProViso' },
  { to: '/deals', label: 'Demo' },
] as const;

export function TopNav({ breadcrumbs }: TopNavProps) {
  const location = useLocation();

  return (
    <nav
      className="
        sticky top-0 z-30
        h-16
        bg-navy-900/95 backdrop-blur-md
        border-b border-border-DEFAULT
        shadow-sm
      "
    >
      <div className="h-full max-w-screen-2xl mx-auto px-6 flex items-center justify-between">
        {/* Left: Logo + Wordmark + Breadcrumbs */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-3 group" aria-label="ProViso home">
              <span className="text-xl font-semibold text-text-primary tracking-tight">
                Pro<span className="text-blue-700 font-bold">V</span>iso
              </span>
            </Link>

            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 ml-2">
                {breadcrumbs.map((crumb, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                    {crumb.to ? (
                      <Link
                        to={crumb.to}
                        className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-sm text-text-tertiary">{crumb.label}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nav Links — hide when breadcrumbs are showing to avoid clutter */}
          {!breadcrumbs && (
            <div className="hidden sm:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive =
                  location.pathname === link.to ||
                  (link.to === '/deals' && location.pathname.startsWith('/deals'));

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`
                      px-3 py-1.5 rounded-md text-sm font-medium
                      transition-colors duration-200
                      ${isActive
                        ? 'text-gold-500'
                        : 'text-text-secondary hover:text-text-primary'
                      }
                    `}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Utility actions */}
        <div className="flex items-center gap-3">
          {/* Sign In button (decorative for demo) */}
          <button
            className="
              hidden sm:inline-flex items-center
              px-4 py-1.5
              text-sm font-medium text-gold-500
              border border-gold-500/50 rounded-md
              hover:bg-gold-500/10 hover:border-gold-500
              transition-all duration-200
            "
            onClick={() => {/* Demo only */}}
          >
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
}

export default TopNav;
