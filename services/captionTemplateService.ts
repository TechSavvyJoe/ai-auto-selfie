/**
 * Caption Template Service
 * Provides pre-written caption templates that users can customize
 * 6 categories with 30+ templates total
 */

export interface CaptionTemplate {
  id: string;
  title: string;
  category: 'motivational' | 'funny' | 'professional' | 'casual' | 'bold' | 'elegant';
  template: string;
  placeholder: string;
  tone?: 'friendly' | 'professional' | 'fun' | 'luxury' | 'witty' | 'inspirational' | 'motivational' | 'poetic' | 'bold' | 'humble' | 'trendy';
  icon: string;
}

const CAPTION_TEMPLATES: CaptionTemplate[] = [
  // ===== MOTIVATIONAL (5 templates) =====
  {
    id: 'mot-1',
    title: 'Chase Dreams',
    category: 'motivational',
    template: 'Chasing {goal} like it\'s my last day on Earth. {energy}',
    placeholder: 'your dream / goal',
    tone: 'motivational',
    icon: '🚀',
  },
  {
    id: 'mot-2',
    title: 'Growth Mindset',
    category: 'motivational',
    template: 'Every moment is a chance to grow. Today I chose {choice}.',
    placeholder: 'growth / change / strength',
    tone: 'inspirational',
    icon: '📈',
  },
  {
    id: 'mot-3',
    title: 'Version of Me',
    category: 'motivational',
    template: 'Working on becoming the {version} version of myself.',
    placeholder: 'best / strongest / most authentic',
    tone: 'motivational',
    icon: '💪',
  },
  {
    id: 'mot-4',
    title: 'No Limits',
    category: 'motivational',
    template: 'They said {obstacle}. I said {response}.',
    placeholder: 'obstacle / response',
    tone: 'bold',
    icon: '⚡',
  },
  {
    id: 'mot-5',
    title: 'Unstoppable',
    category: 'motivational',
    template: 'On a mission. {mission} fuels me. Let\'s go.',
    placeholder: 'passion / vision / dream',
    tone: 'bold',
    icon: '🔥',
  },

  // ===== FUNNY (6 templates) =====
  {
    id: 'fun-1',
    title: 'POV',
    category: 'funny',
    template: 'POV: You just {realization} {emoji}',
    placeholder: 'realized something epic',
    tone: 'fun',
    icon: '😏',
  },
  {
    id: 'fun-2',
    title: 'That Moment',
    category: 'funny',
    template: 'That moment when {funny-situation}. {relatable}',
    placeholder: 'something relatable happens',
    tone: 'witty',
    icon: '😂',
  },
  {
    id: 'fun-3',
    title: 'Chaos Energy',
    category: 'funny',
    template: '{chaos} energy is {status}. {caption}',
    placeholder: 'My / This',
    tone: 'fun',
    icon: '🤪',
  },
  {
    id: 'fun-4',
    title: 'Blessed',
    category: 'funny',
    template: 'Main character energy is {adjective}. {result}',
    placeholder: 'unmatched / immaculate',
    tone: 'witty',
    icon: '👑',
  },
  {
    id: 'fun-5',
    title: 'No Apologies',
    category: 'funny',
    template: '{situation} and no, I\'m not sorry.',
    placeholder: 'I did that',
    tone: 'bold',
    icon: '🤷',
  },
  {
    id: 'fun-6',
    title: 'Living',
    category: 'funny',
    template: 'Living my best {adjective} life and loving every second.',
    placeholder: 'chaotic / messy / unhinged',
    tone: 'fun',
    icon: '🎉',
  },

  // ===== PROFESSIONAL (5 templates) =====
  {
    id: 'pro-1',
    title: 'Excellence',
    category: 'professional',
    template: '{title}: Crafting {what} with intentionality and care.',
    placeholder: 'success / experiences / moments',
    tone: 'professional',
    icon: '✨',
  },
  {
    id: 'pro-2',
    title: 'Passion Project',
    category: 'professional',
    template: 'Passionate about {passion}. Committed to {commitment}.',
    placeholder: 'passion / commitment',
    tone: 'professional',
    icon: '🎯',
  },
  {
    id: 'pro-3',
    title: 'Value Creator',
    category: 'professional',
    template: 'Building {what}. Creating {impact}. Making {difference}.',
    placeholder: 'what / impact / difference',
    tone: 'professional',
    icon: '💼',
  },
  {
    id: 'pro-4',
    title: 'Expert Vibes',
    category: 'professional',
    template: 'When {area} meets {approach}, magic happens.',
    placeholder: 'expertise / strategy',
    tone: 'professional',
    icon: '🧠',
  },
  {
    id: 'pro-5',
    title: 'Vision',
    category: 'professional',
    template: 'Vision: {vision}. Method: {method}. Result: {result}.',
    placeholder: 'vision / method / result',
    tone: 'professional',
    icon: '🔭',
  },

  // ===== CASUAL (5 templates) =====
  {
    id: 'cas-1',
    title: 'Vibes Check',
    category: 'casual',
    template: '{vibe} vibes only. {mood}.',
    placeholder: 'good / golden / perfect',
    tone: 'friendly',
    icon: '✌️',
  },
  {
    id: 'cas-2',
    title: 'Simple Moment',
    category: 'casual',
    template: 'Just {action} and {feeling}. Nothing fancy, just {authentic}.',
    placeholder: 'action / feeling / authentic',
    tone: 'humble',
    icon: '😌',
  },
  {
    id: 'cas-3',
    title: 'Grateful',
    category: 'casual',
    template: 'Grateful for {things} and {feeling}.',
    placeholder: 'simple things / this moment',
    tone: 'humble',
    icon: '🙏',
  },
  {
    id: 'cas-4',
    title: 'In This Moment',
    category: 'casual',
    template: 'In this moment: {mood}, {feeling}, {realization}.',
    placeholder: 'happy / peaceful / here',
    tone: 'friendly',
    icon: '🌟',
  },
  {
    id: 'cas-5',
    title: 'Just Here',
    category: 'casual',
    template: 'Just {action}, just {feeling}, just {present}.',
    placeholder: 'existing / breathing / present',
    tone: 'friendly',
    icon: '💫',
  },

  // ===== BOLD (5 templates) =====
  {
    id: 'bol-1',
    title: 'Own It',
    category: 'bold',
    template: 'I am {statement}. No apologies, no explanations.',
    placeholder: 'exactly who I am / unapologetically me',
    tone: 'bold',
    icon: '💎',
  },
  {
    id: 'bol-2',
    title: 'Unforgettable',
    category: 'bold',
    template: '{statement}. That\'s just how I move.',
    placeholder: 'Bold statement here',
    tone: 'bold',
    icon: '👀',
  },
  {
    id: 'bol-3',
    title: 'Confidence',
    category: 'bold',
    template: 'Confidence looks like {description}.',
    placeholder: 'this / me / not caring what people think',
    tone: 'bold',
    icon: '🔥',
  },
  {
    id: 'bol-4',
    title: 'Setting Standards',
    category: 'bold',
    template: 'Setting the bar {location}. {result}.',
    placeholder: 'high / here / sky high',
    tone: 'bold',
    icon: '📍',
  },
  {
    id: 'bol-5',
    title: 'Statement Piece',
    category: 'bold',
    template: '{statement} — and I\'m not changing my mind.',
    placeholder: 'Your bold statement',
    tone: 'bold',
    icon: '✊',
  },

  // ===== ELEGANT (4 templates) =====
  {
    id: 'ele-1',
    title: 'Poetic',
    category: 'elegant',
    template: '{poetic_line}. In {place}, I found {revelation}.',
    placeholder: 'light / stillness / here',
    tone: 'poetic',
    icon: '✨',
  },
  {
    id: 'ele-2',
    title: 'Refined',
    category: 'elegant',
    template: 'Elegance is {definition}. {observation}.',
    placeholder: 'simplicity / confidence / grace',
    tone: 'luxury',
    icon: '💫',
  },
  {
    id: 'ele-3',
    title: 'Timeless',
    category: 'elegant',
    template: 'Some moments are timeless. {reflection}.',
    placeholder: 'This is one',
    tone: 'poetic',
    icon: '⏳',
  },
  {
    id: 'ele-4',
    title: 'Artistic',
    category: 'elegant',
    template: 'Life is art. {observation}. {wisdom}.',
    placeholder: 'This is my masterpiece / Live accordingly',
    tone: 'poetic',
    icon: '🎨',
  },
];

class CaptionTemplateService {
  /**
   * Get all templates
   */
  getAllTemplates(): CaptionTemplate[] {
    return CAPTION_TEMPLATES;
  }

  /**
   * Get templates by category
   */
  getByCategory(category: CaptionTemplate['category']): CaptionTemplate[] {
    return CAPTION_TEMPLATES.filter(t => t.category === category);
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): CaptionTemplate | undefined {
    return CAPTION_TEMPLATES.find(t => t.id === id);
  }

  /**
   * Apply a template with user customization
   * Replaces {placeholder} with user input
   */
  applyTemplate(template: CaptionTemplate, customizations: Record<string, string>): string {
    let result = template.template;

    // Replace all {placeholder} with customizations
    Object.entries(customizations).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, value);
    });

    // Remove any unreplaced placeholders
    result = result.replace(/\{[^}]+\}/g, '');

    return result.trim();
  }

  /**
   * Get all available categories
   */
  getCategories(): Array<{ id: CaptionTemplate['category']; label: string; icon: string; count: number }> {
    const categories: Record<CaptionTemplate['category'], string> = {
      motivational: '💪 Motivational',
      funny: '😂 Funny',
      professional: '💼 Professional',
      casual: '✌️ Casual',
      bold: '🔥 Bold',
      elegant: '✨ Elegant',
    };

    const icons: Record<CaptionTemplate['category'], string> = {
      motivational: '💪',
      funny: '😂',
      professional: '💼',
      casual: '✌️',
      bold: '🔥',
      elegant: '✨',
    };

    return Object.entries(categories).map(([id, label]) => ({
      id: id as CaptionTemplate['category'],
      label,
      icon: icons[id as CaptionTemplate['category']],
      count: CAPTION_TEMPLATES.filter(t => t.category === id).length,
    }));
  }

  /**
   * Search templates by keyword
   */
  search(keyword: string): CaptionTemplate[] {
    const lowercased = keyword.toLowerCase();
    return CAPTION_TEMPLATES.filter(t =>
      t.title.toLowerCase().includes(lowercased) ||
      t.template.toLowerCase().includes(lowercased)
    );
  }
}

let instance: CaptionTemplateService | null = null;

export const getCaptionTemplateService = (): CaptionTemplateService => {
  if (!instance) {
    instance = new CaptionTemplateService();
  }
  return instance;
};

export default CaptionTemplateService;
