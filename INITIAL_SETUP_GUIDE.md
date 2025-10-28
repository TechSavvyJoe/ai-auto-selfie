# Initial Setup Guide: Admin, Dealership & Users

This guide covers setting up the initial admin user, default dealership ("Golden Car Co."), and default user account for the AI Auto Selfie application.

## Prerequisites

1. **Supabase Project Created** - Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) first
2. **Database Tables Created** - Run the SQL schema from SUPABASE_SETUP.md
3. **.env File Configured** - With `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. **Service Role Key** (optional but recommended) - For admin operations

## Setup Methods

Choose one of the following methods:

### Method 1: Automated Setup Script (Recommended) ⭐

The easiest way to set everything up with just a few command prompts.

#### Prerequisites
```bash
# Ensure Node.js 16+ is installed
node --version

# Install dependencies (if not already done)
npm install
```

#### Steps

1. **Get your Service Role Key** (optional but recommended for better security):
   - Go to your Supabase dashboard
   - Click **Settings** (gear icon)
   - Click **API** in the sidebar
   - Copy the **service_role** key (keep this secret!)
   - Add to `.env` file:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **Run the setup script:**
   ```bash
   npx ts-node scripts/setupInitialData.ts
   ```

3. **Follow the prompts:**
   - Enter admin email (e.g., `admin@goldencar.com`)
   - Enter admin password (minimum 6 characters)
   - Enter admin full name (e.g., `Admin User`)
   - Enter default user email (e.g., `user@goldencar.com`)
   - Enter default user password (minimum 6 characters)
   - Enter default user name (e.g., `Default User`)
   - Enter dealership contact info (optional)

4. **Review the summary** - Save the credentials printed at the end

#### Example Session
```
🚀 AI Auto Selfie - Initial Setup

This script will set up:
1. Admin user account
2. "Golden Car Co." dealership
3. Default user for the dealership

Admin email: admin@goldencar.com
Admin password (min 6 chars): MySecurePassword123!
Admin full name (e.g., "John Administrator"): John Admin

Default user email: salesperson@goldencar.com
Default user password (min 6 chars): DefaultPassword123!
Default user full name (e.g., "Jane Salesperson"): Jane Sales
Default user phone (optional): (555) 123-4567

Dealership phone (optional): (555) 123-4500
Dealership email (optional): contact@goldencar.com
Dealership address (optional): 123 Main St, Anytown, USA

✨ SETUP COMPLETE!

📊 Created Resources:
   • Dealership: Golden Car Co. (uuid-here)
   • Admin User: admin@goldencar.com
   • Default User: salesperson@goldencar.com

🔐 Credentials:
   Admin:
     Email: admin@goldencar.com
     Password: (as entered)
   Default User:
     Email: salesperson@goldencar.com
     Password: (as entered)
```

### Method 2: Manual Setup (SQL + Dashboard)

If you prefer more control or the script doesn't work in your environment.

#### Step 1: Create the Dealership (SQL)

1. Go to your Supabase dashboard
2. Click **SQL Editor** in the sidebar
3. Click **New Query**
4. Paste this SQL:

```sql
INSERT INTO dealerships (name, address, phone, email, settings, created_at, updated_at)
VALUES (
  'Golden Car Co.',
  '123 Main St, Anytown, USA',  -- Update with actual address
  '(555) 123-4500',              -- Update with actual phone
  'contact@goldencar.com',       -- Update with actual email
  jsonb_build_object(
    'created_by', 'manual_setup',
    'created_at', NOW()
  ),
  NOW(),
  NOW()
)
RETURNING id, name;
```

5. Click **Run** and note the dealership ID from the result

#### Step 2: Create Admin User (Supabase Dashboard)

1. Go to **Authentication** in sidebar
2. Click **Users** tab
3. Click **Invite**
4. Enter admin email and click **Send invite**
5. The user will be created (no email verification needed for dashboard invites)

#### Step 3: Create Default User (Supabase Dashboard)

1. Repeat Step 2 for the default user
2. Enter default user email

#### Step 4: Create User Profiles (SQL)

1. In the SQL Editor, create a new query:

```sql
-- Replace the UUIDs with actual user IDs from Supabase Auth
-- Get these from Authentication > Users in your Supabase dashboard

-- Admin user profile
INSERT INTO user_profiles (id, dealership_id, role, full_name, phone, created_at, updated_at)
VALUES (
  'admin-user-id-here',      -- Replace with actual admin user UUID
  'dealership-id-here',      -- Replace with dealership UUID from Step 1
  'admin',
  'John Admin',              -- Replace with actual name
  '(555) 123-4567',          -- Optional
  NOW(),
  NOW()
);

-- Default user profile
INSERT INTO user_profiles (id, dealership_id, role, full_name, phone, created_at, updated_at)
VALUES (
  'default-user-id-here',    -- Replace with actual user UUID
  'dealership-id-here',      -- Replace with dealership UUID from Step 1
  'salesperson',
  'Jane Sales',              -- Replace with actual name
  '(555) 123-4568',          -- Optional
  NOW(),
  NOW()
);
```

2. Click **Run**

### Method 3: Supabase Dashboard API

If you're comfortable with REST APIs and your favorite HTTP client (Postman, curl, etc.):

```bash
# Create a user via Supabase Admin API
curl -X POST "https://YOUR_SUPABASE_URL/auth/v1/admin/users" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@goldencar.com",
    "password": "MySecurePassword123!",
    "email_confirm": true,
    "user_metadata": {
      "full_name": "John Admin"
    }
  }'
```

## What Gets Created

### Dealership: Golden Car Co.
- **Name**: Golden Car Co.
- **Address**: (as entered)
- **Phone**: (as entered)
- **Email**: (as entered)
- **Role**: Contains admin and salesperson users

### Admin User
- **Email**: (as entered)
- **Password**: (as entered, stored securely by Supabase)
- **Role**: `admin` - Full access to all features
- **Can**:
  - Access Admin Dashboard
  - Create/edit/delete dealerships
  - Create/edit/delete users
  - Assign roles to other users
  - View all statistics

### Default User
- **Email**: (as entered)
- **Password**: (as entered)
- **Role**: `salesperson` - Limited to dealership operations
- **Can**:
  - Take customer photos
  - Edit and enhance photos
  - Save personal presets
  - View dealership photos
  - Cannot access admin features

## Database Schema Created

The following tables and relationships are established:

```
dealerships
├─ id (UUID, primary key)
├─ name (Golden Car Co.)
├─ address, phone, email
├─ settings (JSON)
└─ timestamps

user_profiles
├─ id (references auth.users)
├─ dealership_id (references dealerships)
├─ role ('admin' or 'salesperson')
├─ full_name
├─ phone
└─ timestamps

photos (scoped to dealership)
├─ id
├─ user_id (who took the photo)
├─ dealership_id (which dealership)
└─ other photo metadata

presets (scoped to dealership)
├─ id
├─ user_id
├─ dealership_id
├─ is_shared (can share within dealership)
└─ settings
```

## Security

### Role-Based Access Control (RBAC)

The database enforces role-based access:

```sql
-- Admins can access all dealerships
WHERE role = 'admin'

-- Salespeople can only access their assigned dealership
WHERE dealership_id = (SELECT dealership_id FROM user_profiles WHERE id = auth.uid())
```

### Data Isolation

Users can **only**:
- View photos from their dealership
- Share presets within their dealership
- Access users in their dealership
- Cannot access data from other dealerships

This is enforced at the **database level** via Row Level Security (RLS), not just the UI.

### Password Security

- Passwords are hashed by Supabase Auth using bcrypt
- Minimum 6 characters recommended (consider stronger requirements)
- Passwords are never stored in your application code
- All authentication goes through Supabase's secure endpoints

## Verification

After setup, verify everything worked:

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Log in with admin credentials:**
   - You should see the application (not the auth modal)
   - Click user icon in header → "Admin Dashboard"
   - You should see the dealership and users listed

3. **Log in with default user credentials:**
   - You should see the application
   - You can take photos
   - You cannot access Admin Dashboard

4. **Check database:**
   - Go to Supabase dashboard
   - Click **Table Editor**
   - Verify entries in `dealerships` and `user_profiles` tables

## Troubleshooting

### "Script not found" or "ts-node not found"
```bash
# Install ts-node globally
npm install -g ts-node

# Or run with npx
npx ts-node scripts/setupInitialData.ts
```

### "Supabase not configured" error
```bash
# Ensure .env file exists with correct keys
cat .env

# Should output:
# VITE_SUPABASE_URL=https://xxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...
```

### "User already exists" error
- The email is already registered in Supabase
- Use a different email address
- Or delete the existing user from Supabase dashboard first

### "RLS policy violation" error
- Make sure the database tables were created with RLS enabled
- Check that policies exist in Supabase dashboard
- Verify user has a dealership assigned

### "Cannot read property 'id' of null"
- The dealership creation failed
- Check the dealership name doesn't already exist
- Verify database connection is working

## Next Steps

1. **Familiarize yourself with the app:**
   - Log in with default user account
   - Take a test photo
   - Edit and enhance it

2. **Admin dashboard:**
   - Log in with admin account
   - Navigate to Admin Dashboard
   - Create additional users or dealerships
   - Assign roles

3. **Customization:**
   - Update dealership address, phone, email
   - Create additional users for your team
   - Configure app settings

4. **Production deployment:**
   - Document your Supabase project credentials
   - Set up backups in Supabase dashboard
   - Configure custom domain (optional)
   - Set up email templates for password resets

## Security Best Practices

1. **Protect your service role key:**
   - Never commit `.env` to git
   - Use separate keys for development and production
   - Rotate keys periodically

2. **Strong passwords:**
   - Use at least 12 characters
   - Mix uppercase, lowercase, numbers, symbols
   - Don't reuse passwords across accounts

3. **Regular backups:**
   - Supabase provides automatic daily backups (free tier)
   - Export photos from storage bucket regularly
   - Monitor database size

4. **User management:**
   - Remove inactive users
   - Audit admin access regularly
   - Use manager roles for team leads

5. **Monitor access:**
   - Check logs in Supabase dashboard
   - Review RLS policies regularly
   - Ensure only admin users have admin role

## Support

- **Supabase Documentation**: https://supabase.com/docs
- **Authentication Guide**: https://supabase.com/docs/guides/auth
- **Row Level Security**: https://supabase.com/docs/guides/auth/row-level-security
- **Database Basics**: https://supabase.com/docs/guides/database

## Related Documents

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Initial database setup
- [AUTH_INTEGRATION.md](./AUTH_INTEGRATION.md) - Authentication system overview
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Application architecture
