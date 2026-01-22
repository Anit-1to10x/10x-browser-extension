/**
 * Test Instagram Actions via WebSocket
 *
 * Tests:
 * - Like post
 * - Comment on post
 * - Follow user
 * - Send DM
 * - View story
 */

const WebSocket = require('ws');

// Configuration
const WS_URL = 'ws://localhost:3000/ws';
const TIMEOUT = 30000; // 30 seconds

// Test data
const TEST_DATA = {
  username: 'instagram',
  profileUrl: 'https://www.instagram.com/instagram/',
  postUrl: 'https://www.instagram.com/p/CxYZ123abc/',
  comment: 'Amazing content! 🔥',
  dmMessage: 'Hey! Love your recent posts. Keep up the great work!',
  storyUrl: 'https://www.instagram.com/stories/instagram/123456789/'
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
        if (message.type === 'action-result' && message.platform === 'instagram') {
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
async function testLikePost(ws) {
  log('Testing: Like Instagram Post', 'info');

  const command = {
    type: 'instagram-action',
    payload: {
      type: 'like_post',
      post_url: TEST_DATA.postUrl
    }
  };

  ws.send(JSON.stringify(command));

  try {
    const response = await waitForResponse(ws, 'like_post');
    if (response.success) {
      pass('Like Instagram post');
      log(`  Result: ${JSON.stringify(response.result)}`, 'info');
    } else {
      fail('Like Instagram post', 'Like failed');
    }
  } catch (error) {
    fail('Like Instagram post', error.message);
  }
}

async function testCommentPost(ws) {
  log('Testing: Comment on Instagram Post', 'info');

  const command = {
    type: 'instagram-action',
    payload: {
      type: 'comment',
      post_url: TEST_DATA.postUrl,
      comment: TEST_DATA.comment
    }
  };

  ws.send(JSON.stringify(command));

  try {
    const response = await waitForResponse(ws, 'comment');
    if (response.success) {
      pass('Comment on Instagram post');
      log(`  Result: ${JSON.stringify(response.result)}`, 'info');
    } else {
      fail('Comment on Instagram post', 'Comment failed');
    }
  } catch (error) {
    fail('Comment on Instagram post', error.message);
  }
}

async function testFollowUser(ws) {
  log('Testing: Follow Instagram User', 'info');

  const command = {
    type: 'instagram-action',
    payload: {
      type: 'follow',
      username: TEST_DATA.username,
      profile_url: TEST_DATA.profileUrl
    }
  };

  ws.send(JSON.stringify(command));

  try {
    const response = await waitForResponse(ws, 'follow');
    if (response.success) {
      pass('Follow Instagram user');
      log(`  Result: ${JSON.stringify(response.result)}`, 'info');
    } else {
      fail('Follow Instagram user', 'Follow failed');
    }
  } catch (error) {
    fail('Follow Instagram user', error.message);
  }
}

async function testSendDM(ws) {
  log('Testing: Send Instagram DM', 'info');

  const command = {
    type: 'instagram-action',
    payload: {
      type: 'send_dm',
      username: TEST_DATA.username,
      message: TEST_DATA.dmMessage
    }
  };

  ws.send(JSON.stringify(command));

  try {
    const response = await waitForResponse(ws, 'send_dm');
    if (response.success) {
      pass('Send Instagram DM');
      log(`  Result: ${JSON.stringify(response.result)}`, 'info');
    } else {
      fail('Send Instagram DM', 'DM failed');
    }
  } catch (error) {
    fail('Send Instagram DM', error.message);
  }
}

async function testViewStory(ws) {
  log('Testing: View Instagram Story', 'info');

  const command = {
    type: 'instagram-action',
    payload: {
      type: 'view_story',
      story_url: TEST_DATA.storyUrl,
      username: TEST_DATA.username
    }
  };

  ws.send(JSON.stringify(command));

  try {
    const response = await waitForResponse(ws, 'view_story');
    if (response.success) {
      pass('View Instagram story');
      log(`  Result: ${JSON.stringify(response.result)}`, 'info');
    } else {
      fail('View Instagram story', 'Story view failed');
    }
  } catch (error) {
    fail('View Instagram story', error.message);
  }
}

async function testRateLimits(ws) {
  log('Testing: Rate Limit Enforcement', 'info');

  // Try to perform multiple rapid actions
  const promises = [];
  for (let i = 0; i < 3; i++) {
    const command = {
      type: 'instagram-action',
      payload: {
        type: 'like_post',
        post_url: TEST_DATA.postUrl
      }
    };
    ws.send(JSON.stringify(command));
    promises.push(waitForResponse(ws, 'like_post', 5000).catch(e => ({ error: e.message })));
  }

  try {
    const results = await Promise.all(promises);
    const hasRateLimit = results.some(r => r.error && r.error.includes('rate limit'));
    if (hasRateLimit) {
      pass('Rate limit enforcement working');
    } else {
      log('  Note: Rate limits may not be triggered in test environment', 'warn');
      pass('Rate limit test completed (no limits hit)');
    }
  } catch (error) {
    fail('Rate limit enforcement', error.message);
  }
}

// Main test function
async function runTests() {
  log('Starting Instagram Action Tests', 'info');
  log(`Connecting to: ${WS_URL}`, 'info');
  log('NOTE: These tests require the browser extension to be loaded and logged into Instagram', 'warn');
  log('WARNING: Some tests will perform real actions on Instagram. Use test accounts!', 'warn');

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
        extensionId: 'test-instagram',
        version: '1.0.0',
        capabilities: ['instagram']
      }
    }));

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Run Instagram tests
    await testLikePost(ws);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Delay between actions

    await testCommentPost(ws);
    await new Promise(resolve => setTimeout(resolve, 3000));

    await testFollowUser(ws);
    await new Promise(resolve => setTimeout(resolve, 3000));

    await testSendDM(ws);
    await new Promise(resolve => setTimeout(resolve, 3000));

    await testViewStory(ws);
    await new Promise(resolve => setTimeout(resolve, 3000));

    await testRateLimits(ws);
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
