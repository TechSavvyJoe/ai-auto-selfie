import React from 'react';

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'dark';
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const GRADIENT_CLASSES = {
  primary: 'from-primary-500/10 via-primary-500/5 to-transparent',
  success: 'from-green-500/10 via-green-500/5 to-transparent',
  warning: 'from-yellow-500/10 via-yellow-500/5 to-transparent',
  danger: 'from-red-500/10 via-red-500/5 to-transparent',
  info: 'from-blue-500/10 via-blue-500/5 to-transparent',
  dark: 'from-gray-800/50 via-gray-800/30 to-transparent',
};

const PADDING_CLASSES = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const BORDER_COLORS = {
  primary: 'border-primary-500/20',
  success: 'border-green-500/20',
  warning: 'border-yellow-500/20',
  danger: 'border-red-500/20',
  info: 'border-blue-500/20',
  dark: 'border-gray-700/50',
};

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  className = '',
  hover = false,
  gradient = 'dark',
  padding = 'md',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl border backdrop-blur transition-all duration-300 overflow-hidden group
        ${PADDING_CLASSES[padding]}
        ${BORDER_COLORS[gradient]}
        ${hover ? 'hover:border-opacity-50 hover:shadow-lg hover:shadow-current/10 cursor-pointer hover:scale-105' : ''}
        ${className}
      `}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENT_CLASSES[gradient]} pointer-events-none`} />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  gradient?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  change,
  trend = 'neutral',
  gradient = 'primary',
}) => {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-white/60',
  };

  return (
    <PremiumCard gradient={gradient}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
            {label}
          </div>
          <div className="flex items-end gap-2">
            <div className="text-3xl font-bold text-white">{value}</div>
            {change && <div className={`text-xs font-semibold ${trendColors[trend]}`}>{change}</div>}
          </div>
        </div>
        <div className="text-4xl opacity-20 group-hover:opacity-40 transition-opacity">{icon}</div>
      </div>
    </PremiumCard>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features?: string[];
  onClick?: () => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  features,
  onClick,
}) => {
  return (
    <PremiumCard gradient="primary" hover onClick={onClick}>
      <div className="space-y-3">
        <div className="text-4xl">{icon}</div>
        <div>
          <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
          <p className="text-sm text-white/70">{description}</p>
        </div>
        {features && features.length > 0 && (
          <ul className="space-y-1 pt-2 border-t border-white/10">
            {features.map((feature, idx) => (
              <li key={idx} className="text-xs text-white/60 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>
    </PremiumCard>
  );
};

export default PremiumCard;
