import React, { useMemo } from 'react';
import Icon from './common/Icon';
import { GalleryImage, AIMode } from '../types';

interface GalleryAnalyticsProps {
  gallery: GalleryImage[];
  onClose: () => void;
}

interface ChartData {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

const GalleryAnalytics: React.FC<GalleryAnalyticsProps> = ({ gallery, onClose }) => {
  const analytics = useMemo(() => {
    const totalImages = gallery.length;
    const favoriteCount = gallery.filter(img => img.isFavorite).length;

    // AI Mode distribution
    const modeOptions: AIMode[] = ['professional', 'cinematic', 'portrait', 'creative', 'natural'];
    const modeDistribution = modeOptions.map(mode => ({
      label: mode.charAt(0).toUpperCase() + mode.slice(1),
      value: gallery.filter(img => img.aiMode === mode).length,
      color: getModeColor(mode),
      mode
    })).filter(m => m.value > 0).sort((a, b) => b.value - a.value);

    // Theme distribution
    const themeMap: Record<string, number> = {};
    const colorMap: Record<string, string> = {};
    gallery.forEach(img => {
      if (img.theme) {
        themeMap[img.theme] = (themeMap[img.theme] || 0) + 1;
        colorMap[img.theme] = getThemeColor(img.theme);
      }
    });

    const themeDistribution = Object.entries(themeMap)
      .map(([theme, count]) => ({
        label: theme.charAt(0).toUpperCase() + theme.slice(1),
        value: count,
        color: colorMap[theme]
      }))
      .sort((a, b) => b.value - a.value);

    // Processing time stats
    const processingTimes = gallery
      .filter(img => img.processingTime)
      .map(img => img.processingTime!)
      .sort((a, b) => a - b);

    const avgTime = processingTimes.length > 0
      ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
      : 0;

    const fastestTime = processingTimes[0] || 0;
    const slowestTime = processingTimes[processingTimes.length - 1] || 0;

    // Enhancement levels
    const enhancementMap: Record<string, number> = {};
    gallery.forEach(img => {
      if (img.enhancementLevel) {
        enhancementMap[img.enhancementLevel] = (enhancementMap[img.enhancementLevel] || 0) + 1;
      }
    });

    // Average quality score
    const ratingDistribution = [
      { rating: 5, count: gallery.filter(img => img.rating === 5).length },
      { rating: 4, count: gallery.filter(img => img.rating === 4).length },
      { rating: 3, count: gallery.filter(img => img.rating === 3).length },
      { rating: 2, count: gallery.filter(img => img.rating === 2).length },
      { rating: 1, count: gallery.filter(img => img.rating === 1).length },
    ].filter(r => r.count > 0);

    // Storage breakdown by AI mode
    const storageByMode: Record<string, number> = {};
    gallery.forEach(img => {
      const mode = img.aiMode || 'unknown';
      const size = img.imageDataUrl.length / (1024 * 1024);
      storageByMode[mode] = (storageByMode[mode] || 0) + size;
    });

    const totalStorage = Object.values(storageByMode).reduce((a, b) => a + b, 0);

    return {
      totalImages,
      favoriteCount,
      favoritePercentage: totalImages > 0 ? Math.round((favoriteCount / totalImages) * 100) : 0,
      modeDistribution,
      themeDistribution,
      avgTime: Math.round(avgTime),
      fastestTime,
      slowestTime,
      enhancementMap,
      ratingDistribution,
      totalStorage,
      storageByMode,
    };
  }, [gallery]);

  const getModePercentage = (count: number): number => {
    return analytics.totalImages > 0 ? Math.round((count / analytics.totalImages) * 100) : 0;
  };

  const SimpleBarChart: React.FC<{ data: ChartData[]; maxValue: number }> = ({ data, maxValue }) => (
    <div className="space-y-3">
      {data.map(item => (
        <div key={item.label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-white">{item.label}</span>
            <span className="text-xs text-white/60">{item.value}</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full transition-all"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const maxMode = Math.max(...analytics.modeDistribution.map(m => m.value), 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 bg-gray-900/95 backdrop-blur">
          <div>
            <h2 className="text-2xl font-bold text-white">Gallery Analytics</h2>
            <p className="text-sm text-white/60 mt-1">Insights into your enhanced photos</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Icon type="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '🖼️', label: 'Total Images', value: analytics.totalImages },
              { icon: '❤️', label: 'Favorites', value: `${analytics.favoriteCount} (${analytics.favoritePercentage}%)` },
              { icon: '⚡', label: 'Avg Processing Time', value: `${analytics.avgTime}ms` },
              { icon: '💾', label: 'Total Storage', value: `${analytics.totalStorage.toFixed(2)}MB` },
            ].map((stat, idx) => (
              <div key={idx} className="bg-gradient-to-br from-gray-800/50 to-gray-900 rounded-lg p-4 border border-gray-800">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* AI Mode Distribution */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Icon type="zap" className="w-5 h-5 text-primary-500" />
              AI Mode Distribution
            </h3>
            <SimpleBarChart
              data={analytics.modeDistribution.map(m => ({
                label: m.label,
                value: m.value,
                color: m.color,
                percentage: getModePercentage(m.value)
              }))}
              maxValue={maxMode}
            />
          </div>

          {/* Theme Distribution */}
          {analytics.themeDistribution.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Icon type="palette" className="w-5 h-5 text-purple-500" />
                Theme Distribution
              </h3>
              <SimpleBarChart
                data={analytics.themeDistribution}
                maxValue={Math.max(...analytics.themeDistribution.map(t => t.value), 1)}
              />
            </div>
          )}

          {/* Processing Time Stats */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Icon type="clock" className="w-5 h-5 text-blue-500" />
              Processing Performance
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-4 border border-green-500/30">
                <div className="text-xs text-green-400 mb-1 font-semibold">Fastest</div>
                <div className="text-2xl font-bold text-white">{(analytics.fastestTime / 1000).toFixed(2)}s</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-4 border border-blue-500/30">
                <div className="text-xs text-blue-400 mb-1 font-semibold">Average</div>
                <div className="text-2xl font-bold text-white">{(analytics.avgTime / 1000).toFixed(2)}s</div>
              </div>
              <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg p-4 border border-red-500/30">
                <div className="text-xs text-red-400 mb-1 font-semibold">Slowest</div>
                <div className="text-2xl font-bold text-white">{(analytics.slowestTime / 1000).toFixed(2)}s</div>
              </div>
            </div>
          </div>

          {/* Enhancement Levels */}
          {Object.keys(analytics.enhancementMap).length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Icon type="sliders" className="w-5 h-5 text-orange-500" />
                Enhancement Levels Used
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(analytics.enhancementMap)
                  .sort(([, a], [, b]) => b - a)
                  .map(([level, count]) => (
                    <div key={level} className="bg-gray-800 rounded-lg p-3 text-center border border-gray-700">
                      <div className="text-xs text-white/60 capitalize mb-1">{level}</div>
                      <div className="text-xl font-bold text-white">{count}</div>
                      <div className="text-xs text-white/50 mt-1">
                        {getModePercentage(count)}%
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Storage by Mode */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Icon type="database" className="w-5 h-5 text-cyan-500" />
              Storage by AI Mode
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.storageByMode)
                .sort(([, a], [, b]) => b - a)
                .map(([mode, size]) => (
                  <div key={mode}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white capitalize">{mode}</span>
                      <span className="text-xs text-white/60">{size.toFixed(2)}MB</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                        style={{
                          width: `${(size / analytics.totalStorage) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function getModeColor(mode: AIMode): string {
  const colors: Record<AIMode, string> = {
    professional: '#3B82F6',
    cinematic: '#EF4444',
    portrait: '#EC4899',
    creative: '#F59E0B',
    natural: '#10B981',
  };
  return colors[mode];
}

function getThemeColor(theme: string): string {
  const colors: Record<string, string> = {
    modern: '#06B6D4',
    luxury: '#9333EA',
    dynamic: '#FF6B6B',
    family: '#4ADE80',
  };
  return colors[theme] || '#8B5CF6';
}

export default GalleryAnalytics;
