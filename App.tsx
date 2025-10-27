import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { AppState } from './types';
import { useAppContext } from './context/AppContext';
import CameraView from './components/CameraView';
import EditView from './components/EditView';
import ResultView from './components/ResultView';
import GalleryView from './components/HistoryView';
import GalleryDetailView from './components/HistoryDetailView';
import Spinner from './components/common/Spinner';
import Header from './components/common/Header';
import Button from './components/common/Button';
import Icon from './components/common/Icon';
import ShortcutsHelpDialog from './components/ShortcutsHelpDialog';
import SettingsPanel from './components/SettingsPanel';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import TutorialOverlay from './components/TutorialOverlay';
import BatchEnhancePanel from './components/BatchEnhancePanel';
import { getShortcutsService } from './services/shortcutsService';
import { getAnalyticsService } from './services/analyticsService';
import { getTutorialService } from './services/tutorialService';
import { theme } from './design/theme';

interface StartViewProps {
  onStart: () => void;
  onViewGallery: () => void;
}

const StartView: React.FC<StartViewProps> = React.memo(({ onStart, onViewGallery }) => (
  <div className="relative flex h-full w-full items-center justify-center overflow-hidden px-6 py-16">
    {/* Premium animated background gradients */}
    <div
      className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full opacity-30 blur-3xl bg-gradient-aurora float"
      aria-hidden="true"
    />
    <div
      className="pointer-events-none absolute -bottom-48 -left-24 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl bg-gradient-ocean float"
      aria-hidden="true"
    />
    <div
      className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full opacity-10 blur-3xl bg-gradient-primary pulse"
      aria-hidden="true"
    />

    {/* Main content */}
    <div className="relative z-10 flex max-w-4xl flex-col items-center gap-12 text-center fade-in-up">
      {/* Premium badge */}
      <div className="glass inline-flex items-center gap-3 rounded-full px-5 py-2.5 text-sm font-semibold text-white/90 shadow-lg">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75"></span>
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary-500"></span>
        </span>
        <span className="gradient-text font-bold">AI-Powered Photo Enhancement</span>
      </div>

      {/* Hero content */}
      <div className="space-y-6">
        <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl md:text-7xl leading-tight">
          <span className="block">Transform Your</span>
          <span className="gradient-text block">Photos Instantly</span>
        </h1>
        <p className="text-xl text-white/70 sm:text-2xl max-w-2xl mx-auto leading-relaxed">
          Professional-grade AI enhancement that makes every photo extraordinary.
          <span className="block mt-2 text-lg text-white/50">Powered by Google Gemini</span>
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row w-full sm:w-auto">
        <Button 
          onClick={onStart} 
          variant="gradient" 
          size="large" 
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          className="min-w-[200px]"
        >
          Start Creating
        </Button>
        <Button 
          onClick={onViewGallery} 
          variant="secondary" 
          size="large" 
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
          className="min-w-[200px]"
        >
          View Gallery
        </Button>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 w-full max-w-3xl">
        {[
          { icon: '✨', title: 'AI Enhancement', desc: 'Professional-grade processing' },
          { icon: '🎨', title: 'Multiple Styles', desc: 'Cinematic to portrait modes' },
          { icon: '⚡', title: 'Instant Results', desc: 'Transform in seconds' },
        ].map((feature, idx) => {
          const delayClass = idx === 0 ? 'anim-delay-0' : idx === 1 ? 'anim-delay-100' : 'anim-delay-200';
          return (
          <div 
            key={idx} 
            className={`glass rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1 fade-in-up ${delayClass}`}
          >
            <div className="text-4xl mb-3">{feature.icon}</div>
            <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
            <p className="text-white/60 text-sm">{feature.desc}</p>
          </div>
          );
        })}
      </div>
    </div>
  </div>
));

StartView.displayName = 'StartView';

const AppContent: React.FC = () => {
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);
  const [showBatchEnhancePanel, setShowBatchEnhancePanel] = useState(false);

  const {
    appState,
    originalImage,
    enhancedImage,
    gallery,
    selectedGalleryImage,
    isLoading,
    error,
    loadingMessage,
    goHome,
    goBack,
    startNewPost,
    captureImage,
    enhanceImage,
    resetToCamera,
    viewGallery,
    selectGalleryImage,
    deleteGalleryImage,
    clearGallery,
    clearError,
  } = useAppContext();

  // Initialize keyboard shortcuts and register handlers
  useEffect(() => {
    const shortcutsService = getShortcutsService();

    // Register action handlers for shortcuts
    const unsubscribe = shortcutsService.onShortcutExecuted((shortcut) => {
      switch (shortcut.id) {
        case 'help':
          setShowShortcutsDialog(true);
          break;
        case 'escape':
          setShowShortcutsDialog(false);
          setShowSettingsPanel(false);
          setShowAnalyticsDashboard(false);
          setShowBatchEnhancePanel(false);
          if (appState !== AppState.GALLERY && appState !== AppState.START) {
            goHome();
          }
          break;
        case 'gallery':
          viewGallery();
          break;
        case 'camera':
          startNewPost();
          break;
        default:
          // Other shortcuts can be handled by their respective components
          break;
      }
    });

    // Attach global key listener
    shortcutsService.attachKeyListener();

    return () => {
      unsubscribe();
      // Note: Keep the key listener attached for the entire app lifecycle
    };
  }, [appState, goHome, viewGallery, startNewPost]);

  const renderContent = () => {
    switch (appState) {
      case AppState.START:
        return <StartView onStart={startNewPost} onViewGallery={viewGallery} />;
      case AppState.CAMERA:
        return <CameraView onCapture={captureImage} />;
      case AppState.EDITING:
        return originalImage ? (
          <EditView imageSrc={originalImage} onEnhance={enhanceImage} onRetake={resetToCamera} />
        ) : (
          <StartView onStart={startNewPost} onViewGallery={viewGallery} />
        );
      case AppState.RESULT:
        return enhancedImage ? (
          <ResultView
            imageSrc={enhancedImage}
            originalImage={originalImage || undefined}
            onStartOver={resetToCamera}
            onViewGallery={viewGallery}
          />
        ) : (
          <StartView onStart={startNewPost} onViewGallery={viewGallery} />
        );
      case AppState.GALLERY:
        return (
          <GalleryView
            gallery={gallery}
            onSelectImage={selectGalleryImage}
            onClearGallery={clearGallery}
          />
        );
      case AppState.GALLERY_DETAIL:
        return selectedGalleryImage ? (
          <GalleryDetailView image={selectedGalleryImage} onDelete={deleteGalleryImage} />
        ) : (
          <GalleryView
            gallery={gallery}
            onSelectImage={selectGalleryImage}
            onClearGallery={clearGallery}
          />
        );
      default:
        return <StartView onStart={startNewPost} onViewGallery={viewGallery} />;
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-neutral-950 text-white">
      <Header appState={appState} onHome={goHome} onBack={goBack} onGallery={viewGallery} />

      {error && (
        <div className="absolute left-1/2 top-24 z-30 w-11/12 max-w-xl -translate-x-1/2 rounded-2xl border border-red-400/40 bg-red-500/20 px-6 py-4 text-center shadow-xl backdrop-blur">
          <div className="flex items-center justify-center gap-3">
            <Icon type="alert" className="h-6 w-6 text-red-300" />
            <p className="text-sm font-medium text-red-100">{error}</p>
            <button
              type="button"
              onClick={clearError}
              className="rounded-full p-1.5 text-red-200 transition hover:bg-red-200/20"
              aria-label="Dismiss error"
            >
              <Icon type="close" className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-neutral-950/90 backdrop-blur">
          <Spinner className="scale-125" />
          {loadingMessage && (
            <p className="mt-6 text-lg font-semibold text-white/80">{loadingMessage}</p>
          )}
        </div>
      )}

      <main className={`relative flex-1 ${appState !== AppState.START ? 'pt-16' : ''}`}>
        <div className="absolute inset-0">{renderContent()}</div>
      </main>

      <ShortcutsHelpDialog isOpen={showShortcutsDialog} onClose={() => setShowShortcutsDialog(false)} />
      <SettingsPanel isOpen={showSettingsPanel} onClose={() => setShowSettingsPanel(false)} />
      <AnalyticsDashboard isOpen={showAnalyticsDashboard} onClose={() => setShowAnalyticsDashboard(false)} />
      {showBatchEnhancePanel && (
        <BatchEnhancePanel
          imageIds={gallery.map(img => img.id)}
          onClose={() => setShowBatchEnhancePanel(false)}
        />
      )}
      <TutorialOverlay enabled={getTutorialService().shouldShowIntroduction()} />

      <Analytics />
    </div>
  );
};

export default AppContent;
