import React from 'react';

/**
 * SkeletonLoaders - Provides skeleton/placeholder UI while content loads
 * Improves perceived performance and user experience
 * Matches Figma, Google, and Apple design standards
 */

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => (
  <>
    {Array.from({ length: count }).map((_, idx) => (
      <div key={idx} className="animate-pulse">
        <div className="h-40 w-full rounded-xl bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%]" 
          style={{
            animation: 'shimmer 2s infinite',
            backgroundPosition: '200% 0',
          }}
        />
        <div className="mt-4 space-y-3">
          <div className="h-4 w-3/4 rounded bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800" style={{ animation: 'shimmer 2s infinite' }} />
          <div className="h-3 w-1/2 rounded bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800" style={{ animation: 'shimmer 2s infinite' }} />
        </div>
      </div>
    ))}
    <style>{`
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </>
);

export const ImageSkeleton: React.FC = () => (
  <div className="animate-pulse w-full h-full">
    <div className="h-full w-full rounded-lg bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%]" 
      style={{
        animation: 'shimmer 2s infinite',
        backgroundPosition: '200% 0',
      }}
    />
    <style>{`
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </div>
);

export const TextSkeleton: React.FC<{ lines?: number; fullWidth?: boolean }> = ({ lines = 3, fullWidth = false }) => (
  <div className="animate-pulse space-y-2">
    {Array.from({ length: lines }).map((_, idx) => {
      const isLastLine = idx === lines - 1;
      const width = fullWidth ? 'w-full' : isLastLine ? 'w-2/3' : 'w-full';
      return (
        <div
          key={idx}
          className={`${width} h-4 rounded bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800`}
          style={{
            animation: 'shimmer 2s infinite',
            backgroundPosition: '200% 0',
          }}
        />
      );
    })}
    <style>{`
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </div>
);

export const GallerySkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, idx) => (
      <div key={idx} className="animate-pulse space-y-3">
        <div className="aspect-square w-full rounded-xl bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800" 
          style={{
            animation: 'shimmer 2s infinite',
            backgroundPosition: '200% 0',
          }}
        />
        <div className="space-y-2">
          <div className="h-3 w-3/4 rounded bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800" style={{ animation: 'shimmer 2s infinite' }} />
          <div className="h-3 w-1/2 rounded bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800" style={{ animation: 'shimmer 2s infinite' }} />
        </div>
      </div>
    ))}
    <style>{`
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </div>
);

export const FormSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-6">
    {Array.from({ length: 4 }).map((_, idx) => (
      <div key={idx} className="space-y-2">
        <div className="h-4 w-1/4 rounded bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800" style={{ animation: 'shimmer 2s infinite' }} />
        <div className="h-10 w-full rounded-lg bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800" style={{ animation: 'shimmer 2s infinite' }} />
      </div>
    ))}
    <style>{`
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </div>
);
