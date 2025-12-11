/**
 * Filename Generation Utilities
 * Generates proper filenames for downloaded media files
 */

/**
 * Clean a string to be safe for use as a filename
 * @param {string} str - String to clean
 * @returns {string} Cleaned string
 */
function cleanFilename(str) {
  if (!str) return '';
  return str
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Generate filename for downloaded media files
 * @param {Object} options - Filename generation options
 * @param {string} options.title - Movie/series title
 * @param {number|string} options.year - Release year
 * @param {number|string} options.season - Season number (for TV series)
 * @param {number|string} options.episode - Episode number (for TV series)
 * @param {string|number} options.resolution - Video resolution (e.g., "1080p", "720p", 1080)
 * @param {string} options.quality - Quality string (fallback for resolution)
 * @param {string} options.extension - File extension (default: 'mp4')
 * @returns {string} Generated filename
 */
function generateMediaFilename(options = {}) {
  const {
    title,
    year,
    season,
    episode,
    resolution,
    quality,
    extension = 'mp4'
  } = options;
  
  // Clean title
  const cleanTitle = cleanFilename(title || 'video');
  
  // Format year
  const yearPart = year ? ` (${year})` : '';
  
  // Format resolution/quality
  let resPart = '';
  if (resolution) {
    // Handle both "1080p" and 1080 formats
    const resStr = String(resolution).replace(/[pP]/g, '');
    resPart = `_${resStr}p`;
  } else if (quality && quality !== 'BEST' && quality !== 'WORST') {
    resPart = `_${quality}`;
  }
  
  // Generate filename based on type
  if (season && episode && parseInt(season) > 0 && parseInt(episode) > 0) {
    // TV Series format: Title (Year) S01E05_1080p.mp4
    const seasonNum = String(parseInt(season)).padStart(2, '0');
    const episodeNum = String(parseInt(episode)).padStart(2, '0');
    return `${cleanTitle}${yearPart} S${seasonNum}E${episodeNum}${resPart}.${extension}`;
  }
  
  // Movie format: Title (Year)_1080p.mp4
  return `${cleanTitle}${yearPart}${resPart}.${extension}`;
}

/**
 * Extract file extension from URL or content type
 * @param {string} url - File URL
 * @param {string} contentType - Content-Type header value
 * @returns {string} File extension
 */
function extractExtension(url, contentType) {
  // Try to get extension from URL
  if (url) {
    const urlParts = url.split('/');
    const urlFilename = urlParts[urlParts.length - 1].split('?')[0];
    const ext = urlFilename.split('.').pop();
    if (ext && ext.length <= 5) { // Reasonable extension length
      return ext.toLowerCase();
    }
  }
  
  // Fallback to content type
  if (contentType) {
    if (contentType.includes('mp4')) return 'mp4';
    if (contentType.includes('mkv')) return 'mkv';
    if (contentType.includes('webm')) return 'webm';
    if (contentType.includes('avi')) return 'avi';
    if (contentType.includes('mov')) return 'mov';
  }
  
  return 'mp4'; // Default
}

module.exports = {
  generateMediaFilename,
  cleanFilename,
  extractExtension,
};

