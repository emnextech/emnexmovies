# Quick Fix: "can't cd to backend" Error

## The Problem

You're seeing this error:
```
sh: 1: cd: can't cd to backend
ERROR: failed to build: failed to solve: process "sh -c cd backend && npm install" did not complete successfully
```k

**This means Railway is still using `cd backend && npm install` in the Build Command.**

## The Solution (Must Do in Railway Dashboard)

### Step 1: Set Root Directory in Railway Dashboard

1. Go to your Railway dashboard
2. Click on your service (the one that's failing)
3. Go to **Settings** tab
4. Scroll down to find **"Root Directory"** section
5. **Set it to:** `backend` (type exactly: `backend` without quotes)
6. Click **Save** or it will auto-save

### Step 2: Fix Build Command

1. Still in **Settings** tab
2. Find **"Build Command"** section
3. **You probably see:** `cd backend && npm install` ❌
4. **Change it to:** `npm install` ✅
   - Delete everything and type just: `npm install`
   - Remove `cd backend &&` completely

### Step 3: Fix Start Command

1. Still in **Settings** tab
2. Find **"Start Command"** section
3. **You probably see:** `cd backend && npm start` ❌
4. **Change it to:** `npm start` ✅
   - Delete everything and type just: `npm start`
   - Remove `cd backend &&` completely
5. Settings should auto-save

### Step 4: Redeploy

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Or push a new commit to trigger a new deployment

## Why This Happens

- Railway was trying to run `cd backend && npm install` from the project root
- But Railway needs to know that your app is in the `backend/` folder
- Setting **Root Directory** to `backend` tells Railway: "treat the backend folder as the root"
- Once Root Directory is set, Railway is already "inside" the backend folder, so you don't need `cd backend`

## Verification

After redeploying, check the build logs. You should see:
- ✅ `npm install` running successfully
- ✅ `npm start` running successfully
- ✅ No more "can't cd to backend" errors

## Still Having Issues?

If it still fails after these steps:

1. **Delete railway.json** (if it exists) - Railway will use dashboard settings instead
2. **Check that backend/package.json exists** in your repository
3. **Verify Root Directory is exactly `backend`** (lowercase, no quotes, no trailing slash)

---

**That's it!** This should fix your deployment. 🚀

