import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onTryDemo: () => void;
}

/**
 * Hero section with gradient background, grid pattern, and CTA.
 */
export function Hero({ onTryDemo }: HeroProps) {
  return (
    <section
      className="
        relative overflow-hidden
        bg-gradient-to-br from-navy-600 via-navy-700 to-navy-800
        min-h-[80vh] flex items-center
        px-6 py-20
      "
    >
      {/* Subtle grid pattern overlay */}
      <div
        className="
          absolute inset-0 opacity-[0.03]
          pointer-events-none
        "
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial glow behind content */}
      <div
        className="
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[800px] h-[800px]
          bg-gold-600/10 rounded-full blur-3xl
          pointer-events-none
        "
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Logo */}
        <div
          className="
            inline-flex items-center gap-3 mb-8
            opacity-0 animate-fade-up
          "
          style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
        >
          <div
            className="
              w-12 h-12 bg-gold-600 rounded-xl
              flex items-center justify-center
              font-display font-semibold text-2xl text-navy-600
            "
          >
            P
          </div>
          <span className="font-display text-2xl font-medium text-white">
            Pro<span className="text-gold-400">Viso</span>
          </span>
        </div>

        {/* Headline */}
        <h1
          className="
            font-display text-4xl md:text-5xl lg:text-6xl font-medium text-white
            tracking-tight leading-tight mb-6
            opacity-0 animate-fade-up
          "
          style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
        >
          Credit Agreements as{' '}
          <span className="text-gold-400">Code</span>
        </h1>

        {/* Tagline */}
        <p
          className="
            font-display text-lg md:text-xl text-white/70 italic mb-4
            opacity-0 animate-fade-up
          "
          style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
        >
          Read like legal documents. Run like programs.
        </p>

        {/* Description */}
        <p
          className="
            text-base md:text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed
            opacity-0 animate-fade-up
          "
          style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
        >
          Instant compliance checking, basket tracking, and pro forma simulation
          for project finance. Transform weeks of legal memos into milliseconds of certainty.
        </p>

        {/* CTA */}
        <div
          className="
            flex flex-col sm:flex-row items-center justify-center gap-4
            opacity-0 animate-fade-up
          "
          style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}
        >
          <button
            onClick={onTryDemo}
            className="
              inline-flex items-center gap-2
              bg-gradient-to-r from-gold-600 to-gold-500
              hover:from-gold-500 hover:to-gold-400
              text-white font-semibold
              px-8 py-4 rounded-lg
              shadow-md hover:shadow-gold
              transform hover:-translate-y-0.5
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-navy-700
            "
          >
            Try the Demo
            <ArrowRight className="w-5 h-5" />
          </button>

          <a
            href="https://github.com/haslun/proviso"
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-2
              bg-transparent border border-white/20
              hover:border-gold-600 hover:bg-gold-600/10
              text-white/70 hover:text-gold-400
              px-6 py-3 rounded-lg
              transition-all duration-150
            "
          >
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;
