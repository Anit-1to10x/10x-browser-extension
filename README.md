# ClaudeKit Universal Browser Extension

<div align="center">

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)
![WebSocket](https://img.shields.io/badge/WebSocket-Enabled-orange?style=for-the-badge)

**Universal browser automation extension for Claude Code with WebSocket control**

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [API Reference](#api-reference) • [Contributing](#contributing)

</div>

---

## What is ClaudeKit Browser Extension?

ClaudeKit Universal Browser Controller is a powerful Chrome extension that enables **Claude Code** to control any website through a WebSocket connection. Unlike traditional browser automation tools that require separate browser instances, this extension works directly in your active browser, providing seamless automation across LinkedIn, Instagram, Twitter, Google, and any other website.

### Why This Extension?

- **🚀 Direct Browser Control**: No separate browser instances or headless browsers needed
- **🔄 Real-time WebSocket**: Instant command execution with bi-directional communication
- **🌐 Universal Support**: Works on any website, with specialized handlers for major platforms
- **📊 Activity Tracking**: Automatic tracking of user actions, clicks, and form submissions
- **⚡ Rate Limiting**: Built-in protection against platform rate limits
- **🎯 Platform-Specific**: Optimized handlers for LinkedIn, Instagram, Twitter, and Google

---

## Key Features

### ✨ Core Capabilities

- **WebSocket Control**: Real-time command execution from Claude Code via WebSocket (ws://localhost:3000/ws)
- **Universal DOM Manipulation**: Click, type, scrape, and execute scripts on any website
- **Platform Detection**: Automatic detection and handling of LinkedIn, Instagram, Twitter, Google
- **Activity Tracking**: Comprehensive tracking of page views, clicks, form submissions, scroll depth
- **Rate Limiting**: Smart daily limits to prevent platform restrictions
- **Auto-Reconnect**: Automatic WebSocket reconnection with exponential backoff
- **Heartbeat Monitoring**: Connection health checks every 30 seconds

### 🎯 Platform-Specific Actions

#### LinkedIn Automation
- View profiles and extract data (100/day)
- Send connection requests with custom notes (15/day)
- Send direct messages (40/day)
- Like posts (50/day)
- Comment on posts (30/day)
- Send InMails (5/day, requires Premium)

#### Instagram Automation
- Follow/unfollow users
- Like posts and stories
- Comment on posts
- Send direct messages
- Reply to stories

#### Twitter/X Automation
- Follow/unfollow users
- Post tweets
- Like and retweet
- Reply to tweets
- Send direct messages

#### Google Automation
- Perform searches
- Extract search results
- Navigate search pages
- Scrape structured data

---

## Quick Installation

### Chrome / Edge / Brave

1. **Download the Extension**
   ```bash
   git clone https://github.com/yourusername/claudekit-browser-extension.git
   cd claudekit-browser-extension
   ```

2. **Load Unpacked Extension**
   - Open `chrome://extensions/` (Chrome) or `edge://extensions/` (Edge)
   - Enable **Developer mode** (toggle in top-right)
   - Click **Load unpacked**
   - Select the `claudekit-browser-extension` folder

3. **Verify Installation**
   - Look for the ClaudeKit icon in your browser toolbar
   - Click the icon to open the popup
   - You should see "Connecting..." status

---

## Setup Instructions

### 1. Install the Extension

Follow the [Quick Installation](#quick-installation) steps above.

### 2. Start WebSocket Server

The extension connects to a local WebSocket server. You need to run a compatible server:

```bash
# Example: Node.js WebSocket server
npm install ws
node websocket-server.js
```

**Example WebSocket Server** (`websocket-server.js`):

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('✅ Extension connected');

  ws.on('message', (data) => {
    const message = JSON.parse(data);
    console.log('Received:', message.type);

    // Handle messages from extension
    if (message.type === 'extension-connected') {
      console.log('Extension capabilities:', message.payload.capabilities);
    }
  });

  // Send a test command
  ws.send(JSON.stringify({
    type: 'browser-command',
    payload: {
      id: 'test-1',
      action: 'NAVIGATE',
      url: 'https://linkedin.com'
    }
  }));
});

console.log('🚀 WebSocket server running on ws://localhost:3000/ws');
```

### 3. Test Connection

1. Start your WebSocket server
2. Open the extension popup (click the ClaudeKit icon)
3. Status should change from "Connecting..." to "Connected ✓"
4. Green badge appears on the extension icon

---

## Usage Examples

### Basic Browser Commands

```javascript
// Navigate to URL
ws.send(JSON.stringify({
  type: 'browser-command',
  payload: {
    id: 'cmd-1',
    action: 'NAVIGATE',
    url: 'https://linkedin.com/in/johndoe'
  }
}));

// Click element
ws.send(JSON.stringify({
  type: 'browser-command',
  payload: {
    id: 'cmd-2',
    action: 'CLICK',
    selector: 'button[aria-label*="Connect"]',
    options: { delay: 1000 }
  }
}));

// Type text
ws.send(JSON.stringify({
  type: 'browser-command',
  payload: {
    id: 'cmd-3',
    action: 'TYPE',
    selector: 'input[name="search"]',
    text: 'Hello, world!',
    options: { clear: true, humanize: true }
  }
}));

// Scrape data
ws.send(JSON.stringify({
  type: 'browser-command',
  payload: {
    id: 'cmd-4',
    action: 'SCRAPE',
    selectors: {
      title: 'h1.profile-name',
      headline: '.profile-headline',
      location: '.profile-location'
    }
  }
}));
```

### LinkedIn Automation

```javascript
// View profile
ws.send(JSON.stringify({
  type: 'linkedin-action',
  payload: {
    type: 'view_profile',
    profileUrl: 'https://linkedin.com/in/johndoe'
  }
}));

// Send connection request
ws.send(JSON.stringify({
  type: 'linkedin-action',
  payload: {
    type: 'send_connection',
    profileUrl: 'https://linkedin.com/in/johndoe',
    note: 'Hi John, I'd love to connect!'
  }
}));

// Send message
ws.send(JSON.stringify({
  type: 'linkedin-action',
  payload: {
    type: 'send_message',
    profileUrl: 'https://linkedin.com/in/johndoe',
    message: 'Thanks for connecting!'
  }
}));

// Like post
ws.send(JSON.stringify({
  type: 'linkedin-action',
  payload: {
    type: 'like_post',
    postUrl: 'https://linkedin.com/posts/johndoe_...'
  }
}));

// Comment on post
ws.send(JSON.stringify({
  type: 'linkedin-action',
  payload: {
    type: 'comment',
    postUrl: 'https://linkedin.com/posts/johndoe_...',
    comment: 'Great post! Thanks for sharing.'
  }
}));
```

### Instagram Automation

```javascript
// Follow user
ws.send(JSON.stringify({
  type: 'instagram-action',
  payload: {
    type: 'follow',
    username: 'johndoe'
  }
}));

// Like post
ws.send(JSON.stringify({
  type: 'instagram-action',
  payload: {
    type: 'like_post',
    postUrl: 'https://instagram.com/p/ABC123/'
  }
}));

// Send DM
ws.send(JSON.stringify({
  type: 'instagram-action',
  payload: {
    type: 'send_dm',
    username: 'johndoe',
    message: 'Love your content!'
  }
}));
```

### Twitter/X Automation

```javascript
// Post tweet
ws.send(JSON.stringify({
  type: 'twitter-action',
  payload: {
    type: 'post_tweet',
    text: 'Hello Twitter! 🚀'
  }
}));

// Like tweet
ws.send(JSON.stringify({
  type: 'twitter-action',
  payload: {
    type: 'like_tweet',
    tweetUrl: 'https://twitter.com/user/status/123456'
  }
}));

// Follow user
ws.send(JSON.stringify({
  type: 'twitter-action',
  payload: {
    type: 'follow',
    username: 'elonmusk'
  }
}));
```

### Google Search Automation

```javascript
// Perform search
ws.send(JSON.stringify({
  type: 'google-action',
  payload: {
    type: 'search',
    query: 'Claude AI assistant'
  }
}));

// Extract results
ws.send(JSON.stringify({
  type: 'google-action',
  payload: {
    type: 'extract_results',
    maxResults: 10
  }
}));
```

---

## Platform Support

| Platform | Profile View | Connect/Follow | Message/DM | Like | Comment | Post |
|----------|-------------|----------------|------------|------|---------|------|
| **LinkedIn** | ✅ (100/day) | ✅ (15/day) | ✅ (40/day) | ✅ (50/day) | ✅ (30/day) | ❌ |
| **Instagram** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Twitter/X** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Google** | ✅ | N/A | N/A | N/A | N/A | N/A |
| **Any Website** | ✅ | ✅* | ✅* | ✅* | ✅* | ✅* |

\* Generic DOM manipulation available for any website

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Claude Code / Your App                   │
│                  (WebSocket Client: ws://localhost:3000/ws)  │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              │ WebSocket Commands
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                    WebSocket Server                          │
│                    (Node.js / Python / Any)                  │
│                    Port: 3000, Path: /ws                     │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              │ WebSocket Connection
                              │
┌─────────────────────────────▼───────────────────────────────┐
│              ClaudeKit Browser Extension                     │
│                                                              │
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Background.js  │  │  Content.js     │  │  Handlers/   │ │
│  │ (Service       │◄─┤  (DOM Access)   │◄─┤  - LinkedIn  │ │
│  │  Worker)       │  │                 │  │  - Instagram │ │
│  │                │  │  - Click        │  │  - Twitter   │ │
│  │ - WebSocket    │  │  - Type         │  │  - Google    │ │
│  │ - Commands     │  │  - Scrape       │  └──────────────┘ │
│  │ - Rate Limits  │  │  - Activity     │                    │
│  └────────────────┘  └─────────────────┘                    │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               │ DOM Manipulation
                               │
┌──────────────────────────────▼───────────────────────────────┐
│                     Active Browser Tab                        │
│         (LinkedIn, Instagram, Twitter, Google, etc.)          │
└───────────────────────────────────────────────────────────────┘
```

**Flow:**
1. Claude Code sends commands to WebSocket server
2. Server forwards commands to browser extension
3. Extension executes commands on active tab
4. Content script manipulates DOM, tracks activity
5. Results sent back through WebSocket to Claude Code

---

## API Reference

### WebSocket Messages

#### Extension → Server

**Connection Established:**
```json
{
  "type": "extension-connected",
  "payload": {
    "extensionId": "chrome-extension-id",
    "version": "1.0.0",
    "capabilities": ["navigate", "click", "type", "scrape", "linkedin", "instagram", "twitter", "google"]
  }
}
```

**Command Result:**
```json
{
  "type": "command-result",
  "commandId": "cmd-123",
  "success": true,
  "result": { "data": "..." }
}
```

**Activity Tracked:**
```json
{
  "type": "activity-tracked",
  "platform": "linkedin",
  "activity": [
    {
      "type": "PAGE_VIEW",
      "url": "https://linkedin.com/in/johndoe",
      "timestamp": 1234567890,
      "data": { "title": "...", "referrer": "..." }
    }
  ]
}
```

**Heartbeat:**
```json
{
  "type": "heartbeat",
  "timestamp": 1234567890
}
```

#### Server → Extension

**Browser Command:**
```json
{
  "type": "browser-command",
  "payload": {
    "id": "cmd-123",
    "action": "NAVIGATE" | "CLICK" | "TYPE" | "SCRAPE" | "EXECUTE_SCRIPT",
    "url": "https://...",           // For NAVIGATE
    "selector": "button.submit",    // For CLICK, TYPE
    "text": "Hello",                // For TYPE
    "selectors": { "key": "..." },  // For SCRAPE
    "script": "return document.title", // For EXECUTE_SCRIPT
    "options": {
      "delay": 1000,                // Delay before action (ms)
      "clear": true,                // Clear input before typing
      "humanize": true              // Human-like typing speed
    }
  }
}
```

**LinkedIn Action:**
```json
{
  "type": "linkedin-action",
  "payload": {
    "type": "view_profile" | "send_connection" | "send_message" | "like_post" | "comment" | "send_inmail",
    "profileUrl": "https://linkedin.com/in/johndoe",
    "note": "Custom connection note",
    "message": "Message text",
    "comment": "Comment text",
    "subject": "InMail subject",
    "body": "InMail body"
  }
}
```

**Instagram Action:**
```json
{
  "type": "instagram-action",
  "payload": {
    "type": "follow" | "like_post" | "comment" | "send_dm",
    "username": "johndoe",
    "postUrl": "https://instagram.com/p/ABC123/",
    "message": "DM text",
    "comment": "Comment text"
  }
}
```

**Twitter Action:**
```json
{
  "type": "twitter-action",
  "payload": {
    "type": "post_tweet" | "like_tweet" | "retweet" | "reply" | "follow" | "send_dm",
    "text": "Tweet text",
    "tweetUrl": "https://twitter.com/user/status/123",
    "username": "elonmusk",
    "message": "DM text"
  }
}
```

**Google Action:**
```json
{
  "type": "google-action",
  "payload": {
    "type": "search" | "extract_results",
    "query": "search query",
    "maxResults": 10
  }
}
```

**Ping:**
```json
{
  "type": "ping",
  "timestamp": 1234567890
}
```

### Browser Commands

| Action | Parameters | Description |
|--------|-----------|-------------|
| `NAVIGATE` | `url` | Navigate to URL and wait for page load |
| `CLICK` | `selector`, `options.delay` | Click element by CSS selector |
| `TYPE` | `selector`, `text`, `options.clear`, `options.humanize` | Type text into input |
| `SCRAPE` | `selectors` | Extract data from multiple elements |
| `EXECUTE_SCRIPT` | `script`, `args` | Execute custom JavaScript |

### Rate Limits

Default daily limits (configurable in `handlers/linkedin.js`):

| Action | Daily Limit |
|--------|-------------|
| LinkedIn Connections | 15 |
| LinkedIn Messages | 40 |
| LinkedIn Profile Views | 100 |
| LinkedIn Likes | 50 |
| LinkedIn Comments | 30 |
| LinkedIn InMails | 5 (requires Premium) |

Rate limits are enforced in the extension and stored in `chrome.storage.local`. They reset daily at midnight.

---

## Testing

### Run All Tests

```bash
cd tests
npm install
npm test
```

### Test Individual Platforms

```bash
# Test WebSocket connection
node test-connection.js

# Test LinkedIn automation
node test-linkedin.js

# Test Instagram automation
node test-instagram.js

# Test Twitter automation
node test-twitter.js

# Test Google automation
node test-google.js
```

See [tests/README.md](tests/README.md) for detailed testing instructions.

---

## Troubleshooting

### Extension Not Connecting

**Problem**: Extension shows "Connecting..." or "Disconnected" status.

**Solutions**:
1. Ensure WebSocket server is running: `ws://localhost:3000/ws`
2. Check browser console for errors: `Ctrl+Shift+J` (Chrome)
3. Click "Reconnect" button in extension popup
4. Verify no firewall blocking port 3000

### Commands Not Executing

**Problem**: WebSocket connected but commands don't execute.

**Solutions**:
1. Check message format matches [API Reference](#api-reference)
2. Ensure you're on the correct website (e.g., LinkedIn for linkedin-action)
3. Check content script is loaded: open DevTools → Sources → Content Scripts
4. Verify selectors are correct for current page version

### Rate Limit Errors

**Problem**: "Daily limit reached" errors.

**Solutions**:
1. Check rate limits in extension popup
2. Wait until midnight for reset
3. Clear stored limits: Extension popup → Clear Stats
4. Adjust limits in `handlers/linkedin.js` (use with caution)

### Selectors Not Working

**Problem**: "Element not found" errors.

**Solutions**:
1. LinkedIn/Instagram/Twitter frequently update their UI
2. Inspect page and update selectors in `handlers/*.js`
3. Use fallback selectors: `selector1, selector2`
4. Enable DevTools → inspect element → copy selector

### WebSocket Keeps Disconnecting

**Problem**: Connection drops frequently.

**Solutions**:
1. Check heartbeat responses in background console
2. Increase `HEARTBEAT_INTERVAL` in `background.js`
3. Verify server sends pong responses to heartbeat
4. Check network stability

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### How to Contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly (see [Testing](#testing))
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Use ES6+ features (async/await, arrow functions, destructuring)
- Add comments for complex logic
- Follow existing code structure in handlers
- Update README if adding new features

### Adding New Platform Handlers

1. Create `handlers/platform.js` following `handlers/linkedin.js` structure
2. Add platform detection in `content.js` → `detectPlatform()`
3. Add selectors in `content.js` → `SELECTORS`
4. Update background.js to handle new action type
5. Add tests in `tests/test-platform.js`
6. Update README with platform documentation

---

## Security

See [SECURITY.md](SECURITY.md) for security policy and vulnerability reporting.

**Security Best Practices**:
- Never share your extension ID publicly
- Only connect to trusted WebSocket servers
- Audit any custom scripts before execution
- Review rate limits to avoid account restrictions
- Keep extension updated

---

## License

MIT License - see [LICENSE](LICENSE) for details.

Copyright (c) 2026 Anit Kumar

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

## Acknowledgments

- Built for [Claude Code](https://claude.ai/code) automation
- Inspired by Browser-Use MCP
- Platform icons from [Simple Icons](https://simpleicons.org/)

---

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/claudekit-browser-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/claudekit-browser-extension/discussions)
- **Email**: support@claudekit.com

---

<div align="center">

**Made with ❤️ for Claude Code automation**

[⬆ Back to Top](#claudekit-universal-browser-extension)

</div>
