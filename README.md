# Emnexmovies

A full-featured movie download website built with Node.js/Express backend and vanilla HTML/CSS/JS frontend using Bootstrap.

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

### Backend Setup

1. Navigate to the backend directory:
```bash
cd movie-website/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (already created with defaults):
```env
PORT=3000
MOVIEBOX_API_HOST=https://h5.aoneroom.com
NODE_ENV=development
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

### Frontend

The frontend is served as static files by the Express server. Simply open `http://localhost:3000` in your browser after starting the backend server.

## API Endpoints

### Backend API Routes

- `GET /api/home` - Homepage content
- `POST /api/search` - Search movies/TV series
- `POST /api/search-suggest` - Search suggestions
- `GET /api/trending` - Trending content
- `GET /api/popular-searches` - Popular searches
- `GET /api/hot-content` - Hot content rankings
- `GET /api/movie/:subjectId` - Movie details
- `GET /api/download-metadata/:subjectId` - Download URLs
- `GET /api/recommendations/:subjectId` - Recommendations
- `GET /api/download` - Download video file
- `GET /api/download-subtitle` - Download subtitle file

## Usage

1. **Search**: Use the search bar on the homepage or search page to find movies/TV series
2. **View Details**: Click on any movie card to view details
3. **Download**: Select quality and subtitle language, then click Download
4. **Manage Downloads**: View active downloads and history on the Downloads page

## Technologies Used

- **Backend**: Node.js, Express, Axios, Cheerio
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3
- **Styling**: Custom dark theme with green accents

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

