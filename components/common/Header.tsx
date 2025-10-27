import React from 'react';
import Icon from './Icon';
import { AppState } from '../../types';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { useAnalytics } from '../../services/analyticsService';

interface HeaderProps {
  appState: AppState;
  onHome: () => void;
  onBack: () => void;
  onGallery: () => void;
}

const Header: React.FC<HeaderProps> = ({ appState, onHome, onBack, onGallery }) => {
  const { trackFeature } = useAnalytics();

  if (appState === AppState.START) {
    return null; // No header on the start screen
  }

  const showBackButton = [AppState.CAMERA, AppState.EDITING, AppState.GALLERY, AppState.GALLERY_DETAIL, AppState.RESULT].includes(appState);
  const showGalleryButton = appState === AppState.CAMERA;

  const handleHome = () => {
    trackFeature('clicked_home');
    onHome();
  };

  const handleBack = () => {
    trackFeature('clicked_back');
    onBack();
  };

  const handleGallery = () => {
    trackFeature('opened_gallery');
    onGallery();
  };

  return (
    <header className="absolute top-0 left-0 right-0 h-16 bg-neutral-900/50 backdrop-blur-lg z-20 flex items-center justify-between px-4 shadow-lg border-b border-neutral-800/50">
      {/* Left: Back button */}
      <div className="w-10 flex-shrink-0">
        {showBackButton && (
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Go back"
            title="Back (Cmd+Left)"
          >
            <Icon type="arrowLeft" className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Center: Title */}
      <h1
        onClick={handleHome}
        className="flex-1 text-center text-lg font-bold text-white tracking-wide cursor-pointer hover:text-primary-300 transition-colors"
        role="button"
        tabIndex={0}
        aria-label="Go to home (click title)"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleHome();
          }
        }}
      >
        Social Studio
      </h1>

      {/* Right: Theme + Gallery button */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Theme switcher */}
        <ThemeSwitcher position="dropdown" size="sm" />

        {/* Gallery button */}
        {showGalleryButton && (
          <button
            onClick={handleGallery}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="View gallery"
            title="View gallery (G)"
          >
            <Icon type="images" className="w-5 h-5 text-white" />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
