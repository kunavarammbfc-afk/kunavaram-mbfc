# KMBFC Website - Deployment Guide

## How Auto-Sync Works

The website automatically detects photos/videos you upload to Cloudinary. 
Just upload to the correct folder and the gallery updates on the next page load.

**No manual URL editing needed.**

---

## Step 1: Deploy to Vercel

### Option A: Vercel CLI (Recommended)

```bash
npm i -g vercel
vercel login
cd "C:\Users\skuma\Videos\open code Mahesh\mahesh-babu-fan-page"
vercel --prod
```

### Option B: Vercel Website

1. Go to https://vercel.com → **Add New Project**
2. Import your project folder
3. Click **Deploy**

---

## Step 2: Set Cloudinary Environment Variables (REQUIRED)

The gallery API needs your Cloudinary credentials stored as Vercel environment variables.

1. Go to your project in Vercel dashboard
2. Click **Settings** → **Environment Variables**
3. Add these 3 variables:

| Name | Value |
|------|-------|
| `CLOUDINARY_CLOUD_NAME` | (your Cloud name from Cloudinary Dashboard) |
| `CLOUDINARY_API_KEY` | (your API key from Cloudinary Dashboard) |
| `CLOUDINARY_API_SECRET` | (your API secret from Cloudinary Dashboard) |

4. Make sure all 3 are set for **Production** environment
5. Click **Save**, then go to **Deployments** and **Redeploy**

---

## Step 3: Upload Media to Cloudinary

1. Login to https://cloudinary.com → **Media Library**
2. Upload to these folders:

```
kmbfc-media/
├── birthday/
│   ├── photos/        ← Birthday celebration photos
│   └── videos/        ← Birthday celebration videos
├── movie-releases/
│   ├── photos/        ← Movie release photos
│   └── videos/        ← Movie release videos
├── box-office/
│   ├── photos/        ← Box office milestone photos
│   └── videos/        ← Box office milestone videos
└── fan-meets/
    ├── photos/        ← Fan meet photos
    └── videos/        ← Fan meet videos
```

3. That's it! The website auto-detects new files.

---

## Troubleshooting

### Gallery shows "No photos yet" but I uploaded files:
- Wait 30 seconds and refresh (API response is cached for 5 min)
- Check file is in the correct subfolder (photos/ or videos/)
- Verify environment variables are set in Vercel

### API returns error 500:
- Check that `CLOUDINARY_API_SECRET` is correct (no extra spaces)
- Redeploy after changing env vars

### Downloads don't work:
- Files must be public in Cloudinary (default for uploaded files)

---

## File Structure

```
mahesh-babu-fan-page/
├── index.html            # Main HTML (5 pages + modals)
├── styles.css            # All styling
├── script.js             # Gallery + navigation logic
├── cloudinary-config.js  # Cloud name config
├── media-config.js       # Static fallback (optional)
├── api/gallery.js        # Auto-sync serverless function
├── package.json          # Dependencies
├── vercel.json           # Vercel config
├── background.jpg        # Page background
└── DEPLOY.md             # This file
```
