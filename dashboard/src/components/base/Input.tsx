import React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helpText?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
};

export function Input({
  label,
  helpText,
  error,
  size = 'md',
  icon,
  className = '',
  id,
  disabled,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-secondary mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            block w-full rounded-lg
            bg-surface-2 border
            text-text-primary placeholder-text-muted
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-0
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error
              ? 'border-danger focus:border-danger focus:ring-danger'
              : 'border-border-strong focus:border-gold-500 focus:ring-gold-500'
            }
            ${icon ? 'pl-10' : ''}
            ${sizeStyles[size]}
            ${className}
          `}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p id={`${inputId}-help`} className="mt-1.5 text-sm text-text-muted">
          {helpText}
        </p>
      )}
    </div>
  );
}
