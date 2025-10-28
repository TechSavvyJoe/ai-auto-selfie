# SUPABASE SETUP GUIDE

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Free Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" (100% FREE - no credit card required)
3. Sign up with GitHub or email

### Step 2: Create New Project

1. Click "New Project"
2. Choose your organization
3. Fill in:
   - **Name**: ai-auto-selfie
   - **Database Password**: (create a strong password - save it!)
   - **Region**: Choose closest to you
4. Click "Create new project" (takes ~2 minutes)

### Step 3: Get Your API Keys

1. Once project is ready, go to **Settings** (gear icon in sidebar)
2. Click **API** in the settings menu
3. Copy these two values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 4: Add Keys to Your Project

Create a file called `.env` in the root folder (`/Users/missionford/Downloads/ai-auto-selfie/.env`):

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GEMINI_API_KEY=your-existing-gemini-key
```

### Step 5: Create Database Tables

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New query**
3. Copy and paste this SQL:

```sql
-- Create photos table
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  edited_url TEXT,
  caption TEXT,
  filters JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create presets table
CREATE TABLE presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark',
  auto_enhance BOOLEAN DEFAULT false,
  default_filters JSONB DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX photos_user_id_idx ON photos(user_id);
CREATE INDEX photos_created_at_idx ON photos(created_at DESC);
CREATE INDEX presets_user_id_idx ON presets(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies so users can only access their own data
CREATE POLICY "Users can view their own photos" ON photos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own photos" ON photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos" ON photos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos" ON photos
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own presets" ON presets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own presets" ON presets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presets" ON presets
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);
```

4. Click **Run** (or press Cmd+Enter)

### Step 6: Create Storage Bucket

1. Click **Storage** in sidebar
2. Click **New bucket**
3. Name: `photos`
4. Set to **Public** (so you can display images)
5. Click **Create bucket**

6. Click on the `photos` bucket
7. Click **Policies** tab
8. Create these policies:

**For SELECT (viewing images):**
```sql
bucket_id = 'photos'
```

**For INSERT (uploading images):**
```sql
bucket_id = 'photos' AND auth.role() = 'authenticated'
```

**For DELETE (removing images):**
```sql
bucket_id = 'photos' AND auth.role() = 'authenticated'
```

### Step 7: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## 🎉 You're Done!

Now your app will:
- ✅ Save all photos to cloud storage
- ✅ Sync edits across devices
- ✅ Persist presets and settings
- ✅ Support user accounts (sign up/login)
- ✅ Work offline and sync when back online

## 📊 What You Get FREE with Supabase:

- **500 MB database** storage
- **1 GB file storage** (for photos)
- **50,000 monthly active users**
- **2 GB bandwidth** per month
- **Unlimited API requests**

Perfect for a dealership app! This can handle thousands of customer photos.

## 🔒 Security Features:

- Row Level Security (RLS) - users only see their own data
- Automatic authentication
- Encrypted connections
- Secure API keys

## 📱 Future Features You Can Add:

With Supabase set up, you can easily add:
- Team/multi-user access for dealership staff
- Photo sharing with customers
- Analytics and reporting
- Automated backups
- Social media integration
- Customer photo galleries per car

## 🆘 Need Help?

If you get stuck:
1. Check the Supabase docs: https://supabase.com/docs
2. The error messages are usually helpful
3. Make sure your `.env` file has the correct keys
4. Restart the dev server after adding `.env`
