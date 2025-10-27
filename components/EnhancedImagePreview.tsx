import React, { useState, useEffect } from 'react';
import Icon from './common/Icon';
import Button from './common/Button';
import { GalleryImage } from '../types';
import { getAIImageAnalysisService, ImageAnalysis } from '../services/aiImageAnalysisService';

interface EnhancedImagePreviewProps {
  image: GalleryImage;
  onClose: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onToggleFavorite?: () => void;
  similarImages?: GalleryImage[];
}

const EnhancedImagePreview: React.FC<EnhancedImagePreviewProps> = ({
  image,
  onClose,
  onDownload,
  onDelete,
  onToggleFavorite,
  similarImages = []
}) => {
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const analyzeImage = async () => {
      try {
        const service = getAIImageAnalysisService();
        const result = await service.analyzeImage(image);
        setAnalysis(result);
      } catch (error) {
        console.error('Error analyzing image:', error);
      }
    };

    analyzeImage();
  }, [image.id]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (dataUrl: string) => {
    const bytes = dataUrl.length;
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const copyToClipboard = () => {
    const link = image.imageDataUrl;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getQualityLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Fair';
    return 'Needs Work';
  };

  const getQualityColor = (score: number) => {
    if (score >= 85) return 'text-green-400 bg-green-500/20';
    if (score >= 70) return 'text-blue-400 bg-blue-500/20';
    if (score >= 55) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-gray-900 via-neutral-900 to-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-800 bg-black/20 backdrop-blur">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-white">Image Preview</h3>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs font-semibold capitalize">
              <Icon type="zap" className="w-3 h-3" />
              {image.aiMode}
            </span>
            {image.theme && (
              <span className="inline-flex items-center px-2 py-1 bg-gray-700/50 text-white/70 rounded-full text-xs font-semibold capitalize">
                {image.theme}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Icon type="close" className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Image Preview */}
        <div className="sticky top-0 p-4 bg-black/40 border-b border-gray-800">
          <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
            <img
              src={image.imageDataUrl}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Details */}
        <div className="p-4 space-y-6">
          {/* Quality Score */}
          {analysis && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white uppercase tracking-wide">Quality Analysis</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getQualityColor(analysis.qualityScore)}`}>
                  {getQualityLabel(analysis.qualityScore)}
                </span>
              </div>

              {/* Quality Metrics */}
              <div className="space-y-2">
                {/* Brightness */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/70">Brightness</span>
                    <span className="text-xs font-semibold text-white">{Math.round(analysis.brightness)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all"
                      style={{ width: `${analysis.brightness}%` }}
                    />
                  </div>
                </div>

                {/* Contrast */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/70">Contrast</span>
                    <span className="text-xs font-semibold text-white">{Math.round(analysis.contrast)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
                      style={{ width: `${analysis.contrast}%` }}
                    />
                  </div>
                </div>

                {/* Saturation */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/70">Saturation</span>
                    <span className="text-xs font-semibold text-white">{Math.round(analysis.saturation)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-pink-400 transition-all"
                      style={{ width: `${analysis.saturation}%` }}
                    />
                  </div>
                </div>

                {/* Sharpness */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/70">Sharpness</span>
                    <span className="text-xs font-semibold text-white">{Math.round(analysis.sharpness)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all"
                      style={{ width: `${analysis.sharpness}%` }}
                    />
                  </div>
                </div>

                {/* Quality Score */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/70">Overall Quality</span>
                    <span className="text-xs font-semibold text-white">{Math.round(analysis.qualityScore)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all"
                      style={{ width: `${analysis.qualityScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wide">Information</h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                <div className="text-xs text-white/60 mb-1">Date</div>
                <div className="text-xs font-semibold text-white truncate" title={formatDate(image.createdAt)}>
                  {new Date(image.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                <div className="text-xs text-white/60 mb-1">File Size</div>
                <div className="text-xs font-semibold text-white">
                  {formatFileSize(image.imageDataUrl)}
                </div>
              </div>

              {image.processingTime && (
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                  <div className="text-xs text-white/60 mb-1">Processing Time</div>
                  <div className="text-xs font-semibold text-white">
                    {(image.processingTime / 1000).toFixed(1)}s
                  </div>
                </div>
              )}

              {image.enhancementLevel && (
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                  <div className="text-xs text-white/60 mb-1">Enhancement</div>
                  <div className="text-xs font-semibold text-white capitalize">
                    {image.enhancementLevel}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dominant Colors */}
          {analysis && analysis.dominantColors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wide">Color Palette</h4>
              <div className="flex gap-2">
                {analysis.dominantColors.map((color, idx) => (
                  <div
                    key={idx}
                    className="h-12 flex-1 rounded-lg border border-gray-700 shadow-lg hover:scale-105 transition-transform cursor-pointer"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {analysis && analysis.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wide">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-primary-500/20 text-primary-400 rounded-full text-xs font-semibold hover:bg-primary-500/30 transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {image.message && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wide">Message</h4>
              <p className="text-sm text-white/80 leading-relaxed bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                {image.message}
              </p>
            </div>
          )}

          {/* Analysis Description */}
          {analysis && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wide">Analysis</h4>
              <p className="text-sm text-white/80 leading-relaxed bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                {analysis.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions Footer */}
      <div className="flex-shrink-0 border-t border-gray-800 bg-black/20 backdrop-blur p-4 space-y-2">
        <div className="flex gap-2">
          <Button
            onClick={onDownload}
            variant="primary"
            className="flex-1 flex items-center justify-center gap-2"
            icon={<Icon type="download" className="w-4 h-4" />}
          >
            Download
          </Button>
          {onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                image.isFavorite
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              <Icon type="heart" className={`w-4 h-4 ${image.isFavorite ? 'fill-current' : ''}`} />
              {image.isFavorite ? 'Favorited' : 'Favorite'}
            </button>
          )}
        </div>
        <Button
          onClick={onDelete}
          variant="danger"
          className="w-full flex items-center justify-center gap-2"
          icon={<Icon type="trash" className="w-4 h-4" />}
        >
          Delete Image
        </Button>
      </div>
    </div>
  );
};

export default EnhancedImagePreview;
