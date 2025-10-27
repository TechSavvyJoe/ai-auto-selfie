/**
 * Import Service
 * Handles importing shared images, presets, and other exported data
 */

import { GalleryImage, ImageAdjustments } from '../types';

export interface ImportedItem {
  id: string;
  type: 'image' | 'preset' | 'batch';
  name?: string;
  createdAt: number;
  source?: string;
  data: any;
}

export interface ImportValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  itemType?: string;
  itemCount?: number;
}

/**
 * Validate imported JSON data structure
 */
export function validateImportedData(data: any): ImportValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  let itemType: string | undefined;
  let itemCount = 0;

  if (!data || typeof data !== 'object') {
    errors.push('Invalid JSON: expected object');
    return { isValid: false, errors, warnings };
  }

  // Detect item type
  if (data.itemType) {
    itemType = data.itemType;
  } else if (Array.isArray(data) && data.length > 0) {
    itemType = 'batch';
    itemCount = data.length;
  } else if (data.adjustments && typeof data.adjustments === 'object') {
    itemType = 'preset';
  } else if (data.imageDataUrl) {
    itemType = 'image';
  }

  if (!itemType) {
    errors.push('Cannot determine imported item type');
    return { isValid: false, errors, warnings };
  }

  // Validate based on type
  switch (itemType) {
    case 'image':
      if (!data.imageDataUrl) {
        errors.push('Image data missing imageDataUrl');
      }
      if (!data.timestamp && !data.createdAt) {
        warnings.push('Image missing timestamp information');
      }
      break;

    case 'preset':
      if (!data.adjustments) {
        errors.push('Preset missing adjustments object');
      } else if (typeof data.adjustments !== 'object') {
        errors.push('Preset adjustments must be an object');
      }
      if (!data.itemName && !data.name) {
        warnings.push('Preset missing name');
      }
      break;

    case 'batch':
      if (!Array.isArray(data)) {
        errors.push('Batch import must be an array');
      } else {
        itemCount = data.length;
        if (itemCount === 0) {
          errors.push('Batch import is empty');
        } else if (itemCount > 100) {
          warnings.push(`Large batch size: ${itemCount} items may take time to process`);
        }
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    itemType,
    itemCount,
  };
}

/**
 * Import image from JSON
 */
export function importImage(data: any): GalleryImage | null {
  try {
    if (!data.imageDataUrl) {
      console.error('Missing imageDataUrl');
      return null;
    }

    return {
      id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      imageDataUrl: data.imageDataUrl,
      createdAt: data.timestamp || data.createdAt || Date.now(),
      theme: data.theme,
      aiMode: data.aiMode,
      enhancementLevel: data.enhancementLevel,
      adjustments: data.adjustments,
      message: data.message,
      ctaText: data.ctaText,
      tags: data.tags || ['imported'],
    };
  } catch (error) {
    console.error('Failed to import image:', error);
    return null;
  }
}

/**
 * Import preset from JSON
 */
export function importPreset(data: any): any | null {
  try {
    if (!data.adjustments || typeof data.adjustments !== 'object') {
      console.error('Invalid preset adjustments');
      return null;
    }

    return {
      id: `imported-preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: data.itemName || data.name || 'Imported Preset',
      description: data.description || 'Imported from shared source',
      category: data.category || 'imported',
      adjustments: data.adjustments,
      editOptions: data.editOptions,
      tags: [...(data.tags || []), 'imported'],
      author: data.author || 'Imported User',
      createdAt: data.createdAt || Date.now(),
      isPublic: false,
      usageCount: 0,
      lastUsed: null,
    };
  } catch (error) {
    console.error('Failed to import preset:', error);
    return null;
  }
}

/**
 * Parse JSON from file
 */
export function parseJSONFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        resolve(json);
      } catch (error) {
        reject(new Error(`Invalid JSON: ${error}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Handle share link import
 */
export async function importFromShareLink(shareId: string): Promise<ImportedItem | null> {
  try {
    const shares = JSON.parse(localStorage.getItem('sharedItems') || '{}');
    const shareData = shares[shareId];

    if (!shareData) {
      console.error('Share not found or expired');
      return null;
    }

    if (shareData.expiresAt && shareData.expiresAt < Date.now()) {
      console.error('Share link has expired');
      return null;
    }

    // In production, this would fetch from cloud storage
    return {
      id: shareId,
      type: shareData.itemType,
      name: shareData.itemName,
      createdAt: shareData.createdAt,
      source: 'share-link',
      data: shareData, // Would fetch actual data from cloud
    };
  } catch (error) {
    console.error('Failed to import from share:', error);
    return null;
  }
}

/**
 * Import batch of items
 */
export function importBatch(items: any[]): Array<{
  item: any;
  type: string;
  success: boolean;
  error?: string;
}> {
  return items.map(item => {
    try {
      if (item.adjustments) {
        return {
          item: importPreset(item),
          type: 'preset',
          success: true,
        };
      } else if (item.imageDataUrl) {
        return {
          item: importImage(item),
          type: 'image',
          success: true,
        };
      } else {
        return {
          item: null,
          type: 'unknown',
          success: false,
          error: 'Unknown item type',
        };
      }
    } catch (error) {
      return {
        item: null,
        type: 'unknown',
        success: false,
        error: String(error),
      };
    }
  });
}

/**
 * Merge imported presets with existing ones
 */
export function mergePresets(
  existing: any[],
  imported: any[],
  strategy: 'skip' | 'overwrite' | 'keep-both' = 'keep-both'
): any[] {
  const merged = [...existing];

  imported.forEach(importedPreset => {
    const existingIndex = merged.findIndex(
      p => p.name.toLowerCase() === importedPreset.name.toLowerCase()
    );

    if (existingIndex >= 0) {
      switch (strategy) {
        case 'skip':
          // Keep existing, don't add imported
          break;
        case 'overwrite':
          merged[existingIndex] = importedPreset;
          break;
        case 'keep-both':
          // Add with modified name
          importedPreset.name = `${importedPreset.name} (Imported)`;
          merged.push(importedPreset);
          break;
      }
    } else {
      merged.push(importedPreset);
    }
  });

  return merged;
}

/**
 * Sanitize imported data to prevent issues
 */
export function sanitizeImportedData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized = { ...data };

  // Limit string lengths
  if (sanitized.name && typeof sanitized.name === 'string') {
    sanitized.name = sanitized.name.substring(0, 100);
  }
  if (sanitized.description && typeof sanitized.description === 'string') {
    sanitized.description = sanitized.description.substring(0, 500);
  }

  // Validate adjustments
  if (sanitized.adjustments && typeof sanitized.adjustments === 'object') {
    const validAdjustments = {
      exposure: 0,
      contrast: 0,
      temperature: 0,
      saturation: 0,
      sharpen: 0,
    };

    Object.keys(validAdjustments).forEach(key => {
      if (sanitized.adjustments[key] !== undefined) {
        const val = parseFloat(sanitized.adjustments[key]);
        // Clamp values to reasonable ranges
        if (key === 'sharpen') {
          sanitized.adjustments[key] = Math.max(0, Math.min(10, val));
        } else {
          sanitized.adjustments[key] = Math.max(-50, Math.min(50, val));
        }
      }
    });
  }

  // Remove potentially dangerous fields
  delete sanitized.password;
  delete sanitized.apiKey;
  delete sanitized.token;

  return sanitized;
}
