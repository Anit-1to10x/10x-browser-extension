/**
 * Test LinkedIn Actions via WebSocket
 *
 * Tests:
 * - View profile
 * - Send connection request
 * - Send message
 * - Like post
 * - Comment on post
 * - Send InMail
 */

const WebSocket = require('ws');

// Configuration
const WS_URL = 'ws://localhost:3000/ws';
const TIMEOUT = 30000; // 30 seconds for LinkedIn actions

// Test data
const TEST_DATA = {
  profileUrl: 'https://www.linkedin.com/in/satyanadella/',
  connectionNote: 'Hi! I\'d love to connect and learn more about your work.',
  message: 'Hello! Thanks for connecting. Looking forward to staying in touch.',
  postUrl: 'https://www.linkedin.com/feed/update/urn:li:activity:1234567890/',
  comment: 'Great insights! Thanks for sharing.',
  inmailSubject: 'Quick question about your recent post',
  inmailBody: 'Hi! I noticed your recent post and wanted to reach out...'
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
function waitForResponse(ws, expectedType, timeout = TIMEOUT) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for ${expectedType}`));
    }, timeout);

    const handler = (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'action-result' && message.platform === 'linkedin') {
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
async function testViewProfile(ws) {
  log('Testing: View LinkedIn Profile', 'info');

  const command = {
    type: 'linkedin-action',
    payload: {
      type: 'view_profile',
      profile_url: TEST_DATA.profileUrl
    }
  };

  ws.send(JSON.stringify(command));

  try {
    const response = await waitForResponse(ws, 'view_profile');
    if (response.success && response.result) {
      pass('View LinkedIn profile');
      log(`  Profile data: ${JSON.stringify(response.result)}`, 'info');
    } else {
      fail('View LinkedIn profile', 'No profile data returned');
    }
  } catch (error) {
    fail('View LinkedIn profile', error.message);
  }
}

async function testSendConnection(ws) {
  log('Testing: Send Connection Request', 'info');

  const command = {
    type: 'linkedin-action',
    payload: {
      type: 'send_connection',
      profile_url: TEST_DATA.profileUrl,
      note: TEST_DATA.connectionNote
    }
  };

  ws.send(JSON.stringify(command));

  try {
    const response = await waitForResponse(ws, 'send_connection');
    if (response.success) {
      pass('Send connection request');
      log(`  Result: ${JSON.stringify(response.result)}`, 'info');
    } else {
      fail('Send connection request', 'Connection failed');
    }
  } catch (error) {
    fail('Send connection request', error.message);
  }
}

async function testSendMessage(ws) {
  log('Testing: Send LinkedIn Message', 'info');

  const command = {
    type: 'linkedin-action',
    payload: {
      type: 'send_message',
      profile_url: TEST_DATA.profileUrl,
      message: TEST_DATA.message
    }
  };

  ws.send(JSON.stringify(command));

  try {
    const response = await waitForResponse(ws, 'send_message');
    if (response.success) {
      pass('Send LinkedIn message');
      log(`  Result: ${JSON.stringify(response.result)}`, 'info');
    } else {
      fail('Send LinkedIn message', 'Message failed');
    }
  } catch (error) {
    fail('Send LinkedIn message', error.message);
  }
}

async function testLikePost(ws) {
  log('Testing: Like LinkedIn Post', 'info');

  const command = {
    type: 'linkedin-action',
    payload: {
      type: 'like_post',
      post_url: TEST_DATA.postUrl
    }
  };

  ws.send(JSON.stringify(command));

  try {
    const response = await waitForResponse(ws, 'like_post');
    if (response.success) {
      pass('Like LinkedIn post');
      log(`  Result: ${JSON.stringify(response.result)}`, 'info');
    } else {
      fail('Like LinkedIn post', 'Like failed');
    }
  } catch (error) {
    fail('Like LinkedIn post', error.message);
  }
}

async function testCommentPost(ws) {
  log('Testing: Comment on LinkedIn Post', 'info');

  const command = {
    type: 'linkedin-action',
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
      pass('Comment on LinkedIn post');
      log(`  Result: ${JSON.stringify(response.result)}`, 'info');
    } else {
      fail('Comment on LinkedIn post', 'Comment failed');
    }
  } catch (error) {
    fail('Comment on LinkedIn post', error.message);
  }
}

async function testSendInMail(ws) {
  log('Testing: Send LinkedIn InMail', 'info');

  const command = {
    type: 'linkedin-action',
    payload: {
      type: 'send_inmail',
      profile_url: TEST_DATA.profileUrl,
      subject: TEST_DATA.inmailSubject,
      message: TEST_DATA.inmailBody
    }
  };

  ws.send(JSON.stringify(command));

  try {
    const response = await waitForResponse(ws, 'send_inmail');
    if (response.success) {
      pass('Send LinkedIn InMail');
      log(`  Result: ${JSON.stringify(response.result)}`, 'info');
    } else {
      fail('Send LinkedIn InMail', 'InMail failed');
    }
  } catch (error) {
    fail('Send LinkedIn InMail', error.message);
  }
}

// Main test function
async function runTests() {
  log('Starting LinkedIn Action Tests', 'info');
  log(`Connecting to: ${WS_URL}`, 'info');
  log('NOTE: These tests require the browser extension to be loaded and logged into LinkedIn', 'warn');

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
        extensionId: 'test-linkedin',
        version: '1.0.0',
        capabilities: ['linkedin']
      }
    }));

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Run LinkedIn tests
    await testViewProfile(ws);
    await new Promise(resolve => setTimeout(resolve, 2000));

    await testSendConnection(ws);
    await new Promise(resolve => setTimeout(resolve, 2000));

    await testSendMessage(ws);
    await new Promise(resolve => setTimeout(resolve, 2000));

    await testLikePost(ws);
    await new Promise(resolve => setTimeout(resolve, 2000));

    await testCommentPost(ws);
    await new Promise(resolve => setTimeout(resolve, 2000));

    await testSendInMail(ws);
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
