import React, { useState, useEffect } from 'react';
import Button from './common/Button';
import Icon from './common/Icon';
import { getAnalyticsService } from '../services/analyticsService';
import { AnalyticsMetrics } from '../types';

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ isOpen, onClose }) => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const analyticsService = getAnalyticsService();

  useEffect(() => {
    if (isOpen) {
      setMetrics(analyticsService.getMetrics());
      const unsubscribe = analyticsService.subscribe((m) => setMetrics(m));
      return unsubscribe;
    }
  }, [isOpen, analyticsService]);

  if (!isOpen || !metrics) return null;

  const strategyStats = analyticsService.getStrategyStats();
  const aiModeStats = analyticsService.getAIModeStats();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900">
          <div className="flex items-center gap-3">
            <Icon type="chart" className="w-6 h-6 text-primary-400" />
            <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Icon type="close" className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Total Photos</p>
              <p className="text-3xl font-bold text-blue-300">{metrics.totalPhotos}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Total Enhancements</p>
              <p className="text-3xl font-bold text-purple-300">{metrics.totalEnhancements}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Avg Processing Time</p>
              <p className="text-3xl font-bold text-green-300">{Math.round(metrics.averageProcessingTime)}ms</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Avg Rating</p>
              <p className="text-3xl font-bold text-orange-300">{metrics.averageRating.toFixed(1)}/5.0</p>
            </div>
          </div>

          {strategyStats.length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <h3 className="text-sm font-semibold text-white mb-3">Most Used Strategies</h3>
              <div className="space-y-2">
                {strategyStats.slice(0, 5).map((stat) => (
                  <div key={stat.strategy} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300 capitalize">{stat.strategy}</span>
                    <div className="flex items-center gap-2 flex-1 ml-4">
                      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full transition-all"
                          style={{ width: stat.percentage + '%' }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-12 text-right">{stat.percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {aiModeStats.length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <h3 className="text-sm font-semibold text-white mb-3">AI Mode Usage</h3>
              <div className="space-y-2">
                {aiModeStats.map((stat) => (
                  <div key={stat.mode} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300 capitalize">{stat.mode}</span>
                    <div className="flex items-center gap-2 flex-1 ml-4">
                      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: stat.percentage + '%' }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-12 text-right">{stat.percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-semibold text-white mb-3">Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Most Used AI Mode</p>
                <p className="text-white font-medium capitalize">{metrics.mostUsedAIMode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">Most Used Theme</p>
                <p className="text-white font-medium capitalize">{metrics.mostUsedTheme || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">Session Count</p>
                <p className="text-white font-medium">{metrics.sessionCount}</p>
              </div>
              <div>
                <p className="text-gray-400">Last Active</p>
                <p className="text-white font-medium">{new Date(metrics.lastSessionDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 bg-gray-800/50 flex gap-2">
          <Button onClick={() => { analyticsService.reset(); }} variant="secondary" className="text-sm">
            Reset Analytics
          </Button>
          <Button onClick={onClose} variant="secondary" className="text-sm flex-1">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
