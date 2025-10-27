import React, { useState } from 'react';

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
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { x, y, id: Date.now() };
    setRipples([...ripples, newRipple]);
    
    setTimeout(() => {
      setRipples(ripples => ripples.filter(r => r.id !== newRipple.id));
    }, 600);
    
    if (props.onClick) {
      props.onClick(e);
    }
  };

  const baseStyles = 'relative font-semibold rounded-2xl transition-all duration-300 ease-out flex items-center justify-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group active:scale-95';
  
  const sizeStyles = {
    sm: 'px-4 py-2.5 text-sm min-h-[36px]',
    normal: 'px-6 py-3.5 text-base min-h-[44px]',
    large: 'px-8 py-4.5 text-lg min-h-[52px]'
  };

  const variantStyles = {
    primary: 'bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 active:from-primary-700 active:to-primary-800 text-white focus:ring-primary-500/50 shadow-lg shadow-primary-900/30 hover:shadow-xl hover:shadow-primary-900/40 hover:-translate-y-0.5 border border-primary-500/20',
    secondary: 'glass text-white hover:bg-white/15 active:bg-white/20 focus:ring-white/30 shadow-md hover:shadow-lg backdrop-blur-xl',
    danger: 'bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:from-red-700 active:to-red-800 text-white focus:ring-red-500/50 shadow-lg shadow-red-900/30 hover:shadow-xl hover:shadow-red-900/40 hover:-translate-y-0.5 border border-red-500/20',
    ghost: 'bg-transparent hover:bg-white/10 active:bg-white/15 text-white focus:ring-white/20 hover:shadow-md',
    gradient: 'bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 hover:from-primary-500 hover:via-purple-500 hover:to-pink-500 text-white shadow-xl shadow-purple-900/40 hover:shadow-2xl hover:shadow-purple-900/60 hover:-translate-y-0.5 focus:ring-purple-500/50 border border-white/10 animate-gradient bg-[length:200%_200%]',
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
      onClick={handleClick}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 10,
            height: 10,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden rounded-2xl">
        <div className="shimmer absolute inset-0" />
      </div>
      
      {/* Inner glow for premium variants */}
      {(variant === 'primary' || variant === 'gradient' || variant === 'danger') && (
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
             style={{ boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.1)' }} />
      )}
      
      {/* Content */}
      <span className="relative flex items-center gap-2.5 z-10">
        {isLoading ? <LoadingSpinner /> : icon}
        <span className="font-medium tracking-wide">{children}</span>
      </span>
    </button>
  );
};

export default Button;
