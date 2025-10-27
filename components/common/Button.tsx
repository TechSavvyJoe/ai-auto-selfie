import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'normal' | 'large';
  className?: string;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'normal', className = '', icon, ...props }) => {
  const baseStyles = 'font-bold rounded-full shadow-lg transform transition duration-200 ease-in-out flex items-center justify-center gap-2.5 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeStyles = {
    normal: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };

  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-500 active:scale-95 text-white focus:ring-blue-500/50 shadow-blue-500/20',
    secondary: 'bg-gray-700 hover:bg-gray-600 active:scale-95 text-white focus:ring-gray-500/50 shadow-gray-900/20',
    danger: 'bg-red-600 hover:bg-red-500 active:scale-95 text-white focus:ring-red-500/50 shadow-red-500/20',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
};

export default Button;
