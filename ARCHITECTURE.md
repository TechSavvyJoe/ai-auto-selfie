# AI Auto Selfie - Enterprise Architecture

Complete technical reference for the upgraded application architecture.

---

## 🏛️ System Architecture

### Layered Architecture

```
┌─────────────────────────────────────┐
│        UI Components Layer          │
│  (CameraView, EditView, ResultView) │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│     State Management Layer          │
│    (AppContext, Custom Hooks)       │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│      Service Layer                  │
│  (Gemini, ImageEditor, Export)      │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│      Platform APIs                  │
│  (Browser APIs, Google Gemini API)  │
└─────────────────────────────────────┘
```

### Data Flow Diagram

```
User Interaction
      ↓
Component State Update
      ↓
AppContext.setState()
      ↓
Service Layer Call
      ↓
External API / Browser API
      ↓
Response Processing
      ↓
AppContext Update
      ↓
Component Re-render
      ↓
UI Display
```

---

## 📦 Module Structure

### Core Modules

#### 1. **Context Module** (`context/`)
- **AppContext.tsx** - Global state & navigation
- Provides: `useAppContext()` hook
- Manages: appState, images, gallery, loading, errors
- Pattern: Provider pattern + hooks

#### 2. **Service Modules** (`services/`)

**geminiService.ts**
- AI image enhancement
- Message generation
- Theme-based prompting
- Exports: `enhanceImageWithAI()`

**imageEditorService.ts**
- Image adjustments (9 parameters)
- Filter presets (8 filters)
- Canvas operations
- Exports: `applyFiltersToImage()`, `buildFilterString()`, etc.

**exportService.ts**
- Multiple export formats (JPEG, PNG, WebP)
- Platform optimization
- Social media sharing
- Copy to clipboard
- Exports: `downloadImage()`, `generateShareLink()`, etc.

**storageService.ts**
- localStorage management
- Gallery persistence
- Logo storage
- Exports: `getHistory()`, `addToHistory()`, etc.

#### 3. **Component Modules** (`components/`)

**UI Components**
- ErrorBoundary - Error handling
- OnboardingFlow - User tutorial
- ImageAdjustmentPanel - Image editing
- FilterCarousel - Filter selector
- ExportDialog - Export & sharing

**Common Components**
- Modal - Accessible dialog
- Slider - Range input
- Button - Styled button
- Icon - SVG icons
- Spinner - Loading indicator
- Header - Navigation bar
- SegmentedControl - Toggle control

#### 4. **Utilities** (`utils/`)

**animations.ts**
- Animation definitions
- Transition timing
- Keyframe builders
- Stagger helpers

**accessibility.ts**
- Focus management
- Keyboard navigation
- Screen reader support
- ARIA helpers
- Contrast checking

**performance.ts**
- Code splitting
- Lazy loading
- Debounce/throttle
- Memoization
- Performance monitoring

**imageUtils.ts**
- Image format conversion
- Base64 handling
- Canvas operations

#### 5. **Design System** (`design/`)

**theme.ts**
- Color tokens (primary, neutral, semantic)
- Typography scales
- Spacing system
- Shadow definitions
- Animation tokens
- Z-index management

---

## 🔄 State Management Flow

### AppContext State

```typescript
interface AppContextType {
  // Navigation state
  appState: AppState;

  // Image state
  originalImage: string | null;
  enhancedImage: string | null;

  // Gallery state
  gallery: string[];
  selectedGalleryImage: { url: string; index: number } | null;

  // Loading state
  isLoading: boolean;
  loadingMessage: string;

  // Error state
  error: string | null;

  // Action methods
  setAppState: (state: AppState) => void;
  goHome: () => void;
  goBack: () => void;
  startNewPost: () => void;
  captureImage: (imageDataUrl: string) => void;
  enhanceImage: (options: EditOptions) => Promise<void>;
  resetToCamera: () => void;
  viewGallery: () => void;
  selectGalleryImage: (url: string, index: number) => void;
  deleteGalleryImage: (index: number) => void;
  clearGallery: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}
```

### App States (State Machine)

```
     ┌─────────┐
     │  START  │ (Home screen)
     └────┬────┘
          │
     ┌────▼─────┐
     │ CAMERA   │ (Capture photo)
     └────┬─────┘
          │
     ┌────▼─────┐
     │ EDITING  │ (Customize)
     └────┬─────┘
          │
     ┌────▼─────────┐
     │ AI Processing│ (Gemini enhance)
     └────┬─────────┘
          │
     ┌────▼──────┐
     │  RESULT   │ (View/download)
     └────┬──────┘
          │
┌─────────┴────────────┐
│                      │
START        ┌─────────▼─────────┐
└────────────│    GALLERY        │ (View all)
             └────────┬──────────┘
                      │
                 ┌────▼──────────────┐
                 │ GALLERY_DETAIL    │ (View one)
                 └───────────────────┘
```

---

## 🎯 Component Hierarchy

```
App
├── ErrorBoundary
│   └── AppProvider (Context)
│       ├── Header
│       ├── Modal/Dialog Layer
│       ├── Loading Overlay
│       ├── Error Toast
│       └── Main Content
│           ├── StartView
│           ├── CameraView
│           ├── EditView
│           │   ├── FilterCarousel
│           │   ├── ImageAdjustmentPanel
│           │   │   ├── Slider (×9)
│           │   │   └── FilterCarousel
│           │   └── ThemeSelector
│           ├── ResultView
│           │   └── ExportDialog
│           │       ├── Format Selector
│           │       └── Share Controls
│           ├── GalleryView
│           │   └── GalleryItem (×50)
│           └── GalleryDetailView
```

---

## 🔗 Service Integration Points

### Image Enhancement Flow

```
User captures image
        ↓
CameraView.onCapture()
        ↓
App: captureImage() → setAppState(EDITING)
        ↓
EditView: Shows image + controls
        ↓
User selects theme, text, logo, adjustments
        ↓
EditView.onEnhance() → App: enhanceImage()
        ↓
App: setIsLoading(true)
        ↓
dataUrlToBase64() → Convert image
        ↓
geminiService.enhanceImageWithAI()
        ↓
Gemini API Call
        ↓
Canvas rendering with filters applied
        ↓
Response: base64 image
        ↓
storageService.addToHistory() → Save to localStorage
        ↓
App: setAppState(RESULT)
        ↓
ResultView: Display enhanced image
```

### Export Flow

```
User clicks Export
        ↓
ExportDialog opens
        ↓
User selects format (JPEG/PNG/WebP)
        ↓
ExportDialog.handleDownload()
        ↓
exportService.downloadImage()
        ↓
exportImage() → Canvas export to blob
        ↓
Create download link
        ↓
Trigger download
        ↓
Show success toast
        ↓
Close dialog
```

---

## 📊 Data Structures

### ImageAdjustments

```typescript
interface ImageAdjustments {
  brightness: number;    // -100 to 100
  contrast: number;      // -100 to 100
  saturation: number;    // -100 to 100
  hue: number;          // 0 to 360
  blur: number;         // 0 to 20
  sharpen: number;      // 0 to 10
  temperature: number;  // -50 to 50
  highlights: number;   // -100 to 100
  shadows: number;      // -100 to 100
}
```

### FilterPreset

```typescript
interface FilterPreset {
  name: string;
  label: string;
  adjustments: Partial<ImageAdjustments>;
  category: 'professional' | 'vibrant' | 'vintage' | 'creative';
}
```

### EditOptions

```typescript
interface EditOptions {
  theme: 'modern' | 'luxury' | 'dynamic' | 'family';
  primaryText: string;
  ctaText?: string;
  logoUrl?: string;
  logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  aspectRatio?: 'original' | '1:1' | '9:16' | '1.91:1';
}
```

---

## 🔐 Security Considerations

### Data Handling

- ✅ All image processing done client-side (no server storage)
- ✅ No personal data collected beyond what's needed
- ✅ localStorage used for temporary storage only
- ✅ No authentication required (stateless)
- ✅ API key stored in environment variables

### Input Validation

- ✅ Image size limits enforced
- ✅ File type validation (canvas reading)
- ✅ Text input sanitization
- ✅ URL validation for sharing

### XSS Prevention

- ✅ React's built-in XSS protection
- ✅ No dangerouslySetInnerHTML used
- ✅ Content Security Policy recommended

---

## 📈 Scalability Paths

### If Users Increase

1. **Add Backend**
   - Gallery sync across devices
   - User accounts & authentication
   - Cloud storage for unlimited history
   - Social media API integration

2. **Performance**
   - CDN for asset delivery
   - Service Worker for offline support
   - Cache busting for updates
   - Image compression on server

3. **Features**
   - Advanced batch processing
   - Team collaboration
   - Scheduled posting
   - Analytics dashboard

### If Features Expand

1. **Code Organization**
   - Feature-based folder structure
   - Shared component library
   - Plugin architecture

2. **State Management**
   - Upgrade to Redux if needed
   - Persisted state with hydration
   - Time-travel debugging

3. **Testing**
   - Expand test coverage
   - E2E testing with Playwright
   - Visual regression testing

---

## 🚀 Performance Metrics

### Target Metrics

- First Contentful Paint: < 2s
- Largest Contentful Paint: < 4s
- Cumulative Layout Shift: < 0.1
- Time to Interactive: < 3s
- JavaScript bundle: < 200KB (gzipped)

### Optimization Techniques

1. **Code Splitting**
   - Lazy load ExportDialog
   - Lazy load OnboardingFlow
   - Split vendor bundle

2. **Image Optimization**
   - WebP with JPEG fallback
   - Responsive images
   - Lazy loading

3. **Caching**
   - Browser cache headers
   - Service Worker for offline
   - Memoization for computations

---

## 🧪 Testing Strategy

### Unit Tests
- Services (imageEditorService, exportService)
- Utilities (animations, accessibility, performance)
- Pure functions

### Component Tests
- User interactions
- Event handling
- Prop changes
- Error states

### Integration Tests
- Full user flows
- State transitions
- API calls
- Error recovery

### E2E Tests
- Camera capture
- Image editing
- Export functionality
- Gallery management

---

## 📚 Browser Compatibility

### Supported Browsers

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android)

### Required APIs

- MediaStream (camera access)
- Canvas API (image processing)
- localStorage (persistence)
- File API (image handling)
- Fetch API (network requests)
- Web Share API (optional, mobile sharing)

---

## 🔧 Build & Deployment

### Development

```bash
npm run dev      # Start dev server on :3000
npm run build    # Production build
npm run preview  # Preview built version
npm run type-check  # Type checking
npm run lint     # Code linting
```

### Production Deployment

1. Build: `npm run build`
2. Output: `dist/` folder
3. Serve: Any static host (Vercel, Netlify, Firebase)
4. Environment: Set `VITE_GEMINI_API_KEY`
5. HTTPS: Required for camera access

---

## 📖 Documentation Files

- **README.md** - Project overview & setup
- **UPGRADE_SUMMARY.md** - What's new in this version
- **INTEGRATION_GUIDE.md** - How to use new components
- **ARCHITECTURE.md** - Technical deep dive (this file)
- **DEV_NOTES.md** - Developer tips & patterns

---

## 🎯 Key Design Decisions

### Why Context API?
- Lighter than Redux for this app scale
- Better developer experience
- Simpler to understand
- Sufficient for current needs

### Why Canvas for Image Processing?
- Client-side processing (privacy)
- Real-time preview
- No server required
- Fast performance

### Why Tailwind CSS?
- Rapid development
- Consistent spacing
- Responsive utilities built-in
- Great accessibility defaults

### Why Error Boundary?
- Prevents blank screens
- Better UX during failures
- Development error details
- Production stability

---

## 🏆 Quality Standards

This codebase meets:

- ✅ TypeScript strict mode
- ✅ WCAG 2.1 AA accessibility
- ✅ Responsive design
- ✅ Performance budgets
- ✅ Security best practices
- ✅ SEO basics
- ✅ Mobile-first approach
- ✅ Cross-browser support

---

**This architecture is designed for sustainability, scalability, and developer happiness.** 🚀
