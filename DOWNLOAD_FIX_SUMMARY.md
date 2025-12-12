# Media Download Headers Fix - Summary

## Problem
Downloads were failing because MovieBox requires **different headers** for actual file downloads vs metadata requests.

## Solution Implemented

### 1. Updated Media Download Headers (`backend/utils/headers.js`)

The `getMediaDownloadHeaders()` function now includes all required headers:

```javascript
{
  "Accept": "*/*",
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0",
  "Origin": "https://h5.aoneroom.com",
  "Referer": "https://fmoviesunblocked.net/",  // MUST be exactly this
  "Range": "bytes=0-",  // or specific range for resumable downloads
  "accept-language": "en-US,en;q=0.5",
  "Cookie": "account=...; i18n_lang=en"  // from metadata request
}
```

**Key Points:**
- ✅ Referer MUST be exactly `https://fmoviesunblocked.net/` (MovieBox blocks others)
- ✅ User-Agent must be Firefox Linux
- ✅ Origin must be the MovieBox host
- ✅ Cookies are required (account and i18n_lang from metadata page)

### 2. Cookie Extraction (`backend/utils/proxy.js`)

Updated `makeRequest()` to extract cookies from Set-Cookie headers:

- Extracts cookies from `response.headers['set-cookie']`
- Converts to cookie string format: `"account=...; i18n_lang=en"`
- Attaches to response as `response.cookies`

### 3. Cookie Passing in Metadata Endpoint (`backend/routes/api.js`)

Updated `/wefeed-h5-bff/web/subject/download` endpoint to:

- Extract cookies from metadata response
- Include cookies in API response as `_cookies` field
- Frontend can now pass these cookies to download endpoint

### 4. Updated Download Routes

**`/api/download`** and **`/api/download-proxy`** now:

- Accept `cookies` query parameter
- Use `getMediaDownloadHeaders()` with cookies
- Support Range headers for resumable downloads
- Log download attempts for debugging

## How It Works

1. **Metadata Request:**
   ```
   GET /wefeed-h5-bff/web/subject/download?subjectId=...&detailPath=...
   ```
   - Uses metadata headers (less strict)
   - MovieBox responds with download URLs + sets cookies
   - Backend extracts cookies and includes in response: `{ ..., _cookies: "account=...; i18n_lang=en" }`

2. **Download Request:**
   ```
   GET /api/download-proxy?url=...&cookies=account=...;i18n_lang=en
   ```
   - Uses media download headers (strict)
   - Includes cookies from metadata request
   - MovieBox allows download

## Frontend Changes Needed

The frontend needs to:

1. **Extract cookies from metadata response:**
   ```javascript
   const metadata = await fetch('/wefeed-h5-bff/web/subject/download?...');
   const data = await metadata.json();
   const cookies = data._cookies; // "account=...; i18n_lang=en"
   ```

2. **Pass cookies to download endpoint:**
   ```javascript
   const downloadUrl = `/api/download-proxy?url=${encodeURIComponent(videoUrl)}&cookies=${encodeURIComponent(cookies)}`;
   ```

## Testing

After deploying, check Railway logs for:

```
Downloading media file with headers: {
  url: '...',
  hasCookies: true,
  range: 'bytes=0-',
  referer: 'https://fmoviesunblocked.net/',
  origin: 'https://h5.aoneroom.com',
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0'
}
```

If `hasCookies: false`, cookies aren't being passed - check frontend code.

## Important Notes

- **Referer is critical:** Must be exactly `https://fmoviesunblocked.net/` (no trailing variations)
- **Cookies are required:** Without cookies, MovieBox will block downloads
- **Headers are different:** Metadata headers ≠ Download headers
- **Region matters:** Railway Singapore region fixed the 403 region errors

## Next Steps

1. ✅ Backend changes are complete
2. ⏳ Update frontend to extract and pass cookies
3. ⏳ Test downloads end-to-end
4. ⏳ Monitor Railway logs for any issues

---

**Status:** Backend is ready. Frontend needs to be updated to pass cookies to download endpoints.

