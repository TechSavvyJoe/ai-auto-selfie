import React, { useState, useEffect } from 'react';
import Button from './common/Button';
import Icon from './common/Icon';
import { getShortcutsService } from '../services/shortcutsService';

interface ShortcutsHelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShortcutsHelpDialog: React.FC<ShortcutsHelpDialogProps> = ({ isOpen, onClose }) => {
  const [shortcuts, setShortcuts] = useState<Map<string, any[]>>(new Map());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      const shortcutsService = getShortcutsService();
      const allShortcuts = shortcutsService.getAllShortcuts();

      // Group shortcuts by category
      const grouped = new Map<string, any[]>();
      allShortcuts.forEach(shortcut => {
        if (!grouped.has(shortcut.category)) {
          grouped.set(shortcut.category, []);
        }
        grouped.get(shortcut.category)!.push(shortcut);
      });

      setShortcuts(grouped);
      setSelectedCategory('all');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = Array.from(shortcuts.keys()).sort();
  const displayShortcuts = selectedCategory === 'all'
    ? Array.from(shortcuts.values()).flat()
    : shortcuts.get(selectedCategory) || [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-96 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Icon type="keyboard" className="w-6 h-6 text-primary-400" />
            <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Icon type="close" className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Category selector */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                    selectedCategory === category
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Shortcuts grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayShortcuts.map(shortcut => (
                <div
                  key={shortcut.id}
                  className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white">{shortcut.label}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{shortcut.description}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {shortcut.keys.map((key: string, index: number) => (
                        <React.Fragment key={index}>
                          {index > 0 && <span className="text-gray-500 text-xs">+</span>}
                          <kbd className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs font-mono text-gray-100 whitespace-nowrap">
                            {key.toUpperCase()}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {displayShortcuts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">No shortcuts available in this category</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Press <kbd className="px-1.5 py-0.5 bg-gray-700 border border-gray-600 rounded text-xs font-mono">F1</kbd> anytime to open this dialog
          </p>
          <Button onClick={onClose} variant="secondary" className="text-sm">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsHelpDialog;
