# Deploy & Verify: save-for-later server endpoint

This document explains how to securely deploy the server endpoint for save-for-later, run DB migrations, and verify the result. It intentionally avoids sharing any secret values — add those to GitHub Actions / Vercel as described.

TL;DR required env vars
- SUPABASE_URL — your project URL (https://xxxx.supabase.co)
- SUPABASE_SERVICE_ROLE_KEY — the service_role key (privileged) — only on server/CI
- DATABASE_URL — Postgres connection string for running migrations in CI (postgres://...)

Security notes
- Never commit the service role or DB connection string to the repo.
- Only add the service role to server/CI environment variables (Vercel server env, GitHub Actions secrets).
- RLS should be enabled on `photos` and related tables. See `scripts/rls/01_photos_rls.sql` for draft policies.

1) Add secrets

GitHub Actions (for running migrations):
1. Go to GitHub → your repo → Settings → Secrets and variables → Actions → New repository secret
2. Add `DATABASE_URL` (value: postgres://user:pass@host:port/dbname)

Vercel (for serverless endpoint):
1. Go to your Vercel project → Settings → Environment Variables
2. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Production and Preview (as needed)

2) Run the migration

Option A — Manual via Supabase SQL Editor (simplest)
1. Open Supabase → your project → SQL Editor
2. Open `scripts/migrations/002_add_photo_status.sql` in this repo and paste the SQL
3. Run it and confirm success

Option B — Locally with psql
1. Install psql if necessary:

```zsh
brew install libpq
echo 'export PATH="/opt/homebrew/opt/libpq/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

2. Run the migration (do this locally — do not paste secrets in chat):

```zsh
export DATABASE_URL="postgres://user:password@host:port/dbname"
psql "$DATABASE_URL" -f scripts/migrations/002_add_photo_status.sql
```

3. Verify the column exists:

```zsh
psql "$DATABASE_URL" -c "SELECT column_name FROM information_schema.columns WHERE table_name='photos' AND column_name='status';"
```

Option C — GitHub Actions (recommended for CI)
1. Ensure `.github/workflows/run-migrations.yml` exists in the repo (it was added in the project)
2. Add `DATABASE_URL` as a secret
3. From GitHub Actions UI, locate the workflow and click "Run workflow" (if `workflow_dispatch` is configured), or push a commit to trigger it

3) Deploy the server endpoint to Vercel

If the project is connected to GitHub the simplest flow is:
1. Ensure `api/saveForLater.ts` is in `api/` (or your framework's serverless location)
2. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the Vercel project env
3. Push a commit / open a PR - Vercel will build and deploy the function

If you prefer the CLI:

```zsh
npm i -g vercel
vercel login
vercel link
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add SUPABASE_URL production
vercel --prod
```

4) Verify the endpoint and sync

- Test the endpoint (small test payload):

```zsh
curl -X POST https://<your-vercel-deployment>/api/saveForLater \
  -H "Content-Type: application/json" \
  -d '{"imageBase64":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...","filename":"test.png","userId":"<user-uuid>"}'
```

- Check Supabase Storage and DB:
  - Storage: Supabase Console → Storage → bucket → confirm file present
  - DB: Supabase SQL Editor or psql:

```sql
SELECT id, user_id, status, original_url, inserted_at FROM photos ORDER BY inserted_at DESC LIMIT 5;
```

If the inserted row is present and `status='unprocessed'` (or appropriate value), the workflow is working.

5) Troubleshooting tips
- If a migration fails due to permission errors, ensure the `DATABASE_URL` user has ALTER privileges (use a service role or admin DB user for migrations).
- If the endpoint returns 401/403, check that Vercel env variables are set for the correct environment (Preview vs Production).
- If uploads fail, confirm the Storage bucket name and that the server code references the correct bucket.

6) Next steps I can take once you add secrets
- Trigger the migrations in CI and verify results in the workflow logs
- Deploy the endpoint and exercise an end-to-end test (I will not view or log secrets)

If you'd like I can also open a branch and PR with these docs and an RLS draft SQL file. Reply with `create-files` and I'll add them as files in the repo.

---
End of document
