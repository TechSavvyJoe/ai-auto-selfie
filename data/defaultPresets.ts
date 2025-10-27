import { Preset } from '../services/presetService';

/**
 * Default AI-powered preset templates
 * These provide smart combinations of AI modes and adjustments
 */
export const DEFAULT_PRESETS: Omit<Preset, 'id' | 'createdAt' | 'updatedAt' | 'uses'>[] = [
  // Professional Portrait Collection
  {
    name: 'Executive Portrait',
    description: 'Professional headshot with perfect skin and sharp eyes',
    category: 'professional',
    author: 'AI Studio',
    isPublic: true,
    tags: ['portrait', 'professional', 'headshot'],
    isFavorite: false,
    adjustments: {
      exposure: 5,
      contrast: 10,
      temperature: -5,
      saturation: -5,
      sharpen: 3,
    },
    editOptions: {
      aiMode: 'portrait',
      enhancementLevel: 'moderate',
    },
  },

  // Cinematic Collection
  {
    name: 'Hollywood Cinematic',
    description: 'Cinematic look with teal/orange grading and dramatic mood',
    category: 'creative',
    author: 'AI Studio',
    isPublic: true,
    tags: ['cinematic', 'dramatic', 'film'],
    isFavorite: false,
    adjustments: {
      exposure: 0,
      contrast: 20,
      temperature: -15,
      saturation: 10,
      sharpen: 2,
    },
    editOptions: {
      aiMode: 'cinematic',
      enhancementLevel: 'dramatic',
    },
  },

  // Lifestyle Social Media Collection
  {
    name: 'Instagram Vibrant',
    description: 'Punchy, vibrant colors perfect for social media',
    category: 'vibrant',
    author: 'AI Studio',
    isPublic: true,
    tags: ['social-media', 'vibrant', 'instagram'],
    isFavorite: false,
    adjustments: {
      exposure: 5,
      contrast: 15,
      temperature: 10,
      saturation: 25,
      sharpen: 2,
    },
    editOptions: {
      aiMode: 'creative',
      enhancementLevel: 'moderate',
    },
  },

  // Natural & Clean Collection
  {
    name: 'Clean & Natural',
    description: 'Subtle enhancement preserving natural beauty and authenticity',
    category: 'natural',
    author: 'AI Studio',
    isPublic: true,
    tags: ['natural', 'subtle', 'authentic'],
    isFavorite: false,
    adjustments: {
      exposure: 3,
      contrast: 5,
      temperature: 0,
      saturation: 0,
      sharpen: 1,
    },
    editOptions: {
      aiMode: 'natural',
      enhancementLevel: 'subtle',
    },
  },

  // Luxury Collection
  {
    name: 'Luxury High-End',
    description: 'Premium look with deep contrast and sophisticated tone',
    category: 'luxury',
    author: 'AI Studio',
    isPublic: true,
    tags: ['luxury', 'premium', 'sophisticated'],
    isFavorite: false,
    adjustments: {
      exposure: -5,
      contrast: 25,
      temperature: 10,
      saturation: -10,
      sharpen: 4,
    },
    editOptions: {
      aiMode: 'professional',
      enhancementLevel: 'dramatic',
    },
  },

  // Editorial Magazine Collection
  {
    name: 'Editorial Magazine',
    description: 'Professional editorial photography style with perfect balance',
    category: 'professional',
    author: 'AI Studio',
    isPublic: true,
    tags: ['editorial', 'magazine', 'professional'],
    isFavorite: false,
    adjustments: {
      exposure: 0,
      contrast: 12,
      temperature: 5,
      saturation: 8,
      sharpen: 2,
    },
    editOptions: {
      aiMode: 'professional',
      enhancementLevel: 'moderate',
    },
  },

  // Warm & Inviting Collection
  {
    name: 'Warm & Friendly',
    description: 'Warm tones and gentle adjustments for approachable feel',
    category: 'warm',
    author: 'AI Studio',
    isPublic: true,
    tags: ['warm', 'friendly', 'inviting'],
    isFavorite: false,
    adjustments: {
      exposure: 8,
      contrast: 3,
      temperature: 20,
      saturation: 5,
      sharpen: 1,
    },
    editOptions: {
      aiMode: 'natural',
      enhancementLevel: 'moderate',
    },
  },

  // Bold & Creative Collection
  {
    name: 'Bold Creative',
    description: 'Maximum impact with creative color grading and high contrast',
    category: 'creative',
    author: 'AI Studio',
    isPublic: true,
    tags: ['creative', 'bold', 'artistic'],
    isFavorite: false,
    adjustments: {
      exposure: 0,
      contrast: 30,
      temperature: -20,
      saturation: 35,
      sharpen: 3,
    },
    editOptions: {
      aiMode: 'creative',
      enhancementLevel: 'dramatic',
    },
  },

  // Minimalist Clean Collection
  {
    name: 'Minimalist Clean',
    description: 'Ultra-clean, minimal aesthetic with precision details',
    category: 'minimalist',
    author: 'AI Studio',
    isPublic: true,
    tags: ['minimalist', 'clean', 'modern'],
    isFavorite: false,
    adjustments: {
      exposure: 5,
      contrast: 8,
      temperature: -10,
      saturation: -15,
      sharpen: 2,
    },
    editOptions: {
      aiMode: 'professional',
      enhancementLevel: 'subtle',
    },
  },
];
