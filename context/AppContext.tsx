/**
 * Global Application Context
 * Manages app state, navigation, and shared functionality
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AppState, EditOptions, GalleryImage } from '../types';
import { composeOverlays } from '../services/overlaysService';
import { enhanceImageWithAI, generateCaptionFromImage } from '../services/geminiService';
import { getSettingsService } from '../services/settingsService';
import { dataUrlToBase64 } from '../utils/imageUtils';
import * as storage from '../services/storageService';

export interface AppContextType {
  // State
  appState: AppState;
  originalImage: string | null;
  enhancedImage: string | null;
  autoCaption: string | null;
  gallery: GalleryImage[];
  selectedGalleryImage: GalleryImage | null;
  isLoading: boolean;
  error: string | null;
  loadingMessage: string;
  processingStartTime?: number;

  // Navigation
  setAppState: (state: AppState) => void;
  goHome: () => void;
  goBack: () => void;
  startNewPost: () => void;

  // Image processing
  captureImage: (imageDataUrl: string) => void;
  enhanceImage: (options: EditOptions) => Promise<void>;
  resetToCamera: () => void;

  // Caption management
  updateCaption: (newCaption: string) => void;

  // Gallery management
  viewGallery: () => void;
  selectGalleryImage: (image: GalleryImage) => void;
  deleteGalleryImage: (imageId: string) => void;
  clearGallery: () => void;

  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>(AppState.START);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [autoCaption, setAutoCaption] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<GalleryImage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [processingStartTime, setProcessingStartTime] = useState<number | undefined>();

  const loadingMessages = [
    'Briefing the creative director...',
    'Adjusting studio lighting...',
    'Developing photorealistic assets...',
    'Applying cinematic color grade...',
    'Perfecting brand integration...',
    'Finalizing for social media...',
  ];

  // Initialize gallery on mount
  useEffect(() => {
    setGallery(storage.getHistory());
  }, []);

  const goHome = useCallback(() => {
    setAppState(AppState.START);
    setOriginalImage(null);
    setEnhancedImage(null);
    setAutoCaption(null);
    setError(null);
    setIsLoading(false);
    setSelectedGalleryImage(null);
  }, []);

  const resetToCamera = useCallback(() => {
    setAppState(AppState.CAMERA);
    setOriginalImage(null);
    setEnhancedImage(null);
    setAutoCaption(null);
    setError(null);
    setIsLoading(false);
    setSelectedGalleryImage(null);
  }, []);

  const goBack = useCallback(() => {
    switch (appState) {
      case AppState.EDITING:
        setAppState(AppState.CAMERA);
        break;
      case AppState.RESULT:
        setAppState(AppState.EDITING);
        break;
      case AppState.GALLERY:
        goHome();
        break;
      case AppState.GALLERY_DETAIL:
        setAppState(AppState.GALLERY);
        break;
      case AppState.CAMERA:
        goHome();
        break;
      default:
        break;
    }
  }, [appState, goHome]);

  const startNewPost = useCallback(() => {
    setAppState(AppState.CAMERA);
    setOriginalImage(null);
    setEnhancedImage(null);
    setError(null);
  }, []);

  const captureImage = useCallback((imageDataUrl: string) => {
    setOriginalImage(imageDataUrl);
    setAppState(AppState.EDITING);
  }, []);

  const enhanceImage = useCallback(async (options: EditOptions) => {
    if (!originalImage) return;

    setIsLoading(true);
    setError(null);
    const startTime = Date.now();
    setProcessingStartTime(startTime);
    let messageInterval: number | undefined;

    try {
      let msgIndex = 0;
      setLoadingMessage(loadingMessages[msgIndex]);
      messageInterval = window.setInterval(() => {
        msgIndex = (msgIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[msgIndex]);
      }, 2500);

  const base64Image = dataUrlToBase64(originalImage);
  const enhancedBase64 = await enhanceImageWithAI(base64Image, 'image/jpeg', options);

      if (enhancedBase64) {
        let newImageUrl = `data:image/jpeg;base64,${enhancedBase64}`;
        // Apply overlays client-side after AI enhancement if provided
        if (options.overlays && options.overlays.length > 0) {
          try {
            newImageUrl = await composeOverlays(newImageUrl, options.overlays);
          } catch (e) {
            console.warn('Failed to compose overlays, using AI result only.', e);
          }
        }
        const processingTime = Date.now() - startTime;
        setEnhancedImage(newImageUrl);

        // Generate an auto-caption from the final image (with overlays if any)
        let caption: string | null = null;
        try {
          const base64Out = newImageUrl.split(',')[1] || '';
          if (base64Out) {
            const settingsService = getSettingsService();
            const tone = settingsService.getCaptionTone();
            const includeHashtags = settingsService.isIncludeHashtagsEnabled();
            // Map user-facing tone to generator-supported tone values
            const generatorTone: 'friendly' | 'professional' | 'fun' | 'luxury' =
              tone === 'formal' ? 'professional' : tone === 'friendly' ? 'friendly' : 'friendly';
            const maxWords = tone === 'brief' ? 10 : 32;
            caption = await generateCaptionFromImage(base64Out, 'image/jpeg', {
              tone: generatorTone,
              includeHashtags,
              maxWords,
            });
            setAutoCaption(caption);
          }
        } catch (e) {
          console.warn('Caption generation failed, continuing without caption.', e);
        }

        const updatedGallery = storage.addToHistory(newImageUrl, {
          ...options,
          processingTime,
          autoCaption: caption || undefined,
        });
        setGallery(updatedGallery);
        setAppState(AppState.RESULT);
      } else {
        throw new Error('The AI returned an empty image. Please try again.');
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to enhance image. ${errorMessage}`);
      setAppState(AppState.EDITING);
    } finally {
      setIsLoading(false);
      setProcessingStartTime(undefined);
      if (messageInterval) clearInterval(messageInterval);
      setLoadingMessage('');
    }
  }, [originalImage, loadingMessages]);

  const viewGallery = useCallback(() => {
    setGallery(storage.getHistory());
    setAppState(AppState.GALLERY);
  }, []);

  const selectGalleryImage = useCallback((image: GalleryImage) => {
    setSelectedGalleryImage(image);
    setAppState(AppState.GALLERY_DETAIL);
  }, []);

  const deleteGalleryImage = useCallback((imageId: string) => {
    const updatedGallery = storage.deleteFromHistory(imageId);
    setGallery(updatedGallery);
    setAppState(AppState.GALLERY);
    setSelectedGalleryImage(null);
  }, []);

  const clearGallery = useCallback(() => {
    storage.clearHistory();
    setGallery([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateCaption = useCallback((newCaption: string) => {
    setAutoCaption(newCaption);
    
    // Update the most recent gallery image with new caption
    const currentGallery = storage.getHistory();
    if (currentGallery.length > 0) {
      const mostRecentImage = currentGallery[0];
      storage.updateImageMetadata(mostRecentImage.id, { autoCaption: newCaption });
      setGallery(storage.getHistory());
    }
  }, []);

  const value: AppContextType = {
    appState,
    originalImage,
    enhancedImage,
    autoCaption,
    gallery,
    selectedGalleryImage,
    isLoading,
    error,
    loadingMessage,
    processingStartTime,
    setAppState,
    goHome,
    goBack,
    startNewPost,
    captureImage,
    enhanceImage,
    resetToCamera,
    updateCaption,
    viewGallery,
    selectGalleryImage,
    deleteGalleryImage,
    clearGallery,
    setError,
    clearError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
