-- ============================================================
-- AI AUTO SELFIE - USER & DEALERSHIP SEED
-- ============================================================
-- This SQL creates the dealership and sets up user profiles
--
-- IMPORTANT: Auth users (in auth.users table) must be created
-- through Supabase Auth, not direct SQL.
--
-- Steps:
-- 1. Create auth users in Supabase Dashboard (see instructions below)
-- 2. Run this SQL file in Supabase SQL Editor
-- 3. Update the UUIDs in this file with your actual user IDs
-- ============================================================

-- ============================================================
-- STEP 1: CREATE THE GOLDEN CAR CO. DEALERSHIP
-- ============================================================

INSERT INTO dealerships (name, address, phone, email, settings, created_at, updated_at)
VALUES (
  'Golden Car Co.',
  '123 Premium Auto Drive, Luxury City, CA 90210',
  '(800) 555-CARS',
  'contact@goldencars.com',
  jsonb_build_object(
    'created_by', 'system_admin',
    'created_at', NOW(),
    'description', 'Premier automotive dealership featuring luxury and premium vehicles'
  ),
  NOW(),
  NOW()
)
ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
RETURNING id as dealership_id;

-- Save the dealership_id from the result above - you'll need it for the next step!

-- ============================================================
-- STEP 2: CREATE AUTH USERS IN SUPABASE DASHBOARD
-- ============================================================
--
-- Before running the SQL below, you MUST create auth users first:
--
-- 1. Go to: https://supabase.com → Your Project → Authentication → Users
-- 2. Click "Invite" button
-- 3. Create ADMIN USER:
--    Email: admin@goldencar.com
--    Uncheck "Auto confirm user"
-- 4. Create DEFAULT USER:
--    Email: user@goldencar.com
--    Uncheck "Auto confirm user"
-- 5. Copy the User IDs (UUIDs) from the Users list
-- 6. Replace the placeholder UUIDs below with the actual ones
--
-- ============================================================

-- ============================================================
-- STEP 3: LINK USERS TO DEALERSHIP & ASSIGN ROLES
-- ============================================================
--
-- REPLACE THESE WITH YOUR ACTUAL USER IDs FROM SUPABASE AUTH:

-- Admin User Profile
-- Change 'ADMIN_USER_ID_HERE' to the actual UUID from your auth.users
INSERT INTO user_profiles (id, dealership_id, role, full_name, phone, created_at, updated_at)
VALUES (
  'ADMIN_USER_ID_HERE',  -- ← REPLACE with actual admin user UUID
  (SELECT id FROM dealerships WHERE name = 'Golden Car Co.' LIMIT 1),
  'admin',
  'Admin User',
  '(800) 555-ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET role = 'admin', dealership_id = (SELECT id FROM dealerships WHERE name = 'Golden Car Co.' LIMIT 1);

-- Default User Profile
-- Change 'DEFAULT_USER_ID_HERE' to the actual UUID from your auth.users
INSERT INTO user_profiles (id, dealership_id, role, full_name, phone, created_at, updated_at)
VALUES (
  'DEFAULT_USER_ID_HERE',  -- ← REPLACE with actual default user UUID
  (SELECT id FROM dealerships WHERE name = 'Golden Car Co.' LIMIT 1),
  'salesperson',
  'Default User',
  '(800) 555-USER',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET role = 'salesperson', dealership_id = (SELECT id FROM dealerships WHERE name = 'Golden Car Co.' LIMIT 1);

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- Run these after the setup to verify everything worked:

-- Check dealership was created:
SELECT id, name, email, phone FROM dealerships WHERE name = 'Golden Car Co.';

-- Check user profiles were linked:
SELECT up.id, up.full_name, up.role, d.name as dealership
FROM user_profiles up
LEFT JOIN dealerships d ON up.dealership_id = d.id
WHERE d.name = 'Golden Car Co.';
