import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  helpText?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  options: SelectOption[];
  placeholder?: string;
}

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
};

export function Select({
  label,
  helpText,
  error,
  size = 'md',
  options,
  placeholder,
  className = '',
  id,
  disabled,
  ...props
}: SelectProps) {
  const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-text-secondary mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`
            block w-full rounded-lg
            bg-surface-2 border
            text-text-primary
            appearance-none
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-0
            disabled:opacity-50 disabled:cursor-not-allowed
            pr-10
            ${error
              ? 'border-danger focus:border-danger focus:ring-danger'
              : 'border-border-strong focus:border-gold-500 focus:ring-gold-500'
            }
            ${sizeStyles[size]}
            ${className}
          `}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : helpText ? `${selectId}-help` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-muted">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {error && (
        <p id={`${selectId}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p id={`${selectId}-help`} className="mt-1.5 text-sm text-text-muted">
          {helpText}
        </p>
      )}
    </div>
  );
}
