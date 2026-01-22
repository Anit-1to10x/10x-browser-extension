/**
 * Test Google Search Actions via WebSocket
 *
 * Tests:
 * - Perform search
 * - Get search results
 * - Click search result
 * - Extract snippets
 * - Navigate to Maps
 * - Image search
 */

const WebSocket = require('ws');

// Configuration
const WS_URL = 'ws://localhost:3000/ws';
const TIMEOUT = 30000; // 30 seconds

// Test data
const TEST_DATA = {
  searchQuery: 'artificial intelligence news 2026',
  imageQuery: 'sunrise mountains',
  mapsQuery: 'coffee shops near me',
  newsQuery: 'latest tech news',
  resultLimit: 10
};

// Test results
let testsPassed = 0;
let testsFailed = 0;

// Utilities
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warn: '\x1b[33m'
  };
  const reset = '\x1b[0m';
  console.log(`${colors[type]}[${timestamp}] ${message}${reset}`);
}

function pass(testName) {
  testsPassed++;
  log(`✓ PASS: ${testName}`, 'success');
}

function fail(testName, error) {
  testsFailed++;
  log(`✗ FAIL: ${testName} - ${error}`, 'error');
}

// Helper: Wait for response
function waitForResponse(ws, expectedAction, timeout = TIMEOUT) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for ${expectedAction}`));
    }, timeout);

    const handler = (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'action-result' && message.platform === 'google') {
          clearTimeout(timer);
          ws.removeListener('message', handler);
          resolve(message);
        } else if (message.type === 'error') {
          clearTimeout(timer);
          ws.removeListener('message', handler);
          reject(new Error(message.error));
        }
      } catch (error) {
        // Ignore parsing errors
      }
    };

    ws.on('message', handler);
  });
}

// Test functions
async function testWebSearch(ws) {
  log('Testing: Google Web Search', 'info');

  const command = {
    type: 'google-action',
    payload: {
      type: 'search',
      query: TEST_DATA.searchQuery,
      limit: TEST_DATA.resultLimit
    }
  };

  ws.send(JSON.stringify(command));

  try {
    const response = await waitForResponse(ws, 'search');
    if (response.success && response.result && response.result.results) {
      pass('Google web search');
      log(`  Found ${response.result.results.length} results`, 'info');
      if (response.result.results.length > 0) {
        log(`  First result: ${response.result.results[0].title}`, 'info');
      }
    } else {
      fail('Google web search', 'No search results returned');
    }
  } catch (error) {
    fail('Google web search', error.message);
  }
}

async function testImageSearch(ws) {
  log('Testing: Google Image Search', 'info');

  const command = {
    type: 'google-action',
    payload: {
      type: 'image_search',
      query: TEST_DATA.imageQuery,
      limit: 5
    }
  };

  ws.send(JSON.stringify(command));

  try {
    const response = await waitForResponse(ws, 'image_search');
    if (response.success && response.result && response.result.images) {
      pass('Google image search');
      log(`  Found ${response.result.images.length} images`, 'info');
    } else {
      fail('Google image search', 'No images returned');
    }
  } catch (error) {
    fail('Google image search', error.message);
  }
}

async function testNewsSearch(ws) {
  log('Testing: Google News Search', 'info');

  const command = {
    type: 'google-action',
    payload: {
      type: 'news_search',
      query: TEST_DATA.newsQuery,
      limit: 5
    }
  };

  ws.send(JSON.stringify(command));

  try {
    const response = await waitForResponse(ws, 'news_search');
    if (response.success && response.result && response.result.articles) {
      pass('Google news search');
      log(`  Found ${response.result.articles.length} articles`, 'info');
    } else {
      fail('Google news search', 'No news articles returned');
    }
  } catch (error) {
    fail('Google news search', error.message);
  }
}

async function testMapsSearch(ws) {
  log('Testing: Google Maps Search', 'info');

  const command = {
    type: 'google-action',
    payload: {
      type: 'maps_search',
      query: TEST_DATA.mapsQuery,
      limit: 5
    }
  };

  ws.send(JSON.stringify(command));

  try {
    const response = await waitForResponse(ws, 'maps_search');
    if (response.success && response.result && response.result.places) {
      pass('Google Maps search');
      log(`  Found ${response.result.places.length} places`, 'info');
    } else {
      fail('Google Maps search', 'No places returned');
    }
  } catch (error) {
    fail('Google Maps search', error.message);
  }
}

async function testExtractSnippets(ws) {
  log('Testing: Extract Search Snippets', 'info');

  const command = {
    type: 'google-action',
    payload: {
      type: 'extract_snippets',
      query: TEST_DATA.searchQuery
    }
  };

  ws.send(JSON.stringify(command));

  try {
    const response = await waitForResponse(ws, 'extract_snippets');
    if (response.success && response.result && response.result.snippets) {
      pass('Extract search snippets');
      log(`  Extracted ${response.result.snippets.length} snippets`, 'info');
    } else {
      fail('Extract search snippets', 'No snippets extracted');
    }
  } catch (error) {
    fail('Extract search snippets', error.message);
  }
}

async function testClickResult(ws) {
  log('Testing: Click Search Result', 'info');

  // First perform a search
  const searchCommand = {
    type: 'google-action',
    payload: {
      type: 'search',
      query: TEST_DATA.searchQuery,
      limit: 3
    }
  };

  ws.send(JSON.stringify(searchCommand));

  try {
    const searchResponse = await waitForResponse(ws, 'search');

    if (searchResponse.success && searchResponse.result.results.length > 0) {
      // Click the first result
      const clickCommand = {
        type: 'google-action',
        payload: {
          type: 'click_result',
          result_index: 0
        }
      };

      ws.send(JSON.stringify(clickCommand));

      const clickResponse = await waitForResponse(ws, 'click_result');
      if (clickResponse.success) {
        pass('Click search result');
        log(`  Navigated to: ${clickResponse.result.url || 'N/A'}`, 'info');
      } else {
        fail('Click search result', 'Click failed');
      }
    } else {
      fail('Click search result', 'No search results to click');
    }
  } catch (error) {
    fail('Click search result', error.message);
  }
}

async function testAutoSuggest(ws) {
  log('Testing: Get Auto-Suggest Results', 'info');

  const command = {
    type: 'google-action',
    payload: {
      type: 'get_suggestions',
      query: 'artificial intel'
    }
  };

  ws.send(JSON.stringify(command));

  try {
    const response = await waitForResponse(ws, 'get_suggestions');
    if (response.success && response.result && response.result.suggestions) {
      pass('Get auto-suggest results');
      log(`  Suggestions: ${response.result.suggestions.join(', ')}`, 'info');
    } else {
      fail('Get auto-suggest results', 'No suggestions returned');
    }
  } catch (error) {
    fail('Get auto-suggest results', error.message);
  }
}

async function testNavigateGoogle(ws) {
  log('Testing: Navigate to Google Homepage', 'info');

  const command = {
    type: 'google-action',
    payload: {
      type: 'navigate',
      url: 'https://www.google.com'
    }
  };

  ws.send(JSON.stringify(command));

  try {
    const response = await waitForResponse(ws, 'navigate');
    if (response.success) {
      pass('Navigate to Google homepage');
    } else {
      fail('Navigate to Google homepage', 'Navigation failed');
    }
  } catch (error) {
    fail('Navigate to Google homepage', error.message);
  }
}

// Main test function
async function runTests() {
  log('Starting Google Search Action Tests', 'info');
  log(`Connecting to: ${WS_URL}`, 'info');
  log('NOTE: These tests require the browser extension to be loaded', 'warn');

  let ws;

  try {
    // Connect to WebSocket
    ws = await new Promise((resolve, reject) => {
      const connectionTimeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, TIMEOUT);

      const socket = new WebSocket(WS_URL);

      socket.on('open', () => {
        clearTimeout(connectionTimeout);
        resolve(socket);
      });

      socket.on('error', (error) => {
        clearTimeout(connectionTimeout);
        reject(error);
      });
    });

    pass('Connected to WebSocket');

    // Send identification
    ws.send(JSON.stringify({
      type: 'extension-connected',
      payload: {
        extensionId: 'test-google',
        version: '1.0.0',
        capabilities: ['google']
      }
    }));

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Run Google tests
    await testNavigateGoogle(ws);
    await new Promise(resolve => setTimeout(resolve, 2000));

    await testWebSearch(ws);
    await new Promise(resolve => setTimeout(resolve, 2000));

    await testImageSearch(ws);
    await new Promise(resolve => setTimeout(resolve, 2000));

    await testNewsSearch(ws);
    await new Promise(resolve => setTimeout(resolve, 2000));

    await testMapsSearch(ws);
    await new Promise(resolve => setTimeout(resolve, 2000));

    await testExtractSnippets(ws);
    await new Promise(resolve => setTimeout(resolve, 2000));

    await testAutoSuggest(ws);
    await new Promise(resolve => setTimeout(resolve, 2000));

    await testClickResult(ws);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Close connection
    ws.close(1000, 'Tests completed');

  } catch (error) {
    fail('Test setup', error.message);
    log(`Error details: ${error.stack}`, 'error');
  } finally {
    if (ws && ws.readyState !== WebSocket.CLOSED) {
      ws.close();
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  log(`Test Summary: ${testsPassed} passed, ${testsFailed} failed`,
      testsFailed === 0 ? 'success' : 'error');
  console.log('='.repeat(60) + '\n');

  process.exit(testsFailed === 0 ? 0 : 1);
}

// Handle signals
process.on('SIGINT', () => {
  log('Tests interrupted', 'warn');
  process.exit(1);
});

// Run tests
runTests().catch((error) => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});
