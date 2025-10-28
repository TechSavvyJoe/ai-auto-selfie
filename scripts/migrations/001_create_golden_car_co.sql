-- Migration: Create Golden Car Co. Dealership
-- Date: 2025-10-28
-- Description: Creates the default "Golden Car Co." dealership and sets up initial data

-- Note: This migration creates the dealership record.
-- Admin and user accounts must be created separately using the setupInitialData.ts script
-- because they require authentication via Supabase Auth (not direct SQL).

-- Create the Golden Car Co. dealership
INSERT INTO dealerships (name, address, phone, email, settings, created_at, updated_at)
VALUES (
  'Golden Car Co.',
  NULL,
  NULL,
  NULL,
  jsonb_build_object(
    'created_by', 'system_migration',
    'created_at', NOW(),
    'description', 'Default dealership for the application'
  ),
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING
RETURNING id, name;

-- Note: To create admin and users, run:
-- npx ts-node scripts/setupInitialData.ts
--
-- This will:
-- 1. Create admin user account via Supabase Auth
-- 2. Create default user account via Supabase Auth
-- 3. Link both users to this dealership
-- 4. Assign appropriate roles (admin, salesperson)
