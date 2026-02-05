import { clsx } from 'clsx';

type StatusType = 'compliant' | 'breach' | 'warning' | 'suspended' | 'pending' | 'achieved';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
}

const statusConfig: Record<StatusType, { className: string; defaultLabel: string }> = {
  compliant: { className: 'status-badge-compliant', defaultLabel: 'Compliant' },
  breach: { className: 'status-badge-breach', defaultLabel: 'Breach' },
  warning: { className: 'status-badge-warning', defaultLabel: 'At Risk' },
  suspended: { className: 'status-badge-suspended', defaultLabel: 'Suspended' },
  pending: { className: 'status-badge-pending', defaultLabel: 'Pending' },
  achieved: { className: 'status-badge-compliant', defaultLabel: 'Achieved' },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={clsx('status-badge', config.className)}>
      {label ?? config.defaultLabel}
    </span>
  );
}
