-- ============================================================
-- SUPABASE DIAGNOSTIC SCRIPT
-- ============================================================
-- Run this to diagnose any login or dealership issues
-- Copy and paste all of this into Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. CHECK IF TABLES EXIST
-- ============================================================
SELECT
  table_name,
  'TABLE EXISTS' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('dealerships', 'user_profiles', 'photos', 'presets', 'user_settings')
ORDER BY table_name;

-- Expected result: 5 rows (dealerships, photos, presets, user_profiles, user_settings)

-- ============================================================
-- 2. CHECK DEALERSHIP DATA
-- ============================================================
SELECT
  id,
  name,
  email,
  phone,
  created_at,
  updated_at
FROM dealerships
ORDER BY created_at DESC;

-- Expected result: At least 1 row for "Golden Car Co."

-- ============================================================
-- 3. CHECK AUTH USERS
-- ============================================================
SELECT
  id,
  email,
  created_at,
  last_sign_in_at,
  confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- Expected result: admin@goldencar.com and user@goldencar.com

-- ============================================================
-- 4. CHECK USER PROFILES
-- ============================================================
SELECT
  up.id,
  up.full_name,
  up.role,
  d.name as dealership_name,
  up.phone,
  up.created_at
FROM user_profiles up
LEFT JOIN dealerships d ON up.dealership_id = d.id
ORDER BY up.created_at DESC;

-- Expected result: 2 users linked to Golden Car Co.

-- ============================================================
-- 5. DETAILED USER PROFILE RELATIONSHIP CHECK
-- ============================================================
SELECT
  up.id,
  up.full_name,
  up.role,
  up.dealership_id,
  d.id as dealership_exists,
  d.name
FROM user_profiles up
LEFT JOIN dealerships d ON up.dealership_id = d.id
WHERE up.id IN (SELECT id FROM auth.users);

-- Expected result: dealership_id and dealership_exists should NOT be NULL

-- ============================================================
-- 6. CHECK ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual as policy_condition
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected result: Policies for dealerships, user_profiles, photos, presets, user_settings

-- ============================================================
-- 7. CHECK FUNCTION FOR AUTO-PROFILE CREATION
-- ============================================================
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'handle_new_user';

-- Expected result: 1 row for handle_new_user function

-- ============================================================
-- 8. CHECK TRIGGER FOR AUTO-PROFILE
-- ============================================================
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'users';

-- Expected result: 1 row for on_auth_user_created trigger

-- ============================================================
-- 9. COUNT RECORDS
-- ============================================================
SELECT
  'dealerships' as table_name,
  COUNT(*) as count
FROM dealerships
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles
UNION ALL
SELECT 'auth.users', COUNT(*) FROM auth.users
UNION ALL
SELECT 'photos', COUNT(*) FROM photos
UNION ALL
SELECT 'presets', COUNT(*) FROM presets;

-- Expected result: dealerships=1+, user_profiles=2+, auth.users=2+

-- ============================================================
-- 10. CHECK FOR DATA MISMATCHES
-- ============================================================
-- Users in auth but NOT in user_profiles
SELECT
  u.id,
  u.email,
  'MISSING FROM user_profiles' as issue
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE up.id IS NULL;

-- User profiles pointing to non-existent dealership
SELECT
  up.id,
  up.full_name,
  up.dealership_id,
  'DEALERSHIP NOT FOUND' as issue
FROM user_profiles up
LEFT JOIN dealerships d ON up.dealership_id = d.id
WHERE d.id IS NULL AND up.dealership_id IS NOT NULL;

-- ============================================================
-- 11. CHECK COLUMN TYPES AND CONSTRAINTS
-- ============================================================
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Expected result: Correct column types and NOT NULL constraints

-- ============================================================
-- 12. CHECK DEALERSHIP DETAILS
-- ============================================================
SELECT
  id,
  name,
  address,
  phone,
  email,
  settings,
  created_at
FROM dealerships
WHERE name = 'Golden Car Co.';

-- Expected result: 1 row with complete dealership info

-- ============================================================
-- 13. COMPLETE USER PROFILE CHECK
-- ============================================================
SELECT
  u.id as user_id,
  u.email,
  u.created_at as auth_created,
  u.confirmed_at,
  u.last_sign_in_at,
  up.full_name,
  up.role,
  up.phone,
  d.name as dealership,
  d.id as dealership_id
FROM auth.users u
FULL OUTER JOIN user_profiles up ON u.id = up.id
FULL OUTER JOIN dealerships d ON up.dealership_id = d.id
ORDER BY u.created_at DESC;

-- Expected result: Matching rows with all info linked properly

-- ============================================================
-- 14. TEST RLS - Check if admin user can see their data
-- ============================================================
-- Run this AS the admin user (you'll need to be logged in as them)
-- This checks what the logged-in user can see
SELECT
  id,
  name,
  email
FROM dealerships;

-- Expected result (as admin): Should see all dealerships
-- Expected result (as salesperson): Should see only their dealership

-- ============================================================
-- TROUBLESHOOTING GUIDE
-- ============================================================

-- IF NO DEALERSHIPS:
-- Run: INSERT INTO dealerships (name, address, phone, email)
--      VALUES ('Golden Car Co.', 'Address', 'Phone', 'Email');

-- IF NO USER PROFILES:
-- Make sure auth users exist first, then:
-- INSERT INTO user_profiles (id, full_name, role, dealership_id)
-- VALUES ('USER_ID_HERE', 'Name', 'admin', 'DEALERSHIP_ID_HERE');

-- IF RLS POLICIES MISSING:
-- Check SUPABASE_SETUP.md and run the complete RLS policy SQL

-- IF TRIGGER MISSING:
-- Check SUPABASE_SETUP.md and run the trigger creation SQL

-- ============================================================
-- END OF DIAGNOSTIC SCRIPT
-- ============================================================
