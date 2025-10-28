import { GoogleGenAI, Modality } from "@google/genai";
import { EditOptions, Theme, LogoPosition, ImageAdjustments } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Premium AI Enhancement Modes
 */
export type AIMode = 'professional' | 'cinematic' | 'portrait' | 'creative' | 'natural';

export interface EnhancedAIOptions extends EditOptions {
  mode?: AIMode;
  enhancementLevel?: 'subtle' | 'moderate' | 'dramatic';
  stylePreset?: string;
}

/**
 * Premium theme prompts for professional-grade results
 * AUTO MODE: Automatically applies best visual enhancements for dealership photos
 */
const getAdvancedThemePrompt = (theme: Theme, mode: AIMode = 'professional'): string => {
  const basePrompts = {
    luxury: {
      visual: 'Ultra-premium, magazine-quality photography with cinematic lighting and sophisticated color grading',
      colorGrade: 'Deep, rich tones with enhanced shadows. Metallic highlights with subtle warmth. Think Vogue or high-end automotive advertising',
      lighting: 'Dramatic three-point lighting with soft key light, subtle fill, and rim lighting for depth',
      atmosphere: 'Refined elegance with premium bokeh and professional depth of field',
      autoEffects: 'Add subtle golden glow around subjects, enhance vehicle shine and reflections, create premium background blur',
    },
    dynamic: {
      visual: 'High-energy, vibrant, action-oriented photography with motion and impact',
      colorGrade: 'Punchy, saturated colors with enhanced contrast. Cool highlights, warm midtones',
      lighting: 'Sharp, directional lighting with strong shadows for dimension and drama',
      atmosphere: 'Energetic with slight motion blur suggestion in background elements',
      autoEffects: 'Add vibrant color pop, enhance energy with subtle radial glow, boost saturation on vehicle colors',
    },
    family: {
      visual: 'Warm, inviting, and genuine moments with natural beauty and approachability',
      colorGrade: 'Bright, warm, and natural with enhanced golden hour tones',
      lighting: 'Soft, diffused natural lighting that\'s flattering and welcoming',
      atmosphere: 'Comfortable and authentic with gentle bokeh and natural depth',
      autoEffects: 'Add warm golden-hour glow, soften skin tones naturally, create welcoming soft-focus background',
    },
    modern: {
      visual: 'Clean, minimalist, and contemporary with perfect technical execution',
      colorGrade: 'Balanced, true-to-life colors with enhanced clarity and sharpness',
      lighting: 'Even, studio-quality lighting with subtle modeling',
      atmosphere: 'Crisp and professional with controlled background separation',
      autoEffects: 'Add clean edge enhancement, subtle clarity boost, professional background separation with soft blur',
    },
  };

  const themePrompt = basePrompts[theme] || basePrompts.modern;
  
  return `
**VISUAL DIRECTION:**
${themePrompt.visual}

**AUTOMATIC ENHANCEMENT EFFECTS (APPLY THESE):**
${themePrompt.autoEffects}
- Add professional glow and atmosphere automatically
- Enhance lighting quality with soft ambient enhancement
- Create visual depth with intelligent background softening
- Apply dealership-ready polish and professional finish

**COLOR SCIENCE:**
${themePrompt.colorGrade}
- Apply professional color grading with accurate skin tones
- Enhance micro-contrast without crushing blacks or blowing highlights
- Perfect white balance with creative intent
- Boost colors to make them Instagram/social media ready

**LIGHTING DESIGN:**
${themePrompt.lighting}
- Ensure consistent light directionality throughout the scene
- Add subtle environment lighting reflections
- Preserve natural catchlights in eyes
- Automatically enhance existing light sources

**ATMOSPHERE & DEPTH:**
${themePrompt.atmosphere}
- Professional depth of field with smooth bokeh
- Subtle atmospheric perspective and haze
- Perfect edge detail preservation on subjects
- Create "wow factor" with professional visual effects
`;
};

/**
 * AI Mode-specific instructions with automatic enhancement
 */
const getModeInstructions = (mode: AIMode): string => {
  const modeSpecs = {
    professional: `
- Execute with precision of a $100,000 commercial photoshoot
- Perfect technical quality: tack-sharp focus, zero noise, perfect exposure
- Professional retouching: subtle skin smoothing, blemish removal, perfect highlights
- Commercial-grade color accuracy and consistency
- AUTOMATICALLY apply professional glow and polish effects
- Make the photo look like it came from a professional photographer
`,
    cinematic: `
- Apply Hollywood-grade color grading with film-like quality
- Use cinematic color palettes (teal & orange, crushed blacks, lifted shadows)
- Add subtle film grain and texture for authenticity
- Create dramatic contrast with rich, deep blacks and creamy highlights
- Think Christopher Nolan meets Annie Leibovitz
- AUTOMATICALLY add cinematic atmosphere and depth
`,
    portrait: `
- Master portrait photographer quality (think Peter Hurley, Annie Leibovitz)
- Perfect skin texture preservation with natural retouching
- Beautiful eye enhancement with natural catchlights
- Professional hair and clothing detail enhancement
- Flattering facial contouring through light and shadow
- AUTOMATICALLY enhance portrait quality with professional effects
`,
    creative: `
- Push creative boundaries while maintaining realism
- Bold color choices with harmonious palettes
- Artistic composition enhancements
- Unique atmospheric effects and mood creation
- Stand-out social media worthy aesthetics
- AUTOMATICALLY apply creative visual effects and unique styling
`,
    natural: `
- Enhance natural beauty without artificial over-processing
- True-to-life color reproduction with subtle enhancement
- Preserve authentic moments and genuine expressions
- Clean, bright, and crisp with perfect white balance
- Editorial magazine quality with natural aesthetic
- AUTOMATICALLY polish while maintaining natural feel
`,
  };

  return modeSpecs[mode] || modeSpecs.professional;
};

/**
 * Generate adjustment hints for the enhancement prompt
 */
const getAdjustmentHints = (adjustments: ImageAdjustments | undefined): string => {
  if (!adjustments) {
    return '';
  }

  const hints: string[] = [];

  if (adjustments.exposure !== 0) {
    hints.push(`**Exposure**: ${adjustments.exposure > 0 ? 'Brighten' : 'Darken'} by ${Math.abs(adjustments.exposure)}% for proper luminance`);
  }
  if (adjustments.contrast !== 0) {
    hints.push(`**Contrast**: ${adjustments.contrast > 0 ? 'Increase' : 'Decrease'} by ${Math.abs(adjustments.contrast)}% for visual impact`);
  }
  if (adjustments.temperature !== 0) {
    hints.push(`**Color Temperature**: Shift ${adjustments.temperature > 0 ? 'warmer' : 'cooler'} by ${Math.abs(adjustments.temperature)}K for mood`);
  }
  if (adjustments.saturation !== 0) {
    hints.push(`**Saturation**: ${adjustments.saturation > 0 ? 'Increase' : 'Decrease'} by ${Math.abs(adjustments.saturation)}% for color vibrancy`);
  }
  if (adjustments.sharpen !== 0) {
    hints.push(`**Sharpening**: Apply ${adjustments.sharpen}/10 level for detail enhancement`);
  }

  if (hints.length === 0) {
    return '';
  }

  return `
**USER ADJUSTMENT PREFERENCES**:
${hints.join('\n')}
- Integrate these adjustments naturally into the enhancement
- Use them as creative direction hints, not strict technical parameters
`;
};

/**
 * Generate inspirational messages with AI
 */
export const generateInspirationalMessage = async (theme: Theme): Promise<string> => {
  const themeContext = {
    luxury: 'sophisticated, premium, and exclusive',
    dynamic: 'energetic, exciting, and bold',
    family: 'warm, welcoming, and heartfelt',
    modern: 'clean, contemporary, and stylish',
  };

  const prompt = `Generate a short, impactful message for a professional social media post. 
  Theme: ${theme} (${themeContext[theme]})
  Requirements:
  - Maximum 4-6 words
  - Professional and inspiring
  - Memorable and share-worthy
  - No quotation marks
  - Capitalize appropriately
  
  Examples for ${theme}:
  ${theme === 'luxury' ? '"Excellence Redefined", "The Art of Prestige", "Luxury Unveiled"' : ''}
  ${theme === 'dynamic' ? '"Power Unleashed", "Drive Your Passion", "Adventure Begins"' : ''}
  ${theme === 'family' ? '"Creating Memories Together", "Journey Starts Here", "Making Moments Matter"' : ''}
  ${theme === 'modern' ? '"Innovation Elevated", "Future Forward", "Design Perfected"' : ''}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', // Faster model for text-only generation
      contents: prompt,
    });
    return response.text.trim().replace(/["']/g, '');
  } catch (error) {
    console.error("Error generating message:", error);
    return theme === 'luxury' ? 'Excellence Awaits' :
           theme === 'dynamic' ? 'Adventure Calls' :
           theme === 'family' ? 'Memories Begin' : 'Simply Perfect';
  }
};

/**
 * Analyze an image and generate a dealership-focused social media caption
 * Optimized for car dealership customer delivery and vehicle handoff moments
 */
export const generateCaptionFromImage = async (
  base64ImageData: string,
  mimeType: string,
  options?: {
    tone?: 'friendly' | 'professional' | 'fun' | 'luxury' | 'witty' | 'inspirational' | 'motivational' | 'poetic' | 'bold' | 'humble' | 'trendy';
    includeHashtags?: boolean;
    maxWords?: number; // default 14-20 words
    dealershipName?: string;
    dealershipCity?: string;
  }
): Promise<string> => {
  const includeHashtags = options?.includeHashtags ?? true;
  const maxWords = options?.maxWords ?? 20;
  const dealershipInfo = [options?.dealershipName, options?.dealershipCity].filter(Boolean).join(' in ');

  const prompt = `You are a social media expert specializing in automotive dealership content that drives engagement and builds trust.

CONTEXT: This is a customer vehicle delivery photo for a car dealership's social media.
${dealershipInfo ? `
BRAND CONTEXT (if it fits naturally): ${dealershipInfo}
- Mention the dealership context at most once and only if it improves the caption's authenticity.
` : ''}

ANALYZE THE PHOTO:
- Look for: happy customers, vehicles, dealership setting, celebration moments
- Identify the vehicle type if visible (sedan, SUV, truck, luxury car, etc.)
- Infer if the vehicle is NEW or PRE-OWNED; avoid saying "new" if it looks pre-owned
- Note the mood and emotional tone of the moment

WRITE AN ENGAGING DEALERSHIP POST:
- ${maxWords} words maximum
- Celebrate the customer's moment (congratulate them on their vehicle; say "new" only if it appears new)
- Express genuine excitement and pride in helping them (warm, human voice)
- Use first-person plural "we" or "our team" perspective (dealership voice)
- Make it personal and authentic, never salesy or pushy
- Include a natural human touch (1 emoji max, placed near the end)
- Create emotional connection — this is about the customer's joy and milestone
- ${includeHashtags ? 'End with 3-5 automotive/dealership hashtags' : 'No hashtags'}
${dealershipInfo ? '- If it feels natural, lightly include the dealership name or city once (avoid sounding like an ad)' : ''}

DEALERSHIP CAPTION EXAMPLES:
"Congratulations to the Smith family on their beautiful new Tahoe! We loved being part of this special moment. Here's to many adventures ahead! 🚗✨ #NewCarDay #HappyCustomers #DealershipFamily"

"Another dream delivered! So proud to hand over the keys to this stunning ride. Enjoy every mile! 🎉 #CustomerDelivery #NewCar #DreamCar #CarDelivery"

"This smile says it all! Thrilled to welcome another happy customer to our family. Congrats on the new wheels! 🔥 #NewVehicle #CustomerAppreciation #CarDealership"

"Delivery day is our favorite day! Huge congratulations on this incredible vehicle. Drive safe and enjoy every moment! 💯 #VehicleDelivery #NewCar #HappyCustomer #DealershipLife"

IMPORTANT RULES:
- Focus on the CUSTOMER'S happiness and milestone, not just the vehicle
- If the vehicle appears pre-owned, avoid phrases like "brand new" or "new car"
- Keep it genuine and celebratory — dealerships are in the joy business
- 0–1 emoji total; never more than one
- Use automotive and dealership hashtags (like #NewCarDay #CustomerDelivery #DealershipFamily #CarDelivery)
- Write ONLY the caption text. No explanations, quotes, or extra formatting.`;


  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', // Faster model for text-only caption generation from images
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { data: base64ImageData, mimeType } },
        ],
      },
    });

    const text = (response as any)?.text || (response as any)?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join(' ');
    if (!text || typeof text !== 'string') {
      return 'Sharing the moment';
    }
    return text.trim();
  } catch (error) {
    console.error('Caption generation failed:', error);
    return 'Sharing the moment';
  }
};

/**
 * Generate relevant hashtags for an image
 * Returns array of hashtags based on image content and tone
 */
export const generateHashtagsFromImage = async (
  base64ImageData: string,
  mimeType: string,
  options?: {
    count?: number; // How many hashtags (default 5)
    trending?: boolean; // Include trending hashtags
    tone?: string; // Tone/vibe of hashtags
  }
): Promise<string[]> => {
  const count = options?.count || 5;
  const trending = options?.trending ?? true;
  const tone = options?.tone || 'general';

  const prompt = `Analyze this image and generate ${count} relevant, trending hashtags.

Requirements:
- ${count} hashtags exactly
- No hashtag symbol (#) - just the words
- Mix of: specific + broader + trending tags
- ${trending ? 'Include current trending hashtags' : 'Evergreen hashtags only'}
- Tone: ${tone}
- One per line

Format:
hashtag1
hashtag2
hashtag3
(etc.)`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', // Faster model for hashtag generation
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { data: base64ImageData, mimeType } },
        ],
      },
    });

    const text = (response as any)?.text || (response as any)?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join(' ');
    if (!text || typeof text !== 'string') {
      return ['photo', 'moment', 'day', 'vibes', 'blessed'];
    }

    // Parse hashtags from response
    const hashtags = text
      .split('\n')
      .map((tag: string) => tag.trim().toLowerCase().replace(/^#/, '').replace(/[^a-z0-9]/g, ''))
      .filter((tag: string) => tag.length > 0)
      .slice(0, count);

    return hashtags.length > 0 ? hashtags : ['photo', 'moment', 'day', 'vibes', 'blessed'];
  } catch (error) {
    console.error('Hashtag generation failed:', error);
    return ['photo', 'moment', 'day', 'vibes', 'blessed'];
  }
};

/**
 * Premium AI Image Enhancement
 */
export const enhanceImageWithAI = async (
  base64ImageData: string,
  mimeType: string,
  options: EnhancedAIOptions
): Promise<string | null> => {
  const model = 'gemini-2.5-flash-image';
  const {
    theme,
    message,
    ctaText,
    logoBase64,
    logoMimeType,
    aspectRatio,
    logoPosition,
    mode = 'professional',
    enhancementLevel = 'moderate',
    adjustments,
  } = options;

  const aspectRatioDescriptions: { [key: string]: string } = {
    '1:1': 'perfect square 1:1 (1080x1080) Instagram format',
    '9:16': 'vertical 9:16 (1080x1920) Instagram Story/Reels format',
    '1.91:1': 'horizontal 1.91:1 (1200x628) Facebook/LinkedIn format',
    'original': 'original aspect ratio',
  };

  const enhancementLevels = {
    subtle: 'Minimal, natural enhancement maintaining 95% original character',
    moderate: 'Balanced professional enhancement with noticeable improvement',
    dramatic: 'Bold transformation while maintaining photorealism',
  };

  let prompt = `
╔════════════════════════════════════════════════════════════════╗
║     PREMIUM AI PHOTO ENHANCEMENT - PROFESSIONAL GRADE          ║
║          Powered by Advanced Computer Vision AI                ║
╚════════════════════════════════════════════════════════════════╝

**ROLE**: Master Photographer & Creative Director
You are a world-renowned photographer combining technical mastery with artistic vision.

═══════════════════════════════════════════════════════════════
🎯 ABSOLUTE REQUIREMENTS (NON-NEGOTIABLE)
═══════════════════════════════════════════════════════════════

✓ PRESERVE 100% SUBJECT FIDELITY
  - People, faces, clothing, and main objects remain IDENTICAL
  - Zero alteration to facial features, body proportions, or identity
  - Preserve natural expressions and authentic moments

✓ PRESERVE 100% BACKGROUND & CONTEXT
  - Background elements (cars, buildings, scenery) remain COMPLETELY UNCHANGED
  - No background replacement, removal, or significant alterations
  - Only enhance existing background (lighting, clarity) - never modify content
  - If there's a car in the background: enhance its appearance but keep it EXACTLY as it is
  - This is a selfie enhancement, not a scene recreation

✓ STRICT ASPECT RATIO: ${aspectRatioDescriptions[aspectRatio]}
  - Compose and crop to exact specifications
  - Maintain subject as focal point within frame

✓ PHOTOREALISTIC QUALITY
  - All enhancements must be indistinguishable from camera-captured
  - No AI artifacts, no cartoon-like elements, no artificial look
  - Professional photography studio quality

═══════════════════════════════════════════════════════════════
🎨 CREATIVE DIRECTION
═══════════════════════════════════════════════════════════════

**THEME**: ${theme.toUpperCase()}
**AI MODE**: ${mode.toUpperCase()}
**ENHANCEMENT LEVEL**: ${enhancementLevels[enhancementLevel]}

${getAdvancedThemePrompt(theme, mode)}

${getModeInstructions(mode)}

${getAdjustmentHints(adjustments)}

═══════════════════════════════════════════════════════════════
✨ TYPOGRAPHY & DESIGN ELEMENTS
═══════════════════════════════════════════════════════════════
`;

  if (message) {
    prompt += `
**PRIMARY MESSAGE**: "${message}"
- Font: ${theme === 'luxury' ? 'Elegant serif (Playfair Display style)' : 
         theme === 'dynamic' ? 'Bold sans-serif (Montserrat ExtraBold)' :
         theme === 'family' ? 'Friendly sans-serif (Inter)' : 
         'Modern sans-serif (Inter/Gilroy)'}
- Size: Large, commanding presence
- Placement: Natural open space (ground, wall, sky) - NEVER over faces/subjects
- Color: ${theme === 'luxury' ? 'Gold/white with elegant shadow' :
          theme === 'dynamic' ? 'Bold white with strong contrast' :
          theme === 'family' ? 'Warm, inviting color' :
          'Clean white or brand color'}
- Effect: Subtle drop shadow for depth and readability
- Integration: Appears naturally part of the scene
- Smart Redundancy: If logo/brand is already visible on image, avoid repeating brand name in this text overlay
`;
  }

  if (ctaText) {
    prompt += `
**CALL-TO-ACTION**: "${ctaText}"
- Subtle placement in lower third or corner
- Smaller, secondary font treatment
- Clean, professional, non-intrusive
`;
  }

  if (logoBase64 && logoMimeType) {
    const logoPositions: { [key in LogoPosition]: string } = {
      'top-left': 'top-left corner with professional padding',
      'top-right': 'top-right corner with professional padding',
      'bottom-left': 'bottom-left corner with professional padding',
      'bottom-right': 'bottom-right corner with professional padding',
      'center': 'tastefully integrated near center on natural surface',
    };
    
    prompt += `
**BRAND LOGO**:
- Position: ${logoPositions[logoPosition]}
- Size: Professional watermark scale (medium, not dominant)
- Treatment: Clean integration with subtle shadow if needed
- Never obscures main subjects or key elements
`;
  }

  prompt += `
═══════════════════════════════════════════════════════════════
🔧 TECHNICAL SPECIFICATIONS
═══════════════════════════════════════════════════════════════

**Image Quality**:
- Resolution: Maximum available (aim for 4K equivalent)
- Sharpness: Tack-sharp with professional detail
- Noise: Clinical clean or tasteful film grain only
- Compression: Minimal, preserve maximum detail

**Color Science**:
- Bit depth: Maximum color accuracy
- Profile: sRGB for social media optimization
- Skin tones: Natural, flattering, accurate
- Consistency: Perfect color harmony throughout

**Professional Retouching**:
- Skin: Natural texture with subtle smoothing
- Eyes: Enhanced clarity with natural catchlights
- Teeth: Subtle whitening if visible
- Hair: Enhanced detail and natural shine
- Clothing: Wrinkle reduction, perfect creases

**Background Treatment**:
- NEVER replace or remove background elements
- NEVER use AI tools to change what's behind the subject
- ONLY enhance existing background (improve clarity, lighting, reduce noise)
- If there's a vehicle/car in background: enhance it but keep it exactly as photographed
- Maintain all spatial relationships and composition exactly as original

═══════════════════════════════════════════════════════════════
✅ FINAL QUALITY ASSURANCE
═══════════════════════════════════════════════════════════════

Before output, verify:
☑ Subject fidelity 100% preserved
☑ Aspect ratio exactly matched
☑ Professional color grade applied
☑ All text perfectly legible and integrated
☑ Logo professionally placed
☑ Zero AI artifacts or unrealistic elements
☑ Image looks like professional photography

**CRITICAL**: Output ONLY the final enhanced image. No text, code, or explanation.
`;

  const parts: { inlineData?: { data: string; mimeType: string }; text?: string }[] = [
    { text: prompt },
    { inlineData: { data: base64ImageData, mimeType: mimeType } },
  ];

  if (logoBase64 && logoMimeType) {
    parts.push({
      inlineData: {
        data: logoBase64,
        mimeType: logoMimeType,
      },
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    if (response?.promptFeedback?.blockReason) {
      throw new Error(`Content blocked: ${response.promptFeedback.blockReason}`);
    }

    const candidate = response?.candidates?.[0];
    if (!candidate) {
      throw new Error("No response from AI model");
    }

    if (!candidate.content?.parts?.length) {
      if (candidate.finishReason && candidate.finishReason !== 'STOP') {
        throw new Error(`Generation failed: ${candidate.finishReason}`);
      }
      throw new Error("Empty AI response");
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData?.data) {
        return part.inlineData.data;
      }
    }

    throw new Error("No image data in AI response");
  } catch (error) {
    console.error("AI Enhancement Error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown AI processing error");
  }
};

/**
 * Batch image enhancement for multiple images
 */
export const batchEnhanceImages = async (
  images: Array<{ data: string; mimeType: string }>,
  options: EnhancedAIOptions,
  onProgress?: (completed: number, total: number) => void
): Promise<Array<string | null>> => {
  const results: Array<string | null> = [];
  
  for (let i = 0; i < images.length; i++) {
    try {
      const result = await enhanceImageWithAI(images[i].data, images[i].mimeType, options);
      results.push(result);
      if (onProgress) {
        onProgress(i + 1, images.length);
      }
    } catch (error) {
      console.error(`Error enhancing image ${i + 1}:`, error);
      results.push(null);
    }
  }
  
  return results;
};
