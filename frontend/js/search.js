/**
 * Search Functionality
 */

let currentSearchKeyword = '';
let currentFilters = { subjectType: 0 };
let currentPage = 1;
let searchTimeout = null;

/**
 * Initialize mobile search functionality
 */
function initMobileSearch() {
  const mobileSearchToggle = document.getElementById('mobile-search-toggle');
  const mobileSearchBar = document.getElementById('mobile-search-bar');
  const mobileSearchClose = document.getElementById('mobile-search-close');
  const mobileSearchInput = document.getElementById('mobile-search-input');
  const mobileSearchForm = document.getElementById('mobile-search-form');
  const desktopSearchInput = document.getElementById('search-input');
  const mobileAutocompleteContainer = document.getElementById('mobile-autocomplete-container');

  if (mobileSearchToggle && mobileSearchBar) {
    // Toggle mobile search bar
    mobileSearchToggle.addEventListener('click', () => {
      mobileSearchBar.style.display = mobileSearchBar.style.display === 'none' ? 'block' : 'none';
      document.body.classList.toggle('mobile-search-active');
      if (mobileSearchBar.style.display === 'block' && mobileSearchInput) {
        mobileSearchInput.focus();
        // Sync with desktop input if it has value
        if (desktopSearchInput && desktopSearchInput.value) {
          mobileSearchInput.value = desktopSearchInput.value;
        }
      }
    });

    // Close mobile search bar
    if (mobileSearchClose) {
      mobileSearchClose.addEventListener('click', () => {
        mobileSearchBar.style.display = 'none';
        document.body.classList.remove('mobile-search-active');
      });
    }

    // Handle mobile search form submission
    if (mobileSearchForm && mobileSearchInput) {
      mobileSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const keyword = mobileSearchInput.value.trim();
        if (keyword) {
          // Sync with desktop input
          if (desktopSearchInput) {
            desktopSearchInput.value = keyword;
          }
          // Close mobile search bar
          mobileSearchBar.style.display = 'none';
          document.body.classList.remove('mobile-search-active');
          
          // Navigate to search page or perform search
          if (window.location.pathname.includes('search.html')) {
            performSearch(keyword, currentFilters, 1);
          } else {
            window.location.href = `search.html?q=${encodeURIComponent(keyword)}`;
          }
        }
      });

      // Handle mobile search input for autocomplete
      let mobileSearchTimeout = null;
      mobileSearchInput.addEventListener('input', (e) => {
        const keyword = e.target.value.trim();
        
        if (keyword.length >= 2) {
          clearTimeout(mobileSearchTimeout);
          mobileSearchTimeout = setTimeout(() => {
            showMobileSearchSuggestions(keyword);
          }, 300);
        } else {
          if (mobileAutocompleteContainer) {
            mobileAutocompleteContainer.style.display = 'none';
          }
        }
      });

      // Sync mobile and desktop inputs
      if (desktopSearchInput) {
        desktopSearchInput.addEventListener('input', (e) => {
          if (mobileSearchInput) {
            mobileSearchInput.value = e.target.value;
          }
        });
      }
    }

    // Close mobile search when clicking outside
    document.addEventListener('click', (e) => {
      if (mobileSearchBar && mobileSearchBar.style.display === 'block') {
        if (!mobileSearchBar.contains(e.target) && 
            !mobileSearchToggle.contains(e.target) &&
            mobileSearchBar !== e.target) {
          mobileSearchBar.style.display = 'none';
          document.body.classList.remove('mobile-search-active');
        }
      }
    });
  }
}

/**
 * Show mobile search suggestions
 * @param {string} keyword - Search keyword
 */
async function showMobileSearchSuggestions(keyword) {
  const mobileAutocompleteContainer = document.getElementById('mobile-autocomplete-container');
  if (!mobileAutocompleteContainer) return;

  try {
    const response = await api.searchSuggest(keyword);
    const data = response.data || response;
    const items = data.items || response.items || response.suggestions || [];

    if (items.length === 0) {
      mobileAutocompleteContainer.style.display = 'none';
      return;
    }

    mobileAutocompleteContainer.innerHTML = items.slice(0, 8).map(item => {
      const title = item.word || item.title || item.name || item.keyword || '';
      return `
        <div class="autocomplete-item" data-keyword="${title}">
          <i class="bi bi-search me-2"></i> ${title}
        </div>
      `;
    }).join('');

    mobileAutocompleteContainer.style.display = 'block';

    // Add click handlers
    mobileAutocompleteContainer.querySelectorAll('.autocomplete-item').forEach(item => {
      item.addEventListener('click', () => {
        const keyword = item.dataset.keyword;
        const mobileSearchInput = document.getElementById('mobile-search-input');
        if (mobileSearchInput) {
          mobileSearchInput.value = keyword;
          mobileAutocompleteContainer.style.display = 'none';
          
          // Sync with desktop
          const desktopSearchInput = document.getElementById('search-input');
          if (desktopSearchInput) {
            desktopSearchInput.value = keyword;
          }
          
          if (window.location.pathname.includes('search.html')) {
            performSearch(keyword, currentFilters, 1);
          } else {
            window.location.href = `search.html?q=${encodeURIComponent(keyword)}`;
          }
        }
      });
    });
  } catch (error) {
    console.error('Error fetching mobile suggestions:', error);
    mobileAutocompleteContainer.style.display = 'none';
  }
}

/**
 * Initialize search functionality
 */
function initSearch() {
  const searchInput = document.getElementById('search-input');
  const searchForm = document.getElementById('search-form');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const autocompleteContainer = document.getElementById('autocomplete-container');

  // Initialize mobile search
  initMobileSearch();

  if (searchInput) {
    // Search input with debouncing
    searchInput.addEventListener('input', (e) => {
      const keyword = e.target.value.trim();
      
      if (keyword.length >= 2) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          showSearchSuggestions(keyword);
        }, 300);
      } else {
        hideAutocomplete();
      }
    });

    // Handle search form submission
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const keyword = searchInput.value.trim();
        if (keyword) {
          // If on search page, perform search directly
          if (window.location.pathname.includes('search.html')) {
            performSearch(keyword, currentFilters, 1);
          } else {
            // Otherwise, navigate to search page
            window.location.href = `search.html?q=${encodeURIComponent(keyword)}`;
          }
        }
      });
    }

    // Hide autocomplete on outside click
    document.addEventListener('click', (e) => {
      if (autocompleteContainer && !searchInput.contains(e.target) && !autocompleteContainer.contains(e.target)) {
        hideAutocomplete();
      }
    });
  }
  
  // Load popular searches if on search page
  if (window.location.pathname.includes('search.html')) {
    loadPopularSearches();
  }

  // Filter buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      filterButtons.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      btn.classList.add('active');
      
      // Update filter
      const filterType = btn.dataset.filter;
      currentFilters.subjectType = parseInt(filterType) || 0;
      
      // Perform search with new filter
      if (currentSearchKeyword) {
        performSearch(currentSearchKeyword, currentFilters, 1);
      }
    });
  });

  // Load search from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const keyword = urlParams.get('q');
  const filter = urlParams.get('filter');
  const page = urlParams.get('page');
  
  if (keyword) {
    if (searchInput) searchInput.value = keyword;
    // Sync with mobile input
    const mobileSearchInput = document.getElementById('mobile-search-input');
    if (mobileSearchInput) mobileSearchInput.value = keyword;
    
    if (filter) {
      currentFilters.subjectType = parseInt(filter);
      const filterBtn = document.querySelector(`[data-filter="${filter}"]`);
      if (filterBtn) filterBtn.classList.add('active');
    }
    
    const pageNum = page ? parseInt(page, 10) : 1;
    performSearch(keyword, currentFilters, pageNum);
  }
}

/**
 * Show search suggestions
 * @param {string} keyword - Search keyword
 */
async function showSearchSuggestions(keyword) {
  const autocompleteContainer = document.getElementById('autocomplete-container');
  if (!autocompleteContainer) return;

  try {
    const response = await api.searchSuggest(keyword);
    const data = response.data || response;
    const items = data.items || response.items || response.suggestions || [];

    if (items.length === 0) {
      hideAutocomplete();
      return;
    }

    autocompleteContainer.innerHTML = items.slice(0, 8).map(item => {
      const title = item.word || item.title || item.name || item.keyword || '';
      return `
        <div class="autocomplete-item" data-keyword="${title}">
          <i class="bi bi-search me-2"></i> ${title}
        </div>
      `;
    }).join('');

    autocompleteContainer.style.display = 'block';

    // Add click handlers
    autocompleteContainer.querySelectorAll('.autocomplete-item').forEach(item => {
      item.addEventListener('click', () => {
        const keyword = item.dataset.keyword;
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.value = keyword;
          hideAutocomplete();
          if (window.location.pathname.includes('search.html')) {
            performSearch(keyword, currentFilters, 1);
          } else {
            window.location.href = `search.html?q=${encodeURIComponent(keyword)}`;
          }
        }
      });
    });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    hideAutocomplete();
  }
}

/**
 * Hide autocomplete dropdown
 */
function hideAutocomplete() {
  const autocompleteContainer = document.getElementById('autocomplete-container');
  if (autocompleteContainer) {
    autocompleteContainer.style.display = 'none';
  }
}

/**
 * Perform search
 * @param {string} keyword - Search keyword
 * @param {Object} filters - Filter options
 * @param {number} page - Page number
 */
async function performSearch(keyword, filters = {}, page = 1) {
  currentSearchKeyword = keyword;
  currentFilters = filters;
  currentPage = page;

  const resultsContainer = document.getElementById('search-results');
  if (!resultsContainer) return;

  // Update URL
  const url = new URL(window.location);
  url.searchParams.set('q', keyword);
  url.searchParams.set('filter', filters.subjectType || 0);
  if (page > 1) {
    url.searchParams.set('page', page);
  } else {
    url.searchParams.delete('page'); // Remove page param if page 1
  }
  window.history.pushState({}, '', url);

  // Show loading
  ui.showLoading(resultsContainer, 'grid');

  try {
    const response = await api.search(keyword, filters, page);
    const data = response.data || response;
    const items = data.items || response.items || [];
    const pager = data.pager || response.pager || {};

    // Render results
    if (items.length > 0) {
      ui.renderMovieGrid(resultsContainer, items);
    } else {
      ui.showEmptyState(resultsContainer, `No results found for "${keyword}"`);
    }

    // Update pagination
    updatePagination(pager, keyword, filters);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Search error:', error);
      // Redirect to 404 page on any error
      window.location.href = '404.html';
    }
}

/**
 * Update pagination controls
 * @param {Object} pager - Pagination info
 * @param {string} keyword - Search keyword
 * @param {Object} filters - Filter options
 */
function updatePagination(pager, keyword = null, filters = null) {
  const paginationContainer = document.getElementById('pagination');
  if (!paginationContainer) return;

  // Handle page as string or number from API
  const pageStr = pager.page || pager.pageNumber || '1';
  const page = parseInt(pageStr, 10) || 1;
  const perPage = parseInt(pager.perPage || pager.per_page || 24, 10);
  const totalCount = parseInt(pager.totalCount || pager.total_count || 0, 10);
  const hasMore = pager.hasMore !== false && pager.hasMore !== undefined ? (pager.hasMore === true || pager.hasMore === 'true') : false;
  const nextPage = pager.nextPage ? parseInt(pager.nextPage, 10) : null;
  
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / perPage) : (hasMore ? page + 1 : page);

  // Only hide pagination if we're on first page and there's no more pages
  if (page === 1 && !hasMore && totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }

  let paginationHTML = '<nav><ul class="pagination justify-content-center">';

  // Previous button
  const prevPage = page > 1 ? page - 1 : 1;
  paginationHTML += `
    <li class="page-item ${page === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${prevPage}" ${page === 1 ? 'tabindex="-1" aria-disabled="true"' : ''}>Previous</a>
    </li>
  `;

  // Page numbers - show up to 5 pages around current
  const maxPages = 5;
  let startPage = Math.max(1, page - Math.floor(maxPages / 2));
  let endPage = Math.min(totalPages, startPage + maxPages - 1);
  
  if (endPage - startPage < maxPages - 1) {
    startPage = Math.max(1, endPage - maxPages + 1);
  }

  // First page and ellipsis
  if (startPage > 1) {
    paginationHTML += `<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>`;
    if (startPage > 2) {
      paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
  }

  // Page number buttons
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <li class="page-item ${i === page ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}" ${i === page ? 'aria-current="page"' : ''}>${i}</a>
      </li>
    `;
  }

  // Last page and ellipsis
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
    paginationHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>`;
  }

  // Next button - use nextPage from API if available, otherwise calculate
  const nextPageNum = nextPage || (hasMore ? page + 1 : page);
  const isNextDisabled = !hasMore && page >= totalPages;
  
  paginationHTML += `
    <li class="page-item ${isNextDisabled ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${nextPageNum}" ${isNextDisabled ? 'tabindex="-1" aria-disabled="true"' : ''}>Next</a>
    </li>
  `;

  paginationHTML += '</ul></nav>';

  paginationContainer.innerHTML = paginationHTML;

  // Add click handlers
  paginationContainer.querySelectorAll('.page-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageNum = parseInt(link.dataset.page, 10);
      const searchKeyword = keyword !== null ? keyword : currentSearchKeyword;
      const searchFilters = filters !== null ? filters : currentFilters;
      
      if (pageNum && pageNum !== currentPage && !link.closest('.disabled')) {
        performSearch(searchKeyword, searchFilters, pageNum);
      }
    });
  });
}

// Initialize navbar active state
function initNavbarActiveState() {
  const path = window.location.pathname;
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href) {
      if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        if (href.includes('index.html') || href === '/') {
          link.classList.add('active');
        }
      } else if (path.includes('search.html') && href.includes('search.html')) {
        link.classList.add('active');
      } else if (path.includes('movie-detail.html')) {
        // Keep current active state or default to home
      }
    }
  });
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initSearch();
    initNavbarActiveState();
  });
} else {
  initSearch();
  initNavbarActiveState();
}

/**
 * Load popular searches
 */
async function loadPopularSearches() {
  const popularSearchesContainer = document.getElementById('popular-searches');
  if (!popularSearchesContainer) return;
  
  try {
    const response = await api.popularSearches();
    const data = response.data || response;
    const searches = data.everyoneSearch || [];
    
    if (searches.length > 0) {
      popularSearchesContainer.innerHTML = `
        <div class="popular-searches-content">
          <h6 class="text-muted mb-2">Popular Searches:</h6>
          <div class="popular-tags">
            ${searches.slice(0, 10).map(item => `
              <button class="popular-tag" data-keyword="${item.title || item}">
                ${item.title || item}
              </button>
            `).join('')}
          </div>
        </div>
      `;
      
      // Add click handlers
      popularSearchesContainer.querySelectorAll('.popular-tag').forEach(tag => {
        tag.addEventListener('click', () => {
          const keyword = tag.dataset.keyword;
          const searchInput = document.getElementById('search-input');
          if (searchInput) {
            searchInput.value = keyword;
            performSearch(keyword, currentFilters, 1);
          }
        });
      });
    }
  } catch (error) {
    console.error('Error loading popular searches:', error);
  }
}

// Export for global use
if (typeof window !== 'undefined') {
  window.searchModule = {
    performSearch,
    initSearch,
    loadPopularSearches,
  };
}

