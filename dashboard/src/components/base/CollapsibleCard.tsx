/**
 * CollapsibleCard - Expandable/collapsible card wrapper
 *
 * Provides a card with header that can toggle content visibility.
 * Supports force-expanded mode for high-priority content (e.g., at-risk items).
 */
import { useState, useEffect, ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardBody } from '../Card';

export interface CollapsibleCardProps {
  /** Card title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: ReactNode;
  /** Content to show when expanded */
  children: ReactNode;
  /** Default expanded state (ignored if forceExpanded is true) */
  defaultExpanded?: boolean;
  /** Force the card to be expanded (e.g., when containing at-risk items) */
  forceExpanded?: boolean;
  /** Optional icon to show before the title */
  icon?: ReactNode;
  /** Additional header actions (shown on the right) */
  headerActions?: ReactNode;
  /** Additional class names for the card */
  className?: string;
  /** Callback when expanded state changes */
  onExpandChange?: (expanded: boolean) => void;
}

export function CollapsibleCard({
  title,
  subtitle,
  children,
  defaultExpanded = false,
  forceExpanded = false,
  icon,
  headerActions,
  className = '',
  onExpandChange,
}: CollapsibleCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || forceExpanded);

  // Sync with forceExpanded prop
  useEffect(() => {
    if (forceExpanded && !isExpanded) {
      setIsExpanded(true);
      onExpandChange?.(true);
    }
  }, [forceExpanded, isExpanded, onExpandChange]);

  const handleToggle = () => {
    // Don't allow collapsing if forceExpanded is true
    if (forceExpanded && isExpanded) return;

    const newState = !isExpanded;
    setIsExpanded(newState);
    onExpandChange?.(newState);
  };

  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;

  return (
    <Card className={className}>
      <button
        type="button"
        onClick={handleToggle}
        className={`w-full text-left px-5 py-4 flex items-center justify-between ${
          forceExpanded && isExpanded ? 'cursor-default' : 'cursor-pointer hover:bg-industry-cardBgHover/50'
        } transition-colors rounded-t-xl ${!isExpanded ? 'rounded-b-xl' : ''} focus:outline-none focus:ring-2 focus:ring-industry-primary focus:ring-offset-2`}
        disabled={forceExpanded && isExpanded}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3 min-w-0">
          <ChevronIcon
            className={`w-5 h-5 text-industry-textMuted flex-shrink-0 transition-transform ${
              forceExpanded ? 'opacity-50' : ''
            }`}
          />
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-industry-textPrimary truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-industry-textMuted mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {headerActions && (
          <div
            className="flex items-center gap-2 ml-4 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {headerActions}
          </div>
        )}
      </button>

      {isExpanded && (
        <CardBody className="pt-0 border-t border-industry-borderDefault">
          {children}
        </CardBody>
      )}
    </Card>
  );
}

export default CollapsibleCard;
