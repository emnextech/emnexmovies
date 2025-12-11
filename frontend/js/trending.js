/**
 * Trending Page Functionality
 * Handles loading and displaying trending content with pagination
 */

let currentPage = 0;
let currentPerPage = 18;

/**
 * Initialize trending page
 */
function initTrending() {
  // Get page from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const page = parseInt(urlParams.get('page')) || 0;
  const perPage = parseInt(urlParams.get('perPage')) || 18;
  
  currentPage = page;
  currentPerPage = perPage;
  
  // Load trending content
  loadTrending(page, perPage);
  
  // Initialize navbar active state
  initNavbarActiveState();
}

/**
 * Load trending content
 * @param {number} page - Page number (0-indexed)
 * @param {number} perPage - Items per page
 */
async function loadTrending(page = 0, perPage = 18) {
  const resultsContainer = document.getElementById('trending-results');
  if (!resultsContainer) {
    console.error('Trending results container not found');
    return;
  }

  // Check if ui object is available
  if (typeof ui === 'undefined') {
    console.error('ui object is not defined! Make sure ui.js is loaded before trending.js');
    resultsContainer.innerHTML = '<div class="alert alert-danger">Error: UI utilities not loaded</div>';
    return;
  }

  // Check if api object is available
  if (typeof api === 'undefined') {
    console.error('api object is not defined! Make sure api.js is loaded before trending.js');
    resultsContainer.innerHTML = '<div class="alert alert-danger">Error: API client not loaded</div>';
    return;
  }

  // Update URL
  const url = new URL(window.location);
  url.searchParams.set('page', page);
  url.searchParams.set('perPage', perPage);
  window.history.pushState({}, '', url);

  // Show loading
  ui.showLoading(resultsContainer, 'grid');

  try {
    const response = await api.trending(page, perPage);
    console.log('Trending API response:', response);
    console.log('Response type:', typeof response);
    
    // Check if response is null or undefined
    if (!response) {
      console.error('API returned null or undefined response');
      // Redirect to 404 page on error
      window.location.href = '404.html';
      return;
    }
    
    console.log('Response keys:', Object.keys(response));
    
    // Check for error response
    if (response.error) {
      console.error('API returned error:', response.error);
      // Redirect to 404 page on error
      window.location.href = '404.html';
      return;
    }
    
    // Handle different response structures:
    // 1. Backend returns full API response: { code: 0, message: "ok", data: { subjectList: [...], pager: {...} } }
    // 2. Backend returns just data: { subjectList: [...], pager: {...} }
    let subjectList = [];
    let pager = {};
    
    // Check for full API response structure: { code: 0, message: "ok", data: { subjectList: [...], pager: {...} } }
    if (response && response.code === 0 && response.data) {
      console.log('Detected full API response structure');
      subjectList = response.data.subjectList || [];
      pager = response.data.pager || {};
    } 
    // Check for nested data structure: { data: { subjectList: [...], pager: {...} } }
    else if (response && response.data && response.data.subjectList) {
      console.log('Detected nested data structure');
      subjectList = response.data.subjectList;
      pager = response.data.pager || {};
    } 
    // Check for direct data structure: { subjectList: [...], pager: {...} }
    else if (response && response.subjectList) {
      console.log('Detected direct data structure');
      subjectList = response.subjectList;
      pager = response.pager || {};
    }
    // Check for items property (alternative structure)
    else if (response && response.items) {
      console.log('Detected items structure');
      subjectList = response.items;
      pager = response.pager || {};
    }
    // Last fallback
    else if (response && response.data) {
      console.log('Trying fallback response.data');
      subjectList = response.data.subjectList || response.data.items || [];
      pager = response.data.pager || {};
    }
    
    console.log('Final subject list length:', subjectList.length);
    console.log('Final pager:', pager);
    if (subjectList.length > 0) {
      console.log('First subject:', subjectList[0]);
    } else {
      console.warn('No subjects extracted. Full response structure:', JSON.stringify(response, null, 2));
    }

    // Render results
    if (subjectList.length > 0) {
      ui.renderMovieGrid(resultsContainer, subjectList);
    } else {
      console.error('No trending content found. Response structure:', response);
      ui.showEmptyState(resultsContainer, 'No trending content available');
    }

    // Update pagination
    updateTrendingPagination(pager, page);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    console.error('Error loading trending content:', error);
    // Redirect to 404 page on any error
    window.location.href = '404.html';
  }
}

/**
 * Update pagination controls for trending
 * @param {Object} pager - Pagination info from API
 * @param {number} currentPageNum - Current page number
 */
function updateTrendingPagination(pager, currentPageNum) {
  const paginationContainer = document.getElementById('pagination');
  if (!paginationContainer) return;

  const { page = 0, perPage = 18, hasMore = false, nextPage } = pager;
  const currentPageIndex = parseInt(currentPageNum) || parseInt(page) || 0;

  // If no more pages and we're on first page, hide pagination
  if (!hasMore && currentPageIndex === 0) {
    paginationContainer.innerHTML = '';
    return;
  }

  let paginationHTML = '<nav><ul class="pagination justify-content-center">';

  // Previous button
  paginationHTML += `
    <li class="page-item ${currentPageIndex === 0 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPageIndex - 1}">Previous</a>
    </li>
  `;

  // Show current page info
  paginationHTML += `
    <li class="page-item disabled">
      <span class="page-link">Page ${currentPageIndex + 1}</span>
    </li>
  `;

  // Next button
  if (hasMore && nextPage !== undefined) {
    paginationHTML += `
      <li class="page-item">
        <a class="page-link" href="#" data-page="${nextPage}">Next</a>
      </li>
    `;
  } else {
    paginationHTML += `
      <li class="page-item disabled">
        <a class="page-link" href="#">Next</a>
      </li>
    `;
  }

  paginationHTML += '</ul></nav>';
  paginationContainer.innerHTML = paginationHTML;

  // Add click handlers
  paginationContainer.querySelectorAll('.page-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageNum = parseInt(link.dataset.page);
      if (pageNum !== undefined && pageNum !== currentPageIndex && pageNum >= 0) {
        loadTrending(pageNum, currentPerPage);
      }
    });
  });
}

/**
 * Initialize navbar active state
 */
function initNavbarActiveState() {
  const path = window.location.pathname;
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href && (path.includes('trending.html') || path.endsWith('trending.html'))) {
      if (href.includes('trending.html')) {
        link.classList.add('active');
      }
    } else if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
      if (href && (href.includes('index.html') || href === '/' || href === 'index.html')) {
        link.classList.add('active');
      }
    }
  });
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTrending);
} else {
  initTrending();
}

// Export for global use
if (typeof window !== 'undefined') {
  window.trendingModule = {
    loadTrending,
    initTrending,
  };
}

