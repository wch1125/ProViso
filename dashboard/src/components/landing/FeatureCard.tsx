import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

/**
 * Feature card with icon, title, description, and premium hover effects.
 */
export function FeatureCard({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <div
      className="
        group relative overflow-hidden
        bg-surface-1 border border-border-DEFAULT rounded-xl
        p-6 md:p-8
        shadow-sm hover:shadow-elevation-2
        transform hover:-translate-y-1
        transition-all duration-300
        opacity-0 animate-fade-up
      "
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {/* Gold accent bar on hover */}
      <div
        className="
          absolute top-0 left-0 right-0 h-1
          bg-gradient-to-r from-gold-600 to-gold-400
          transform scale-x-0 origin-left
          group-hover:scale-x-100
          transition-transform duration-300
        "
      />

      {/* Icon container */}
      <div
        className="
          w-12 h-12 mb-4
          bg-gradient-to-br from-gold-600/20 to-gold-600/5
          border border-gold-600/20
          rounded-lg flex items-center justify-center
          group-hover:scale-110 group-hover:border-gold-600/40
          transition-all duration-300
        "
      >
        <Icon className="w-6 h-6 text-gold-500" />
      </div>

      {/* Title */}
      <h3 className="font-display text-lg font-medium text-text-primary mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-text-tertiary leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default FeatureCard;
