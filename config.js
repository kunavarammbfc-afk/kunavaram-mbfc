module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    return res.status(500).json({
      error: 'Cloud name not configured',
      fix: 'Set CLOUDINARY_CLOUD_NAME in Vercel Settings > Environment Variables'
    });
  }

  return res.status(200).json({ cloudName });
};
