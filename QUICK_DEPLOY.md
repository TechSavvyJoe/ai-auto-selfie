# Quick Deploy to Production (10 minutes)

This is the fastest way to get your app live. For detailed steps, see [GITHUB_SETUP.md](./GITHUB_SETUP.md) and [VERCEL_SETUP.md](./VERCEL_SETUP.md).

---

## Step 1: Create GitHub Repo (2 min)

```bash
# Your code is already committed locally. Just need to create repo on GitHub.

# 1. Go to https://github.com/new
# 2. Name: ai-auto-selfie
# 3. Description: Professional image editor for dealerships
# 4. Visibility: Public
# 5. Create repository
```

---

## Step 2: Push to GitHub (2 min)

```bash
# Replace USERNAME with your GitHub username
git remote add origin https://github.com/USERNAME/ai-auto-selfie.git
git branch -M main
git push -u origin main
```

Your code is now on GitHub! ✅

---

## Step 3: Deploy to Vercel (3 min)

```bash
# 1. Go to https://vercel.com/signup
# 2. Sign up with GitHub
# 3. Click "Add New" → "Project"
# 4. Click "Import Git Repository"
# 5. Select ai-auto-selfie
# 6. Add Environment Variable:
#    - Name: VITE_GEMINI_API_KEY
#    - Value: [your API key from aistudio.google.com]
# 7. Click Deploy
```

Your app is live! 🚀

---

## Verify It Works

Click the production URL from Vercel dashboard:
- ✅ Camera works (allow permissions)
- ✅ Adjustments apply
- ✅ Gemini enhancement works
- ✅ Download works
- ✅ Theme switcher works

---

## Share Your App

```
https://ai-auto-selfie.vercel.app
(Your actual URL from Vercel dashboard)
```

---

## Auto-Deploy on Every Push

From now on, just push code:

```bash
git add .
git commit -m "Your change"
git push
```

Vercel automatically deploys! ✅

---

## Need More Details?

- **GitHub setup:** [GITHUB_SETUP.md](./GITHUB_SETUP.md)
- **Vercel setup:** [VERCEL_SETUP.md](./VERCEL_SETUP.md)
- **Troubleshooting:** See the "Troubleshooting" sections in those files
- **After launch:** [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)

---

## One-Time Setup Complete!

You now have:
- ✅ Code on GitHub
- ✅ App live on Vercel
- ✅ Auto-deploy on every push
- ✅ Production monitoring

**Next:** Follow [START_HERE.md](./START_HERE.md) for testing & optimization ✅
