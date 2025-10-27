import { GoogleGenAI, Modality } from "@google/genai";
// FIX: Import LogoPosition type to be used in positionMap.
import { EditOptions, Theme, LogoPosition } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getThemePrompt = (theme: Theme) => {
    switch (theme) {
        case 'luxury':
            return `
- **VISUAL STYLE:** Cinematic, sophisticated, and premium.
- **COLOR GRADE:** Deepen shadows and create a high-contrast, slightly desaturated look. Emphasize metallic sheens and reflections. Think of a high-end car commercial.
- **TYPOGRAPHY:** Use a sophisticated, elegant, high-contrast serif font (like Didot or a stylish Playfair Display).
- **BACKGROUND:** If enhancing, apply a creamy, professional bokeh. If replacing, use a minimalist concrete space, a modern showroom with soft architectural lighting, or a dramatic nighttime city scene. Focus on photorealism.
`;
        case 'dynamic':
            return `
- **VISUAL STYLE:** Energetic, vibrant, and exciting.
- **COLOR GRADE:** Boost saturation and vibrancy. Create a clean, bright, high-energy feel. Add subtle motion blur to the background to imply movement.
- **TYPOGRAPHY:** Use a strong, bold, impactful sans-serif font (like Helvetica Now Display Bold or Montserrat ExtraBold). It can be slightly italicized to suggest speed.
- **BACKGROUND:** If enhancing, add a sense of speed with subtle directional blur. If replacing, use a winding mountain road, an urban street with light trails, or a clean, modern racetrack setting.
`;
        case 'family':
            return `
- **VISUAL STYLE:** Warm, inviting, and trustworthy.
- **COLOR GRADE:** Bright, warm, and natural lighting. Think of a sunny afternoon. The colors should be welcoming and true-to-life.
- **TYPOGRAPHY:** Use a clean, friendly, and highly-readable sans-serif font (like Inter or Gilroy).
- **BACKGROUND:** If enhancing, ensure the original background looks clean and pleasant. If replacing, use a scenic family-friendly location like a beautiful suburban home driveway, a park, or a coastal road during the day.
`;
        case 'modern':
        default:
            return `
- **VISUAL STYLE:** Clean, crisp, and minimalist.
- **COLOR GRADE:** A very natural and balanced color grade. Focus on clarity, sharpness, and true-to-life colors.
- **TYPOGRAPHY:** Use an elegant, modern, and highly-readable sans-serif font family (like Inter or Gilroy).
- **BACKGROUND:** If enhancing, subtly clean up distracting elements. If replacing, use a clean, professional, light-gray cyclorama studio wall for a perfect product-focused shot. Ensure perfect, soft lighting.
`;
    }
}


export const generateInspirationalMessage = async (theme: Theme): Promise<string> => {
    let prompt = `Generate a short, celebratory message for a social media post about a customer getting a new car. Max 5 words. The theme is "${theme}". Be creative and align with the theme's tone.`;
    
    if (theme === 'luxury') prompt += ' Examples: "Unveiling Perfection.", "The Art of Arrival.", "Excellence, Delivered."';
    if (theme === 'dynamic') prompt += ' Examples: "Adventure Activated.", "Unleash the Drive.", "The Thrill Begins."';
    if (theme === 'family') prompt += ' Examples: "New Journeys Ahead.", "The Next Chapter Awaits.", "Making Memories, Miles at a Time."';
    if (theme === 'modern') prompt += ' Examples: "Simply Stunning.", "Future is Now.", "Design Driven."';

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim().replace(/"/g, '');
    } catch (error) {
        console.error("Error generating inspirational message:", error);
        return "Congratulations!";
    }
};

export const enhanceImageWithAI = async (
  base64ImageData: string,
  mimeType: string,
  options: EditOptions
): Promise<string | null> => {
  const model = 'gemini-2.5-flash-image';
  const { theme, message, ctaText, logoBase64, logoMimeType, aspectRatio, logoPosition } = options;

  const ratioMap: { [key: string]: string } = {
    '1:1': 'a square 1:1 aspect ratio',
    '9:16': 'a vertical 9:16 aspect ratio',
    '1.91:1': 'a horizontal 1.91:1 aspect ratio',
    'original': 'its original aspect ratio',
  };
  const targetAspectRatio = ratioMap[aspectRatio];

  let prompt = `
**ROLE: World-Class Creative Director for Automotive Social Media**

**MASTER DIRECTIVE: Your task is to transform a customer photo into a high-end, professional social media post for a car dealership. The final output must be photorealistic, aesthetically pleasing, and adhere strictly to the theme.**

**UNBREAKABLE RULE #1: ABSOLUTE SUBJECT FIDELITY.**
You are FORBIDDEN from changing, replacing, redrawing, or altering the people or the main vehicle in the original photo. They must be preserved with 100% accuracy. Your job is to EDIT AND ENHANCE, not recreate.

**UNBREAKABLE RULE #2: STRICT ASPECT RATIO.**
The final output image MUST strictly be ${targetAspectRatio}. This is a non-negotiable instruction. Creatively crop and compose the shot to meet this requirement while keeping the subjects as the focal point.

**UNBREAKABLE RULE #3: ABSOLUTE PHOTOREALISM.**
All edits, especially background replacements and lighting adjustments, must be flawlessly photorealistic. The final image should look like it was captured by a professional automotive photographer, not generated by AI. Avoid any cartoonish or artificial artifacts.

---
**CREATIVE BRIEF**

**1. THEME & AESTHETIC:**
- The overall theme for this post is: **${theme.toUpperCase()}**.
${getThemePrompt(theme)}

**2. TYPOGRAPHY & MESSAGING:**
- **Primary Message:** Overlay the text: "${message || 'Congratulations!'}". This text is a core design element. Place it intelligently in a natural open space (e.g., on the ground, an empty wall, the sky) where it is highly legible but does not obstruct faces, bodies, or key vehicle features (grille, logos, headlights).
- **Call to Action (CTA):** If provided, subtly integrate the text "${ctaText}" in a less prominent location, like a lower corner. Use a smaller, simple, clean font for the CTA. It should be legible but not distracting.

**3. BRAND INTEGRATION (LOGO):**
`;

  if (logoBase64 && logoMimeType) {
    const positionMap: { [key in LogoPosition]: string } = {
        'top-left': 'in the top-left corner',
        'top-right': 'in the top-right corner',
        'bottom-left': 'in the bottom-left corner',
        'bottom-right': 'in the bottom-right corner',
        'center': 'thoughtfully near the center, perhaps on the ground or a surface, ensuring it doesn\'t cover the main subjects.',
    };
    const positionDescription = positionMap[logoPosition] || positionMap['bottom-right'];
    prompt += `- A dealership logo is provided. Place this logo tastefully ${positionDescription}. It should be medium-sized and unobtrusive, integrated naturally with the scene. If it helps legibility, apply a very subtle, soft drop shadow.`;
  } else {
    prompt += `- No logo has been provided for this image.`;
  }
  
  prompt += `
---
**FINAL EXECUTION CHECKLIST:**
1.  Perform a final professional color grade according to the theme.
2.  Ensure lighting on subjects is flattering and consistent with the scene.
3.  The final result must look like a photograph from a professional automotive photographer's portfolio.

**CRITICAL FINAL INSTRUCTION: Your output MUST be ONLY the final edited image file itself. Do not output any text, commentary, code, or explanation. Just the image.**
  `;

  const parts: { inlineData?: { data: string; mimeType: string; }; text?: string; }[] = [
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
      throw new Error(`Request blocked: ${response.promptFeedback.blockReason}. Adjust text or images.`);
    }

    const candidate = response?.candidates?.[0];

    if (!candidate) {
      throw new Error("AI returned no candidates. This could be a model issue or safety filter.");
    }

    if (!candidate.content?.parts?.length) {
      if (candidate.finishReason && candidate.finishReason !== 'STOP') {
        throw new Error(`Image generation failed. Reason: ${candidate.finishReason}.`);
      }
      throw new Error("AI returned an empty response. This may be due to safety filters.");
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData?.data) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("AI response did not contain valid image data.");
  } catch (error) {
    console.error("Error during AI image enhancement:", error);
    if (error instanceof Error) {
      throw error; 
    }
    throw new Error("An unknown error occurred during AI processing.");
  }
};