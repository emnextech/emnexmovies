# Emnexmovies

A full-featured movie download website built with Node.js/Express backend and vanilla HTML/CSS/JS frontend using Bootstrap.

## Architecture

This project uses a **hybrid architecture**:
- **Frontend**: Static HTML/CSS/JS hosted on Vercel (CDN)
- **Backend**: Node.js API server hosted on Render (handles all Moviebox API calls)

The frontend makes cross-origin API calls to the backend server, which proxies requests to the Moviebox API.

## Features

- **Search & Filter**: Search movies, TV series, and animes with filters
- **Movie Details**: View detailed information about movies and TV series
- **Download Management**: Download videos with quality selection and subtitle support
- **Progress Tracking**: Real-time download progress with speed and ETA
- **Download History**: Track completed downloads
- **Responsive Design**: Mobile-friendly interface with dark theme and green accents

## Project Structure

```
movie-website/
├── backend/          # Node.js/Express backend
│   ├── server.js     # Main server
│   ├── routes/       # API routes
│   ├── utils/        # Utility functions
│   └── config/       # Configuration
├── frontend/         # Frontend files
│   ├── index.html    # Homepage
│   ├── search.html   # Search page
│   ├── movie-detail.html  # Movie details
│   ├── downloads.html     # Download manager
│   ├── css/          # Stylesheets
│   └── js/           # JavaScript modules
└── README.md
```

## Setup Instructions

### Local Development

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080
MOVIEBOX_API_HOST=https://h5.aoneroom.com
```

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

#### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. For local development, you can either:
   - Serve files using a simple HTTP server (Python, Node.js, etc.)
   - Or configure the frontend to point to your local backend

3. To configure the API URL, add this script tag to your HTML files (before `config.js`):
```html
<script>
  window.API_BASE_URL = 'http://localhost:3000';
</script>
<script src="js/config.js"></script>
```

### Production Deployment

#### Backend Deployment (Render)

1. **Create a Render account** and connect your repository

2. **Create a new Web Service**:
   - Type: Web Service
   - Environment: Node
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`

3. **Set Environment Variables** in Render dashboard:
   ```
   NODE_ENV=production
   PORT=10000
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   MOVIEBOX_API_HOST=https://h5.aoneroom.com
   ```

4. **Deploy** - Render will automatically deploy from your repository

5. **Note your backend URL** (e.g., `https://movie-website-backend.onrender.com`)

#### Frontend Deployment (Vercel)

1. **Connect your repository** to Vercel

2. **Configure build settings**:
   - Framework Preset: Other
   - Root Directory: `frontend`
   - Build Command: (leave empty - static site)
   - Output Directory: `.` (current directory)

3. **Set Environment Variables** in Vercel dashboard:
   - Go to Project Settings > Environment Variables
   - Add `VITE_API_BASE_URL` with your Render backend URL:
     ```
     VITE_API_BASE_URL=https://movie-website-backend.onrender.com
     ```

4. **Alternative: Set API URL in HTML**
   - If environment variables don't work, add this to all HTML files (before `config.js`):
   ```html
   <script>
     window.API_BASE_URL = 'https://your-backend-url.onrender.com';
   </script>
   ```

5. **Deploy** - Vercel will automatically deploy your static frontend

6. **Update Backend CORS**: After deploying frontend, update `ALLOWED_ORIGINS` in Render with your Vercel frontend URL

## API Endpoints

### Backend API Routes

All endpoints are prefixed with the backend base URL (e.g., `https://your-backend.onrender.com`)

**Home & Search:**
- `GET /wefeed-h5-bff/web/home` - Homepage content
- `POST /wefeed-h5-bff/web/subject/search` - Search movies/TV series
- `POST /wefeed-h5-bff/web/subject/search-suggest` - Search suggestions
- `GET /wefeed-h5-bff/web/subject/trending` - Trending content
- `GET /wefeed-h5-bff/web/subject/everyone-search` - Popular searches
- `GET /wefeed-h5-bff/web/subject/search-rank` - Hot content rankings

**Movie Details:**
- `GET /api/movie/:subjectId?detailPath=...` - Movie details (parses HTML)
- `GET /wefeed-h5-bff/web/subject/download?subjectId=...&detailPath=...` - Download URLs
- `GET /wefeed-h5-bff/web/subject/play?subjectId=...&detailPath=...` - Streaming URLs
- `GET /wefeed-h5-bff/web/subject/detail-rec?subjectId=...` - Recommendations

**Downloads:**
- `GET /api/download?url=...&filename=...` - Download video file (proxy)
- `GET /api/download-subtitle?url=...&filename=...` - Download subtitle file

**Health:**
- `GET /health` - Health check endpoint

## Usage

1. **Search**: Use the search bar on the homepage or search page to find movies/TV series
2. **View Details**: Click on any movie card to view details
3. **Download**: Select quality and subtitle language, then click Download
4. **Manage Downloads**: View active downloads and history on the Downloads page

## Environment Variables

### Backend (.env)

```env
PORT=3000                          # Server port
NODE_ENV=development               # Environment (development/production)
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app  # CORS allowed origins (comma-separated)
MOVIEBOX_API_HOST=https://h5.aoneroom.com  # Moviebox API host
```

### Frontend

Set via HTML script tag or Vercel environment variable:
- `window.API_BASE_URL` or `VITE_API_BASE_URL` - Backend API base URL

## Technologies Used

- **Backend**: Node.js, Express, Axios, Cheerio
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3
- **Styling**: Custom dark theme with green accents
- **Hosting**: Vercel (Frontend), Render (Backend)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

