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
          className="block text-sm font-medium text-slate-300 mb-1.5"
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
            bg-slate-800 border
            text-white placeholder-slate-500
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-y
            px-4 py-3 text-sm
            ${error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-600 focus:border-accent-500 focus:ring-accent-500'
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
            <p id={`${textareaId}-error`} className="text-sm text-red-400">
              {error}
            </p>
          )}
          {helpText && !error && (
            <p id={`${textareaId}-help`} className="text-sm text-slate-500">
              {helpText}
            </p>
          )}
        </div>
        {showCharCount && maxLength && (
          <p
            className={`text-sm ${
              charCount >= maxLength ? 'text-red-400' : 'text-slate-500'
            }`}
          >
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
