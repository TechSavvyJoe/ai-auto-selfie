/**
 * Theme Switcher Component
 * Toggle between dark/light modes with system preference detection
 * Persists user preference across sessions
 */

import React, { useState, useEffect } from 'react';
import Icon from './common/Icon';

export type Theme = 'dark' | 'light' | 'system';

export interface ThemeContextType {
  theme: Theme;
  actualTheme: 'dark' | 'light';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme';

/**
 * Theme Provider - Wrap your app with this
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<'dark' | 'light'>('dark');

  // Initialize theme from storage
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (stored) {
      setTheme(stored);
    }
  }, []);

  // Update actual theme based on preference and system setting
  useEffect(() => {
    let actualThemeValue: 'dark' | 'light' = 'dark';

    if (theme === 'system') {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      actualThemeValue = prefersDark ? 'dark' : 'light';
    } else {
      actualThemeValue = theme;
    }

    setActualTheme(actualThemeValue);

    // Apply theme to document
    if (actualThemeValue === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const prefersDark = mediaQuery.matches;
      setActualTheme(prefersDark ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme: handleSetTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Hook to use theme
 */
export const useTheme = (): ThemeContextType => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

/**
 * Theme Switcher Component
 */
export interface ThemeSwitcherProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  position?: 'inline' | 'dropdown';
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  size = 'md',
  showLabel = false,
  position = 'inline',
  className = '',
}) => {
  const { theme, actualTheme, setTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  const themes: Array<{ value: Theme; label: string; icon: string }> = [
    { value: 'light', label: 'Light', icon: 'sun' },
    { value: 'dark', label: 'Dark', icon: 'moon' },
    { value: 'system', label: 'System', icon: 'monitor' },
  ];

  if (position === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`${sizeClasses[size]} rounded-lg hover:bg-neutral-800 transition-colors flex items-center justify-center`}
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {actualTheme === 'dark' ? (
            <Icon type="moon" className="w-5 h-5 text-neutral-400" />
          ) : (
            <Icon type="sun" className="w-5 h-5 text-neutral-600" />
          )}
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg z-50 min-w-48 overflow-hidden">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  setTheme(t.value);
                  setShowMenu(false);
                }}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-neutral-800 transition-colors ${
                  theme === t.value ? 'bg-primary-500/10 text-primary-400' : 'text-neutral-300'
                }`}
              >
                <Icon type={t.icon} className="w-4 h-4" />
                <span className="text-sm font-medium">{t.label}</span>
                {theme === t.value && (
                  <Icon type="check" className="w-4 h-4 ml-auto text-primary-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Inline buttons
  return (
    <div className={`flex gap-2 ${className}`}>
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className={`${sizeClasses[size]} rounded-lg transition-all flex items-center justify-center gap-1 ${
            theme === t.value
              ? 'bg-primary-500 text-white shadow-lg'
              : 'hover:bg-neutral-800 text-neutral-400'
          }`}
          title={t.label}
          aria-label={`Set theme to ${t.label}`}
          aria-pressed={theme === t.value}
        >
          <Icon type={t.icon} className="w-5 h-5" />
          {showLabel && <span className="text-xs font-semibold">{t.label}</span>}
        </button>
      ))}
    </div>
  );
};

/**
 * Settings Panel with Theme Control
 */
export interface SettingsPanelProps {
  showPrivacy?: boolean;
  showAnalytics?: boolean;
  onAnalyticsChange?: (enabled: boolean) => void;
  onThemeChange?: (theme: Theme) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  showPrivacy = true,
  showAnalytics = true,
  onAnalyticsChange,
  onThemeChange,
}) => {
  const { theme, setTheme } = useTheme();
  const [analyticsEnabled, setAnalyticsEnabled] = React.useState(true);

  const handleAnalyticsToggle = () => {
    setAnalyticsEnabled(!analyticsEnabled);
    onAnalyticsChange?.(!analyticsEnabled);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  return (
    <div className="space-y-6">
      {/* Appearance Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white">Appearance</h3>
        <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
          <label className="text-sm text-neutral-300">Theme</label>
          <ThemeSwitcher position="dropdown" size="sm" />
        </div>
      </div>

      {/* Analytics Section */}
      {showAnalytics && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Privacy & Data</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg cursor-pointer hover:bg-neutral-800 transition-colors">
              <input
                type="checkbox"
                checked={analyticsEnabled}
                onChange={handleAnalyticsToggle}
                className="w-4 h-4 rounded accent-primary-500"
              />
              <div>
                <p className="text-sm font-medium text-white">
                  Usage Analytics
                </p>
                <p className="text-xs text-neutral-400">
                  Help us improve by collecting anonymous usage data
                </p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Privacy Section */}
      {showPrivacy && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Storage</h3>
          <div className="space-y-2 text-xs text-neutral-400">
            <p>
              All images and settings are stored locally on your device. No
              data is sent to external servers except to Google Gemini API for
              image enhancement.
            </p>
            <p>
              Gallery images are stored in browser localStorage (up to 50
              images). Clear your browser data to remove them.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
