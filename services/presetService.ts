/**
 * Preset Service - Manage custom preset combinations
 */

export interface PresetCombination {
  id: string;
  name: string;
  description?: string;
  category?: string;
  tags: string[];
  createdAt: number;
  usageCount: number;
  adjustments?: any;
  editOptions?: any;
}

class PresetService {
  private readonly STORAGE_KEY = 'ai_auto_selfie_presets';
  private readonly MAX_PRESETS = 50;
  presets: PresetCombination[] = [];

  constructor() {
    this.loadFromStorage();
  }

  createPreset(name: string, adjustments?: any, options?: any, tags: string[] = []): PresetCombination {
    const preset: PresetCombination = {
      id: `preset-` + Date.now() + `-` + Math.random().toString(36).substr(2, 9),
      name,
      description: options?.description,
      category: options?.category,
      tags: tags.length > 0 ? tags : options?.tags || [],
      createdAt: Date.now(),
      usageCount: 0,
      adjustments,
      editOptions: options?.editOptions,
    };

    this.addPreset(preset);
    return preset;
  }

  private addPreset(preset: PresetCombination): void {
    if (this.presets.length >= this.MAX_PRESETS) {
      const leastUsed = this.presets.reduce((prev, current) =>
        prev.usageCount < current.usageCount ? prev : current
      );
      this.presets = this.presets.filter((p) => p.id !== leastUsed.id);
    }
    this.presets.push(preset);
    this.saveToStorage();
  }

  getAllPresets(): PresetCombination[] {
    return [...this.presets];
  }

  getPreset(id: string): PresetCombination | undefined {
    return this.presets.find((p) => p.id === id);
  }

  getFavorites(): PresetCombination[] {
    return this.presets.sort((a, b) => b.usageCount - a.usageCount).slice(0, 10);
  }

  getRecent(limit: number = 5): PresetCombination[] {
    return [...this.presets]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  getTrending(limit: number = 5): PresetCombination[] {
    return [...this.presets]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  getByTag(tag: string): PresetCombination[] {
    return this.presets.filter((p) => p.tags.includes(tag.toLowerCase()));
  }

  search(query: string): PresetCombination[] {
    const lowercased = query.toLowerCase();
    return this.presets.filter(
      (p) => p.name.toLowerCase().includes(lowercased) || (p.description || '').toLowerCase().includes(lowercased)
    );
  }

  recordUsage(id: string): void {
    const preset = this.presets.find((p) => p.id === id);
    if (preset) {
      preset.usageCount++;
      this.saveToStorage();
    }
  }

  usePreset(id: string): void {
    this.recordUsage(id);
  }

  toggleFavorite(id: string): void {
    const preset = this.presets.find((p) => p.id === id);
    if (preset) {
      preset.usageCount = Math.max(0, preset.usageCount - 1);
      this.saveToStorage();
    }
  }

  updatePreset(id: string, updates: Partial<PresetCombination>): void {
    const preset = this.presets.find((p) => p.id === id);
    if (preset) {
      Object.assign(preset, updates);
      this.saveToStorage();
    }
  }

  deletePreset(id: string): void {
    this.presets = this.presets.filter((p) => p.id !== id);
    this.saveToStorage();
  }

  duplicatePreset(id: string, newName?: string): PresetCombination | undefined {
    const original = this.getPreset(id);
    if (!original) return undefined;
    const duplicate = this.createPreset(
      newName || `${original.name} (Copy)`,
      JSON.parse(JSON.stringify(original.adjustments)),
      { ...original.editOptions, description: original.description },
      [...original.tags]
    );
    return duplicate;
  }

  exportPreset(id: string): string | null {
    const preset = this.getPreset(id);
    return preset ? JSON.stringify(preset, null, 2) : null;
  }

  importPreset(json: string): PresetCombination | null {
    try {
      const data = JSON.parse(json);
      const preset: PresetCombination = {
        ...data,
        id: `preset-` + Date.now() + `-` + Math.random().toString(36).substr(2, 9),
        createdAt: Date.now(),
        usageCount: 0,
      };
      this.addPreset(preset);
      return preset;
    } catch (error) {
      console.error('Failed to import preset:', error);
      return null;
    }
  }

  getAllTags(): string[] {
    const tags = new Set<string>();
    this.presets.forEach((p) => p.tags.forEach((t) => tags.add(t.toLowerCase())));
    return Array.from(tags).sort();
  }

  clearAll(): void {
    this.presets = [];
    this.saveToStorage();
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.presets));
    } catch (error) {
      console.error('Failed to save presets:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        this.presets = JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load presets:', error);
      this.presets = [];
    }
  }

  getStatistics() {
    if (this.presets.length === 0) {
      return { totalPresets: 0, favoriteCount: 0, totalUsages: 0 };
    }
    return {
      totalPresets: this.presets.length,
      favoriteCount: this.presets.filter((p) => p.usageCount > 0).length,
      totalUsages: this.presets.reduce((sum, p) => sum + p.usageCount, 0),
    };
  }
}

let instance: PresetService | null = null;

export const getPresetService = (): PresetService => {
  if (!instance) {
    instance = new PresetService();
  }
  return instance;
};

export default PresetService;
