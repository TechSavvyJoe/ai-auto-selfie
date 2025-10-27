import { LogoData, GalleryImage, EditOptions, AIMode } from "../types";

const HISTORY_KEY = 'aiAutoSelfieHistory';
const LOGO_KEY = 'aiAutoSelfieLogo';
const MAX_HISTORY_ITEMS = 50;

// --- Gallery History Management (with Metadata) ---

/**
 * Get all gallery images with metadata
 */
export const getHistory = (): GalleryImage[] => {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    if (!historyJson) return [];

    const history = JSON.parse(historyJson);

    // Handle legacy format (array of strings) and convert to GalleryImage[]
    if (Array.isArray(history) && history.length > 0) {
      if (typeof history[0] === 'string') {
        // Legacy format - convert to new format
        return history.map((url: string, index: number) => ({
          id: `legacy-${Date.now()}-${index}`,
          imageDataUrl: url,
          createdAt: Date.now() - (history.length - index) * 3600000, // Estimate timestamps
        }));
      }
    }

    return history;
  } catch (error) {
    console.error("Failed to parse history from localStorage", error);
    return [];
  }
};

/**
 * Add image to history with metadata from EditOptions
 */
export const addToHistory = (imageDataUrl: string, options?: EditOptions & { processingTime?: number }): GalleryImage[] => {
  const currentHistory = getHistory();

  // Generate thumbnail (smaller base64) for faster loading
  const thumbnail = generateThumbnail(imageDataUrl);

  const newGalleryImage: GalleryImage = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    imageDataUrl,
    thumbnail,
    createdAt: Date.now(),
    theme: options?.theme,
    aiMode: options?.aiMode,
    enhancementLevel: options?.enhancementLevel,
    adjustments: options?.adjustments,
    message: options?.message,
    ctaText: options?.ctaText,
    aspectRatio: options?.aspectRatio,
    logoPosition: options?.logoPosition,
    processingTime: options?.processingTime,
  };

  const newHistory = [newGalleryImage, ...currentHistory];

  if (newHistory.length > MAX_HISTORY_ITEMS) {
    newHistory.length = MAX_HISTORY_ITEMS;
  }

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error("Failed to save history to localStorage", error);
  }

  return newHistory;
};

/**
 * Delete image from history by ID
 */
export const deleteFromHistory = (imageId: string): GalleryImage[] => {
  const currentHistory = getHistory();
  const newHistory = currentHistory.filter(img => img.id !== imageId);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error("Failed to update history in localStorage", error);
  }

  return newHistory;
};

/**
 * Clear all history
 */
export const clearHistory = (): void => {
    try {
        localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        console.error("Failed to clear history from localStorage", error);
    }
};

/**
 * Get history as string array (for backward compatibility)
 */
export const getHistoryAsUrls = (): string[] => {
  return getHistory().map(img => img.imageDataUrl);
};

/**
 * Get image by ID
 */
export const getImageById = (imageId: string): GalleryImage | null => {
  const history = getHistory();
  return history.find(img => img.id === imageId) || null;
};

/**
 * Update image metadata
 */
export const updateImageMetadata = (imageId: string, metadata: Partial<GalleryImage>): GalleryImage | null => {
  const history = getHistory();
  const index = history.findIndex(img => img.id === imageId);

  if (index === -1) return null;

  history[index] = { ...history[index], ...metadata, id: history[index].id, imageDataUrl: history[index].imageDataUrl };

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to update image metadata", error);
  }

  return history[index];
};

/**
 * Filter gallery images
 */
export const filterGallery = (filters: {
  aiMode?: AIMode;
  startDate?: number;
  endDate?: number;
  isFavorite?: boolean;
  searchTags?: string[];
}): GalleryImage[] => {
  let result = getHistory();

  if (filters.aiMode) {
    result = result.filter(img => img.aiMode === filters.aiMode);
  }

  if (filters.startDate) {
    result = result.filter(img => img.createdAt >= filters.startDate!);
  }

  if (filters.endDate) {
    result = result.filter(img => img.createdAt <= filters.endDate!);
  }

  if (filters.isFavorite) {
    result = result.filter(img => img.isFavorite === true);
  }

  if (filters.searchTags && filters.searchTags.length > 0) {
    result = result.filter(img =>
      img.tags && filters.searchTags!.some(tag => img.tags!.includes(tag))
    );
  }

  return result;
};

/**
 * Generate a smaller thumbnail from full-size image (synchronous compression)
 */
const generateThumbnail = (imageDataUrl: string): string => {
  try {
    // For now, return the full image. In production, implement async thumbnail
    // generation with Web Workers or service for better performance
    return imageDataUrl;
  } catch (error) {
    return imageDataUrl;
  }
};

// --- Logo Persistence ---

export const saveLogo = (logoData: LogoData): void => {
    try {
        localStorage.setItem(LOGO_KEY, JSON.stringify(logoData));
    } catch (error) {
        console.error("Failed to save logo to localStorage", error);
    }
};

export const getLogo = (): LogoData | null => {
    try {
        const logoJson = localStorage.getItem(LOGO_KEY);
        return logoJson ? JSON.parse(logoJson) : null;
    } catch (error) {
        console.error("Failed to parse logo from localStorage", error);
        return null;
    }
};
