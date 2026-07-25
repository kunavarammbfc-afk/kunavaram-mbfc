const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const IMAGE_EXTS = ['jpg','jpeg','png','gif','webp','bmp','tiff','svg'];
    const VIDEO_EXTS = ['mp4','mov','avi','mkv','webm','flv','wmv'];

    const gallery = {
      birthday: { photos: [], videos: [] },
      movieReleases: { photos: [], videos: [] },
      boxOffice: { photos: [], videos: [] },
      fanMeets: { photos: [], videos: [] }
    };

    // Search ALL images and videos in the account
    let cursor = undefined;
    let allResources = [];

    do {
      const search = cloudinary.search
        .expression('resource_type:image OR resource_type:video')
        .sort_by('created_at', 'asc')
        .max_results(500);

      if (cursor) {
        search.next_cursor(cursor);
      }

      const result = await search.execute();
      allResources = allResources.concat(result.resources || []);
      cursor = result.next_cursor;
    } while (cursor);

    for (const r of allResources) {
      const path = (r.public_id || '').toLowerCase();
      const filename = r.public_id.split('/').pop();

      // Determine category from path
      let category = null;
      if (path.includes('birthday') || path.includes('celebration') || path.includes('kmbfc-media/birthday')) {
        category = 'birthday';
      } else if (path.includes('movie') || path.includes('film') || path.includes('release') || path.includes('kmbfc-media/movie')) {
        category = 'movieReleases';
      } else if (path.includes('box') || path.includes('office') || path.includes('milestone') || path.includes('kmbfc-media/box')) {
        category = 'boxOffice';
      } else if (path.includes('fan') || path.includes('meet') || path.includes('kmbfc-media/fan')) {
        category = 'fanMeets';
      }

      // If no category match, skip
      if (!category) continue;

      // Determine type
      const fmt = (r.format || '').toLowerCase();
      const isImg = IMAGE_EXTS.includes(fmt) || r.resource_type === 'image';
      const isVid = VIDEO_EXTS.includes(fmt) || r.resource_type === 'video';

      if (isImg) {
        gallery[category].photos.push({
          id: r.public_id,
          name: filename,
          url: r.secure_url
        });
      } else if (isVid) {
        gallery[category].videos.push({
          id: r.public_id,
          name: filename,
          url: r.secure_url
        });
      }
    }

    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).json(gallery);

  } catch (error) {
    return res.status(500).json({
      error: 'Gallery API failed',
      details: error.message,
      fix: 'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in Vercel Settings > Environment Variables, then redeploy.'
    });
  }
};
