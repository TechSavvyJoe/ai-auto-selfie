/**
 * AI Text Generator Service
 * Generates high-quality, contextual text suggestions for photo overlays
 * Matches professional creative software like Canva and Adobe
 */

import { generateCaptionFromImage } from './geminiService';

export interface TextSuggestion {
  text: string;
  category: 'caption' | 'hashtag' | 'cta' | 'creative' | 'motivational' | 'professional';
  style: 'bold' | 'elegant' | 'modern' | 'playful' | 'professional';
  fontSize: number;
  confidence: number; // 0-1
}

export interface TextStylePreset {
  name: string;
  color: string;
  bgColor: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  shadowBlur: number;
  textAlign: 'left' | 'center' | 'right';
  category: string;
}

class AITextGeneratorService {
  private textPresets: TextStylePreset[] = [
    {
      name: 'Bold Statement',
      color: '#FFFFFF',
      bgColor: 'rgba(0, 0, 0, 0.4)',
      fontSize: 48,
      fontWeight: 'bold',
      shadowBlur: 8,
      textAlign: 'center',
      category: 'professional',
    },
    {
      name: 'Elegant Script',
      color: '#FFD700',
      bgColor: 'rgba(0, 0, 0, 0)',
      fontSize: 36,
      fontWeight: 'normal',
      shadowBlur: 12,
      textAlign: 'center',
      category: 'elegant',
    },
    {
      name: 'Modern Minimal',
      color: '#FFFFFF',
      bgColor: 'rgba(255, 255, 255, 0.1)',
      fontSize: 32,
      fontWeight: 'bold',
      shadowBlur: 4,
      textAlign: 'left',
      category: 'modern',
    },
    {
      name: 'Vibrant & Bold',
      color: '#FF6B6B',
      bgColor: 'rgba(255, 255, 255, 0.95)',
      fontSize: 44,
      fontWeight: 'bold',
      shadowBlur: 6,
      textAlign: 'center',
      category: 'playful',
    },
    {
      name: 'Luxury Gold',
      color: '#FFF8DC',
      bgColor: 'rgba(184, 134, 11, 0.3)',
      fontSize: 40,
      fontWeight: 'bold',
      shadowBlur: 10,
      textAlign: 'center',
      category: 'luxury',
    },
    {
      name: 'Tech Cyan',
      color: '#00D9FF',
      bgColor: 'rgba(0, 0, 0, 0.6)',
      fontSize: 36,
      fontWeight: 'bold',
      shadowBlur: 8,
      textAlign: 'center',
      category: 'modern',
    },
  ];

  private motivationalTexts = [
    'Create Your Best Self',
    'Shine Bright',
    'Be Authentic',
    'Chase Dreams',
    'Moment of Glory',
    'Confidence is Key',
    'Living My Best Life',
    'Keep It Real',
    'Make It Happen',
    'Own Your Story',
  ];

  private professionalTexts = [
    'Professional Profile',
    'Business Ready',
    'Your Success Story',
    'Elevate Your Brand',
    'Professional Excellence',
    'Your Next Chapter',
    'Growth & Vision',
    'Leadership Moments',
    'Innovation Starts Here',
    'Excellence in Motion',
  ];

  private creativeTexts = [
    'Create Magic',
    'Express Yourself',
    'Your Canvas',
    'Artistic Vision',
    'Creative Soul',
    'Imagine & Design',
    'Unleash Creativity',
    'Pure Inspiration',
    'Artistic Freedom',
    'Design Your Life',
  ];

  /**
   * Generate contextual text suggestions based on image
   */
  async generateTextSuggestions(imageDataUrl: string, aiMode: string): Promise<TextSuggestion[]> {
    try {
      // Get AI-generated caption first
      const caption = await generateCaptionFromImage(imageDataUrl);

      const suggestions: TextSuggestion[] = [];

      // Add main caption
      if (caption) {
        suggestions.push({
          text: caption,
          category: 'caption',
          style: 'elegant',
          fontSize: 36,
          confidence: 0.95,
        });
      }

      // Add mode-specific suggestions
      switch (aiMode) {
        case 'professional':
          suggestions.push(
            ...this.professionalTexts.slice(0, 3).map((text, idx) => ({
              text,
              category: 'professional' as const,
              style: 'professional' as const,
              fontSize: 40 - idx * 4,
              confidence: 0.85 - idx * 0.05,
            }))
          );
          break;
        case 'creative':
          suggestions.push(
            ...this.creativeTexts.slice(0, 3).map((text, idx) => ({
              text,
              category: 'creative' as const,
              style: 'playful' as const,
              fontSize: 36 - idx * 2,
              confidence: 0.85 - idx * 0.05,
            }))
          );
          break;
        default:
          suggestions.push(
            ...this.motivationalTexts.slice(0, 3).map((text, idx) => ({
              text,
              category: 'motivational' as const,
              style: 'bold' as const,
              fontSize: 38 - idx * 3,
              confidence: 0.8 - idx * 0.05,
            }))
          );
      }

      // Add hashtag suggestion
      const hashtag = this.generateHashtags(caption || 'photo', 1)[0];
      if (hashtag) {
        suggestions.push({
          text: hashtag,
          category: 'hashtag',
          style: 'modern',
          fontSize: 24,
          confidence: 0.7,
        });
      }

      return suggestions;
    } catch (error) {
      console.error('Error generating text suggestions:', error);
      return this.getDefaultSuggestions();
    }
  }

  /**
   * Get style preset by name
   */
  getPreset(presetName: string): TextStylePreset | undefined {
    return this.textPresets.find(p => p.name === presetName);
  }

  /**
   * Get all available presets
   */
  getAllPresets(): TextStylePreset[] {
    return [...this.textPresets];
  }

  /**
   * Generate hashtags from text
   */
  generateHashtags(text: string, count: number = 3): string[] {
    const words = text.split(' ').filter(w => w.length > 3);
    const hashtags = words.slice(0, count).map(word => `#${word.toLowerCase()}`);

    // Add contextual hashtags
    const contextualTags = [
      '#SelfieEnhanced',
      '#AIPhotography',
      '#ProQuality',
      '#Enhanced',
      '#Photography',
      '#PhotoArt',
      '#VisualPerfection',
    ];

    return [...hashtags, ...contextualTags.slice(0, Math.max(0, count - hashtags.length))];
  }

  /**
   * Generate CTA (call-to-action) text
   */
  generateCallToAction(category: string = 'general'): string[] {
    const ctas: Record<string, string[]> = {
      general: [
        'Learn More',
        'Discover Now',
        'Get Started',
        'Join Us',
        'See More',
        'Explore',
      ],
      business: [
        'Contact Us',
        'Schedule Demo',
        'Get Quote',
        'Learn More',
        'Book Now',
        'Start Free Trial',
      ],
      social: [
        'Follow',
        'Share This',
        'Tag Someone',
        'Comment Below',
        'Double Tap',
        'Save & Share',
      ],
      creative: [
        'Create Yours',
        'Design Now',
        'Try It',
        'Make Magic',
        'Design Today',
        'Create Beauty',
      ],
    };

    return ctas[category] || ctas.general;
  }

  /**
   * Get default text suggestions
   */
  private getDefaultSuggestions(): TextSuggestion[] {
    return [
      {
        text: 'Create Your Story',
        category: 'caption',
        style: 'elegant',
        fontSize: 40,
        confidence: 0.8,
      },
      {
        text: 'Professional Profile',
        category: 'professional',
        style: 'professional',
        fontSize: 36,
        confidence: 0.75,
      },
      {
        text: 'Shine Bright',
        category: 'motivational',
        style: 'bold',
        fontSize: 38,
        confidence: 0.7,
      },
    ];
  }

  /**
   * Smart font size calculator based on text length
   */
  calculateOptimalFontSize(text: string, baseSize: number = 40): number {
    // Reduce size for longer text
    if (text.length > 30) return baseSize - 8;
    if (text.length > 20) return baseSize - 4;
    if (text.length > 15) return baseSize - 2;
    return baseSize;
  }

  /**
   * Get contrasting text color for background
   */
  getContrastingTextColor(bgColor: string): string {
    // Simple implementation - in production, use more sophisticated color analysis
    const isLightBg = bgColor.includes('rgba(255') || bgColor.includes('#FFF') || bgColor.includes('#fff');
    return isLightBg ? '#000000' : '#FFFFFF';
  }

  /**
   * Generate brand-aligned text suggestions
   */
  async generateBrandText(brand: string, style: string): Promise<string[]> {
    const brandTexts: Record<string, Record<string, string[]>> = {
      luxury: {
        elegant: [
          'Timeless Elegance',
          'Pure Luxury',
          'Refined Excellence',
          'Sophistication Redefined',
          'Luxury Perfected',
        ],
        modern: [
          'Premium Class',
          'Elite Status',
          'Luxury Redefined',
          'Excellence Standard',
          'Premium Quality',
        ],
      },
      creative: {
        playful: [
          'Creative Magic',
          'Artistic Freedom',
          'Design Dreams',
          'Creative Power',
          'Imagination Unlimited',
        ],
        modern: [
          'Design Innovate',
          'Creative Vision',
          'Artistic Expression',
          'Design Forward',
          'Creative Excellence',
        ],
      },
      professional: {
        professional: [
          'Professional Standard',
          'Excellence Delivered',
          'Business Success',
          'Professional Growth',
          'Excellence First',
        ],
        modern: [
          'Innovation Leaders',
          'Professional Edge',
          'Success Story',
          'Growth Driven',
          'Leadership Vision',
        ],
      },
    };

    return brandTexts[brand]?.[style] || [];
  }
}

let instance: AITextGeneratorService | null = null;

export const getAITextGeneratorService = (): AITextGeneratorService => {
  if (!instance) {
    instance = new AITextGeneratorService();
  }
  return instance;
};

export default AITextGeneratorService;
