# Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTechSavvyJoe%2Fai-auto-selfie&env=API_KEY&envDescription=Required%20API%20keys%20for%20AI%20enhancement%20and%20upload%20features&envLink=https%3A%2F%2Fgithub.com%2FTechSavvyJoe%2Fai-auto-selfie%2Fblob%2Fmaster%2FDEPLOYMENT_UPLOAD_PROXY.md&project-name=ai-auto-selfie&repository-name=ai-auto-selfie)

## Quick Deploy Steps

1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Configure required environment variables:
   - **API_KEY** (required): Your Google GenAI API key for AI enhancement
   - **IMGBB_API_KEY** (optional): For server-side image uploads via IMGBB
   - **VERCEL_BLOB_READ_WRITE_TOKEN** (optional): For Vercel Blob storage

4. Deploy!

## Environment Variables

### Required
- `API_KEY`: Google GenAI (Gemini) API key for AI image enhancement and caption generation
  - Get yours at: https://aistudio.google.com/app/apikey

### Optional (for upload features)
- `IMGBB_API_KEY`: IMGBB API key for server-side image uploads
  - Get yours at: https://api.imgbb.com/
- `VERCEL_BLOB_READ_WRITE_TOKEN`: Vercel Blob storage token
  - Created automatically in Vercel dashboard or via CLI

### Client-side (optional)
- `VITE_UPLOAD_PROXY_URL`: Set to `/api/upload` to use the server-side upload proxy (recommended)
  - This enables secure uploads without exposing API keys to the browser

## Post-Deployment Setup

After deploying, configure the upload proxy for secure sharing:

1. In your Vercel project dashboard, go to Settings → Environment Variables
2. Add either `IMGBB_API_KEY` or `VERCEL_BLOB_READ_WRITE_TOKEN` (or both)
3. Redeploy to activate the upload proxy
4. The app will automatically use `/api/upload` for secure image uploads

## Features Enabled

✅ AI-powered image enhancement (Gemini 2.5 Flash)  
✅ Auto-caption generation with customizable tone  
✅ Social media sharing with rich previews  
✅ Secure server-side upload proxy  
✅ Gallery with analytics  
✅ Text and sticker overlays  
✅ Advanced image adjustments  
✅ Desktop and mobile responsive UI  

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Documentation

- [Upload Proxy Setup](./DEPLOYMENT_UPLOAD_PROXY.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Quick Reference](./QUICK_REFERENCE.md)

## Support

For issues or questions, open an issue on [GitHub](https://github.com/TechSavvyJoe/ai-auto-selfie/issues).
