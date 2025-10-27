import React from 'react';

interface SpinnerProps {
    className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
        <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
    </div>
  );
};

export default Spinner;
