# Integration Guide - New Components & Features

Quick reference for integrating all the new enterprise-grade components into your app.

---

## 🚀 Quick Start Integration

### 1. Wrap App with AppProvider & ErrorBoundary

In `index.tsx`:

```tsx
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';

export default function Root() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <App />
      </AppProvider>
    </ErrorBoundary>
  );
}
```

### 2. Use AppContext in Components

```tsx
import { useAppContext } from '../context/AppContext';

export const MyComponent = () => {
  const { appState, goHome, setError, isLoading } = useAppContext();

  return (
    <div>
      {/* Your component */}
    </div>
  );
};
```

---

## 🎨 Design Tokens Usage

### Import and Use Theme

```tsx
import { theme } from '../design/theme';

const MyComponent = () => {
  return (
    <div style={{
      color: theme.colors.primary[500],
      fontSize: theme.typography.body.lg.fontSize,
      padding: theme.spacing[8],
    }}>
      Styled with tokens
    </div>
  );
};
```

### Common Token Recipes

```tsx
// Primary button
<button style={{
  background: theme.colors.primary[600],
  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
  borderRadius: theme.borderRadius.md,
  boxShadow: theme.shadows.lg,
  transition: theme.transitions.common.all,
}}>
  Click me
</button>

// Success message
<div style={{
  background: theme.colors.success.light,
  color: theme.colors.success.dark,
  padding: theme.spacing[4],
  borderRadius: theme.borderRadius.lg,
}}>
  Success!
</div>
```

---

## 📤 Adding Export Dialog to ResultView

```tsx
import { useState } from 'react';
import ExportDialog from '../components/ExportDialog';
import { useAppContext } from '../context/AppContext';

export const ResultView = () => {
  const { enhancedImage } = useAppContext();
  const [showExport, setShowExport] = useState(false);

  return (
    <div>
      {/* Image preview */}
      <img src={enhancedImage} alt="Result" />

      {/* Export button */}
      <button onClick={() => setShowExport(true)}>
        Download & Share
      </button>

      {/* Export dialog */}
      <ExportDialog
        isOpen={showExport}
        imageDataUrl={enhancedImage!}
        onClose={() => setShowExport(false)}
        onSuccess={() => {
          // Handle successful export
        }}
      />
    </div>
  );
};
```

---

## 🎛️ Adding Image Adjustment Panel to EditView

```tsx
import { useState } from 'react';
import ImageAdjustmentPanel from '../components/ImageAdjustmentPanel';
import { ImageAdjustments } from '../services/imageEditorService';

export const EditView = ({ imageSrc }: { imageSrc: string }) => {
  const [adjustments, setAdjustments] = useState<ImageAdjustments | null>(null);
  const [showAdjustments, setShowAdjustments] = useState(false);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Left: Preview */}
      <div>
        <img src={imageSrc} alt="Edit" />
      </div>

      {/* Right: Controls */}
      <div className="space-y-4">
        {/* Other controls */}

        {/* Adjustments button */}
        <button onClick={() => setShowAdjustments(true)}>
          ✨ Advanced Adjustments
        </button>

        {/* Adjustments panel */}
        {showAdjustments && (
          <ImageAdjustmentPanel
            imageSrc={imageSrc}
            onAdjustmentsChange={setAdjustments}
            onClose={() => setShowAdjustments(false)}
          />
        )}
      </div>
    </div>
  );
};
```

---

## 🎓 Adding Onboarding to START State

```tsx
import { useState, useEffect } from 'react';
import OnboardingFlow, { useOnboarding } from '../components/OnboardingFlow';

export const StartView = () => {
  const { isOnboardingComplete, completeOnboarding } = useOnboarding();
  const [showOnboarding, setShowOnboarding] = useState(!isOnboardingComplete);

  return (
    <>
      {/* Welcome screen */}
      <div>
        <h1>Welcome to Dealership Social Studio</h1>
        <p>Create stunning social media posts in seconds</p>
      </div>

      {/* Onboarding flow */}
      <OnboardingFlow
        isOpen={showOnboarding}
        onComplete={() => {
          completeOnboarding();
          setShowOnboarding(false);
        }}
        onSkip={() => {
          completeOnboarding();
          setShowOnboarding(false);
        }}
      />

      {/* Replay tutorial button */}
      <button onClick={() => setShowOnboarding(true)}>
        ? Tutorial
      </button>
    </>
  );
};
```

---

## 💾 Using Image Editor Service

### Apply Filters

```tsx
import { applyFiltersToImage, getFilterPreset } from '../services/imageEditorService';

const applyFilter = async (imageUrl: string, filterName: string) => {
  const preset = getFilterPreset(filterName);
  if (!preset) return;

  const filtered = await applyFiltersToImage(imageUrl, preset.adjustments);
  return filtered; // Base64 data URL
};
```

### Apply Custom Adjustments

```tsx
import { applyFiltersToImage, ImageAdjustments } from '../services/imageEditorService';

const customAdjustments: ImageAdjustments = {
  brightness: 10,
  contrast: 15,
  saturation: 20,
  hue: 0,
  blur: 0,
  sharpen: 2,
  temperature: 5,
  highlights: -5,
  shadows: 10,
};

const filtered = await applyFiltersToImage(imageUrl, customAdjustments);
```

---

## 📤 Using Export Service

### Download Image

```tsx
import { downloadImage, ExportFormat } from '../services/exportService';

const handleDownload = async (imageUrl: string, format: ExportFormat = 'jpeg') => {
  try {
    await downloadImage(imageUrl, {
      format,
      quality: 95,
      filename: 'my-post.jpg',
    });
  } catch (error) {
    console.error('Download failed:', error);
  }
};
```

### Generate Share Links

```tsx
import { generateShareLink } from '../services/exportService';

const shareToTwitter = (imageUrl: string) => {
  const twitterLink = generateShareLink('twitter', imageUrl, {
    message: 'Check out this amazing vehicle delivery!',
  });
  window.open(twitterLink, '_blank');
};
```

### Optimize for Platform

```tsx
import { resizeForSocialPlatform } from '../services/exportService';

const optimizeForInstagram = async (imageUrl: string) => {
  const optimized = await resizeForSocialPlatform(imageUrl, 'instagram');
  return optimized; // 1:1 aspect ratio, 1080x1080
};
```

---

## ♿ Accessibility Features

### Focus Management in Modals

```tsx
import { createFocusTrap } from '../utils/accessibility';

export const MyModal = ({ isOpen }: { isOpen: boolean }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      return createFocusTrap(modalRef.current);
    }
  }, [isOpen]);

  return (
    <div ref={modalRef} role="dialog">
      {/* Modal content */}
    </div>
  );
};
```

### Announce to Screen Readers

```tsx
import { announceToScreenReader } from '../utils/accessibility';

const handleSuccess = () => {
  announceToScreenReader('Image exported successfully', 'polite');
};
```

### Check Motion Preferences

```tsx
import { prefersReducedMotion, getMotionStyles } from '../utils/accessibility';

export const AnimatedComponent = () => {
  const shouldReduceMotion = prefersReducedMotion();

  return (
    <div style={{
      animation: shouldReduceMotion
        ? 'none'
        : 'fadeInUp 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    }}>
      Content
    </div>
  );
};
```

---

## ⚡ Performance Optimization

### Lazy Load Components

```tsx
import { lazyLoadComponent } from '../utils/performance';
import { Suspense } from 'react';
import Spinner from '../components/common/Spinner';

const HeavyComponent = lazyLoadComponent(
  () => import('../components/HeavyComponent'),
  'HeavyComponent'
);

export const App = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyComponent />
    </Suspense>
  );
};
```

### Measure Performance

```tsx
import { measureAsyncPerformance } from '../utils/performance';

const processImage = async (imageUrl: string) => {
  const result = await measureAsyncPerformance(
    'Image Processing',
    async () => {
      // Your processing logic
      return someExpensiveOperation(imageUrl);
    }
  );
  return result;
};
```

### Debounce Input Handlers

```tsx
import { debounce } from '../utils/performance';

export const SearchInput = () => {
  const handleSearch = debounce((query: string) => {
    // Search API call
  }, 300);

  return (
    <input
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="Search..."
    />
  );
};
```

---

## 🎨 Animation Utilities

### Apply Entrance Animation

```tsx
import { keyframes } from '../utils/animations';

export const AnimatedCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      style={{
        animation: 'fadeInUp 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      }}
    >
      {children}
    </div>
  );
};
```

### Stagger List Items

```tsx
import { getStaggerDelay } from '../utils/animations';

export const List = ({ items }: { items: any[] }) => {
  return (
    <div>
      {items.map((item, index) => (
        <div
          key={item.id}
          style={{
            animation: `fadeInUp 400ms cubic-bezier(0.34, 1.56, 0.64, 1) ${getStaggerDelay(index, 50)} forwards`,
            opacity: 0,
          }}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
};
```

---

## 🧪 Testing Checklist

After integrating new components:

- [ ] Camera capture works (front/back)
- [ ] Image adjustments show live preview
- [ ] Filters change appearance correctly
- [ ] Export dialog opens and downloads work
- [ ] All share buttons open correct platforms
- [ ] Onboarding displays on first visit
- [ ] Error boundary catches errors gracefully
- [ ] Keyboard navigation works throughout
- [ ] Screen reader announces key actions
- [ ] App works on mobile (touch events)

---

## 📚 Component APIs

### Modal
```tsx
<Modal
  isOpen={boolean}
  onClose={() => void}
  title={string | ReactNode}
  size={'sm' | 'md' | 'lg' | 'full'}
  showCloseButton={boolean}
  closeOnBackdropClick={boolean}
  closeOnEscape={boolean}
>
  Content
</Modal>
```

### Slider
```tsx
<Slider
  value={number}
  onChange={(value) => void}
  min={number}
  max={number}
  step={number}
  label={string}
  icon={ReactNode}
  showValue={boolean}
  unit={string}
  disabled={boolean}
  onReset={() => void}
/>
```

### ImageAdjustmentPanel
```tsx
<ImageAdjustmentPanel
  imageSrc={string}
  onAdjustmentsChange={(adjustments) => void}
  onClose={() => void}
  compact={boolean}
/>
```

### ExportDialog
```tsx
<ExportDialog
  isOpen={boolean}
  imageDataUrl={string}
  onClose={() => void}
  onSuccess={() => void}
/>
```

---

## 🔗 File Cross-References

| Feature | Main File | Supporting Files |
|---------|-----------|------------------|
| State Management | `context/AppContext.tsx` | `types.ts` |
| Error Handling | `components/ErrorBoundary.tsx` | `design/theme.ts` |
| Image Editing | `services/imageEditorService.ts` | `components/ImageAdjustmentPanel.tsx`, `components/FilterCarousel.tsx` |
| Export/Share | `services/exportService.ts` | `components/ExportDialog.tsx` |
| Onboarding | `components/OnboardingFlow.tsx` | `components/common/Modal.tsx` |
| Accessibility | `utils/accessibility.ts` | All components |
| Performance | `utils/performance.ts` | `services/imageEditorService.ts` |
| Design | `design/theme.ts` | All components |
| Animations | `utils/animations.ts` | All components |

---

## ✅ You're Ready!

All components are:
- ✅ Type-safe (TypeScript)
- ✅ Accessible (WCAG 2.1 AA)
- ✅ Performant (optimized)
- ✅ Well-documented
- ✅ Production-ready

Start integrating and shipping! 🚀
