/**
 * UI Utilities and Helpers
 */

/**
 * Show loading indicator with 4-dot animation
 * @param {HTMLElement} container - Container element
 * @param {string} type - Type of loading (grid, detail, banner, home)
 */
function showLoading(container, type = 'grid') {
  let loadingHTML = '';
  
  const dotLoader = `
    <div class="loading-dots-container">
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
    </div>
  `;
  
  if (type === 'grid') {
    // 4-dot loading for movie grid
    loadingHTML = `
      <div class="loading-movie-grid">
        ${dotLoader}
      </div>
    `;
  } else if (type === 'home') {
    // 4-dot loading for home page
    loadingHTML = `
      <div class="loading-movie-grid">
        ${dotLoader}
      </div>
    `;
  } else if (type === 'detail') {
    // 4-dot loading for movie detail page
    loadingHTML = `
      <div class="loading-movie-detail">
        ${dotLoader}
      </div>
    `;
  } else if (type === 'banner') {
    // 4-dot loading for banner section
    loadingHTML = `
      <div class="loading-banner">
        ${dotLoader}
      </div>
    `;
  } else {
    // Default 4-dot loading
    loadingHTML = `
      <div class="loading-dots">
        ${dotLoader}
      </div>
    `;
  }
  
  container.innerHTML = loadingHTML;
}

/**
 * Show empty state
 * @param {HTMLElement} container - Container element
 * @param {string} message - Empty state message
 */
function showEmptyState(container, message = 'No items found') {
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">📭</div>
      <div class="empty-state-text">${message}</div>
    </div>
  `;
}

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, error, info)
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, type = 'info', duration = 3000) {
  const toastContainer = document.getElementById('toast-container') || createToastContainer();
  
  const toastId = `toast-${Date.now()}`;
  const bgColor = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-info';
  
  const toastHTML = `
    <div id="${toastId}" class="toast align-items-center text-white ${bgColor} border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;
  
  toastContainer.insertAdjacentHTML('beforeend', toastHTML);
  
  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, { delay: duration });
  toast.show();
  
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}

/**
 * Create toast container if it doesn't exist
 * @returns {HTMLElement} Toast container
 */
function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'toast-container position-fixed top-0 end-0 p-3';
  container.style.zIndex = '1055';
  document.body.appendChild(container);
  return container;
}

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format duration
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
function formatDuration(minutes) {
  if (!minutes) return 'N/A';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

/**
 * Format date
 * @param {string|number} date - Date string or timestamp
 * @returns {string} Formatted date
 */
function formatDate(date) {
  if (!date) return 'N/A';
  
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return date;
  }
}

/**
 * Optimize image URL for better performance
 * Adds resize parameters if the URL is from pbcdnw.aoneroom.com
 * @param {string} url - Original image URL
 * @param {number} width - Desired width (default: 300 for thumbnails)
 * @param {number} quality - Quality percentage (default: 80)
 * @returns {string} Optimized image URL
 */
function optimizeImageUrl(url, width = 300, quality = 80) {
  if (!url) {
    return url;
  }
  
  // If it's a pbcdnw.aoneroom.com URL, add resize parameters
  if (url.includes('pbcdnw.aoneroom.com')) {
    // Check if URL already has query parameters
    const separator = url.includes('?') ? '&' : '?';
    // Use x-oss-process for image optimization (Aliyun OSS)
    return `${url}${separator}x-oss-process=image/resize,w_${width},q_${quality}`;
  }
  
  // For other CDNs, return as-is (they might have their own optimization)
  return url;
}

/**
 * Check if item has English audio (dubbed)
 * @param {Object} item - Movie/TV series item
 * @returns {boolean} True if English audio is available
 */
function hasEnglishAudio(item) {
  const title = (item.title || item.name || '').toLowerCase();
  const corner = (item.corner || '').toLowerCase();
  return title.includes('[english]') || corner.includes('english');
}

/**
 * Create movie card HTML
 * @param {Object} item - Movie/TV series item
 * @returns {string} HTML string
 */
function createMovieCard(item) {
  // Handle different poster/cover structures
  let poster = null;
  if (item.cover && typeof item.cover === 'object' && item.cover.url) {
    poster = item.cover.url;
  } else if (item.cover && typeof item.cover === 'string') {
    poster = item.cover;
  } else if (item.poster) {
    poster = item.poster;
  }
  
  // Optimize image URL for thumbnails (200px width, 70% quality for better performance)
  const optimizedPoster = poster ? optimizeImageUrl(poster, 200, 70) : null;
  
  const title = item.title || item.name || 'Unknown';
  const year = item.releaseDate ? new Date(item.releaseDate).getFullYear() : item.year || '';
  const type = item.subjectType === 2 ? 'TV Series' : 'Movie';
  const subjectId = item.subjectId || item.id;
  const detailPath = item.detailPath || item.url?.split('/').pop() || '';
  
  // Extract IMDB rating
  const imdbRating = item.imdbRatingValue || item.imdbRate || item.subject?.imdbRatingValue || null;
  const imdbCount = item.imdbRatingCount || item.subject?.imdbRatingCount || null;
  const imdbDisplay = imdbRating ? parseFloat(imdbRating).toFixed(1) : null;
  
  // Check for English audio
  const hasEnglish = hasEnglishAudio(item);
  
  return `
    <div class="card movie-card" data-subject-id="${subjectId}" data-detail-path="${detailPath}">
      <div class="position-relative movie-card-image-wrapper">
        <img 
          ${optimizedPoster ? `src="${optimizedPoster}"` : ''}
          class="card-img-top movie-card-image" 
          alt="${title}" 
          loading="lazy" 
          decoding="async"
          onerror="if (!this.dataset.failed) { this.dataset.failed = 'true'; this.style.display = 'none'; this.parentElement.style.minHeight = '200px'; }"
          onload="this.classList.add('loaded'); this.parentElement.classList.add('image-loaded');"
        >
        ${imdbDisplay ? `<span class="imdb-rating-badge">
          <i class="bi bi-star-fill"></i> ${imdbDisplay}
          ${imdbCount ? `<small>(${formatNumber(imdbCount)})</small>` : ''}
        </span>` : ''}
        ${hasEnglish ? `<span class="english-audio-badge">
          <i class="bi bi-volume-up-fill"></i> EN
        </span>` : ''}
      </div>
      <div class="card-body">
        <h5 class="card-title movie-card-title">${title}</h5>
        <div class="card-meta">
          ${year ? `<span class="card-year">${year}</span>` : ''}
          <span class="card-type">${type}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Format large numbers (e.g., 1450938 -> "1.5M")
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
  if (!num || num === 0) return '';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Render movie grid
 * @param {HTMLElement} container - Container element
 * @param {Array} items - Movie items array
 */
function renderMovieGrid(container, items) {
  if (!items || items.length === 0) {
    showEmptyState(container);
    return;
  }
  
  container.innerHTML = items.map(item => createMovieCard(item)).join('');
  
  // Add click handlers and animations
  container.querySelectorAll('.movie-card').forEach((card, index) => {
    // Add animation class with staggered delay
    card.classList.add('fade-in-up');
    
    card.addEventListener('click', () => {
      const subjectId = card.dataset.subjectId;
      const detailPath = card.dataset.detailPath;
      window.location.href = `movie-detail.html?id=${subjectId}&path=${encodeURIComponent(detailPath)}`;
    });
  });
  
  // Setup lazy loading for images
  setTimeout(() => {
    if (typeof setupLazyLoading === 'function') {
      setupLazyLoading();
    }
  }, 50);
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Create loading indicator (replaces skeleton loaders)
 * @param {number} count - Not used, kept for compatibility
 * @returns {string} HTML string with 4-dot loader
 */
function createSkeletons(count = 6) {
  return `
    <div class="loading-dots">
      <div class="loading-dots-container">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>
    </div>
  `;
}

// Export for global use
if (typeof window !== 'undefined') {
  window.ui = {
    showLoading,
    showEmptyState,
    showToast,
    createToastContainer,
    optimizeImageUrl,
    formatFileSize,
    formatDuration,
    formatDate,
    formatNumber,
    createMovieCard,
    renderMovieGrid,
    debounce,
    createSkeletons,
  };
}

