import React from 'react';
import Button from './common/Button';
import Icon from './common/Icon';
import { GalleryImage, AIMode } from '../types';

interface DesktopStartViewProps {
  onStart: () => void;
  onViewGallery: () => void;
  galleryStats?: {
    totalImages: number;
    favoriteCount: number;
    mostUsedMode: AIMode | string;
    totalStorageEstimate: string;
  };
}

const DesktopStartView: React.FC<DesktopStartViewProps> = ({
  onStart,
  onViewGallery,
  galleryStats
}) => {
  const recentStats = [
    { icon: '🖼️', label: 'Total Images', value: galleryStats?.totalImages || 0 },
    { icon: '❤️', label: 'Favorites', value: galleryStats?.favoriteCount || 0 },
    { icon: '⚡', label: 'Most Used', value: galleryStats?.mostUsedMode || 'None' },
    { icon: '💾', label: 'Storage', value: `${galleryStats?.totalStorageEstimate || 0}MB` },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-8">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full opacity-20 blur-3xl bg-gradient-aurora" />
        <div className="absolute -bottom-48 -left-24 h-[500px] w-[500px] rounded-full opacity-10 blur-3xl bg-gradient-ocean" />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 rounded-full px-6 py-3 bg-white/5 border border-white/10 backdrop-blur">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-primary-500"></span>
            </span>
            <span className="gradient-text font-bold text-sm tracking-wide">AI-Powered Photo Enhancement</span>
          </div>

          <h1 className="text-6xl font-black tracking-tight text-white leading-tight">
            Transform Your
            <span className="gradient-text block">Photos Instantly</span>
          </h1>

          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Professional-grade AI enhancement that makes every photo extraordinary. Manage all your enhanced photos in one place.
          </p>
        </div>

        {/* Stats Grid */}
        {galleryStats && galleryStats.totalImages > 0 && (
          <div className="grid grid-cols-4 gap-4">
            {recentStats.map((stat, idx) => (
              <div
                key={idx}
                className="glass rounded-2xl p-6 hover:bg-white/15 transition-all hover:-translate-y-1"
              >
                <div className="text-3xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={onStart}
            variant="gradient"
            size="large"
            className="min-w-[280px] flex items-center justify-center gap-3"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          >
            Start Creating
          </Button>

          <Button
            onClick={onViewGallery}
            variant="secondary"
            size="large"
            className="min-w-[280px] flex items-center justify-center gap-3"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
          >
            Manage Gallery
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
          {[
            {
              icon: '✨',
              title: 'Professional Quality',
              description: 'State-of-the-art AI enhancement with multiple styles',
              items: ['Cinematic', 'Portrait', 'Professional', 'Creative', 'Natural']
            },
            {
              icon: '🎨',
              title: 'Full Control',
              description: 'Fine-tune every aspect of your images',
              items: ['Exposure', 'Contrast', 'Saturation', 'Temperature', 'Sharpness']
            },
            {
              icon: '⚡',
              title: 'Powerful Tools',
              description: 'Everything you need for gallery management',
              items: ['Batch Processing', 'Download', 'Organize', 'Search', 'Filter']
            }
          ].map((feature, idx) => (
            <div key={idx} className="glass rounded-2xl p-6 hover:bg-white/15 transition-all">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-white/60 mb-4">{feature.description}</p>
              <div className="space-y-2">
                {feature.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="text-center pt-8 border-t border-white/10">
          <p className="text-sm text-white/50">
            Powered by Google Gemini • Save to Local Storage • No Data Collection
          </p>
        </div>
      </div>
    </div>
  );
};

export default DesktopStartView;
