-- RLS draft for `photos` table
-- IMPORTANT: Review these policies in a staging environment before applying to production.
-- These are recommendations and use `auth.uid()` (Supabase JWT) to associate rows to users.

-- 0) Enable Row Level Security
ALTER TABLE IF EXISTS photos ENABLE ROW LEVEL SECURITY;

-- 1) Allow authenticated users to INSERT photos where they set themselves as owner
--    This protects against a user inserting a row on behalf of another user.
CREATE POLICY IF NOT EXISTS "users_can_insert_their_photos"
  ON photos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = new.user_id);

-- 2) Allow authenticated users to SELECT photos they own
CREATE POLICY IF NOT EXISTS "users_can_select_their_photos"
  ON photos
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 3) Optionally allow public photos to be read by anyone (uncomment if needed)
-- CREATE POLICY IF NOT EXISTS "public_photos_are_readable"
--   ON photos
--   FOR SELECT
--   USING (is_public = true);

-- 4) Allow owners to UPDATE and DELETE their own photos
CREATE POLICY IF NOT EXISTS "users_can_modify_their_photos"
  ON photos
  FOR UPDATE, DELETE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 5) Notes about server-side/service role
-- The Supabase `service_role` key bypasses RLS. Keep its value only in server/CI envs.
-- Use server-side endpoints (like api/saveForLater) that use the service role to perform
-- privileged actions such as writing files to storage and inserting rows that require
-- fields users should not set directly (for example `status` or `server_id`).

-- 6) Example additional policy: allow backend service-account role to set `status`
-- (This is a placeholder pattern; actual implementation typically relies on service_role bypassing RLS.)

-- 7) Rollback guidance (manual):
--   To disable RLS temporarily while debugging run:
--     ALTER TABLE photos DISABLE ROW LEVEL SECURITY;

-- Apply carefully and test with an authenticated user and with the server endpoint to ensure
-- both client and server flows continue to work as expected.
