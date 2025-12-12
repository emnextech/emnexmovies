/**
 * Main Application Logic
 * Initializes the application and handles global state
 */

/**
 * Initialize navbar active state
 */
function initNavbarActiveState() {
  const path = window.location.pathname;
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href) {
      if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        if (href.includes('index.html') || href === '/' || href === 'index.html') {
          link.classList.add('active');
        }
      } else if (path.includes('trending.html')) {
        if (href.includes('trending.html')) {
          link.classList.add('active');
        }
      }
    }
  });
}

/**
 * Initialize application
 */
function initApp() {
  console.log('initApp called');
  
  // Check if ui object is available
  if (typeof ui === 'undefined') {
    console.error('ui object is not defined! Make sure ui.js is loaded before main.js');
    return;
  }
  
  // Check if api object is available
  if (typeof api === 'undefined') {
    console.error('api object is not defined! Make sure api.js is loaded before main.js');
    return;
  }
  
  // Initialize toast container
  ui.createToastContainer();

  // Initialize based on current page
  const path = window.location.pathname;
  console.log('Current path:', path);
  
  if (path.includes('search.html')) {
    // Search page is initialized by search.js
    console.log('Search page initialized');
  } else if (path.includes('movie-detail.html')) {
    // Movie detail page
    initMovieDetailPage();
  } else {
    // Homepage
    initHomePage();
  }
}

/**
 * Initialize homepage
 */
async function initHomePage() {
  console.log('initHomePage called');
  const mainContainer = document.getElementById('home-sections');
  
  if (!mainContainer) {
    console.error('Home sections container not found');
    return;
  }

  // Initialize navbar active state
  initNavbarActiveState();

  ui.showLoading(mainContainer, 'home');

  try {
    console.log('Calling api.home()...');
    // Fetch home data
    const response = await api.home();
    console.log('API response received:', response);
    
    // Handle both direct response and nested data structure
    const homeData = response.data || response;
    console.log('Home data:', homeData);
    
    // Clear loading
    mainContainer.innerHTML = '';
    
    // Parse and render operating list sections
    const operatingList = homeData.operatingList || [];
    console.log('Operating list length:', operatingList.length);
    
    if (operatingList.length === 0) {
      console.warn('No operating list items found');
      ui.showEmptyState(mainContainer, 'No content available');
      return;
    }

    // Render each section (including BANNER as hero section below navbar)
    operatingList.forEach((section, index) => {
      console.log(`Rendering section ${index}:`, section.type);
      renderHomeSection(section, mainContainer, index);
    });
  } catch (error) {
    console.error('Error loading home content:', error);
    console.error('Error stack:', error.stack);
    // Redirect to 404 page on any error
    window.location.href = '404.html';
  }
}

/**
 * Render a home section based on its type
 * @param {Object} section - Section data from operatingList
 * @param {HTMLElement} container - Container element
 * @param {number} index - Section index
 */
function renderHomeSection(section, container, index) {
  const { type, title, subjects = [], banner, url } = section;

  // Skip empty sections
  if (type === 'BANNER' && (!banner || !banner.items || banner.items.length === 0)) {
    return;
  }
  if ((type === 'SUBJECTS_MOVIE' || type === 'RANKING_LIST' || type === 'SUBJECTS') && (!subjects || subjects.length === 0)) {
    return;
  }

  let sectionHTML = '';

  if (type === 'BANNER') {
    // Render banner carousel
    sectionHTML = renderBannerSection(title, banner.items);
  } else if (type === 'SUBJECTS_MOVIE' || type === 'RANKING_LIST') {
    // Render movie grid section
    sectionHTML = renderMovieSection(title, subjects);
  } else if (type === 'CUSTOM') {
    // Skip custom sections for now or handle them
    return;
  } else {
    // Default: try to render as movie section if it has subjects
    if (subjects && subjects.length > 0) {
      sectionHTML = renderMovieSection(title || 'Content', subjects);
    } else {
      return; // Skip unknown empty sections
    }
  }

  if (sectionHTML) {
    container.insertAdjacentHTML('beforeend', sectionHTML);
    
    // Initialize banner carousel if it's a banner section
    if (type === 'BANNER') {
      const sectionElement = container.lastElementChild;
      if (sectionElement) {
        const carouselElement = sectionElement.querySelector('.carousel');
        if (carouselElement && carouselElement.id) {
          // Use setTimeout to ensure DOM is ready
          setTimeout(() => {
            initializeBannerCarousel(carouselElement.id);
          }, 100);
        }
      }
    }
    
    // Add click handlers for movie cards in this section
    const sectionElement = container.lastElementChild;
    if (sectionElement) {
      sectionElement.querySelectorAll('.movie-card').forEach(card => {
        card.addEventListener('click', () => {
          const subjectId = card.dataset.subjectId;
          const detailPath = card.dataset.detailPath;
          if (subjectId && detailPath) {
            window.location.href = `movie-detail.html?id=${subjectId}&path=${encodeURIComponent(detailPath)}`;
          }
        });
      });
    }
  }
}

/**
 * Render banner carousel section
 * @param {string} title - Section title
 * @param {Array} items - Banner items
 * @returns {string} HTML string
 */
function renderBannerSection(title, items) {
  if (!items || items.length === 0) return '';

  const carouselId = `banner-carousel-${Date.now()}`;
  const indicators = items.map((item, index) => 
    `<button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${index}" ${index === 0 ? 'class="active" aria-current="true"' : ''}></button>`
  ).join('');

  const slides = items.map((item, index) => {
    let image = item.image?.url || item.subject?.cover?.url || '/assets/images/placeholder.jpg';
    // Optimize banner images (use larger size for banners, but still compress)
    if (image.includes('pbcdnw.aoneroom.com')) {
      const separator = image.includes('?') ? '&' : '?';
      image = `${image}${separator}x-oss-process=image/resize,w_1200,q_85`;
    }
    
    const subjectTitle = item.subject?.title || item.title || 'Unknown';
    const subjectId = item.subjectId || item.subject?.subjectId;
    // Extract detailPath from item, subject, or URL
    let detailPath = item.detailPath || item.subject?.detailPath;
    if (!detailPath && item.url) {
      // Extract from URL like "https://h5.aoneroom.com/detail/predator-badlands-wSfXqLvQrD1"
      const urlMatch = item.url.match(/\/detail\/([^\/\?]+)/);
      if (urlMatch) {
        detailPath = urlMatch[1];
      }
    }
    
    return `
      <div class="carousel-item ${index === 0 ? 'active' : ''}">
        <div class="banner-slide" style="background-image: url('${image}');">
          <div class="banner-overlay">
            <div class="container">
              <div class="banner-content">
                <h2 class="banner-title">${subjectTitle}</h2>
                ${item.subject?.description ? `<p class="banner-description">${item.subject.description.substring(0, 150)}...</p>` : ''}
                ${subjectId && detailPath ? `
                  <a href="movie-detail.html?id=${subjectId}&path=${encodeURIComponent(detailPath)}" class="btn btn-primary btn-lg">
                    <i class="bi bi-play-circle"></i> View Details
                  </a>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <section class="banner-section hero-section mb-5">
      <div id="${carouselId}" class="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="3000" data-bs-wrap="true" data-bs-pause="false">
        <div class="carousel-indicators">
          ${indicators}
        </div>
        <div class="carousel-inner">
          ${slides}
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </section>
  `;
}

/**
 * Render movie grid section
 * @param {string} title - Section title
 * @param {Array} subjects - Movie subjects array
 * @returns {string} HTML string
 */
function renderMovieSection(title, subjects) {
  if (!subjects || subjects.length === 0) return '';
  
  // Helper function to check for English audio
  const hasEnglishAudio = (item) => {
    const title = (item.title || '').toLowerCase();
    const corner = (item.corner || '').toLowerCase();
    return title.includes('[english]') || corner.includes('english');
  };
  
  const cards = subjects.map(subject => {
    let poster = subject.cover?.url || subject.poster || '/assets/images/placeholder.jpg';
    // Optimize image URL for thumbnails
    if (poster.includes('pbcdnw.aoneroom.com')) {
      const separator = poster.includes('?') ? '&' : '?';
      poster = `${poster}${separator}x-oss-process=image/resize,w_300,q_80`;
    }
    
    const subjectTitle = subject.title || 'Unknown';
    const year = subject.releaseDate ? new Date(subject.releaseDate).getFullYear() : '';
    const type = subject.subjectType === 2 ? 'TV Series' : 'Movie';
    const subjectId = subject.subjectId || subject.id;
    const detailPath = subject.detailPath || '';
    
    // Extract IMDB rating
    const imdbRating = subject.imdbRatingValue || subject.imdbRate || null;
    const imdbCount = subject.imdbRatingCount || null;
    const imdbDisplay = imdbRating ? parseFloat(imdbRating).toFixed(1) : null;
    
    // Check for English audio
    const hasEnglish = hasEnglishAudio(subject);
    
    return `
      <div class="card movie-card" data-subject-id="${subjectId}" data-detail-path="${detailPath}">
        <div class="position-relative movie-card-image-wrapper">
          <img 
            src="${poster}" 
            class="card-img-top movie-card-image" 
            alt="${subjectTitle}" 
            loading="lazy" 
            decoding="async"
            onerror="if (!this.dataset.failed) { this.dataset.failed = 'true'; if (this.src !== '/assets/images/placeholder.jpg') { this.src = '/assets/images/placeholder.jpg'; this.classList.add('loaded'); this.parentElement.classList.add('image-loaded'); } else { this.style.display = 'none'; } }"
            onload="this.classList.add('loaded'); this.parentElement.classList.add('image-loaded');"
          >
          ${imdbDisplay ? `<span class="imdb-rating-badge">
            <i class="bi bi-star-fill"></i> ${imdbDisplay}
            ${imdbCount ? `<small>(${ui.formatNumber(imdbCount)})</small>` : ''}
          </span>` : ''}
          ${hasEnglish ? `<span class="english-audio-badge">
            <i class="bi bi-volume-up-fill"></i> EN
          </span>` : ''}
        </div>
        <div class="card-body">
          <h5 class="card-title movie-card-title">${subjectTitle}</h5>
          <div class="card-meta">
            ${year ? `<span class="card-year">${year}</span>` : ''}
            <span class="card-type">${type}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <section class="movie-section mb-5">
      <div class="section-header">
        <h2 class="section-title">${title || 'Content'}</h2>
      </div>
      <div class="movie-grid">
        ${cards}
      </div>
    </section>
  `;
}

/**
 * Render banner in navbar
 * @param {Array} items - Banner items
 */
function renderNavbarBanner(items) {
  if (!items || items.length === 0) return;
  
  const navbarBanner = document.getElementById('navbar-banner');
  if (!navbarBanner) return;
  
  const carouselId = `navbar-banner-carousel-${Date.now()}`;
  const indicators = items.map((item, index) => 
    `<button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${index}" ${index === 0 ? 'class="active" aria-current="true"' : ''}></button>`
  ).join('');

  const slides = items.slice(0, 5).map((item, index) => {
    let image = item.image?.url || item.subject?.cover?.url || '/assets/images/placeholder.jpg';
    if (image.includes('pbcdnw.aoneroom.com')) {
      const separator = image.includes('?') ? '&' : '?';
      image = `${image}${separator}x-oss-process=image/resize,w_400,q_85`;
    }
    
    const subjectId = item.subjectId || item.subject?.subjectId;
    let detailPath = item.detailPath || item.subject?.detailPath;
    if (!detailPath && item.url) {
      const urlMatch = item.url.match(/\/detail\/([^\/\?]+)/);
      if (urlMatch) {
        detailPath = urlMatch[1];
      }
    }
    
    return `
      <div class="carousel-item ${index === 0 ? 'active' : ''}">
        <div class="banner-slide" style="background-image: url('${image}');">
          ${subjectId && detailPath ? `
            <a href="movie-detail.html?id=${subjectId}&path=${encodeURIComponent(detailPath)}" class="stretched-link"></a>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  navbarBanner.innerHTML = `
    <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel" data-bs-interval="4000">
      <div class="carousel-inner">
        ${slides}
      </div>
      ${items.length > 1 ? `
        <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
        <div class="carousel-indicators">
          ${indicators}
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Initialize banner carousel
 * @param {string} carouselId - Carousel element ID
 */
function initializeBannerCarousel(carouselId) {
  const carouselElement = document.getElementById(carouselId);
  if (carouselElement && typeof bootstrap !== 'undefined') {
    // Initialize carousel with custom options for auto-loop every 3 seconds
    const carousel = new bootstrap.Carousel(carouselElement, {
      interval: 3000,
      wrap: true,
      pause: false,
      ride: 'carousel'
    });
    
    // Ensure carousel continues looping
    carouselElement.addEventListener('slid.bs.carousel', function () {
      // Carousel has slid, ensure it continues
    });
  }
}

/**
 * Initialize movie detail page
 */
async function initMovieDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const subjectId = urlParams.get('id');
  const detailPath = urlParams.get('path');

  if (!subjectId || !detailPath) {
    ui.showToast('Invalid movie ID or path', 'error');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
    return;
  }

  const detailContainer = document.getElementById('movie-detail');
  if (!detailContainer) return;

  ui.showLoading(detailContainer, 'detail');

  try {
    // Fetch movie details
    const movieData = await api.getMovieDetails(subjectId, detailPath);
    
    // Render movie details
    renderMovieDetails(movieData);

    // Load recommendations
    loadRecommendations(subjectId);
  } catch (error) {
    console.error('Error loading movie details:', error);
    // Redirect to 404 page on any error
    window.location.href = '404.html';
  }
}

/**
 * Render movie details
 * @param {Object} movieData - Movie data from API
 */
function renderMovieDetails(movieData) {
  const container = document.getElementById('movie-detail');
  if (!container) return;

  // Extract data (structure may vary)
  const resData = movieData.resData || movieData;
  const metadata = resData.metadata || {};
  const subject = resData.subject || {};
  const stars = resData.stars || [];

  const title = metadata.title || subject.title || 'Unknown';
  // Extract cover image - check multiple possible locations
  let poster = '/assets/images/placeholder.jpg';
  if (subject.cover && typeof subject.cover === 'object' && subject.cover.url) {
    poster = subject.cover.url;
  } else if (subject.cover && typeof subject.cover === 'string') {
    poster = subject.cover;
  } else if (metadata.image && typeof metadata.image === 'object' && metadata.image.url) {
    poster = metadata.image.url;
  } else if (metadata.image && typeof metadata.image === 'string') {
    poster = metadata.image;
  } else if (metadata.poster) {
    poster = metadata.poster;
  } else if (subject.poster) {
    poster = subject.poster;
  }
  // Get description - try multiple sources for more complete description
  let description = metadata.description || subject.description || '';
  
  // Try to get extended description from other sources
  const extendedDesc = subject.extendedDescription || metadata.extendedDescription || 
                       subject.fullDescription || metadata.fullDescription ||
                       subject.plot || metadata.plot ||
                       subject.synopsis || metadata.synopsis ||
                       subject.story || metadata.story ||
                       subject.summary || metadata.summary || '';
  
  // Combine descriptions if we have both
  if (extendedDesc && description) {
    // If extended description is different and longer, use it
    if (extendedDesc.length > description.length && !description.includes(extendedDesc.substring(0, 50))) {
      description = extendedDesc;
    } else if (extendedDesc && !description.includes(extendedDesc)) {
      // Append extended description if it adds new information
      description = `${description} ${extendedDesc}`;
    }
  } else if (extendedDesc) {
    description = extendedDesc;
  }
  
  // If description is still short, try postTitle as fallback
  if (!description || description.length < 30) {
    description = subject.postTitle || metadata.postTitle || description || 'No description available';
  }
  
  // Clean up description - remove "all in Moviebox Official" suffix if present
  description = description.replace(/\s*all in Moviebox Official\s*$/i, '').trim();
  
  // Ensure we have a description
  if (!description || description === 'No description available') {
    description = 'No description available';
  }
  const releaseDate = subject.releaseDate || metadata.releaseDate;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const releaseDateFormatted = releaseDate ? new Date(releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const duration = subject.duration || metadata.duration;
  let genres = subject.genres || metadata.genres || [];
  // Handle genres as string (comma-separated)
  if (typeof genres === 'string') {
    genres = genres.split(',').map(g => g.trim()).filter(g => g);
  }
  const countryName = subject.countryName || metadata.countryName || '';
  const postTitle = subject.postTitle || metadata.postTitle || '';
  const keywords = metadata.keyWords || metadata.keywords || subject.keywords || '';
  const keywordsList = keywords ? (typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()) : keywords) : [];
  const trailer = subject.trailer || metadata.trailer || null;
  const stills = subject.stills || metadata.stills || null;
  const resource = resData.resource || {};
  const source = resource.source || '';
  const uploadBy = resource.uploadBy || '';
  
  // Handle stars - check if it's an array of objects with name/character/avatarUrl
  let castList = stars || [];
  if (castList.length === 0 && subject.staffList) {
    castList = subject.staffList;
  }

  // Check if it's a TV series
  const seasons = resData.resource?.seasons || [];
  const isTVSeries = seasons.length > 0;

  // Optimize poster for detail page (use medium size for card)
  let optimizedPoster = poster;
  if (poster.includes('pbcdnw.aoneroom.com')) {
    const separator = poster.includes('?') ? '&' : '?';
    optimizedPoster = `${poster}${separator}x-oss-process=image/resize,w_600,q_85`;
  }
  
  // Get backdrop image (full poster for hero background)
  let backdropImage = poster;
  if (poster.includes('pbcdnw.aoneroom.com')) {
    const separator = poster.includes('?') ? '&' : '?';
    backdropImage = `${poster}${separator}x-oss-process=image/resize,w_1920,q_80`;
  }
  
  // Get IMDb rating
  const imdbRating = subject.imdbRatingValue || metadata.imdbRatingValue || movieData.imdbRating;
  const imdbCount = subject.imdbRatingCount || metadata.imdbRatingCount || movieData.imdbRatingCount;
  const imdbDisplay = imdbRating ? parseFloat(imdbRating).toFixed(1) : null;
  
  container.innerHTML = `
    <!-- Hero Section -->
    <div class="movie-hero-section" style="background-image: url('${backdropImage}');">
      <div class="hero-overlay"></div>
      <div class="hero-gradient"></div>
      <div class="container-fluid px-3 px-md-4">
        <div class="hero-content">
          <div class="row g-4 align-items-start">
            <!-- Left: Poster + Metadata -->
            <div class="col-12 col-md-4 col-lg-3">
              <div class="movie-poster-container">
                <img 
                  src="${optimizedPoster}" 
                  alt="${title}" 
                  class="img-fluid movie-detail-poster" 
                  loading="lazy"
                  decoding="async"
                  onerror="if (!this.dataset.failed) { this.dataset.failed = 'true'; if (this.src !== '/assets/images/placeholder.jpg') { this.src = '/assets/images/placeholder.jpg'; } else { this.style.display = 'none'; } }"
                  onload="this.classList.add('loaded'); this.dataset.loaded = 'true';"
                >
              </div>
              
              <!-- Metadata: Rating, Release Date, Country -->
              <div class="movie-hero-metadata-left">
                ${imdbDisplay ? `
                  <div class="metadata-item">
                    <i class="bi bi-star-fill"></i>
                    <span class="imdb-rating-value">${imdbDisplay}</span>
                    ${imdbCount ? `<span class="imdb-count">(${ui.formatNumber(imdbCount)})</span>` : ''}
                  </div>
                ` : ''}
                ${releaseDateFormatted ? `
                  <div class="metadata-item">
                    <i class="bi bi-calendar"></i>
                    <span>${releaseDateFormatted}</span>
                  </div>
                ` : ''}
                ${countryName ? `
                  <div class="metadata-item">
                    <i class="bi bi-geo-alt"></i>
                    <span>${countryName}</span>
                  </div>
                ` : ''}
                ${duration ? `
                  <div class="metadata-item">
                    <i class="bi bi-clock"></i>
                    <span>${ui.formatDuration(duration)}</span>
                  </div>
                ` : ''}
                ${genres.length > 0 ? `
                  <div class="metadata-item metadata-genres">
                    ${genres.slice(0, 3).map(genre => `<span class="genre-badge">${genre}</span>`).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
            
            <!-- Right: Title + Download Card + Overview -->
            <div class="col-12 col-md-8 col-lg-9">
              <div class="movie-hero-info">
                <!-- Title -->
                <h1 class="movie-hero-title">${title} ${year ? `<span class="movie-year">(${year})</span>` : ''}</h1>
                
                <!-- Download Card and Overview Side by Side -->
                <div class="hero-content-row">
                  <!-- Download Card -->
                  <div class="download-section">
                    <div class="download-controls">
                      ${isTVSeries ? renderTVSeriesControls(seasons) : ''}
                      
                      <div class="download-options">
                        <div class="download-option-group">
                          <label class="form-label" for="quality-selector">
                            <i class="bi bi-hd"></i> Quality
                          </label>
                          <select id="quality-selector" class="form-select quality-selector">
                            <option value="BEST">Best Available</option>
                            <option value="1080P">1080P</option>
                            <option value="720P">720P</option>
                            <option value="480P">480P</option>
                            <option value="360P">360P</option>
                          </select>
                          <div id="quality-size-info" class="quality-size-info"></div>
                        </div>
                        
                        <div class="download-option-group">
                          <label class="form-label" for="subtitle-selector">
                            <i class="bi bi-translate"></i> Subtitles
                          </label>
                          <select id="subtitle-selector" class="form-select subtitle-selector">
                            ${(() => {
                              const subtitles = subject.subtitles || metadata.subtitles || '';
                              const subtitleList = subtitles ? subtitles.split(',').map(s => s.trim()) : [];
                              let options = '<option value="None">No Subtitles</option>';
                              if (subtitleList.length > 0) {
                                options += subtitleList.map(sub => 
                                  `<option value="${sub}">${sub}</option>`
                                ).join('');
                              } else {
                                // Fallback options
                                options += '<option value="English">English</option>';
                                options += '<option value="Spanish">Spanish</option>';
                                options += '<option value="French">French</option>';
                              }
                              return options;
                            })()}
                          </select>
                        </div>
                      </div>
                      
                      <div class="download-action">
                        <button id="download-btn" class="btn btn-primary download-btn w-100">
                          <i class="bi bi-download"></i> <span>Download</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Overview Section -->
                  <div class="hero-overview-section">
                    <h3 class="hero-overview-title">Overview</h3>
                    <div class="hero-overview-text">${description}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Additional Info Section -->
    <div class="container-fluid px-3 px-md-4">
      <div class="movie-detail-content">
        ${keywordsList.length > 0 ? `
          <div class="movie-keywords mb-4">
            <h3 class="content-section-title">Keywords</h3>
            <div class="keywords-list">
              ${keywordsList.map(keyword => `<span class="keyword-badge">${keyword}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        
        ${castList.length > 0 ? `
          <div class="movie-cast mb-4">
            <h3 class="content-section-title">Top Cast</h3>
            <div class="cast-grid">
              ${castList.slice(0, 12).map(star => {
                const starName = star.name || (typeof star === 'string' ? star : 'Unknown');
                const character = star.character || '';
                let avatarUrl = star.avatarUrl || star.avatar || '';
                // Optimize avatar image if from pbcdnw
                if (avatarUrl && avatarUrl.includes('pbcdnw.aoneroom.com')) {
                  const separator = avatarUrl.includes('?') ? '&' : '?';
                  avatarUrl = `${avatarUrl}${separator}x-oss-process=image/resize,w_150,q_80`;
                }
                return `
                  <div class="cast-item">
                    ${avatarUrl ? `
                      <div class="cast-avatar">
                        <img src="${avatarUrl}" alt="${starName}" loading="lazy" onerror="this.style.display='none'">
                      </div>
                    ` : '<div class="cast-avatar cast-avatar-placeholder"><i class="bi bi-person"></i></div>'}
                    <div class="cast-info">
                      <div class="cast-name">${starName}</div>
                      ${character ? `<div class="cast-character">${character}</div>` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
        
        ${trailer ? `
          <div class="movie-trailer mb-4">
            <h3 class="content-section-title">Trailer</h3>
            <div class="trailer-container">
              <video class="trailer-video" controls poster="${poster}">
                <source src="${trailer}" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
    
    <!-- Recommendations Section -->
    <div class="container-fluid px-3 px-md-4">
      <div id="recommendations-section" class="recommendations-section mt-5">
        <h3 class="section-title">Recommendations</h3>
        <div id="recommendations-content" class="movie-grid"></div>
      </div>
    </div>
  `;

  // Add download button handler - use browser download
  const downloadBtn = document.getElementById('download-btn');
  if (!downloadBtn) {
    console.error('ERROR: Download button element not found in DOM!');
  } else {
    console.log('Download button found, setting up event listener...');
  }
  const qualitySelector = document.getElementById('quality-selector');
  const subtitleSelector = document.getElementById('subtitle-selector');
  const qualitySizeInfo = document.getElementById('quality-size-info');
  const urlParams = new URLSearchParams(window.location.search);
  const subjectId = urlParams.get('id');
  const detailPath = urlParams.get('path');

  // Update episode dropdown when season changes (for TV series)
  if (isTVSeries) {
    updateEpisodeDropdown(seasons);
  }

  // Load and display file sizes for quality options
  // For movies: se=0, ep=0 (default)
  // For TV series: use selected season/episode
  let season = isTVSeries ? (document.getElementById('season-selector')?.value || 0) : 0;
  let episode = isTVSeries ? (document.getElementById('episode-selector')?.value || 0) : 0;
  
  // Enforce: if episode is 0, season must be 0 (movies don't have seasons)
  if (episode === 0 || parseInt(episode) === 0) {
    season = 0;
  }
  
  // Load file sizes immediately
  loadQualitySizes(subjectId, detailPath, qualitySelector, qualitySizeInfo, season, episode);

  // Update file sizes when quality or season/episode changes
  qualitySelector.addEventListener('change', () => {
    let season = isTVSeries ? (document.getElementById('season-selector')?.value || 0) : 0;
    let episode = isTVSeries ? (document.getElementById('episode-selector')?.value || 0) : 0;
    
    // Enforce: if episode is 0, season must be 0 (movies don't have seasons)
    if (episode === 0 || parseInt(episode) === 0) {
      season = 0;
    }
    
    loadQualitySizes(subjectId, detailPath, qualitySelector, qualitySizeInfo, season, episode);
  });

  if (isTVSeries) {
    const seasonSelector = document.getElementById('season-selector');
    const episodeSelector = document.getElementById('episode-selector');
    if (seasonSelector) {
      seasonSelector.addEventListener('change', () => {
        let season = seasonSelector.value || 0;
        let episode = episodeSelector.value || 0;
        
        // Enforce: if episode is 0, season must be 0 (movies don't have seasons)
        if (episode === 0 || parseInt(episode) === 0) {
          season = 0;
        }
        
        loadQualitySizes(subjectId, detailPath, qualitySelector, qualitySizeInfo, season, episode);
      });
    }
    if (episodeSelector) {
      episodeSelector.addEventListener('change', () => {
        let season = seasonSelector?.value || 0;
        let episode = episodeSelector.value || 0;
        
        // Enforce: if episode is 0, season must be 0 (movies don't have seasons)
        if (episode === 0 || parseInt(episode) === 0) {
          season = 0;
        }
        
        loadQualitySizes(subjectId, detailPath, qualitySelector, qualitySizeInfo, season, episode);
      });
    }
  }

  downloadBtn.addEventListener('click', async () => {
    console.log('=== DOWNLOAD BUTTON CLICKED ===');
    
    const quality = qualitySelector.value;
    const subtitleLang = subtitleSelector.value === 'None' ? '' : subtitleSelector.value;
    // For movies: se=0, ep=0 (default)
    // For TV series: use selected season/episode
    let season = isTVSeries ? (document.getElementById('season-selector')?.value || 0) : 0;
    let episode = isTVSeries ? (document.getElementById('episode-selector')?.value || 0) : 0;

    // Enforce: if episode is 0, season must be 0 (movies don't have seasons)
    if (episode === 0 || parseInt(episode) === 0) {
      season = 0;
    }

    console.log('Calling handleBrowserDownload with:', { subjectId, detailPath, quality, subtitleLang, season, episode });
    await handleBrowserDownload(subjectId, detailPath, quality, subtitleLang, season, episode);
  });
}

/**
 * Load and display file sizes for quality options
 */
async function loadQualitySizes(subjectId, detailPath, qualitySelector, sizeInfoElement, season = 0, episode = 0) {
  if (!sizeInfoElement) return;
  
  try {
    const metadata = await api.getDownloadMetadata(subjectId, detailPath, season, episode);
    const downloads = metadata.downloads || [];
    
    if (downloads.length === 0) {
      sizeInfoElement.textContent = '';
      return;
    }

    const selectedQuality = qualitySelector.value;
    let selectedFile = null;
    
    if (selectedQuality === 'BEST') {
      selectedFile = [...downloads].sort((a, b) => (b.resolution || 0) - (a.resolution || 0))[0];
    } else if (selectedQuality === 'WORST') {
      selectedFile = [...downloads].sort((a, b) => (a.resolution || 0) - (b.resolution || 0))[0];
    } else {
      const qualityNum = parseInt(selectedQuality.replace('P', '')) || 0;
      selectedFile = downloads.find(f => f.resolution === qualityNum) || downloads[0];
    }

    if (selectedFile) {
      // Handle size as string or number
      let sizeValue = selectedFile.size;
      
      // Debug: Log the selected file to see its structure
      console.log('Selected file for quality', selectedQuality, ':', selectedFile);
      
      if (sizeValue !== null && sizeValue !== undefined && sizeValue !== '') {
        // Convert string to number if needed
        if (typeof sizeValue === 'string') {
          sizeValue = parseInt(sizeValue, 10);
        }
        
        if (!isNaN(sizeValue) && sizeValue > 0) {
          const fileSize = ui.formatFileSize(sizeValue);
          sizeInfoElement.textContent = `File size: ${fileSize}`;
          sizeInfoElement.style.color = 'var(--text-secondary)';
          sizeInfoElement.style.display = 'block';
        } else {
          console.warn('Invalid size value:', selectedFile.size, 'parsed as:', sizeValue);
          // Try to find size from other downloads as fallback
          const fallbackFile = downloads.find(d => d.size && parseInt(d.size) > 0);
          if (fallbackFile && fallbackFile.size) {
            const fallbackSize = parseInt(fallbackFile.size, 10);
            if (!isNaN(fallbackSize) && fallbackSize > 0) {
              const fileSize = ui.formatFileSize(fallbackSize);
              sizeInfoElement.textContent = `File size: ${fileSize} (approx)`;
              sizeInfoElement.style.color = 'var(--text-secondary)';
              sizeInfoElement.style.display = 'block';
            } else {
              sizeInfoElement.textContent = '';
            }
          } else {
            sizeInfoElement.textContent = '';
          }
        }
      } else {
        console.warn('No size field in selectedFile. Available fields:', Object.keys(selectedFile));
        // Try to find any file with size
        const fileWithSize = downloads.find(d => d.size && parseInt(d.size) > 0);
        if (fileWithSize && fileWithSize.size) {
          const sizeValue = parseInt(fileWithSize.size, 10);
          if (!isNaN(sizeValue) && sizeValue > 0) {
            const fileSize = ui.formatFileSize(sizeValue);
            sizeInfoElement.textContent = `File size: ${fileSize} (approx)`;
            sizeInfoElement.style.color = 'var(--text-secondary)';
            sizeInfoElement.style.display = 'block';
          } else {
            sizeInfoElement.textContent = '';
          }
        } else {
          sizeInfoElement.textContent = '';
        }
      }
    } else {
      console.warn('No file found for quality:', selectedQuality, 'Available downloads:', downloads);
      sizeInfoElement.textContent = '';
    }
  } catch (error) {
    console.error('Could not load file sizes:', error);
    console.error('Error details:', error.message, error.stack);
    sizeInfoElement.textContent = '';
  }
}

/**
 * Render TV series controls
 * @param {Array} seasons - Seasons array
 * @returns {string} HTML string
 */
function renderTVSeriesControls(seasons) {
  if (!seasons || seasons.length === 0) return '';

  const seasonOptions = seasons.map((season, index) => {
    const seasonNum = season.season || season.se || index + 1;
    return `<option value="${seasonNum}" data-max-ep="${season.maxEp || season.totalEpisodes || 0}">Season ${seasonNum}</option>`;
  }).join('');

  // Get episodes for first season
  const firstSeason = seasons[0];
  const maxEp = firstSeason.maxEp || firstSeason.totalEpisodes || 0;
  const episodeNumbers = firstSeason.episodeNumbers || [];
  
  // Generate episode options
  let episodeOptions = '';
  if (episodeNumbers.length > 0) {
    episodeOptions = episodeNumbers.map(epNum => 
      `<option value="${epNum}">Episode ${epNum}</option>`
    ).join('');
  } else if (maxEp > 0) {
    // Fallback: generate from 1 to maxEp
    for (let i = 1; i <= maxEp; i++) {
      episodeOptions += `<option value="${i}">Episode ${i}</option>`;
    }
  }

  return `
    <div class="season-episode-selector">
      <div class="selector-group">
        <label class="selector-label" for="season-selector">
          <i class="bi bi-collection-play"></i> Season
        </label>
        <select id="season-selector" class="form-select">
          ${seasonOptions}
        </select>
      </div>
      <div class="selector-group">
        <label class="selector-label" for="episode-selector">
          <i class="bi bi-play-circle"></i> Episode
        </label>
        <select id="episode-selector" class="form-select">
          ${episodeOptions}
        </select>
      </div>
    </div>
  `;
}

/**
 * Update episode dropdown based on selected season
 * @param {Array} seasons - Seasons array
 */
function updateEpisodeDropdown(seasons) {
  const seasonSelector = document.getElementById('season-selector');
  const episodeSelector = document.getElementById('episode-selector');
  
  if (!seasonSelector || !episodeSelector || !seasons) return;
  
  seasonSelector.addEventListener('change', () => {
    const selectedSeasonNum = parseInt(seasonSelector.value);
    const selectedOption = seasonSelector.options[seasonSelector.selectedIndex];
    const maxEp = parseInt(selectedOption.dataset.maxEp) || 0;
    
    // Find the season data
    const season = seasons.find(s => (s.season || s.se) === selectedSeasonNum);
    const episodeNumbers = season?.episodeNumbers || [];
    
    // Clear and populate episode dropdown
    episodeSelector.innerHTML = '';
    
    if (episodeNumbers.length > 0) {
      episodeNumbers.forEach(epNum => {
        const option = document.createElement('option');
        option.value = epNum;
        option.textContent = `Episode ${epNum}`;
        episodeSelector.appendChild(option);
      });
    } else if (maxEp > 0) {
      // Fallback: generate from 1 to maxEp
      for (let i = 1; i <= maxEp; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Episode ${i}`;
        episodeSelector.appendChild(option);
      }
    }
  });
}

/**
 * Handle browser download (direct download using browser's native download)
 */
async function handleBrowserDownload(subjectId, detailPath, quality, subtitleLang, season = 0, episode = 0) {
  console.log('=== handleBrowserDownload CALLED ===');
  console.log('Parameters:', { subjectId, detailPath, quality, subtitleLang, season, episode });
  
  const downloadBtn = document.getElementById('download-btn');
  if (!downloadBtn) {
    console.error('ERROR: Download button not found!');
    ui.showToast('Download button not found', 'error');
    return;
  }
  console.log('Download button found, disabling...');
  
  downloadBtn.disabled = true;
  downloadBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';

  // Get config for building full backend URLs (not relative URLs)
  // CRITICAL: This ensures downloads go to Railway backend, not Vercel
  const config = (typeof window !== 'undefined' && window.appConfig) ? window.appConfig : {
    buildApiUrl: (endpoint) => {
      const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      return path;
    }
  };
  
  console.log('Config:', { 
    hasAppConfig: !!window.appConfig, 
    API_BASE_URL: config.API_BASE_URL || 'not set' 
  });

  try {
    console.log('Fetching download metadata...');
    // Get download metadata
    const metadata = await api.getDownloadMetadata(subjectId, detailPath, season, episode);
    console.log('Metadata received:', { 
      hasResource: metadata.hasResource, 
      downloadsCount: metadata.downloads?.length || 0,
      hasCookies: !!metadata.cookies,
      cookiesPreview: metadata.cookies ? metadata.cookies.substring(0, 100) + '...' : 'NO COOKIES',
      cookiesLength: metadata.cookies ? metadata.cookies.length : 0,
      hasI18nLang: metadata.cookies ? metadata.cookies.includes('i18n_lang') : false,
    });
    
    // Check hasResource flag - if false, no files are available
    if (!metadata.hasResource) {
      throw new Error('File not available (hasResource: false). This content may not be downloadable.');
    }
    
    const downloads = metadata.downloads || [];
    const captions = metadata.captions || [];
    // Extract cookies from metadata response (CRITICAL: required for media file downloads)
    const cookies = metadata.cookies || null;

    // Filter downloads to only include entries with valid URLs (additional safety check)
    const availableDownloads = downloads.filter(download => {
      const hasValidUrl = !!download.url;
      if (!hasValidUrl) {
        console.warn(`Skipping download ${download.id} (resolution: ${download.resolution}): no valid URL`);
      }
      return hasValidUrl;
    });

    if (availableDownloads.length === 0) {
      throw new Error('No video files available. All download entries are missing or unavailable.');
    }

    // Select quality - use filtered available downloads
    let selectedFile = null;
    if (quality === 'BEST') {
      // Sort by resolution descending and take highest
      selectedFile = [...availableDownloads].sort((a, b) => (b.resolution || 0) - (a.resolution || 0))[0];
    } else if (quality === 'WORST') {
      // Sort by resolution ascending and take lowest
      selectedFile = [...availableDownloads].sort((a, b) => (a.resolution || 0) - (b.resolution || 0))[0];
    } else {
      // Match quality string (e.g., "1080P" -> 1080)
      const qualityNum = parseInt(quality.replace('P', '')) || 0;
      selectedFile = availableDownloads.find(f => f.resolution === qualityNum) || availableDownloads[0];
    }

    if (!selectedFile || !selectedFile.url) {
      throw new Error('No video file available for selected quality');
    }

    // Log the selected file URL (which should be resource.url if available)
    console.log('Selected file for download:', {
      resolution: selectedFile.resolution,
      urlPreview: selectedFile.url ? selectedFile.url.substring(0, 100) + '...' : 'MISSING URL',
      hasCookies: !!cookies,
    });

    // Format file size for display
    const fileSize = selectedFile.size ? ui.formatFileSize(parseInt(selectedFile.size)) : '';
    const sizeInfo = fileSize ? ` (${fileSize})` : '';
    
    // Get title from page or use default
    const titleElement = document.querySelector('.movie-detail-info h1, .pc-title');
    const title = titleElement ? titleElement.textContent.trim().split('(')[0].trim() : null;

    // Build query parameters for download proxy with metadata for filename generation
    const params = new URLSearchParams({
      url: selectedFile.url,
      detailPath: detailPath
    });
    
    // CRITICAL: Add cookies to query params (required for MovieBox media downloads)
    if (cookies) {
      params.append('cookies', cookies);
      console.log('Cookies added to download params:', cookies.substring(0, 100) + '...');
      console.log('Cookies full length:', cookies.length);
    } else {
      console.warn('WARNING: No cookies available for download!');
    }
    
    // Add subjectId if available
    if (subjectId) {
      params.append('subjectId', subjectId);
    }
    
    // Add title if available
    if (title) {
      params.append('title', title);
    }
    
    // Add season/episode for TV series
    if (season && episode && parseInt(season) > 0 && parseInt(episode) > 0) {
      params.append('season', season);
      params.append('episode', episode);
    }
    
    // Add quality and resolution
    if (quality) {
      params.append('quality', quality);
    }
    if (selectedFile.resolution) {
      params.append('resolution', `${selectedFile.resolution}p`);
    }

    // Use proxy endpoint for download with proper headers
    // CRITICAL: Use full backend URL (not relative) so downloads go to Railway, not Vercel
    const proxyUrl = config.buildApiUrl(`/api/download-proxy?${params.toString()}`);
    
    // Log download attempt for debugging
    console.log('=== DOWNLOAD ATTEMPT ===');
    console.log('Proxy URL:', proxyUrl);
    console.log('Config API_BASE_URL:', config.API_BASE_URL);
    console.log('Selected file URL preview:', selectedFile.url ? selectedFile.url.substring(0, 100) + '...' : 'MISSING');
    console.log('Has cookies:', !!cookies);
    
    // CRITICAL: Download immediately after getting signed URL to prevent expiration
    // Signed URLs (with sign= and t= parameters) expire quickly, so we must use them immediately
    // Use native browser download - create anchor tag and click it
    // This lets the browser's native download manager handle the file (works for any size)
    try {
      console.log('Starting native browser download...');
      console.log('Proxy URL:', proxyUrl);
      
      // Create anchor tag for native browser download
      const downloadLink = document.createElement('a');
      downloadLink.href = proxyUrl;
      downloadLink.download = filename || ''; // Set filename if available
      downloadLink.style.display = 'none'; // Hide the link
      
      // Add to DOM temporarily
      document.body.appendChild(downloadLink);
      
      console.log('Triggering native browser download...');
      downloadLink.click();
      
      // Remove from DOM after a short delay
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        console.log('Download link removed from DOM');
      }, 100);
      
      ui.showToast('Download started successfully', 'success');
    } catch (error) {
      console.error('Download error:', error);
      
      // Show user-friendly error message
      const errorMessage = error.message || 'Download failed. Please try again.';
      ui.showToast(errorMessage, 'error');
      throw error; // Re-throw to be caught by outer catch block
    }

    // Download subtitle if selected
    if (subtitleLang && subtitleLang !== 'None' && captions.length > 0) {
      // Find caption by language name (e.g., "English", "Français")
      const subtitleFile = captions.find(c => 
        c.lanName === subtitleLang || 
        c.lan === subtitleLang.toLowerCase() ||
        (c.lanName && c.lanName.toLowerCase().includes(subtitleLang.toLowerCase()))
      );
      
      if (subtitleFile && subtitleFile.url) {
        // Small delay to avoid browser blocking multiple downloads
        setTimeout(() => {
          // Build subtitle download URL with cookies if available
          const subtitleParams = new URLSearchParams({
            url: subtitleFile.url,
          });
          if (cookies) {
            subtitleParams.append('cookies', cookies);
          }
          // CRITICAL: Use full backend URL (not relative) so downloads go to Railway, not Vercel
          const subtitleUrl = config.buildApiUrl(`/api/download-subtitle?${subtitleParams.toString()}`);
          
          const subtitleLink = document.createElement('a');
          subtitleLink.href = subtitleUrl;
          subtitleLink.download = ''; // Let backend determine filename
          subtitleLink.target = '_blank';
          document.body.appendChild(subtitleLink);
          subtitleLink.click();
          document.body.removeChild(subtitleLink);
        }, 500);
      }
    }
  } catch (error) {
    console.error('Download error:', error);
    ui.showToast('Download failed: ' + error.message, 'error');
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.innerHTML = '<i class="bi bi-download"></i> Download';
  }
}

/**
 * Load recommendations
 * @param {string} subjectId - Movie/TV series ID
 */
async function loadRecommendations(subjectId) {
  const container = document.getElementById('recommendations-content');
  if (!container) return;

  try {
    const response = await api.getRecommendations(subjectId);
    // Handle both nested data structure and direct response
    const data = response.data || response;
    const items = data.items || [];
    
    if (items.length > 0) {
      ui.renderMovieGrid(container, items);
    } else {
      // Hide section if no recommendations
      const section = document.getElementById('recommendations-section');
      if (section) {
        section.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Error loading recommendations:', error);
    // Hide section on error
    const section = document.getElementById('recommendations-section');
    if (section) {
      section.style.display = 'none';
    }
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

