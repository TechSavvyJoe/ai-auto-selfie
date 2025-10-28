import React, { useState, useCallback, useMemo } from 'react';
import { getCaptionTemplateService, CaptionTemplate } from '../services/captionTemplateService';

interface CaptionTemplatesPanelProps {
  onApply: (template: CaptionTemplate, customization: Record<string, string>) => void;
  onClose?: () => void;
}

const CaptionTemplatesPanel: React.FC<CaptionTemplatesPanelProps> = ({ onApply, onClose }) => {
  const service = getCaptionTemplateService();
  const [selectedCategory, setSelectedCategory] = useState<CaptionTemplate['category'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<CaptionTemplate | null>(null);
  const [customizations, setCustomizations] = useState<Record<string, string>>({});

  const categories = service.getCategories();
  const allTemplates = service.getAllTemplates();

  // Filter templates based on category and search
  const filteredTemplates = useMemo(() => {
    let filtered = allTemplates;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = service.search(searchQuery);
    }

    return filtered;
  }, [selectedCategory, searchQuery, allTemplates, service]);

  // Extract placeholders from template
  const getPlaceholders = useCallback((template: string): string[] => {
    const matches = template.match(/\{([^}]+)\}/g);
    return matches ? matches.map((m) => m.slice(1, -1)) : [];
  }, []);

  const handleTemplateSelect = useCallback((template: CaptionTemplate) => {
    setSelectedTemplate(template);
    // Initialize customizations with empty strings
    const placeholders = getPlaceholders(template.template);
    const initialCustomizations: Record<string, string> = {};
    placeholders.forEach((p) => {
      initialCustomizations[p] = '';
    });
    setCustomizations(initialCustomizations);
  }, [getPlaceholders]);

  const handleCustomizationChange = useCallback((placeholder: string, value: string) => {
    setCustomizations((prev) => ({
      ...prev,
      [placeholder]: value,
    }));
  }, []);

  const handleApply = useCallback(() => {
    if (!selectedTemplate) return;

    onApply(selectedTemplate, customizations);
    setSelectedTemplate(null);
    setCustomizations({});
    setSearchQuery('');
  }, [selectedTemplate, customizations, onApply]);

  const placeholders = selectedTemplate ? getPlaceholders(selectedTemplate.template) : [];

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📝</span>
          <h2 className="text-xl font-bold text-white">Caption Templates</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close templates"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex gap-6 p-6 max-h-96 overflow-hidden">
        {/* Left: Browse & Search */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-700/40 border border-slate-600/50 text-white placeholder-slate-500 focus:border-primary-500/50 outline-none text-sm"
            />
          </div>

          {/* Category Filter */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-300 mb-2">Categories</p>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-primary-600/40 text-primary-200 border border-primary-500/50'
                    : 'hover:bg-slate-700/40 text-slate-300'
                }`}
              >
                All Templates ({allTemplates.length})
              </button>
              {categories.map(({ id, label, icon, count }) => (
                <button
                  key={id}
                  onClick={() => setSelectedCategory(id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedCategory === id
                      ? 'bg-primary-600/40 text-primary-200 border border-primary-500/50'
                      : 'hover:bg-slate-700/40 text-slate-300'
                  }`}
                >
                  <span className="mr-2">{icon}</span>
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* Templates List */}
          <div className="space-y-2">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`w-full text-left p-3 rounded-lg transition-all text-sm group ${
                    selectedTemplate?.id === template.id
                      ? 'bg-primary-600/40 border border-primary-500/50'
                      : 'bg-slate-700/30 border border-slate-600/30 hover:border-primary-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{template.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white group-hover:text-primary-200 truncate">
                        {template.title}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{template.template}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-center text-sm text-slate-400 py-4">No templates found</p>
            )}
          </div>
        </div>

        {/* Right: Customization Preview */}
        {selectedTemplate && (
          <div className="flex-1 flex flex-col border-l border-slate-700/50 pl-6 min-w-0">
            <p className="text-sm font-semibold text-slate-200 mb-4">Customize</p>

            {/* Customization Inputs */}
            <div className="space-y-3 mb-4 flex-1 overflow-y-auto">
              {placeholders.length > 0 ? (
                placeholders.map((placeholder) => (
                  <div key={placeholder}>
                    <label className="text-xs font-medium text-slate-300 mb-1 block capitalize">
                      {placeholder.replace(/_/g, ' ')}
                    </label>
                    <input
                      type="text"
                      value={customizations[placeholder] || ''}
                      onChange={(e) => handleCustomizationChange(placeholder, e.target.value)}
                      placeholder={`e.g., ${selectedTemplate.placeholder}`}
                      maxLength={50}
                      className="w-full px-3 py-2 rounded-lg bg-slate-700/40 border border-slate-600/50 text-white placeholder-slate-500 focus:border-primary-500/50 outline-none text-sm"
                    />
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No customizations needed</p>
              )}
            </div>

            {/* Preview */}
            <div className="bg-slate-700/20 rounded-lg p-3 mb-4">
              <p className="text-xs text-slate-400 mb-2">Preview:</p>
              <p className="text-sm text-white font-medium">
                {service.applyTemplate(selectedTemplate, customizations) || 'Your caption will appear here'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-700/40 hover:bg-slate-700/60 text-slate-300 text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                <span>✓</span> Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaptionTemplatesPanel;
