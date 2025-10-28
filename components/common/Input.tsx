import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helper,
      icon,
      variant = 'default',
      size = 'md',
      disabled,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'w-full font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

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

    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

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

        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 flex items-center justify-center text-slate-400 pointer-events-none">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`
              ${baseStyles}
              ${sizeStyles[size]}
              ${variantStyles[variant]}
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}
              ${className}
            `}
            {...props}
          />
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

Input.displayName = 'Input';

export default Input;
