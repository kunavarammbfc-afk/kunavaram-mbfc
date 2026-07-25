// CLOUDINARY CONFIGURATION
// Replace 'YOUR_CLOUD_NAME' with your actual Cloudinary Cloud Name
const CLOUDINARY_CONFIG = {
    cloudName: 'tzlcekor', // <-- PUT YOUR CLOUD NAME HERE
    folders: {
        birthday: {
            photos: 'kmbfc-media/birthday/photos',
            videos: 'kmbfc-media/birthday/videos'
        },
        movieReleases: {
            photos: 'kmbfc-media/movie-releases/photos',
            videos: 'kmbfc-media/movie-releases/videos'
        },
        boxOffice: {
            photos: 'kmbfc-media/box-office/photos',
            videos: 'kmbfc-media/box-office/videos'
        },
        fanMeets: {
            photos: 'kmbfc-media/fan-meets/photos',
            videos: 'kmbfc-media/fan-meets/videos'
        }
    }
};

// Helper function to get Cloudinary URL
function getCloudinaryUrl(publicId, options = {}) {
    const { width, height, format, download = false } = options;
    
    let url = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
    
    if (width) url += `/w_${width}`;
    if (height) url += `/h_${height}`;
    if (format) url += `/f_${format}`;
    if (download) url += `/fl_attachment`;
    
    url += `/${publicId}`;
    
    return url;
}

// Helper function to get video URL
function getVideoUrl(publicId) {
    return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/video/upload/${publicId}`;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CLOUDINARY_CONFIG, getCloudinaryUrl, getVideoUrl };
}
