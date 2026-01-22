# ClaudeKit Browser Extension - Repository Overview

## 📁 Repository Structure

```
claudekit-browser-extension/
│
├── 📄 manifest.json              # Chrome Extension configuration (Manifest V3)
├── 📄 background.js              # Service worker - WebSocket client & command router
├── 📄 content.js                 # Content script - DOM manipulation & activity tracking
│
├── 📂 handlers/                  # Platform-specific automation handlers
│   ├── linkedin.js               # LinkedIn actions (connect, message, like, comment)
│   ├── instagram.js              # Instagram actions (follow, DM, like)
│   ├── twitter.js                # Twitter/X actions (tweet, follow, like)
│   ├── google.js                 # Google search automation
│   └── README.md                 # Handler documentation
│
├── 📂 popup/                     # Extension popup UI
│   ├── popup.html                # Popup interface
│   ├── popup.css                 # Popup styling
│   └── popup.js                  # Popup logic (status, stats, controls)
│
├── 📂 tests/                     # Test suite
│   ├── test-connection.js        # WebSocket connection test
│   ├── test-linkedin.js          # LinkedIn automation tests
│   ├── test-instagram.js         # Instagram automation tests
│   ├── test-twitter.js           # Twitter automation tests
│   ├── test-google.js            # Google automation tests
│   ├── test-config.js            # Test utilities
│   ├── run-all-tests.js          # Run all tests
│   ├── run-all-tests.bat         # Windows batch script
│   ├── package.json              # Test dependencies
│   ├── README.md                 # Test documentation
│   ├── QUICK-INSTALL.md          # Quick test setup
│   └── TEST-SUMMARY.md           # Test results
│
├── 📂 icons/                     # Extension icons (16x16, 48x48, 128x128)
│
├── 📄 README.md                  # Main documentation (comprehensive guide)
├── 📄 LICENSE                    # MIT License
├── 📄 package.json               # NPM package configuration
├── 📄 .gitignore                 # Git ignore rules
├── 📄 CONTRIBUTING.md            # Contribution guidelines
├── 📄 CHANGELOG.md               # Version history & release notes
├── 📄 SECURITY.md                # Security policy & vulnerability reporting
├── 📄 IMPLEMENTATION-GUIDE.md    # Detailed implementation guide
├── 📄 QUICK-START.md             # Quick start guide
└── 📄 REPOSITORY-OVERVIEW.md     # This file
```

---

## 🚀 Quick Start

### 1. Install Extension
```bash
# Load in Chrome
1. Open chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select this folder
```

### 2. Start WebSocket Server
```bash
# Install test dependencies
cd tests
npm install

# Run test WebSocket server (or use your own)
node websocket-test-server.js
```

### 3. Test Connection
```bash
# Run connection test
cd tests
node test-connection.js
```

---

## 📚 Documentation Guide

### For Users

1. **[README.md](README.md)** - **START HERE**
   - What is this extension?
   - Installation instructions
   - Usage examples
   - API reference
   - Troubleshooting

2. **[QUICK-START.md](QUICK-START.md)** - Fast setup guide
   - 5-minute quickstart
   - Essential commands
   - Common issues

3. **[CHANGELOG.md](CHANGELOG.md)** - Version history
   - What's new in each version
   - Breaking changes
   - Upgrade guide

### For Developers

1. **[IMPLEMENTATION-GUIDE.md](IMPLEMENTATION-GUIDE.md)** - Technical deep dive
   - Architecture details
   - How it works internally
   - Code organization

2. **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute
   - Setup development environment
   - Code style guidelines
   - Pull request process
   - Adding new platforms

3. **[tests/README.md](tests/README.md)** - Testing guide
   - Running tests
   - Writing new tests
   - Test structure

### For Security

1. **[SECURITY.md](SECURITY.md)** - Security policy
   - Reporting vulnerabilities
   - Security best practices
   - Known considerations

---

## 🎯 Key Components Explained

### Background.js (Service Worker)
**What it does:**
- Maintains WebSocket connection to local server
- Receives commands from server
- Routes commands to appropriate handlers
- Manages rate limits
- Handles auto-reconnect

**Key functions:**
- `connectToWebSocket()` - Establish connection
- `handleWebSocketMessage()` - Process incoming commands
- `executeBrowserCommand()` - Execute generic commands
- `executeLinkedInAction()` - LinkedIn-specific actions

### Content.js (Content Script)
**What it does:**
- Injected into all web pages
- Provides DOM manipulation capabilities
- Tracks user activity
- Detects platform (LinkedIn, Instagram, etc.)

**Key functions:**
- `detectPlatform()` - Identify current website
- `clickElement()` - Click with retry logic
- `typeText()` - Human-like typing
- `extractData()` - Scrape page data
- `trackActivity()` - Log user actions

### Handlers (Platform-Specific)
**What they do:**
- Implement platform-specific automation
- Handle rate limiting per platform
- Manage platform UI differences
- Provide action methods

**Example (LinkedIn):**
- `viewProfile()` - Navigate and extract profile
- `sendConnection()` - Send connection request
- `sendMessage()` - Send direct message
- `likePost()` - Like a post
- `commentOnPost()` - Comment on post

### Popup UI
**What it does:**
- Shows connection status
- Displays activity statistics
- Shows rate limit usage
- Manual reconnect button
- Clear statistics

---

## 🔧 Configuration

### WebSocket URL
Change in `background.js`:
```javascript
const CONFIG = {
  WEBSOCKET_URL: 'ws://localhost:3000/ws',  // Change here
  HTTP_API_URL: 'http://localhost:3000/api',
  // ...
};
```

### Rate Limits
Change in `handlers/linkedin.js`, `handlers/instagram.js`, etc.:
```javascript
const RATE_LIMITS = {
  connections: {
    daily: 15,  // Change this number
    key: 'linkedin_connections_today'
  },
  // ...
};
```

### Selectors
If platform UI changes, update in respective handler:
```javascript
const SELECTORS = {
  connectButton: 'button[aria-label*="Connect"]',  // Update this
  // ...
};
```

---

## 🧪 Testing

### Run All Tests
```bash
cd tests
npm install
npm test
```

### Run Individual Test
```bash
cd tests
node test-linkedin.js
```

### Test Structure
```javascript
// tests/test-example.js
const test = require('./test-config');

async function testFeature() {
  console.log('🧪 Testing Feature...\n');

  // Send command
  const result = await test.sendCommand({
    type: 'browser-command',
    payload: { /* ... */ }
  });

  console.log('✅ Result:', result);
}

testFeature().catch(console.error);
```

---

## 🛠️ Development Workflow

### 1. Setup
```bash
# Clone repository
git clone <your-repo-url>
cd claudekit-browser-extension

# Install test dependencies
cd tests
npm install
```

### 2. Make Changes
- Edit files in your code editor
- Follow [CONTRIBUTING.md](CONTRIBUTING.md) guidelines

### 3. Test Changes
```bash
# Reload extension
1. Go to chrome://extensions/
2. Click reload button on extension

# Run tests
cd tests
npm test
```

### 4. Commit
```bash
git add .
git commit -m "feat(linkedin): add new feature"
git push origin your-branch
```

### 5. Create PR
- Open pull request on GitHub
- Fill out PR template
- Wait for review

---

## 📦 Dependencies

### Production Dependencies
**None!** Extension uses only browser APIs.

### Development Dependencies (tests only)
- `ws` - WebSocket library for test server
- Other test utilities as needed

### Why No Dependencies?
- **Security**: Fewer attack vectors
- **Performance**: Smaller bundle size
- **Reliability**: No supply chain issues
- **Simplicity**: Easier to audit

---

## 🔐 Security Considerations

### Extension Permissions
```json
{
  "permissions": [
    "activeTab",       // Access current tab
    "tabs",            // Navigate tabs
    "storage",         // Store rate limits
    "cookies",         // Access cookies
    "webNavigation",   // Track navigation
    "webRequest",      // Monitor requests
    "scripting"        // Execute scripts
  ],
  "host_permissions": [
    "<all_urls>"       // Access all websites
  ]
}
```

### Data Storage
- **chrome.storage.local**: Rate limits, activity logs
- **Not encrypted**: Don't store sensitive data
- **User-clearable**: "Clear Stats" button

### WebSocket Security
- **Default**: `ws://localhost:3000/ws` (unencrypted)
- **Production**: Use `wss://` with TLS
- **Authentication**: Implement token-based auth

See [SECURITY.md](SECURITY.md) for full security policy.

---

## 🐛 Troubleshooting

### Extension not loading?
- Check Chrome version (>= 88)
- Enable Developer mode
- Check console for errors

### WebSocket not connecting?
- Ensure server is running on port 3000
- Check firewall settings
- Verify URL in background.js

### Commands not executing?
- Check message format
- Ensure on correct website
- Inspect content script loaded

### Selectors not working?
- Platform UI may have changed
- Update selectors in handlers
- Inspect element for new selector

See README.md troubleshooting section for more.

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/claudekit-browser-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/claudekit-browser-extension/discussions)
- **Security**: See [SECURITY.md](SECURITY.md)
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file.

Copyright (c) 2026 Anit Kumar

---

## 🙏 Acknowledgments

- Built for [Claude Code](https://claude.ai/code)
- Inspired by Browser-Use MCP
- Community contributors

---

**Happy Automating! 🚀**
