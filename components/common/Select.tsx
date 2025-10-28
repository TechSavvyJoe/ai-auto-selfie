import React, { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  label?: string;
  error?: string;
  helper?: string;
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helper,
      options,
      value,
      onChange,
      variant = 'default',
      size = 'md',
      icon,
      disabled,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'w-full font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed appearance-none';

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm rounded-lg',
      md: 'px-4 py-2.5 text-base rounded-lg',
      lg: 'px-5 py-3 text-lg rounded-lg',
    };

    const variantStyles = {
      default:
        'bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30',
      filled:
        'bg-slate-800 border border-transparent text-white placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 hover:bg-slate-700',
      outlined:
        'bg-transparent border border-slate-700 text-white placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 hover:border-slate-600',
    };

    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        const selectedValue = e.currentTarget.value;
        // Try to convert to number if it's numeric
        const numValue = !isNaN(Number(selectedValue)) ? Number(selectedValue) : selectedValue;
        onChange(numValue);
      }
    };

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-semibold text-slate-200 flex items-center gap-1"
          >
            {label}
            {props.required && <span className="text-red-400">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 flex items-center justify-center text-slate-400 pointer-events-none">
              {icon}
            </div>
          )}

          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            value={value ?? ''}
            onChange={handleChange}
            className={`
              ${baseStyles}
              ${sizeStyles[size]}
              ${variantStyles[variant]}
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}
              pr-10
              ${className}
            `}
            {...props}
          >
            <option value="" disabled>
              Select an option...
            </option>
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

          {/* Chevron icon */}
          <div className="absolute right-3 flex items-center justify-center text-slate-400 pointer-events-none">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>

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
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
