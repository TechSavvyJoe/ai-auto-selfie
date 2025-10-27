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
    <header className="absolute top-0 left-0 right-0 h-16 glass z-20 flex items-center justify-between px-4 shadow-xl border-b border-white/10">
      {/* Left: Back button */}
      <div className="w-12 flex-shrink-0">
        {showBackButton && (
          <button
            onClick={handleBack}
            className="p-2.5 rounded-xl hover:bg-white/10 active:bg-white/15 transition-all duration-200 active:scale-95 group"
            aria-label="Go back"
            title="Back (Cmd+Left)"
          >
            <Icon type="arrowLeft" className="w-5 h-5 text-white group-hover:text-primary-300 transition-colors" />
          </button>
        )}
      </div>

      {/* Center: Title with gradient */}
      <h1
        onClick={handleHome}
        className="flex-1 text-center text-xl font-bold tracking-tight cursor-pointer transition-all duration-300 hover:scale-105"
        role="button"
        tabIndex={0}
        aria-label="Go to home (click title)"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleHome();
          }
        }}
      >
        <span className="gradient-text">Social Studio</span>
      </h1>

      {/* Right: Theme + Gallery button */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Theme switcher */}
        <ThemeSwitcher position="dropdown" size="sm" />

        {/* Gallery button */}
        {showGalleryButton && (
          <button
            onClick={handleGallery}
            className="p-2.5 rounded-xl hover:bg-white/10 active:bg-white/15 transition-all duration-200 active:scale-95 group relative"
            aria-label="View gallery"
            title="View gallery (G)"
          >
            <Icon type="images" className="w-5 h-5 text-white group-hover:text-primary-300 transition-colors" />
            {/* Notification badge could go here */}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
