import React from 'react';

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const VARIANT_STYLES = {
  primary:
    'from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg shadow-primary-500/20',
  secondary:
    'from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg shadow-gray-800/20',
  success:
    'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/20',
  danger:
    'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/20',
  warning:
    'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg shadow-yellow-500/20',
  ghost: 'text-white hover:bg-white/10 border border-white/20 hover:border-white/30',
};

const SIZE_STYLES = {
  xs: 'px-3 py-1.5 text-xs',
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3 text-base',
  xl: 'px-10 py-4 text-lg',
};

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  fullWidth,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={`
        group relative
        ${SIZE_STYLES[size]}
        ${fullWidth ? 'w-full' : ''}
        font-semibold
        rounded-xl
        transition-all duration-300
        overflow-hidden
        disabled:opacity-50 disabled:cursor-not-allowed
        inline-flex items-center justify-center gap-2
        ${className}
      `}
      {...props}
    >
      {/* Background */}
      {variant !== 'ghost' && (
        <div
          className={`
            absolute inset-0
            bg-gradient-to-r
            ${VARIANT_STYLES[variant]}
            group-hover:shadow-xl group-hover:shadow-current/30
            transition-all duration-300
          `}
        />
      )}

      {/* Ghost variant border */}
      {variant === 'ghost' && (
        <div className="absolute inset-0 border border-white/20 group-hover:border-white/30 rounded-xl transition-colors" />
      )}

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center gap-2 whitespace-nowrap">
        {loading ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : icon ? (
          icon
        ) : null}
        <span>{children}</span>
      </div>

      {/* Shimmer effect on hover */}
      <div
        className="
          absolute inset-0
          bg-gradient-to-r from-transparent via-white/20 to-transparent
          transform -skew-x-12
          opacity-0 group-hover:opacity-100
          group-hover:animate-shimmer
          transition-opacity duration-300
        "
      />

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(100%) skewX(-20deg); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </button>
  );
};

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  tooltip?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 'md',
  variant = 'secondary',
  tooltip,
  disabled,
  className = '',
  ...props
}) => {
  const sizes = {
    sm: 'p-2',
    md: 'p-2.5',
    lg: 'p-3',
  };

  const variants = {
    primary: 'hover:bg-primary-500/20 text-primary-400 hover:text-primary-300',
    secondary: 'hover:bg-gray-700/50 text-white/70 hover:text-white',
    danger: 'hover:bg-red-500/20 text-red-400 hover:text-red-300',
    ghost: 'text-white/60 hover:text-white hover:bg-white/10',
  };

  return (
    <button
      disabled={disabled}
      className={`
        rounded-lg
        ${sizes[size]}
        ${variants[variant]}
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title={tooltip}
      {...props}
    >
      {icon}
    </button>
  );
};

export default PremiumButton;
