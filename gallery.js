const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const IMAGE_EXTS = ['jpg','jpeg','png','gif','webp','bmp','tiff','svg'];
const VIDEO_EXTS = ['mp4','mov','avi','mkv','webm','flv','wmv'];

function getCategoryFromPath(publicId) {
  const p = (publicId || '').toLowerCase();
  if (p.includes('birthday') || p.includes('celebration')) return 'birthday';
  if (p.includes('movie') || p.includes('film') || p.includes('release')) return 'movie';
  if (p.includes('box') || p.includes('office') || p.includes('milestone')) return 'boxoffice';
  if (p.includes('fan') || p.includes('meet')) return 'fanmeets';
  return null;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    return res.status(500).json({
      error: 'CLOUDINARY_CLOUD_NAME not set',
      fix: 'Add CLOUDINARY_CLOUD_NAME in Vercel Settings > Environment Variables'
    });
  }

  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiKey || !apiSecret) {
    return res.status(500).json({
      error: 'Missing CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET',
      fix: 'Add both in Vercel Settings > Environment Variables, then redeploy'
    });
  }

  try {
    const gallery = {
      birthday: { photos: [], videos: [] },
      movie: { photos: [], videos: [] },
      boxoffice: { photos: [], videos: [] },
      fanmeets: { photos: [], videos: [] }
    };

    let cursor = undefined;
    let allResources = [];

    do {
      const search = cloudinary.search
        .expression('resource_type:image OR resource_type:video')
        .sort_by('created_at', 'asc')
        .max_results(500);
      if (cursor) search.next_cursor(cursor);
      const result = await search.execute();
      allResources = allResources.concat(result.resources || []);
      cursor = result.next_cursor;
    } while (cursor);

    let uncategorized = 0;

    for (const r of allResources) {
      const path = (r.public_id || '').toLowerCase();
      const filename = r.public_id.split('/').pop();
      const fmt = (r.format || '').toLowerCase();
      const isImg = IMAGE_EXTS.includes(fmt) || r.resource_type === 'image';
      const isVid = VIDEO_EXTS.includes(fmt) || r.resource_type === 'video';

      const category = getCategoryFromPath(r.public_id);
      if (!category) { uncategorized++; continue; }

      if (isImg) {
        gallery[category].photos.push({ id: r.public_id, name: filename, url: r.secure_url });
      } else if (isVid) {
        gallery[category].videos.push({ id: r.public_id, name: filename, url: r.secure_url });
      }
    }

    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).json({
      cloudName,
      gallery,
      debug: { total: allResources.length, categorized: allResources.length - uncategorized, uncategorized }
    });

  } catch (error) {
    const msg = error.message || String(error);
    if (msg.includes('Invalid API key') || msg.includes('api_key')) {
      return res.status(500).json({ error: 'Invalid Cloudinary API key', fix: 'Check CLOUDINARY_API_KEY in Vercel env vars' });
    }
    if (msg.includes('api_secret') || msg.includes('signature')) {
      return res.status(500).json({ error: 'Invalid Cloudinary API secret', fix: 'Check CLOUDINARY_API_SECRET in Vercel env vars' });
    }
    return res.status(500).json({ error: 'Gallery fetch failed', message: msg });
  }
};
