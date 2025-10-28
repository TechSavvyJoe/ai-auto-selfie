import React, { useState, useCallback, useMemo } from 'react';
import { getPresetService, PresetCombination } from '../services/presetService';

interface PresetManagerPanelProps {
  onLoadPreset: (preset: PresetCombination) => void;
  currentSettings?: any;
  onClose?: () => void;
}

const PresetManagerPanel: React.FC<PresetManagerPanelProps> = ({
  onLoadPreset,
  currentSettings,
  onClose,
}) => {
  const service = getPresetService();
  const [tab, setTab] = useState<'browse' | 'save'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [savePresetName, setSavePresetName] = useState('');
  const [savePresetDesc, setSavePresetDesc] = useState('');
  const [saveTags, setSaveTags] = useState<string[]>([]);

  const allPresets = service.getAllPresets();
  const favorites = service.getFavorites();
  const allTags = service.getAllTags();

  const filteredPresets = useMemo(() => {
    let filtered = allPresets;
    if (selectedTag) {
      filtered = service.getByTag(selectedTag);
    }
    if (searchQuery) {
      filtered = service.search(searchQuery);
    }
    return filtered;
  }, [allPresets, selectedTag, searchQuery, service]);

  const handleLoadPreset = useCallback(
    (preset: PresetCombination) => {
      service.usePreset(preset.id);
      onLoadPreset(preset);
    },
    [service, onLoadPreset]
  );

  const handleSavePreset = useCallback(() => {
    if (!savePresetName.trim() || !currentSettings) return;
    service.createPreset(savePresetName, savePresetDesc, currentSettings, saveTags);
    setSavePresetName('');
    setSavePresetDesc('');
    setSaveTags([]);
    setTab('browse');
  }, [service, savePresetName, savePresetDesc, saveTags, currentSettings]);

  const handleToggleFavorite = useCallback(
    (id: string) => {
      service.toggleFavorite(id);
    },
    [service]
  );

  const handleDeletePreset = useCallback(
    (id: string) => {
      if (confirm('Delete this preset?')) {
        service.deletePreset(id);
      }
    },
    [service]
  );

  const stats = service.getStatistics();

  return (
    <div className="w-full max-w-lg bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💾</span>
          <h2 className="text-xl font-bold text-white">Preset Manager</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors" aria-label="Close presets">
            ✕
          </button>
        )}
      </div>

      <div className="border-b border-slate-700/50 bg-slate-800/30 flex">
        <button
          onClick={() => setTab('browse')}
          className={`flex-1 py-3 px-4 text-sm font-semibold transition-all relative ${
            tab === 'browse' ? 'text-primary-400' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Browse ({allPresets.length})
          {tab === 'browse' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-400" />
          )}
        </button>
        <button
          onClick={() => setTab('save')}
          className={`flex-1 py-3 px-4 text-sm font-semibold transition-all relative ${
            tab === 'save' ? 'text-primary-400' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Save Current
          {tab === 'save' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-400" />
          )}
        </button>
      </div>

      <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
        {tab === 'browse' && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search presets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-700/40 border border-slate-600/50 text-white placeholder-slate-500 focus:border-primary-500/50 outline-none text-sm"
            />

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => { setSelectedTag(null); setSearchQuery(''); }}
                className="text-xs px-3 py-1.5 rounded-full bg-slate-700/40 text-slate-300 border border-slate-600/30 hover:border-primary-500/30 transition-all"
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                    selectedTag === tag
                      ? 'bg-primary-600/40 text-primary-200 border border-primary-500/50'
                      : 'bg-slate-700/40 text-slate-300 border border-slate-600/30 hover:border-primary-500/30'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filteredPresets.length > 0 ? (
                filteredPresets.map((preset) => (
                  <div key={preset.id} className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/50 hover:border-primary-500/50 transition-all">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{preset.name}</p>
                        <p className="text-xs text-slate-400">{preset.description}</p>
                      </div>
                      <button
                        onClick={() => handleToggleFavorite(preset.id)}
                        className={`flex-shrink-0 text-lg transition-all ${
                          preset.isFavorite ? 'text-primary-400' : 'text-slate-500 hover:text-primary-400'
                        }`}
                      >
                        ⭐
                      </button>
                    </div>
                    <div className="flex gap-2 items-center justify-between">
                      <div className="flex gap-1 flex-wrap">
                        {preset.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-slate-600/40 text-slate-300 px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoadPreset(preset)}
                          className="px-2 py-1 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded transition-all"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDeletePreset(preset.id)}
                          className="px-2 py-1 text-xs bg-red-600/30 hover:bg-red-600/50 text-red-300 rounded transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-slate-400 py-4">No presets found</p>
              )}
            </div>
          </div>
        )}

        {tab === 'save' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-200 mb-1 block">Preset Name *</label>
              <input
                type="text"
                value={savePresetName}
                onChange={(e) => setSavePresetName(e.target.value)}
                placeholder="e.g., Golden Hour Selfie"
                className="w-full px-3 py-2 rounded-lg bg-slate-700/40 border border-slate-600/50 text-white placeholder-slate-500 focus:border-primary-500/50 outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-200 mb-1 block">Description</label>
              <textarea
                value={savePresetDesc}
                onChange={(e) => setSavePresetDesc(e.target.value)}
                placeholder="Describe when to use this preset..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-slate-700/40 border border-slate-600/50 text-white placeholder-slate-500 focus:border-primary-500/50 outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-200 mb-2 block">Tags</label>
              <input
                type="text"
                placeholder="e.g., selfie, outdoor, warm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const tag = (e.target as HTMLInputElement).value.trim().toLowerCase();
                    if (tag && !saveTags.includes(tag)) {
                      setSaveTags([...saveTags, tag]);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
                className="w-full px-3 py-2 rounded-lg bg-slate-700/40 border border-slate-600/50 text-white placeholder-slate-500 focus:border-primary-500/50 outline-none text-sm"
              />
              {saveTags.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {saveTags.map((tag) => (
                    <span key={tag} className="text-xs bg-primary-600/40 text-primary-300 px-2 py-1 rounded flex items-center gap-1">
                      {tag}
                      <button onClick={() => setSaveTags(saveTags.filter((t) => t !== tag))}>X</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSavePreset}
              disabled={!savePresetName.trim()}
              className="w-full py-2 px-4 rounded-lg font-semibold text-sm bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all"
            >
              Save Preset
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-slate-700/50 bg-slate-800/30 px-6 py-3 text-xs text-slate-400">
        <p>Total: {allPresets.length} | Favorites: {favorites.length}</p>
      </div>
    </div>
  );
};

export default PresetManagerPanel;
