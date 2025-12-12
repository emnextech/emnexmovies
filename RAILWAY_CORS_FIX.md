# Fix CORS Error on Railway

Your backend is running, but you're getting CORS errors. Here's how to fix it.

## The Problem

You're seeing errors like:
```
Error: Not allowed by CORS
```

This happens when the frontend origin doesn't match what's configured in `ALLOWED_ORIGINS`.

## Quick Fix

### Step 1: Update ALLOWED_ORIGINS in Railway

1. Go to Railway dashboard → Your service → **Variables** tab
2. Find `ALLOWED_ORIGINS` variable
3. Make sure it's set to your exact frontend URL:
   ```
   https://emnexmovies.vercel.app
   ```
   - **No trailing slash** (no `/` at the end)
   - **Include `https://`**
   - **Exact match** with your Vercel domain

### Step 2: Add Multiple Origins (Optional)

If you want to allow multiple origins (e.g., for testing), separate them with commas:
```
https://emnexmovies.vercel.app,http://localhost:3000,http://localhost:5173
```
**No spaces** between origins, just commas.

### Step 3: Redeploy Backend

1. The CORS code has been improved to handle trailing slashes and log better
2. Push your changes to GitHub (the updated `backend/server.js`)
3. Railway will auto-deploy, or manually redeploy from Railway dashboard

### Step 4: Verify

After redeploying, check the Railway logs. You should see:
```
CORS: Allowing origin: https://emnexmovies.vercel.app
```

If you see:
```
CORS: Blocked origin: ...
CORS: Allowed origins: ...
```
Then the origin doesn't match - double-check the `ALLOWED_ORIGINS` variable.

## Common Issues

### Issue 1: Trailing Slash
- ❌ Wrong: `https://emnexmovies.vercel.app/`
- ✅ Correct: `https://emnexmovies.vercel.app`

### Issue 2: Missing Protocol
- ❌ Wrong: `emnexmovies.vercel.app`
- ✅ Correct: `https://emnexmovies.vercel.app`

### Issue 3: HTTP vs HTTPS
- Make sure you use `https://` (not `http://`) for production

### Issue 4: Different Domain
- If your Vercel domain is different, update `ALLOWED_ORIGINS` to match exactly

## Test CORS

You can test if CORS is working by:

1. **Open browser DevTools** on your frontend
2. **Go to Network tab**
3. **Make a request** (search for a movie, etc.)
4. **Check the request headers:**
   - Look for `Origin: https://emnexmovies.vercel.app`
   - Check response headers for `Access-Control-Allow-Origin`

## After Fixing

Once CORS is fixed, your frontend should be able to make API requests to your Railway backend successfully!

---

**Note:** The updated CORS code will now:
- Normalize origins (handle trailing slashes)
- Log which origins are being allowed/blocked
- Provide better error messages

This will help debug any future CORS issues.

