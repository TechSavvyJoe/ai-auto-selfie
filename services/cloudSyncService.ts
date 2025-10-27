/**
 * Cloud Sync Service
 * Handles synchronization of presets, gallery, and settings to cloud storage
 * Supports multiple backends: Firebase, Supabase, custom REST API
 */

import { GalleryImage } from '../types';

export interface CloudSyncConfig {
  enabled: boolean;
  backend: 'firebase' | 'supabase' | 'custom' | null;
  apiKey?: string;
  projectId?: string;
  customEndpoint?: string;
  autoSync: boolean;
  syncInterval: number; // milliseconds
  userId?: string;
  lastSyncTime?: number;
}

export interface SyncData {
  presets: any[];
  gallery: GalleryImage[];
  settings: Record<string, any>;
  timestamp: number;
  version: string;
}

export interface CloudSyncStatus {
  isSyncing: boolean;
  lastSync: number | null;
  syncedItems: number;
  totalItems: number;
  error: string | null;
  status: 'idle' | 'syncing' | 'success' | 'error';
}

const CLOUD_SYNC_KEY = 'cloudSyncConfig';
const SYNC_STATUS_KEY = 'cloudSyncStatus';
const SYNC_VERSION = '1.0.0';

class CloudSyncService {
  private config: CloudSyncConfig;
  private status: CloudSyncStatus;
  private syncIntervalId: NodeJS.Timeout | null = null;
  private observers: ((status: CloudSyncStatus) => void)[] = [];

  constructor() {
    const saved = localStorage.getItem(CLOUD_SYNC_KEY);
    this.config = saved ? JSON.parse(saved) : this.getDefaultConfig();

    const savedStatus = localStorage.getItem(SYNC_STATUS_KEY);
    this.status = savedStatus ? JSON.parse(savedStatus) : this.getDefaultStatus();

    if (this.config.autoSync && this.config.enabled) {
      this.startAutoSync();
    }
  }

  private getDefaultConfig(): CloudSyncConfig {
    return {
      enabled: false,
      backend: null,
      autoSync: false,
      syncInterval: 300000, // 5 minutes
    };
  }

  private getDefaultStatus(): CloudSyncStatus {
    return {
      isSyncing: false,
      lastSync: null,
      syncedItems: 0,
      totalItems: 0,
      error: null,
      status: 'idle',
    };
  }

  /**
   * Initialize cloud sync with a backend
   */
  async initializeBackend(
    backend: 'firebase' | 'supabase' | 'custom',
    config: Record<string, any>
  ): Promise<boolean> {
    try {
      this.config.backend = backend;
      Object.assign(this.config, config);
      this.config.enabled = true;
      this.saveConfig();

      // Test connection
      await this.testConnection();

      return true;
    } catch (error) {
      this.setError(`Failed to initialize ${backend}: ${error}`);
      return false;
    }
  }

  /**
   * Test cloud backend connection
   */
  private async testConnection(): Promise<void> {
    if (!this.config.backend) {
      throw new Error('No backend configured');
    }

    switch (this.config.backend) {
      case 'firebase':
        // Would test Firebase connection
        break;
      case 'supabase':
        // Would test Supabase connection
        break;
      case 'custom':
        if (!this.config.customEndpoint) {
          throw new Error('Custom endpoint not configured');
        }
        const response = await fetch(`${this.config.customEndpoint}/health`);
        if (!response.ok) {
          throw new Error('Cloud endpoint unreachable');
        }
        break;
    }
  }

  /**
   * Sync data to cloud
   */
  async syncToCloud(data: SyncData): Promise<boolean> {
    if (!this.config.enabled || !this.config.backend) {
      return false;
    }

    this.updateStatus({
      isSyncing: true,
      status: 'syncing',
    });

    try {
      const syncData = {
        ...data,
        userId: this.config.userId,
        timestamp: Date.now(),
      };

      switch (this.config.backend) {
        case 'firebase':
          await this.syncViaFirebase(syncData);
          break;
        case 'supabase':
          await this.syncViaSupabase(syncData);
          break;
        case 'custom':
          await this.syncViaCustomEndpoint(syncData);
          break;
      }

      this.config.lastSyncTime = Date.now();
      this.saveConfig();

      this.updateStatus({
        isSyncing: false,
        lastSync: Date.now(),
        status: 'success',
        error: null,
        syncedItems: data.presets.length + data.gallery.length,
      });

      return true;
    } catch (error) {
      this.setError(`Sync failed: ${error}`);
      return false;
    }
  }

  /**
   * Sync data from cloud
   */
  async syncFromCloud(): Promise<SyncData | null> {
    if (!this.config.enabled || !this.config.backend) {
      return null;
    }

    this.updateStatus({
      isSyncing: true,
      status: 'syncing',
    });

    try {
      let data: SyncData;

      switch (this.config.backend) {
        case 'firebase':
          data = await this.fetchFromFirebase();
          break;
        case 'supabase':
          data = await this.fetchFromSupabase();
          break;
        case 'custom':
          data = await this.fetchFromCustomEndpoint();
          break;
        default:
          throw new Error('Unknown backend');
      }

      this.config.lastSyncTime = Date.now();
      this.saveConfig();

      this.updateStatus({
        isSyncing: false,
        lastSync: Date.now(),
        status: 'success',
        error: null,
        totalItems: data.presets.length + data.gallery.length,
      });

      return data;
    } catch (error) {
      this.setError(`Fetch failed: ${error}`);
      return null;
    }
  }

  /**
   * Firebase sync implementation
   */
  private async syncViaFirebase(data: SyncData): Promise<void> {
    // In a real implementation, this would use Firebase SDK
    console.log('Would sync to Firebase:', data);
    // throw new Error('Firebase sync not yet implemented');
  }

  /**
   * Firebase fetch implementation
   */
  private async fetchFromFirebase(): Promise<SyncData> {
    // In a real implementation, this would use Firebase SDK
    throw new Error('Firebase fetch not yet implemented');
  }

  /**
   * Supabase sync implementation
   */
  private async syncViaSupabase(data: SyncData): Promise<void> {
    const response = await fetch(
      `https://${this.config.projectId}.supabase.co/rest/v1/sync`,
      {
        method: 'POST',
        headers: {
          'apikey': this.config.apiKey || '',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Supabase sync failed: ${response.statusText}`);
    }
  }

  /**
   * Supabase fetch implementation
   */
  private async fetchFromSupabase(): Promise<SyncData> {
    const response = await fetch(
      `https://${this.config.projectId}.supabase.co/rest/v1/sync?user_id=eq.${this.config.userId}`,
      {
        headers: {
          'apikey': this.config.apiKey || '',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Supabase fetch failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data[0] || this.getEmptySyncData();
  }

  /**
   * Custom endpoint sync implementation
   */
  private async syncViaCustomEndpoint(data: SyncData): Promise<void> {
    const response = await fetch(`${this.config.customEndpoint}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey || '',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Custom endpoint sync failed: ${response.statusText}`);
    }
  }

  /**
   * Custom endpoint fetch implementation
   */
  private async fetchFromCustomEndpoint(): Promise<SyncData> {
    const response = await fetch(`${this.config.customEndpoint}/sync`, {
      headers: {
        'X-API-Key': this.config.apiKey || '',
      },
    });

    if (!response.ok) {
      throw new Error(`Custom endpoint fetch failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get empty sync data
   */
  private getEmptySyncData(): SyncData {
    return {
      presets: [],
      gallery: [],
      settings: {},
      timestamp: Date.now(),
      version: SYNC_VERSION,
    };
  }

  /**
   * Get current config
   */
  getConfig(): CloudSyncConfig {
    return { ...this.config };
  }

  /**
   * Update config
   */
  setConfig(config: Partial<CloudSyncConfig>): void {
    this.config = { ...this.config, ...config };
    this.saveConfig();
  }

  /**
   * Get sync status
   */
  getStatus(): CloudSyncStatus {
    return { ...this.status };
  }

  /**
   * Start auto-sync
   */
  startAutoSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }

    this.syncIntervalId = setInterval(() => {
      this.syncToCloud(this.getEmptySyncData());
    }, this.config.syncInterval);
  }

  /**
   * Stop auto-sync
   */
  stopAutoSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  /**
   * Subscribe to status changes
   */
  onStatusChange(observer: (status: CloudSyncStatus) => void): () => void {
    this.observers.push(observer);
    return () => {
      this.observers = this.observers.filter(o => o !== observer);
    };
  }

  /**
   * Update status and notify observers
   */
  private updateStatus(partial: Partial<CloudSyncStatus>): void {
    this.status = { ...this.status, ...partial };
    this.saveStatus();
    this.notifyObservers();
  }

  /**
   * Set error status
   */
  private setError(error: string): void {
    this.updateStatus({
      isSyncing: false,
      status: 'error',
      error,
    });
  }

  /**
   * Notify all observers
   */
  private notifyObservers(): void {
    this.observers.forEach(observer => observer(this.status));
  }

  /**
   * Save config to localStorage
   */
  private saveConfig(): void {
    localStorage.setItem(CLOUD_SYNC_KEY, JSON.stringify(this.config));
  }

  /**
   * Save status to localStorage
   */
  private saveStatus(): void {
    localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(this.status));
  }

  /**
   * Disable cloud sync
   */
  disable(): void {
    this.config.enabled = false;
    this.stopAutoSync();
    this.saveConfig();
  }

  /**
   * Enable cloud sync
   */
  enable(): void {
    if (this.config.backend) {
      this.config.enabled = true;
      if (this.config.autoSync) {
        this.startAutoSync();
      }
      this.saveConfig();
    }
  }

  /**
   * Clear all cloud sync data
   */
  clearSync(): void {
    localStorage.removeItem(CLOUD_SYNC_KEY);
    localStorage.removeItem(SYNC_STATUS_KEY);
    this.config = this.getDefaultConfig();
    this.status = this.getDefaultStatus();
    this.stopAutoSync();
  }
}

export const cloudSyncService = new CloudSyncService();
