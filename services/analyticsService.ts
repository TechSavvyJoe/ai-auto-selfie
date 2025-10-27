/**
 * Analytics Service
 * Tracks user behavior, feature usage, and performance metrics
 */

import { AnalyticsMetrics, AnalyticsEvent, AIMode, Theme } from '../types';

type AnalyticsObserver = (metrics: AnalyticsMetrics) => void;

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private metrics: AnalyticsMetrics;
  private observers: Set<AnalyticsObserver> = new Set();
  private readonly STORAGE_KEY = 'ai-selfie-analytics';
  private sessionStartTime: number = Date.now();

  constructor() {
    this.metrics = this.loadMetrics();
    this.events = this.loadEvents();
  }

  private loadMetrics(): AnalyticsMetrics {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
    return this.getDefaultMetrics();
  }

  private loadEvents(): AnalyticsEvent[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY + '-events');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    }
    return [];
  }

  private getDefaultMetrics(): AnalyticsMetrics {
    return {
      totalPhotos: 0,
      totalEnhancements: 0,
      averageProcessingTime: 0,
      mostUsedAIMode: null,
      mostUsedTheme: null,
      mostUsedEnhanceStrategy: null,
      strategyUsage: {},
      aiModeUsage: {} as Record<AIMode, number>,
      themeUsage: {} as Record<Theme, number>,
      averageRating: 0,
      sessionCount: 0,
      lastSessionDate: Date.now(),
    };
  }

  private saveMetrics(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.metrics));
      this.notifyObservers();
    } catch (error) {
      console.error('Failed to save analytics:', error);
    }
  }

  private saveEvents(): void {
    try {
      const recentEvents = this.events.slice(-500);
      localStorage.setItem(this.STORAGE_KEY + '-events', JSON.stringify(recentEvents));
    } catch (error) {
      console.error('Failed to save events:', error);
    }
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => observer({ ...this.metrics }));
  }

  trackEvent(type: AnalyticsEvent['type'], metadata: Record<string, any> = {}): void {
    const event: AnalyticsEvent = {
      id: Math.random().toString(36).substring(7),
      type,
      timestamp: Date.now(),
      metadata,
    };

    this.events.push(event);
    this.updateMetrics(type, metadata);
    this.saveEvents();
    this.saveMetrics();
  }

  private updateMetrics(type: AnalyticsEvent['type'], metadata: Record<string, any>): void {
    switch (type) {
      case 'photo_captured':
        this.metrics.totalPhotos++;
        this.metrics.sessionCount = Math.max(1, this.metrics.sessionCount);
        break;

      case 'enhancement_applied':
        this.metrics.totalEnhancements++;
        if (metadata.processingTime) {
          const total = this.metrics.averageProcessingTime * (this.metrics.totalEnhancements - 1);
          this.metrics.averageProcessingTime = (total + metadata.processingTime) / this.metrics.totalEnhancements;
        }
        if (metadata.aiMode) {
          this.metrics.aiModeUsage[metadata.aiMode] = (this.metrics.aiModeUsage[metadata.aiMode] || 0) + 1;
          this.metrics.mostUsedAIMode = this.getMostUsedKey(this.metrics.aiModeUsage) as AIMode | null;
        }
        if (metadata.theme) {
          this.metrics.themeUsage[metadata.theme] = (this.metrics.themeUsage[metadata.theme] || 0) + 1;
          this.metrics.mostUsedTheme = this.getMostUsedKey(this.metrics.themeUsage) as Theme | null;
        }
        break;

      case 'strategy_used':
        if (metadata.strategy) {
          this.metrics.strategyUsage[metadata.strategy] = (this.metrics.strategyUsage[metadata.strategy] || 0) + 1;
          this.metrics.mostUsedEnhanceStrategy = this.getMostUsedKey(this.metrics.strategyUsage);
        }
        break;

      case 'rating_given':
        if (metadata.rating) {
          const total = this.metrics.averageRating * (this.metrics.totalPhotos - 1);
          this.metrics.averageRating = (total + metadata.rating) / this.metrics.totalPhotos;
        }
        break;
    }

    this.metrics.lastSessionDate = Date.now();
  }

  private getMostUsedKey(record: Record<string, number>): string | null {
    const entries = Object.entries(record);
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  }

  getMetrics(): AnalyticsMetrics {
    return { ...this.metrics };
  }

  getEvents(limit: number = 100): AnalyticsEvent[] {
    return this.events.slice(-limit);
  }

  getEventsByType(type: AnalyticsEvent['type'], limit: number = 50): AnalyticsEvent[] {
    return this.events.filter(e => e.type === type).slice(-limit);
  }

  getSessionDuration(): number {
    return Date.now() - this.sessionStartTime;
  }

  getStrategyStats(): Array<{ strategy: string; count: number; percentage: number }> {
    const total = Object.values(this.metrics.strategyUsage).reduce((a, b) => a + b, 0);
    if (total === 0) return [];

    return Object.entries(this.metrics.strategyUsage)
      .map(([strategy, count]) => ({
        strategy,
        count,
        percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }

  getAIModeStats(): Array<{ mode: AIMode; count: number; percentage: number }> {
    const total = Object.values(this.metrics.aiModeUsage).reduce((a, b) => a + b, 0);
    if (total === 0) return [];

    return Object.entries(this.metrics.aiModeUsage)
      .map(([mode, count]) => ({
        mode: mode as AIMode,
        count,
        percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }

  reset(): void {
    this.events = [];
    this.metrics = this.getDefaultMetrics();
    this.sessionStartTime = Date.now();
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.STORAGE_KEY + '-events');
    } catch (error) {
      console.error('Failed to reset analytics:', error);
    }
  }

  subscribe(observer: AnalyticsObserver): () => void {
    this.observers.add(observer);
    return () => {
      this.observers.delete(observer);
    };
  }
}

let analyticsServiceInstance: AnalyticsService | null = null;

export function getAnalyticsService(): AnalyticsService {
  if (!analyticsServiceInstance) {
    analyticsServiceInstance = new AnalyticsService();
  }
  return analyticsServiceInstance;
}

export function useAnalytics() {
  const service = getAnalyticsService();
  return {
    trackEvent: (type: AnalyticsEvent['type'], metadata?: Record<string, any>) => {
      service.trackEvent(type, metadata);
    },
    trackFeature: (feature: string, metadata?: Record<string, any>) => {
      // Track generic feature usage
      service.trackEvent('preset_used', { feature, ...metadata });
    },
    getMetrics: () => service.getMetrics(),
  };
}

// Alias for backwards compatibility
export function getAnalyticsTracker(): AnalyticsService {
  return getAnalyticsService();
}
