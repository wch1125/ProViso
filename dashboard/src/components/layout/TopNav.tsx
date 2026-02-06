/**
 * TopNav - Global navigation bar for all pages
 *
 * v2.4 Design System: Sticky, 64px height, navy-900/95% opacity with backdrop-blur.
 * Shows on every page. Contains logo, nav links, and utility actions.
 */
import { Link, useLocation } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

const navLinks = [
  { to: '/about', label: 'About ProViso' },
  { to: '/deals', label: 'Demo' },
] as const;

export function TopNav() {
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
        {/* Left: Logo + Wordmark */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group" aria-label="ProViso home">
            <div
              className="
                w-8 h-8 rounded-lg
                bg-gradient-to-br from-gold-500 to-gold-600
                flex items-center justify-center
                font-serif font-semibold text-lg text-navy-900
                group-hover:shadow-glow-gold-sm
                transition-shadow duration-200
              "
            >
              P
            </div>
            <span className="text-lg font-semibold text-text-primary">
              Pro<span className="text-gold-500">Viso</span>
            </span>
          </Link>

          {/* Nav Links */}
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
            <a
              href="https://github.com/haslun/proviso"
              target="_blank"
              rel="noopener noreferrer"
              className="
                px-3 py-1.5 rounded-md text-sm font-medium
                text-text-secondary hover:text-text-primary
                transition-colors duration-200
                inline-flex items-center gap-1.5
              "
            >
              GitHub
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
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
