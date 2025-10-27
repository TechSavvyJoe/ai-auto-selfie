/**
 * Preset Manager Service
 * Save, load, and manage custom editing presets
 * Team collaboration through preset sharing
 */

import { ImageAdjustments, EditOptions } from '../types';
import { DEFAULT_PRESETS } from '../data/defaultPresets';

export interface Preset {
  id: string;
  name: string;
  description: string;
  category: string;
  adjustments: ImageAdjustments;
  editOptions?: Partial<EditOptions>;
  thumbnail?: string; // Base64 image
  createdAt: number;
  updatedAt: number;
  author?: string;
  isPublic: boolean;
  uses: number; // How many times used
  tags: string[];
  isFavorite: boolean;
}

export interface PresetCategory {
  name: string;
  icon: string;
  description: string;
}

const PRESET_STORAGE_KEY = 'dealership_presets';
const MAX_PRESETS = 100;

/**
 * Manage user presets
 */
export class PresetManager {
  private presets: Map<string, Preset> = new Map();
  private listeners: Set<(presets: Preset[]) => void> = new Set();

  constructor() {
    this.loadFromStorage();
    // Initialize with defaults if first time or no presets loaded
    if (this.presets.size === 0) {
      this.initializeDefaults();
    }
  }

  /**
   * Initialize with default presets on first load
   */
  private initializeDefaults(): void {
    DEFAULT_PRESETS.forEach((preset) => {
      const id = `default-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      this.presets.set(id, {
        ...preset,
        id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        uses: 0,
      } as Preset);
    });
    this.saveToStorage();
  }

  /**
   * Create a new preset
   */
  createPreset(
    name: string,
    adjustments: ImageAdjustments,
    options?: {
      description?: string;
      category?: string;
      thumbnail?: string;
      editOptions?: Partial<EditOptions>;
      tags?: string[];
    }
  ): Preset {
    const id = `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const preset: Preset = {
      id,
      name,
      description: options?.description || '',
      category: options?.category || 'custom',
      adjustments,
      editOptions: options?.editOptions,
      thumbnail: options?.thumbnail,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      author: 'You',
      isPublic: false,
      uses: 0,
      tags: options?.tags || [],
      isFavorite: false,
    };

    if (this.presets.size >= MAX_PRESETS) {
      throw new Error(`Maximum ${MAX_PRESETS} presets reached`);
    }

    this.presets.set(id, preset);
    this.saveToStorage();
    this.notifyListeners();

    return preset;
  }

  /**
   * Update an existing preset
   */
  updatePreset(id: string, updates: Partial<Preset>): Preset | null {
    const preset = this.presets.get(id);
    if (!preset) return null;

    const updated = {
      ...preset,
      ...updates,
      id: preset.id, // Prevent ID change
      createdAt: preset.createdAt, // Preserve creation time
      updatedAt: Date.now(),
    };

    this.presets.set(id, updated);
    this.saveToStorage();
    this.notifyListeners();

    return updated;
  }

  /**
   * Delete a preset
   */
  deletePreset(id: string): boolean {
    const deleted = this.presets.delete(id);
    if (deleted) {
      this.saveToStorage();
      this.notifyListeners();
    }
    return deleted;
  }

  /**
   * Get preset by ID
   */
  getPreset(id: string): Preset | undefined {
    return this.presets.get(id);
  }

  /**
   * Get all presets
   */
  getAllPresets(): Preset[] {
    return Array.from(this.presets.values());
  }

  /**
   * Get presets by category
   */
  getByCategory(category: string): Preset[] {
    return this.getAllPresets().filter((p) => p.category === category);
  }

  /**
   * Get favorite presets
   */
  getFavorites(): Preset[] {
    return this.getAllPresets().filter((p) => p.isFavorite);
  }

  /**
   * Search presets by name/description/tags
   */
  search(query: string): Preset[] {
    const q = query.toLowerCase();
    return this.getAllPresets().filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(id: string): boolean {
    const preset = this.presets.get(id);
    if (!preset) return false;

    preset.isFavorite = !preset.isFavorite;
    this.saveToStorage();
    this.notifyListeners();

    return preset.isFavorite;
  }

  /**
   * Increment usage count
   */
  recordUsage(id: string): void {
    const preset = this.presets.get(id);
    if (preset) {
      preset.uses++;
      preset.updatedAt = Date.now();
      this.saveToStorage();
    }
  }

  /**
   * Get most used presets
   */
  getMostUsed(limit: number = 5): Preset[] {
    return this.getAllPresets()
      .sort((a, b) => b.uses - a.uses)
      .slice(0, limit);
  }

  /**
   * Duplicate a preset
   */
  duplicatePreset(id: string, newName?: string): Preset | null {
    const original = this.presets.get(id);
    if (!original) return null;

    return this.createPreset(newName || `${original.name} (Copy)`, original.adjustments, {
      description: original.description,
      category: original.category,
      tags: original.tags,
    });
  }

  /**
   * Export presets as JSON
   */
  exportAsJSON(): string {
    return JSON.stringify(
      {
        version: 1,
        exportDate: new Date().toISOString(),
        presets: this.getAllPresets(),
      },
      null,
      2
    );
  }

  /**
   * Import presets from JSON
   */
  importFromJSON(jsonString: string): { success: number; failed: number } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.presets || !Array.isArray(data.presets)) {
        throw new Error('Invalid preset format');
      }

      let success = 0;
      let failed = 0;

      data.presets.forEach((preset: any) => {
        try {
          if (this.presets.size >= MAX_PRESETS) {
            failed++;
            return;
          }

          preset.id = `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          preset.createdAt = Date.now();
          preset.updatedAt = Date.now();
          this.presets.set(preset.id, preset);
          success++;
        } catch {
          failed++;
        }
      });

      if (success > 0) {
        this.saveToStorage();
        this.notifyListeners();
      }

      return { success, failed };
    } catch (error) {
      throw new Error(`Failed to import presets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear all presets
   */
  clearAll(): void {
    this.presets.clear();
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Subscribe to preset changes
   */
  subscribe(listener: (presets: Preset[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private saveToStorage(): void {
    try {
      const data = {
        version: 1,
        presets: Array.from(this.presets.values()),
      };
      localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save presets:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(PRESET_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.presets && Array.isArray(data.presets)) {
          data.presets.forEach((preset: Preset) => {
            this.presets.set(preset.id, preset);
          });
        }
      }
    } catch (error) {
      console.error('Failed to load presets:', error);
    }
  }

  private notifyListeners(): void {
    const presets = this.getAllPresets();
    this.listeners.forEach((listener) => listener(presets));
  }
}

/**
 * React hook for preset management
 */
export const usePresets = () => {
  const [presetManager] = React.useState(() => new PresetManager());
  const [presets, setPresets] = React.useState<Preset[]>(presetManager.getAllPresets());

  React.useEffect(() => {
    return presetManager.subscribe((newPresets) => {
      setPresets(newPresets);
    });
  }, [presetManager]);

  return {
    presets,
    createPreset: (name: string, adjustments: ImageAdjustments, options?: any) =>
      presetManager.createPreset(name, adjustments, options),
    updatePreset: (id: string, updates: Partial<Preset>) =>
      presetManager.updatePreset(id, updates),
    deletePreset: (id: string) => presetManager.deletePreset(id),
    getPreset: (id: string) => presetManager.getPreset(id),
    getByCategory: (category: string) => presetManager.getByCategory(category),
    getFavorites: () => presetManager.getFavorites(),
    search: (query: string) => presetManager.search(query),
    toggleFavorite: (id: string) => presetManager.toggleFavorite(id),
    recordUsage: (id: string) => presetManager.recordUsage(id),
    getMostUsed: (limit?: number) => presetManager.getMostUsed(limit),
    duplicatePreset: (id: string, newName?: string) =>
      presetManager.duplicatePreset(id, newName),
    exportAsJSON: () => presetManager.exportAsJSON(),
    importFromJSON: (json: string) => presetManager.importFromJSON(json),
    clearAll: () => presetManager.clearAll(),
  };
};

import React from 'react';
