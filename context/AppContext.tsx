/**
 * Global Application Context
 * Manages app state, navigation, and shared functionality
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AppState, EditOptions } from '../types';
import { enhanceImageWithAI } from '../services/geminiService';
import { dataUrlToBase64 } from '../utils/imageUtils';
import * as storage from '../services/storageService';

export interface AppContextType {
  // State
  appState: AppState;
  originalImage: string | null;
  enhancedImage: string | null;
  gallery: string[];
  selectedGalleryImage: { url: string; index: number } | null;
  isLoading: boolean;
  error: string | null;
  loadingMessage: string;

  // Navigation
  setAppState: (state: AppState) => void;
  goHome: () => void;
  goBack: () => void;
  startNewPost: () => void;

  // Image processing
  captureImage: (imageDataUrl: string) => void;
  enhanceImage: (options: EditOptions) => Promise<void>;
  resetToCamera: () => void;

  // Gallery management
  viewGallery: () => void;
  selectGalleryImage: (url: string, index: number) => void;
  deleteGalleryImage: (index: number) => void;
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
  const [gallery, setGallery] = useState<string[]>([]);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<{ url: string; index: number } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

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
    setError(null);
    setIsLoading(false);
    setSelectedGalleryImage(null);
  }, []);

  const resetToCamera = useCallback(() => {
    setAppState(AppState.CAMERA);
    setOriginalImage(null);
    setEnhancedImage(null);
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
        const newImageUrl = `data:image/jpeg;base64,${enhancedBase64}`;
        setEnhancedImage(newImageUrl);
        const updatedGallery = storage.addToHistory(newImageUrl);
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
      if (messageInterval) clearInterval(messageInterval);
      setLoadingMessage('');
    }
  }, [originalImage, loadingMessages]);

  const viewGallery = useCallback(() => {
    setGallery(storage.getHistory());
    setAppState(AppState.GALLERY);
  }, []);

  const selectGalleryImage = useCallback((url: string, index: number) => {
    setSelectedGalleryImage({ url, index });
    setAppState(AppState.GALLERY_DETAIL);
  }, []);

  const deleteGalleryImage = useCallback((index: number) => {
    const updatedGallery = storage.deleteFromHistory(index);
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

  const value: AppContextType = {
    appState,
    originalImage,
    enhancedImage,
    gallery,
    selectedGalleryImage,
    isLoading,
    error,
    loadingMessage,
    setAppState,
    goHome,
    goBack,
    startNewPost,
    captureImage,
    enhanceImage,
    resetToCamera,
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
