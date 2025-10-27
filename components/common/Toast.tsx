import React, { useEffect } from 'react';
import Icon from './Icon';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps extends ToastMessage {
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, message, duration = 3000, onDismiss }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onDismiss(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  const bgColor = {
    success: 'bg-green-500/20 border-green-500/50',
    error: 'bg-red-500/20 border-red-500/50',
    info: 'bg-blue-500/20 border-blue-500/50',
    warning: 'bg-yellow-500/20 border-yellow-500/50',
  }[type];

  const textColor = {
    success: 'text-green-200',
    error: 'text-red-200',
    info: 'text-blue-200',
    warning: 'text-yellow-200',
  }[type];

  const iconColor = {
    success: 'text-green-400',
    error: 'text-red-400',
    info: 'text-blue-400',
    warning: 'text-yellow-400',
  }[type];

  const iconType = {
    success: 'check',
    error: 'alert',
    info: 'info',
    warning: 'alert',
  }[type];

  return (
    <div
      className={`animate-in fade-in slide-in-from-bottom-4 rounded-lg border px-4 py-3 shadow-lg backdrop-blur ${bgColor} flex items-center gap-3`}
      role="status"
      aria-live="polite"
    >
      <Icon type={iconType} className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
      <p className={`text-sm font-medium ${textColor}`}>{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="ml-auto flex-shrink-0 rounded-md p-1 hover:bg-white/10 transition-colors"
        aria-label="Dismiss notification"
      >
        <Icon type="close" className="w-4 h-4 text-white/60" />
      </button>
    </div>
  );
};

export default Toast;
