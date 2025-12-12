# Complete Railway Deployment Guide

This guide will walk you through deploying your backend to Railway step-by-step.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Railway Account Setup](#railway-account-setup)
3. [Project Preparation](#project-preparation)
4. [Deploying to Railway](#deploying-to-railway)
5. [Environment Variables Configuration](#environment-variables-configuration)
6. [Connecting Frontend to Backend](#connecting-frontend-to-backend)
7. [Troubleshooting](#troubleshooting)
8. [Monitoring & Logs](#monitoring--logs)

---

## Prerequisites

Before starting, make sure you have:
- ✅ A GitHub account
- ✅ Your project pushed to a GitHub repository
- ✅ Node.js installed locally (for testing)
- ✅ Your frontend deployed (Vercel or other)

---

## Railway Account Setup

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"** or **"Login"**
3. Sign up using one of these methods:
   - **GitHub** (Recommended - easiest integration)
   - Email
   - Google

### Step 2: Verify Your Account

- Check your email and verify your account if required
- Complete any onboarding steps Railway provides

---

## Project Preparation

### Step 1: Verify Your Project Structure

Your project should have this structure:
```
movie-website/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── routes/
│   ├── utils/
│   └── config/
├── frontend/
└── railway.json (we'll create this)
```

### Step 2: Check Backend package.json

Make sure your `backend/package.json` has:
- ✅ A `start` script: `"start": "node server.js"`
- ✅ All dependencies listed (express, axios, cors, dotenv, cheerio)

### Step 3: Create railway.json (Optional but Recommended)

Railway can auto-detect Node.js projects, but a `railway.json` file helps with configuration:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && npm install"
  },
  "deploy": {
    "startCommand": "cd backend && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Note:** Railway will auto-detect your Node.js app, so this file is optional. Railway is smart enough to find your `backend/` folder and run `npm start`.

---

## Deploying to Railway

### Method 1: Deploy from GitHub (Recommended)

#### Step 1: Create New Project

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Authorize Railway to access your GitHub if prompted
4. Select your repository: `movie-website` (or your repo name)
5. Click **"Deploy Now"**

#### Step 2: Configure Service

Railway will auto-detect your project. You need to configure it:

1. **Click on your service** (it will be named after your repo)
2. Go to **Settings** tab
3. Configure the following:

   **Root Directory:**
   - Set to: `backend`
   - This tells Railway where your Node.js app is

   **Start Command:**
   - Should auto-detect: `npm start`
   - If not, set it to: `npm start`

   **Build Command:**
   - Should auto-detect: `npm install`
   - If not, set it to: `npm install`

#### Step 3: Set Environment Variables

1. Go to the **Variables** tab in your service
2. Click **"New Variable"** and add each of these:

   ```
   NODE_ENV=production
   ```

   ```
   PORT=3000
   ```
   (Railway will automatically set PORT, but you can set it explicitly)

   ```
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```
   Replace `your-frontend.vercel.app` with your actual Vercel frontend URL

   ```
   MOVIEBOX_API_HOST=https://h5.aoneroom.com
   ```

3. Click **"Add"** after each variable

#### Step 4: Deploy

1. Railway will automatically start building and deploying
2. Watch the **Deployments** tab to see the build progress
3. Wait for deployment to complete (usually 2-5 minutes)

#### Step 5: Get Your Backend URL

1. Once deployed, go to the **Settings** tab
2. Scroll down to **"Domains"** section
3. Railway automatically generates a domain like: `your-service-name.up.railway.app`
4. **Copy this URL** - you'll need it for your frontend

**OR** you can create a custom domain:
- Click **"Generate Domain"** or **"Custom Domain"**
- Railway will give you a URL like: `movie-backend-production.up.railway.app`

---

### Method 2: Deploy via Railway CLI

If you prefer using the command line:

#### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

#### Step 2: Login

```bash
railway login
```

This will open your browser to authenticate.

#### Step 3: Initialize Project

```bash
cd backend
railway init
```

Follow the prompts to create a new project or link to existing.

#### Step 4: Set Environment Variables

```bash
railway variables set NODE_ENV=production
railway variables set ALLOWED_ORIGINS=https://your-frontend.vercel.app
railway variables set MOVIEBOX_API_HOST=https://h5.aoneroom.com
```

#### Step 5: Deploy

```bash
railway up
```

This will deploy your backend to Railway.

---

## Environment Variables Configuration

### Required Environment Variables

Add these in Railway dashboard under **Variables** tab:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `3000` | Server port (Railway sets this automatically, but you can override) |
| `ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` | Comma-separated list of allowed CORS origins |
| `MOVIEBOX_API_HOST` | `https://h5.aoneroom.com` | Moviebox API host URL |

### Setting Multiple Origins

If you want to allow multiple origins (e.g., localhost for testing + production):

```
ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000,http://localhost:5173
```

**Note:** Separate multiple origins with commas (no spaces).

---

## Connecting Frontend to Backend

### Step 1: Get Your Railway Backend URL

1. In Railway dashboard, go to your service
2. Go to **Settings** → **Domains**
3. Copy your Railway URL (e.g., `https://movie-backend-production.up.railway.app`)

### Step 2: Update Frontend Configuration

You have two options:

#### Option A: Update Frontend JavaScript Config

1. Open `frontend/js/config.js`
2. Update the API base URL:

```javascript
const API_BASE_URL = 'https://your-railway-url.up.railway.app';
```

#### Option B: Use Environment Variable (Vercel)

1. In Vercel dashboard, go to your project
2. Go to **Settings** → **Environment Variables**
3. Add:
   - **Name:** `VITE_API_BASE_URL` (or `API_BASE_URL`)
   - **Value:** `https://your-railway-url.up.railway.app`
4. Redeploy your frontend

### Step 3: Update Backend CORS

1. In Railway dashboard, go to **Variables**
2. Update `ALLOWED_ORIGINS` to include your frontend URL:
   ```
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```
3. Railway will automatically redeploy with the new variable

### Step 4: Test the Connection

1. Visit your frontend URL
2. Open browser DevTools (F12) → Network tab
3. Try searching for a movie
4. Check if API calls are going to your Railway backend
5. Look for any CORS errors in the console

---

## Troubleshooting

### Issue 1: Build Fails

**Error:** `npm install` fails or build times out

**Solutions:**
- Check that `backend/package.json` has all dependencies
- Ensure Node.js version is compatible (Railway uses Node 18+ by default)
- Check build logs in Railway dashboard → **Deployments** tab

### Issue 2: Service Crashes on Start

**Error:** Service starts then immediately crashes

**Solutions:**
1. Check logs: Railway dashboard → **Deployments** → Click on latest deployment → **View Logs**
2. Common issues:
   - Missing environment variables
   - Port configuration (Railway sets PORT automatically, don't hardcode it)
   - Missing dependencies

### Issue 3: 403 "Invalid Region" Error

**Error:** Still getting 403 errors from Moviebox API

**Solutions:**
1. **Try different regions:**
   - Railway allows you to select deployment region
   - Go to **Settings** → **Region**
   - Try: US East, US West, or Europe regions

2. **Check API host:**
   - Try different mirror hosts in `MOVIEBOX_API_HOST`:
     - `https://movieboxapp.in`
     - `https://moviebox.pk`
     - `https://moviebox.ph`

### Issue 4: CORS Errors

**Error:** `Access-Control-Allow-Origin` errors in browser

**Solutions:**
1. Verify `ALLOWED_ORIGINS` includes your exact frontend URL (with `https://`)
2. No trailing slashes in the URL
3. Check that Railway service is running (green status)
4. Restart the service: **Settings** → **Restart**

### Issue 5: Timeout Errors

**Error:** Requests timing out

**Solutions:**
- Railway free tier has some limits, but should handle normal API requests
- Check Railway dashboard for service status
- Verify your backend is responding: Visit `https://your-railway-url.up.railway.app/health`

### Issue 6: Can't Find Backend Files

**Error:** Railway can't find `server.js` or `package.json`

**Solutions:**
1. Set **Root Directory** to `backend` in Railway settings
2. Or create `railway.json` in root with proper configuration
3. Ensure your files are committed to GitHub

---

## Monitoring & Logs

### Viewing Logs

1. In Railway dashboard, click on your service
2. Go to **Deployments** tab
3. Click on the latest deployment
4. Click **"View Logs"** to see:
   - Build logs
   - Runtime logs
   - Error messages

### Real-time Logs

1. Go to your service dashboard
2. Click **"View Logs"** button (top right)
3. See real-time console output from your backend

### Health Check

Your backend has a health endpoint:
```
GET https://your-railway-url.up.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-12T00:00:00.000Z",
  "service": "movie-website-backend",
  "version": "1.0.0"
}
```

### Monitoring Service Status

- **Green dot** = Service is running
- **Yellow dot** = Service is deploying/restarting
- **Red dot** = Service has crashed (check logs)

---

## Railway Pricing & Limits

### Free Tier (Hobby Plan)

- ✅ $5 free credit per month
- ✅ Unlimited deployments
- ✅ 500 hours of usage (enough for 24/7 small apps)
- ✅ Automatic HTTPS
- ✅ Custom domains
- ⚠️ Services sleep after 5 minutes of inactivity (wake up on first request)

### Paid Plans

- **Developer:** $5/month - No sleep, more resources
- **Team:** $20/month - Team collaboration features

**Note:** For production, consider upgrading to prevent sleep delays.

---

## Updating Your Deployment

### Automatic Deployments

Railway automatically deploys when you push to your GitHub repository's main branch.

### Manual Deployments

1. Go to **Deployments** tab
2. Click **"Redeploy"** on any previous deployment
3. Or push a new commit to trigger deployment

### Rolling Back

1. Go to **Deployments** tab
2. Find a previous successful deployment
3. Click **"Redeploy"** to roll back

---

## Next Steps

After successful deployment:

1. ✅ Test all API endpoints from your frontend
2. ✅ Monitor logs for any errors
3. ✅ Set up a custom domain (optional)
4. ✅ Consider upgrading to prevent sleep (for production)
5. ✅ Set up monitoring/alerts (optional)

---

## Quick Reference

### Railway Dashboard URLs

- **Dashboard:** https://railway.app/dashboard
- **Documentation:** https://docs.railway.app
- **Status Page:** https://status.railway.app

### Common Commands (CLI)

```bash
# Login
railway login

# Link project
railway link

# View logs
railway logs

# Set variable
railway variables set KEY=value

# Deploy
railway up
```

### Support

- **Railway Discord:** https://discord.gg/railway
- **Railway Docs:** https://docs.railway.app
- **GitHub Issues:** Check your repo for issues

---

## Summary Checklist

- [ ] Created Railway account
- [ ] Connected GitHub repository
- [ ] Created new project in Railway
- [ ] Set Root Directory to `backend`
- [ ] Set environment variables (NODE_ENV, ALLOWED_ORIGINS, MOVIEBOX_API_HOST)
- [ ] Deployed successfully
- [ ] Got Railway backend URL
- [ ] Updated frontend to use Railway URL
- [ ] Tested API connection
- [ ] Verified health endpoint works
- [ ] Checked logs for errors

---

**Congratulations!** Your backend should now be running on Railway! 🚀

If you encounter any issues, check the Troubleshooting section or Railway's documentation.

