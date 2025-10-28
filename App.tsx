import React, { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { AppState, AIMode } from './types';
import { useAppContext } from './context/AppContext';
import Spinner from './components/common/Spinner';
import Header from './components/common/Header';
import Button from './components/common/Button';
import Icon from './components/common/Icon';
import ErrorBoundary from './components/ErrorBoundary';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/AdminDashboard';
import { getShortcutsService } from './services/shortcutsService';
import { getAnalyticsService } from './services/analyticsService';
import { getTutorialService } from './services/tutorialService';
import { theme } from './design/theme';
import { useDesktopDetection } from './hooks/useDesktopDetection';
import { useAuth } from './hooks/useAuth';
import { isSupabaseConfigured } from './services/supabaseService';

// Lazy-load heavy components for code-splitting
const CameraView = lazy(() => import('./components/CameraView'));
const EditView = lazy(() => import('./components/EditView'));
const ResultView = lazy(() => import('./components/ResultView'));
const GalleryView = lazy(() => import('./components/HistoryView'));
const GalleryDetailView = lazy(() => import('./components/HistoryDetailView'));
const ShortcutsHelpDialog = lazy(() => import('./components/ShortcutsHelpDialog'));
const SettingsPanel = lazy(() => import('./components/SettingsPanel'));
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard'));
const TutorialOverlay = lazy(() => import('./components/TutorialOverlay'));
const BatchEnhancePanel = lazy(() => import('./components/BatchEnhancePanel'));
const PremiumDesktopStartView = lazy(() => import('./components/PremiumDesktopStartView'));
const EnhancedDesktopGalleryView = lazy(() => import('./components/EnhancedDesktopGalleryView'));
const PremiumExportDialog = lazy(() => import('./components/PremiumExportDialog'));

interface StartViewProps {
  onStart: () => void;
  onViewGallery: () => void;
}

const StartView: React.FC<StartViewProps> = React.memo(({ onStart, onViewGallery }) => (
  <div className="relative flex h-full w-full items-center justify-center overflow-hidden px-6 py-16">
    <style>{`
      .float-delayed { animation: float 6s ease-in-out infinite; animation-delay: 2s; }
      @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(20px); } }
    `}</style>
    {/* Premium animated background gradients */}
    <div
      className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full opacity-20 blur-3xl animate-float bg-gradient-to-r from-purple-600 via-pink-500 to-transparent"
      aria-hidden="true"
    />
    <div
      className="pointer-events-none absolute -bottom-48 -left-24 h-[500px] w-[500px] rounded-full opacity-15 blur-3xl float-delayed"
      aria-hidden="true"
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-600 via-blue-500 to-transparent"></div>
    </div>
    <div
      className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full opacity-10 blur-3xl animate-pulse-slow bg-gradient-to-b from-purple-600 to-transparent"
      aria-hidden="true"
    />

    {/* Main content */}
    <div className="relative z-10 flex max-w-4xl flex-col items-center gap-12 text-center">
      {/* Premium badge */}
      <div className="glass inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-xl border border-white/20">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75"></span>
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary-500 shadow-glow"></span>
        </span>
        <span className="gradient-text font-bold">AI-Powered Photo Enhancement</span>
      </div>

      {/* Hero content */}
      <div className="space-y-8">
        <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl md:text-7xl leading-tight drop-shadow-2xl">
          <span className="block animate-in slide-in-from-bottom duration-700">Transform Your</span>
          <span className="gradient-text block animate-in slide-in-from-bottom duration-700" style={{ animationDelay: '100ms' }}>Photos Instantly</span>
        </h1>
        <p className="text-xl text-white/80 sm:text-2xl max-w-2xl mx-auto leading-relaxed animate-in fade-in duration-700" style={{ animationDelay: '200ms' }}>
          Professional-grade AI enhancement that makes every photo extraordinary.
          <span className="block mt-3 text-base text-white/60 font-medium">⚡ Powered by Google Gemini 2.5</span>
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row w-full sm:w-auto animate-in fade-in duration-700" style={{ animationDelay: '300ms' }}>
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
          className="min-w-[220px]"
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
          className="min-w-[220px]"
        >
          View Gallery
        </Button>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 w-full max-w-3xl">
        {[
          { icon: '✨', title: 'AI Enhancement', desc: 'Professional-grade processing' },
          { icon: '🎨', title: 'Multiple Styles', desc: 'Cinematic to portrait modes' },
          { icon: '⚡', title: 'Instant Results', desc: 'Transform in seconds' },
        ].map((feature, idx) => (
          <div 
            key={idx} 
            className="glass rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:-translate-y-2 hover:shadow-glow group border border-white/10 animate-in fade-in"
            style={{ animationDelay: `${400 + idx * 100}ms` }}
          >
            <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110">{feature.icon}</div>
            <h3 className="text-white font-bold text-lg mb-2 tracking-wide">{feature.title}</h3>
            <p className="text-white/70 text-sm leading-relaxed">{feature.desc}</p>
          </div>
        ))}
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  // Detect if user is on desktop browser
  const isDesktop = useDesktopDetection();

  // Get auth state
  const { user, userProfile, isAuthenticated, isAdmin, loading: authLoading, signOut } = useAuth();

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
          setShowAuthModal(false);
          setShowAdminDashboard(false);
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

  // Show auth modal if Supabase is configured but user is not logged in
  useEffect(() => {
    if (isSupabaseConfigured() && !authLoading && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [authLoading, isAuthenticated]);

  // Calculate gallery stats for desktop view
  const galleryStats = useMemo(() => {
    const totalImages = gallery.length;
    const favoriteCount = gallery.filter(img => img.isFavorite).length;
    const modeOptions: AIMode[] = ['professional', 'cinematic', 'portrait', 'creative', 'natural'];
    const modeUsage = modeOptions.map(mode => [mode, gallery.filter(img => img.aiMode === mode).length] as [string, number])
      .sort(([, a], [, b]) => b - a);
    const mostUsedMode = modeUsage[0]?.[0] || 'None';
    const totalStorageEstimate = gallery.length > 0
      ? (gallery.reduce((sum, img) => sum + img.imageDataUrl.length, 0) / (1024 * 1024)).toFixed(2)
      : '0';

    return {
      totalImages,
      favoriteCount,
      mostUsedMode,
      totalStorageEstimate,
    };
  }, [gallery]);

  const renderContent = () => {
    switch (appState) {
      case AppState.START:
        return isDesktop ? (
          <Suspense fallback={<div className="flex h-full items-center justify-center"><Spinner /></div>}>
            <PremiumDesktopStartView
              onStart={startNewPost}
              onViewGallery={viewGallery}
              galleryStats={galleryStats}
            />
          </Suspense>
        ) : (
          <StartView onStart={startNewPost} onViewGallery={viewGallery} />
        );
      case AppState.CAMERA:
        return (
          <Suspense fallback={<div className="flex h-full items-center justify-center"><Spinner /></div>}>
            <CameraView onCapture={captureImage} />
          </Suspense>
        );
      case AppState.EDITING:
        return originalImage ? (
            <Suspense fallback={<div className="flex h-full items-center justify-center"><Spinner /></div>}>
          <EditView imageSrc={originalImage} onEnhance={enhanceImage} onRetake={resetToCamera} />
            </Suspense>
        ) : (
          <StartView onStart={startNewPost} onViewGallery={viewGallery} />
        );
      case AppState.RESULT:
        return enhancedImage ? (
            <Suspense fallback={<div className="flex h-full items-center justify-center"><Spinner /></div>}>
          <ResultView
            imageSrc={enhancedImage}
            originalImage={originalImage || undefined}
            onStartOver={resetToCamera}
            onViewGallery={viewGallery}
          />
            </Suspense>
        ) : (
          <StartView onStart={startNewPost} onViewGallery={viewGallery} />
        );
      case AppState.GALLERY:
        return (
            <Suspense fallback={<div className="flex h-full items-center justify-center"><Spinner /></div>}>
          {isDesktop ? (
            <EnhancedDesktopGalleryView
              gallery={gallery}
              onSelectImage={selectGalleryImage}
              onClearGallery={clearGallery}
              onDeleteImage={deleteGalleryImage}
            />
          ) : (
            <GalleryView
              gallery={gallery}
              onSelectImage={selectGalleryImage}
              onClearGallery={clearGallery}
            />
          )}
            </Suspense>
        );
      case AppState.GALLERY_DETAIL:
        return selectedGalleryImage ? (
            <Suspense fallback={<div className="flex h-full items-center justify-center"><Spinner /></div>}>
          <GalleryDetailView image={selectedGalleryImage} onDelete={deleteGalleryImage} />
            </Suspense>
        ) : (
            <Suspense fallback={<div className="flex h-full items-center justify-center"><Spinner /></div>}>
          <GalleryView
            gallery={gallery}
            onSelectImage={selectGalleryImage}
            onClearGallery={clearGallery}
          />
            </Suspense>
        );
      default:
        return <StartView onStart={startNewPost} onViewGallery={viewGallery} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-neutral-950 text-white">
        <Header 
          appState={appState} 
          onHome={goHome} 
          onBack={goBack} 
          onGallery={viewGallery}
          user={user}
          userProfile={userProfile}
          isAdmin={isAdmin}
          onSignOut={signOut}
          onOpenAdmin={() => setShowAdminDashboard(true)}
        />

        {error && (
          <div className="absolute left-1/2 top-24 z-30 w-11/12 max-w-xl -translate-x-1/2 rounded-2xl border border-red-400/40 bg-red-500/20 px-6 py-4 text-center shadow-xl backdrop-blur-md animate-in slide-in-from-top duration-300">
            <div className="flex items-center justify-center gap-3">
              <Icon type="alert" className="h-6 w-6 text-red-300" />
              <p className="text-sm font-medium text-red-100">{error}</p>
              <button
                type="button"
                onClick={clearError}
                className="rounded-full p-1.5 text-red-200 transition hover:bg-red-200/20 active:scale-90"
                aria-label="Dismiss error"
                title="Dismiss error message"
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

      <Suspense fallback={null}>
        <ShortcutsHelpDialog isOpen={showShortcutsDialog} onClose={() => setShowShortcutsDialog(false)} />
      </Suspense>
      <Suspense fallback={null}>
        <SettingsPanel isOpen={showSettingsPanel} onClose={() => setShowSettingsPanel(false)} />
      </Suspense>
      <Suspense fallback={null}>
        <AnalyticsDashboard isOpen={showAnalyticsDashboard} onClose={() => setShowAnalyticsDashboard(false)} />
      </Suspense>
      {showBatchEnhancePanel && (
          <Suspense fallback={null}>
        <BatchEnhancePanel
          imageIds={gallery.map(img => img.id)}
          onClose={() => setShowBatchEnhancePanel(false)}
        />
          </Suspense>
      )}
      <Suspense fallback={null}>
        <TutorialOverlay enabled={getTutorialService().shouldShowIntroduction()} />
      </Suspense>

        {showAuthModal && (
          <AuthModal 
            onClose={() => setShowAuthModal(false)} 
            onAuthSuccess={() => setShowAuthModal(false)} 
          />
        )}

        {showAdminDashboard && (
          <AdminDashboard onClose={() => setShowAdminDashboard(false)} />
        )}

        <Analytics />
      </div>
    </ErrorBoundary>
  );
};

export default AppContent;
