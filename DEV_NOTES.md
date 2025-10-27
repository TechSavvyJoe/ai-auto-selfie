# Developer Notes - Working with the Upgraded Codebase

Quick tips and patterns for working effectively with this enterprise-grade codebase.

---

## 📋 Architecture Quick Reference

### File Organization Philosophy

```
Keep it grouped by feature, not by type

❌ AVOID:
src/
  ├── components/
  ├── services/
  ├── utils/
  └── hooks/

✅ PREFER:
src/
  ├── features/
  │   ├── image-editing/
  │   │   ├── components/
  │   │   ├── hooks/
  │   │   └── services/
  │   └── export/
  │       ├── components/
  │       ├── services/
  │       └── utils/
  └── shared/
      ├── ui/
      └── utils/
```

---

## 🎯 Common Patterns

### Using the App Context

```tsx
// ✅ GOOD - Use specific destructuring
const { appState, captureImage, setError } = useAppContext();

// ❌ AVOID - Pulling everything
const context = useAppContext();
// Then context.appState, context.captureImage, etc.
```

### Error Handling

```tsx
// ✅ GOOD - Use context for error display
const { setError } = useAppContext();
try {
  // Do something
} catch (error) {
  setError(error instanceof Error ? error.message : 'Unknown error');
}

// ✅ ALSO GOOD - Let ErrorBoundary catch it
throw error; // ErrorBoundary will display gracefully
```

### Loading States

```tsx
// ✅ GOOD - Use context loading
const { isLoading, loadingMessage } = useAppContext();

if (isLoading) {
  return <Spinner />;
}

// ❌ AVOID - Local loading state for app-wide operations
const [isLoading, setIsLoading] = useState(false);
```

---

## 🎨 Styling Patterns

### Use Design Tokens

```tsx
// ✅ GOOD - Use theme tokens
import { theme } from '../design/theme';

<button style={{
  backgroundColor: theme.colors.primary[600],
  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
  borderRadius: theme.borderRadius.lg,
  transition: theme.transitions.standard,
}}>
  Click me
</button>

// ❌ AVOID - Magic numbers
<button style={{
  backgroundColor: '#2d65ff',
  padding: '12px 16px',
  borderRadius: '8px',
}}>
  Click me
</button>
```

### Responsive Design

```tsx
// ✅ GOOD - Mobile-first with Tailwind
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <Card key={item.id} item={item} />)}
</div>

// ✅ ALSO GOOD - Use theme spacing
<div style={{
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fit, minmax(${theme.spacing[64]}, 1fr))`,
  gap: theme.spacing[6],
}}>
  {items.map(item => <Card key={item.id} item={item} />)}
</div>
```

---

## ⚡ Performance Best Practices

### Memoization

```tsx
// ✅ GOOD - Memoize expensive computations
import { useMemo, useCallback } from 'react';

export const MyComponent = ({ items }: { items: Item[] }) => {
  const filteredItems = useMemo(() => {
    return items.filter(item => item.active);
  }, [items]);

  const handleClick = useCallback((id: string) => {
    // Handle click
  }, []);

  return <div>{filteredItems.length}</div>;
};

// ❌ AVOID - Recomputing on every render
export const MyComponent = ({ items }: { items: Item[] }) => {
  const filteredItems = items.filter(item => item.active);
  const handleClick = () => { /* ... */ };
  return <div>{filteredItems.length}</div>;
};
```

### Debounce Input

```tsx
// ✅ GOOD - Debounce expensive operations
import { debounce } from '../utils/performance';

const handleSearch = debounce((query: string) => {
  // API call or expensive operation
  performSearch(query);
}, 300);

<input onChange={(e) => handleSearch(e.target.value)} />

// ❌ AVOID - Call on every keystroke
<input onChange={(e) => performSearch(e.target.value)} />
```

---

## 🛡️ Error Handling Patterns

### Expected Errors

```tsx
// ✅ GOOD - Handle known error cases
try {
  const image = await enhanceImageWithAI(base64, 'image/jpeg', options);
  if (!image) {
    throw new Error('AI returned empty image');
  }
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  setError(`Enhancement failed: ${message}`);
}

// ❌ AVOID - Generic error handling
try {
  const image = await enhanceImageWithAI(base64, 'image/jpeg', options);
} catch (error) {
  setError('Something went wrong');
}
```

### API Errors

```tsx
// ✅ GOOD - Provide context in error messages
try {
  await downloadImage(url, { format: 'jpeg' });
} catch (error) {
  if (error instanceof Error && error.message.includes('blob')) {
    setError('Image format error. Try PNG instead.');
  } else {
    setError('Download failed. Check your internet connection.');
  }
}
```

---

## ♿ Accessibility Checklist

### Before committing code:

- [ ] All buttons have clear labels or `aria-label`
- [ ] Form inputs have associated `<label>` elements
- [ ] Color isn't the only way to convey information
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Interactive elements are keyboard accessible
- [ ] Images have meaningful `alt` text
- [ ] Screen reader announces dynamic changes
- [ ] Focus visible is always apparent
- [ ] Modals have focus trap
- [ ] Contrast ratio >= 4.5:1 (AA standard)

### Quick Accessibility Helpers

```tsx
import {
  getIconButtonProps,
  announceToScreenReader,
  prefersReducedMotion
} from '../utils/accessibility';

// Icon button with accessibility
<button {...getIconButtonProps('Close modal')}>
  ✕
</button>

// Announce changes
announceToScreenReader('Image saved successfully', 'polite');

// Respect motion preferences
{!prefersReducedMotion() && <AnimatedComponent />}
```

---

## 🧪 Testing Patterns

### Component Testing

```tsx
// ✅ GOOD - Test behavior, not implementation
import { render, screen, fireEvent } from '@testing-library/react';

test('export dialog downloads image', async () => {
  render(
    <ExportDialog
      isOpen={true}
      imageDataUrl={mockImage}
      onClose={jest.fn()}
    />
  );

  const downloadButton = screen.getByText(/Download Image/i);
  fireEvent.click(downloadButton);

  expect(downloadButton).toBeDisabled();
});

// ❌ AVOID - Testing implementation details
test('state changes correctly', () => {
  // Don't test isExporting state directly
});
```

### Integration Testing

```tsx
// Test the full flow
test('user can edit and export image', async () => {
  const { getByLabelText, getByText } = render(<App />);

  // Navigate to camera
  fireEvent.click(getByText(/Start New Post/i));

  // Take photo
  fireEvent.click(getByLabelText(/Capture/i));

  // Adjust brightness
  const brightnessSlider = getByLabelText(/Brightness/i);
  fireEvent.change(brightnessSlider, { target: { value: '20' } });

  // Export
  fireEvent.click(getByText(/Download/i));
});
```

---

## 🚨 Common Pitfalls

### 1. Prop Drilling (Use Context Instead)

```tsx
// ❌ AVOID - Props passed through many levels
<Level1 data={data} />
  <Level2 data={data} />
    <Level3 data={data} />
      <Component data={data} />

// ✅ USE - Context
const { data } = useAppContext();
```

### 2. Missing Fallbacks

```tsx
// ✅ GOOD - Provide fallbacks
const name = user?.name || 'Guest';
const items = gallery?.length > 0 ? gallery : [];

// ❌ AVOID - Assume data exists
const name = user.name; // Could crash if user is null
```

### 3. Stale Closures

```tsx
// ✅ GOOD - Include dependencies
const handleClick = useCallback(() => {
  console.log(count);
}, [count]); // ← dependency array

// ❌ AVOID - Stale values
const handleClick = () => {
  console.log(count); // Always old value
};
```

### 4. Forgot to Cleanup

```tsx
// ✅ GOOD - Cleanup subscriptions
useEffect(() => {
  const observer = createFocusTrap(element);
  return () => observer(); // Cleanup
}, []);

// ❌ AVOID - Memory leaks
useEffect(() => {
  const observer = createFocusTrap(element);
  // No cleanup!
}, []);
```

---

## 📊 Performance Checklist

Before shipping:

- [ ] Bundle size < 500KB (gzipped)
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals green
- [ ] Images optimized (next-image or equivalent)
- [ ] Code splitting implemented for heavy features
- [ ] Unused dependencies removed
- [ ] Console errors cleared
- [ ] Network requests batched
- [ ] Animations respect prefers-reduced-motion
- [ ] Mobile performance tested on real device

---

## 🔍 Debugging Tips

### Log Hook Values Safely

```tsx
// ✅ GOOD - Use custom hook for debugging
const useDebugValue = (label: string, value: any) => {
  useEffect(() => {
    console.log(`[${label}]`, value);
  }, [label, value]);
};

// Usage
useDebugValue('appState', appState);
```

### Performance Profiling

```tsx
// Use React DevTools Profiler
// Cmd+K, search "Profiler" in DevTools

// Or use the utility
import { measureAsyncPerformance } from '../utils/performance';

const result = await measureAsyncPerformance(
  'Image Processing',
  async () => processImage(url)
);
```

### Check Memory Usage

```tsx
// In console:
performance.memory.usedJSHeapSize / 1048576 // MB

// Or use built-in detector
import { detectMemoryLeaks } from '../utils/performance';
const leak = detectMemoryLeaks();
leak.checkGrowth(); // Logs if > 20% growth
```

---

## 🚀 Before You Push

### Code Quality

```bash
# Format code
npm run format

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Test
npm run test
```

### Commit Message Format

```
type: brief description

Optional longer explanation

Fixes #123
Related to #456
```

Types:
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring
- `perf:` Performance improvement
- `a11y:` Accessibility improvement
- `test:` Test additions/updates
- `docs:` Documentation
- `chore:` Build/tooling updates

---

## 📚 Quick Reference

### Import Commonly Used Items

```tsx
// State & Context
import { useAppContext } from '../context/AppContext';
import { useState, useCallback, useMemo, useEffect } from 'react';

// Components
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';

// Services
import { enhanceImageWithAI } from '../services/geminiService';
import { applyFiltersToImage } from '../services/imageEditorService';
import { downloadImage } from '../services/exportService';

// Design & Utils
import { theme } from '../design/theme';
import { debounce } from '../utils/performance';
import { announceToScreenReader } from '../utils/accessibility';
```

---

## 🎯 Success Criteria

Your code is ready when:

- ✅ TypeScript compiles without errors
- ✅ All tests pass
- ✅ No console errors/warnings
- ✅ Accessibility audit passes
- ✅ Performance metrics green
- ✅ Responsive on mobile/desktop
- ✅ Works in Chrome, Firefox, Safari
- ✅ Code reviewed by peer
- ✅ Documented with comments

---

**Happy coding! Remember: Good code is readable code. When in doubt, optimize for clarity over cleverness.** 🚀
