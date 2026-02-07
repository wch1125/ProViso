import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Footer } from '../components/landing';
import { TopNav } from '../components/layout';

/**
 * Legal page — Terms of Use and Privacy Policy.
 * Anchor-linked sections so Footer can deep-link to #terms or #privacy.
 */
export function Legal() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.replace('#', ''));
      if (el) {
        // Small delay to let layout settle after lazy load
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  return (
    <div className="min-h-screen bg-surface-0">
      <TopNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-600 via-navy-700 to-navy-800 py-16 px-6">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-3 mb-6 opacity-0 animate-fade-up"
            style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
          >
            <span className="font-display text-3xl font-medium text-white tracking-tight">
              Pro<span className="text-blue-500 font-bold">V</span>iso
            </span>
          </Link>
          <h1
            className="font-display text-3xl md:text-4xl font-medium text-white tracking-tight mb-4 opacity-0 animate-fade-up"
            style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
          >
            Legal
          </h1>
          <p
            className="text-lg text-white/70 max-w-2xl mx-auto opacity-0 animate-fade-up"
            style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
          >
            Terms of Use and Privacy Policy for the ProViso demo.
          </p>
        </div>
      </section>

      {/* Terms of Use */}
      <section id="terms" className="py-16 px-6 bg-surface-0 scroll-mt-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-sm font-semibold text-gold-500 uppercase tracking-[0.15em] mb-4">
            Terms of Use
          </h2>
          <p className="text-xs text-text-tertiary mb-8">Last updated: February 2026</p>

          <div className="space-y-6 text-text-secondary leading-relaxed">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">1. Demo &amp; Educational Purpose</h3>
              <p>
                ProViso is a technology demonstration and educational tool. It is not production
                software and is not intended for use in actual credit agreement compliance,
                legal analysis, or financial decision-making. Nothing on this site constitutes
                legal, financial, or investment advice.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">2. Synthetic Data</h3>
              <p>
                All financial data, deal structures, borrower names, and scenarios presented in
                this demo are entirely synthetic. They do not represent real transactions,
                companies, or financial positions. Any resemblance to actual deals or entities
                is coincidental.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">3. No Warranty</h3>
              <p>
                This demo is provided "as is" and "as available" without warranties of any kind,
                whether express or implied. We make no representations regarding the accuracy,
                reliability, or completeness of any content, calculations, or outputs.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">4. Intellectual Property</h3>
              <p>
                The ProViso language design, parser, interpreter, and dashboard are original works.
                All rights are reserved unless otherwise stated. The source code is available for
                review but is not licensed for commercial use without permission.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">5. Limitation of Liability</h3>
              <p>
                In no event shall the authors or contributors be liable for any direct, indirect,
                incidental, special, or consequential damages arising from the use of or inability
                to use this demo, including but not limited to reliance on any outputs or
                calculations presented herein.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6">
        <hr className="border-border-subtle" />
      </div>

      {/* Privacy Policy */}
      <section id="privacy" className="py-16 px-6 bg-surface-0 scroll-mt-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-sm font-semibold text-gold-500 uppercase tracking-[0.15em] mb-4">
            Privacy Policy
          </h2>
          <p className="text-xs text-text-tertiary mb-8">Last updated: February 2026</p>

          <div className="space-y-6 text-text-secondary leading-relaxed">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">1. No Personal Data Collection</h3>
              <p>
                This site does not require accounts, sign-ups, or form submissions. We do not
                collect, store, or process any personal information. There are no user databases
                or authentication systems.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">2. Hosting &amp; Server Logs</h3>
              <p>
                This site is hosted on GitHub Pages. As with any web server, standard HTTP
                request logs (IP address, user-agent string, pages visited, timestamps) may be
                collected by the hosting provider. These logs are managed by GitHub in accordance
                with their{' '}
                <a
                  href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-500 hover:text-gold-400 underline underline-offset-2"
                >
                  privacy statement
                </a>.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">3. Local Storage</h3>
              <p>
                The demo uses your browser's session storage and local storage solely to persist
                UI state (e.g., selected deal, editor content) during your visit. This data
                never leaves your browser and is not transmitted to any server.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">4. No Third-Party Tracking</h3>
              <p>
                We do not use any analytics services, advertising networks, tracking pixels,
                or third-party cookies. There are no social media widgets that collect data.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">5. Contact</h3>
              <p>
                If you have questions about this policy, you can reach us at{' '}
                <a
                  href="https://haslun.online"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-500 hover:text-gold-400 underline underline-offset-2"
                >
                  haslun.online
                </a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-gradient-to-br from-navy-600 via-navy-700 to-navy-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-2xl md:text-3xl font-medium text-white mb-4">
            Ready to explore?
          </h2>
          <p className="text-lg text-white/70 mb-8">
            Try the interactive demo with realistic project finance scenarios.
          </p>
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gold-600 hover:bg-gold-500 text-navy-900 font-medium rounded-lg transition-colors text-lg"
          >
            Launch Demo
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Legal;
