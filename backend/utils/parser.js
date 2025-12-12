/**
 * HTML/JSON Parsing Utilities
 * Extracts JSON data from HTML pages
 */

const cheerio = require('cheerio');

/**
 * Parse movie detail page HTML to extract JSON data
 * Based on src/moviebox_api/extractor/_core.py JsonDetailsExtractor
 * @param {string} html - HTML content of the movie detail page
 * @param {boolean} whole - If true, returns the whole extracted object; otherwise returns processed data
 * @returns {Object} Extracted movie details
 */
function parseMovieDetailPage(html, whole = false) {
  try {
    const $ = cheerio.load(html);
    
    // Find script tag with id="__NUXT_DATA__" or type="application/json"
    let scriptTag = $('script[id="__NUXT_DATA__"]').first();
    if (!scriptTag.length) {
      scriptTag = $('script[type="application/json"][data-nuxt-data]').first();
    }
    if (!scriptTag.length) {
      scriptTag = $('script[type="application/json"]').first();
    }
    
    if (!scriptTag.length) {
      throw new Error('No JSON data found in page');
    }

    const jsonText = scriptTag.text();
    const data = JSON.parse(jsonText);

    // The data structure is an array where entries can be references to other array indices
    // We need to resolve these references
    function resolveValue(value) {
      if (Array.isArray(value)) {
        return value.map(index => {
          if (typeof index === 'number' && index >= 0 && index < data.length) {
            return resolveValue(data[index]);
          }
          return resolveValue(index);
        });
      } else if (typeof value === 'object' && value !== null) {
        // Handle special types like "Reactive", "ShallowReactive", "Set"
        if (Array.isArray(value) && value.length >= 2) {
          const type = value[0];
          if (type === 'Reactive' || type === 'ShallowReactive') {
            return resolveValue(data[value[1]]);
          } else if (type === 'Set') {
            return new Set(resolveValue(value.slice(1)));
          }
        }
        
        const processedValue = {};
        for (const [key, val] of Object.entries(value)) {
          if (typeof val === 'number' && val >= 0 && val < data.length) {
            processedValue[key] = resolveValue(data[val]);
          } else {
            processedValue[key] = resolveValue(val);
          }
        }
        return processedValue;
      }
      return value;
    }

    // Extract entries that have a 'state' property (these contain the actual data)
    const extracts = [];
    for (const entry of data) {
      if (typeof entry === 'object' && entry !== null && !Array.isArray(entry)) {
        const resolvedEntry = {};
        for (const [key, index] of Object.entries(entry)) {
          if (typeof index === 'number' && index >= 0 && index < data.length) {
            resolvedEntry[key] = resolveValue(data[index]);
          } else {
            resolvedEntry[key] = resolveValue(index);
          }
        }
        extracts.push(resolvedEntry);
      }
    }

    if (extracts.length === 0) {
      throw new Error('No extractable data found');
    }

    // If whole is true, return the first extract as-is
    if (whole) {
      return extracts[0];
    }

    // Otherwise, extract the state data and process it
    // Look for entries with 'state' property
    let targetData = null;
    for (const extract of extracts) {
      if (extract.state && Array.isArray(extract.state) && extract.state.length > 1) {
        targetData = extract.state[1];
        break;
      }
    }

    // If no state found, try to find resData or data property
    if (!targetData) {
      for (const extract of extracts) {
        if (extract.resData || extract.data || extract.$sdata) {
          targetData = extract.resData || extract.data || extract;
          break;
        }
      }
    }

    // If still no target data, use the first extract
    if (!targetData) {
      targetData = extracts[0];
    }

    // Process the target data: remove $s prefix from keys
    const processedData = {};
    for (const [key, value] of Object.entries(targetData)) {
      const newKey = key.startsWith('$s') ? key.substring(2) : key;
      processedData[newKey] = value;
    }

    // Try to extract resData if it exists (contains subject, stars, resource, metadata)
    if (processedData.resData) {
      const resData = processedData.resData;
      const resource = resData.resource || {};
      
      // Process seasons if they exist in resource
      let processedSeasons = [];
      if (resource.seasons && Array.isArray(resource.seasons)) {
        processedSeasons = resource.seasons.map((season, seasonIndex) => {
          const seasonNum = season.se || season.season || seasonIndex + 1;
          const maxEp = season.maxEp || season.allEp || 0;
          
          // Generate episode numbers from 1 to maxEp
          const episodeNumbers = [];
          if (maxEp > 0) {
            for (let i = 1; i <= maxEp; i++) {
              episodeNumbers.push(i);
            }
          }
          
          // Extract available resolutions for this season
          const resolutions = season.resolutions || [];
          const availableResolutions = resolutions.map(res => ({
            resolution: res.resolution || res,
            quality: res.resolution ? `${res.resolution}p` : res,
          }));
          
          return {
            season: seasonNum,
            se: seasonNum,
            maxEp: maxEp,
            totalEpisodes: maxEp,
            episodeNumbers: episodeNumbers,
            resolutions: availableResolutions,
          };
        });
      }
      
      // Update resource with processed seasons
      const updatedResource = {
        ...resource,
        seasons: processedSeasons.length > 0 ? processedSeasons : resource.seasons,
      };
      
      // Extract subject with IMDB data
      const subject = resData.subject || {};
      const metadata = resData.metadata || {};
      
      // Ensure IMDB data is available (check both subject and metadata)
      const imdbRatingValue = subject.imdbRatingValue || metadata.imdbRatingValue || null;
      const imdbRatingCount = subject.imdbRatingCount || metadata.imdbRatingCount || null;
      
      // Structure the response to match expected format
      return {
        // Subject information (movie/TV show details) - ensure IMDB data is included
        subject: {
          ...subject,
          imdbRatingValue: imdbRatingValue,
          imdbRatingCount: imdbRatingCount,
        },
        // Cast/Staff information
        stars: resData.stars || [],
        // Resource information (seasons, episodes, resolutions)
        resource: updatedResource,
        // Metadata (description, keywords, etc.) - ensure IMDB data is included
        metadata: {
          ...metadata,
          imdbRatingValue: imdbRatingValue,
          imdbRatingCount: imdbRatingCount,
        },
        // Reviews/Posts
        postList: resData.postList || {},
        // For You recommendations
        forYou: resData.forYou || [],
        // Hot content
        hot: resData.hot || [],
        // Share parameters
        shareParam: resData.shareParam || {},
        // Publication parameters
        pubParam: resData.pubParam || {},
        // URL
        url: resData.url || processedData.url,
        // Referer
        referer: resData.referer || processedData.referer,
        // Processed seasons (for easy access)
        seasons: processedSeasons,
        // IMDB data (for easy access)
        imdbRating: imdbRatingValue,
        imdbRatingCount: imdbRatingCount,
        // Raw resData for backward compatibility
        resData: {
          ...resData,
          resource: updatedResource,
          subject: {
            ...subject,
            imdbRatingValue: imdbRatingValue,
            imdbRatingCount: imdbRatingCount,
          },
        },
        // All other processed data
        ...processedData,
      };
    }

    return processedData;
  } catch (error) {
    throw new Error(`Failed to parse movie detail page: ${error.message}`);
  }
}

/**
 * Parse downloadable metadata from movie detail page HTML
 * Extracts seasons, episodes, download links, and qualities
 * @param {string} html - HTML content of the movie detail page
 * @returns {Object} Extracted downloadable metadata
 */
function parseDownloadableMetadata(html) {
  try {
    const $ = cheerio.load(html);
    
    // Find script tag with type="application/json"
    const scriptTag = $('script[type="application/json"]').first();
    
    if (!scriptTag.length) {
      throw new Error('No JSON data found in page');
    }

    const jsonText = scriptTag.text();
    const data = JSON.parse(jsonText);

    // Resolve references in the data structure
    function resolveValue(value) {
      if (Array.isArray(value)) {
        return value.map(index => {
          if (typeof index === 'number') {
            return resolveValue(data[index]);
          }
          return resolveValue(index);
        });
      } else if (typeof value === 'object' && value !== null) {
        const processedValue = {};
        for (const [key, val] of Object.entries(value)) {
          if (typeof val === 'number' && val < data.length) {
            processedValue[key] = resolveValue(data[val]);
          } else {
            processedValue[key] = resolveValue(val);
          }
        }
        return processedValue;
      }
      return value;
    }

    // Extract all meaningful entries
    const extracts = [];
    for (const entry of data) {
      if (typeof entry === 'object' && entry !== null && !Array.isArray(entry)) {
        const details = {};
        for (const [key, index] of Object.entries(entry)) {
          if (typeof index === 'number' && index < data.length) {
            details[key] = resolveValue(data[index]);
          } else {
            details[key] = resolveValue(index);
          }
        }
        extracts.push(details);
      }
    }

    if (extracts.length === 0) {
      throw new Error('No extractable data found');
    }

    // Find the main data entry (usually contains resData or similar)
    let mainData = null;
    for (const extract of extracts) {
      if (extract.resData || extract.resource || extract.subject) {
        mainData = extract;
        break;
      }
    }
    
    if (!mainData) {
      mainData = extracts[0];
    }

    // Extract resource information
    const resData = mainData.resData || mainData;
    const resource = resData.resource || resData;
    const subject = resData.subject || resData.metadata || {};
    
    // Extract seasons and episodes structure
    const seasons = resource.seasons || [];
    const episodes = [];
    
    // Process seasons to extract episode information
    // TV shows have maxEp (maximum episodes) instead of an episodes array
    const processedSeasons = seasons.map((season, seasonIndex) => {
      const seasonNum = season.se || season.season || seasonIndex + 1;
      const maxEp = season.maxEp || season.allEp || 0;
      
      // Generate episode numbers from 1 to maxEp
      const episodeNumbers = [];
      if (maxEp > 0) {
        for (let i = 1; i <= maxEp; i++) {
          episodeNumbers.push(i);
        }
      }
      
      // Extract available resolutions for this season
      const resolutions = season.resolutions || [];
      const availableResolutions = resolutions.map(res => ({
        resolution: res.resolution || res,
        quality: res.resolution ? `${res.resolution}p` : res,
      }));
      
      return {
        season: seasonNum,
        maxEp: maxEp,
        totalEpisodes: maxEp,
        episodeNumbers: episodeNumbers,
        resolutions: availableResolutions,
      };
    });

    // Extract available resolutions from resource
    const availableResolutions = resource.resolutions || [];
    const downloadQualities = availableResolutions.map(res => ({
      resolution: res.resolution || res,
      quality: res.resolution ? `${res.resolution}p` : res,
    }));

    // Extract subtitle information
    const subtitles = subject.subtitles || resource.subtitles || '';
    const subtitleLanguages = subtitles ? subtitles.split(',').map(s => s.trim()) : [];

    return {
      subjectId: subject.subjectId || resource.subjectId,
      subjectType: subject.subjectType || resource.subjectType,
      title: subject.title || resource.title,
      detailPath: subject.detailPath || resource.detailPath,
      seasons: processedSeasons,
      episodes: episodes,
      availableResolutions: downloadQualities,
      subtitleLanguages: subtitleLanguages,
      hasResource: resource.hasResource || subject.hasResource || false,
    };
  } catch (error) {
    throw new Error(`Failed to parse downloadable metadata: ${error.message}`);
  }
}

/**
 * Fetch and scrape movie/TV show details from HTML endpoint
 * This function handles the complete flow: HTTP request -> HTML parsing -> Data extraction
 * @param {string} detailPath - Detail path (e.g., "avatar-WLDIi21IUBa")
 * @param {string} subjectId - Subject ID (e.g., "8906247916759695608")
 * @param {Object} options - Optional configuration
 * @param {Function} options.fetchFn - Custom fetch function (default: uses axios)
 * @param {Object} options.headers - Custom headers (default: uses getDefaultHeaders)
 * @param {string} options.baseUrl - Base URL (default: from constants)
 * @returns {Promise<Object>} Extracted movie/TV show details
 */
async function fetchMovieDetailsFromHTML(detailPath, subjectId, options = {}) {
  const axios = require('axios');
  const { HOST_URL } = require('../config/constants');
  const { getDefaultHeaders } = require('./headers');
  const { ensureCookiesAreAssigned } = require('./proxy');

  const {
    fetchFn = null,
    headers = null,
    baseUrl = HOST_URL,
  } = options;

  try {
    // Construct the URL
    const url = `${baseUrl}movies/${detailPath}?id=${subjectId}`;
    
    // Get headers
    const requestHeaders = headers || getDefaultHeaders();
    
    // Get cookies and add to headers
    const cookies = await ensureCookiesAreAssigned();
    if (cookies) {
      requestHeaders['Cookie'] = cookies;
    }

    // Fetch HTML
    let html;
    if (fetchFn) {
      html = await fetchFn(url, requestHeaders);
    } else {
      const response = await axios.get(url, {
        headers: requestHeaders,
        timeout: 30000,
      });
      html = response.data;
    }

    // Parse and extract data
    const movieDetails = parseMovieDetailPage(html);
    
    // Also extract downloadable metadata for seasons/episodes structure
    let downloadableMetadata = null;
    try {
      downloadableMetadata = parseDownloadableMetadata(html);
    } catch (err) {
      console.warn('Could not parse downloadable metadata:', err.message);
    }

    // Merge downloadable metadata if available
    if (downloadableMetadata) {
      movieDetails.seasons = downloadableMetadata.seasons;
      movieDetails.availableResolutions = downloadableMetadata.availableResolutions;
      movieDetails.subtitleLanguages = downloadableMetadata.subtitleLanguages;
    }

    return movieDetails;
  } catch (error) {
    throw new Error(`Failed to fetch movie details: ${error.message}`);
  }
}

module.exports = {
  parseMovieDetailPage,
  parseDownloadableMetadata,
  fetchMovieDetailsFromHTML,
};

