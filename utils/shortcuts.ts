/**
 * Professional Keyboard Shortcuts System
 * Shortcuts for power users, customizable, with help modal
 * Similar to Figma, Photoshop, professional tools
 */

export interface Shortcut {
  name: string;
  description: string;
  keys: string[];
  action: () => void;
  enabled: boolean;
  category: 'navigation' | 'editing' | 'export' | 'view' | 'misc';
}

export interface ShortcutBinding {
  name: string;
  keys: string[];
  action: () => void;
}

const DEFAULT_SHORTCUTS: Record<string, ShortcutBinding> = {
  // Navigation
  'undo': { name: 'Undo', keys: ['Cmd+Z', 'Ctrl+Z'], action: () => {} },
  'redo': { name: 'Redo', keys: ['Cmd+Shift+Z', 'Ctrl+Y'], action: () => {} },
  'home': { name: 'Go Home', keys: ['Cmd+H', 'Ctrl+H'], action: () => {} },
  'next': { name: 'Next Step', keys: ['Cmd+Right', 'Ctrl+Right'], action: () => {} },
  'prev': { name: 'Previous Step', keys: ['Cmd+Left', 'Ctrl+Left'], action: () => {} },

  // Editing
  'reset': { name: 'Reset Adjustments', keys: ['Cmd+R', 'Ctrl+R'], action: () => {} },
  'capture': { name: 'Capture Photo', keys: ['Space', 'Enter'], action: () => {} },
  'enhance': { name: 'Enhance Image', keys: ['Cmd+E', 'Ctrl+E'], action: () => {} },
  'copy': { name: 'Copy to Clipboard', keys: ['Cmd+C', 'Ctrl+C'], action: () => {} },

  // Export
  'export': { name: 'Export Image', keys: ['Cmd+S', 'Ctrl+S'], action: () => {} },
  'share': { name: 'Share', keys: ['Cmd+K', 'Ctrl+K'], action: () => {} },

  // View
  'fullscreen': { name: 'Fullscreen', keys: ['F'], action: () => {} },
  'help': { name: 'Help / Shortcuts', keys: ['?'], action: () => {} },
  'toggle_theme': { name: 'Toggle Dark/Light', keys: ['Cmd+L', 'Ctrl+L'], action: () => {} },

  // Gallery
  'gallery': { name: 'Open Gallery', keys: ['G'], action: () => {} },
  'delete': { name: 'Delete', keys: ['Delete', 'Backspace'], action: () => {} },
};

/**
 * Keyboard shortcut manager
 */
export class ShortcutManager {
  private shortcuts: Map<string, Shortcut> = new Map();
  private listeners: Set<() => void> = new Set();
  private isListening = false;
  private customBindings: Map<string, string[]> = new Map();

  constructor() {
    this.loadCustomBindings();
    this.initializeDefaultShortcuts();
    this.setupKeyboardListener();
  }

  /**
   * Register a shortcut
   */
  register(id: string, shortcut: Shortcut): void {
    this.shortcuts.set(id, { ...shortcut, enabled: true });
    this.notifyListeners();
  }

  /**
   * Register multiple shortcuts at once
   */
  registerMultiple(shortcuts: Record<string, Shortcut>): void {
    Object.entries(shortcuts).forEach(([id, shortcut]) => {
      this.register(id, shortcut);
    });
  }

  /**
   * Unregister a shortcut
   */
  unregister(id: string): void {
    this.shortcuts.delete(id);
    this.notifyListeners();
  }

  /**
   * Enable/disable a shortcut
   */
  setEnabled(id: string, enabled: boolean): void {
    const shortcut = this.shortcuts.get(id);
    if (shortcut) {
      shortcut.enabled = enabled;
      this.notifyListeners();
    }
  }

  /**
   * Rebind a shortcut
   */
  rebind(id: string, newKeys: string[]): void {
    const shortcut = this.shortcuts.get(id);
    if (shortcut) {
      shortcut.keys = newKeys;
      this.customBindings.set(id, newKeys);
      this.saveCustomBindings();
      this.notifyListeners();
    }
  }

  /**
   * Get all shortcuts
   */
  getAllShortcuts(): Shortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Get shortcuts by category
   */
  getByCategory(category: string): Shortcut[] {
    return this.getAllShortcuts().filter((s) => s.category === category);
  }

  /**
   * Get shortcut by ID
   */
  getShortcut(id: string): Shortcut | undefined {
    return this.shortcuts.get(id);
  }

  /**
   * Check if key combination matches a shortcut
   */
  matches(id: string, event: KeyboardEvent): boolean {
    const shortcut = this.shortcuts.get(id);
    if (!shortcut || !shortcut.enabled) return false;

    return shortcut.keys.some((keyCombo) => this.keyComboMatches(keyCombo, event));
  }

  /**
   * Trigger a shortcut
   */
  trigger(id: string): void {
    const shortcut = this.shortcuts.get(id);
    if (shortcut && shortcut.enabled) {
      shortcut.action();
    }
  }

  /**
   * Get help text for display
   */
  getHelpText(): ShortcutHelpGroup[] {
    const categories: Record<string, Shortcut[]> = {};

    this.getAllShortcuts().forEach((shortcut) => {
      if (!categories[shortcut.category]) {
        categories[shortcut.category] = [];
      }
      categories[shortcut.category].push(shortcut);
    });

    return Object.entries(categories).map(([category, shortcuts]) => ({
      category: this.formatCategory(category),
      shortcuts: shortcuts
        .filter((s) => s.enabled)
        .map((s) => ({
          keys: s.keys,
          description: s.description,
        })),
    }));
  }

  /**
   * Export shortcuts as JSON
   */
  export(): string {
    return JSON.stringify(
      {
        version: 1,
        shortcuts: Array.from(this.shortcuts.entries()).map(([id, shortcut]) => ({
          id,
          name: shortcut.name,
          description: shortcut.description,
          keys: shortcut.keys,
          category: shortcut.category,
        })),
      },
      null,
      2
    );
  }

  /**
   * Reset to default shortcuts
   */
  resetToDefaults(): void {
    this.customBindings.clear();
    localStorage.removeItem('custom_shortcuts');
    this.shortcuts.forEach((shortcut) => {
      const defaultBinding = DEFAULT_SHORTCUTS[shortcut.name.toLowerCase()];
      if (defaultBinding) {
        shortcut.keys = defaultBinding.keys;
      }
    });
    this.notifyListeners();
  }

  /**
   * Subscribe to changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private initializeDefaultShortcuts(): void {
    const shortcuts: Record<string, Shortcut> = {
      undo: {
        name: 'Undo',
        description: 'Undo last action',
        keys: ['Cmd+Z', 'Ctrl+Z'],
        action: () => {},
        enabled: true,
        category: 'editing',
      },
      redo: {
        name: 'Redo',
        description: 'Redo last action',
        keys: ['Cmd+Shift+Z', 'Ctrl+Y'],
        action: () => {},
        enabled: true,
        category: 'editing',
      },
      home: {
        name: 'Home',
        description: 'Go to home screen',
        keys: ['Cmd+H', 'Ctrl+H'],
        action: () => {},
        enabled: true,
        category: 'navigation',
      },
      export: {
        name: 'Export',
        description: 'Export image',
        keys: ['Cmd+S', 'Ctrl+S'],
        action: () => {},
        enabled: true,
        category: 'export',
      },
      gallery: {
        name: 'Gallery',
        description: 'Open gallery',
        keys: ['G'],
        action: () => {},
        enabled: true,
        category: 'navigation',
      },
      help: {
        name: 'Help',
        description: 'Show keyboard shortcuts',
        keys: ['?'],
        action: () => {},
        enabled: true,
        category: 'misc',
      },
    };

    this.registerMultiple(shortcuts);
  }

  private setupKeyboardListener(): void {
    if (this.isListening) return;

    window.addEventListener('keydown', (event) => {
      // Don't trigger shortcuts in form inputs
      const target = event.target as HTMLElement;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      if (isInput && !['?'].includes(event.key)) return;

      // Check all shortcuts
      this.shortcuts.forEach((shortcut, id) => {
        if (this.matches(id, event)) {
          event.preventDefault();
          this.trigger(id);
        }
      });
    });

    this.isListening = true;
  }

  private keyComboMatches(keyCombo: string, event: KeyboardEvent): boolean {
    const parts = keyCombo.toLowerCase().split('+');
    const hasCmd = parts.includes('cmd') || parts.includes('ctrl');
    const hasShift = parts.includes('shift');
    const hasAlt = parts.includes('alt');
    const key = parts[parts.length - 1];

    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
    const cmdKey = isMac ? event.metaKey : event.ctrlKey;

    return (
      cmdKey === hasCmd &&
      event.shiftKey === hasShift &&
      event.altKey === hasAlt &&
      (event.key.toLowerCase() === key ||
        event.code.toLowerCase() === `key${key}` ||
        this.getKeyName(event.key).toLowerCase() === key)
    );
  }

  private getKeyName(key: string): string {
    const names: Record<string, string> = {
      ' ': 'space',
      'Enter': 'enter',
      'Backspace': 'backspace',
      'Delete': 'delete',
      'Tab': 'tab',
      'Escape': 'escape',
      'ArrowUp': 'up',
      'ArrowDown': 'down',
      'ArrowLeft': 'left',
      'ArrowRight': 'right',
    };
    return names[key] || key;
  }

  private formatCategory(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  private saveCustomBindings(): void {
    localStorage.setItem('custom_shortcuts', JSON.stringify(Array.from(this.customBindings)));
  }

  private loadCustomBindings(): void {
    try {
      const stored = localStorage.getItem('custom_shortcuts');
      if (stored) {
        this.customBindings = new Map(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load custom shortcuts:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export interface ShortcutHelpGroup {
  category: string;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}

/**
 * Global shortcut manager instance
 */
let globalManager: ShortcutManager | null = null;

export const getShortcutManager = (): ShortcutManager => {
  if (!globalManager) {
    globalManager = new ShortcutManager();
  }
  return globalManager;
};

/**
 * React hook for shortcuts
 */
export const useShortcuts = () => {
  const manager = getShortcutManager();
  const [, setRefresh] = React.useState(0);

  React.useEffect(() => {
    return manager.subscribe(() => {
      setRefresh((prev) => prev + 1);
    });
  }, [manager]);

  return {
    register: (id: string, shortcut: Shortcut) => manager.register(id, shortcut),
    unregister: (id: string) => manager.unregister(id),
    rebind: (id: string, keys: string[]) => manager.rebind(id, keys),
    trigger: (id: string) => manager.trigger(id),
    getShortcut: (id: string) => manager.getShortcut(id),
    getAllShortcuts: () => manager.getAllShortcuts(),
    getByCategory: (category: string) => manager.getByCategory(category),
    getHelpText: () => manager.getHelpText(),
    resetToDefaults: () => manager.resetToDefaults(),
  };
};

import React from 'react';
