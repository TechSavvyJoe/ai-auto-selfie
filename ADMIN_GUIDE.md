# Comprehensive Admin Guide: Managing Dealerships & Users

Welcome to the complete admin guide for AI Auto Selfie. This guide covers both **Software Owner Admin** and **Dealership Manager** roles.

## Quick Navigation

- [Overview](#overview)
- [Accessing the Admin Panel](#accessing-the-admin-panel)
- [Software Owner Admin Panel](#software-owner-admin-panel)
- [Dealership Manager Panel](#dealership-manager-panel)
- [User Role Hierarchy](#user-role-hierarchy)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Overview

The admin system has **two distinct tiers**:

### 🔐 Software Owner Admin (role: `admin`)
- **Access:** Full system-wide control
- **Manages:** All dealerships and users
- **Panel:** Dealerships → Users → Statistics

### 🏢 Dealership Manager (role: `manager`)
- **Access:** Dealership-level control only
- **Manages:** Team members within their dealership
- **Panel:** Team Members → Settings

---

## Accessing the Admin Panel

1. **Log in** with your admin account credentials
2. **Click the user icon** in the top-right corner of the header (shows your name and role)
3. **Select "Admin Dashboard"** from the dropdown menu
4. If you don't see "Admin Dashboard", you don't have admin privileges (contact your system administrator)

---

## 🔐 Software Owner Admin Panel

This section is for **Software Owner Admins** (role: `admin`) who manage the entire platform.

### Tab 1: 🏢 Dealerships

Manage all dealerships across the entire system.

#### View All Dealerships

The Dealerships tab displays:
- Dealership name
- Address (if available)
- Phone number (if available)
- Email (if available)
- Edit and Delete buttons

#### Create New Dealership

1. Click **"+ New Dealership"** button (top right)
2. Fill in the form:
   - **Dealership Name** (required): e.g., "Sunset Auto Group", "ABC Motors"
   - **Address** (optional): Full address with city and state
   - **Phone** (optional): Contact phone number
   - **Email** (optional): Contact email address
3. Click **"Create Dealership"** button
4. Success message appears, dealership added to list
5. The dealership is now available when creating users

#### Edit Dealership

1. Find the dealership in the list
2. Click the **"Edit"** button (blue)
3. Modify any fields
4. Click **"Update Dealership"** button
5. Changes save immediately

#### Delete Dealership

1. Click the **"Delete"** button (red) next to a dealership
2. Confirm the deletion warning dialog
3. **⚠️ WARNING**: Deletes ALL users and photos associated with this dealership
4. Cannot be undone - use with caution

**Dealership Deletion Best Practices:**
- Export/archive photos before deleting
- Notify dealership manager first
- Remove users manually if you need to preserve their accounts

---

### Tab 2: 👥 Users

Manage all users across all dealerships.

#### View All Users

The Users tab shows each user with:
- **Name** - User's full name
- **Role badge** - Color-coded: Purple (Admin), Blue (Manager), Green (Salesperson)
- **Phone** - Contact information
- Dealership (implicit from data)
- Edit and Delete buttons

#### Create New User

1. Click **"+ New User"** button (top right)
2. Fill in the creation form:
   - **Email** (required): Must be unique, no duplicates allowed
   - **Password** (required): Minimum 6 characters (recommend 12+ with mixed case and numbers)
   - **Full Name** (optional): User's display name
   - **Phone** (optional): Contact phone number
   - **Role** (required): Choose one:
     - **Salesperson** - Can take/edit photos, view dealership presets
     - **Dealership Manager** - Can manage team members within dealership
     - **Software Admin** - Full system-wide access
   - **Dealership** (required): Assign to a dealership (dropdown)
3. Click **"Create User"** button
4. Success message appears
5. User can immediately log in with email and password

**User Creation Tips:**
- **Salesperson**: Assign to dealership, they see only their own and dealership photos
- **Manager**: Assign to dealership, they can invite more team members
- **Admin**: Optional dealership assignment, they see everything

#### Edit User

1. Find the user in the list
2. Click the **"Edit"** button (blue)
3. Modify fields (note: cannot change email or password after creation):
   - Full Name
   - Phone
   - Role
   - Dealership assignment
4. Click **"Update User"** button
5. Changes apply immediately

#### Change User Role

1. Edit the user
2. Select new role from the **Role** dropdown:
   - **Salesperson** → **Manager**: User can now manage team members
   - **Manager** → **Salesperson**: User loses management access
   - **Admin** → **Manager/Salesperson**: User loses system-wide access
3. Click **"Update User"**

**Role Change Examples:**
- Promote star salesperson to manager: Edit → Role → Manager → Update
- Remove admin from a manager: Edit → Role → Manager → Update
- Demote manager back to salesperson: Edit → Role → Salesperson → Update

#### Delete User

1. Click the **"Delete"** button (red) next to a user
2. Confirm the deletion warning
3. **⚠️ WARNING**: Deletes user account permanently
4. Their photos are preserved but orphaned
5. Cannot be undone

**User Deletion Tips:**
- Consider role change instead of deletion if unsure
- Delete if user has left the company
- Photos remain for archival purposes

#### Move User to Different Dealership

1. Edit the user
2. Select different dealership from **Dealership** dropdown
3. Click **"Update User"**
4. User's data scope changes immediately
5. User now only sees photos from new dealership

---

### Tab 3: 📊 Statistics

View system-wide analytics and user distribution.

#### System Overview Cards

Four key metrics displayed:
- **Total Dealerships** - Number of dealerships in system
- **Total Users** - All users across all dealerships
- **Software Admins** - Count of admin-role users
- **Dealership Managers** - Count of manager-role users

#### User Distribution Charts

Visual progress bars showing percentage breakdown:
- **Salespersons** (green) - % of total users
- **Managers** (blue) - % of total users
- **Admins** (purple) - % of total users

**Use Statistics To:**
- Monitor system growth
- Identify imbalances (too many salespersons, not enough managers)
- Track admin user count
- Plan training and resources

---

## 🏢 Dealership Manager Panel

This section is for **Dealership Managers** (role: `manager`) who manage their dealership's team.

### Tab 1: 👥 Team Members

Manage users within your specific dealership.

#### View Team Members

Shows all users assigned to your dealership:
- User name
- Role badge (Manager/Salesperson only - no admin badge here)
- Phone number
- Edit and Remove buttons

#### Add Team Member

1. Click **"+ Add Team Member"** button (top right)
2. Fill in the form:
   - **Email** (required): Team member's email
   - **Password** (required): Minimum 6 characters
   - **Full Name** (optional): Team member's name
   - **Phone** (optional): Contact phone
   - **Role** (required): Choose one:
     - **Salesperson** - Regular team member
     - **Co-Manager** - Can help manage team
3. Click **"Add Member"** button
4. Team member is added to your dealership
5. They can log in immediately

**Team Member Tips:**
- New Salespersons should be trained on photo taking/editing
- Co-Managers can help you manage other team members
- Welcome them to the app and provide initial password

#### Edit Team Member

1. Find team member in list
2. Click **"Edit"** button (blue)
3. Modify fields (cannot change email):
   - Full Name
   - Phone
   - Role
4. Click **"Update Member"** button

#### Promote Team Member to Co-Manager

1. Edit the salesperson
2. Change **Role** dropdown to **Co-Manager**
3. Click **"Update Member"**
4. They now have management privileges

#### Remove Team Member

1. Click **"Remove"** button (red)
2. Confirm removal warning
3. **⚠️ WARNING**: User account is deleted
4. Their photos are preserved
5. Cannot be undone

**Removal Tips:**
- Only remove if team member has left
- Ensure they've downloaded/saved important photos first
- Consider role change instead (move to salesperson)

---

### Tab 2: ⚙️ Settings

View your dealership's information (read-only).

Displays:
- **Name** - Official dealership name
- **Address** - Physical location
- **Phone** - Contact phone number
- **Email** - Contact email address

**Note:** As a manager, you cannot edit these settings. Contact the software owner admin to make changes. These settings are important for the system to identify your dealership.

---

## User Role Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                 SYSTEM ARCHITECTURE                     │
└─────────────────────────────────────────────────────────┘

Software Owner Admin (admin role)
├─ Full system access
├─ Manage dealerships globally
├─ Manage all users (any dealership)
├─ View system statistics
├─ Can create/edit/delete dealerships
├─ Can assign any role to any user
└─ Access Admin Dashboard with 3 tabs

    └─→ Dealership Manager (manager role)
        ├─ Manage only their dealership
        ├─ Manage team members (salesperson/manager only)
        ├─ View dealership settings (read-only)
        ├─ Can add/remove team members
        └─ Access Dealership Admin with 2 tabs

            └─→ Salesperson (salesperson role)
                ├─ Take customer photos
                ├─ Edit own photos
                ├─ View dealership presets
                ├─ Create personal presets
                └─ NO access to admin panel
```

---

## Permissions Matrix

| Feature | Salesperson | Manager | Admin |
|---------|-----------|---------|-------|
| View own photos | ✅ | ✅ | ✅ |
| Edit own photos | ✅ | ✅ | ✅ |
| View dealership photos | ❌ | ✅ | ✅ |
| Edit dealership photos | ❌ | ✅ | ✅ |
| Create personal presets | ✅ | ✅ | ✅ |
| Create shared presets | ❌ | ✅ | ✅ |
| Manage dealership users | ❌ | ✅ | ✅ |
| Manage all users | ❌ | ❌ | ✅ |
| Create dealerships | ❌ | ❌ | ✅ |
| Manage dealerships | ❌ | ❌ | ✅ |
| Access admin panel | ❌ | ✅ | ✅ |
| View statistics | ❌ | ❌ | ✅ |

---

## Common Admin Tasks

### Task 1: Onboard a New Dealership with Complete Team

**Scenario:** A new dealership wants to use the app. You need to create the dealership, manager, and initial team members.

**Admin Steps:**
1. **Create Dealership** (Admin → Dealerships tab)
   - Click "+ New Dealership"
   - Name: "XYZ Motors"
   - Address, Phone, Email
   - Click "Create Dealership"

2. **Create Dealership Manager** (Admin → Users tab)
   - Click "+ New User"
   - Email: `manager@xyzmotors.com`
   - Password: (strong password)
   - Full Name: "John Smith"
   - Role: **Dealership Manager**
   - Dealership: Select "XYZ Motors"
   - Click "Create User"

3. **Send credentials to manager**

**Manager Steps (after receiving credentials):**
1. Log in with provided email/password
2. Click user icon → Admin Dashboard
3. Go to Team Members tab
4. Add salespersons one by one:
   - Email: `sales1@xyzmotors.com`
   - Password: (temporary password)
   - Name: "Jane Doe"
   - Role: **Salesperson**
   - Click "Add Member"

**Result:** Dealership is fully set up with manager and team members ready to use the app.

---

### Task 2: Move Salesperson Between Dealerships

**Scenario:** A salesperson was transferred to a different dealership.

**Admin Steps:**
1. Go to Users tab
2. Find the salesperson
3. Click "Edit"
4. Change **Dealership** dropdown to new dealership
5. Click "Update User"

**What Happens:**
- User's data scope changes immediately
- Old photos remain in old dealership
- User now only sees new dealership's photos
- All their personal settings preserved

---

### Task 3: Promote Salesperson to Manager

**Scenario:** A top performer needs more responsibilities and should become a manager.

**Admin Steps:**
1. Go to Users tab
2. Find the salesperson
3. Click "Edit"
4. Change **Role** to **Dealership Manager**
5. Click "Update User"

**Manager Steps (now that they have access):**
1. Click user icon → Admin Dashboard (now available!)
2. Go to Team Members tab
3. Can now manage their dealership's team

**What Happens:**
- User immediately gains manager privileges
- Can now add/remove team members in their dealership
- Can manage dealership settings
- Loses ability to manage other dealerships (if manager)

---

### Task 4: Remove an Employee from System

**Scenario:** An employee left the company and should no longer have access.

**Method A: Full Deletion (Recommended)**
1. Go to Users tab
2. Find the user
3. Click "Delete"
4. Confirm warning
5. Account is removed, but photos are preserved

**Method B: Role Demotion (If unsure)**
1. Edit the user
2. Change role to **Salesperson** (if applicable)
3. Update
4. User loses admin/manager access but still exists

**Note:** Photos are preserved in both cases for archival purposes.

---

### Task 5: Reset User Password

**Scenario:** User forgot their password and needs to log back in.

**Best Practice (via Supabase):**
1. Go to [Supabase Dashboard](https://supabase.com)
2. Click **Authentication** → **Users**
3. Find the user email
4. Click the user row
5. Click "Reset password" button
6. Supabase sends a reset link to their email
7. User clicks link and sets new password

**Quick Method (Delete & Recreate):**
1. Note their current details (name, dealership, role)
2. Delete the old user account
3. Create new user with same email
4. Provide temporary password
5. User changes password on first login

**Why First Method is Better:**
- More secure
- User maintains account history
- Photos stay linked to original user
- Professional password reset flow

---

### Task 6: Change Manager to Co-Manager (Dealership Perspective)

**Scenario:** A manager wants to add a co-manager to share responsibilities.

**Manager Steps (self-service):**
1. In Dealership Admin → Team Members tab
2. Click "+ Add Team Member"
3. Fill details with role **Co-Manager**
4. Click "Add Member"

**What Co-Manager Can Do:**
- Add/remove team members
- Edit own profile
- Help manage team workload
- Cannot access system-wide settings

---

### Task 7: Audit Active Users and Dealerships

**Scenario:** You want to understand your current deployment.

**Admin Steps:**
1. Go to Statistics tab
2. Review cards:
   - Total Dealerships
   - Total Users by role
3. See visual distribution charts
4. Use this to identify:
   - Growth trends
   - Role imbalances
   - Planning needs

**Analysis Questions:**
- Are we at the right user/dealership ratio?
- Do we have enough managers?
- Are there inactive dealerships?
- What's our growth trajectory?

---

## Troubleshooting

### "Admin Dashboard" Option Not Showing

**Problem:** User can't see "Admin Dashboard" in the user menu.

**Causes & Solutions:**
1. **User role is not admin/manager**
   - Solution: Go to Users tab, edit user, change role to Manager/Admin

2. **Browser cache issue**
   - Solution: Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

3. **Not logged in**
   - Solution: Log out and log back in

4. **Supabase not configured**
   - Solution: Check .env file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

---

### "Access Denied" When Opening Admin Dashboard

**Problem:** Admin panel shows access denied error.

**Causes & Solutions:**
1. **User role is Salesperson**
   - Solution: Change role to Manager or Admin

2. **Dealership not assigned**
   - Solution: For managers, ensure dealership is assigned in user profile

3. **Authentication expired**
   - Solution: Log out, log back in

---

### Can't Create User - "Email Already Exists"

**Problem:** Creating new user fails with email already in use error.

**Causes & Solutions:**
1. **Email was used before**
   - Solution: Use a different email, or delete old user first

2. **User accidentally created twice**
   - Solution: Delete duplicate, recreate with correct info

3. **Email syntax issue**
   - Solution: Ensure email is valid format (user@domain.com)

---

### New User Can't Log In

**Problem:** Just-created user receives login error.

**Causes & Solutions:**
1. **Email/password incorrect**
   - Solution: Verify credentials match what was entered

2. **Waiting for Supabase sync**
   - Solution: Wait 10 seconds, try again

3. **User deleted by mistake**
   - Solution: Check Users tab, recreate if missing

4. **Dealership not assigned**
   - Solution: Manager users MUST have dealership assigned

---

### User Sees "No Photos" in Gallery

**Problem:** User logged in successfully but gallery is empty.

**Causes & Solutions:**
1. **Wrong dealership assigned**
   - Solution: Edit user, verify dealership is correct

2. **User only has personal photos**
   - Solution: Check if salesperson - they only see own photos

3. **Dealership has no photos**
   - Solution: Upload photos first, or check different dealership

4. **RLS permissions issue**
   - Solution: Check Supabase RLS policies are enabled

---

### Can't Delete Dealership - "Permission Denied"

**Problem:** Delete button doesn't work or shows error.

**Causes & Solutions:**
1. **Not a software owner admin**
   - Solution: Only admins can delete dealerships (not managers)

2. **Dealership still has active users**
   - Solution: Delete/move all users first, then delete dealership

3. **Database constraint violation**
   - Solution: Delete in this order: users → dealership

---

### Manager Added User but Can't See Them

**Problem:** Dealership manager adds team member but user doesn't appear.

**Causes & Solutions:**
1. **Not assigned to same dealership**
   - Solution: Edit user, ensure dealership matches manager's dealership

2. **Page not refreshed**
   - Solution: Close admin panel, reopen it

3. **User created to different dealership**
   - Solution: Edit new user, assign to correct dealership

---

### "Invalid Email" or "Password Too Short"

**Problem:** User creation form won't accept input.

**Causes & Solutions:**
1. **Email format wrong**
   - Solution: Use valid email (user@example.com)

2. **Password under 6 characters**
   - Solution: Use minimum 6 characters (recommend 12+)

3. **Special characters in email**
   - Solution: Remove special characters except @ and .

---

## Best Practices

### Security Best Practices

1. **Strong Passwords**
   - Minimum 12 characters
   - Mix uppercase, lowercase, numbers, symbols
   - Avoid common words or patterns
   - Example: `Tz$mK9@vL2x`

2. **Admin Account Protection**
   - Store admin password securely
   - Use password manager (1Password, LastPass)
   - Change password regularly (monthly)
   - Only share with trusted staff

3. **Access Audits**
   - Review admin/manager users monthly
   - Remove inactive users
   - Check for orphaned accounts
   - Verify role assignments are appropriate

4. **Session Security**
   - Log out from shared computers
   - Don't leave admin dashboard unattended
   - Use HTTPS only (built-in for Supabase)

---

### Organization Best Practices

1. **Naming Conventions**
   - Dealerships: Use full legal name or standard abbreviation
   - Users: FirstName LastName (matches employee records)
   - Emails: firstname.lastname@dealership.com
   - Example: john.smith@xyzmotors.com

2. **Role Assignment Guidelines**
   - **Salesperson**: Default for most employees
   - **Manager**: Team leads, dealership owners
   - **Admin**: Only C-level or system administrators
   - Keep admin count minimal (3-5 users max)

3. **Documentation**
   - Keep spreadsheet of admin users
   - Document dealership IDs
   - Record onboarding dates
   - Note special permissions

4. **Contact Information**
   - Always fill in dealership contact info
   - Keep phone/email updated
   - Include manager contact in notes

---

### Maintenance Best Practices

1. **Regular Cleanup**
   - Monthly: Review user list for inactive accounts
   - Quarterly: Check dealership information accuracy
   - Annually: Archive old photos, remove unused dealerships

2. **Data Backup**
   - Supabase includes automated backups
   - Download important photo exports periodically
   - Keep dealership setup docs secure

3. **User Lifecycle**
   - Document onboarding process
   - Provide welcome training
   - Schedule check-ins after 1 week
   - Remove users properly on departure

4. **Monitoring**
   - Check Statistics tab monthly
   - Track user growth trends
   - Monitor for security issues
   - Review Supabase logs for errors

---

## Related Documentation

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Database schema and detailed setup
- [SUPABASE_TROUBLESHOOTING.md](./SUPABASE_TROUBLESHOOTING.md) - Advanced database troubleshooting
- [SETUP_QUICK_START.md](./SETUP_QUICK_START.md) - 5-minute quick start guide
- [TEXT_OVERLAY_STYLES.md](./TEXT_OVERLAY_STYLES.md) - Text overlay styling guide

---

## Support & Resources

**Quick Links:**
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Authentication Guide](https://supabase.com/docs/guides/auth)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

**When Troubleshooting:**
1. Check this guide first
2. Review related documentation
3. Check Supabase Dashboard → Logs
4. Verify .env file configuration

---

**Last Updated:** October 2025
**Version:** 2.0
**Status:** Complete with two-tier admin system
