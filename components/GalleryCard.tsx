import React, { useState, useEffect } from 'react';
import Icon from './common/Icon';
import { GalleryImage } from '../types';
import { getAIImageAnalysisService, ImageAnalysis } from '../services/aiImageAnalysisService';

interface GalleryCardProps {
  image: GalleryImage;
  isSelected: boolean;
  onSelect: () => void;
  onToggleSelect: (e: React.MouseEvent) => void;
  onPreview: () => void;
  onDownload: () => void;
  onDelete: () => void;
  variant?: 'grid' | 'list' | 'compact';
}

const GalleryCard: React.FC<GalleryCardProps> = ({
  image,
  isSelected,
  onSelect,
  onToggleSelect,
  onPreview,
  onDownload,
  onDelete,
  variant = 'grid'
}) => {
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const analyzeImage = async () => {
      setLoading(true);
      try {
        const service = getAIImageAnalysisService();
        const result = await service.analyzeImage(image);
        setAnalysis(result);
      } catch (error) {
        console.error('Error analyzing image:', error);
      } finally {
        setLoading(false);
      }
    };

    analyzeImage();
  }, [image.id]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getQualityBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20';
    if (score >= 60) return 'bg-blue-500/20';
    if (score >= 40) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  if (variant === 'list') {
    return (
      <div
        className={`flex items-center gap-4 p-4 bg-gray-900/50 hover:bg-gray-900 border border-gray-800 rounded-lg transition-all ${
          isSelected ? 'ring-2 ring-primary-500' : ''
        }`}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-5 h-5 rounded accent-primary-500 cursor-pointer"
        />

        <img
          src={image.thumbnail || image.imageDataUrl}
          alt="Gallery"
          className="w-16 h-16 object-cover rounded-lg"
        />

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="capitalize text-sm font-semibold text-white bg-gray-800 px-2 py-1 rounded">
              {image.aiMode || 'unknown'}
            </span>
            {analysis && (
              <span className={`text-xs font-bold ${getQualityColor(analysis.qualityScore)}`}>
                Quality: {analysis.qualityScore}%
              </span>
            )}
          </div>
          <p className="text-xs text-white/60">{formatDate(image.createdAt)}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onPreview}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Preview"
          >
            <Icon type="eye" className="w-4 h-4" />
          </button>
          <button
            onClick={onDownload}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Download"
          >
            <Icon type="download" className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-900/50 rounded-lg transition-colors text-red-400"
            title="Delete"
          >
            <Icon type="trash" className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        onClick={onSelect}
        className={`relative bg-gray-900 rounded-lg overflow-hidden cursor-pointer transition-all aspect-square group border-2 ${
          isSelected ? 'border-primary-500 ring-2 ring-primary-500/50' : 'border-transparent hover:border-primary-500/50'
        }`}
      >
        <img
          src={image.thumbnail || image.imageDataUrl}
          alt="Gallery"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Checkbox */}
        <div className="absolute top-2 left-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 rounded accent-primary-500 cursor-pointer"
          />
        </div>

        {/* Favorite badge */}
        {image.isFavorite && (
          <div className="absolute top-2 right-2 bg-red-500/90 rounded-full p-1.5 backdrop-blur">
            <Icon type="heart" className="w-3 h-3 text-white fill-white" />
          </div>
        )}

        {/* Quality score */}
        {analysis && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${getQualityColor(analysis.qualityScore)} ${getQualityBg(analysis.qualityScore)} backdrop-blur`}>
            {analysis.qualityScore}%
          </div>
        )}

        {/* Info on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="text-xs font-semibold capitalize mb-1">{image.aiMode}</div>
          <div className="text-xs text-white/70">{formatDate(image.createdAt)}</div>
          {image.processingTime && (
            <div className="text-xs text-white/70">{formatTime(image.processingTime)}</div>
          )}
        </div>
      </div>
    );
  }

  // Default grid variant
  return (
    <div
      onClick={onSelect}
      className={`relative bg-gray-900 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-2xl group border-2 ${
        isSelected ? 'border-primary-500 ring-2 ring-primary-500/50 shadow-lg shadow-primary-500/20' : 'border-transparent hover:border-primary-500/50'
      }`}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-800">
        <img
          src={image.thumbnail || image.imageDataUrl}
          alt="Gallery"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />

        {/* Loading skeleton */}
        {loading && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse" />
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          onClick={(e) => e.stopPropagation()}
          className="w-5 h-5 rounded accent-primary-500 cursor-pointer shadow-lg"
        />
      </div>

      {/* Badges */}
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        {/* Quality Badge */}
        {analysis && (
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md ${getQualityColor(analysis.qualityScore)} ${getQualityBg(analysis.qualityScore)}`}>
            {analysis.qualityScore}%
          </div>
        )}

        {/* Favorite Badge */}
        {image.isFavorite && (
          <div className="bg-red-500/80 rounded-full p-2 backdrop-blur-md">
            <Icon type="heart" className="w-4 h-4 text-white fill-white" />
          </div>
        )}
      </div>

      {/* AI Mode Tag */}
      <div className="absolute bottom-16 left-3 z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full text-xs font-bold text-white shadow-lg">
          <Icon type="zap" className="w-3 h-3" />
          {image.aiMode || 'unknown'}
        </span>
      </div>

      {/* Metadata Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon type="calendar" className="w-3 h-3 text-white/60" />
            <span className="text-xs text-white/80">{formatDate(image.createdAt)}</span>
          </div>
          {image.processingTime && (
            <span className="text-xs text-white/60">{formatTime(image.processingTime)}</span>
          )}
        </div>

        {/* Theme info */}
        {image.theme && (
          <div className="text-xs text-white/70 capitalize">
            Theme: <span className="text-white font-semibold">{image.theme}</span>
          </div>
        )}

        {/* Tags preview */}
        {image.tags && image.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {image.tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/70">
                {tag}
              </span>
            ))}
            {image.tags.length > 2 && (
              <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/70">
                +{image.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="flex-1 py-2 px-3 bg-primary-500 hover:bg-primary-600 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
          >
            <Icon type="eye" className="w-3 h-3" />
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
            className="flex-1 py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
          >
            <Icon type="download" className="w-3 h-3" />
            Save
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="py-2 px-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs font-semibold transition-colors text-red-400 flex items-center justify-center"
          >
            <Icon type="trash" className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;
