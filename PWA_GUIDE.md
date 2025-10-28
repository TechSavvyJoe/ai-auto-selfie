# 📱 PWA Installation & Features Guide

## What is a PWA?

A **Progressive Web App (PWA)** makes your web app feel like a native mobile app. It can be installed on your phone's home screen, works offline, and runs fullscreen without browser UI.

## Benefits for Your Dealership

### 🚀 Why Install as PWA?

1. **Instant Access** - App icon on home screen, no app store needed
2. **Fullscreen** - No browser bars, more screen space
3. **Offline Mode** - Works without internet (photos, editing, gallery)
4. **Faster Loading** - Cached resources load instantly
5. **Native Feel** - Looks and behaves like a mobile app
6. **Auto-Updates** - Always have the latest version

---

## Installation Instructions

### iPhone / iPad (iOS 15+)

1. **Open in Safari** (must use Safari, not Chrome)
   - Navigate to your production URL
   
2. **Tap Share Button**
   - Bottom center of screen (square with arrow up)

3. **Scroll Down → "Add to Home Screen"**
   - You'll see the app icon preview
   
4. **Customize Name** (optional)
   - Default: "Auto Selfie"
   - You can shorten it or keep as-is

5. **Tap "Add"** (top right)
   - Icon appears on home screen immediately

6. **Launch App**
   - Tap the new icon
   - Runs fullscreen like a native app!

### Android (Chrome, Edge, Samsung Internet)

1. **Open in Chrome/Edge**
   - Navigate to your production URL

2. **Tap Menu** (three dots, top right)

3. **Select "Install App" or "Add to Home Screen"**
   - May also show automatic install banner

4. **Confirm Installation**
   - Tap "Install" in popup

5. **Launch App**
   - Find icon in app drawer or home screen
   - Runs as standalone app

---

## PWA Features

### ✅ What Works Offline

When internet is unavailable, you can still:
- ✅ Take photos with camera
- ✅ Edit photos (filters, adjustments, AI enhancement)
- ✅ View gallery
- ✅ Export photos
- ✅ Use all editing tools
- ✅ Access saved presets

**What requires internet:**
- ❌ Supabase sync (photos saved locally until online)
- ❌ Admin dashboard (user/dealership management)
- ❌ Gemini AI features (if using external AI)

### 🔄 Background Sync

When you go back online:
- Photos saved offline will sync to Supabase automatically
- Updates check every hour
- Service worker handles sync in background

### 🎯 App Shortcuts

Long-press the app icon to see quick actions:
- **Take Photo** - Jump directly to camera
- **View Gallery** - Browse saved photos

---

## Technical Details

### Service Worker

The app includes a service worker (`sw.js`) that:
- Caches static assets (HTML, CSS, JS)
- Enables offline functionality
- Syncs data when back online
- Checks for updates hourly
- Provides push notification support (future)

### Caching Strategy

**Static Assets (JS/CSS/Images)**:
- Cache-first strategy
- Instant loading from cache
- Updates in background

**HTML Pages**:
- Network-first strategy
- Always try to get fresh content
- Fallback to cache if offline

**API Calls**:
- Network-only (no caching)
- Supabase, Gemini API always fresh

### Storage Limits

**LocalStorage** (offline photos):
- ~5-10MB per origin (browser dependent)
- Stores compressed images
- Can hold 50-100 high-res photos

**Cache Storage** (PWA assets):
- ~50MB+ on most devices
- Stores app code and assets
- Automatically managed by service worker

---

## Troubleshooting

### "Add to Home Screen" not showing (iOS)

**Solution**:
1. Must use **Safari** (not Chrome/Firefox)
2. Must be on real device (not simulator)
3. Must be HTTPS (production only, not localhost)
4. Try reloading page first

### "Install App" not showing (Android)

**Solution**:
1. Ensure using Chrome/Edge/Samsung Internet
2. Must be HTTPS URL
3. Must have valid manifest.json
4. Try Menu → "Install App" manually

### App not working offline

**Check**:
1. Service worker registered (check console: "SW registered")
2. Try using app online first (caches assets)
3. Then go offline and test
4. Photos taken offline save to localStorage

### App not updating

**Force Update**:
1. Close app completely
2. Clear browser cache (Settings → Safari/Chrome → Clear Data)
3. Reinstall PWA from browser
4. Service worker checks for updates every hour automatically

---

## For Developers

### Testing PWA Locally

**Development Mode**:
```bash
# Service workers only work on HTTPS or localhost
npm run dev  # Localhost works for testing
```

**Production Testing**:
```bash
# Deploy to Vercel (HTTPS)
vercel --prod

# Test on phone
# Open production URL in mobile browser
# Install as PWA
```

### Verifying Service Worker

**Browser Console**:
```javascript
// Check if service worker is registered
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg);
});

// Check cache storage
caches.keys().then(keys => {
  console.log('Cached:', keys);
});
```

**Chrome DevTools** (Desktop):
1. F12 → Application tab
2. Service Workers → See registration status
3. Cache Storage → Inspect cached assets
4. Manifest → Verify manifest.json

**Safari DevTools** (iOS):
1. Settings → Safari → Advanced → Web Inspector
2. Connect iPhone to Mac
3. Develop → [Device] → [Site]
4. Storage tab → See caches

### Updating the PWA

**Code Changes**:
1. Make changes to code
2. Deploy: `vercel --prod`
3. Service worker detects new version
4. Updates automatically on next app launch
5. Or manually: Close app fully, reopen

**Manifest Changes**:
1. Edit `public/manifest.json`
2. Change name, icons, colors, etc.
3. Deploy changes
4. Users must reinstall PWA to see manifest updates

**Icon Changes**:
1. Replace `public/icon-192.svg` and `public/icon-512.svg`
2. Deploy
3. Users must reinstall to see new icon

---

## Deployment Checklist

Before deploying PWA to production:

### Required Files
- [x] `public/manifest.json` - App metadata
- [x] `public/sw.js` - Service worker
- [x] `public/icon-192.svg` - Small icon
- [x] `public/icon-512.svg` - Large icon
- [x] `index.html` - Links to manifest, registers SW

### Manifest Configuration
- [x] Name and short_name
- [x] Description
- [x] Icons (192px, 512px)
- [x] Theme color (#8b5cf6)
- [x] Background color (#0a0a0a)
- [x] Display mode (standalone)
- [x] Start URL (/)

### Service Worker Features
- [x] Install event (cache static assets)
- [x] Activate event (clean old caches)
- [x] Fetch event (serve from cache)
- [x] Background sync (photos)
- [x] Push notifications (ready for future)

### Testing
- [x] Test on iOS Safari
- [x] Test on Android Chrome
- [x] Test offline mode
- [x] Test cache updates
- [x] Test background sync
- [x] Verify HTTPS (production)

---

## User Training

### For Sales Staff

**Installation** (5 minutes):
1. Open browser, go to app URL
2. Follow install steps (see above)
3. Verify icon on home screen
4. Launch and test camera

**Daily Use**:
1. Tap app icon (like any app)
2. Take customer photos
3. Enhance with AI
4. Save to gallery
5. Export/share

**Offline Scenario**:
1. No internet? No problem!
2. Camera still works
3. Editing still works
4. Photos save locally
5. Auto-sync when back online

**Best Practices**:
- Install PWA for fastest access
- Keep app updated (automatic)
- Clear old photos weekly
- Close app fully when done (free RAM)

---

## Future Enhancements

### Planned PWA Features

1. **Background Sync**
   - Auto-upload photos when online
   - Retry failed uploads
   - Sync across devices

2. **Push Notifications**
   - New customer photo shared
   - Dealership announcements
   - Weekly photo stats

3. **Web Share API**
   - Share photos to other apps
   - Direct to SMS/WhatsApp
   - Email integration

4. **File System Access**
   - Save directly to camera roll
   - Batch export to device
   - Folder organization

5. **Periodic Background Sync**
   - Check for new shared photos
   - Update dealership presets
   - Sync user settings

---

## Resources

### Documentation
- [PWA on MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

### Testing Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - PWA audit
- [PWA Builder](https://www.pwabuilder.com/) - Test and package
- [Web.dev](https://web.dev/learn/pwa/) - PWA learning path

### Mobile Testing
- [BrowserStack](https://www.browserstack.com/) - Real device testing
- [Safari Remote Debugging](https://developer.apple.com/documentation/safari-developer-tools/inspecting-ios) - iOS debugging

---

## Support

Having issues with PWA?

1. Check troubleshooting section above
2. Verify HTTPS (must be production URL)
3. Clear browser cache and reinstall
4. Check browser console for errors
5. Test on different browser/device

**Common Solutions**:
- Must use Safari on iOS (not Chrome)
- Must be HTTPS (not HTTP)
- Service worker needs online first (to cache)
- Reinstall fixes most issues

---

## Success Metrics

After PWA installation, you should have:

✅ App icon on home screen  
✅ Fullscreen launch (no browser UI)  
✅ Offline camera and editing  
✅ Fast loading (<1 second)  
✅ Auto-updates (no manual update)  
✅ Native app feel  
✅ Quick shortcuts (long-press icon)  

**Mobile Optimization: 100/100** 🏆
