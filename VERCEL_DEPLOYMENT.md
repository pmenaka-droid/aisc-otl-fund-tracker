# 🚀 Vercel Deployment Guide

## **Step 1: Push to GitHub**
1. Create a new repository on GitHub
2. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Ready for Vercel deployment"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

## **Step 2: Deploy to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with your GitHub account
3. Click "New Project"
4. Select your GitHub repository
5. **Important Settings:**
   - **Framework Preset:** Other
   - **Root Directory:** . (default)
   - **Build Command:** Leave empty
   - **Output Directory:** Leave empty
   - **Install Command:** `npm install`

## **Step 3: Add Environment Variables**
In Vercel dashboard → Settings → Environment Variables:
- **NODE_ENV:** `production`

## **Step 4: Deploy**
1. Click "Deploy"
2. Wait for deployment to complete
3. Copy your Vercel URL (e.g., `https://your-app-abc123.vercel.app`)

## **Step 5: Update Frontend API URL**
1. In your code, update `App.tsx` line 33:
   ```typescript
   const API_BASE = process.env.NODE_ENV === 'production' 
     ? 'https://your-app-abc123.vercel.app/api'  // Replace with your Vercel URL
     : 'http://localhost:3001/api';
   ```
2. Redeploy your frontend to Netlify

## **Step 6: Test**
1. Visit your Netlify app
2. Click "Sync Balances"
3. Should work with live Google Sheets data!

## **Troubleshooting**
- **CORS Error:** Make sure `vercel.json` is in root directory
- **API Not Found:** Check Vercel deployment logs
- **Build Error:** Ensure `package.json` has `"type": "module"`

## **Files Needed for Vercel:**
- ✅ `server.js` (your API)
- ✅ `package.json` (dependencies)
- ✅ `vercel.json` (Vercel config)
- ✅ `.gitignore` (exclude node_modules)
