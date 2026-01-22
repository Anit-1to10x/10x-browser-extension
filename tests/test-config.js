/**
 * Test Configuration
 *
 * Centralized configuration for all test scripts.
 * Edit values here instead of modifying individual test files.
 */

module.exports = {
  // WebSocket connection
  websocket: {
    url: 'ws://localhost:3000/ws',
    timeout: 30000, // 30 seconds
    reconnectAttempts: 3
  },

  // Test timeouts
  timeouts: {
    connection: 10000,    // 10 seconds
    action: 30000,        // 30 seconds
    platformAction: 45000 // 45 seconds (for slow platforms)
  },

  // Delays between actions (human-like behavior)
  delays: {
    betweenTests: 2000,      // 2 seconds between test files
    betweenActions: 3000,    // 3 seconds between actions in same test
    afterNavigation: 2000,   // 2 seconds after page navigation
    afterLogin: 5000         // 5 seconds after login check
  },

  // LinkedIn test data
  linkedin: {
    enabled: true,
    testProfile: 'https://www.linkedin.com/in/satyanadella/',
    connectionNote: 'Hi! I\'d love to connect and learn more about your work at Microsoft.',
    message: 'Hello! Thanks for connecting. Looking forward to staying in touch.',
    postUrl: 'https://www.linkedin.com/feed/update/urn:li:activity:1234567890/',
    comment: 'Great insights! Thanks for sharing.',
    inmailSubject: 'Quick question about Azure',
    inmailBody: 'Hi Satya! I noticed your recent post about AI and wanted to reach out...'
  },

  // Instagram test data
  instagram: {
    enabled: true,
    testAccount: 'instagram',
    profileUrl: 'https://www.instagram.com/instagram/',
    postUrl: 'https://www.instagram.com/p/CxYZ123abc/',
    comment: 'Amazing content! 🔥',
    dmMessage: 'Hey! Love your recent posts. Keep up the great work!',
    storyUrl: 'https://www.instagram.com/stories/instagram/123456789/'
  },

  // Twitter/X test data
  twitter: {
    enabled: true,
    testAccount: 'elonmusk',
    tweetText: 'Testing automated tweet posting! #automation #test',
    tweetUrl: 'https://x.com/elonmusk/status/1234567890123456789',
    replyText: 'Great insights! Thanks for sharing. 🚀',
    dmMessage: 'Hi! Thanks for following. Looking forward to connecting!',
    hashtags: ['#test', '#automation']
  },

  // Google search test data
  google: {
    enabled: true,
    searchQuery: 'artificial intelligence news 2026',
    imageQuery: 'sunrise mountains',
    mapsQuery: 'coffee shops near me',
    newsQuery: 'latest tech news',
    resultLimit: 10
  },

  // Test behavior options
  options: {
    // Skip platform tests if not logged in
    skipIfNotAuthenticated: true,

    // Continue tests even if one fails
    continueOnFailure: true,

    // Verbose logging
    verbose: true,

    // Log response data
    logResponses: true,

    // Retry failed tests
    retryOnFailure: false,
    maxRetries: 2,

    // Clean up after tests
    cleanup: false // Set to true to remove test data after completion
  },

  // Rate limiting (prevent hitting platform limits)
  rateLimits: {
    enabled: true,
    linkedin: {
      connections: 5,     // Max connections per test run
      messages: 10,       // Max messages per test run
      profileViews: 20    // Max profile views per test run
    },
    instagram: {
      likes: 10,          // Max likes per test run
      comments: 5,        // Max comments per test run
      follows: 5,         // Max follows per test run
      dms: 5              // Max DMs per test run
    },
    twitter: {
      tweets: 3,          // Max tweets per test run
      likes: 10,          // Max likes per test run
      follows: 5,         // Max follows per test run
      dms: 5              // Max DMs per test run
    }
  },

  // Test modes
  modes: {
    // Dry run - connect but don't execute actions
    dryRun: false,

    // Mock mode - use mock responses instead of real API calls
    mock: false,

    // Headless - run without visible browser (requires Canvas support)
    headless: false
  }
};
