# ⚡ Performance Optimization Guide

Make your app blazing fast.

---

## 🎯 Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| **First Contentful Paint** | < 2s | Optimize |
| **Largest Contentful Paint** | < 4s | Optimize |
| **Time to Interactive** | < 3s | Monitor |
| **Cumulative Layout Shift** | < 0.1 | Good |
| **Lighthouse Score** | > 90 | Target |
| **Bundle Size** | < 200KB gzip | Monitor |
| **Image Enhancement** | < 10s | Good |

---

## 🚀 Quick Wins (Do These First)

### **1. Enable Code Splitting** (5 min)

Lazy load heavy components:

```tsx
import { lazy, Suspense } from 'react';
import Spinner from './components/common/Spinner';

const ImageAdjustmentPanel = lazy(() => import('./components/ImageAdjustmentPanel'));
const ExportDialog = lazy(() => import('./components/ExportDialog'));

// In your component:
<Suspense fallback={<Spinner />}>
  <ImageAdjustmentPanel {...props} />
</Suspense>
```

### **2. Optimize Images** (10 min)

```tsx
// Use modern formats
<img
  src="image.webp"
  alt="description"
  width={300}
  height={200}
/>

// With fallback
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="description" />
</picture>
```

### **3. Memoize Components** (15 min)

```tsx
import { memo } from 'react';

export const FilterCarousel = memo(({ items }) => (
  // Component
));

// Or for expensive computations:
const adjustments = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

### **4. Debounce Input** (10 min)

```tsx
import { debounce } from './utils/performance';

const handleSearch = debounce((query) => {
  performSearch(query);
}, 300);

<input onChange={(e) => handleSearch(e.target.value)} />
```

---

## 📊 Measure Performance

### **Using Lighthouse**

```bash
# In Chrome DevTools:
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Click "Analyze page load"
4. Review report
5. Fix issues rated "Needs Work"
```

### **Using WebPageTest**

```
https://www.webpagetest.org/
- Enter your URL
- Run test
- Get detailed breakdown
```

### **Using Vercel Analytics**

```
Dashboard → Project → Analytics
- View Core Web Vitals
- Monitor real user metrics
- Compare over time
```

---

## 🔍 Performance Audit Checklist

### **Bundle Size** ✓

```bash
# Check bundle size
npm run build

# Expected sizes:
# dist/index.js: < 150KB
# dist/index.css: < 50KB
# Total: < 200KB (gzipped)

# If too large:
# 1. Check for unused imports
# 2. Enable code splitting
# 3. Remove unused dependencies
```

### **Runtime Performance** ✓

```tsx
// Use Performance.now() to measure
const start = performance.now();
// ... operation ...
const end = performance.now();
console.log(`Operation took ${end - start}ms`);

// Target:
// - Component render: < 16ms (60fps)
// - State update: < 100ms
// - Image enhancement: < 10s
```

### **Memory Usage** ✓

```bash
# In Chrome DevTools:
1. Open DevTools
2. Go to "Memory" tab
3. Take heap snapshot
4. Check for memory leaks

# Look for:
# - Growing memory over time
# - Retained objects
# - Detached DOM nodes
```

### **Network Performance** ✓

```bash
# In Chrome DevTools:
1. Open DevTools
2. Go to "Network" tab
3. Reload page
4. Check:
   - Number of requests (minimize)
   - Request sizes (compress)
   - Load time per request
```

---

## 🔧 Advanced Optimizations

### **1. Virtual Scrolling for Large Lists**

```tsx
import { calculateVisibleRange } from './utils/performance';

const Gallery = ({ items }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const { visibleStart, visibleEnd } = calculateVisibleRange(
    scrollTop,
    window.innerHeight,
    100, // itemHeight
    items.length
  );

  return (
    <div onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
      {items.slice(visibleStart, visibleEnd).map(item => (
        <Item key={item.id} item={item} />
      ))}
    </div>
  );
};
```

### **2. Request Idle Callback**

```tsx
import { requestIdleCallback } from './utils/performance';

useEffect(() => {
  // Non-critical work
  requestIdleCallback(() => {
    expensiveAnalyticsCall();
  });
}, []);
```

### **3. Service Worker for Offline**

```bash
# Create public/sw.js
# Register in index.tsx
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### **4. Image Optimization Pipeline**

```tsx
// Use responsive images
<img
  srcSet="small.webp 480w, medium.webp 768w, large.webp 1200w"
  sizes="(max-width: 600px) 480px, 100vw"
  src="fallback.jpg"
  alt="description"
/>
```

---

## 🎯 Performance Checklist

### **Before Launch**

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 4s
- [ ] No layout shift (CLS < 0.1)
- [ ] All images optimized
- [ ] No unused CSS/JS
- [ ] Code splitting enabled
- [ ] Assets cached properly
- [ ] API calls batched
- [ ] Analytics tracking enabled

### **After Launch**

- [ ] Monitor Lighthouse score weekly
- [ ] Check Core Web Vitals in Vercel
- [ ] Review error logs
- [ ] Check analytics for slow pages
- [ ] Monitor user experience metrics
- [ ] Collect user feedback on speed

---

## 📈 Performance Over Time

Track these metrics:

```
Week 1:  Establish baseline
Week 2:  After optimizations
Week 4:  After user feedback
Month 2: Long-term trends
```

### **Create Dashboard**

```bash
# Monitor at:
https://vercel.com/dashboard/project/analytics

# Track:
- Page load time
- Time to interactive
- Largest contentful paint
- Cumulative layout shift
- Core Web Vitals
```

---

## 🚀 Deployment Optimization

### **Vercel Settings** (Already Configured)

In `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "framework": "vite",
  "cleanUrls": true,
  "trailingSlash": false
}
```

### **Environment Variables**

```bash
# Production build optimizations
NODE_ENV=production
VITE_GEMINI_API_KEY=your_key
```

### **Caching Headers**

Already set in `vercel.json`:

```json
"headers": [
  {
    "key": "Cache-Control",
    "value": "public, max-age=31536000, immutable"
  }
]
```

---

## 🔥 Common Performance Issues

| Issue | Solution | Impact |
|-------|----------|--------|
| Large bundle | Code splitting | -30% size |
| Unoptimized images | Use WebP + compression | -50% size |
| Unused dependencies | npm prune | -10% size |
| Slow API calls | Cache + batch | 5x faster |
| Memory leaks | Use DevTools | Stable memory |
| Unnecessary rerenders | useMemo + useCallback | Smoother UI |
| Large localStorage | Cleanup old data | Faster load |
| Synchronous operations | Use async/await | Non-blocking |

---

## 📊 Real User Metrics

Track what actual users experience:

```tsx
// Add to index.tsx
import { getCLS, getFCP, getFID, getLCP } from 'web-vitals';

getCLS(console.log);
getFCP(console.log);
getFID(console.log);
getLCP(console.log);
```

---

## 🎯 Success Metrics

Your performance is good when:

✅ **Fast First Load**
- First paint: < 1.5s
- Content loaded: < 2s
- Interactive: < 3s

✅ **Smooth Experience**
- No jank (60fps scrolling)
- No layout shift
- Quick responses to input

✅ **Efficient Resources**
- Network efficient
- Memory stable
- CPU optimized

✅ **Good Metrics**
- Lighthouse: > 90
- CLS: < 0.1
- FID: < 100ms
- LCP: < 2.5s

---

## 🚀 Next Steps

1. **Run Lighthouse** - Identify issues
2. **Implement Quick Wins** - Code splitting, image optimization
3. **Test Changes** - Measure improvement
4. **Monitor Continuously** - Track over time
5. **Iterate** - Fix issues as they appear

---

**Your app should feel instant and fluid.** If it doesn't, use these tools to find and fix performance issues.

**Performance = User Experience = Success** 🚀
