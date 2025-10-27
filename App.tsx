import React from 'react';
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
import { theme } from './design/theme';

interface StartViewProps {
  onStart: () => void;
  onViewGallery: () => void;
}

const StartView: React.FC<StartViewProps> = ({ onStart, onViewGallery }) => (
  <div className="relative flex h-full w-full items-center justify-center overflow-hidden px-6 py-16">
    <div
      className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full opacity-40 blur-3xl"
      style={{ background: theme.colors.gradients.brand }}
      aria-hidden
    />
    <div
      className="pointer-events-none absolute -bottom-48 -left-24 h-[28rem] w-[28rem] rounded-full opacity-20 blur-3xl"
      style={{ background: theme.colors.gradients.brand }}
      aria-hidden
    />

    <div className="relative z-10 flex max-w-3xl flex-col items-center gap-10 text-center">
      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 ring-1 ring-white/15 backdrop-blur-md">
        <span className="inline-flex h-2 w-2 rounded-full bg-blue-300" />
        AI-assisted social storytelling for dealerships
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
          Dealership Social Studio
        </h1>
        <p className="text-lg text-white/70 sm:text-xl">
          Capture the delivery moment, let Gemini elevate the story, and share a premium-ready visual
          in seconds.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button onClick={onStart} variant="primary" size="large" icon={<Icon type="camera" />}>
          Start New Post
        </Button>
        <Button onClick={onViewGallery} variant="secondary" size="large" icon={<Icon type="history" />}>
          View My Gallery
        </Button>
      </div>
    </div>
  </div>
);

const AppContent: React.FC = () => {
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
    </div>
  );
};

export default AppContent;
