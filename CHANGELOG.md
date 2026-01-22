# Changelog

All notable changes to ClaudeKit Browser Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-01-22

### 🎉 Initial Release

**ClaudeKit Universal Browser Controller** - The first version of the browser automation extension for Claude Code.

### ✨ Features Added

#### Core Functionality
- **WebSocket Integration**: Real-time bi-directional communication via `ws://localhost:3000/ws`
- **Universal DOM Manipulation**: Click, type, scrape, and execute scripts on any website
- **Platform Detection**: Automatic detection of LinkedIn, Instagram, Twitter, Google, and generic websites
- **Activity Tracking**: Comprehensive tracking of page views, clicks, form submissions, scroll depth
- **Auto-Reconnect**: Automatic WebSocket reconnection with exponential backoff
- **Heartbeat Monitoring**: Connection health checks every 30 seconds
- **Rate Limiting**: Smart daily limits to prevent platform restrictions

#### LinkedIn Automation
- View profiles and extract data (100/day)
- Send connection requests with custom notes (15/day)
- Send direct messages (40/day)
- Like posts (50/day)
- Comment on posts (30/day)
- Send InMails (5/day, requires LinkedIn Premium)

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

#### Browser Commands
- `NAVIGATE` - Navigate to URLs with page load detection
- `CLICK` - Click elements by CSS selector with configurable delays
- `TYPE` - Type text with human-like timing and clear option
- `SCRAPE` - Extract data from multiple elements
- `EXECUTE_SCRIPT` - Run custom JavaScript in page context

#### Extension UI
- Connection status indicator with real-time updates
- Activity statistics for all platforms
- Rate limit progress bars
- Manual reconnect button
- Clear statistics functionality
- Version display

#### Testing Suite
- WebSocket connection tests
- LinkedIn automation tests
- Instagram automation tests
- Twitter automation tests
- Google automation tests
- Run-all-tests script
- Test configuration utilities

### 📚 Documentation
- Comprehensive README with installation guide
- API reference for WebSocket messages
- Usage examples for all platforms
- Architecture diagram
- Troubleshooting guide
- Contributing guidelines (CONTRIBUTING.md)
- Security policy (SECURITY.md)
- MIT License
- Package.json with test scripts

### 🛠️ Technical Details

**Manifest Version**: 3
**Minimum Chrome Version**: 88
**Permissions**: activeTab, tabs, storage, cookies, webNavigation, webRequest, scripting
**Host Permissions**: `<all_urls>`

**Files Structure**:
```
├── manifest.json          # Extension configuration
├── background.js          # Service worker with WebSocket
├── content.js            # Content script for DOM access
├── handlers/             # Platform-specific handlers
│   ├── linkedin.js
│   ├── instagram.js
│   ├── twitter.js
│   └── google.js
├── popup/               # Extension popup UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── tests/               # Test suite
│   ├── test-connection.js
│   ├── test-linkedin.js
│   ├── test-instagram.js
│   ├── test-twitter.js
│   └── test-google.js
└── icons/               # Extension icons
```

### 🔒 Security
- Rate limiting to prevent abuse
- Activity tracking with privacy considerations
- Secure WebSocket communication (localhost only by default)
- No external data transmission
- Local storage for rate limits only

### 🐛 Known Issues
None at initial release.

### 📝 Notes
- LinkedIn, Instagram, and Twitter frequently update their UI. Selectors may need updates.
- InMail functionality requires LinkedIn Premium subscription.
- Rate limits are conservative to protect user accounts.

---

## [Unreleased]

### Planned Features
- OAuth authentication for platforms
- Custom rate limit configuration UI
- Export activity logs
- Scheduled automation
- Multi-account support
- Browser action recording
- Visual workflow builder
- Cloud sync for settings

### Future Platform Support
- Facebook
- TikTok
- Reddit
- YouTube
- GitHub
- Medium
- Discord

---

## Version History

- **1.0.0** (2026-01-22) - Initial release

---

## How to Update

### Manual Update
1. Download latest version from [releases](https://github.com/yourusername/claudekit-browser-extension/releases)
2. Extract files
3. Open `chrome://extensions/`
4. Click "Remove" on old version
5. Click "Load unpacked" and select new folder

### Auto-Update (Future)
Once published to Chrome Web Store, extensions auto-update automatically.

---

## Support

For issues or questions:
- **Issues**: [GitHub Issues](https://github.com/yourusername/claudekit-browser-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/claudekit-browser-extension/discussions)

---

**[⬆ Back to Top](#changelog)**
