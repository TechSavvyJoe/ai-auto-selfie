import React, { useState, useMemo } from 'react';
import Icon from './common/Icon';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const EMOJI_CATEGORIES = {
  'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😌', '😔', '😑', '😐', '😶', '🥱', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤮', '🤮', '🤢', '🤮', '🤮'],
  'Hearts & Love': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌', '💋', '👋', '🤚', '🖐️', '✋', '🖖'],
  'Hand Gestures': ['👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🤜', '🤛'],
  'People': ['👶', '👧', '🧒', '👦', '👨', '👩', '👴', '👵', '👨‍🦰', '👨‍🦱', '👨‍🦳', '👨‍🦲', '👩‍🦰', '👩‍🦱', '👩‍🦳', '👩‍🦲', '👶', '🧑', '👨‍⚕️', '👩‍⚕️', '👨‍🎓', '👩‍🎓', '👨‍🎨', '👩‍🎨'],
  'Nature': ['🌳', '🌲', '🌴', '🌱', '🌿', '☘️', '🍀', '🎍', '🎎', '🎏', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌻', '🌼', '🌞', '🌝', '🌛', '🌜', '✨', '⭐', '🌟', '💫', '🌠'],
  'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴'],
  'Food & Drink': ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥔', '🍠', '🥐', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🥓', '🥔', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮', '🌯', '🥗', '🥘', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🍰', '🎂', '🧁', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🍯', '☕', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃'],
  'Activities': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎳', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '⛸️', '🎣', '🎽', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚴', '🚵', '🎯', '🪀', '🪃', '🎮', '🎲', '♟️', '🎪', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸'],
  'Travel': ['✈️', '🚁', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🚚', '🚛', '🚜', '🏎️', '🏍️', '🛵', '🦯', '🦽', '🦼', '🛺', '🚲', '🛴', '🛹', '🛼', '🚏', '⛽', '🚨', '🚥', '🚦', '🛑', '🚧', '⚓', '⛵', '🚤', '🛳️', '🛥️', '🛩️', '💺', '🚁', '🛰️', '🚀', '🛸'],
  'Objects': ['⌚', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '🧮', '🎥', '🎬', '📺', '📷', '📸', '📹', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🔊', '🔉', '🔈', '📢', '📣', '📯', '🔔', '🔕', '🎵', '🎶', '💿', '📻', '📼', '🎤', '🎧', '📕', '📖', '📗', '📘', '📙', '📚', '📓', '📔', '📒', '📑', '🧷', '🧵', '🧶', '📝', '✏️', '✒️', '🖋️', '🖊️', '🖌️', '🖍️', '📝'],
  'Symbols': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⚛️', '🔱', '⚜️', '🔰', '⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔥', '🌪️', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '💧', '💦', '☔'],
  'Flags': ['🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇮🇳', '🇯🇵', '🇰🇷', '🇨🇳', '🇧🇷', '🇲🇽', '🇮🇹', '🇫🇷', '🇩🇪', '🇪🇸', '🇷🇺', '🇮🇮', '🇸🇦', '🇬🇴', '🇿🇦', '🇪🇬'],
};

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof EMOJI_CATEGORIES>('Smileys');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmojis = useMemo(() => {
    if (!searchTerm) {
      return EMOJI_CATEGORIES[selectedCategory];
    }

    const searchLower = searchTerm.toLowerCase();
    const categoryKey = selectedCategory.toLowerCase();

    if (categoryKey.includes(searchLower)) {
      return EMOJI_CATEGORIES[selectedCategory];
    }

    // Simple search by category name
    return Object.entries(EMOJI_CATEGORIES)
      .find(([key]) => key.toLowerCase().includes(searchLower))?.[1] ||
      EMOJI_CATEGORIES[selectedCategory];
  }, [selectedCategory, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-gradient-to-br from-gray-900 via-neutral-900 to-black rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative px-6 py-4 border-b border-gray-800/50 bg-gradient-to-r from-primary-500/10 via-transparent to-transparent">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-2xl">😊</span>
              Emoji Picker
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-all"
            >
              <Icon type="close" className="w-5 h-5 text-white/60 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-gray-800/50">
          <input
            type="text"
            placeholder="Search category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-white/40 focus:border-primary-500 focus:outline-none"
          />
        </div>

        {/* Category Tabs */}
        <div className="px-4 py-3 border-b border-gray-800/50 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {Object.keys(EMOJI_CATEGORIES).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setSelectedCategory(category as keyof typeof EMOJI_CATEGORIES);
                  setSearchTerm('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-800 text-white/70 hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Emoji Grid */}
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-8 gap-2">
            {filteredEmojis.map((emoji, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  onSelect(emoji);
                  onClose();
                }}
                className="p-2 text-2xl hover:bg-gray-800 rounded-lg transition-all hover:scale-110"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-800/50 bg-gray-900/50 text-xs text-white/60">
          Click emoji to insert • {filteredEmojis.length} emojis available
        </div>
      </div>
    </div>
  );
};

export default EmojiPicker;
