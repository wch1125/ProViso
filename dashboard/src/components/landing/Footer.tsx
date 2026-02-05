import { ExternalLink, Mail } from 'lucide-react';

/**
 * Landing page footer with haslun.ai branding.
 */
export function Footer() {
  return (
    <footer className="bg-surface-0 border-t border-border-subtle py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Branding */}
          <div className="text-center md:text-left">
            <p className="text-sm text-text-tertiary mb-1">
              Part of{' '}
              <a
                href="https://haslun.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-500 hover:text-gold-400 transition-colors"
              >
                haslun.ai
              </a>
              {' '}&mdash; AI-assisted legal infrastructure experiments.
            </p>
            <p className="text-sm text-text-tertiary">
              Built by a lawyer on the Upper West Side.{' '}
              <a
                href="mailto:feedback@haslun.ai?subject=ProViso%20Demo%20Feedback"
                className="text-gold-500 hover:text-gold-400 transition-colors inline-flex items-center gap-1"
              >
                Send feedback
                <Mail className="w-3 h-3" />
              </a>
            </p>
          </div>

          {/* Right: Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://haslun.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="
                text-sm text-text-tertiary hover:text-gold-500
                transition-colors flex items-center gap-1
              "
            >
              haslun.studio
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Colophon */}
        <p className="text-center text-xs text-text-muted mt-8 pt-6 border-t border-border-subtle italic">
          Built by hand &mdash; no templates, no trackers. NYC, 2025.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
