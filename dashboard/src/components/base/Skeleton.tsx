/**
 * Skeleton - Loading placeholder component
 *
 * Provides animated loading placeholders for content while data is being fetched.
 * Supports various variants for different content types.
 */
export interface SkeletonProps {
  variant?: 'text' | 'card' | 'chart' | 'list-item' | 'avatar' | 'button';
  count?: number;
  className?: string;
  width?: string;
  height?: string;
}

const baseStyles = 'animate-pulse bg-surface-3/50 rounded';

const variantStyles: Record<string, { className: string; defaultSize?: { width?: string; height?: string } }> = {
  text: {
    className: 'h-4 rounded',
    defaultSize: { width: '100%' },
  },
  card: {
    className: 'rounded-xl',
    defaultSize: { width: '100%', height: '200px' },
  },
  chart: {
    className: 'rounded-lg',
    defaultSize: { width: '100%', height: '300px' },
  },
  'list-item': {
    className: 'h-16 rounded-lg',
    defaultSize: { width: '100%' },
  },
  avatar: {
    className: 'rounded-full',
    defaultSize: { width: '40px', height: '40px' },
  },
  button: {
    className: 'h-10 rounded-lg',
    defaultSize: { width: '100px' },
  },
};

export function Skeleton({
  variant = 'text',
  count = 1,
  className = '',
  width,
  height,
}: SkeletonProps) {
  const style = variantStyles[variant];
  const finalWidth = width || style.defaultSize?.width;
  const finalHeight = height || style.defaultSize?.height;

  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`${baseStyles} ${style.className} ${className}`}
      style={{
        width: finalWidth,
        height: finalHeight,
      }}
    />
  ));

  return count === 1 ? items[0] : <div className="space-y-3">{items}</div>;
}

/**
 * SkeletonCard - Pre-composed skeleton for card layouts
 */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-surface-0/50 border border-surface-2 rounded-xl p-5 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height="16px" />
          <Skeleton width="40%" height="12px" />
        </div>
      </div>
      <Skeleton variant="text" count={3} />
    </div>
  );
}

/**
 * SkeletonTable - Pre-composed skeleton for table/list layouts
 */
export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-border-DEFAULT">
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} width={`${100 / columns}%`} height="14px" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton key={colIndex} width={`${100 / columns}%`} height="20px" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * SkeletonChart - Pre-composed skeleton for chart layouts
 */
export function SkeletonChart({ height = '300px' }: { height?: string }) {
  return (
    <div className="bg-surface-0/50 border border-surface-2 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <Skeleton width="150px" height="20px" />
        <Skeleton width="80px" height="16px" />
      </div>
      <Skeleton variant="chart" height={height} />
    </div>
  );
}

/**
 * SkeletonStats - Pre-composed skeleton for stats/KPI displays
 */
export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-${count} gap-4`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="bg-surface-2/50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton variant="avatar" width="36px" height="36px" />
            <Skeleton width="60px" height="12px" />
          </div>
          <Skeleton width="80px" height="28px" />
        </div>
      ))}
    </div>
  );
}
