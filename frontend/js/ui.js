/**
 * UI Utilities and Helpers
 */

/**
 * Show loading indicator with shimmer effect
 * @param {HTMLElement} container - Container element
 * @param {string} type - Type of loading (grid, detail, banner)
 */
function showLoading(container, type = 'grid') {
  let shimmerHTML = '';
  
  if (type === 'grid') {
    // Shimmer loading for movie grid
    shimmerHTML = `
      <div class="shimmer-loading-grid">
        ${Array(12).fill(0).map(() => `
          <div class="shimmer-card">
            <div class="shimmer-image"></div>
            <div class="shimmer-content">
              <div class="shimmer-line shimmer-title"></div>
              <div class="shimmer-line shimmer-meta"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (type === 'home' || type === 'banner') {
    // Shimmer loading for home page - shows both banner and movie cards
    shimmerHTML = `
      <div class="shimmer-loading-home">
        <!-- Banner shimmer -->
        <div class="shimmer-loading-banner mb-5">
          <div class="shimmer-banner-slide"></div>
        </div>
        <!-- Movie cards shimmer -->
        <div class="shimmer-loading-grid">
          ${Array(12).fill(0).map(() => `
            <div class="shimmer-card">
              <div class="shimmer-image"></div>
              <div class="shimmer-content">
                <div class="shimmer-line shimmer-title"></div>
                <div class="shimmer-line shimmer-meta"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (type === 'detail') {
    // Shimmer loading for movie detail page
    shimmerHTML = `
      <div class="shimmer-loading-detail">
        <div class="shimmer-detail-hero">
          <div class="shimmer-detail-poster"></div>
          <div class="shimmer-detail-content">
            <div class="shimmer-line shimmer-detail-title"></div>
            <div class="shimmer-line shimmer-detail-line"></div>
            <div class="shimmer-line shimmer-detail-line"></div>
            <div class="shimmer-line shimmer-detail-line short"></div>
          </div>
        </div>
      </div>
    `;
  } else if (type === 'banner') {
    // Shimmer loading for banner section
    shimmerHTML = `
      <div class="shimmer-loading-banner">
        <div class="shimmer-banner-slide"></div>
      </div>
    `;
  } else {
    // Default shimmer grid
    shimmerHTML = `
      <div class="shimmer-loading-grid">
        ${Array(12).fill(0).map(() => `
          <div class="shimmer-card">
            <div class="shimmer-image"></div>
            <div class="shimmer-content">
              <div class="shimmer-line shimmer-title"></div>
              <div class="shimmer-line shimmer-meta"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  container.innerHTML = shimmerHTML;
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
  if (!url || url === '/assets/images/placeholder.jpg') {
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
  let poster = '/assets/images/placeholder.jpg';
  if (item.cover && typeof item.cover === 'object' && item.cover.url) {
    poster = item.cover.url;
  } else if (item.cover && typeof item.cover === 'string') {
    poster = item.cover;
  } else if (item.poster) {
    poster = item.poster;
  }
  
  // Optimize image URL for thumbnails (300px width, 80% quality)
  const optimizedPoster = optimizeImageUrl(poster, 300, 80);
  
  // Use blurHash or thumbnail if available for placeholder
  const placeholder = item.cover?.thumbnail || item.cover?.blurHash || '';
  const blurHashStyle = placeholder && placeholder.startsWith('e') 
    ? `style="background: #2b2e39; background-image: url('data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#2b2e39"/></svg>`)}');"` 
    : '';
  
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
          src="${optimizedPoster}" 
          class="card-img-top movie-card-image" 
          alt="${title}" 
          loading="lazy" 
          decoding="async"
          onerror="if (!this.dataset.failed) { this.dataset.failed = 'true'; if (this.src !== '/assets/images/placeholder.jpg') { this.src = '/assets/images/placeholder.jpg'; this.classList.add('loaded'); this.parentElement.classList.add('image-loaded'); } else { this.style.display = 'none'; } }"
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
  
  // Add click handlers
  container.querySelectorAll('.movie-card').forEach(card => {
    card.addEventListener('click', () => {
      const subjectId = card.dataset.subjectId;
      const detailPath = card.dataset.detailPath;
      window.location.href = `movie-detail.html?id=${subjectId}&path=${encodeURIComponent(detailPath)}`;
    });
  });
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
 * Create skeleton loaders
 * @param {number} count - Number of skeletons
 * @returns {string} HTML string
 */
function createSkeletons(count = 6) {
  return Array(count).fill(0).map(() => `
    <div class="card skeleton skeleton-card">
      <div class="card-body"></div>
    </div>
  `).join('');
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

