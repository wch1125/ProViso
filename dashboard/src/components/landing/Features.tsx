import {
  Calculator,
  TrendingUp,
  FileText,
  Zap,
  Shield,
  Building,
} from 'lucide-react';
import { FeatureCard } from './FeatureCard';

const features = [
  {
    icon: Calculator,
    title: 'Instant Compliance',
    description: 'Check covenant compliance in milliseconds, not weeks. Get definitive answers with citations to specific provisions.',
  },
  {
    icon: TrendingUp,
    title: 'Basket Tracking',
    description: 'Automatic utilization tracking with full audit trail. Know exactly how much capacity remains for investments, dividends, and debt.',
  },
  {
    icon: FileText,
    title: 'Plain English',
    description: 'Source files read like the credit agreement. Lawyers can review and understand the logic without learning to code.',
  },
  {
    icon: Zap,
    title: 'Pro Forma Simulation',
    description: '"What if" analysis for proposed transactions. See instantly whether that acquisition or dividend would trip a covenant.',
  },
  {
    icon: Shield,
    title: 'Cure Rights',
    description: 'Built-in mechanics for covenant breaches. Track cure availability, equity contributions, and grace periods automatically.',
  },
  {
    icon: Building,
    title: 'Project Finance',
    description: 'Phases, milestones, waterfalls, and reserves. Full support for construction loans with draw conditions and CP checklists.',
  },
];

/**
 * Features section with 6 feature cards in a responsive grid.
 */
export function Features() {
  return (
    <section className="bg-surface-0 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div
          className="text-center mb-12 opacity-0 animate-fade-up"
          style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
        >
          <h2 className="font-display text-sm font-semibold text-gold-500 uppercase tracking-[0.15em] mb-4">
            What This Does
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Everything you need to make credit agreements executable
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={100 + index * 50}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
