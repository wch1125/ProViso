import { ExternalLink } from 'lucide-react';

/**
 * Landing page footer.
 */
export function Footer() {
  return (
    <footer className="bg-surface-0 border-t border-border-subtle py-12 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-sm text-text-tertiary">
          Check out more of my projects at{' '}
          <a
            href="https://haslun.online"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-500 hover:text-gold-400 transition-colors inline-flex items-center gap-1"
          >
            Haslun.Online
            <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
