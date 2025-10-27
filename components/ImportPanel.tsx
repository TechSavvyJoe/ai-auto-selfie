import React, { useState, useRef } from 'react';
import Button from './common/Button';
import Icon from './common/Icon';
import {
  validateImportedData,
  importImage,
  importPreset,
  parseJSONFile,
  importBatch,
  sanitizeImportedData,
  ImportValidation,
} from '../services/importService';
import { GalleryImage } from '../types';

interface ImportPanelProps {
  onImportImage?: (image: GalleryImage) => void;
  onImportPreset?: (preset: any) => void;
  onImportBatch?: (items: any[]) => void;
  onClose?: () => void;
}

interface ImportResult {
  item: any;
  type: string;
  success: boolean;
  error?: string;
}

const ImportPanel: React.FC<ImportPanelProps> = ({
  onImportImage,
  onImportPreset,
  onImportBatch,
  onClose,
}) => {
  const [importMode, setImportMode] = useState<'file' | 'link' | 'paste'>('file');
  const [shareLink, setShareLink] = useState('');
  const [pastedJSON, setPastedJSON] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [validation, setValidation] = useState<ImportValidation | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    try {
      const data = await parseJSONFile(file);
      const sanitized = sanitizeImportedData(data);
      const validation = validateImportedData(sanitized);

      setValidation(validation);

      if (!validation.isValid) {
        return;
      }

      // Process import
      if (Array.isArray(sanitized)) {
        const importedBatch = importBatch(sanitized);
        setResults(importedBatch);
        if (onImportBatch) {
          onImportBatch(importedBatch.filter(r => r.success).map(r => r.item));
        }
      } else if (sanitized.itemType === 'image' || sanitized.imageDataUrl) {
        const image = importImage(sanitized);
        if (image) {
          setResults([{ item: image, type: 'image', success: true }]);
          onImportImage?.(image);
        }
      } else if (sanitized.itemType === 'preset' || sanitized.adjustments) {
        const preset = importPreset(sanitized);
        if (preset) {
          setResults([{ item: preset, type: 'preset', success: true }]);
          onImportPreset?.(preset);
        }
      }
    } catch (error) {
      setValidation({
        isValid: false,
        errors: [String(error)],
        warnings: [],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasteDecode = async () => {
    setIsProcessing(true);
    try {
      const data = JSON.parse(pastedJSON);
      const sanitized = sanitizeImportedData(data);
      const validation = validateImportedData(sanitized);

      setValidation(validation);

      if (!validation.isValid) {
        return;
      }

      // Process import
      if (Array.isArray(sanitized)) {
        const importedBatch = importBatch(sanitized);
        setResults(importedBatch);
        if (onImportBatch) {
          onImportBatch(importedBatch.filter(r => r.success).map(r => r.item));
        }
      } else if (sanitized.imageDataUrl) {
        const image = importImage(sanitized);
        if (image) {
          setResults([{ item: image, type: 'image', success: true }]);
          onImportImage?.(image);
        }
      } else if (sanitized.adjustments) {
        const preset = importPreset(sanitized);
        if (preset) {
          setResults([{ item: preset, type: 'preset', success: true }]);
          onImportPreset?.(preset);
        }
      }
    } catch (error) {
      setValidation({
        isValid: false,
        errors: [`Invalid JSON: ${error}`],
        warnings: [],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportFromLink = async () => {
    if (!shareLink) return;

    setIsProcessing(true);
    try {
      // In production, would fetch from cloud
      const shares = JSON.parse(localStorage.getItem('sharedItems') || '{}');
      const share = shares[shareLink];

      if (!share) {
        setValidation({
          isValid: false,
          errors: ['Share not found'],
          warnings: [],
        });
        return;
      }

      if (share.expiresAt && share.expiresAt < Date.now()) {
        setValidation({
          isValid: false,
          errors: ['Share link has expired'],
          warnings: [],
        });
        return;
      }

      // Process the shared item
      const data = share;
      if (data.imageDataUrl) {
        const image = importImage(data);
        if (image) {
          setResults([{ item: image, type: 'image', success: true }]);
          onImportImage?.(image);
        }
      } else if (data.adjustments) {
        const preset = importPreset(data);
        if (preset) {
          setResults([{ item: preset, type: 'preset', success: true }]);
          onImportPreset?.(preset);
        }
      }

      setValidation({ isValid: true, errors: [], warnings: [] });
    } catch (error) {
      setValidation({
        isValid: false,
        errors: [String(error)],
        warnings: [],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gray-800 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Import Items</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <Icon type="close" className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Import mode selector */}
      <div className="flex gap-2 bg-gray-700/50 rounded-lg p-1">
        {(['file', 'link', 'paste'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => {
              setImportMode(mode);
              setResults([]);
              setValidation(null);
            }}
            className={`flex-1 px-2 py-2 text-xs font-semibold rounded transition-all ${
              importMode === mode
                ? 'bg-primary-500 text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            {mode === 'file' && '📁 File'}
            {mode === 'link' && '🔗 Link'}
            {mode === 'paste' && '📋 Paste'}
          </button>
        ))}
      </div>

      {/* File import mode */}
      {importMode === 'file' && (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full p-8 border-2 border-dashed border-gray-600 rounded-lg hover:border-primary-500 transition-colors cursor-pointer text-center"
          >
            <div className="text-2xl mb-2">📂</div>
            <p className="text-sm text-gray-300">
              {isProcessing ? 'Processing...' : 'Click to select JSON file'}
            </p>
            <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
          </button>
          <p className="text-xs text-gray-400 text-center">
            Supports images, presets, and batch imports
          </p>
        </div>
      )}

      {/* Link import mode */}
      {importMode === 'link' && (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Paste share link ID or full URL"
            value={shareLink}
            onChange={e => setShareLink(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-400 focus:border-primary-500 outline-none"
          />
          <Button
            onClick={handleImportFromLink}
            disabled={!shareLink || isProcessing}
            variant="primary"
            className="w-full"
          >
            {isProcessing ? 'Importing...' : 'Import from Link'}
          </Button>
          <p className="text-xs text-gray-400 text-center">
            Share links expire after 7 days
          </p>
        </div>
      )}

      {/* Paste JSON mode */}
      {importMode === 'paste' && (
        <div className="space-y-2">
          <textarea
            placeholder="Paste JSON content here"
            value={pastedJSON}
            onChange={e => setPastedJSON(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-400 focus:border-primary-500 outline-none h-32 font-mono text-xs"
          />
          <Button
            onClick={handlePasteDecode}
            disabled={!pastedJSON.trim() || isProcessing}
            variant="primary"
            className="w-full"
          >
            {isProcessing ? 'Importing...' : 'Import JSON'}
          </Button>
          <p className="text-xs text-gray-400 text-center">
            Paste exported JSON data directly
          </p>
        </div>
      )}

      {/* Validation messages */}
      {validation && (
        <div className="space-y-2">
          {validation.errors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 space-y-1">
              {validation.errors.map((error, i) => (
                <p key={i} className="text-xs text-red-300">
                  ✗ {error}
                </p>
              ))}
            </div>
          )}

          {validation.warnings.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3 space-y-1">
              {validation.warnings.map((warning, i) => (
                <p key={i} className="text-xs text-yellow-300">
                  ⚠ {warning}
                </p>
              ))}
            </div>
          )}

          {validation.isValid && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
              <p className="text-xs text-green-300">
                ✓ Valid {validation.itemType} import
                {validation.itemCount ? ` (${validation.itemCount} items)` : ''}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Import results */}
      {results.length > 0 && (
        <div className="space-y-2 bg-gray-700/30 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-white">Import Results</h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {results.map((result, i) => (
              <div key={i} className="text-xs">
                {result.success ? (
                  <p className="text-green-400">
                    ✓ Imported {result.type}: {result.item?.name || result.item?.id || 'Unnamed'}
                  </p>
                ) : (
                  <p className="text-red-400">
                    ✗ Failed to import {result.type}: {result.error}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-gray-600">
            <p className="text-xs text-gray-300">
              Successfully imported {results.filter(r => r.success).length}/{results.length} items
            </p>
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="bg-gray-700/20 rounded-lg p-3 text-xs text-gray-400 space-y-1">
        <p>• Supports image exports and preset configurations</p>
        <p>• Batch imports process multiple items at once</p>
        <p>• Imported items are sanitized for security</p>
      </div>
    </div>
  );
};

export default ImportPanel;
