/**
 * Command Pattern - Undo/Redo System
 * Professional-grade undo/redo with full command history
 * Essential for creative tools
 */

export interface Command {
  id: string;
  name: string;
  execute: () => void;
  undo: () => void;
  timestamp: number;
  description: string;
}

export class HistoryManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private maxHistorySize: number = 50;
  private listeners: Set<(state: HistoryState) => void> = new Set();

  constructor(maxSize: number = 50) {
    this.maxHistorySize = maxSize;
  }

  /**
   * Execute a command and add to undo stack
   */
  execute(command: Command): void {
    // Execute the command
    command.execute();

    // Add to undo stack
    this.undoStack.push(command);

    // Clear redo stack (new branch in history)
    this.redoStack = [];

    // Maintain max size
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }

    this.notifyListeners();
  }

  /**
   * Undo the last command
   */
  undo(): boolean {
    if (this.undoStack.length === 0) return false;

    const command = this.undoStack.pop()!;
    command.undo();
    this.redoStack.push(command);

    this.notifyListeners();
    return true;
  }

  /**
   * Redo the last undone command
   */
  redo(): boolean {
    if (this.redoStack.length === 0) return false;

    const command = this.redoStack.pop()!;
    command.execute();
    this.undoStack.push(command);

    this.notifyListeners();
    return true;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Get current undo/redo state
   */
  getState(): HistoryState {
    return {
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
      lastCommand: this.undoStack[this.undoStack.length - 1]?.name || null,
      nextCommand: this.redoStack[this.redoStack.length - 1]?.name || null,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      history: this.undoStack.map((cmd) => ({
        name: cmd.name,
        description: cmd.description,
        timestamp: cmd.timestamp,
      })),
    };
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.notifyListeners();
  }

  /**
   * Subscribe to history changes
   */
  subscribe(listener: (state: HistoryState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }

  /**
   * Get command history for timeline view
   */
  getHistory(): HistoryEntry[] {
    return this.undoStack.map((cmd, index) => ({
      id: cmd.id,
      name: cmd.name,
      description: cmd.description,
      timestamp: cmd.timestamp,
      index,
      isCurrent: index === this.undoStack.length - 1,
    }));
  }

  /**
   * Jump to specific point in history
   */
  jumpToIndex(index: number): boolean {
    if (index < 0 || index >= this.undoStack.length) return false;

    const currentIndex = this.undoStack.length - 1;
    const difference = currentIndex - index;

    if (difference > 0) {
      // Need to undo
      for (let i = 0; i < difference; i++) {
        this.undo();
      }
    } else if (difference < 0) {
      // Need to redo
      for (let i = 0; i < Math.abs(difference); i++) {
        this.redo();
      }
    }

    return true;
  }
}

export interface HistoryState {
  undoCount: number;
  redoCount: number;
  lastCommand: string | null;
  nextCommand: string | null;
  canUndo: boolean;
  canRedo: boolean;
  history: Array<{
    name: string;
    description: string;
    timestamp: number;
  }>;
}

export interface HistoryEntry {
  id: string;
  name: string;
  description: string;
  timestamp: number;
  index: number;
  isCurrent: boolean;
}

/**
 * Helper to create adjustment commands
 */
export const createAdjustmentCommand = (
  name: string,
  newAdjustments: any,
  previousAdjustments: any,
  onApply: (adjustments: any) => void
): Command => {
  return {
    id: `adjustment-${Date.now()}`,
    name,
    description: `Changed ${name}`,
    timestamp: Date.now(),
    execute: () => onApply(newAdjustments),
    undo: () => onApply(previousAdjustments),
  };
};

/**
 * Helper to create filter commands
 */
export const createFilterCommand = (
  filterName: string,
  onApply: (filter: string) => void,
  previousFilter: string
): Command => {
  return {
    id: `filter-${Date.now()}`,
    name: `Applied ${filterName} filter`,
    description: `Changed filter from ${previousFilter} to ${filterName}`,
    timestamp: Date.now(),
    execute: () => onApply(filterName),
    undo: () => onApply(previousFilter),
  };
};

/**
 * Hook for using history in React
 */
export const useHistory = (initialMaxSize: number = 50) => {
  const [historyManager] = React.useState(() => new HistoryManager(initialMaxSize));
  const [state, setState] = React.useState(historyManager.getState());

  React.useEffect(() => {
    return historyManager.subscribe((newState) => {
      setState(newState);
    });
  }, [historyManager]);

  return {
    execute: (command: Command) => historyManager.execute(command),
    undo: () => historyManager.undo(),
    redo: () => historyManager.redo(),
    canUndo: state.canUndo,
    canRedo: state.canRedo,
    clear: () => historyManager.clear(),
    getHistory: () => historyManager.getHistory(),
    jumpToIndex: (index: number) => historyManager.jumpToIndex(index),
    state,
  };
};

import React from 'react';
