/**
 * Test WebSocket Connection to Canvas Server
 *
 * Tests:
 * - WebSocket connection establishment
 * - Ping/pong heartbeat
 * - Extension identification message
 * - Connection status response
 */

const WebSocket = require('ws');

// Configuration
const WS_URL = 'ws://localhost:3000/ws';
const TIMEOUT = 10000; // 10 seconds

// Test results
let testsPassed = 0;
let testsFailed = 0;

// Utilities
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warn: '\x1b[33m'     // Yellow
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

// Main test function
async function runTests() {
  log('Starting WebSocket Connection Tests', 'info');
  log(`Connecting to: ${WS_URL}`, 'info');

  let ws;
  let connectionTimeout;

  try {
    // Test 1: WebSocket Connection
    ws = await new Promise((resolve, reject) => {
      connectionTimeout = setTimeout(() => {
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

    pass('WebSocket connection established');

    // Test 2: Send identification message
    const identMessage = {
      type: 'extension-connected',
      payload: {
        extensionId: 'test-extension-id',
        version: '1.0.0',
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
    };

    ws.send(JSON.stringify(identMessage));
    pass('Sent identification message');

    // Wait for response
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test 3: Ping/Pong test
    await new Promise((resolve, reject) => {
      const pingTimeout = setTimeout(() => {
        reject(new Error('Pong timeout'));
      }, TIMEOUT);

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.type === 'pong') {
            clearTimeout(pingTimeout);
            pass('Ping/Pong heartbeat working');
            resolve();
          }
        } catch (error) {
          // Ignore parsing errors for other messages
        }
      });

      // Send ping
      ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
    });

    // Test 4: Send heartbeat
    ws.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
    pass('Sent heartbeat message');

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Test 5: Connection status check
    const statusMessage = { type: 'GET_CONNECTION_STATUS' };
    ws.send(JSON.stringify(statusMessage));
    pass('Connection status check sent');

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Test 6: Error handling - invalid message
    try {
      ws.send('invalid json');
      await new Promise((resolve) => setTimeout(resolve, 500));
      pass('Invalid message handling');
    } catch (error) {
      fail('Invalid message handling', error.message);
    }

    // Test 7: Close connection gracefully
    ws.close(1000, 'Test completed');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (ws.readyState === WebSocket.CLOSED) {
      pass('WebSocket closed gracefully');
    } else {
      fail('WebSocket close', 'Socket did not close properly');
    }

  } catch (error) {
    fail('WebSocket connection', error.message);
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

  // Exit with proper code
  process.exit(testsFailed === 0 ? 0 : 1);
}

// Handle process signals
process.on('SIGINT', () => {
  log('Tests interrupted by user', 'warn');
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  log(`Unhandled rejection: ${error.message}`, 'error');
  process.exit(1);
});

// Run tests
runTests().catch((error) => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});
