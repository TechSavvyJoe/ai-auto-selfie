# Direct Setup: Users & Dealership in Supabase

Follow these steps to set up your admin user, dealership, and default user directly in Supabase.

## Your Supabase Project

```
URL: https://qliquwdljbneaxxfvaqm.supabase.co
Project: qliquwdljbneaxxfvaqm
```

## Step-by-Step Setup (5 minutes)

### Step 1: Create Auth Users in Supabase Dashboard

1. **Go to your Supabase project**: https://qliquwdljbneaxxfvaqm.supabase.co
2. **Click "Authentication"** in the left sidebar
3. **Click "Users"** tab
4. **Click "Invite"** button (top right)

#### Create Admin User

1. **Email**: `admin@goldencar.com`
2. **Leave password blank** (they'll set it on first login)
3. **Uncheck** "Auto confirm user" (you'll confirm them)
4. **Click "Send invite"** or **"Invite user"**
5. **Copy the User ID** (it's a UUID in the Users list) → **SAVE THIS**

Example: `123e4567-e89b-12d3-a456-426614174000`

#### Create Default User

1. **Click "Invite"** again
2. **Email**: `user@goldencar.com`
3. **Leave password blank**
4. **Uncheck** "Auto confirm user"
5. **Click "Send invite"**
6. **Copy the User ID** → **SAVE THIS**

Example: `223e4567-e89b-12d3-a456-426614174000`

### Step 2: Get Your User IDs

After creating both users, you should have:

```
Admin User ID:   (copy from Users list)
Default User ID: (copy from Users list)
```

**Go to Authentication → Users and you'll see:**
- Email column: admin@goldencar.com → Copy the UUID in the "ID" column
- Email column: user@goldencar.com → Copy the UUID in the "ID" column

### Step 3: Update the SQL File

Open the SQL seed file: `scripts/seed-users-and-dealership.sql`

**Find these lines and replace the placeholders:**

```sql
-- Line ~90: Replace 'ADMIN_USER_ID_HERE' with your admin user's UUID
INSERT INTO user_profiles (id, dealership_id, role, full_name, phone, created_at, updated_at)
VALUES (
  'YOUR_ADMIN_UUID_HERE',  -- ← Replace this entire line
  ...

-- Line ~107: Replace 'DEFAULT_USER_ID_HERE' with your default user's UUID
INSERT INTO user_profiles (id, dealership_id, role, full_name, phone, created_at, updated_at)
VALUES (
  'YOUR_DEFAULT_UUID_HERE',  -- ← Replace this entire line
  ...
```

**Example of what it should look like:**

```sql
INSERT INTO user_profiles (id, dealership_id, role, full_name, phone, created_at, updated_at)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',  -- Your actual admin UUID
  (SELECT id FROM dealerships WHERE name = 'Golden Car Co.' LIMIT 1),
  'admin',
  'Admin User',
  '(800) 555-ADMIN',
  NOW(),
  NOW()
);
```

### Step 4: Run SQL in Supabase

1. **Go to**: https://qliquwdljbneaxxfvaqm.supabase.co
2. **Click "SQL Editor"** in the left sidebar
3. **Click "New query"** button
4. **Copy ALL the SQL** from `scripts/seed-users-and-dealership.sql`
5. **Paste it** into the SQL editor
6. **Click "Run"** (or press Cmd+Enter)

### Step 5: Verify Setup

After running the SQL, you should see results like:

```
dealership_id: abc-def-ghi-jkl
name: Golden Car Co.
email: contact@goldencars.com
phone: (800) 555-CARS
```

The verification queries at the bottom will show:
- ✅ Dealership created
- ✅ Admin user linked with role "admin"
- ✅ Default user linked with role "salesperson"

### Step 6: Set User Passwords

The users need to set their own passwords:

1. **Send them the invite emails** (Supabase automatically sent them)
2. **They click the link** in their email
3. **They create their password**
4. **Done!** They can now log in

**OR manually set passwords via Supabase Dashboard:**

1. **Go to Authentication → Users**
2. **Click on** `admin@goldencar.com`
3. **Click "Reset password"** button
4. **Share the reset link** with them, or they can set it themselves

## Troubleshooting

### "Dealership already exists"

The SQL has conflict handling, so it's safe to run multiple times.

If you get an error, the dealership might already exist. Check:

1. **Go to**: SQL Editor → New Query
2. **Run**:
   ```sql
   SELECT id, name FROM dealerships WHERE name = 'Golden Car Co.';
   ```
3. If it returns a result, the dealership exists ✓

### "User ID not found"

Make sure you:
1. ✅ Created the users in Authentication → Users
2. ✅ Copied the correct UUID (long string like `123e4567-...`)
3. ✅ Replaced the placeholder with the actual UUID
4. ✅ Didn't add extra spaces or quotes

### "Column not found" or "Table doesn't exist"

The database tables might not be created yet.

**You need to run the schema first:**

1. **Go to**: SQL Editor → New Query
2. **Paste the SQL from**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) (Steps 5-7)
3. **Run it**
4. **Then** run the seed file above

### Still having issues?

Check:
- ✅ You're logged into the correct Supabase project
- ✅ The UUIDs are valid (no extra spaces)
- ✅ The dealership tables were created first
- ✅ The auth users exist in Authentication → Users

## What Gets Created

### Dealership: Golden Car Co.

| Field | Value |
|-------|-------|
| Name | Golden Car Co. |
| Address | 123 Premium Auto Drive, Luxury City, CA 90210 |
| Phone | (800) 555-CARS |
| Email | contact@goldencars.com |
| Created | Now |

### Admin User

| Field | Value |
|-------|-------|
| Email | admin@goldencar.com |
| Role | admin |
| Full Name | Admin User |
| Phone | (800) 555-ADMIN |
| Dealership | Golden Car Co. |

**Permissions:**
- ✅ Full system access
- ✅ Create/edit/delete dealerships
- ✅ Create/edit/delete users
- ✅ Assign roles
- ✅ Access Admin Dashboard

### Default User

| Field | Value |
|-------|-------|
| Email | user@goldencar.com |
| Role | salesperson |
| Full Name | Default User |
| Phone | (800) 555-USER |
| Dealership | Golden Car Co. |

**Permissions:**
- ✅ Take customer photos
- ✅ Edit and enhance photos
- ✅ Create personal presets
- ✅ View dealership photos
- ❌ Access admin features

## Next Steps

### 1. Start the App

```bash
npm run dev
```

### 2. Log In

**As Admin:**
- Email: `admin@goldencar.com`
- Password: (whatever they set)

**As Default User:**
- Email: `user@goldencar.com`
- Password: (whatever they set)

### 3. Explore Admin Dashboard

1. Log in as admin
2. Click user icon (top right)
3. Click "Admin Dashboard"
4. You should see:
   - Dealerships tab: Golden Car Co. listed
   - Users tab: admin and user@goldencar.com listed

### 4. Test Camera & Photos

1. Log in as default user
2. Click "Start Creating" button
3. Take a photo
4. Edit and enhance
5. Save to gallery
6. Go to Admin Dashboard → verify photo appears

## Database Check

### View All Dealerships

```sql
SELECT id, name, email, phone, created_at
FROM dealerships
ORDER BY created_at DESC;
```

### View All Users

```sql
SELECT
  up.id,
  up.full_name,
  up.role,
  d.name as dealership,
  up.created_at
FROM user_profiles up
LEFT JOIN dealerships d ON up.dealership_id = d.id
ORDER BY up.created_at DESC;
```

### View Auth Users

```sql
SELECT id, email, created_at, last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;
```

## Security Notes

- ✅ Passwords are hashed by Supabase (bcrypt)
- ✅ Row Level Security enforces data isolation
- ✅ Admin has full access, others see only their dealership
- ✅ All queries are logged in Supabase dashboard

## Support

- **Supabase Docs**: https://supabase.com/docs
- **SQL Guide**: https://supabase.com/docs/guides/database/sql
- **Auth Guide**: https://supabase.com/docs/guides/auth

---

**Ready?** Follow the 6 steps above and you'll have:
- ✅ Admin user with full system access
- ✅ Golden Car Co. dealership
- ✅ Default user ready to take photos
- ✅ Everything configured and working

Let me know if you hit any issues! 🚀
