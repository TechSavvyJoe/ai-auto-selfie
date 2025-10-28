import React, { useState } from 'react';
import { PremiumButton } from './common/PremiumButton';
import { PremiumCard, FeatureCard, StatCard } from './common/PremiumCard';
import Icon from './common/Icon';
import { AIMode } from '../types';

interface PremiumDesktopStartViewProps {
  onStart: () => void;
  onViewGallery: () => void;
  galleryStats?: {
    totalImages: number;
    favoriteCount: number;
    mostUsedMode: AIMode | string;
    totalStorageEstimate: string;
  };
}

const PremiumDesktopStartView: React.FC<PremiumDesktopStartViewProps> = ({
  onStart,
  onViewGallery,
  galleryStats,
}) => {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const hasGallery = galleryStats && galleryStats.totalImages > 0;

  return (
    <div className="w-full h-full overflow-auto bg-gradient-to-br from-neutral-950 via-neutral-900 to-black">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl bg-gradient-to-br from-primary-500 via-purple-500 to-transparent animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl bg-gradient-to-br from-blue-500 via-cyan-500 to-transparent animate-float" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5 blur-3xl bg-white" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-8 py-12 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-primary-500/20 rounded-full backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary-500" />
              </span>
              <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
                AI-Powered Enhancement
              </span>
            </div>
          </div>

          {/* Main Title */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-black tracking-tight">
              <span className="block text-white">Transform Your</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400">
                Photos Instantly
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Professional-grade AI enhancement with multiple creative modes. Transform, enhance, and share your photos
              with stunning results.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <PremiumButton
              variant="primary"
              size="lg"
              icon={<Icon type="camera" className="w-5 h-5" />}
              onClick={onStart}
              className="min-w-[280px]"
            >
              Start Creating
            </PremiumButton>
            <PremiumButton
              variant="secondary"
              size="lg"
              icon={<Icon type="images" className="w-5 h-5" />}
              onClick={onViewGallery}
              className="min-w-[280px]"
            >
              View Gallery
            </PremiumButton>
          </div>
        </div>

        {/* Gallery Stats */}
        {hasGallery && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            <StatCard
              icon="🖼️"
              label="Total Images"
              value={galleryStats.totalImages}
              gradient="primary"
            />
            <StatCard
              icon="❤️"
              label="Favorites"
              value={galleryStats.favoriteCount}
              gradient="danger"
            />
            <StatCard
              icon="⚡"
              label="Most Used"
              value={String(galleryStats.mostUsedMode).charAt(0).toUpperCase() + String(galleryStats.mostUsedMode).slice(1)}
              gradient="warning"
            />
            <StatCard
              icon="💾"
              label="Storage"
              value={`${galleryStats.totalStorageEstimate}MB`}
              gradient="success"
            />
          </div>
        )}

        {/* Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
            <p className="text-lg text-white/60">Everything you need for professional photo enhancement</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                id: 'ai-modes',
                icon: '✨',
                title: 'AI Enhancement Modes',
                description: 'Multiple creative styles for every occasion',
                features: ['Professional', 'Cinematic', 'Portrait', 'Creative', 'Natural'],
              },
              {
                id: 'gallery',
                icon: '📚',
                title: 'Smart Gallery',
                description: 'Organize and manage all your enhanced photos',
                features: ['AI-Powered Search', 'Smart Filtering', 'Bulk Operations', 'Analytics'],
              },
              {
                id: 'sharing',
                icon: '🌍',
                title: 'Easy Sharing',
                description: 'Share directly to your favorite platforms',
                features: ['Social Media', 'Cloud Upload', 'Custom Captions', 'Link Sharing'],
              },
              {
                id: 'controls',
                icon: '🎨',
                title: 'Fine Controls',
                description: 'Adjust every aspect of your images',
                features: ['Exposure', 'Contrast', 'Saturation', 'Sharpness'],
              },
              {
                id: 'batch',
                icon: '⚡',
                title: 'Batch Processing',
                description: 'Enhance multiple photos at once',
                features: ['Smart Selection', 'Consistent Style', 'Time Saver', 'Batch Download'],
              },
              {
                id: 'local',
                icon: '🔒',
                title: 'Privacy First',
                description: 'All processing stays on your device',
                features: ['No Cloud Upload', 'Local Storage', 'No Tracking', 'Your Data'],
              },
            ].map((feature) => (
              <FeatureCard
                key={feature.id}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                features={feature.features}
                onClick={() => setHoveredFeature(feature.id === hoveredFeature ? null : feature.id)}
              />
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-lg text-white/60">Simple steps to transform your photos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { number: '1', title: 'Capture', description: 'Take a photo or upload from gallery', icon: '📸' },
              { number: '2', title: 'Choose Style', description: 'Select from 5+ AI enhancement modes', icon: '🎨' },
              { number: '3', title: 'Fine-tune', description: 'Adjust colors, exposure, and more', icon: '⚙️' },
              { number: '4', title: 'Share', description: 'Download or share directly online', icon: '🚀' },
            ].map((step, idx) => (
              <div key={idx} className="group relative">
                <PremiumCard gradient="primary" className="h-full">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-2xl font-bold text-white group-hover:scale-110 transition-transform">
                        {step.number}
                      </div>
                      {idx < 3 && (
                        <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 w-6 text-primary-500/50">
                          →
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{step.title}</h3>
                      <p className="text-sm text-white/60 mt-2">{step.description}</p>
                    </div>
                    <div className="text-4xl">{step.icon}</div>
                  </div>
                </PremiumCard>
              </div>
            ))}
          </div>
        </div>

        {/* AI Modes Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Enhancement Modes</h2>
            <p className="text-lg text-white/60">Choose the perfect style for your photo</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { mode: 'Professional', desc: 'Clean, sharp, and polished', color: 'from-blue-500 to-blue-600' },
              { mode: 'Cinematic', desc: 'Movie-like with color grading', color: 'from-amber-500 to-red-500' },
              { mode: 'Portrait', desc: 'Flattering skin tones', color: 'from-pink-500 to-rose-500' },
              { mode: 'Creative', desc: 'Bold and artistic effects', color: 'from-purple-500 to-pink-500' },
              { mode: 'Natural', desc: 'Subtle and realistic', color: 'from-green-500 to-emerald-500' },
            ].map((item, idx) => (
              <PremiumCard key={idx} gradient="primary" hover>
                <div className="space-y-3">
                  <div className={`h-12 rounded-lg bg-gradient-to-br ${item.color} opacity-30`} />
                  <div>
                    <h4 className="font-bold text-white">{item.mode}</h4>
                    <p className="text-xs text-white/60 mt-1">{item.desc}</p>
                  </div>
                </div>
              </PremiumCard>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6 py-12 bg-gradient-to-r from-primary-500/10 via-purple-500/10 to-pink-500/10 border border-primary-500/20 rounded-2xl">
          <h3 className="text-3xl font-bold text-white">Ready to Transform Your Photos?</h3>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            Start creating stunning enhanced photos with AI-powered tools. No subscription required.
          </p>
          <PremiumButton
            variant="primary"
            size="lg"
            onClick={onStart}
            icon={<Icon type="camera" className="w-5 h-5" />}
            className="mx-auto"
          >
            Get Started Now
          </PremiumButton>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-white/10">
          <p className="text-sm text-white/50">
            🔒 Privacy First • 🚀 Fast Processing • 💾 Local Storage • ✨ AI-Powered
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PremiumDesktopStartView;
