# Supabase Login & Dealership Troubleshooting

If you're having issues with login or dealership info, follow this guide.

## Quick Diagnostic

### Step 1: Run the Diagnostic SQL

1. **Go to**: https://qliquwdljbneaxxfvaqm.supabase.co
2. **Click "SQL Editor"** → **"New query"**
3. **Copy ALL SQL** from: `scripts/diagnostic-supabase.sql`
4. **Paste and click "Run"**

This will show you exactly what's wrong.

---

## Common Issues & Fixes

### Issue 1: "Error relating user_profiles and dealerships"

**Symptom**: Error like "Could not find a relationship..."

**Cause**: Database tables haven't been created yet

**Fix**: Run the full SQL schema from SUPABASE_SETUP.md
1. Go to SQL Editor → New Query
2. Copy the complete schema SQL (all tables, indexes, policies)
3. Run it completely
4. Refresh browser

---

### Issue 2: Can't Log In

**Symptom**: Login modal keeps appearing, can't log in

**Possible Causes**:
- Email doesn't exist in auth.users
- Password not set
- User profile not created
- Supabase credentials wrong in .env

**Fixes**:

**A) Check Auth Users Exist**
```sql
SELECT id, email, confirmed_at FROM auth.users;
```
Should show: admin@goldencar.com and user@goldencar.com

If missing → Go to Authentication → Users → Invite them

**B) Check Passwords Are Set**
- Go to Supabase Auth → Users
- Click each user
- If "Password" shows blank → Click "Reset password"
- They need to set a password via email link

**C) Check User Profiles Exist**
```sql
SELECT id, full_name, role FROM user_profiles;
```
Should show 2 users with admin and salesperson roles

If missing → Run the seed-users-and-dealership.sql file

**D) Check .env Is Correct**
```bash
cat .env
```
Should show:
- VITE_SUPABASE_URL=https://qliquwdljbneaxxfvaqm.supabase.co
- VITE_SUPABASE_ANON_KEY=eyJ... (long string)

If wrong → Edit .env and restart dev server (`npm run dev`)

---

### Issue 3: Logged In But Can't See Dealership

**Symptom**: Login works but no "Golden Car Co." showing

**Cause**: Dealership not created or user not linked

**Fix**:

**A) Check Dealership Exists**
```sql
SELECT id, name FROM dealerships;
```
If empty → Run this:
```sql
INSERT INTO dealerships (name, address, phone, email)
VALUES ('Golden Car Co.', '', '', '');
```

**B) Check User Linked to Dealership**
```sql
SELECT up.id, up.full_name, up.role, d.name as dealership
FROM user_profiles up
LEFT JOIN dealerships d ON up.dealership_id = d.id;
```
Should show each user with dealership_id and dealership name

If dealership_id is NULL → Run this (replace IDs):
```sql
UPDATE user_profiles
SET dealership_id = (SELECT id FROM dealerships WHERE name = 'Golden Car Co.')
WHERE full_name = 'Admin User';
```

---

### Issue 4: Admin Dashboard Not Showing

**Symptom**: Can log in but no "Admin Dashboard" button

**Cause**: User doesn't have admin role

**Fix**:

**A) Check User Role**
```sql
SELECT id, full_name, role FROM user_profiles;
```

**B) Make User Admin**
```sql
UPDATE user_profiles
SET role = 'admin'
WHERE full_name = 'Admin User';
```

**C) Refresh App**
- Log out
- Log back in
- Admin Dashboard should appear

---

### Issue 5: Photos Not Saving

**Symptom**: Can add photos but they don't save or appear in gallery

**Cause**: RLS policies not set up correctly or photos table missing

**Fix**:

**A) Check Photos Table Exists**
```sql
SELECT * FROM photos LIMIT 1;
```

**B) Check RLS Is Enabled**
```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'photos';
```
Should show several policy rows

**C) Re-run RLS Policies**
See step 6 in SUPABASE_SETUP.md → Copy RLS policy SQL for photos and run it

---

### Issue 6: Getting "Permission Denied" Errors

**Symptom**: Error like "new row violates row level security policy"

**Cause**: RLS policies not set up or user not properly authenticated

**Fix**:

**A) Verify RLS Policies Exist**
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```
Should show policies for: dealerships, user_profiles, photos, presets, user_settings

**B) Check User Has Dealership**
```sql
SELECT id, dealership_id FROM user_profiles WHERE id = 'USER_ID_HERE';
```
dealership_id should NOT be NULL

**C) Re-enable RLS If Needed**
```sql
ALTER TABLE dealerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
```

---

### Issue 7: Database Is Corrupted

**Symptom**: Multiple errors, nothing working

**Fix** (Nuclear Option - Delete All and Restart):

⚠️ **WARNING: This deletes everything. Only do if absolutely necessary.**

```sql
-- Drop trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop tables (RLS will be disabled automatically)
DROP TABLE IF EXISTS user_settings;
DROP TABLE IF EXISTS presets;
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS dealerships;
```

Then:
1. Run the complete schema from SUPABASE_SETUP.md
2. Run the seed file: scripts/seed-users-and-dealership.sql
3. Verify with diagnostic script

---

## Verification Checklist

Run these queries to verify everything is perfect:

### ✅ All Tables Exist
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('dealerships', 'user_profiles', 'photos', 'presets', 'user_settings');
```
**Expected**: 5 rows

### ✅ Dealership Created
```sql
SELECT COUNT(*) FROM dealerships WHERE name = 'Golden Car Co.';
```
**Expected**: 1

### ✅ Auth Users Exist
```sql
SELECT COUNT(*) FROM auth.users
WHERE email IN ('admin@goldencar.com', 'user@goldencar.com');
```
**Expected**: 2

### ✅ User Profiles Created
```sql
SELECT COUNT(*) FROM user_profiles;
```
**Expected**: 2+

### ✅ Users Linked to Dealership
```sql
SELECT COUNT(*) FROM user_profiles WHERE dealership_id IS NOT NULL;
```
**Expected**: Same as user count

### ✅ RLS Policies Exist
```sql
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
```
**Expected**: 15+

### ✅ Trigger Exists
```sql
SELECT COUNT(*) FROM information_schema.triggers
WHERE trigger_schema = 'public';
```
**Expected**: 1+

---

## Debug Mode

### Enable PostgreSQL Logging
1. Go to Supabase dashboard
2. Click "Database" → "Logs"
3. Filter by error
4. Look for error messages when you try to login/save photos

### Check Auth Session
Open browser DevTools (F12) → Console → Run:
```javascript
const { data } = await supabase.auth.getSession();
console.log(data);
```

If `data.session` is null, user isn't logged in
If it exists, check the JWT token claims

### Check RLS Policy Hits
In Supabase dashboard → Database → Logs
Look for messages about policy violations

---

## Still Stuck?

Provide me with:
1. **Exact error message** (copy & paste)
2. **When it happens** (login? taking photo? saving? admin dashboard?)
3. **Output from diagnostic script** (run diagnostic-supabase.sql and share results)

Then I can pinpoint the exact issue.

---

## Quick Health Check

```bash
# Run this to check everything at once
npm run dev
# Refresh http://localhost:3001
# Try to login
# If it works, try to:
#   1. Take a photo
#   2. Add text overlay
#   3. Save to gallery
#   4. View Admin Dashboard
# If all work → You're good! ✅
```

---

## Emergency Reset

If everything is broken and you want to start fresh:

1. **Delete database** (⚠️ careful!)
   - Supabase Dashboard → Database → Tables
   - Delete all tables

2. **Re-create from scratch**
   - Run SUPABASE_SETUP.md schema SQL
   - Run seed-users-and-dealership.sql
   - Run diagnostic to verify

3. **Restart app**
   - `npm run dev`
   - Test login

---

Need help? Share the error message and I'll fix it! 🚀
