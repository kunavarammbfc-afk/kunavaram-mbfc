export default async function handler(req, res) {
  const { url, filename } = req.query;
  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Missing or invalid url parameter' });
  }

  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'Upstream fetch failed ' + upstream.status });
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const safeName = (filename || 'download').replace(/[^a-zA-Z0-9._-]/g, '_');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'attachment; filename="' + safeName + '"');
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    const buffer = await upstream.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: 'Download failed: ' + (err.message || err) });
  }
}
