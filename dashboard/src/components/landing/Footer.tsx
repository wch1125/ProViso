import { Link } from 'react-router-dom';

/**
 * Landing page footer.
 */
export function Footer() {
  return (
    <footer className="bg-surface-0 border-t border-border-subtle py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-4">
        {/* Nav links */}
        <div className="flex items-center gap-4 sm:gap-6 text-sm">
          <Link
            to="/about"
            className="text-text-secondary hover:text-gold-400 transition-colors"
          >
            About ProViso
          </Link>
          <Link
            to="/deals"
            className="text-text-secondary hover:text-gold-400 transition-colors"
          >
            Demo
          </Link>
        </div>

        {/* Legal links */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs">
          <Link
            to="/legal#terms"
            className="text-text-tertiary hover:text-text-secondary transition-colors"
          >
            Terms of Use
          </Link>
          <Link
            to="/legal#privacy"
            className="text-text-tertiary hover:text-text-secondary transition-colors"
          >
            Privacy Policy
          </Link>
        </div>

        {/* Copyright + attribution */}
        <p className="text-xs text-text-tertiary text-center">
          &copy; 2026 Haslun.Online. All rights reserved. A project by{' '}
          <a
            href="https://haslun.online"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-500 hover:text-gold-400 transition-colors"
          >
            Haslun.Online
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
