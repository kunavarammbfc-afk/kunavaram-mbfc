const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const IMAGE_EXTS = ['jpg','jpeg','png','gif','webp','bmp','tiff','svg'];
const VIDEO_EXTS = ['mp4','mov','avi','mkv','webm','flv','wmv'];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    return res.status(500).json({ error: 'CLOUDINARY_CLOUD_NAME not set' });
  }

  try {
    const gallery = {
      birthday: { photos: [], videos: [] },
      movieReleases: { photos: [], videos: [] },
      boxOffice: { photos: [], videos: [] },
      fanMeets: { photos: [], videos: [] }
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

    for (const r of allResources) {
      const path = (r.public_id || '').toLowerCase();
      const filename = r.public_id.split('/').pop();
      const fmt = (r.format || '').toLowerCase();
      const isImg = IMAGE_EXTS.includes(fmt) || r.resource_type === 'image';
      const isVid = VIDEO_EXTS.includes(fmt) || r.resource_type === 'video';

      let category = null;
      if (path.includes('birthday') || path.includes('celebration')) category = 'birthday';
      else if (path.includes('movie') || path.includes('film') || path.includes('release')) category = 'movieReleases';
      else if (path.includes('box') || path.includes('office') || path.includes('milestone')) category = 'boxOffice';
      else if (path.includes('fan') || path.includes('meet')) category = 'fanMeets';

      if (!category) continue;

      if (isImg) {
        gallery[category].photos.push({ id: r.public_id, name: filename, url: r.secure_url });
      } else if (isVid) {
        gallery[category].videos.push({ id: r.public_id, name: filename, url: r.secure_url });
      }
    }

    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).json({ cloudName, gallery });

  } catch (error) {
    return res.status(500).json({
      error: 'Gallery fetch failed',
      message: error.message
    });
  }
};
