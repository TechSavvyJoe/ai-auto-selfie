import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gradient';
  size?: 'sm' | 'normal' | 'large';
  className?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'normal', 
  className = '', 
  icon, 
  isLoading = false,
  fullWidth = false,
  disabled,
  ...props 
}) => {
  const baseStyles = 'relative font-semibold rounded-xl transition-all duration-200 ease-out flex items-center justify-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group';
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    normal: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };

  const variantStyles = {
    primary: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white focus:ring-primary-500 shadow-lg shadow-primary-900/50 hover:shadow-xl hover:shadow-primary-900/60 hover:-translate-y-0.5',
    secondary: 'bg-white/10 hover:bg-white/15 active:bg-white/20 text-white backdrop-blur-sm border border-white/20 hover:border-white/30 focus:ring-white/50',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus:ring-red-500 shadow-lg shadow-red-900/50 hover:shadow-xl hover:shadow-red-900/60 hover:-translate-y-0.5',
    ghost: 'bg-transparent hover:bg-white/5 active:bg-white/10 text-white focus:ring-white/30',
    gradient: 'bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 hover:from-primary-500 hover:via-purple-500 hover:to-pink-500 text-white shadow-xl shadow-purple-900/50 hover:shadow-2xl hover:shadow-purple-900/70 hover:-translate-y-0.5 focus:ring-purple-500',
  };

  const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Shimmer effect for gradient variant */}
      {variant === 'gradient' && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="shimmer absolute inset-0" />
        </div>
      )}
      
      {/* Content */}
      <span className="relative flex items-center gap-2.5">
        {isLoading ? <LoadingSpinner /> : icon}
        <span>{children}</span>
      </span>
    </button>
  );
};

export default Button;
