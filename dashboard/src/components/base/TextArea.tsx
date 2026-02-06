import React from 'react';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helpText?: string;
  error?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

export function TextArea({
  label,
  helpText,
  error,
  showCharCount = false,
  maxLength,
  className = '',
  id,
  disabled,
  rows = 4,
  value,
  ...props
}: TextAreaProps) {
  const textareaId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;
  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-text-secondary mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          id={textareaId}
          rows={rows}
          maxLength={maxLength}
          value={value}
          className={`
            block w-full rounded-lg
            bg-surface-2 border
            text-text-primary placeholder-text-muted
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-0
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-y
            px-4 py-3 text-sm
            ${error
              ? 'border-danger focus:border-danger focus:ring-danger'
              : 'border-border-strong focus:border-gold-500 focus:ring-gold-500'
            }
            ${className}
          `}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : helpText
              ? `${textareaId}-help`
              : undefined
          }
          {...props}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <div>
          {error && (
            <p id={`${textareaId}-error`} className="text-sm text-danger">
              {error}
            </p>
          )}
          {helpText && !error && (
            <p id={`${textareaId}-help`} className="text-sm text-text-muted">
              {helpText}
            </p>
          )}
        </div>
        {showCharCount && maxLength && (
          <p
            className={`text-sm ${
              charCount >= maxLength ? 'text-danger' : 'text-text-muted'
            }`}
          >
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
