/**
 * Settings Service
 * Manages user preferences and settings persistence
 */

import { UserPreferences, ShortcutKey, DEFAULT_PREFERENCES } from '../types';

type PreferencesObserver = (preferences: UserPreferences) => void;

class SettingsService {
  private preferences: UserPreferences;
  private observers: Set<PreferencesObserver> = new Set();
  private readonly STORAGE_KEY = 'ai-selfie-preferences';

  constructor() {
    this.preferences = this.loadPreferences();
  }

  private loadPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
    return { ...DEFAULT_PREFERENCES };
  }

  private savePreferences(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.preferences));
      this.notifyObservers();
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => observer({ ...this.preferences }));
  }

  // Getter methods
  getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  getTheme(): 'light' | 'dark' | 'auto' {
    return this.preferences.theme;
  }

  getDefaultAIMode() {
    return this.preferences.defaultAIMode;
  }

  getDefaultEnhancementLevel() {
    return this.preferences.defaultEnhancementLevel;
  }

  isAutoSuggestEnabled(): boolean {
    return this.preferences.enableAutoSuggest;
  }

  isTutorialEnabled(): boolean {
    return this.preferences.enableTutorial;
  }

  isAnalyticsEnabled(): boolean {
    return this.preferences.enableAnalytics;
  }

  getShortcuts(): ShortcutKey[] {
    return [...this.preferences.shortcuts];
  }

  getShortcut(id: string): ShortcutKey | undefined {
    return this.preferences.shortcuts.find(s => s.id === id);
  }

  // Setter methods
  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.preferences.theme = theme;
    this.savePreferences();
  }

  setDefaultAIMode(mode: any): void {
    this.preferences.defaultAIMode = mode;
    this.savePreferences();
  }

  setDefaultEnhancementLevel(level: any): void {
    this.preferences.defaultEnhancementLevel = level;
    this.savePreferences();
  }

  setAutoSuggestEnabled(enabled: boolean): void {
    this.preferences.enableAutoSuggest = enabled;
    this.savePreferences();
  }

  setTutorialEnabled(enabled: boolean): void {
    this.preferences.enableTutorial = enabled;
    this.savePreferences();
  }

  setAnalyticsEnabled(enabled: boolean): void {
    this.preferences.enableAnalytics = enabled;
    this.savePreferences();
  }

  // Caption preferences
  getCaptionTone(): 'friendly' | 'formal' | 'brief' {
    return (this.preferences as any).captionTone || 'friendly';
  }

  setCaptionTone(tone: 'friendly' | 'formal' | 'brief'): void {
    (this.preferences as any).captionTone = tone;
    this.savePreferences();
  }

  isIncludeHashtagsEnabled(): boolean {
    return Boolean((this.preferences as any).includeHashtags ?? true);
  }

  setIncludeHashtags(enabled: boolean): void {
    (this.preferences as any).includeHashtags = enabled;
    this.savePreferences();
  }

  // Shortcut management
  updateShortcut(id: string, keys: string[]): void {
    const shortcut = this.preferences.shortcuts.find(s => s.id === id);
    if (shortcut) {
      shortcut.keys = keys;
      this.savePreferences();
    }
  }

  toggleShortcutEnabled(id: string): void {
    const shortcut = this.preferences.shortcuts.find(s => s.id === id);
    if (shortcut) {
      shortcut.enabled = !shortcut.enabled;
      this.savePreferences();
    }
  }

  addShortcut(id: string, keys: string[]): void {
    const existing = this.preferences.shortcuts.find(s => s.id === id);
    if (!existing) {
      this.preferences.shortcuts.push({ id, keys, enabled: true });
      this.savePreferences();
    }
  }

  // Reset to defaults
  resetToDefaults(): void {
    this.preferences = { ...DEFAULT_PREFERENCES };
    this.savePreferences();
  }

  // Observer pattern
  subscribe(observer: PreferencesObserver): () => void {
    this.observers.add(observer);
    // Return unsubscribe function
    return () => {
      this.observers.delete(observer);
    };
  }
}

let settingsServiceInstance: SettingsService | null = null;

export function getSettingsService(): SettingsService {
  if (!settingsServiceInstance) {
    settingsServiceInstance = new SettingsService();
  }
  return settingsServiceInstance;
}

export function useSettings() {
  const service = getSettingsService();
  const prefs = service.getPreferences();
  return prefs;
}
