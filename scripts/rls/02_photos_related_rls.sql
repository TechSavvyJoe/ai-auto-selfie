-- RLS and security policy recommendations for photos, presets, user_profiles, and user_settings
-- Review and test these policies in staging before applying to production.
-- This file assumes the following columns exist (adjust names if your schema differs):
-- photos(user_id UUID, dealership_id UUID, original_url TEXT, status TEXT, server_id TEXT, created_at TIMESTAMP)
-- presets(user_id UUID, dealership_id UUID, data JSONB)
-- user_profiles(user_id UUID, dealership_id UUID, role TEXT)
-- user_settings(user_id UUID, settings JSONB)

-- 0) Safety: enable RLS where appropriate
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 1) Photos: Basic owner access
-- Owners can SELECT/INSERT/UPDATE/DELETE their own photos
CREATE POLICY "photos_owner_select" ON photos FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "photos_owner_insert" ON photos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = new.user_id);

CREATE POLICY "photos_owner_update" ON photos FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = new.user_id);

CREATE POLICY "photos_owner_delete" ON photos FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 2) Photos: Multi-tenant / dealership scoping
-- Allow users to view photos for their dealership (if they belong to the same dealership)
-- Assumes a view or join against user_profiles to map auth.uid() to dealership_id.
-- Example helper: allow users where their profile's dealership_id matches photos.dealership_id
-- Replace `user_profiles`/`role` checks with your actual user profile table if different.
CREATE POLICY "photos_dealership_select" ON photos FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up WHERE up.user_id = auth.uid() AND up.dealership_id = photos.dealership_id
    )
  );

-- 3) Photos: Manager/Admin roles
-- Allow users with role in ('admin','manager') for a dealership to manage (SELECT/INSERT/UPDATE/DELETE)
CREATE POLICY "photos_dealership_manage" ON photos FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up WHERE up.user_id = auth.uid() AND up.dealership_id = photos.dealership_id AND up.role IN ('admin','manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up WHERE up.user_id = auth.uid() AND up.dealership_id = new.dealership_id AND up.role IN ('admin','manager')
    )
  );

-- 4) Photos: Prevent clients from setting privileged fields
-- If fields like `status`, `server_id`, `original_url` should only be set by server-side processes, add a WITH CHECK clause
-- that prevents non-service writes. Since RLS cannot easily detect 'service_role' usage (service role bypasses RLS),
-- rely on server-side endpoints that use the service role to write privileged fields. Example below prevents clients
-- from setting `status` on INSERT/UPDATE (they must be NULL or a safe default):
CREATE POLICY "photos_restrict_status_client" ON photos FOR INSERT, UPDATE TO authenticated
  WITH CHECK (
    (new.status IS NULL) OR (new.status IN ('unprocessed','processed')) -- adjust allowed values if needed
  );

-- 5) Presets: owners + dealership-level sharing
CREATE POLICY "presets_owner_select" ON presets FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM user_profiles up WHERE up.user_id = auth.uid() AND up.dealership_id = presets.dealership_id));

CREATE POLICY "presets_owner_insert" ON presets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = new.user_id OR new.user_id IS NULL);

CREATE POLICY "presets_owner_update" ON presets FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = new.user_id);

-- 6) user_profiles: users can only read/write their own profile; managers/admins can read dealership profiles
CREATE POLICY "user_profiles_own" ON user_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_profiles_update_own" ON user_profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_profiles_dealership_manage" ON user_profiles FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles up2 WHERE up2.user_id = auth.uid() AND up2.dealership_id = user_profiles.dealership_id AND up2.role IN ('admin','manager')));

-- 7) user_settings: only owners may read/update their settings
CREATE POLICY "user_settings_owner" ON user_settings FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 8) Audit & monitoring guidance (not SQL)
-- - Keep an audit log table for privileged server-side changes (server_id, status changes, who/when).
-- - Ensure service-role operations only run from server endpoints and write to audit logs.
-- - Apply least privilege: use separate DB users for migrations and app-level writes if possible.

-- 9) Deployment tips
-- - Apply these policies to a staging DB first.
-- - Test: (a) normal user can insert photo with user_id = auth.uid(), (b) normal user cannot alter `status` to arbitrary values, (c) manager can view dealership photos.

-- 10) Rollback
-- To temporarily disable RLS while debugging:
--   ALTER TABLE photos DISABLE ROW LEVEL SECURITY;

-- End of RLS recommendations.
