# Quick Start (5 minutes)

This quick guide gets the AI Auto Selfie app running locally and ready for you to test.

## 1. Install dependencies

```bash
npm install
```

## 2. Run the setup script

```bash
npm run setup
```

This script will prompt you for the initial admin and default user credentials and optional dealership info.

## 3. Follow the prompts

- Admin email/password
- Admin name
- Default user email/password
- Default user name
- Dealership info (optional)

> Note: The setup script uses environment variables for Supabase. Make sure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (or `SUPABASE_SERVICE_ROLE_KEY` for production) are set in your shell or `.env` before running the setup script.

## 4. Start the app

```bash
npm run dev
```

Open http://localhost:5173 (or the port Vite reports) and log in with the admin credentials you created.

## 5. Log in with your admin account

Use the admin email and password you entered during setup to access the Admin Dashboard and explore the app.

---

## Next Steps (5 min)

- Read: `Documentation/SETUP_QUICK_START.md` (this file) — 5 min
- Run: `npm install && npm run setup` — 2-3 minutes
- Start: `npm run dev` — 1 minute
- Explore: Log in and check out the Admin Dashboard

## Key Files

```
scripts/
├── setupInitialData.ts              # Run: npm run setup
└── migrations/
    └── 001_create_golden_car_co.sql  # Example migration

Documentation/
├── SETUP_QUICK_START.md             # ⭐ Start here
├── INITIAL_SETUP_GUIDE.md           # Complete guide
├── ADMIN_GUIDE.md                   # Admin manual
└── SETUP_COMPLETED.md               # Architecture overview
```

## Troubleshooting

- If `npm run setup` fails complaining about environment variables, export them first:

```bash
export VITE_SUPABASE_URL="https://your-supabase-url"
export VITE_SUPABASE_ANON_KEY="your-anon-key"
# For admin operations in production, set SUPABASE_SERVICE_ROLE_KEY
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

- If you see permission errors when creating users, ensure you use the service role key for admin operations or run the script against a local/dev Supabase instance.

- If you want to run tests that hit production Vercel, set `PROD_URL` in your environment before running the test.

```bash
export PROD_URL="https://ai-auto-selfie-your-deployment.vercel.app"
```

---

If you want, I can also:
- Add this Quick Start content into the project README
- Wire a GitHub Actions workflow that runs the Vercel smoke test on push
- Add a `.env.example` with required environment variable names

Which would you like next?