import React, { useState, useCallback } from 'react';
import Button from './common/Button';
import Icon from './common/Icon';

interface CaptionEditorProps {
  caption: string;
  onSave: (newCaption: string) => void;
  onCancel?: () => void;
  className?: string;
  compactMode?: boolean; // For ResultView bubble display
}

const CaptionEditor: React.FC<CaptionEditorProps> = ({
  caption,
  onSave,
  onCancel,
  className = '',
  compactMode = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(caption);

  const handleSave = useCallback(() => {
    const trimmed = editedCaption.trim();
    if (trimmed && trimmed !== caption) {
      onSave(trimmed);
    }
    setIsEditing(false);
  }, [editedCaption, caption, onSave]);

  const handleCancel = useCallback(() => {
    setEditedCaption(caption);
    setIsEditing(false);
    onCancel?.();
  }, [caption, onCancel]);

  if (isEditing) {
    return (
      <div className={`flex flex-col gap-3 ${className}`}>
        <textarea
          value={editedCaption}
          onChange={(e) => setEditedCaption(e.target.value)}
          className="w-full p-3 bg-neutral-900/90 border border-white/20 rounded-xl text-white text-sm leading-snug resize-none focus:outline-none focus:border-primary-500 transition-colors"
          rows={compactMode ? 3 : 4}
          placeholder="Enter your caption..."
          autoFocus
        />
        <div className="flex gap-2">
          <Button onClick={handleSave} variant="primary" size="sm" icon={<Icon type="check" />}>
            Save Caption
          </Button>
          <Button onClick={handleCancel} variant="secondary" size="sm" icon={<Icon type="close" />}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <p className={`text-white/90 leading-snug ${compactMode ? 'text-sm line-clamp-3' : 'text-sm'} break-words`}>
        {caption}
      </p>
      <div className="flex gap-2">
        <Button
          onClick={() => setIsEditing(true)}
          variant="secondary"
          size="sm"
          icon={<Icon type="edit" />}
        >
          Edit Caption
        </Button>
      </div>
    </div>
  );
};

export default CaptionEditor;
