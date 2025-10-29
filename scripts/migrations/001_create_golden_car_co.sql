-- Note: This migration creates the dealership record.
-- Admin and user accounts must be created separately using the setupInitialData.ts script
-- because they require authentication via Supabase Auth (not direct SQL).

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

 