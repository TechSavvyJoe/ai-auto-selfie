/**
 * Batch Processing Service
 * Process multiple images with same settings
 * Perfect for processing multiple photos from a photoshoot
 */

import { EditOptions } from '../types';
import { enhanceImageWithAI } from './geminiService';
import { dataUrlToBase64 } from '../utils/imageUtils';

export interface BatchJob {
  id: string;
  images: string[]; // Base64 data URLs
  options: EditOptions;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  results: string[]; // Processed image URLs
  errors: string[];
  startedAt?: number;
  completedAt?: number;
  totalDuration?: number;
  estimatedTimeRemaining?: number;
}

export interface BatchProgress {
  jobId: string;
  currentIndex: number;
  totalCount: number;
  progress: number;
  currentImage: string;
  status: string;
  elapsedTime: number;
  estimatedTimeRemaining: number;
}

/**
 * Batch processing manager
 */
export class BatchProcessor {
  private jobs: Map<string, BatchJob> = new Map();
  private queue: string[] = [];
  private currentJobId: string | null = null;
  private isProcessing = false;
  private listeners: Set<(progress: BatchProgress) => void> = new Set();
  private completionListeners: Set<(job: BatchJob) => void> = new Set();

  /**
   * Create a new batch job
   */
  createJob(images: string[], options: EditOptions): BatchJob {
    const id = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const job: BatchJob = {
      id,
      images,
      options,
      status: 'pending',
      progress: 0,
      results: [],
      errors: [],
    };

    this.jobs.set(id, job);
    this.queue.push(id);

    return job;
  }

  /**
   * Start processing batch job
   */
  async processBatch(jobId: string): Promise<BatchJob> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error('Job not found');

    if (this.isProcessing) {
      // Queue for later
      return job;
    }

    this.isProcessing = true;
    this.currentJobId = jobId;
    job.status = 'processing';
    job.startedAt = Date.now();

    try {
      for (let i = 0; i < job.images.length; i++) {
        try {
          const result = await enhanceImageWithAI(
            dataUrlToBase64(job.images[i]),
            'image/jpeg',
            job.options
          );

          if (result) {
            job.results.push(`data:image/jpeg;base64,${result}`);
          } else {
            job.errors.push(`Image ${i + 1}: AI returned empty result`);
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          job.errors.push(`Image ${i + 1}: ${errorMsg}`);
        }

        // Update progress
        job.progress = Math.round(((i + 1) / job.images.length) * 100);
        this.notifyProgress(jobId, i);
      }

      job.status = 'completed';
    } catch (error) {
      job.status = 'failed';
      job.errors.push(`Batch processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      job.completedAt = Date.now();
      job.totalDuration = job.completedAt - (job.startedAt || 0);
      this.isProcessing = false;
      this.currentJobId = null;

      this.notifyCompletion(job);

      // Process next in queue
      if (this.queue.length > 0) {
        const nextId = this.queue.shift()!;
        this.processBatch(nextId);
      }
    }

    return job;
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): BatchJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs
   */
  getAllJobs(): BatchJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Cancel a job
   */
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (job.status === 'processing') {
      job.status = 'failed';
      job.errors.push('Job cancelled by user');
      if (this.currentJobId === jobId) {
        this.isProcessing = false;
        this.currentJobId = null;
      }
    }

    return true;
  }

  /**
   * Delete a job
   */
  deleteJob(jobId: string): boolean {
    return this.jobs.delete(jobId);
  }

  /**
   * Clear completed jobs
   */
  clearCompletedJobs(): void {
    const ids = Array.from(this.jobs.keys());
    ids.forEach((id) => {
      const job = this.jobs.get(id);
      if (job && (job.status === 'completed' || job.status === 'failed')) {
        this.jobs.delete(id);
      }
    });
  }

  /**
   * Export batch results
   */
  async exportBatchResults(jobId: string): Promise<Blob[]> {
    const job = this.jobs.get(jobId);
    if (!job || job.results.length === 0) {
      throw new Error('No results to export');
    }

    return Promise.all(
      job.results.map(async (dataUrl) => {
        return new Promise<Blob>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Failed to create blob'));
              }, 'image/jpeg', 0.95);
            } else {
              reject(new Error('Failed to get canvas context'));
            }
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = dataUrl;
        });
      })
    );
  }

  /**
   * Get job statistics
   */
  getStatistics(): {
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    totalImages: number;
    processedImages: number;
    failedImages: number;
    totalDuration: number;
  } {
    const jobs = this.getAllJobs();
    let totalImages = 0;
    let processedImages = 0;
    let failedImages = 0;
    let totalDuration = 0;

    jobs.forEach((job) => {
      totalImages += job.images.length;
      processedImages += job.results.length;
      failedImages += job.errors.length;
      if (job.totalDuration) totalDuration += job.totalDuration;
    });

    return {
      totalJobs: jobs.length,
      completedJobs: jobs.filter((j) => j.status === 'completed').length,
      failedJobs: jobs.filter((j) => j.status === 'failed').length,
      totalImages,
      processedImages,
      failedImages,
      totalDuration,
    };
  }

  /**
   * Subscribe to progress updates
   */
  onProgress(listener: (progress: BatchProgress) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Subscribe to job completion
   */
  onCompletion(listener: (job: BatchJob) => void): () => void {
    this.completionListeners.add(listener);
    return () => this.completionListeners.delete(listener);
  }

  private notifyProgress(jobId: string, currentIndex: number): void {
    const job = this.jobs.get(jobId);
    if (!job || !job.startedAt) return;

    const elapsedTime = Date.now() - job.startedAt;
    const timePerImage = elapsedTime / (currentIndex + 1);
    const remainingImages = job.images.length - (currentIndex + 1);
    const estimatedTimeRemaining = timePerImage * remainingImages;

    const progress: BatchProgress = {
      jobId,
      currentIndex,
      totalCount: job.images.length,
      progress: job.progress,
      currentImage: job.images[currentIndex],
      status: `Processing image ${currentIndex + 1} of ${job.images.length}`,
      elapsedTime,
      estimatedTimeRemaining,
    };

    this.listeners.forEach((listener) => listener(progress));
  }

  private notifyCompletion(job: BatchJob): void {
    this.completionListeners.forEach((listener) => listener(job));
  }
}

/**
 * Global batch processor instance
 */
let globalProcessor: BatchProcessor | null = null;

export const getBatchProcessor = (): BatchProcessor => {
  if (!globalProcessor) {
    globalProcessor = new BatchProcessor();
  }
  return globalProcessor;
};

/**
 * React hook for batch processing
 */
export const useBatchProcessor = () => {
  const processor = getBatchProcessor();
  const [jobs, setJobs] = React.useState<BatchJob[]>(processor.getAllJobs());
  const [progress, setProgress] = React.useState<BatchProgress | null>(null);

  React.useEffect(() => {
    const unsubscribeProgress = processor.onProgress((p) => setProgress(p));
    const unsubscribeCompletion = processor.onCompletion(() => {
      setJobs(processor.getAllJobs());
    });

    return () => {
      unsubscribeProgress();
      unsubscribeCompletion();
    };
  }, [processor]);

  return {
    jobs,
    progress,
    createJob: (images: string[], options: any) => processor.createJob(images, options),
    processBatch: (jobId: string) => processor.processBatch(jobId),
    getJob: (jobId: string) => processor.getJob(jobId),
    cancelJob: (jobId: string) => processor.cancelJob(jobId),
    deleteJob: (jobId: string) => processor.deleteJob(jobId),
    clearCompletedJobs: () => processor.clearCompletedJobs(),
    exportResults: (jobId: string) => processor.exportBatchResults(jobId),
    getStatistics: () => processor.getStatistics(),
  };
};

import React from 'react';
