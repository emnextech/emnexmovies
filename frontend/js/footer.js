/**
 * Load footer from footer.html into all pages
 */
function loadFooter() {
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (!footerPlaceholder) return;
  
  fetch('footer.html')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load footer');
      }
      return response.text();
    })
    .then(html => {
      footerPlaceholder.innerHTML = html;
    })
    .catch(error => {
      console.error('Error loading footer:', error);
      // Fallback footer if fetch fails
      footerPlaceholder.innerHTML = `
        <footer class="bg-dark-surface text-center py-4 mt-5">
          <div class="container">
            <p class="text-muted mb-2">
              Disclaimer: We do not store any files on our server. All contents are provided by non-affiliated third parties. We just index those links which are already available in internet.
            </p>
            <p class="mb-0" style="color: var(--text-secondary);">&copy; ${new Date().getFullYear()} Emnexmovies. All rights reserved.</p>
          </div>
        </footer>
      `;
    });
}

// Load footer when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadFooter);
} else {
  loadFooter();
}

