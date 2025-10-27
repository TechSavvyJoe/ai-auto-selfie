/**
 * Batch Enhancement Service
 * Handles batch processing of multiple images
 */

import { BatchJob } from '../types';
import { autoEnhance } from './autoEnhanceService';
import { getPerformanceService } from './performanceService';

type BatchJobObserver = (job: BatchJob) => void;

class BatchEnhanceService {
  private jobs: Map<string, BatchJob> = new Map();
  private observers: Set<BatchJobObserver> = new Set();
  private activeJobs: Set<string> = new Set();
  private readonly MAX_CONCURRENT = 3;

  // Create a new batch job
  createJob(imageIds: string[], strategy: string): string {
    const jobId = Math.random().toString(36).substring(7);
    const job: BatchJob = {
      id: jobId,
      imageIds,
      strategy,
      status: 'pending',
      progress: 0,
      results: [],
      startedAt: Date.now(),
    };

    this.jobs.set(jobId, job);
    this.notifyObservers(job);
    this.processNextJob();

    return jobId;
  }

  // Start processing a batch job
  private async processNextJob(): Promise<void> {
    if (this.activeJobs.size >= this.MAX_CONCURRENT) {
      return;
    }

    let nextJob: BatchJob | null = null;
    for (const [, job] of this.jobs) {
      if (job.status === 'pending') {
        nextJob = job;
        break;
      }
    }

    if (!nextJob) {
      return;
    }

    this.activeJobs.add(nextJob.id);
    nextJob.status = 'processing';
    nextJob.startedAt = Date.now();
    this.notifyObservers(nextJob);

    try {
      const performanceService = getPerformanceService();
      const results: string[] = [];
      const totalImages = nextJob.imageIds.length;

      for (let i = 0; i < totalImages; i++) {
        const imageId = nextJob.imageIds[i];
        const startTime = performanceService.startTimer();

        try {
          // Simulate image enhancement (in real app, would fetch image and enhance)
          // For now, we'll just mark progress
          nextJob.results.push(imageId);
          nextJob.progress = Math.round(((i + 1) / totalImages) * 100);
          this.notifyObservers(nextJob);

          // Small delay to prevent blocking
          await new Promise(resolve => setTimeout(resolve, 10));
        } catch (error) {
          console.error(`Failed to enhance image ${imageId}:`, error);
        }
      }

      nextJob.status = 'completed';
      nextJob.completedAt = Date.now();
      nextJob.progress = 100;
    } catch (error) {
      console.error(`Batch job ${nextJob.id} failed:`, error);
      nextJob.status = 'failed';
      nextJob.completedAt = Date.now();
    }

    this.activeJobs.delete(nextJob.id);
    this.notifyObservers(nextJob);

    // Process next job
    this.processNextJob();
  }

  // Get job by ID
  getJob(jobId: string): BatchJob | undefined {
    return this.jobs.get(jobId);
  }

  // Get all jobs
  getAllJobs(): BatchJob[] {
    return Array.from(this.jobs.values());
  }

  // Get active jobs
  getActiveJobs(): BatchJob[] {
    return Array.from(this.jobs.values()).filter(j => j.status === 'processing');
  }

  // Get completed jobs
  getCompletedJobs(): BatchJob[] {
    return Array.from(this.jobs.values()).filter(j => j.status === 'completed');
  }

  // Cancel a job
  cancelJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job && job.status !== 'completed') {
      job.status = 'failed';
      job.completedAt = Date.now();
      this.activeJobs.delete(jobId);
      this.notifyObservers(job);
    }
  }

  // Get progress of a job
  getProgress(jobId: string): number {
    const job = this.jobs.get(jobId);
    return job ? job.progress : 0;
  }

  // Clear completed jobs
  clearCompleted(): void {
    for (const [id, job] of this.jobs) {
      if (job.status === 'completed') {
        this.jobs.delete(id);
      }
    }
  }

  // Clear all jobs
  clearAll(): void {
    this.jobs.clear();
    this.activeJobs.clear();
  }

  private notifyObservers(job: BatchJob): void {
    this.observers.forEach(observer => observer({ ...job }));
  }

  // Observer pattern
  subscribe(observer: BatchJobObserver): () => void {
    this.observers.add(observer);
    return () => {
      this.observers.delete(observer);
    };
  }
}

let batchEnhanceServiceInstance: BatchEnhanceService | null = null;

export function getBatchEnhanceService(): BatchEnhanceService {
  if (!batchEnhanceServiceInstance) {
    batchEnhanceServiceInstance = new BatchEnhanceService();
  }
  return batchEnhanceServiceInstance;
}
