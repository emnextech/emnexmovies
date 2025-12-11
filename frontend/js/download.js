/**
 * Download Management
 * Handles download queue, progress tracking, and history
 */

const downloadQueue = new Map();
const downloadHistory = JSON.parse(localStorage.getItem('downloadHistory') || '[]');

/**
 * Download item structure
 */
class DownloadItem {
  constructor(id, url, filename, type = 'video') {
    this.id = id;
    this.url = url;
    this.filename = filename;
    this.type = type;
    this.status = 'pending'; // pending, downloading, completed, failed, paused
    this.progress = 0;
    this.loaded = 0;
    this.total = 0;
    this.speed = 0;
    this.eta = 0;
    this.startTime = null;
    this.xhr = null;
  }
}

/**
 * Add download to queue
 * @param {string} url - File URL
 * @param {string} filename - Download filename
 * @param {string} type - File type (video, subtitle)
 * @returns {string} Download ID
 */
function addDownload(url, filename, type = 'video') {
  const id = `download-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const download = new DownloadItem(id, url, filename, type);
  
  downloadQueue.set(id, download);
  startDownload(id);
  
  return id;
}

/**
 * Start download
 * @param {string} id - Download ID
 */
function startDownload(id) {
  const download = downloadQueue.get(id);
  if (!download || download.status !== 'pending') return;

  download.status = 'downloading';
  download.startTime = Date.now();
  
  const downloadUrl = `/api/download?url=${encodeURIComponent(download.url)}&filename=${encodeURIComponent(download.filename)}`;
  const xhr = new XMLHttpRequest();
  
  download.xhr = xhr;
  
  xhr.open('GET', downloadUrl, true);
  xhr.responseType = 'blob';

  let lastLoaded = 0;
  let lastTime = Date.now();

  xhr.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      download.loaded = e.loaded;
      download.total = e.total;
      download.progress = (e.loaded / e.total) * 100;

      // Calculate speed
      const now = Date.now();
      const timeDiff = (now - lastTime) / 1000; // seconds
      const loadedDiff = e.loaded - lastLoaded;
      
      if (timeDiff > 0) {
        download.speed = loadedDiff / timeDiff; // bytes per second
      }

      // Calculate ETA
      const remaining = e.total - e.loaded;
      if (download.speed > 0) {
        download.eta = remaining / download.speed; // seconds
      }

      lastLoaded = e.loaded;
      lastTime = now;

      updateDownloadUI(id);
    }
  });

  xhr.onload = () => {
    if (xhr.status === 200) {
      // Create download link
      const blob = xhr.response;
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = download.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      download.status = 'completed';
      download.progress = 100;
      
      // Add to history
      addToHistory(download);
      
      // Remove from queue after 5 seconds
      setTimeout(() => {
        downloadQueue.delete(id);
        updateDownloadUI();
      }, 5000);
    } else {
      download.status = 'failed';
      ui.showToast(`Download failed: ${download.filename}`, 'error');
    }
    
    updateDownloadUI(id);
  };

  xhr.onerror = () => {
    download.status = 'failed';
    ui.showToast(`Download failed: ${download.filename}`, 'error');
    updateDownloadUI(id);
  };

  xhr.send();
  updateDownloadUI(id);
}

/**
 * Pause download
 * @param {string} id - Download ID
 */
function pauseDownload(id) {
  const download = downloadQueue.get(id);
  if (download && download.xhr) {
    download.xhr.abort();
    download.status = 'paused';
    download.xhr = null;
    updateDownloadUI(id);
  }
}

/**
 * Resume download
 * @param {string} id - Download ID
 */
function resumeDownload(id) {
  const download = downloadQueue.get(id);
  if (download && download.status === 'paused') {
    download.status = 'pending';
    startDownload(id);
  }
}

/**
 * Cancel download
 * @param {string} id - Download ID
 */
function cancelDownload(id) {
  const download = downloadQueue.get(id);
  if (download && download.xhr) {
    download.xhr.abort();
  }
  downloadQueue.delete(id);
  updateDownloadUI();
}

/**
 * Add download to history
 * @param {Object} download - Download item
 */
function addToHistory(download) {
  const historyItem = {
    id: download.id,
    filename: download.filename,
    type: download.type,
    completedAt: new Date().toISOString(),
    size: download.total,
  };

  downloadHistory.unshift(historyItem);
  
  // Keep only last 100 items
  if (downloadHistory.length > 100) {
    downloadHistory.pop();
  }

  localStorage.setItem('downloadHistory', JSON.stringify(downloadHistory));
}

/**
 * Get download history
 * @returns {Array} Download history
 */
function getDownloadHistory() {
  return downloadHistory;
}

/**
 * Clear download history
 */
function clearDownloadHistory() {
  downloadHistory.length = 0;
  localStorage.setItem('downloadHistory', JSON.stringify(downloadHistory));
  renderDownloadHistory();
}

/**
 * Update download UI
 * @param {string} id - Optional download ID to update specific item
 */
function updateDownloadUI(id = null) {
  const container = document.getElementById('active-downloads');
  if (!container) return;

  const downloads = Array.from(downloadQueue.values());
  
  if (downloads.length === 0) {
    container.innerHTML = '<p class="text-muted">No active downloads</p>';
    return;
  }

  const itemsToRender = id ? downloads.filter(d => d.id === id) : downloads;

  container.innerHTML = itemsToRender.map(download => {
    const statusBadge = {
      pending: '<span class="badge bg-secondary">Pending</span>',
      downloading: '<span class="badge bg-primary">Downloading</span>',
      paused: '<span class="badge bg-warning">Paused</span>',
      completed: '<span class="badge bg-success">Completed</span>',
      failed: '<span class="badge bg-danger">Failed</span>',
    }[download.status] || '';

    const speedText = download.speed > 0 ? ui.formatFileSize(download.speed) + '/s' : 'Calculating...';
    const etaText = download.eta > 0 ? formatETA(download.eta) : 'Calculating...';
    const progressText = download.total > 0 
      ? `${ui.formatFileSize(download.loaded)} / ${ui.formatFileSize(download.total)}`
      : 'Unknown size';

    return `
      <div class="download-item" data-download-id="${download.id}">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div class="flex-grow-1">
            <h6 class="mb-1">${download.filename}</h6>
            ${statusBadge}
          </div>
          <div class="btn-group btn-group-sm">
            ${download.status === 'downloading' 
              ? `<button class="btn btn-outline-warning" onclick="downloadModule.pauseDownload('${download.id}')">Pause</button>`
              : download.status === 'paused'
              ? `<button class="btn btn-outline-success" onclick="downloadModule.resumeDownload('${download.id}')">Resume</button>`
              : ''
            }
            <button class="btn btn-outline-danger" onclick="downloadModule.cancelDownload('${download.id}')">Cancel</button>
          </div>
        </div>
        <div class="progress mb-2">
          <div class="progress-bar" role="progressbar" style="width: ${download.progress}%"></div>
        </div>
        <div class="download-progress-info">
          <span>${progressText}</span>
          <span>${speedText}</span>
          <span>ETA: ${etaText}</span>
          <span>${Math.round(download.progress)}%</span>
        </div>
      </div>
    `;
  }).join('');

  // Update stats
  updateDownloadStats();
}

/**
 * Format ETA
 * @param {number} seconds - Seconds remaining
 * @returns {string} Formatted ETA
 */
function formatETA(seconds) {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

/**
 * Render download history
 */
function renderDownloadHistory() {
  const container = document.getElementById('download-history');
  if (!container) return;

  const history = getDownloadHistory();

  if (history.length === 0) {
    container.innerHTML = '<p class="text-muted">No download history</p>';
    return;
  }

  container.innerHTML = history.map(item => {
    const sizeText = item.size ? ui.formatFileSize(item.size) : 'Unknown size';
    const dateText = ui.formatDate(item.completedAt);

    return `
      <div class="download-item">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h6 class="mb-1">${item.filename}</h6>
            <small class="text-muted">${sizeText} • ${dateText}</small>
          </div>
          <span class="badge bg-success">Completed</span>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Update download stats
 */
function updateDownloadStats() {
  const activeCount = downloadQueue.size;
  const completedCount = downloadHistory.length;
  const downloadingCount = Array.from(downloadQueue.values()).filter(d => d.status === 'downloading').length;

  const activeStat = document.getElementById('stat-active');
  const completedStat = document.getElementById('stat-completed');
  const downloadingStat = document.getElementById('stat-downloading');

  if (activeStat) activeStat.textContent = activeCount;
  if (completedStat) completedStat.textContent = completedCount;
  if (downloadingStat) downloadingStat.textContent = downloadingCount;
}

// Initialize download manager page
function initDownloadManager() {
  updateDownloadUI();
  renderDownloadHistory();
  updateDownloadStats();

  // Clear history button
  const clearBtn = document.getElementById('clear-history-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear download history?')) {
        clearDownloadHistory();
      }
    });
  }

  // Auto-refresh every second
  setInterval(() => {
    updateDownloadUI();
  }, 1000);
}

// Export for global use
if (typeof window !== 'undefined') {
  window.downloadModule = {
    addDownload,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    getDownloadHistory,
    clearDownloadHistory,
    updateDownloadUI,
    renderDownloadHistory,
    initDownloadManager,
  };
}

