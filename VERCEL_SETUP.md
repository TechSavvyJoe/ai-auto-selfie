# Vercel Setup & Deployment Guide

> Deploy to production in 5 minutes

**Prerequisites:** Your code must be on GitHub first. See [GITHUB_SETUP.md](./GITHUB_SETUP.md)

---

## Step 1: Create Vercel Account

1. Go to https://vercel.com/signup
2. Sign up using GitHub (recommended - simplest)
3. Authorize Vercel to access your GitHub account
4. You'll land on the Vercel dashboard

---

## Step 2: Import GitHub Repository

1. Click **Add New** → **Project**
2. Click **Import Git Repository**
3. Find and click **ai-auto-selfie** (your repository)
4. Click **Import**

---

## Step 3: Set Environment Variables

This is the critical step - Vercel needs your Gemini API key.

1. On the import page, scroll down to **Environment Variables**
2. Click **Add Environment Variable**
3. Add your variables:

```
Name: VITE_GEMINI_API_KEY
Value: [Your API key from aistudio.google.com/app/apikey]
```

4. Optional (feature flags - can skip for now):

```
VITE_ANALYTICS_ENABLED = true
VITE_ENABLE_BATCH_PROCESSING = true
VITE_ENABLE_PRESETS = true
VITE_ENABLE_WATERMARK = true
```

---

## Step 4: Deploy

1. Click **Deploy** button
2. Vercel builds and deploys (takes 1-2 minutes)
3. You get a **Production URL** like: `https://ai-auto-selfie.vercel.app`
4. Click it to see your live app! 🚀

---

## Verify Deployment

### Check Build Succeeded
- Green checkmark on Vercel dashboard
- No build errors

### Check App Works
1. Visit your production URL
2. Test camera (allow permissions)
3. Test edit adjustments
4. Verify theme switcher works
5. Check Gemini enhancement works

### Check Logs
- Vercel → Function Logs tab
- Browser console (F12) - should be clean

---

## Set Up Auto-Deploy

Already configured! Every time you push to `main` branch:

```bash
git add .
git commit -m "Your change"
git push
```

Vercel automatically:
1. Detects the push
2. Runs build
3. Deploys if successful
4. Updates your live app

---

## Custom Domain (Optional)

1. Vercel → Settings → Domains
2. Add your domain (e.g., `ai-autoselfie.com`)
3. Point DNS to Vercel (instructions provided)
4. Wait 24 hours for DNS propagation

---

## Troubleshooting

### Build Failed
Check logs on Vercel dashboard:
- Click **Deployments** tab
- Click failed deployment
- Check error message
- Common causes:
  - TypeScript errors: `npm run type-check` locally
  - Missing env vars: Add `VITE_GEMINI_API_KEY`
  - Node version mismatch: We use Node 18.x (configured in vercel.json)

### App Shows Blank Page
- Check browser console (F12) for errors
- Check Vercel Function Logs
- Ensure environment variables are set
- Try hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

### Camera Not Working
- Camera requires HTTPS (Vercel provides this)
- Check browser permissions
- Try different browser
- Check camera isn't in use elsewhere

### Gemini Enhancement Not Working
- Verify `VITE_GEMINI_API_KEY` is set on Vercel
- Check API key is valid (test at aistudio.google.com)
- Check API quota in Google Cloud console
- Check error in browser console (F12)

### Slow Performance
- Check Lighthouse audit on Vercel Analytics
- Review [PERFORMANCE_GUIDE.md](./PERFORMANCE_GUIDE.md)
- Check that production build is being served (not dev)

---

## Monitoring Your App

### Vercel Analytics
- Vercel dashboard → Analytics tab
- See real user metrics:
  - Page load time
  - Core Web Vitals
  - Error rates
  - Traffic patterns

### Error Tracking
- Vercel dashboard → Logs tab
- Set up alerts (optional):
  - Email notifications for build failures
  - Slack integration

### Performance Monitoring
- Check Lighthouse score monthly
- Monitor Core Web Vitals
- Watch bundle size

---

## Production Checklist

Before going live, verify:

- [ ] Environment variables are set on Vercel
- [ ] App builds without errors
- [ ] Camera works on production URL
- [ ] Image editing works
- [ ] Gemini enhancement completes
- [ ] Download works
- [ ] Theme switcher works
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Analytics tracking enabled (optional)

---

## Commands Reference

```bash
# Test locally before pushing
npm run build    # Build for production
npm run preview  # Preview production build locally

# Push to trigger auto-deploy
git push

# View logs
vercel logs       # Stream logs

# Redeploy latest commit
vercel --prod

# Preview deploy (test without affecting production)
vercel          # Creates preview URL
```

---

## Environment Variables Reference

### Required
```
VITE_GEMINI_API_KEY = your_api_key_here
```

### Optional Feature Flags
```
VITE_ANALYTICS_ENABLED = true/false
VITE_ENABLE_BATCH_PROCESSING = true/false
VITE_ENABLE_PRESETS = true/false
VITE_ENABLE_WATERMARK = true/false
VITE_ENABLE_OFFLINE = true/false
```

### Environment Selection (optional)
```
VITE_ENV = production/staging/development
```

---

## After Deployment

### Share Your App
- Production URL: `https://ai-auto-selfie.vercel.app`
- GitHub repo: `https://github.com/USERNAME/ai-auto-selfie`
- Share with team/users

### Set Up Monitoring
- Check Vercel Analytics daily for first week
- Monitor error logs
- Get feedback from users

### Plan Improvements
- Review [PERFORMANCE_GUIDE.md](./PERFORMANCE_GUIDE.md) for optimization
- Plan Phase 2 features
- Gather user feedback

---

## Success Indicators

You'll know it's working when:

✅ Vercel dashboard shows green (deployed)
✅ Production URL loads app
✅ Camera works with permissions
✅ Adjustments apply to image
✅ Gemini enhancement completes in seconds
✅ Download saves file to device
✅ Theme switcher toggles dark/light
✅ No errors in browser console
✅ Mobile layout looks good
✅ Analytics tracking (if enabled)

---

## Next Steps

1. **First-time users:** Follow the deployment checklist above
2. **Ready for feedback:** Share link with dealership team
3. **Need optimization:** See [PERFORMANCE_GUIDE.md](./PERFORMANCE_GUIDE.md)
4. **Plan features:** See [ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md)
5. **Need help:** Check [TROUBLESHOOTING.md](./NEXT_STEPS.md)

---

## Live App

Your app is now live at your Vercel URL! 🎉

**Share it:**
```
https://ai-auto-selfie.vercel.app
```

**Need changes?** Push to main branch and Vercel auto-deploys.

**Need support?** See [DEPLOY_TO_VERCEL.md](./DEPLOY_TO_VERCEL.md) or check Vercel docs: https://vercel.com/docs

---

**Deployment Status:** ✅ Ready
**Auto-Deploy:** ✅ Enabled
**Live at:** https://ai-auto-selfie.vercel.app
