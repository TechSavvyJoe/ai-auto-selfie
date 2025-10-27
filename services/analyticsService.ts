/**
 * Analytics & Usage Tracking Service
 * Track user behavior, feature usage, performance metrics
 * Privacy-first: all tracking done client-side, no data sent to servers
 */

export interface AnalyticsEvent {
  id: string;
  type: string;
  timestamp: number;
  duration?: number;
  metadata?: Record<string, any>;
  userAgent?: string;
  sessionId: string;
}

export interface UsageStats {
  totalSessions: number;
  totalEvents: number;
  averageSessionDuration: number;
  mostUsedFeatures: Array<{ feature: string; count: number }>;
  errorCount: number;
  successRate: number;
  averageProcessingTime: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

const ANALYTICS_STORAGE_KEY = 'analytics_events';
const SESSION_STORAGE_KEY = 'current_session';
const MAX_EVENTS = 1000;

/**
 * Analytics tracker
 */
export class AnalyticsTracker {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private sessionStartTime: number;
  private listeners: Set<(event: AnalyticsEvent) => void> = new Set();
  private enabled = true;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.sessionStartTime = Date.now();
    this.loadEvents();
  }

  /**
   * Track an event
   */
  trackEvent(
    type: string,
    metadata?: Record<string, any>,
    duration?: number
  ): AnalyticsEvent {
    if (!this.enabled) return { id: '', type, timestamp: 0, sessionId: '' };

    const event: AnalyticsEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: Date.now(),
      duration,
      metadata,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
    };

    this.events.push(event);

    // Maintain max size
    if (this.events.length > MAX_EVENTS) {
      this.events.shift();
    }

    this.saveEvents();
    this.notifyListeners(event);

    return event;
  }

  /**
   * Track feature usage
   */
  trackFeature(featureName: string, metadata?: Record<string, any>): void {
    this.trackEvent('feature_used', {
      feature: featureName,
      ...metadata,
    });
  }

  /**
   * Track performance metric
   */
  trackPerformance(metricName: string, value: number, unit: string = 'ms'): void {
    this.trackEvent('performance', {
      metric: metricName,
      value,
      unit,
    });
  }

  /**
   * Track error
   */
  trackError(errorMessage: string, errorType?: string): void {
    this.trackEvent('error', {
      message: errorMessage,
      type: errorType,
    });
  }

  /**
   * Track image enhancement
   */
  trackEnhancement(
    success: boolean,
    processingTime: number,
    filterUsed?: string
  ): void {
    this.trackEvent('image_enhanced', {
      success,
      processingTime,
      filter: filterUsed,
    });
  }

  /**
   * Track export
   */
  trackExport(format: string, platform?: string): void {
    this.trackEvent('image_exported', {
      format,
      platform,
    });
  }

  /**
   * Get all events
   */
  getAllEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Get events of a specific type
   */
  getEventsByType(type: string): AnalyticsEvent[] {
    return this.events.filter((e) => e.type === type);
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): UsageStats {
    const sessions = new Set(this.events.map((e) => e.sessionId)).size;
    const errorCount = this.events.filter((e) => e.type === 'error').length;
    const successCount = this.events.filter((e) => e.type === 'image_enhanced' && e.metadata?.success).length;
    const totalEnhancements = this.events.filter((e) => e.type === 'image_enhanced').length;

    const featureUsage: Record<string, number> = {};
    this.events
      .filter((e) => e.type === 'feature_used')
      .forEach((e) => {
        const feature = e.metadata?.feature || 'unknown';
        featureUsage[feature] = (featureUsage[feature] || 0) + 1;
      });

    const processingTimes = this.events
      .filter((e) => e.type === 'performance' && e.metadata?.metric === 'enhancement')
      .map((e) => e.metadata?.value || 0);

    const averageProcessingTime =
      processingTimes.length > 0
        ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
        : 0;

    return {
      totalSessions: sessions,
      totalEvents: this.events.length,
      averageSessionDuration: this.getAverageSessionDuration(),
      mostUsedFeatures: Object.entries(featureUsage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([feature, count]) => ({ feature, count })),
      errorCount,
      successRate: totalEnhancements > 0 ? (successCount / totalEnhancements) * 100 : 0,
      averageProcessingTime,
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetric[] {
    return this.events
      .filter((e) => e.type === 'performance')
      .map((e) => ({
        name: e.metadata?.metric || 'unknown',
        value: e.metadata?.value || 0,
        unit: e.metadata?.unit || 'ms',
        timestamp: e.timestamp,
      }));
  }

  /**
   * Export analytics data
   */
  exportAsJSON(): string {
    return JSON.stringify(
      {
        version: 1,
        exportDate: new Date().toISOString(),
        sessionId: this.sessionId,
        events: this.events,
        stats: this.getUsageStats(),
      },
      null,
      2
    );
  }

  /**
   * Clear all events
   */
  clearAll(): void {
    this.events = [];
    this.saveEvents();
  }

  /**
   * Enable/disable tracking
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Subscribe to events
   */
  subscribe(listener: (event: AnalyticsEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private getAverageSessionDuration(): number {
    const sessionDurations: Record<string, number[]> = {};

    this.events.forEach((e) => {
      if (!sessionDurations[e.sessionId]) {
        sessionDurations[e.sessionId] = [];
      }
      sessionDurations[e.sessionId].push(e.timestamp);
    });

    const durations = Object.values(sessionDurations).map((timestamps) => {
      if (timestamps.length === 0) return 0;
      const min = Math.min(...timestamps);
      const max = Math.max(...timestamps);
      return max - min;
    });

    return durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;
  }

  private getOrCreateSessionId(): string {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) return stored;

    const id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(SESSION_STORAGE_KEY, id);
    return id;
  }

  private saveEvents(): void {
    try {
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(this.events));
    } catch (error) {
      console.error('Failed to save analytics:', error);
    }
  }

  private loadEvents(): void {
    try {
      const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY);
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }

  private notifyListeners(event: AnalyticsEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }
}

/**
 * Global analytics instance
 */
let globalTracker: AnalyticsTracker | null = null;

export const getAnalyticsTracker = (): AnalyticsTracker => {
  if (!globalTracker) {
    globalTracker = new AnalyticsTracker();
  }
  return globalTracker;
};

/**
 * React hook for analytics
 */
export const useAnalytics = () => {
  const tracker = getAnalyticsTracker();

  return {
    trackEvent: (type: string, metadata?: any, duration?: number) =>
      tracker.trackEvent(type, metadata, duration),
    trackFeature: (feature: string, metadata?: any) =>
      tracker.trackFeature(feature, metadata),
    trackPerformance: (name: string, value: number, unit?: string) =>
      tracker.trackPerformance(name, value, unit),
    trackError: (message: string, type?: string) =>
      tracker.trackError(message, type),
    trackEnhancement: (success: boolean, time: number, filter?: string) =>
      tracker.trackEnhancement(success, time, filter),
    trackExport: (format: string, platform?: string) =>
      tracker.trackExport(format, platform),
    getStats: () => tracker.getUsageStats(),
    getMetrics: () => tracker.getPerformanceMetrics(),
    exportData: () => tracker.exportAsJSON(),
    setEnabled: (enabled: boolean) => tracker.setEnabled(enabled),
  };
};

import React from 'react';
