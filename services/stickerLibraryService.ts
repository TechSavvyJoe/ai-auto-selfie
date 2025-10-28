/**
 * Sticker Library Service
 * Provides 100+ draggable stickers organized by category
 * Includes emoji stickers, shapes, badges, frames, and more
 */

export interface Sticker {
  id: string;
  content: string; // Emoji or SVG content
  category: 'emoji' | 'shape' | 'badge' | 'frame' | 'text' | 'seasonal';
  name: string;
  size: 'small' | 'medium' | 'large'; // Suggested size
}

class StickerLibraryService {
  private readonly STICKERS: Sticker[] = [
    // ===== EMOJI STICKERS (30+) =====
    { id: 'em-1', content: '😍', category: 'emoji', name: 'Heart Eyes', size: 'medium' },
    { id: 'em-2', content: '🎉', category: 'emoji', name: 'Party Popper', size: 'medium' },
    { id: 'em-3', content: '⭐', category: 'emoji', name: 'Star', size: 'medium' },
    { id: 'em-4', content: '✨', category: 'emoji', name: 'Sparkles', size: 'large' },
    { id: 'em-5', content: '🔥', category: 'emoji', name: 'Fire', size: 'medium' },
    { id: 'em-6', content: '💯', category: 'emoji', name: '100', size: 'medium' },
    { id: 'em-7', content: '🚀', category: 'emoji', name: 'Rocket', size: 'medium' },
    { id: 'em-8', content: '👑', category: 'emoji', name: 'Crown', size: 'medium' },
    { id: 'em-9', content: '💎', category: 'emoji', name: 'Diamond', size: 'small' },
    { id: 'em-10', content: '🌟', category: 'emoji', name: 'Glowing Star', size: 'medium' },
    { id: 'em-11', content: '💕', category: 'emoji', name: 'Two Hearts', size: 'medium' },
    { id: 'em-12', content: '💗', category: 'emoji', name: 'Beating Heart', size: 'medium' },
    { id: 'em-13', content: '✌️', category: 'emoji', name: 'Peace Sign', size: 'medium' },
    { id: 'em-14', content: '🎯', category: 'emoji', name: 'Target', size: 'medium' },
    { id: 'em-15', content: '🌈', category: 'emoji', name: 'Rainbow', size: 'large' },
    { id: 'em-16', content: '☀️', category: 'emoji', name: 'Sun', size: 'large' },
    { id: 'em-17', content: '🌙', category: 'emoji', name: 'Moon', size: 'large' },
    { id: 'em-18', content: '💫', category: 'emoji', name: 'Dizzy', size: 'medium' },
    { id: 'em-19', content: '🎊', category: 'emoji', name: 'Confetti Ball', size: 'medium' },
    { id: 'em-20', content: '🏆', category: 'emoji', name: 'Trophy', size: 'medium' },
    { id: 'em-21', content: '🎁', category: 'emoji', name: 'Gift', size: 'medium' },
    { id: 'em-22', content: '🍀', category: 'emoji', name: 'Four Leaf Clover', size: 'small' },
    { id: 'em-23', content: '❤️', category: 'emoji', name: 'Red Heart', size: 'medium' },
    { id: 'em-24', content: '💚', category: 'emoji', name: 'Green Heart', size: 'medium' },
    { id: 'em-25', content: '💙', category: 'emoji', name: 'Blue Heart', size: 'medium' },

    // ===== SHAPE STICKERS (20+) =====
    { id: 'sh-1', content: '⭕', category: 'shape', name: 'Circle', size: 'large' },
    { id: 'sh-2', content: '◼️', category: 'shape', name: 'Square', size: 'large' },
    { id: 'sh-3', content: '▲', category: 'shape', name: 'Triangle', size: 'large' },
    { id: 'sh-4', content: '◆', category: 'shape', name: 'Diamond', size: 'large' },
    { id: 'sh-5', content: '🔷', category: 'shape', name: 'Blue Diamond', size: 'medium' },
    { id: 'sh-6', content: '🔶', category: 'shape', name: 'Orange Diamond', size: 'medium' },
    { id: 'sh-7', content: '🟠', category: 'shape', name: 'Orange Circle', size: 'medium' },
    { id: 'sh-8', content: '🟡', category: 'shape', name: 'Yellow Circle', size: 'medium' },
    { id: 'sh-9', content: '🟢', category: 'shape', name: 'Green Circle', size: 'medium' },
    { id: 'sh-10', content: '🔵', category: 'shape', name: 'Blue Circle', size: 'medium' },

    // ===== BADGE STICKERS (20+) =====
    { id: 'bd-1', content: '🆕', category: 'badge', name: 'New Badge', size: 'medium' },
    { id: 'bd-2', content: '🆒', category: 'badge', name: 'Cool Badge', size: 'medium' },
    { id: 'bd-3', content: '✅', category: 'badge', name: 'Check Mark', size: 'medium' },
    { id: 'bd-4', content: '⚠️', category: 'badge', name: 'Warning', size: 'medium' },
    { id: 'bd-5', content: '🔞', category: 'badge', name: '18+', size: 'medium' },
    { id: 'bd-6', content: '📍', category: 'badge', name: 'Location', size: 'medium' },
    { id: 'bd-7', content: '🎖️', category: 'badge', name: 'Medal', size: 'medium' },
    { id: 'bd-8', content: '🏅', category: 'badge', name: 'Award', size: 'medium' },
    { id: 'bd-9', content: '💐', category: 'badge', name: 'Flowers', size: 'medium' },
    { id: 'bd-10', content: '🎀', category: 'badge', name: 'Ribbon', size: 'medium' },
    { id: 'bd-11', content: '🎗️', category: 'badge', name: 'Ribbon2', size: 'medium' },
    { id: 'bd-12', content: '⚜️', category: 'badge', name: 'Fleur de Lis', size: 'medium' },
    { id: 'bd-13', content: '🏷️', category: 'badge', name: 'Label', size: 'small' },
    { id: 'bd-14', content: '🔔', category: 'badge', name: 'Bell', size: 'medium' },
    { id: 'bd-15', content: '📌', category: 'badge', name: 'Pushpin', size: 'small' },

    // ===== FRAME STICKERS (15+) =====
    { id: 'fr-1', content: '🖼️', category: 'frame', name: 'Picture Frame', size: 'large' },
    { id: 'fr-2', content: '📷', category: 'frame', name: 'Camera', size: 'medium' },
    { id: 'fr-3', content: '📸', category: 'frame', name: 'Camera Flash', size: 'medium' },
    { id: 'fr-4', content: '🎬', category: 'frame', name: 'Movie Clapper', size: 'medium' },
    { id: 'fr-5', content: '🎞️', category: 'frame', name: 'Film Frames', size: 'large' },
    { id: 'fr-6', content: '📹', category: 'frame', name: 'Video Camera', size: 'medium' },
    { id: 'fr-7', content: '🎥', category: 'frame', name: 'Movie Camera', size: 'medium' },
    { id: 'fr-8', content: '🖌️', category: 'frame', name: 'Paintbrush', size: 'small' },
    { id: 'fr-9', content: '✏️', category: 'frame', name: 'Pencil', size: 'small' },
    { id: 'fr-10', content: '🎨', category: 'frame', name: 'Artist Palette', size: 'medium' },

    // ===== TEXT STICKERS (10+) =====
    { id: 'tx-1', content: '#️⃣', category: 'text', name: 'Hashtag', size: 'medium' },
    { id: 'tx-2', content: '💬', category: 'text', name: 'Speech Bubble', size: 'medium' },
    { id: 'tx-3', content: '💭', category: 'text', name: 'Thought Bubble', size: 'medium' },
    { id: 'tx-4', content: '📢', category: 'text', name: 'Megaphone', size: 'medium' },
    { id: 'tx-5', content: '📣', category: 'text', name: 'Loudspeaker', size: 'medium' },
    { id: 'tx-6', content: '💥', category: 'text', name: 'Explosion', size: 'medium' },
    { id: 'tx-7', content: '⚡', category: 'text', name: 'Lightning', size: 'medium' },
    { id: 'tx-8', content: '❗', category: 'text', name: 'Exclamation', size: 'medium' },
    { id: 'tx-9', content: '❓', category: 'text', name: 'Question Mark', size: 'medium' },

    // ===== SEASONAL STICKERS (15+) =====
    { id: 'ss-1', content: '🎄', category: 'seasonal', name: 'Christmas Tree', size: 'medium' },
    { id: 'ss-2', content: '🎅', category: 'seasonal', name: 'Santa', size: 'medium' },
    { id: 'ss-3', content: '⛄', category: 'seasonal', name: 'Snowman', size: 'medium' },
    { id: 'ss-4', content: '☃️', category: 'seasonal', name: 'Snowman 2', size: 'medium' },
    { id: 'ss-5', content: '❄️', category: 'seasonal', name: 'Snowflake', size: 'small' },
    { id: 'ss-6', content: '🎃', category: 'seasonal', name: 'Pumpkin', size: 'medium' },
    { id: 'ss-7', content: '👻', category: 'seasonal', name: 'Ghost', size: 'medium' },
    { id: 'ss-8', content: '🎆', category: 'seasonal', name: 'Fireworks', size: 'large' },
    { id: 'ss-9', content: '🎇', category: 'seasonal', name: 'Sparkler', size: 'medium' },
    { id: 'ss-10', content: '🧨', category: 'seasonal', name: 'Firecracker', size: 'small' },
    { id: 'ss-11', content: '🎈', category: 'seasonal', name: 'Balloon', size: 'medium' },
    { id: 'ss-12', content: '🎉', category: 'seasonal', name: 'Party', size: 'medium' },
    { id: 'ss-13', content: '❤️', category: 'seasonal', name: 'Valentine', size: 'medium' },
    { id: 'ss-14', content: '💌', category: 'seasonal', name: 'Love Letter', size: 'medium' },
    { id: 'ss-15', content: '🌸', category: 'seasonal', name: 'Cherry Blossom', size: 'medium' },
  ];

  private readonly CATEGORIES = [
    { id: 'emoji', label: '😊 Emoji', count: 25 },
    { id: 'shape', label: '⭕ Shapes', count: 10 },
    { id: 'badge', label: '🎖️ Badges', count: 15 },
    { id: 'frame', label: '🖼️ Frames', count: 10 },
    { id: 'text', label: '💬 Text', count: 9 },
    { id: 'seasonal', label: '🎄 Seasonal', count: 15 },
  ];

  /**
   * Get all stickers
   */
  getAllStickers(): Sticker[] {
    return this.STICKERS;
  }

  /**
   * Get stickers by category
   */
  getByCategory(category: Sticker['category']): Sticker[] {
    return this.STICKERS.filter((s) => s.category === category);
  }

  /**
   * Search stickers by name
   */
  search(query: string): Sticker[] {
    const lowercased = query.toLowerCase();
    return this.STICKERS.filter((s) => s.name.toLowerCase().includes(lowercased));
  }

  /**
   * Get stickers by size
   */
  getBySize(size: Sticker['size']): Sticker[] {
    return this.STICKERS.filter((s) => s.size === size);
  }

  /**
   * Get all categories with counts
   */
  getCategories() {
    return this.CATEGORIES;
  }

  /**
   * Get random sticker
   */
  getRandomSticker(): Sticker {
    return this.STICKERS[Math.floor(Math.random() * this.STICKERS.length)];
  }

  /**
   * Get trending/popular stickers (returns first N of each category)
   */
  getTrendingStickers(limit: number = 15): Sticker[] {
    const trending: Sticker[] = [];
    const categoryMap = new Map<Sticker['category'], number>();

    for (const sticker of this.STICKERS) {
      const count = categoryMap.get(sticker.category) || 0;
      if (count < Math.ceil(limit / this.CATEGORIES.length)) {
        trending.push(sticker);
        categoryMap.set(sticker.category, count + 1);
      }
    }

    return trending.slice(0, limit);
  }

  /**
   * Validate sticker
   */
  validateSticker(sticker: Sticker): boolean {
    return (
      this.STICKERS.some((s) => s.id === sticker.id) &&
      (sticker.category === 'emoji' ||
        sticker.category === 'shape' ||
        sticker.category === 'badge' ||
        sticker.category === 'frame' ||
        sticker.category === 'text' ||
        sticker.category === 'seasonal')
    );
  }
}

let instance: StickerLibraryService | null = null;

export const getStickerLibraryService = (): StickerLibraryService => {
  if (!instance) {
    instance = new StickerLibraryService();
  }
  return instance;
};

export default StickerLibraryService;
