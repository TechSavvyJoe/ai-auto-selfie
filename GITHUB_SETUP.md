# GitHub Setup Guide

> Get your code on GitHub in 5 minutes

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Fill in:
   - **Repository name:** `ai-auto-selfie`
   - **Description:** "Professional image editor for dealership salespeople"
   - **Visibility:** Public (recommended for portfolio) or Private
   - **Skip** "Initialize with README" (we already have one)
3. Click **Create repository**
4. You'll see the quick setup page with commands

---

## Step 2: Push Your Code

You now have a local git repo ready. Add GitHub as the remote and push:

```bash
# Add GitHub remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/ai-auto-selfie.git

# Rename branch to 'main' (GitHub uses 'main' by default)
git branch -M main

# Push your code
git push -u origin main
```

**⚠️ Replace `USERNAME` with your actual GitHub username**

---

## What Happens Next

After pushing:
- ✅ All your code appears on GitHub
- ✅ Ready for Vercel to deploy
- ✅ Can share link with others: `https://github.com/USERNAME/ai-auto-selfie`

---

## Troubleshooting

### Authentication Error
If you get an authentication error:

```bash
# Use GitHub CLI (recommended)
gh auth login
# Then try push again

# OR use Personal Access Token
# 1. Go to https://github.com/settings/tokens/new
# 2. Create token with 'repo' scope
# 3. Use token as password when pushing
```

### Branch Already Exists
```bash
git branch -D main  # Delete local main
git branch -M main  # Rename master to main
git push -u origin main
```

### Push Fails
```bash
# Check remote is set correctly
git remote -v

# Reset if needed
git remote remove origin
git remote add origin https://github.com/USERNAME/ai-auto-selfie.git
git push -u origin main
```

---

## Next Step

Once code is on GitHub, move to **VERCEL_SETUP.md** to deploy 🚀

---

## Git Commands Reference

```bash
# Check status
git status

# View commits
git log --oneline

# Check remotes
git remote -v

# Add changes (if you made edits)
git add .
git commit -m "Your message"
git push

# Create a new branch for features
git checkout -b feature/feature-name
git push -u origin feature/feature-name
```

---

**GitHub username:** [Find it here](https://github.com/settings/profile)

**Need help?** See [DEPLOY_TO_VERCEL.md](./DEPLOY_TO_VERCEL.md) for next steps
