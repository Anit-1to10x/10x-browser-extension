/**
 * ClaudeKit Browser Controller - Popup Script
 *
 * Displays connection status, activity stats, and rate limits
 */

// Rate limit configuration (must match handlers)
const RATE_LIMITS = {
  linkedin_connections: { daily: 15, key: 'linkedin_connections_today' },
  linkedin_messages: { daily: 40, key: 'linkedin_messages_today' },
  linkedin_profile_views: { daily: 100, key: 'linkedin_profile_views_today' },
  linkedin_likes: { daily: 50, key: 'linkedin_likes_today' }
};

// Activity counters
const ACTIVITY_KEYS = {
  linkedin: 'activity_linkedin_today',
  instagram: 'activity_instagram_today',
  twitter: 'activity_twitter_today',
  google: 'activity_google_today'
};

/**
 * Initialize popup
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[ClaudeKit Popup] Initializing...');

  // Set extension ID
  document.getElementById('extension-id').textContent = chrome.runtime.id;

  // Load connection status
  await updateConnectionStatus();

  // Load activity stats
  await updateActivityStats();

  // Load rate limits
  await updateRateLimits();

  // Setup event listeners
  setupEventListeners();

  // Auto-refresh every 5 seconds
  setInterval(async () => {
    await updateConnectionStatus();
    await updateActivityStats();
    await updateRateLimits();
  }, 5000);

  console.log('[ClaudeKit Popup] Initialized');
});

/**
 * Update connection status
 */
async function updateConnectionStatus() {
  try {
    // Query background worker for connection status
    const response = await chrome.runtime.sendMessage({ type: 'GET_CONNECTION_STATUS' });

    const statusCard = document.getElementById('connection-status');
    const statusIndicator = statusCard.querySelector('.status-indicator');

    if (response && response.connected) {
      // Connected
      statusIndicator.className = 'status-indicator status-connected';
      statusIndicator.querySelector('.status-text').textContent = 'Connected';
    } else {
      // Disconnected
      statusIndicator.className = 'status-indicator status-disconnected';
      statusIndicator.querySelector('.status-text').textContent = 'Disconnected';
    }
  } catch (error) {
    console.error('[ClaudeKit Popup] Error checking connection:', error);

    // Show disconnected state on error
    const statusCard = document.getElementById('connection-status');
    const statusIndicator = statusCard.querySelector('.status-indicator');
    statusIndicator.className = 'status-indicator status-disconnected';
    statusIndicator.querySelector('.status-text').textContent = 'Error';
  }
}

/**
 * Update activity stats
 */
async function updateActivityStats() {
  const today = new Date().toISOString().split('T')[0];

  try {
    // Get all activity counts for today
    const keys = Object.values(ACTIVITY_KEYS).map(key => `${key}_${today}`);
    const result = await chrome.storage.local.get(keys);

    // Update LinkedIn count
    const linkedinCount = result[`${ACTIVITY_KEYS.linkedin}_${today}`] || 0;
    document.getElementById('linkedin-count').textContent = linkedinCount;

    // Update Instagram count
    const instagramCount = result[`${ACTIVITY_KEYS.instagram}_${today}`] || 0;
    document.getElementById('instagram-count').textContent = instagramCount;

    // Update Twitter count
    const twitterCount = result[`${ACTIVITY_KEYS.twitter}_${today}`] || 0;
    document.getElementById('twitter-count').textContent = twitterCount;

    // Update Google count
    const googleCount = result[`${ACTIVITY_KEYS.google}_${today}`] || 0;
    document.getElementById('google-count').textContent = googleCount;

  } catch (error) {
    console.error('[ClaudeKit Popup] Error loading activity stats:', error);
  }
}

/**
 * Update rate limits
 */
async function updateRateLimits() {
  const today = new Date().toISOString().split('T')[0];

  try {
    // Get all rate limit counts for today
    const keys = Object.values(RATE_LIMITS).map(config => `${config.key}_${today}`);
    const result = await chrome.storage.local.get(keys);

    // Update each rate limit
    for (const [limitKey, config] of Object.entries(RATE_LIMITS)) {
      const storageKey = `${config.key}_${today}`;
      const count = result[storageKey] || 0;
      const percentage = Math.min((count / config.daily) * 100, 100);

      // Update count text
      const countEl = document.querySelector(`[data-limit="${limitKey}"]`);
      if (countEl) {
        countEl.textContent = `${count}/${config.daily}`;
      }

      // Update progress bar
      const progressEl = document.querySelector(`[data-progress="${limitKey}"]`);
      if (progressEl) {
        progressEl.style.width = `${percentage}%`;

        // Change color if limit reached
        if (percentage >= 100) {
          progressEl.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
        } else {
          progressEl.style.background = 'linear-gradient(90deg, #6366f1, #4f46e5)';
        }
      }
    }
  } catch (error) {
    console.error('[ClaudeKit Popup] Error loading rate limits:', error);
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Reconnect button
  document.getElementById('reconnect-btn').addEventListener('click', async () => {
    console.log('[ClaudeKit Popup] Manual reconnect requested');

    try {
      // Send reconnect message to background worker
      await chrome.runtime.sendMessage({ type: 'RECONNECT' });

      // Show connecting state
      const statusCard = document.getElementById('connection-status');
      const statusIndicator = statusCard.querySelector('.status-indicator');
      statusIndicator.className = 'status-indicator status-connecting';
      statusIndicator.querySelector('.status-text').textContent = 'Reconnecting...';

      // Refresh status after 2 seconds
      setTimeout(updateConnectionStatus, 2000);
    } catch (error) {
      console.error('[ClaudeKit Popup] Reconnect failed:', error);
      alert('Failed to reconnect. Check console for details.');
    }
  });

  // Clear stats button
  document.getElementById('clear-stats-btn').addEventListener('click', async () => {
    if (!confirm('Clear all activity stats and rate limit counters for today?')) {
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];

      // Build list of keys to remove
      const keysToRemove = [
        ...Object.values(ACTIVITY_KEYS).map(key => `${key}_${today}`),
        ...Object.values(RATE_LIMITS).map(config => `${config.key}_${today}`)
      ];

      // Clear from storage
      await chrome.storage.local.remove(keysToRemove);

      console.log('[ClaudeKit Popup] Stats cleared');

      // Refresh UI
      await updateActivityStats();
      await updateRateLimits();

      // Show success feedback
      showNotification('Stats cleared successfully');
    } catch (error) {
      console.error('[ClaudeKit Popup] Error clearing stats:', error);
      alert('Failed to clear stats. Check console for details.');
    }
  });

  // Settings button
  document.getElementById('settings-btn').addEventListener('click', () => {
    // Open settings page (create this later)
    chrome.tabs.create({ url: chrome.runtime.getURL('popup/settings.html') });
  });
}

/**
 * Show notification toast
 */
function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 16px;
    right: 16px;
    padding: 12px 16px;
    background: #10b981;
    color: white;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

/**
 * Format number with commas
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Calculate percentage
 */
function calculatePercentage(current, max) {
  return Math.min((current / max) * 100, 100);
}
