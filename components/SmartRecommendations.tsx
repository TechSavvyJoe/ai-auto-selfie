import React, { useState, useEffect, useMemo } from 'react';
import Icon from './common/Icon';
import { GalleryImage } from '../types';
import { getAIImageAnalysisService } from '../services/aiImageAnalysisService';

interface SmartRecommendationsProps {
  gallery: GalleryImage[];
  onImageSelect: (image: GalleryImage) => void;
}

interface Recommendation {
  type: 'quality' | 'favorite' | 'similar' | 'trending' | 'improvement';
  title: string;
  description: string;
  images: GalleryImage[];
  icon: string;
  color: string;
}

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({ gallery, onImageSelect }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const recommendations_list = useMemo(() => {
    if (gallery.length === 0) return [];

    const analysisService = getAIImageAnalysisService();
    const recs: Recommendation[] = [];

    // 1. Highest Quality Images
    const qualityImages = gallery
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);

    if (qualityImages.length > 0) {
      recs.push({
        type: 'quality',
        title: 'Your Best Work',
        description: 'Highest rated images in your gallery',
        images: qualityImages,
        icon: '⭐',
        color: 'from-yellow-500 to-orange-500'
      });
    }

    // 2. Favorite Images
    const favorites = gallery.filter(img => img.isFavorite).slice(0, 3);
    if (favorites.length > 0) {
      recs.push({
        type: 'favorite',
        title: 'Your Favorites',
        description: 'Images you\'ve marked as favorites',
        images: favorites,
        icon: '❤️',
        color: 'from-red-500 to-pink-500'
      });
    }

    // 3. Trending AI Modes
    const modeUsage: Record<string, number> = {};
    gallery.forEach(img => {
      if (img.aiMode) {
        modeUsage[img.aiMode] = (modeUsage[img.aiMode] || 0) + 1;
      }
    });

    const topMode = Object.entries(modeUsage).sort(([, a], [, b]) => b - a)[0]?.[0];
    if (topMode) {
      const trendingImages = gallery
        .filter(img => img.aiMode === topMode)
        .slice(0, 3);

      recs.push({
        type: 'trending',
        title: `${topMode.charAt(0).toUpperCase() + topMode.slice(1)} Mode Popular`,
        description: `You've created many images with ${topMode} mode`,
        images: trendingImages,
        icon: '🔥',
        color: 'from-red-500 to-purple-500'
      });
    }

    // 4. Recent Additions
    const recent = gallery
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 3);

    if (recent.length > 0) {
      recs.push({
        type: 'improvement',
        title: 'Latest Creations',
        description: 'Your most recently enhanced images',
        images: recent,
        icon: '✨',
        color: 'from-blue-500 to-cyan-500'
      });
    }

    // 5. Similar to Favorites
    if (favorites.length > 0 && gallery.length > 5) {
      const firstFav = favorites[0];
      const similar = analysisService.findSimilarImages(firstFav, gallery, 0.6).slice(0, 3);

      if (similar.length > 0) {
        recs.push({
          type: 'similar',
          title: 'Similar to Your Favorites',
          description: 'Images with similar style to your favorites',
          images: similar,
          icon: '🎯',
          color: 'from-green-500 to-teal-500'
        });
      }
    }

    return recs;
  }, [gallery]);

  useEffect(() => {
    setLoading(false);
    setRecommendations(recommendations_list);
  }, [recommendations_list]);

  if (loading || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Smart Recommendations</h3>
        <p className="text-sm text-white/60">AI-powered suggestions based on your gallery</p>
      </div>

      {recommendations.map((rec, idx) => (
        <div key={idx} className="space-y-3">
          {/* Header */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">{rec.icon}</span>
            <div>
              <h4 className="font-semibold text-white">{rec.title}</h4>
              <p className="text-xs text-white/60">{rec.description}</p>
            </div>
          </div>

          {/* Images */}
          <div className="grid grid-cols-3 gap-2">
            {rec.images.map(img => (
              <button
                key={img.id}
                onClick={() => onImageSelect(img)}
                className={`relative aspect-square rounded-lg overflow-hidden group cursor-pointer transition-all hover:ring-2 hover:ring-offset-2 hover:ring-offset-neutral-950 bg-gradient-to-br ${rec.color}`}
              >
                <img
                  src={img.thumbnail || img.imageDataUrl}
                  alt="Recommendation"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Icon type="eye" className="w-6 h-6 text-white" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SmartRecommendations;
