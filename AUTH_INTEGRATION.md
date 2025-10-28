# Authentication & Multi-User System

## Overview

This app now supports **multi-user authentication** with dealership-based access control. Users can log in, manage their photos within their dealership, and admins can manage users and dealerships through a dedicated admin dashboard.

## Features

### 🔐 Authentication
- **Email/Password Login** - Secure authentication via Supabase Auth
- **Auto-Profile Creation** - Database trigger automatically creates user profile on signup
- **Persistent Sessions** - Stay logged in across browser sessions
- **Secure Logout** - Sign out functionality with session cleanup

### 👥 Multi-User Support
- **Dealership-Scoped Data** - Each dealership's data is isolated
- **Role-Based Access Control** - 3 roles: Admin, Manager, Salesperson
- **User Profiles** - Extended user data with name, phone, dealership
- **Team Collaboration** - Multiple users can work within the same dealership

### 🏢 Dealership Management
- **Multiple Dealerships** - Support unlimited dealerships
- **Dealership Profiles** - Name, address, phone, email, logo
- **Settings Storage** - Custom settings per dealership (JSONB)
- **Admin Dashboard** - Full CRUD for dealerships and users

## User Roles

### Admin
- Full access to all features
- Can access Admin Dashboard
- Manage dealerships (create, edit, delete)
- Manage all users (create, edit, delete, assign roles)
- View all statistics

### Manager
- Manage users within their dealership
- View all dealership photos
- Create and share presets
- Cannot access admin-only features

### Salesperson
- Take customer photos
- Edit and enhance photos
- Save personal presets
- View their own photos and shared dealership photos

## Database Schema

### Tables

#### `dealerships`
```sql
- id (uuid, primary key)
- name (text)
- address (text)
- phone (text)
- email (text)
- logo_url (text)
- settings (jsonb) - Custom dealership settings
- created_at (timestamp)
- updated_at (timestamp)
```

#### `user_profiles`
```sql
- id (uuid, references auth.users)
- dealership_id (uuid, references dealerships)
- role (text) - 'admin', 'manager', or 'salesperson'
- full_name (text)
- phone (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `photos` (updated)
```sql
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- dealership_id (uuid, references dealerships) - NEW
- customer_name (text) - NEW
- customer_email (text) - NEW
- car_info (jsonb) - NEW: {make, model, year, vin}
- original_url (text)
- enhanced_url (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `presets` (updated)
```sql
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- dealership_id (uuid, references dealerships) - NEW
- is_shared (boolean) - NEW: Share with entire dealership
- name (text)
- settings (jsonb)
- created_at (timestamp)
```

### Row Level Security (RLS)

All tables have RLS policies to ensure:
- Users can only access data from their dealership
- Admins have full access across all dealerships
- Data isolation prevents cross-dealership leaks

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project (free tier: 500MB DB, 1GB files, 50K users)
3. Wait for project to initialize (~2 minutes)

### 2. Run SQL Schema

Copy and paste the SQL from `SUPABASE_SETUP.md` into your Supabase SQL Editor:

1. Open your Supabase project
2. Go to SQL Editor
3. Paste the complete schema (Steps 5-7)
4. Run the query

This creates:
- All tables with proper relationships
- RLS policies for security
- Trigger function for auto-profile creation
- Indexes for performance

### 3. Add Environment Variables

Create `.env` file in project root:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_GEMINI_API_KEY=your-gemini-key-here
```

Get your Supabase credentials:
1. Go to Project Settings > API
2. Copy "Project URL" → `VITE_SUPABASE_URL`
3. Copy "anon public" key → `VITE_SUPABASE_ANON_KEY`

### 4. Restart Dev Server

```bash
npm run dev
```

The app will now show a login modal on first visit (if Supabase is configured).

## Usage

### First User Setup

1. **Sign Up**: Click "Sign Up" and create first account
2. **Auto-Profile**: Database trigger creates profile automatically
3. **Create Dealership**: Use Admin Dashboard to create first dealership
4. **Assign User**: Assign your user to the dealership with "admin" role

### Admin Workflow

1. Click user icon in header → "Admin Dashboard"
2. **Dealerships Tab**:
   - Create dealerships with name, address, phone, email
   - Edit or delete existing dealerships
3. **Users Tab**:
   - Create new users with email, password, full name, phone
   - Assign role (admin/manager/salesperson)
   - Assign to dealership
   - Edit or delete users

### User Menu

Click the user icon in the header to access:
- **User Info** - Name, email, dealership, role
- **Admin Dashboard** - (Admin only)
- **Sign Out** - Log out of current session

### Taking Customer Photos

1. Capture photo using camera
2. Enter customer details:
   - Customer name
   - Customer email
   - Car info (make, model, year, VIN)
3. Enhance with AI
4. Save to gallery

Photo is automatically tagged with:
- Your user ID
- Your dealership ID
- Customer information
- Timestamp

## Features Integration Status

### ✅ Completed
- Authentication system (login/signup)
- User menu in header
- Admin dashboard (full CRUD)
- Dealership management
- User management
- Role-based access control
- Database schema with RLS
- Auto-profile creation trigger
- Session persistence

### 🔄 In Progress
- Multi-tenancy filtering (services need to filter by dealership_id)
- Customer info fields in photo capture
- Gallery filtering by dealership

### ⏳ Planned
- Shared presets within dealership
- Manager user management UI
- Photo assignment to customers
- Customer search/filtering
- Analytics by dealership

## Security

### Row Level Security (RLS)

Every table has RLS enabled with policies like:

```sql
-- Users can only view photos from their dealership
CREATE POLICY "Users can view photos in their dealership" 
ON photos FOR SELECT 
USING (dealership_id IN (
  SELECT dealership_id FROM user_profiles WHERE id = auth.uid()
));

-- Users can only insert photos for their dealership
CREATE POLICY "Users can insert photos for their dealership" 
ON photos FOR INSERT 
WITH CHECK (
  dealership_id IN (SELECT dealership_id FROM user_profiles WHERE id = auth.uid())
  AND user_id = auth.uid()
);
```

This ensures:
- Database-level access control (not just UI hiding)
- Users cannot access other dealerships' data
- Data isolation even if RLS is bypassed in UI

### Authentication Flow

1. User signs up → Supabase creates `auth.users` entry
2. Database trigger fires → Creates `user_profiles` entry
3. Admin assigns dealership + role → User can now access data
4. RLS policies check `auth.uid()` on every query
5. Only matching dealership data is returned

## Development

### Offline Mode

The app works **without Supabase** configured:
- Uses localStorage for photos/presets
- No authentication required
- Perfect for development/testing

### With Supabase

When environment variables are set:
- Automatic login modal appears
- All data synced to cloud
- Multi-user collaboration enabled
- Admin features unlocked

## Troubleshooting

### "Login modal not appearing"
- Check `.env` file exists with valid Supabase credentials
- Restart dev server after adding `.env`
- Check browser console for errors

### "Cannot create user profile"
- Verify trigger function is installed (see SUPABASE_SETUP.md Step 7)
- Check Supabase logs for trigger errors
- Ensure `user_profiles` table exists

### "Access denied" errors
- Verify RLS policies are installed (see SUPABASE_SETUP.md Step 6)
- Check user has dealership assigned
- Ensure user role is set correctly

### "Photos not showing"
- Verify `dealership_id` is set on photos table
- Check user is assigned to a dealership
- Confirm RLS policies allow access

## API Reference

### useAuth Hook

```typescript
const {
  user,              // Current Supabase user (null if not logged in)
  userProfile,       // Extended profile with dealership + role
  loading,           // Auth state loading
  isConfigured,      // Is Supabase configured?
  isAuthenticated,   // Is user logged in?
  isAdmin,           // Is user an admin?
  isManager,         // Is user a manager or admin?
  signOut            // Sign out function
} = useAuth();
```

### Supabase Service

```typescript
// Auth
await supabase.signIn(email, password);
await supabase.signUp(email, password);
await supabase.signOut();

// User Management
await supabase.getUserProfile(userId);
await supabase.createUser(email, password, profile);
await supabase.updateUserProfile(userId, updates);
await supabase.getUserProfiles(dealershipId);
await supabase.deleteUser(userId);

// Dealership Management
await supabase.createDealership(dealership);
await supabase.updateDealership(id, updates);
await supabase.getDealerships();
await supabase.deleteDealership(id);

// Photos (to be updated for multi-tenancy)
await supabase.savePhoto(photo);
await supabase.getPhotos(); // Will filter by dealership_id
await supabase.deletePhoto(id);

// Presets (to be updated for multi-tenancy)
await supabase.savePreset(preset);
await supabase.getPresets(); // Will filter by dealership_id + shared
await supabase.deletePreset(id);
```

## Next Steps

1. **Update Services** - Filter photos/presets by dealership_id
2. **Customer Info Fields** - Add form in camera/edit view
3. **Shared Presets** - Enable preset sharing within dealership
4. **Manager Features** - User management for managers
5. **Analytics** - Dealership-specific statistics
6. **Customer Portal** - Customer-facing photo viewing/download

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Triggers](https://supabase.com/docs/guides/database/functions)
