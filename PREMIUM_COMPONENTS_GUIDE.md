# 🎨 Premium Components - Quick Reference Guide

## PremiumButton Component

### Import
```tsx
import { PremiumButton, IconButton } from './common/PremiumButton';
```

### Basic Usage
```tsx
<PremiumButton variant="primary" size="md" onClick={handleClick}>
  Click Me
</PremiumButton>
```

### Props
```tsx
interface PremiumButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}
```

### Examples

**Primary Button (Default)**
```tsx
<PremiumButton variant="primary" size="lg">
  Download Image
</PremiumButton>
```

**With Icon**
```tsx
<PremiumButton
  variant="primary"
  size="md"
  icon={<Icon type="download" className="w-5 h-5" />}
>
  Save to Device
</PremiumButton>
```

**Loading State**
```tsx
<PremiumButton loading={isLoading}>
  Processing...
</PremiumButton>
```

**Full Width**
```tsx
<PremiumButton fullWidth variant="success">
  Share to Social Media
</PremiumButton>
```

**Ghost Variant** (No background)
```tsx
<PremiumButton variant="ghost">
  Cancel
</PremiumButton>
```

### Size Options
- `xs`: Extra small (12px padding) - for compact UIs
- `sm`: Small (16px padding) - for dense layouts
- `md`: Medium (24px padding) - default, most common
- `lg`: Large (32px padding) - for CTAs
- `xl`: Extra large (40px padding) - for hero sections

### Color Variants
- `primary`: Blue gradient (main actions)
- `secondary`: Gray gradient (alternative actions)
- `success`: Green gradient (confirmations)
- `danger`: Red gradient (deletions)
- `warning`: Yellow gradient (alerts)
- `ghost`: Transparent with border (secondary options)

---

## PremiumCard Component

### Import
```tsx
import { PremiumCard, StatCard, FeatureCard } from './common/PremiumCard';
```

### StatCard - For Metrics

```tsx
<StatCard
  icon="🖼️"
  label="Total Images"
  value={42}
  change="+5"
  trend="up"
  gradient="primary"
/>
```

**Props**
```tsx
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  gradient?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}
```

**Examples**
```tsx
// Basic stat
<StatCard
  icon="⭐"
  label="Rating"
  value="4.8"
  gradient="success"
/>

// With trend
<StatCard
  icon="📈"
  label="Performance"
  value="95%"
  change="+10%"
  trend="up"
  gradient="primary"
/>

// Danger trend
<StatCard
  icon="🔴"
  label="Errors"
  value={3}
  change="-2"
  trend="down"
  gradient="danger"
/>
```

### FeatureCard - For Features

```tsx
<FeatureCard
  icon="✨"
  title="AI Enhancement"
  description="Professional-grade processing"
  features={['Professional', 'Cinematic', 'Portrait']}
  onClick={handleClick}
/>
```

**Props**
```tsx
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features?: string[];
  onClick?: () => void;
}
```

**Examples**
```tsx
// Basic feature card
<FeatureCard
  icon="🎨"
  title="Creative Styles"
  description="Multiple artistic effects"
/>

// With features list
<FeatureCard
  icon="⚡"
  title="Fast Processing"
  description="Get results in seconds"
  features={['Real-time preview', 'Batch processing', 'Cloud support']}
  onClick={() => navigate('/features')}
/>
```

### PremiumCard - Base Component

```tsx
<PremiumCard
  gradient="primary"
  hover
  padding="md"
  onClick={handleClick}
>
  <h3>Custom Content</h3>
  <p>Add any content here</p>
</PremiumCard>
```

**Props**
```tsx
interface PremiumCardProps {
  children: React.ReactNode;
  gradient?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'dark';
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}
```

---

## PremiumExportDialog

### Import
```tsx
import PremiumExportDialog from './PremiumExportDialog';
```

### Usage
```tsx
const [showExport, setShowExport] = useState(false);

<PremiumExportDialog
  isOpen={showExport}
  onClose={() => setShowExport(false)}
  imageDataUrl={imageSrc}
  defaultCaption="Check out my enhanced photo!"
  onSuccess={() => console.log('Export successful!')}
/>
```

**Props**
```tsx
interface PremiumExportDialogProps {
  isOpen: boolean;
  imageDataUrl: string;
  onClose: () => void;
  onSuccess?: () => void;
  defaultCaption?: string;
}
```

### Features Included
- Download as JPEG, PNG, or WebP
- Copy to clipboard
- Share to 5 social platforms
- Create public share link
- Edit captions
- Platform-specific tips

---

## PremiumDesktopStartView

### Import
```tsx
import PremiumDesktopStartView from './PremiumDesktopStartView';
```

### Usage
```tsx
<PremiumDesktopStartView
  onStart={handleStart}
  onViewGallery={handleViewGallery}
  galleryStats={{
    totalImages: 42,
    favoriteCount: 12,
    mostUsedMode: 'cinematic',
    totalStorageEstimate: '128'
  }}
/>
```

**Props**
```tsx
interface PremiumDesktopStartViewProps {
  onStart: () => void;
  onViewGallery: () => void;
  galleryStats?: {
    totalImages: number;
    favoriteCount: number;
    mostUsedMode: AIMode | string;
    totalStorageEstimate: string;
  };
}
```

### Features Included
- Hero section with gradient text
- Gallery statistics
- Feature showcase (6 items)
- How it works guide (4 steps)
- AI modes display
- Call-to-action section
- Professional footer

---

## IconButton Component

### Usage
```tsx
import { IconButton } from './common/PremiumButton';

<IconButton
  icon={<Icon type="settings" className="w-5 h-5" />}
  variant="secondary"
  size="md"
  tooltip="Settings"
  onClick={handleSettings}
/>
```

**Props**
```tsx
interface IconButtonProps {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  tooltip?: string;
  onClick?: () => void;
  disabled?: boolean;
}
```

### Size Options
- `sm`: 8px padding (16x16 icon)
- `md`: 10px padding (20x20 icon)
- `lg`: 12px padding (24x24 icon)

---

## Design Tokens Reference

### Colors
```tsx
// Gradients
primary: 'from-primary-500 to-primary-600'
success: 'from-green-500 to-green-600'
danger: 'from-red-500 to-red-600'
warning: 'from-yellow-500 to-yellow-600'
info: 'from-blue-500 to-blue-600'

// Hovers (darker)
primary: 'hover:from-primary-600 hover:to-primary-700'
// ... same for others
```

### Spacing Scale
```
xs: 0.75rem (12px)
sm: 1rem (16px)
md: 1.5rem (24px)
lg: 2rem (32px)
xl: 2.5rem (40px)
```

### Border Radius
```
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 0.75rem (12px)
lg: 1rem (16px)
xl: 1.25rem (20px)
```

### Transitions
```
fast: 'transition-colors duration-200'
normal: 'transition-all duration-300'
slow: 'transition-all duration-500'
```

---

## Common Patterns

### Button with Icon and Loading State
```tsx
<PremiumButton
  variant="primary"
  size="lg"
  icon={<Icon type="download" className="w-5 h-5" />}
  loading={isDownloading}
  disabled={isDownloading}
  onClick={handleDownload}
>
  {isDownloading ? 'Downloading...' : 'Download'}
</PremiumButton>
```

### Card Grid Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <FeatureCard
      key={item.id}
      icon={item.icon}
      title={item.title}
      description={item.description}
      features={item.features}
    />
  ))}
</div>
```

### Stats Dashboard
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <StatCard icon="🖼️" label="Images" value={42} gradient="primary" />
  <StatCard icon="❤️" label="Favorites" value={12} gradient="danger" />
  <StatCard icon="⚡" label="Speed" value="2.3s" gradient="warning" />
  <StatCard icon="💾" label="Storage" value="128MB" gradient="info" />
</div>
```

### Modal/Dialog Pattern
```tsx
const [isOpen, setIsOpen] = useState(false);

return (
  <>
    <PremiumButton onClick={() => setIsOpen(true)}>
      Open Dialog
    </PremiumButton>

    <PremiumExportDialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      imageDataUrl={imageUrl}
    />
  </>
);
```

---

## Customization

### Custom Colors
To add custom gradient colors, extend your Tailwind config:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        custom: {
          500: '#YOUR_COLOR',
          600: '#YOUR_DARKER_COLOR',
        }
      }
    }
  }
}
```

Then use in components:
```tsx
<PremiumButton className="from-custom-500 to-custom-600">
  Custom Button
</PremiumButton>
```

---

## Best Practices

1. **Use variant for semantic meaning**
   - `primary`: Main actions (download, save, submit)
   - `secondary`: Alternative actions (cancel, back)
   - `success`: Positive actions (confirm, complete)
   - `danger`: Destructive actions (delete, remove)

2. **Size buttons appropriately**
   - `sm`: Within dense content
   - `md`: Standard UI actions
   - `lg`: Primary CTAs
   - `xl`: Hero section CTAs

3. **Provide icons for clarity**
   - Download action → download icon
   - Share action → share icon
   - Delete action → trash icon

4. **Use loading state for async operations**
   - API calls
   - File uploads
   - Batch operations

5. **Card hover effects**
   - Use `hover` prop for interactive cards
   - Provide `onClick` handler
   - Show visual feedback on interaction

---

## Troubleshooting

### Button not showing color
- Make sure `variant` prop is valid
- Check if Tailwind CSS is properly configured
- Verify gradient colors exist in your theme

### Icons not displaying
- Import Icon component from `./common/Icon`
- Use valid icon types
- Set appropriate size (w-4 h-4 for most cases)

### Cards not responsive
- Use grid with responsive classes: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Set appropriate gap: `gap-4` for most cases
- Test on different screen sizes

### Animations not smooth
- Check if GPU acceleration is enabled
- Verify transition durations (300ms recommended)
- Ensure no conflicting CSS rules

---

## Examples Repository

All components are used in:
- `PremiumDesktopStartView.tsx` - Complete homepage
- `PremiumExportDialog.tsx` - Export dialog
- `EnhancedDesktopGalleryView.tsx` - Gallery with premium UI
- `ResultView.tsx` - Result screen with premium export

---

## Support

For detailed information, see:
- `PREMIUM_UI_UPGRADE.md` - Component documentation
- `IMPLEMENTATION_COMPLETE.md` - Implementation details
- Component source files - Code comments and types

---

**Happy coding! 🚀**
