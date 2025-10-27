/**
 * Performance Service
 * Tracks and analyzes performance metrics
 */

import { PerformanceMetrics } from '../types';

class PerformanceService {
  private metrics: PerformanceMetrics[] = [];
  private readonly MAX_METRICS = 100;

  // Start timing a process
  startTimer(): number {
    return performance.now();
  }

  // Record metrics for an enhancement
  recordEnhancement(config: {
    imageProcessingTime: number;
    enhancementTime: number;
    imageSizeMB: number;
    adjustmentsApplied: number;
  }): PerformanceMetrics {
    const metrics: PerformanceMetrics = {
      imageProcessingTime: config.imageProcessingTime,
      enhancementTime: config.enhancementTime,
      totalTime: config.imageProcessingTime + config.enhancementTime,
      imageSizeMB: config.imageSizeMB,
      adjustmentsApplied: config.adjustmentsApplied,
      gpuAccelerated: this.isGPUAccelerated(),
    };

    this.metrics.push(metrics);

    // Keep only last 100 records
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    return metrics;
  }

  // Check if GPU acceleration is available
  private isGPUAccelerated(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('webgl') || canvas.getContext('webgl2');
      return !!ctx;
    } catch (e) {
      return false;
    }
  }

  // Get average metrics
  getAverageMetrics() {
    if (this.metrics.length === 0) {
      return null;
    }

    const total = this.metrics.reduce(
      (acc, m) => ({
        imageProcessingTime: acc.imageProcessingTime + m.imageProcessingTime,
        enhancementTime: acc.enhancementTime + m.enhancementTime,
        totalTime: acc.totalTime + m.totalTime,
        imageSizeMB: acc.imageSizeMB + m.imageSizeMB,
        adjustmentsApplied: acc.adjustmentsApplied + m.adjustmentsApplied,
        gpuAccelerated: acc.gpuAccelerated,
      }),
      {
        imageProcessingTime: 0,
        enhancementTime: 0,
        totalTime: 0,
        imageSizeMB: 0,
        adjustmentsApplied: 0,
        gpuAccelerated: false,
      }
    );

    const count = this.metrics.length;

    return {
      avgImageProcessingTime: Math.round(total.imageProcessingTime / count),
      avgEnhancementTime: Math.round(total.enhancementTime / count),
      avgTotalTime: Math.round(total.totalTime / count),
      avgImageSizeMB: (total.imageSizeMB / count).toFixed(2),
      avgAdjustmentsApplied: Math.round(total.adjustmentsApplied / count),
      gpuAvailable: this.isGPUAccelerated(),
    };
  }

  // Get all recorded metrics
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  // Get performance score (0-100)
  getPerformanceScore(): number {
    const avg = this.getAverageMetrics();
    if (!avg) return 100;

    // Score based on total time (lower is better)
    // Assume <500ms is perfect, >2000ms is poor
    const timeScore = Math.max(0, 100 - (avg.avgTotalTime / 20));

    // Bonus if GPU accelerated
    const gpuBonus = avg.gpuAvailable ? 5 : 0;

    return Math.min(100, timeScore + gpuBonus);
  }

  // Clear all metrics
  reset(): void {
    this.metrics = [];
  }
}

let performanceServiceInstance: PerformanceService | null = null;

export function getPerformanceService(): PerformanceService {
  if (!performanceServiceInstance) {
    performanceServiceInstance = new PerformanceService();
  }
  return performanceServiceInstance;
}
