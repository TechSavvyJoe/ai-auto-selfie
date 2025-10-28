# 🚀 Quick Start: Admin & Dealership Setup

**⏱️ Takes ~5 minutes to complete**

## Prerequisites Checklist

- ✅ Supabase project created (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
- ✅ Database tables created (run the SQL from SUPABASE_SETUP.md)
- ✅ `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- ✅ Node.js 16+ installed

## Quick Setup (3 steps)

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Run Setup Script
```bash
npm run setup
```

### 3️⃣ Follow the Prompts
```
Admin email: admin@goldencar.com
Admin password: MyPassword123!
Admin full name: John Admin
Default user email: user@goldencar.com
Default user password: MyPassword123!
Default user full name: Jane Sales
Dealership phone: (optional)
Dealership email: (optional)
Dealership address: (optional)
```

## What Gets Created

| Item | Details |
|------|---------|
| **Dealership** | Golden Car Co. |
| **Admin User** | `admin@goldencar.com` (admin role) |
| **Default User** | `user@goldencar.com` (salesperson role) |

## Next: Start the App

```bash
npm run dev
```

Then:
1. Log in with admin account
2. Click user icon → "Admin Dashboard"
3. Verify dealership and users are listed

## 💡 Tips

- **Lost credentials?** Check the terminal output from `npm run setup`
- **Need more users?** Use Admin Dashboard (logged in as admin)
- **Change user role?** Admin Dashboard → Users tab
- **Modify dealership?** Admin Dashboard → Dealerships tab

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Script not found | Run `npm install` first |
| "Supabase not configured" | Check `.env` file has correct keys |
| "User already exists" | Use different email address |
| Can't log in | Verify credentials from setup output |

## 📚 Full Documentation

For detailed information, see [INITIAL_SETUP_GUIDE.md](./INITIAL_SETUP_GUIDE.md)

## Architecture

```
Supabase Cloud
├─ Auth (admin & user accounts)
├─ Database
│  ├─ dealerships → Golden Car Co.
│  └─ user_profiles
│     ├─ admin user (admin role)
│     └─ default user (salesperson role)
└─ Storage (for photos)

Your App
├─ Admin features (admin only)
├─ Camera & Edit (all users)
└─ Gallery (dealership scoped)
```

## Security

- ✅ Passwords encrypted by Supabase
- ✅ Data isolated by dealership (RLS enforced)
- ✅ Roles control feature access
- ✅ No data sharing between dealerships

---

**Ready?** Run `npm run setup` and start building! 🎨📸
