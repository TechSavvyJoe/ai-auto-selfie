# 🧪 Supabase Full Workflow Testing Guide

## Prerequisites

Before testing, ensure you have:
- ✅ Supabase account (free tier is fine)
- ✅ Project created on supabase.com
- ✅ SQL schema executed (from SUPABASE_SETUP.md)
- ✅ Environment variables set in `.env`

---

## Step 1: Create Supabase Project

### 1.1 Sign Up / Log In
1. Go to https://supabase.com
2. Sign in with GitHub or create account
3. Click "New Project"

### 1.2 Project Configuration
```
Organization: Choose or create
Project Name: ai-auto-selfie
Database Password: [Generate strong password - SAVE THIS!]
Region: Choose closest to you
Pricing Plan: Free (500MB DB, 1GB files, 50K users)
```

### 1.3 Wait for Initialization
- Takes ~2 minutes
- Coffee break time ☕

---

## Step 2: Execute SQL Schema

### 2.1 Open SQL Editor
1. In Supabase dashboard, click "SQL Editor" (left sidebar)
2. Click "New Query"

### 2.2 Copy Schema from SUPABASE_SETUP.md

Open `SUPABASE_SETUP.md` and copy **Steps 5, 6, and 7**:

**Step 5: Create Tables**
```sql
-- Copy the entire CREATE TABLE section for:
-- - dealerships
-- - user_profiles  
-- - photos (with updates)
-- - presets (with updates)
```

**Step 6: Enable RLS and Policies**
```sql
-- Copy all ALTER TABLE and CREATE POLICY statements
-- This ensures data security!
```

**Step 7: Auto-Create User Profiles**
```sql
-- Copy the trigger function and trigger
-- This automatically creates profiles on signup
```

### 2.3 Execute SQL
1. Paste all SQL into the editor
2. Click "Run" (or Cmd+Enter)
3. Wait for "Success" message
4. Verify tables created: Check "Table Editor" in sidebar

---

## Step 3: Get API Credentials

### 3.1 Project Settings
1. Click "Project Settings" (gear icon, bottom left)
2. Click "API" in left menu

### 3.2 Copy Credentials
You'll need two values:

**Project URL**:
```
Example: https://abcdefghijklmnop.supabase.co
```

**anon public Key** (long string):
```
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMzEyMzQ1NiwiZXhwIjoxOTM4Njk5NDU2fQ.abcdefghijklmnopqrstuvwxyz123456789
```

---

## Step 4: Configure Environment Variables

### 4.1 Create `.env` File
In project root (`/Users/missionford/Downloads/ai-auto-selfie`):

```bash
# Create .env file
touch .env
```

### 4.2 Add Credentials
Open `.env` and paste:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Gemini AI (if you have it)
VITE_GEMINI_API_KEY=your-gemini-key-here
```

**Replace** with your actual values from Step 3.2!

### 4.3 Verify `.gitignore`
Ensure `.env` is in `.gitignore` (it should be already):

```bash
cat .gitignore | grep .env
```

Should see: `.env`

---

## Step 5: Restart Dev Server

### 5.1 Stop Current Server
If dev server is running:
```bash
# Press Ctrl+C in terminal
# Or run:
pkill -f vite
```

### 5.2 Start Fresh
```bash
npm run dev
```

### 5.3 Verify Configuration
Open browser console (F12), you should see:
```
Supabase configured: true
```

---

## Step 6: Test User Registration

### 6.1 First User Signup
1. App should show login modal automatically
2. Click "Sign Up" tab
3. Enter:
   - Email: `admin@test.com`
   - Password: `TestPass123!` (min 6 chars)
4. Click "Sign Up"

### 6.2 Verify in Supabase
1. Go to Supabase Dashboard
2. Click "Authentication" → "Users"
3. Should see your new user!
4. Click "Table Editor" → "user_profiles"
5. Should see auto-created profile (trigger worked!)

### 6.3 Check Browser
- Login modal should close
- User icon should appear in header
- Click user icon → See your email

---

## Step 7: Create First Dealership (Admin)

### 7.1 Open Admin Dashboard
1. Click user icon in header
2. Click "Admin Dashboard"

### 7.2 Create Dealership
**Dealerships Tab**:
1. Click "Create Dealership"
2. Fill form:
   ```
   Name: Premier Auto Group
   Address: 123 Main St, City, ST 12345
   Phone: (555) 123-4567
   Email: contact@premierauto.com
   ```
3. Click "Create"
4. Should see new dealership card!

### 7.3 Verify in Database
Supabase → Table Editor → `dealerships` → See your dealership

---

## Step 8: Assign User to Dealership

### 8.1 Update Your Profile
Still in Admin Dashboard:
1. Go to "Users" tab
2. Find your user (admin@test.com)
3. Click "Edit"
4. Update:
   ```
   Full Name: Joe Admin
   Phone: (555) 999-9999
   Role: admin
   Dealership: Premier Auto Group
   ```
5. Click "Update"

### 8.2 Verify
1. Close modal
2. Click user icon in header
3. Should now show:
   - Name: Joe Admin
   - Dealership: Premier Auto Group
   - Role badge: admin (purple)

---

## Step 9: Create Additional Users

### 9.1 Create Manager
Admin Dashboard → Users → Create User:
```
Email: manager@test.com
Password: ManagerPass123!
Full Name: Sarah Manager
Phone: (555) 888-8888
Role: manager
Dealership: Premier Auto Group
```

### 9.2 Create Salesperson
```
Email: sales@test.com
Password: SalesPass123!
Full Name: Mike Sales
Phone: (555) 777-7777
Role: salesperson
Dealership: Premier Auto Group
```

### 9.3 Verify Users Created
Authentication → Users → Should see 3 users

---

## Step 10: Test Multi-User Access

### 10.1 Sign Out
1. Click user icon
2. Click "Sign Out"
3. Login modal appears

### 10.2 Log In as Manager
1. Email: `manager@test.com`
2. Password: `ManagerPass123!`
3. Sign In

### 10.3 Verify Manager Permissions
- User menu shows: Sarah Manager, manager role (blue badge)
- No "Admin Dashboard" button (correct!)
- Can access camera, gallery, settings

### 10.4 Log In as Salesperson
1. Sign out
2. Log in as `sales@test.com`
3. Verify: Mike Sales, salesperson role (green badge)
4. No admin access

---

## Step 11: Test Photo Upload (TODO - Next Feature)

### 11.1 Take Photo
1. Log in as salesperson
2. Click "Take Photo"
3. Allow camera access
4. Capture photo

### 11.2 Enhance & Save
1. Click "Enhance with AI"
2. Apply filters
3. Click "Save to Gallery"

### 11.3 Verify in Database (Once implemented)
- Supabase → `photos` table
- Should see photo with:
  - `user_id` = Mike's ID
  - `dealership_id` = Premier Auto Group ID
  - Customer info (to be added)

---

## Step 12: Test RLS (Row Level Security)

### 12.1 Create Second Dealership
1. Log in as admin@test.com
2. Admin Dashboard → Dealerships
3. Create "Luxury Motors"

### 12.2 Create User for Second Dealership
```
Email: luxury@test.com
Password: LuxuryPass123!
Role: salesperson
Dealership: Luxury Motors
```

### 12.3 Verify Data Isolation (Once photos implemented)
1. Log in as sales@test.com (Premier Auto)
2. Take photo → Save
3. Log out
4. Log in as luxury@test.com (Luxury Motors)
5. Check gallery → Should NOT see Premier Auto's photos
6. This confirms RLS is working!

---

## Step 13: Test Admin Features

### 13.1 User Management
Admin Dashboard → Users:
- ✅ Create users
- ✅ Edit user profiles
- ✅ Change roles
- ✅ Reassign dealerships
- ✅ Delete users

### 13.2 Dealership Management
Admin Dashboard → Dealerships:
- ✅ Create dealerships
- ✅ Edit dealership info
- ✅ Delete dealerships (careful!)

### 13.3 Statistics
Admin Dashboard → Statistics:
- ✅ Total dealerships count
- ✅ Total users count
- ✅ Admin count
- ✅ Manager count
- ✅ Salesperson count

---

## Step 14: Mobile Testing

### 14.1 Test on Phone
1. Deploy to Vercel: `vercel --prod`
2. Copy production URL
3. Open on phone browser
4. Add to home screen (PWA)

### 14.2 Mobile Workflow
1. Log in as salesperson
2. Take customer photo
3. Enhance with AI
4. Save to gallery
5. Export/share

### 14.3 Offline Test
1. Enable airplane mode
2. Take photo → Should work (camera is local)
3. Enhance → Should work (AI is local)
4. Save → Works (localStorage fallback)
5. Go online → Sync to Supabase (future feature)

---

## Troubleshooting

### Issue: "Login modal not appearing"

**Check**:
```bash
# Verify .env file exists
cat .env

# Should see VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

**Fix**:
- Ensure `.env` has correct values
- Restart dev server: `pkill -f vite && npm run dev`
- Clear browser cache
- Check browser console for errors

---

### Issue: "Cannot create user profile"

**Check Supabase**:
1. SQL Editor → Run:
```sql
SELECT * FROM user_profiles;
```

**If empty**:
- Trigger might not be installed
- Re-run Step 7 SQL from SUPABASE_SETUP.md
- Check Supabase logs for errors

---

### Issue: "Access denied" when viewing data

**RLS Problem**:
1. Verify user has `dealership_id` set:
```sql
SELECT * FROM user_profiles WHERE id = 'your-user-id';
```

2. Check RLS policies are enabled:
```sql
SELECT tablename, policyname FROM pg_policies;
```

3. Re-run Step 6 SQL if policies missing

---

### Issue: "Photos not syncing to Supabase"

**Note**: Photo sync is **not yet implemented**!
- Photos currently save to localStorage only
- Next feature: Update services to use Supabase storage
- See AUTH_INTEGRATION.md → "Next Steps"

---

## Expected Test Results

### ✅ Working Features
- [x] User signup/login
- [x] Auto-profile creation
- [x] User menu with profile info
- [x] Admin dashboard access (admins only)
- [x] Dealership CRUD (create, read, update, delete)
- [x] User CRUD with role assignment
- [x] Multi-dealership support
- [x] Role-based UI (admin button visibility)
- [x] Session persistence (stay logged in)
- [x] Logout functionality

### 🔄 Partially Working
- [ ] Photo storage (localStorage only, not Supabase yet)
- [ ] Preset storage (localStorage only, not Supabase yet)

### ⏳ Not Yet Implemented
- [ ] Photo filtering by dealership
- [ ] Customer info capture
- [ ] Shared presets within dealership
- [ ] Photo sync to Supabase storage
- [ ] Manager-specific features
- [ ] Photo assignment to customers

---

## Next Development Steps

After successful testing, implement:

1. **Update Photo Service**
   - Save photos to Supabase storage
   - Add `dealership_id` automatically
   - Filter gallery by dealership
   - Add customer info fields

2. **Update Preset Service**
   - Save presets to Supabase
   - Support shared presets (`is_shared` flag)
   - Filter by dealership + shared

3. **Customer Management**
   - Add customer info form in camera view
   - Fields: name, email, car (make/model/year/vin)
   - Search/filter by customer

4. **Manager Features**
   - User management UI for managers
   - Limited to their dealership
   - Can't access admin functions

5. **Analytics**
   - Photos per dealership
   - Photos per user
   - Customer engagement stats

---

## Production Deployment

### Deploy to Vercel
```bash
# Add .env vars to Vercel
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# Deploy
vercel --prod
```

### Share with Team
1. Send production URL to sales team
2. Create accounts via Admin Dashboard
3. Send login credentials securely
4. Train on mobile usage
5. Start taking customer photos!

---

## Success Criteria

You'll know it's working when:

✅ Users can sign up/login  
✅ Profiles auto-created  
✅ Admin can create dealerships  
✅ Admin can create users  
✅ Users see their dealership info  
✅ No cross-dealership data leakage  
✅ Admins see admin dashboard  
✅ Non-admins don't see admin options  
✅ Sessions persist across refreshes  
✅ Mobile-friendly on all devices  

---

## Support

If you encounter issues:
1. Check browser console (F12)
2. Check Supabase logs (Dashboard → Logs)
3. Verify SQL schema is complete
4. Ensure RLS policies are enabled
5. Check user has dealership assigned

Happy testing! 🚀
