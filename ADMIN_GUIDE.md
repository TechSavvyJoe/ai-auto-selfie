# Admin Guide: Managing Dealerships & Users

Complete guide for admin users to manage the application.

## Accessing Admin Dashboard

1. **Log in** with your admin account credentials
2. **Click user icon** in the top-right corner of the header
3. **Select "Admin Dashboard"** from the dropdown menu
4. You'll see two main tabs: **Dealerships** and **Users**

## Managing Dealerships

### View All Dealerships

The Dealerships tab shows all dealerships in the system:
- **Golden Car Co.** (default dealership created during setup)
- Any dealerships you create

### Create New Dealership

1. Click **"New Dealership"** button
2. Fill in the form:
   - **Name** (required): e.g., "Sunset Auto Group"
   - **Address** (optional): e.g., "456 Oak Ave, Somewhere, CA 90000"
   - **Phone** (optional): e.g., "(555) 987-6543"
   - **Email** (optional): e.g., "contact@sunsetauto.com"
3. Click **"Create"**
4. New dealership appears in the list
5. Note the dealership ID (you'll need it for user assignment)

### Edit Dealership

1. In the Dealerships tab, find the dealership
2. Click the **edit icon** (pencil)
3. Modify any field
4. Click **"Save"** or **"Cancel"**

### Delete Dealership

1. Click the **delete icon** (trash) next to a dealership
2. Confirm the deletion
3. **⚠️ Warning**: Deleting a dealership removes ALL associated users and photos

---

## Managing Users

### View All Users

The Users tab shows all users in the system with:
- **Email** - Login credential
- **Full Name** - Display name
- **Phone** - Contact information
- **Dealership** - Which dealership they belong to
- **Role** - admin, manager, or salesperson
- **Created** - Account creation date

### Create New User

1. Click **"New User"** button
2. Fill in the form:
   - **Email** (required): Must be unique
   - **Password** (required): Minimum 6 characters (recommend 12+)
   - **Full Name** (required): e.g., "John Smith"
   - **Phone** (optional): e.g., "(555) 123-4567"
   - **Dealership** (required): Select from dropdown
   - **Role** (required): Choose one:
     - **admin** - Full system access
     - **manager** - Manage users in their dealership
     - **salesperson** - Take and edit photos only
3. Click **"Create User"**
4. User receives confirmation (if email configured)
5. New user can now log in

### Edit User

1. Click the **edit icon** next to a user
2. Modify any field:
   - Can change name, phone, dealership, role
   - Cannot change email (for security)
   - Cannot change password (user must reset)
3. Click **"Save"** or **"Cancel"**

### Change User Role

1. Edit the user
2. Change the **Role** dropdown to:
   - **admin** - Full access to all dealerships and users
   - **manager** - Can manage users in their dealership only
   - **salesperson** - Can take photos, limited access
3. Click **"Save"**

### Delete User

1. Click the **delete icon** next to a user
2. Confirm deletion
3. **⚠️ Warning**: User's photos are kept, but their account is removed

### Move User to Different Dealership

1. Edit the user
2. Select different dealership from **Dealership** dropdown
3. Click **"Save"**
4. User now only sees photos from new dealership

---

## User Roles & Permissions

### Admin Role
```
✅ Full system access
✅ Create/edit/delete dealerships
✅ Create/edit/delete users
✅ Assign roles to any user
✅ Access any dealership's photos
✅ View system statistics
✅ Access Admin Dashboard
```

### Manager Role
```
✅ Manage users in their dealership
✅ View all dealership photos
✅ Edit other users' photos
✅ Create shared presets
❌ Create/delete dealerships
❌ Assign admin role
❌ Access other dealerships
```

### Salesperson Role
```
✅ Take customer photos
✅ Edit own photos
✅ Create personal presets
✅ View shared dealership presets
❌ Delete other users' photos
❌ Create/delete dealerships
❌ Access user management
```

---

## Common Admin Tasks

### Scenario 1: Add New Dealership with Team

1. **Create dealership** (see "Create New Dealership" above)
2. **Create manager user**:
   - Email: `manager@newdealership.com`
   - Role: **manager**
   - Dealership: (select the new dealership)
3. **Create salesperson users**:
   - Email: `salesperson1@newdealership.com`
   - Role: **salesperson**
   - Dealership: (select the new dealership)

Manager can now manage salespeople in their dealership.

### Scenario 2: Move User Between Dealerships

A salesperson changed dealerships:

1. Go to Users tab
2. Find the user
3. Click edit
4. Change **Dealership** dropdown
5. Click **"Save"**

User now only sees photos from the new dealership.

### Scenario 3: Promote Salesperson to Manager

Team lead needs more access:

1. Find the user
2. Click edit
3. Change **Role** to **manager**
4. Click **"Save"**

User can now create other users and manage dealership.

### Scenario 4: Disable a User

A user leaves the company:

1. Find the user
2. Click delete icon
3. Confirm deletion

Their account is removed (photos stay for archival).

### Scenario 5: Reset User Password

User forgot password:

**Option A: Via Supabase Dashboard** (best for security)
1. Go to Supabase dashboard
2. Click **Authentication** → **Users**
3. Find the user
4. Click the three dots → **Reset password**
5. Supabase sends reset email

**Option B: Delete & Recreate User**
1. Delete the old user account
2. Create new user with same email
3. Give them the new temporary password

---

## Viewing Dealership Photos

As an admin, you can:

1. **Log out** from admin dashboard
2. Make sure you're assigned to a dealership (during setup)
3. View that dealership's photos in the Gallery

Users can only see:
- Their own photos
- Photos from their dealership
- Shared presets from their dealership

**Note**: Dealership data isolation is enforced at the database level via Row Level Security (RLS).

---

## Database Overview

The admin system uses these database tables:

### dealerships
- Stores dealership information
- One-to-many relationship with user_profiles
- One-to-many relationship with photos

### user_profiles
- Extends auth.users with dealership and role information
- Links users to dealerships
- Stores role assignments

### photos
- Includes dealership_id for scoping
- Users can only see photos from their dealership
- Managers can edit other users' photos in their dealership

### presets
- Can be marked as shared within a dealership
- Users see their own + shared dealership presets

---

## Troubleshooting

### Can't Access Admin Dashboard
- Verify you're logged in with admin account
- Check user role in user_profiles table (should be 'admin')
- Refresh the page

### User Can't Log In
- Verify email is correct
- Verify dealership is assigned in user_profiles
- Check if user was deleted by accident

### User Sees No Photos
- Verify user is assigned to correct dealership
- Verify photos have dealership_id set
- Check RLS policies are enabled in Supabase

### Can't Create New User
- Email must be unique (not used before)
- Password must be at least 6 characters
- Dealership must be selected
- Check you're logged in as admin

### Deleted Wrong User
- Recover from Supabase backups (available in project settings)
- Recreate the user with same email
- User's photos are preserved (linked by user_id)

---

## Best Practices

### Security
1. **Strong passwords** - Use 12+ characters with mixed case, numbers, symbols
2. **Regular audits** - Review user list monthly
3. **Limit admin accounts** - Only essential staff
4. **Monitor access** - Check Supabase logs regularly

### Organization
1. **Dealership naming** - Use full legal name or standard abbreviation
2. **User naming** - Use FirstName LastName format
3. **Role assignment** - Only promote to manager if they need it
4. **Phone numbers** - Include area code for clarity

### Maintenance
1. **Archive photos** - Export dealership photos periodically
2. **Update contacts** - Keep dealership phone/email current
3. **Remove inactive users** - Delete users who've left the company
4. **Backup credentials** - Store admin password securely

---

## Next Steps

1. **Explore the app** - Take photos to understand the workflow
2. **Create test users** - Test different roles and permissions
3. **Review settings** - Check dealership-specific settings
4. **Plan rollout** - Determine users and dealerships for your deployment

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Authentication**: https://supabase.com/docs/guides/auth
- **Row Level Security**: https://supabase.com/docs/guides/auth/row-level-security
- **Error Messages**: Check Supabase dashboard → Logs for detailed errors

## Related Documents

- [INITIAL_SETUP_GUIDE.md](./INITIAL_SETUP_GUIDE.md) - Initial setup
- [SETUP_QUICK_START.md](./SETUP_QUICK_START.md) - Quick reference
- [AUTH_INTEGRATION.md](./AUTH_INTEGRATION.md) - Auth system overview
