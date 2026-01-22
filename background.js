/**
 * ClaudeKit Universal Browser Controller - Background Service Worker
 *
 * Connects to canvas WebSocket server and executes browser automation commands
 * Replaces Browser-Use MCP with direct extension control
 */

// Configuration
const CONFIG = {
  WEBSOCKET_URL: 'ws://localhost:3000/ws',
  HTTP_API_URL: 'http://localhost:3000/api',
  RECONNECT_DELAY: 5000,
  MAX_RECONNECT_ATTEMPTS: 10,
  HEARTBEAT_INTERVAL: 30000
};

// State
let ws = null;
let reconnectAttempts = 0;
let reconnectTimeout = null;
let heartbeatInterval = null;
let isConnected = false;
let pendingCommands = [];

// Database stores (IndexedDB)
const DB_NAME = 'ClaudeKitBrowser';
const DB_VERSION = 1;
const STORES = {
  ACTIVITIES: 'activities',
  COMMANDS: 'commands',
  RESULTS: 'results',
  SETTINGS: 'settings'
};

// Initialize extension
console.log('[ClaudeKit Browser] Extension loaded');
connectToWebSocket();

/**
 * Connect to Canvas WebSocket Server
 */
function connectToWebSocket() {
  if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
    console.log('[ClaudeKit Browser] Already connected or connecting');
    return;
  }

  console.log(`[ClaudeKit Browser] Connecting to ${CONFIG.WEBSOCKET_URL}...`);

  try {
    ws = new WebSocket(CONFIG.WEBSOCKET_URL);

    ws.onopen = handleWebSocketOpen;
    ws.onmessage = handleWebSocketMessage;
    ws.onerror = handleWebSocketError;
    ws.onclose = handleWebSocketClose;

  } catch (error) {
    console.error('[ClaudeKit Browser] WebSocket connection error:', error);
    scheduleReconnect();
  }
}

/**
 * Handle WebSocket open
 */
function handleWebSocketOpen() {
  console.log('[ClaudeKit Browser] ✅ Connected to Canvas WebSocket');
  isConnected = true;
  reconnectAttempts = 0;

  // Clear reconnect timeout
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  // Send identification message
  sendToWebSocket({
    type: 'extension-connected',
    payload: {
      extensionId: chrome.runtime.id,
      version: chrome.runtime.getManifest().version,
      capabilities: [
        'navigate',
        'click',
        'type',
        'scrape',
        'linkedin',
        'instagram',
        'twitter',
        'google'
      ]
    }
  });

  // Start heartbeat
  startHeartbeat();

  // Process pending commands
  processPendingCommands();

  // Update extension badge
  chrome.action.setBadgeText({ text: '✓' });
  chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
}

/**
 * Handle WebSocket message from Canvas
 */
async function handleWebSocketMessage(event) {
  try {
    const message = JSON.parse(event.data);
    console.log('[ClaudeKit Browser] Received command:', message.type);

    switch (message.type) {
      case 'browser-command':
        await executeBrowserCommand(message.payload);
        break;

      case 'linkedin-action':
        await executeLinkedInAction(message.payload);
        break;

      case 'instagram-action':
        await executeInstagramAction(message.payload);
        break;

      case 'twitter-action':
        await executeTwitterAction(message.payload);
        break;

      case 'google-action':
        await executeGoogleAction(message.payload);
        break;

      case 'ping':
        sendToWebSocket({ type: 'pong', timestamp: Date.now() });
        break;

      default:
        console.warn('[ClaudeKit Browser] Unknown message type:', message.type);
    }

  } catch (error) {
    console.error('[ClaudeKit Browser] Error handling message:', error);
    sendToWebSocket({
      type: 'error',
      error: error.message,
      originalMessage: event.data
    });
  }
}

/**
 * Handle WebSocket error
 */
function handleWebSocketError(error) {
  console.error('[ClaudeKit Browser] WebSocket error:', error);
  isConnected = false;

  chrome.action.setBadgeText({ text: '!' });
  chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
}

/**
 * Handle WebSocket close
 */
function handleWebSocketClose(event) {
  console.log('[ClaudeKit Browser] WebSocket closed:', event.code, event.reason);
  isConnected = false;

  stopHeartbeat();

  chrome.action.setBadgeText({ text: '✗' });
  chrome.action.setBadgeBackgroundColor({ color: '#6b7280' });

  // Auto-reconnect
  scheduleReconnect();
}

/**
 * Schedule reconnection
 */
function scheduleReconnect() {
  if (reconnectAttempts >= CONFIG.MAX_RECONNECT_ATTEMPTS) {
    console.error('[ClaudeKit Browser] Max reconnect attempts reached');
    return;
  }

  const delay = CONFIG.RECONNECT_DELAY * Math.pow(2, reconnectAttempts); // Exponential backoff
  reconnectAttempts++;

  console.log(`[ClaudeKit Browser] Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${CONFIG.MAX_RECONNECT_ATTEMPTS})`);

  reconnectTimeout = setTimeout(() => {
    connectToWebSocket();
  }, delay);
}

/**
 * Start heartbeat
 */
function startHeartbeat() {
  stopHeartbeat();

  heartbeatInterval = setInterval(() => {
    if (isConnected) {
      sendToWebSocket({ type: 'heartbeat', timestamp: Date.now() });
    }
  }, CONFIG.HEARTBEAT_INTERVAL);
}

/**
 * Stop heartbeat
 */
function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

/**
 * Send message to WebSocket
 */
function sendToWebSocket(message) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn('[ClaudeKit Browser] WebSocket not connected, queueing command');
    pendingCommands.push(message);
    return false;
  }

  try {
    ws.send(JSON.stringify(message));
    return true;
  } catch (error) {
    console.error('[ClaudeKit Browser] Error sending message:', error);
    pendingCommands.push(message);
    return false;
  }
}

/**
 * Process pending commands
 */
function processPendingCommands() {
  if (pendingCommands.length === 0) return;

  console.log(`[ClaudeKit Browser] Processing ${pendingCommands.length} pending commands`);

  const commands = [...pendingCommands];
  pendingCommands = [];

  commands.forEach(command => {
    sendToWebSocket(command);
  });
}

/**
 * Execute browser command
 */
async function executeBrowserCommand(command) {
  console.log('[ClaudeKit Browser] Executing command:', command.action);

  try {
    let result;

    switch (command.action) {
      case 'NAVIGATE':
        result = await navigateToUrl(command.url);
        break;

      case 'CLICK':
        result = await clickElement(command.selector, command.options);
        break;

      case 'TYPE':
        result = await typeText(command.selector, command.text, command.options);
        break;

      case 'SCRAPE':
        result = await scrapeData(command.selectors);
        break;

      case 'EXECUTE_SCRIPT':
        result = await executeScript(command.script, command.args);
        break;

      default:
        throw new Error(`Unknown action: ${command.action}`);
    }

    // Send success response
    sendToWebSocket({
      type: 'command-result',
      commandId: command.id,
      success: true,
      result
    });

  } catch (error) {
    console.error('[ClaudeKit Browser] Command failed:', error);

    sendToWebSocket({
      type: 'command-result',
      commandId: command.id,
      success: false,
      error: error.message
    });
  }
}

/**
 * Navigate to URL
 */
async function navigateToUrl(url) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  await chrome.tabs.update(tab.id, { url });

  // Wait for page load
  await new Promise((resolve) => {
    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
      if (tabId === tab.id && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    });
  });

  return { success: true, url };
}

/**
 * Click element
 */
async function clickElement(selector, options = {}) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (sel, opts) => {
      const element = document.querySelector(sel);
      if (!element) {
        throw new Error(`Element not found: ${sel}`);
      }

      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      if (opts.delay) {
        return new Promise(resolve => {
          setTimeout(() => {
            element.click();
            resolve({ clicked: true, selector: sel });
          }, opts.delay);
        });
      } else {
        element.click();
        return { clicked: true, selector: sel };
      }
    },
    args: [selector, options]
  });

  return result[0].result;
}

/**
 * Type text
 */
async function typeText(selector, text, options = {}) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (sel, txt, opts) => {
      const element = document.querySelector(sel);
      if (!element) {
        throw new Error(`Element not found: ${sel}`);
      }

      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus();

      // Clear existing text if specified
      if (opts.clear) {
        element.value = '';
      }

      // Type character by character if humanize is enabled
      if (opts.humanize) {
        return new Promise(resolve => {
          let i = 0;
          const interval = setInterval(() => {
            if (i < txt.length) {
              element.value += txt[i];
              element.dispatchEvent(new Event('input', { bubbles: true }));
              i++;
            } else {
              clearInterval(interval);
              element.dispatchEvent(new Event('change', { bubbles: true }));
              resolve({ typed: true, selector: sel, text: txt });
            }
          }, 50 + Math.random() * 50); // 50-100ms per character
        });
      } else {
        element.value = opts.clear ? txt : element.value + txt;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        return { typed: true, selector: sel, text: txt };
      }
    },
    args: [selector, text, options]
  });

  return result[0].result;
}

/**
 * Scrape data
 */
async function scrapeData(selectors) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (sels) => {
      const data = {};

      for (const [key, selector] of Object.entries(sels)) {
        const element = document.querySelector(selector);
        data[key] = element ? element.textContent.trim() : null;
      }

      return data;
    },
    args: [selectors]
  });

  return result[0].result;
}

/**
 * Execute script
 */
async function executeScript(script, args = []) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: new Function('args', script),
    args: [args]
  });

  return result[0].result;
}

/**
 * Execute LinkedIn action
 */
async function executeLinkedInAction(action) {
  console.log('[ClaudeKit Browser] LinkedIn action:', action.type);

  // Import LinkedIn handler
  const { default: LinkedInHandler } = await import('./handlers/linkedin.js');
  const handler = new LinkedInHandler();

  const result = await handler.execute(action);

  sendToWebSocket({
    type: 'action-result',
    platform: 'linkedin',
    actionType: action.type,
    success: true,
    result
  });
}

/**
 * Execute Instagram action
 */
async function executeInstagramAction(action) {
  console.log('[ClaudeKit Browser] Instagram action:', action.type);

  const { default: InstagramHandler } = await import('./handlers/instagram.js');
  const handler = new InstagramHandler();

  const result = await handler.execute(action);

  sendToWebSocket({
    type: 'action-result',
    platform: 'instagram',
    actionType: action.type,
    success: true,
    result
  });
}

/**
 * Execute Twitter action
 */
async function executeTwitterAction(action) {
  console.log('[ClaudeKit Browser] Twitter action:', action.type);

  const { default: TwitterHandler } = await import('./handlers/twitter.js');
  const handler = new TwitterHandler();

  const result = await handler.execute(action);

  sendToWebSocket({
    type: 'action-result',
    platform: 'twitter',
    actionType: action.type,
    success: true,
    result
  });
}

/**
 * Execute Google action
 */
async function executeGoogleAction(action) {
  console.log('[ClaudeKit Browser] Google action:', action.type);

  const { default: GoogleHandler } = await import('./handlers/google.js');
  const handler = new GoogleHandler();

  const result = await handler.execute(action);

  sendToWebSocket({
    type: 'action-result',
    platform: 'google',
    actionType: action.type,
    success: true,
    result
  });
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[ClaudeKit Browser] Message from content script:', message.type);

  switch (message.type) {
    case 'ACTIVITY_TRACKED':
      // Forward activity to WebSocket
      sendToWebSocket({
        type: 'activity-tracked',
        platform: message.platform,
        activity: message.activity
      });
      sendResponse({ success: true });
      break;

    case 'GET_CONNECTION_STATUS':
      sendResponse({ connected: isConnected });
      break;

    case 'RECONNECT':
      // Manual reconnect from popup
      console.log('[ClaudeKit Browser] Manual reconnect requested');
      if (ws) {
        ws.close();
      }
      reconnectAttempts = 0;
      connectToWebSocket();
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ error: 'Unknown message type' });
  }

  return true; // Keep channel open for async response
});

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[ClaudeKit Browser] Extension installed:', details.reason);

  if (details.reason === 'install') {
    // Open welcome page
    chrome.tabs.create({ url: 'popup/welcome.html' });
  }
});
