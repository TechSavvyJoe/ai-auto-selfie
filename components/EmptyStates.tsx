import React from 'react';
import { PremiumButton } from './common/PremiumButton';
import Icon from './common/Icon';

/**
 * EmptyStates - Provides beautiful empty state UI for various scenarios
 * Improves UX when data is not available
 * Matches Figma, Notion, and Apple design standards
 */

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondary?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondary,
}) => (
  <div className="flex h-full w-full flex-col items-center justify-center p-6">
    <div className="w-full max-w-md space-y-8 text-center">
      {/* Icon */}
      {icon && (
        <div className="flex justify-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-500/20 to-purple-500/20 ring-2 ring-primary-500/30">
            <div className="text-5xl">{icon}</div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {description && (
          <p className="text-base text-white/60 leading-relaxed">{description}</p>
        )}
      </div>

      {/* Actions */}
      {(action || secondary) && (
        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center">
          {action && (
            <PremiumButton
              variant="primary"
              size="md"
              onClick={action.onClick}
              className="sm:min-w-[160px]"
            >
              {action.label}
            </PremiumButton>
          )}
          {secondary && (
            <PremiumButton
              variant="secondary"
              size="md"
              onClick={secondary.onClick}
              className="sm:min-w-[160px]"
            >
              {secondary.label}
            </PremiumButton>
          )}
        </div>
      )}
    </div>
  </div>
);

export const EmptyGallery: React.FC<{ onCreateNew: () => void }> = ({ onCreateNew }) => (
  <EmptyState
    icon="📸"
    title="Your Gallery is Empty"
    description="Start creating beautiful enhanced photos. Every image you create will appear here."
    action={{
      label: 'Create Your First Photo',
      onClick: onCreateNew,
    }}
  />
);

export const EmptySearch: React.FC<{ onClear: () => void }> = ({ onClear }) => (
  <EmptyState
    icon="🔍"
    title="No Results Found"
    description="Try adjusting your search filters or keywords."
    action={{
      label: 'Clear Filters',
      onClick: onClear,
    }}
  />
);

export const EmptyFavorites: React.FC<{ onViewAll: () => void }> = ({ onViewAll }) => (
  <EmptyState
    icon="❤️"
    title="No Favorites Yet"
    description="Mark your favorite enhanced photos to easily find them later."
    action={{
      label: 'View All Photos',
      onClick: onViewAll,
    }}
  />
);

export const NoPermission: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <EmptyState
    icon="🔒"
    title="Permission Required"
    description="This feature requires camera or gallery access. Please enable it in your browser settings."
    action={{
      label: 'Retry',
      onClick: onRetry,
    }}
  />
);

export const NetworkError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <EmptyState
    icon="📡"
    title="Connection Error"
    description="Unable to connect to the server. Please check your internet connection and try again."
    action={{
      label: 'Try Again',
      onClick: onRetry,
    }}
  />
);
