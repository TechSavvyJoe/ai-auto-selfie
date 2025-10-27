/**
 * Keyboard Shortcuts Service
 * Manage and execute keyboard shortcuts globally
 */

export interface KeyboardShortcut {
  id: string;
  keys: string[];
  label: string;
  description: string;
  category: 'editing' | 'navigation' | 'view' | 'general';
  action: () => void;
  enabled: boolean;
}

export interface ShortcutConfig {
  enabledCategories: Set<string>;
  customShortcuts: Map<string, KeyboardShortcut>;
  globalEnabled: boolean;
}

class ShortcutsService {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private config: ShortcutConfig;
  private listeners: Set<(shortcut: KeyboardShortcut) => void> = new Set();
  private keydownListener: ((e: KeyboardEvent) => void) | null = null;
  private pressedKeys: Set<string> = new Set();

  constructor() {
    this.config = {
      enabledCategories: new Set(['editing', 'navigation', 'view', 'general']),
      customShortcuts: new Map(),
      globalEnabled: true,
    };

    this.registerDefaultShortcuts();
    this.loadConfig();
  }

  /**
   * Register default shortcuts
   */
  private registerDefaultShortcuts(): void {
    this.registerShortcut({
      id: 'undo',
      keys: ['ctrl', 'z'],
      label: 'Undo',
      description: 'Undo last action',
      category: 'editing',
      action: () => console.log('Undo'),
      enabled: true,
    });

    this.registerShortcut({
      id: 'redo',
      keys: ['ctrl', 'shift', 'z'],
      label: 'Redo',
      description: 'Redo last action',
      category: 'editing',
      action: () => console.log('Redo'),
      enabled: true,
    });

    this.registerShortcut({
      id: 'save',
      keys: ['ctrl', 's'],
      label: 'Save',
      description: 'Save current image',
      category: 'editing',
      action: () => console.log('Save'),
      enabled: true,
    });

    this.registerShortcut({
      id: 'export',
      keys: ['ctrl', 'shift', 's'],
      label: 'Export',
      description: 'Export image',
      category: 'editing',
      action: () => console.log('Export'),
      enabled: true,
    });

    this.registerShortcut({
      id: 'escape',
      keys: ['escape'],
      label: 'Close/Cancel',
      description: 'Close dialog or cancel action',
      category: 'general',
      action: () => console.log('Close'),
      enabled: true,
    });

    this.registerShortcut({
      id: 'delete',
      keys: ['delete'],
      label: 'Delete',
      description: 'Delete selected item',
      category: 'general',
      action: () => console.log('Delete'),
      enabled: true,
    });

    this.registerShortcut({
      id: 'zoomIn',
      keys: ['ctrl', 'plus'],
      label: 'Zoom In',
      description: 'Zoom image in',
      category: 'view',
      action: () => console.log('Zoom In'),
      enabled: true,
    });

    this.registerShortcut({
      id: 'zoomOut',
      keys: ['ctrl', 'minus'],
      label: 'Zoom Out',
      description: 'Zoom image out',
      category: 'view',
      action: () => console.log('Zoom Out'),
      enabled: true,
    });

    this.registerShortcut({
      id: 'resetZoom',
      keys: ['ctrl', '0'],
      label: 'Reset Zoom',
      description: 'Reset zoom to 100%',
      category: 'view',
      action: () => console.log('Reset Zoom'),
      enabled: true,
    });

    this.registerShortcut({
      id: 'gallery',
      keys: ['ctrl', 'g'],
      label: 'Open Gallery',
      description: 'Open gallery view',
      category: 'navigation',
      action: () => console.log('Gallery'),
      enabled: true,
    });

    this.registerShortcut({
      id: 'camera',
      keys: ['ctrl', 'n'],
      label: 'New Photo',
      description: 'Take new photo',
      category: 'navigation',
      action: () => console.log('Camera'),
      enabled: true,
    });

    this.registerShortcut({
      id: 'togglePreview',
      keys: ['space'],
      label: 'Toggle Preview',
      description: 'Toggle before/after preview',
      category: 'view',
      action: () => console.log('Toggle Preview'),
      enabled: true,
    });

    this.registerShortcut({
      id: 'help',
      keys: ['f1'],
      label: 'Help',
      description: 'Show help/shortcuts',
      category: 'general',
      action: () => console.log('Help'),
      enabled: true,
    });
  }

  /**
   * Register a keyboard shortcut
   */
  registerShortcut(shortcut: KeyboardShortcut): void {
    this.shortcuts.set(shortcut.id, shortcut);
    this.saveConfig();
  }

  /**
   * Unregister a shortcut
   */
  unregisterShortcut(id: string): void {
    this.shortcuts.delete(id);
    this.saveConfig();
  }

  /**
   * Get shortcut by ID
   */
  getShortcut(id: string): KeyboardShortcut | undefined {
    return this.shortcuts.get(id);
  }

  /**
   * Get all shortcuts
   */
  getAllShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Get shortcuts by category
   */
  getShortcutsByCategory(category: string): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values()).filter(s => s.category === category);
  }

  /**
   * Update shortcut keys
   */
  updateShortcutKeys(id: string, keys: string[]): boolean {
    const shortcut = this.shortcuts.get(id);
    if (!shortcut) return false;

    shortcut.keys = keys;
    this.saveConfig();
    return true;
  }

  /**
   * Enable/disable shortcut
   */
  setShortcutEnabled(id: string, enabled: boolean): void {
    const shortcut = this.shortcuts.get(id);
    if (shortcut) {
      shortcut.enabled = enabled;
      this.saveConfig();
    }
  }

  /**
   * Enable/disable category
   */
  setCategoryEnabled(category: string, enabled: boolean): void {
    if (enabled) {
      this.config.enabledCategories.add(category);
    } else {
      this.config.enabledCategories.delete(category);
    }
    this.saveConfig();
  }

  /**
   * Enable/disable all shortcuts
   */
  setGlobalEnabled(enabled: boolean): void {
    this.config.globalEnabled = enabled;
    if (enabled) {
      this.attachKeyListener();
    } else {
      this.detachKeyListener();
    }
    this.saveConfig();
  }

  /**
   * Attach global key listener
   */
  attachKeyListener(): void {
    if (this.keydownListener) return;

    this.keydownListener = (e: KeyboardEvent) => {
      if (!this.config.globalEnabled) return;

      // Track pressed keys
      const key = e.key.toLowerCase();
      if (e.ctrlKey) this.pressedKeys.add('ctrl');
      if (e.shiftKey) this.pressedKeys.add('shift');
      if (e.altKey) this.pressedKeys.add('alt');
      if (e.metaKey) this.pressedKeys.add('meta');

      // Add the actual key
      if (!['control', 'shift', 'alt', 'meta'].includes(key)) {
        this.pressedKeys.add(key);
      }

      // Check for shortcut match
      this.checkShortcuts();
    };

    const keyupListener = () => {
      this.pressedKeys.clear();
    };

    document.addEventListener('keydown', this.keydownListener);
    document.addEventListener('keyup', keyupListener);
  }

  /**
   * Detach global key listener
   */
  detachKeyListener(): void {
    if (!this.keydownListener) return;
    document.removeEventListener('keydown', this.keydownListener);
    this.keydownListener = null;
  }

  /**
   * Check if any shortcuts match current pressed keys
   */
  private checkShortcuts(): void {
    for (const shortcut of this.shortcuts.values()) {
      if (!shortcut.enabled) continue;
      if (!this.config.enabledCategories.has(shortcut.category)) continue;

      // Check if keys match
      const shortcutKeys = new Set(shortcut.keys.map(k => k.toLowerCase()));
      if (this.keysMatch(shortcutKeys, this.pressedKeys)) {
        shortcut.action();
        this.notifyListeners(shortcut);
      }
    }
  }

  /**
   * Check if two key sets match
   */
  private keysMatch(shortcutKeys: Set<string>, pressedKeys: Set<string>): boolean {
    if (shortcutKeys.size !== pressedKeys.size) return false;

    for (const key of shortcutKeys) {
      if (!pressedKeys.has(key)) return false;
    }

    return true;
  }

  /**
   * Subscribe to shortcut executions
   */
  onShortcutExecuted(listener: (shortcut: KeyboardShortcut) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify listeners
   */
  private notifyListeners(shortcut: KeyboardShortcut): void {
    this.listeners.forEach(listener => listener(shortcut));
  }

  /**
   * Save config to localStorage
   */
  private saveConfig(): void {
    try {
      const data = {
        enabledCategories: Array.from(this.config.enabledCategories),
        globalEnabled: this.config.globalEnabled,
        shortcuts: Array.from(this.shortcuts.values()).map(s => ({
          id: s.id,
          keys: s.keys,
          enabled: s.enabled,
        })),
      };

      localStorage.setItem('shortcutsConfig', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save shortcuts config:', error);
    }
  }

  /**
   * Load config from localStorage
   */
  private loadConfig(): void {
    try {
      const json = localStorage.getItem('shortcutsConfig');
      if (!json) return;

      const data = JSON.parse(json);

      if (data.enabledCategories) {
        this.config.enabledCategories = new Set(data.enabledCategories);
      }

      if (data.globalEnabled !== undefined) {
        this.config.globalEnabled = data.globalEnabled;
      }

      if (data.shortcuts) {
        data.shortcuts.forEach((saved: any) => {
          const shortcut = this.shortcuts.get(saved.id);
          if (shortcut) {
            shortcut.keys = saved.keys;
            shortcut.enabled = saved.enabled;
          }
        });
      }

      if (this.config.globalEnabled) {
        this.attachKeyListener();
      }
    } catch (error) {
      console.error('Failed to load shortcuts config:', error);
    }
  }

  /**
   * Get keyboard shortcut help text
   */
  getHelpText(): string {
    const categories = new Map<string, KeyboardShortcut[]>();

    for (const shortcut of this.shortcuts.values()) {
      if (!shortcut.enabled) continue;

      if (!categories.has(shortcut.category)) {
        categories.set(shortcut.category, []);
      }
      categories.get(shortcut.category)!.push(shortcut);
    }

    let help = '⌨️ Keyboard Shortcuts\n\n';

    for (const [category, shortcuts] of categories) {
      help += `${category.toUpperCase()}\n`;
      for (const shortcut of shortcuts) {
        const keys = shortcut.keys.map(k => k.toUpperCase()).join(' + ');
        help += `  ${keys} - ${shortcut.description}\n`;
      }
      help += '\n';
    }

    return help;
  }

  /**
   * Reset to default shortcuts
   */
  resetToDefaults(): void {
    this.shortcuts.clear();
    this.registerDefaultShortcuts();
    this.saveConfig();
  }
}

// Singleton instance
let instance: ShortcutsService | null = null;

export function getShortcutsService(): ShortcutsService {
  if (!instance) {
    instance = new ShortcutsService();
  }
  return instance;
}

export function resetShortcutsService(): void {
  if (instance) {
    instance.detachKeyListener();
    instance = null;
  }
}
