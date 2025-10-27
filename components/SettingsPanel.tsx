import React, { useState, useEffect } from 'react';
import Button from './common/Button';
import Icon from './common/Icon';
import SegmentedControl from './common/SegmentedControl';
import { getSettingsService } from '../services/settingsService';
import { UserPreferences } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const settingsService = getSettingsService();

  useEffect(() => {
    if (isOpen) {
      setPreferences(settingsService.getPreferences());
    }
  }, [isOpen, settingsService]);

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    settingsService.setTheme(theme);
    setPreferences(settingsService.getPreferences());
  };

  const handleAutoSuggestToggle = () => {
    settingsService.setAutoSuggestEnabled(!preferences?.enableAutoSuggest);
    setPreferences(settingsService.getPreferences());
  };

  const handleTutorialToggle = () => {
    settingsService.setTutorialEnabled(!preferences?.enableTutorial);
    setPreferences(settingsService.getPreferences());
  };

  const handleAnalyticsToggle = () => {
    settingsService.setAnalyticsEnabled(!preferences?.enableAnalytics);
    setPreferences(settingsService.getPreferences());
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to defaults?')) {
      settingsService.resetToDefaults();
      setPreferences(settingsService.getPreferences());
    }
  };

  if (!isOpen || !preferences) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900">
          <div className="flex items-center gap-3">
            <Icon type="settings" className="w-6 h-6 text-primary-400" />
            <h2 className="text-2xl font-bold text-white">Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Icon type="close" className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Theme</h3>
            <SegmentedControl<'light' | 'dark' | 'auto'>
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'auto', label: 'Auto' },
              ]}
              value={preferences.theme}
              onChange={handleThemeChange}
            />
          </div>

          <div className="space-y-3">
            <button
              onClick={handleAutoSuggestToggle}
              className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span className="text-sm text-white">Auto-Suggest Enhancements</span>
              <div className={preferences.enableAutoSuggest ? 'w-10 h-6 rounded-full bg-primary-500' : 'w-10 h-6 rounded-full bg-gray-600'}>
                <div className={preferences.enableAutoSuggest ? 'w-5 h-5 rounded-full bg-white translate-x-5 mt-0.5' : 'w-5 h-5 rounded-full bg-white translate-x-0.5 mt-0.5'} />
              </div>
            </button>

            <button
              onClick={handleTutorialToggle}
              className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span className="text-sm text-white">Show Tutorial</span>
              <div className={preferences.enableTutorial ? 'w-10 h-6 rounded-full bg-primary-500' : 'w-10 h-6 rounded-full bg-gray-600'}>
                <div className={preferences.enableTutorial ? 'w-5 h-5 rounded-full bg-white translate-x-5 mt-0.5' : 'w-5 h-5 rounded-full bg-white translate-x-0.5 mt-0.5'} />
              </div>
            </button>

            <button
              onClick={handleAnalyticsToggle}
              className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span className="text-sm text-white">Analytics</span>
              <div className={preferences.enableAnalytics ? 'w-10 h-6 rounded-full bg-primary-500' : 'w-10 h-6 rounded-full bg-gray-600'}>
                <div className={preferences.enableAnalytics ? 'w-5 h-5 rounded-full bg-white translate-x-5 mt-0.5' : 'w-5 h-5 rounded-full bg-white translate-x-0.5 mt-0.5'} />
              </div>
            </button>
          </div>

          <button
            onClick={handleReset}
            className="w-full p-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-sm font-medium"
          >
            Reset to Defaults
          </button>
        </div>

        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <Button onClick={onClose} variant="secondary" className="w-full text-sm">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
