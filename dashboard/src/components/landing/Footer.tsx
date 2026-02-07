import { Link } from 'react-router-dom';

/**
 * Landing page footer.
 */
export function Footer() {
  return (
    <footer className="bg-surface-0 border-t border-border-subtle py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
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

          {/* Attribution */}
          <p className="text-sm text-text-tertiary">
            A project by{' '}
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
      </div>
    </footer>
  );
}

export default Footer;
