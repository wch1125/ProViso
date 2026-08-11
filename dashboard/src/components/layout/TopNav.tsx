/**
 * TopNav - Global navigation bar for all pages
 *
 * v2.4 Design System: Sticky, 64px height, navy-900/95% opacity with backdrop-blur.
 * Shows on every page. Contains logo, nav links, optional breadcrumbs, and utility actions.
 */
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Menu, X } from 'lucide-react';
import { ThemeToggle } from '../landing/ThemeToggle';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav
      /* The bar stays navy in BOTH modes — it is the brand's anchor, and the
         design keeps a dark top bar over a light page. Everything inside it
         therefore uses fixed light-on-navy colours rather than the surface and
         ink tokens, which flip with the mode and would go navy-on-navy. */
      className="
        sticky top-0 z-30
        h-16
        bg-navy-900/95 backdrop-blur-md
        border-b border-white/10
        shadow-sm
      "
    >
      <div className="h-full max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Logo + Wordmark + Breadcrumbs */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-3 group" aria-label="ProViso home">
              <span className="text-xl font-semibold text-white tracking-tight">
                Pro<span className="text-blue-500 font-bold">V</span>iso
              </span>
            </Link>

            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 ml-2">
                {breadcrumbs.map((crumb, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-navy-300" />
                    {crumb.to ? (
                      <Link
                        to={crumb.to}
                        className="text-sm text-navy-100 hover:text-white transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-sm text-navy-200">{crumb.label}</span>
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
                        ? 'text-gold-400'
                        : 'text-navy-100 hover:text-white'
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

        {/* Right: utility actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle — present on every page, since TopNav is global */}
          <ThemeToggle />

          {/* Hamburger button — mobile only */}
          <button
            className="sm:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-navy-100 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden absolute top-16 inset-x-0 bg-navy-900/98 backdrop-blur-md border-b border-white/10 shadow-lg z-40">
          <div className="flex flex-col py-2">
            {navLinks.map((link) => {
              const isActive =
                location.pathname === link.to ||
                (link.to === '/deals' && location.pathname.startsWith('/deals'));

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    py-3 px-6 text-sm font-medium
                    transition-colors duration-200
                    ${isActive
                      ? 'text-gold-400 bg-gold-400/10'
                      : 'text-navy-100 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

export default TopNav;
