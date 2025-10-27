// Vercel Serverless Upload Proxy
// Receives { dataUrl, fileName } and uploads to configured provider (IMGBB or Vercel Blob)
// Returns { url }

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = req.body || (await new Promise((resolve) => {
      let data = '';
      req.on('data', (chunk) => (data += chunk));
      req.on('end', () => resolve(JSON.parse(data)));
    }));

    const { dataUrl, fileName } = body || {};
    if (!dataUrl) {
      res.status(400).json({ error: 'Missing dataUrl in request body' });
      return;
    }

    // Prefer IMGBB if configured
    const imgbbKey = process.env.IMGBB_API_KEY;
    const vercelToken = process.env.VERCEL_BLOB_READ_WRITE_TOKEN;

    if (imgbbKey) {
      // imgbb accepts base64 in the `image` field via application/x-www-form-urlencoded
      const base64 = (dataUrl.split(',')[1] || dataUrl).replace(/^data:.*;base64,?/, '');
      const params = new URLSearchParams();
      params.append('image', base64);

      const resp = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error('imgbb upload failed', resp.status, text);
        res.status(502).json({ error: 'imgbb upload failed' });
        return;
      }

      const json = await resp.json();
      const url = json?.data?.url || json?.data?.display_url;
      if (!url) {
        res.status(502).json({ error: 'imgbb did not return a URL' });
        return;
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).json({ url });
      return;
    }

    if (vercelToken) {
      const resp = await fetch('https://api.vercel.com/v2/blob', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: dataUrl,
          encoding: 'base64',
          contentType: (dataUrl.split(';')[0] || '').replace('data:', '') || 'image/jpeg',
          pathname: fileName || `ai-auto-selfie-${Date.now()}.jpg`,
        }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error('Vercel Blob upload failed', resp.status, text);
        res.status(502).json({ error: 'Vercel Blob upload failed' });
        return;
      }

      const json = await resp.json();
      const url = json?.url || json?.downloadUrl || json?.blob?.url;
      if (!url) {
        res.status(502).json({ error: 'Vercel Blob did not return a URL' });
        return;
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).json({ url });
      return;
    }

    res.status(400).json({ error: 'No server-side upload provider configured' });
  } catch (error) {
    console.error('Upload proxy error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
