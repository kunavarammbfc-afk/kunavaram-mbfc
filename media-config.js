// MEDIA CONFIGURATION
// Add your Cloudinary file public IDs here
// Format: 'folder/filename' (without extension)

const MEDIA_CONFIG = {
    birthday: {
        photos: [
            '142848619428367912_knrbac'
        ],
        videos: []
    },
    movieReleases: {
        photos: [
            'download_bwmwoj',
            '88031367716678434_dnsxw3',
            'ChatGPT_Image_Jul_23_2026_11_02_54_AM_acohrl'
        ],
        videos: []
    },
    boxOffice: {
        photos: [],
        videos: []
    },
    fanMeets: {
        photos: [],
        videos: []
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MEDIA_CONFIG;
}
