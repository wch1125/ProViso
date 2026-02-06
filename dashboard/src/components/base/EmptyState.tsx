/**
 * EmptyState - Placeholder for empty content areas
 *
 * Displays a helpful message when lists or data areas are empty,
 * with optional action button.
 */
import React from 'react';
import { LucideIcon, FileX, Search, Inbox, FolderOpen } from 'lucide-react';
import { Button, ButtonProps } from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: ButtonProps['variant'];
    icon?: React.ReactNode;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: {
    container: 'py-6',
    icon: 'w-8 h-8',
    title: 'text-sm',
    description: 'text-xs',
  },
  md: {
    container: 'py-12',
    icon: 'w-12 h-12',
    title: 'text-base',
    description: 'text-sm',
  },
  lg: {
    container: 'py-16',
    icon: 'w-16 h-16',
    title: 'text-lg',
    description: 'text-base',
  },
};

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  size = 'md',
  className = '',
}: EmptyStateProps) {
  const styles = sizeStyles[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${styles.container} ${className}`}>
      <div className="p-4 bg-surface-2/50 rounded-full mb-4">
        <Icon className={`${styles.icon} text-text-muted`} />
      </div>
      <h3 className={`font-medium text-text-secondary mb-1 ${styles.title}`}>
        {title}
      </h3>
      {description && (
        <p className={`text-text-muted max-w-sm ${styles.description}`}>
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          <Button
            variant={action.variant || 'secondary'}
            size={size === 'lg' ? 'md' : 'sm'}
            icon={action.icon}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Pre-configured empty states for common scenarios
 */

export function NoResultsFound({
  searchTerm,
  onClear,
}: {
  searchTerm?: string;
  onClear?: () => void;
}) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={
        searchTerm
          ? `No items match "${searchTerm}". Try adjusting your search or filters.`
          : 'Try adjusting your search or filters.'
      }
      action={
        onClear
          ? {
              label: 'Clear filters',
              onClick: onClear,
              variant: 'ghost',
            }
          : undefined
      }
    />
  );
}

export function NoDataYet({
  itemType = 'items',
  onCreate,
  createLabel = 'Create first',
}: {
  itemType?: string;
  onCreate?: () => void;
  createLabel?: string;
}) {
  return (
    <EmptyState
      icon={FolderOpen}
      title={`No ${itemType} yet`}
      description={`Get started by creating your first ${itemType.replace(/s$/, '')}.`}
      action={
        onCreate
          ? {
              label: createLabel,
              onClick: onCreate,
              variant: 'primary',
            }
          : undefined
      }
    />
  );
}

export function NoChanges() {
  return (
    <EmptyState
      icon={FileX}
      title="No changes"
      description="This version has no changes from the previous version."
      size="sm"
    />
  );
}
