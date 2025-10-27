Server-side Upload Proxy (recommended)

Why?
- Uploading directly from the browser to third-party services (imgbb, Vercel Blob) requires exposing API keys to clients. That's a security risk.
- A simple serverless proxy allows your app to keep keys on the server and safely upload images to third-party storage, returning a safe public URL to the client.

Vercel example (this repo)
- This project includes a Vercel serverless function at `api/upload.ts` that supports:
  - IMGBB (set `IMGBB_API_KEY` in Vercel env)
  - Vercel Blob (set `VERCEL_BLOB_READ_WRITE_TOKEN` in Vercel env)

How to enable in the client
1. Deploy the project to Vercel (or run locally using Vercel's dev experience). The serverless function will be available at `/api/upload`.
2. Configure the client to use the proxy by setting the Vite env variable `VITE_UPLOAD_PROXY_URL` to the proxy path (for Vercel deployments `/api/upload`) or the full URL.

Example `.env` (development):

VITE_UPLOAD_PROXY_URL=/api/upload

If you prefer a full URL (e.g., staging):

VITE_UPLOAD_PROXY_URL=https://your-deployment.vercel.app/api/upload

Server env variables (on Vercel dashboard)
- IMGBB_API_KEY: (optional) API key for imgbb
- VERCEL_BLOB_READ_WRITE_TOKEN: (optional) token for Vercel Blob API

Behavior
- When `VITE_UPLOAD_PROXY_URL` (or `window.UPLOAD_PROXY_URL`) is set in the client, `services/uploadService.ts` will POST the image to that proxy instead of calling third-party APIs directly.
- The proxy returns JSON { url } with the public image URL.

Security note
- Keep your IMGBB and Vercel tokens secret and only set them in the Vercel dashboard (Environment Variables) — never embed them in client-side env variables.

Quick test locally
- Run the dev server with Vercel dev (or deploy to Vercel):

npm run dev
# In Vercel local dev, set env vars in the platform or use a local .env for client only; the serverless function reads server env vars from Vercel dashboard when deployed.

Troubleshooting
- If the proxy returns 502, check provider keys and provider API changes.
- The included proxy supports both IMGBB and Vercel Blob; ensure at least one server-side provider key is set.
