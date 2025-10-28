import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  maxLength?: number;
  showCharCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helper,
      variant = 'default',
      size = 'md',
      maxLength,
      showCharCount = false,
      disabled,
      className = '',
      id,
      value,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'w-full font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-vertical';

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm rounded-lg min-h-[80px]',
      md: 'px-4 py-2.5 text-base rounded-lg min-h-[120px]',
      lg: 'px-5 py-3 text-lg rounded-lg min-h-[160px]',
    };

    const variantStyles = {
      default:
        'bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30',
      filled:
        'bg-slate-800 border border-transparent text-white placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 hover:bg-slate-700',
      outlined:
        'bg-transparent border border-slate-700 text-white placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 hover:border-slate-600',
    };

    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const characterCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-slate-200 flex items-center gap-1"
          >
            {label}
            {props.required && <span className="text-red-400">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          className={`
            ${baseStyles}
            ${sizeStyles[size]}
            ${variantStyles[variant]}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}
            ${className}
          `}
          {...props}
        />

        <div className="flex items-center justify-between">
          {(error || helper) && (
            <p
              className={`text-xs font-medium ${
                error
                  ? 'text-red-400'
                  : 'text-slate-400'
              }`}
            >
              {error || helper}
            </p>
          )}

          {maxLength && showCharCount && (
            <p className="text-xs text-slate-400 font-medium">
              {characterCount} / {maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
