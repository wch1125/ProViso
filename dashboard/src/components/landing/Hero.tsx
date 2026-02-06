import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sun, Wind, Building2, Briefcase, Info, Play } from 'lucide-react';
import { trackDemoStarted } from '../../utils/analytics';

interface Industry {
  id: string;
  icon: typeof Sun;
  name: string;
  description: string;
}

const industries: Industry[] = [
  {
    id: 'abc-acquisition',
    icon: Briefcase,
    name: 'ABC Acquisition',
    description: '$150M leveraged buyout facility',
  },
  {
    id: 'solar',
    icon: Sun,
    name: 'Solar Utility',
    description: '200MW utility-scale solar with ITC tax equity',
  },
  {
    id: 'wind',
    icon: Wind,
    name: 'Wind Onshore',
    description: '150MW wind farm with PTC credits',
  },
  {
    id: 'corporate',
    icon: Building2,
    name: 'Corporate Revolver',
    description: '$150M revolving credit facility',
  },
];

interface HeroProps {
  onSelectIndustry: (industryId: string) => void;
}

/**
 * Hero section with gradient background, grid pattern, and demo cards.
 */
export function Hero({ onSelectIndustry }: HeroProps) {
  const navigate = useNavigate();

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
            text-base md:text-lg text-white/60 max-w-2xl mx-auto mb-6 leading-relaxed
            opacity-0 animate-fade-up
          "
          style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
        >
          Instant compliance checking, basket tracking, and pro forma simulation
          for project finance. Transform weeks of legal memos into milliseconds of certainty.
        </p>

        {/* Action Buttons */}
        <div
          className="
            flex items-center justify-center gap-4 mb-10
            opacity-0 animate-fade-up
          "
          style={{ animationDelay: '0.45s', animationFillMode: 'forwards' }}
        >
          <button
            onClick={() => navigate('/demo')}
            className="
              flex items-center gap-2 px-5 py-2.5
              bg-gold-600 hover:bg-gold-500
              text-navy-900 font-medium rounded-lg
              transition-all duration-200
              shadow-lg shadow-gold-600/25 hover:shadow-gold-500/30
            "
          >
            <Play className="w-4 h-4" />
            Try Interactive Demo
          </button>
          <Link
            to="/about"
            className="
              inline-flex items-center gap-2 px-4 py-2.5
              text-gold-400 hover:text-gold-300
              text-sm font-medium
              border border-gold-600/30 hover:border-gold-500/50
              rounded-lg transition-colors
            "
          >
            <Info className="w-4 h-4" />
            Learn more
          </Link>
        </div>

        {/* Demo Cards */}
        <div
          className="
            grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto
            opacity-0 animate-fade-up
          "
          style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}
        >
          {industries.map((industry) => {
            const Icon = industry.icon;
            return (
              <button
                key={industry.id}
                onClick={() => {
                  trackDemoStarted(industry.id);
                  onSelectIndustry(industry.id);
                }}
                className="
                  group relative overflow-hidden text-left
                  bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl
                  p-5
                  hover:bg-white/10 hover:border-gold-500/50
                  focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-navy-700
                  transition-all duration-200
                "
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className="
                      w-10 h-10 flex-shrink-0
                      bg-gold-600/20 border border-gold-600/30
                      rounded-lg flex items-center justify-center
                      group-hover:scale-110 group-hover:bg-gold-600/30
                      transition-all duration-200
                    "
                  >
                    <Icon className="w-5 h-5 text-gold-400" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white mb-1 flex items-center gap-2">
                      {industry.name}
                      <ArrowRight className="w-4 h-4 text-gold-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-sm text-white/60 leading-snug">
                      {industry.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Hero;
