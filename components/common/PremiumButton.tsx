/**
 * PremiumButton - Re-export from consolidated Button component
 * This file is kept for backwards compatibility with existing code that imports PremiumButton
 */

import Button, { type ButtonProps } from './Button';

/**
 * PremiumButton - Alias for unified Button component
 * All button variants and features are now in Button.tsx
 */
export const PremiumButton = Button;

/**
 * IconButton - Specialized icon-only button component
 */
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
    sm: 'p-2 w-10 h-10',
    md: 'p-2.5 w-11 h-11',
    lg: 'p-3 w-12 h-12',
  };

  const variants = {
    primary: 'hover:bg-primary-500/20 text-primary-400 hover:text-primary-300 active:bg-primary-500/30',
    secondary: 'hover:bg-slate-700/50 text-white/70 hover:text-white active:bg-slate-700',
    danger: 'hover:bg-red-500/20 text-red-400 hover:text-red-300 active:bg-red-500/30',
    ghost: 'text-white/60 hover:text-white hover:bg-white/10 active:bg-white/20',
  };

  return (
    <button
      type="button"
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        rounded-lg
        ${sizes[size]}
        ${variants[variant]}
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black
        ${className}
      `}
      title={tooltip}
      aria-label={tooltip}
      {...props}
    >
      {icon}
    </button>
  );
};

export default Button;
