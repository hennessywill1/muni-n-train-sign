# Muni N Train Sign - Vercel Deployment

This is a complete setup to run your N Train arrival sign on Vercel (totally free).

## Quick Setup (5 minutes)

### Step 1: Create a GitHub repo
1. Go to [github.com/new](https://github.com/new)
2. Create a new public repository called `muni-n-train-sign`
3. Upload these files to the repo:
   - `index.html` (in root)
   - `api/index.js` (in api folder)
   - `package.json` (in root)
   - `vercel.json` (in root)
   - `README.md` (in root)

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign up" (use GitHub)
3. Click "New Project"
4. Select your `muni-n-train-sign` repository
5. Click "Deploy"

Vercel will deploy automatically. You'll get a URL like:
```
https://muni-n-train-sign.vercel.app
```

### Step 3: Update the HTML file
1. After deployment, you'll see your project URL in Vercel
2. Go back to your GitHub repo and edit `index.html`
3. Find this line:
   ```javascript
   const API_URL = 'https://YOUR_PROJECT_NAME.vercel.app/api';
   ```
4. Replace `YOUR_PROJECT_NAME` with your actual project name
5. Commit the change

### Step 4: Use on iPad
1. Open the URL in Safari on your iPad (e.g., `https://muni-n-train-sign.vercel.app`)
2. Tap Share → "Add to Home Screen"
3. Name it "N Train" or whatever you like
4. It will now appear as an app on your home screen!

## Files Explained

- **index.html** - The frontend (what you see on the iPad)
- **api.js** - The backend (fetches from Muni API server-side)
- **package.json** - Dependencies for the backend
- **vercel.json** - Vercel configuration

## How it works

1. Your iPad opens the Vercel website
2. The website calls the Vercel backend API
3. The backend fetches real-time N train data from Muni (no CORS issues on server)
4. The API returns JSON to your iPad
5. Your iPad displays the arrivals

## Troubleshooting

### "Failed to fetch" error
- Make sure your API_URL in `index.html` matches your Vercel deployment URL
- Check that the `/api` endpoint is working by visiting `https://YOUR_URL/api` in a browser

### No trains showing
- The sign filters for downtown-bound trains only
- If no downtown trains are available, it shows "No downtown trains available"
- If you want ALL trains, let me know and I can update the filter

### Update interval
Currently updates every 30 seconds. To change:
- In `index.html`, find: `setInterval(fetchArrivals, 30000);`
- Change `30000` to milliseconds (e.g., `60000` = 60 seconds)

## Cost
**Completely free!** Vercel gives you 100GB bandwidth per month for free, which is way more than you'll need.
