# 🚀 Deploy to Vercel - Step by Step

Complete guide to deploy your app to Vercel in 10 minutes.

---

## ✅ Pre-Deployment Checklist

Before deploying, ensure:

```bash
# 1. Code is clean
npm run type-check  # No TypeScript errors
npm run build       # Build succeeds

# 2. Environment variables are set
cat .env.local      # Should have VITE_GEMINI_API_KEY

# 3. No secrets in git
git status          # .env.local should be in .gitignore
cat .gitignore      # Should contain .env.local
```

---

## 🔧 Step 1: Connect Your Git Repository

```bash
# Push to GitHub (if not already)
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/your-username/ai-auto-selfie.git
git push -u origin main
```

---

## 📱 Step 2: Create Vercel Account & Connect Project

### **Option A: Using Vercel Dashboard (Easiest)**

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign up"** → Connect GitHub
3. Authorize Vercel to access your repositories
4. Click **"Import Project"**
5. Select `ai-auto-selfie` repository
6. Accept default settings
7. Click **"Deploy"**

### **Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
# Follow prompts:
# - Link to project? (Y/n) → n (first time)
# - Set up and deploy? → Y
# - Which scope? → Select your account
# - Found vercel.json? → Confirm settings
# - Want to override production settings? → n
```

---

## 🔐 Step 3: Set Environment Variables

Your Vercel deployment needs the Gemini API key.

### **Via Vercel Dashboard:**

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your project → **Settings**
3. Go to **Environment Variables**
4. Add new variable:
   - **Name:** `VITE_GEMINI_API_KEY`
   - **Value:** Your Gemini API key (from Google Cloud Console)
   - **Environments:** Select all (Production, Preview, Development)
5. Click **Save**

### **Via Vercel CLI:**

```bash
vercel env add VITE_GEMINI_API_KEY
# Paste your API key when prompted
```

---

## 🎯 Step 4: Trigger Deployment

After setting environment variables, trigger a new deployment:

```bash
vercel --prod
# OR via dashboard:
# Click "Redeploy" button
```

---

## ✨ Step 5: Verify Deployment

```bash
# Check deployment status
vercel projects

# Your app should be live at:
# https://ai-auto-selfie.vercel.app
# OR your custom domain if configured
```

### **Test Your App:**

1. Open your deployed URL in browser
2. Test core flow:
   - [ ] Page loads (no 404)
   - [ ] Camera works
   - [ ] Can capture photo
   - [ ] Can enhance image
   - [ ] Can export
   - [ ] Gallery works
   - [ ] Undo/redo works
   - [ ] Theme switcher works
   - [ ] Dark/light modes work

---

## 🔍 Troubleshooting Deployments

### **Build Fails**

```bash
# Check build logs
vercel logs -f

# Common issues:
# 1. TypeScript errors
npm run type-check

# 2. Missing dependencies
npm install

# 3. Environment variables
# Make sure VITE_GEMINI_API_KEY is set in Vercel dashboard
```

### **App Loads But Features Don't Work**

1. **Check browser console for errors**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

2. **API Key Issues**
   ```bash
   # Verify API key is set in Vercel
   vercel env ls

   # Verify API key is valid
   # Go to Google Cloud Console → APIs & Services → Credentials
   ```

3. **CORS Issues**
   - Gemini API should work from browser
   - Check Google Cloud project allows the domain

### **Analytics Not Showing**

```bash
# Analytics are stored in localStorage
# Open DevTools → Application → Local Storage
# Should see analytics data there
```

---

## 📊 Monitor Your Deployment

### **Vercel Dashboard**

Go to [vercel.com/dashboard](https://vercel.com/dashboard) to:
- View deployment history
- Check build logs
- Monitor function performance
- View analytics

### **Performance Monitoring**

```bash
# Check Lighthouse score
# In browser DevTools:
# Tools → Lighthouse → Generate report
# Target: Score > 90

# Check Core Web Vitals
# Vercel dashboard → Project → Analytics
```

### **Error Monitoring**

```bash
# Check for errors
# Vercel dashboard → Project → Logs
# Look for errors in the past hour
```

---

## 🔄 Updating Your App

Every push to `main` branch triggers automatic deployment:

```bash
# Make changes
nano src/App.tsx

# Commit and push
git add .
git commit -m "Fix something"
git push origin main

# Vercel automatically:
# 1. Detects the push
# 2. Runs build
# 3. Runs tests
# 4. Deploys to preview
# 5. Creates deployment comment on PR
# 6. Deploys to production (if on main)
```

---

## 🎁 Custom Domain (Optional)

To use your own domain:

1. Go to Vercel Dashboard → Project → Settings
2. Go to **Domains**
3. Add your domain
4. Follow DNS instructions for your registrar
5. Verify domain

Example:
```
ai-selfie.example.com → Your Vercel deployment
```

---

## 🔒 Security Best Practices

1. **Never commit .env.local**
   ```bash
   # Should be in .gitignore
   cat .gitignore | grep env
   ```

2. **API Key Security**
   - Use Vercel environment variables (not in code)
   - Restrict API key to specific domains
   - Rotate API keys periodically

3. **CSP Headers**
   - Already configured in vercel.json
   - Prevents XSS attacks
   - Restricts resource loading

4. **HTTPS**
   - Automatic with Vercel
   - All traffic encrypted

---

## 📈 Performance Tips

### **Optimize Images**

```bash
# Images are optimized during build
# Vercel automatically serves WebP when supported
```

### **Enable Caching**

Already configured in vercel.json:
- Static assets cached for 1 year
- HTML cached for 60 seconds

### **Minimize Bundle**

```bash
# Check bundle size
npm run build
# Look at dist/ folder size
# Should be < 500KB (gzipped < 200KB)
```

---

## 🎯 Success Criteria

Your deployment is successful when:

✅ App loads instantly (< 3s)
✅ No console errors
✅ All features work
✅ Mobile responsive
✅ Keyboard shortcuts work
✅ Theme switcher works
✅ Analytics tracking
✅ Lighthouse score > 90

---

## 📚 Next Steps

After deployment:

1. **Share with team**
   ```bash
   # Your app is live at:
   https://your-project.vercel.app
   ```

2. **Monitor performance**
   - Check Vercel dashboard daily first week
   - Monitor error logs
   - Check analytics

3. **Gather feedback**
   - Share with users
   - Collect feedback
   - Iterate based on data

4. **Plan improvements**
   - Review analytics
   - Identify popular features
   - Plan next iteration

---

## 🆘 Need Help?

### **Resources:**
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Google Gemini API Docs](https://ai.google.dev/docs)

### **Common Commands:**

```bash
# View deployment logs
vercel logs -f

# Rollback to previous deployment
vercel rollback

# List all deployments
vercel list

# Set production domain
vercel domains add example.com
```

---

## 🎉 You're Live!

Congratulations! Your app is now deployed and accessible worldwide.

**Next:** Monitor performance and gather user feedback for improvements.

---

**Deployment Status:** ✅ Ready to Ship
**Time to Deploy:** ~10 minutes
**Maintenance:** Automatic with every git push

Happy shipping! 🚀
