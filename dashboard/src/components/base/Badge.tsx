import React from 'react';

export interface BadgeProps {
  variant?:
    | 'default'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'gold'
    | 'muted';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<string, { bg: string; text: string; dot: string }> = {
  default: {
    bg: 'bg-slate-700',
    text: 'text-slate-300',
    dot: 'bg-slate-400',
  },
  success: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    dot: 'bg-emerald-500',
  },
  warning: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    dot: 'bg-amber-500',
  },
  danger: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    dot: 'bg-red-500',
  },
  info: {
    bg: 'bg-accent-500/20',
    text: 'text-accent-400',
    dot: 'bg-accent-500',
  },
  gold: {
    bg: 'bg-gold-500/20',
    text: 'text-gold-500',
    dot: 'bg-gold-500',
  },
  muted: {
    bg: 'bg-slate-800',
    text: 'text-slate-500',
    dot: 'bg-slate-500',
  },
};

const sizeStyles: Record<string, { padding: string; text: string; dot: string }> = {
  sm: {
    padding: 'px-2 py-0.5',
    text: 'text-xs',
    dot: 'h-1.5 w-1.5',
  },
  md: {
    padding: 'px-2.5 py-1',
    text: 'text-xs',
    dot: 'h-2 w-2',
  },
  lg: {
    padding: 'px-3 py-1.5',
    text: 'text-sm',
    dot: 'h-2.5 w-2.5',
  },
};

export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  icon,
  children,
  className = '',
}: BadgeProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        font-medium rounded-full
        ${v.bg} ${v.text}
        ${s.padding} ${s.text}
        ${className}
      `}
    >
      {dot && <span className={`${s.dot} rounded-full ${v.dot}`} />}
      {icon && !dot && icon}
      {children}
    </span>
  );
}

// Convenience components for common status badges
export function SuccessBadge(props: Omit<BadgeProps, 'variant'>) {
  return <Badge variant="success" dot {...props} />;
}

export function WarningBadge(props: Omit<BadgeProps, 'variant'>) {
  return <Badge variant="warning" dot {...props} />;
}

export function DangerBadge(props: Omit<BadgeProps, 'variant'>) {
  return <Badge variant="danger" dot {...props} />;
}

export function InfoBadge(props: Omit<BadgeProps, 'variant'>) {
  return <Badge variant="info" dot {...props} />;
}

export function GoldBadge(props: Omit<BadgeProps, 'variant'>) {
  return <Badge variant="gold" {...props} />;
}
