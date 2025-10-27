import { LogoData } from "../types";

const HISTORY_KEY = 'aiAutoSelfieHistory';
const LOGO_KEY = 'aiAutoSelfieLogo';
const MAX_HISTORY_ITEMS = 50;

// --- Gallery History Management ---

export const getHistory = (): string[] => {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error("Failed to parse history from localStorage", error);
    return [];
  }
};

export const addToHistory = (imageDataUrl: string): string[] => {
  const currentHistory = getHistory();
  const newHistory = [imageDataUrl, ...currentHistory];
  
  if (newHistory.length > MAX_HISTORY_ITEMS) {
    newHistory.length = MAX_HISTORY_ITEMS;
  }
  
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error)
  {
    console.error("Failed to save history to localStorage", error);
  }

  return newHistory;
};

export const deleteFromHistory = (index: number): string[] => {
  const currentHistory = getHistory();
  if (index < 0 || index >= currentHistory.length) {
    return currentHistory;
  }
  
  const newHistory = [...currentHistory];
  newHistory.splice(index, 1);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error("Failed to update history in localStorage", error);
  }

  return newHistory;
}

export const clearHistory = (): void => {
    try {
        localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        console.error("Failed to clear history from localStorage", error);
    }
}

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
