import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={clsx('card', className)}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title?: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
}

export function CardHeader({ title, subtitle, action, children }: CardHeaderProps) {
  // Support both explicit title prop and children pattern
  if (children) {
    return (
      <div className="card-header flex items-center justify-between">
        {children}
      </div>
    );
  }

  return (
    <div className="card-header flex items-center justify-between">
      <div>
        {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
  return (
    <div className={clsx('card-body', className)}>
      {children}
    </div>
  );
}
