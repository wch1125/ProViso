import { ArrowRight, Sun, Wind, Building2 } from 'lucide-react';
import { trackDemoStarted } from '../../utils/analytics';

interface Industry {
  id: string;
  icon: typeof Sun;
  emoji: string;
  name: string;
  description: string;
  detail: string;
}

const industries: Industry[] = [
  {
    id: 'solar',
    icon: Sun,
    emoji: '☀️',
    name: 'Solar Utility',
    description: '200MW utility-scale solar with ITC tax equity partnership',
    detail: 'TECHNICAL_MILESTONE, PERFORMANCE_GUARANTEE, TAX_EQUITY_STRUCTURE',
  },
  {
    id: 'wind',
    icon: Wind,
    emoji: '🌬️',
    name: 'Wind Onshore',
    description: '150MW wind farm with PTC production tax credits',
    detail: 'Turbine milestones, curtailment covenants, gearbox reserves',
  },
  {
    id: 'corporate',
    icon: Building2,
    emoji: '🏢',
    name: 'Corporate Revolver',
    description: '$150M revolving credit facility with leverage covenants',
    detail: 'COVENANT, BASKET, BUILDER, cure rights, amendments',
  },
];

interface IndustrySelectorProps {
  onSelect: (industryId: string) => void;
}

/**
 * Industry selector cards for choosing demo scenario.
 */
export function IndustrySelector({ onSelect }: IndustrySelectorProps) {
  return (
    <section className="bg-surface-1 py-20 px-6 border-t border-border-subtle">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div
          className="text-center mb-12 opacity-0 animate-fade-up"
          style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
        >
          <h2 className="font-display text-sm font-semibold text-gold-500 uppercase tracking-[0.15em] mb-4">
            Try the Demo
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Explore a sample credit facility with real compliance checking
          </p>
        </div>

        {/* Industry cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {industries.map((industry, index) => {
            const Icon = industry.icon;
            return (
              <button
                key={industry.id}
                onClick={() => {
                  trackDemoStarted(industry.id);
                  onSelect(industry.id);
                }}
                className="
                  group relative overflow-hidden text-left
                  bg-surface-2 border-2 border-border-DEFAULT rounded-2xl
                  p-8
                  hover:border-gold-600
                  focus:outline-none focus:ring-2 focus:ring-gold-600 focus:ring-offset-2 focus:ring-offset-surface-1
                  transition-all duration-300
                  opacity-0 animate-fade-up
                "
                style={{ animationDelay: `${150 + index * 50}ms`, animationFillMode: 'forwards' }}
              >
                {/* Background glow on hover */}
                <div
                  className="
                    absolute inset-0 opacity-0 group-hover:opacity-100
                    bg-gradient-to-br from-gold-600/5 to-transparent
                    transition-opacity duration-300
                  "
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className="
                      w-14 h-14 mb-5
                      bg-gradient-to-br from-gold-600/20 to-gold-600/5
                      border border-gold-600/20
                      rounded-xl flex items-center justify-center
                      group-hover:scale-110 group-hover:border-gold-600/40
                      transition-all duration-300
                    "
                  >
                    <Icon className="w-7 h-7 text-gold-500" />
                  </div>

                  {/* Name */}
                  <h3 className="font-display text-xl font-medium text-text-primary mb-2">
                    {industry.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-text-tertiary mb-4 leading-relaxed">
                    {industry.description}
                  </p>

                  {/* Detail (constructs used) */}
                  <p className="text-xs text-text-muted font-mono mb-6">
                    {industry.detail}
                  </p>

                  {/* CTA */}
                  <span
                    className="
                      inline-flex items-center gap-2
                      text-gold-500 font-medium text-sm
                      group-hover:gap-3
                      transition-all duration-200
                    "
                  >
                    Explore Demo
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default IndustrySelector;
