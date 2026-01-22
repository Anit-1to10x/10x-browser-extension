/**
 * Test Twitter/X Actions via WebSocket
 *
 * Tests:
 * - Post tweet
 * - Like tweet
 * - Retweet
 * - Reply to tweet
 * - Follow user
 * - Send DM
 */

const WebSocket = require('ws');

// Configuration
const WS_URL = 'ws://localhost:3000/ws';
const TIMEOUT = 30000; // 30 seconds

// Test data
const TEST_DATA = {
  username: 'elonmusk',
  tweetText: 'Testing automated tweet posting! #automation #test',
  tweetUrl: 'https://x.com/elonmusk/status/1234567890123456789',
  replyText: 'Great insights! Thanks for sharing. 🚀',
  dmMessage: 'Hi! Thanks for following. Looking forward to connecting!',
  hashtags: ['#test', '#automation']
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
        if (message.type === 'action-result' && message.platform === 'twitter') {
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
async function testPostTweet(ws) {
  log('Testing: Post Tweet', 'info');

  const command = {
    type: 'twitter-action',
    payload: {
      type: 'post_tweet',
      text: TEST_DATA.tweetText,
      hashtags: TEST_DATA.hashtags
    }
  };

  ws.send(JSON.stringify(command));

  try {
    const response = await waitForResponse(ws, 'post_tweet');
    if (response.success && response.result) {
      pass('Post tweet');
      log(`  Tweet URL: ${response.result.tweet_url || 'N/A'}`, 'info');
    } else {
      fail('Post tweet', 'Tweet posting failed');
    }
  } catch (error) {
    fail('Post tweet', error.message);
  }
}

async function testLikeTweet(ws) {
  log('Testing: Like Tweet', 'info');

  const command = {
    type: 'twitter-action',
    payload: {
      type: 'like_tweet',
      tweet_url: TEST_DATA.tweetUrl
    }
  };

  ws.send(JSON.stringify(command));

  try {
    const response = await waitForResponse(ws, 'like_tweet');
    if (response.success) {
      pass('Like tweet');
      log(`  Result: ${JSON.stringify(response.result)}`, 'info');
    } else {
      fail('Like tweet', 'Like failed');
    }
  } catch (error) {
    fail('Like tweet', error.message);
  }
}

async function testRetweet(ws) {
  log('Testing: Retweet', 'info');

  const command = {
    type: 'twitter-action',
    payload: {
      type: 'retweet',
      tweet_url: TEST_DATA.tweetUrl
    }
  };

  ws.send(JSON.stringify(command));

  try {
    const response = await waitForResponse(ws, 'retweet');
    if (response.success) {
      pass('Retweet');
      log(`  Result: ${JSON.stringify(response.result)}`, 'info');
    } else {
      fail('Retweet', 'Retweet failed');
    }
  } catch (error) {
    fail('Retweet', error.message);
  }
}

async function testReplyToTweet(ws) {
  log('Testing: Reply to Tweet', 'info');

  const command = {
    type: 'twitter-action',
    payload: {
      type: 'reply',
      tweet_url: TEST_DATA.tweetUrl,
      text: TEST_DATA.replyText
    }
  };

  ws.send(JSON.stringify(command));

  try {
    const response = await waitForResponse(ws, 'reply');
    if (response.success) {
      pass('Reply to tweet');
      log(`  Result: ${JSON.stringify(response.result)}`, 'info');
    } else {
      fail('Reply to tweet', 'Reply failed');
    }
  } catch (error) {
    fail('Reply to tweet', error.message);
  }
}

async function testFollowUser(ws) {
  log('Testing: Follow User', 'info');

  const command = {
    type: 'twitter-action',
    payload: {
      type: 'follow',
      username: TEST_DATA.username
    }
  };

  ws.send(JSON.stringify(command));

  try {
    const response = await waitForResponse(ws, 'follow');
    if (response.success) {
      pass('Follow user');
      log(`  Followed: @${TEST_DATA.username}`, 'info');
    } else {
      fail('Follow user', 'Follow failed');
    }
  } catch (error) {
    fail('Follow user', error.message);
  }
}

async function testSendDM(ws) {
  log('Testing: Send DM', 'info');

  const command = {
    type: 'twitter-action',
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
      pass('Send DM');
      log(`  DM sent to: @${TEST_DATA.username}`, 'info');
    } else {
      fail('Send DM', 'DM failed');
    }
  } catch (error) {
    fail('Send DM', error.message);
  }
}

async function testViewProfile(ws) {
  log('Testing: View Profile', 'info');

  const command = {
    type: 'twitter-action',
    payload: {
      type: 'view_profile',
      username: TEST_DATA.username
    }
  };

  ws.send(JSON.stringify(command));

  try {
    const response = await waitForResponse(ws, 'view_profile');
    if (response.success && response.result) {
      pass('View profile');
      log(`  Profile data: ${JSON.stringify(response.result)}`, 'info');
    } else {
      fail('View profile', 'Profile view failed');
    }
  } catch (error) {
    fail('View profile', error.message);
  }
}

async function testSearchTweets(ws) {
  log('Testing: Search Tweets', 'info');

  const command = {
    type: 'twitter-action',
    payload: {
      type: 'search',
      query: '#automation',
      limit: 5
    }
  };

  ws.send(JSON.stringify(command));

  try {
    const response = await waitForResponse(ws, 'search');
    if (response.success && response.result) {
      pass('Search tweets');
      log(`  Found ${response.result.tweets?.length || 0} tweets`, 'info');
    } else {
      fail('Search tweets', 'Search failed');
    }
  } catch (error) {
    fail('Search tweets', error.message);
  }
}

// Main test function
async function runTests() {
  log('Starting Twitter/X Action Tests', 'info');
  log(`Connecting to: ${WS_URL}`, 'info');
  log('NOTE: These tests require the browser extension to be loaded and logged into X/Twitter', 'warn');
  log('WARNING: Some tests will perform real actions on X. Use test accounts!', 'warn');

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
        extensionId: 'test-twitter',
        version: '1.0.0',
        capabilities: ['twitter']
      }
    }));

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Run Twitter tests
    await testPostTweet(ws);
    await new Promise(resolve => setTimeout(resolve, 3000));

    await testLikeTweet(ws);
    await new Promise(resolve => setTimeout(resolve, 3000));

    await testRetweet(ws);
    await new Promise(resolve => setTimeout(resolve, 3000));

    await testReplyToTweet(ws);
    await new Promise(resolve => setTimeout(resolve, 3000));

    await testFollowUser(ws);
    await new Promise(resolve => setTimeout(resolve, 3000));

    await testSendDM(ws);
    await new Promise(resolve => setTimeout(resolve, 3000));

    await testViewProfile(ws);
    await new Promise(resolve => setTimeout(resolve, 3000));

    await testSearchTweets(ws);
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
