import React, { useState } from 'react';
import Icon from './Icon';
import { AppState } from '../../types';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { useAnalytics } from '../../services/analyticsService';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '../../services/supabaseService';

interface HeaderProps {
  appState: AppState;
  onHome: () => void;
  onBack: () => void;
  onGallery: () => void;
  user?: User | null;
  userProfile?: UserProfile | null;
  isAdmin?: boolean;
  onSignOut?: () => Promise<void>;
  onOpenAdmin?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  appState, 
  onHome, 
  onBack, 
  onGallery,
  user,
  userProfile,
  isAdmin,
  onSignOut,
  onOpenAdmin
}) => {
  const { trackFeature } = useAnalytics();
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  const handleSignOut = async () => {
    if (onSignOut) {
      await onSignOut();
      setShowUserMenu(false);
    }
  };

  const handleOpenAdmin = () => {
    if (onOpenAdmin) {
      trackFeature('opened_admin_dashboard');
      onOpenAdmin();
      setShowUserMenu(false);
    }
  };

  const displayName = userProfile?.full_name || user?.email?.split('@')[0] || 'User';

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

      {/* Right: Theme + User Menu + Gallery button */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Theme switcher */}
        <ThemeSwitcher position="dropdown" size="sm" />

        {/* User menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-2.5 rounded-xl hover:bg-white/10 active:bg-white/15 transition-all duration-200 active:scale-95 group flex items-center gap-2"
              aria-label="User menu"
              title={`Logged in as ${displayName}`}
            >
              <Icon type="user" className="w-5 h-5 text-white group-hover:text-primary-300 transition-colors" />
            </button>

            {showUserMenu && (
              <>
                {/* Backdrop to close menu */}
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowUserMenu(false)}
                />
                
                {/* Dropdown menu */}
                <div className="absolute right-0 top-full mt-2 w-64 glass rounded-2xl border border-white/20 shadow-2xl z-40 overflow-hidden">
                  {/* User info */}
                  <div className="p-4 border-b border-white/10">
                    <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                    <p className="text-xs text-white/60 truncate mt-1">{user.email}</p>
                    {userProfile?.dealership && (
                      <p className="text-xs text-primary-400 mt-1 flex items-center gap-1">
                        <Icon type="building" className="w-3 h-3" />
                        {userProfile.dealership.name}
                      </p>
                    )}
                    {userProfile?.role && (
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-2 ${
                        userProfile.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                        userProfile.role === 'manager' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {userProfile.role}
                      </span>
                    )}
                  </div>

                  {/* Menu items */}
                  <div className="p-2">
                    {isAdmin && (
                      <button
                        onClick={handleOpenAdmin}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-left"
                      >
                        <Icon type="settings" className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-white">Admin Dashboard</span>
                      </button>
                    )}
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/20 transition-colors text-left"
                    >
                      <Icon type="logout" className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-white">Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

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
