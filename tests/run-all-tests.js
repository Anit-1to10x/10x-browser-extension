/**
 * Cross-platform test runner for browser extension tests
 * Runs all test files sequentially and reports results
 */

const { spawn } = require('child_process');
const path = require('path');

// Test files to run in order
const TEST_FILES = [
  'test-connection.js',
  'test-linkedin.js',
  'test-instagram.js',
  'test-twitter.js',
  'test-google.js'
];

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m'
};

// Test results
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

/**
 * Print colored message
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Print separator
 */
function separator(char = '=', length = 60) {
  console.log(char.repeat(length));
}

/**
 * Run a single test file
 */
function runTest(testFile) {
  return new Promise((resolve) => {
    const testPath = path.join(__dirname, testFile);

    log(`\n${'─'.repeat(60)}`, 'dim');
    log(`Running: ${testFile}`, 'cyan');
    log('─'.repeat(60), 'dim');

    const child = spawn('node', [testPath], {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      totalTests++;

      if (code === 0) {
        passedTests++;
        log(`[PASS] ${testFile} completed successfully\n`, 'green');
      } else {
        failedTests++;
        log(`[FAIL] ${testFile} failed with code ${code}\n`, 'red');
      }

      resolve(code);
    });

    child.on('error', (error) => {
      failedTests++;
      log(`[ERROR] Failed to run ${testFile}: ${error.message}\n`, 'red');
      resolve(1);
    });
  });
}

/**
 * Delay between tests
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if ws package is installed
 */
function checkDependencies() {
  try {
    require('ws');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  separator('=');
  log('Browser Extension Test Suite', 'bright');
  separator('=');

  // Check Node.js version
  log(`\nNode.js: ${process.version}`, 'cyan');

  // Check dependencies
  if (!checkDependencies()) {
    log('\n[ERROR] ws package not found', 'red');
    log('Please run: npm install', 'yellow');
    process.exit(1);
  }

  log('\nStarting test suite...\n', 'cyan');

  // Run each test sequentially
  for (const testFile of TEST_FILES) {
    await runTest(testFile);
    await delay(2000); // 2 second delay between tests
  }

  // Print summary
  separator('=');
  log('Test Suite Summary', 'bright');
  separator('=');

  console.log(`Total tests:  ${totalTests}`);
  log(`Passed:       ${passedTests}`, passedTests === totalTests ? 'green' : 'reset');
  log(`Failed:       ${failedTests}`, failedTests > 0 ? 'red' : 'reset');

  separator('=');

  if (failedTests > 0) {
    log('\n[RESULT] Some tests FAILED', 'red');
    process.exit(1);
  } else {
    log('\n[RESULT] All tests PASSED', 'green');
    process.exit(0);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  log('\n\nTest suite interrupted by user', 'yellow');
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  log(`\nUnhandled rejection: ${error.message}`, 'red');
  process.exit(1);
});

// Run tests
runAllTests().catch((error) => {
  log(`\nFatal error: ${error.message}`, 'red');
  console.error(error.stack);
  process.exit(1);
});
