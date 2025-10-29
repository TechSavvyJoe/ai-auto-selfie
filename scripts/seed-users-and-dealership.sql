

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


SELECT id, name, email, phone FROM dealerships WHERE name = 'Golden Car Co.';

SELECT up.id, up.full_name, up.role, d.name as dealership
FROM user_profiles up
LEFT JOIN dealerships d ON up.dealership_id = d.id
WHERE d.name = 'Golden Car Co.';
