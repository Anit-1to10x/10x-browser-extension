# Universal Browser Extension - Implementation Guide

## Overview

This extension replaces Browser-Use MCP with direct WebSocket integration to the 10x-Outreach canvas server (`localhost:3000`). It provides universal browser control across all websites with real-time communication.

## Architecture

```
Canvas WebSocket Server (localhost:3000/ws)
    ↕ WebSocket
Extension Background Service Worker
    ↕ Chrome Extension Messaging
Content Scripts (Injected into pages)
    ↕ DOM Manipulation
Target Websites (LinkedIn, Instagram, Twitter, Google, etc.)
```

## Files Created

### Core Extension Files

1. **`manifest.json`** ✅ Created
   - Manifest v3 configuration
   - Permissions for all websites
   - Background service worker setup

2. **`background.js`** ✅ Created (500+ lines)
   - WebSocket connection to canvas server
   - Command dispatcher
   - Platform action handlers
   - Auto-reconnection logic
   - Heartbeat mechanism
   - Pending command queue

3. **`content.js`** (To create - 400+ lines)
   - Universal DOM manipulation
   - Activity tracking
   - Page-specific handlers
   - Event listeners

4. **`handlers/`** (To create)
   - `linkedin.js` - LinkedIn-specific actions
   - `instagram.js` - Instagram-specific actions
   - `twitter.js` - Twitter-specific actions
   - `google.js` - Google Search actions
   - `generic.js` - Universal actions

5. **`popup/`** (To create)
   - `popup.html` - Extension popup UI
   - `popup.js` - Popup logic
   - `popup.css` - Styles

## WebSocket Integration

### Connection Flow

1. Extension loads → Background worker starts
2. Connects to `ws://localhost:3000/ws`
3. Sends identification message
4. Starts heartbeat (every 30s)
5. Listens for commands from canvas

### Message Protocol

#### From Canvas → Extension

```json
{
  "type": "browser-command",
  "payload": {
    "id": "cmd-123",
    "action": "NAVIGATE",
    "url": "https://linkedin.com/in/john-doe"
  }
}
```

```json
{
  "type": "linkedin-action",
  "payload": {
    "type": "send_connection",
    "profile_url": "https://linkedin.com/in/jane-smith",
    "message": "Hi Jane, let's connect!"
  }
}
```

#### From Extension → Canvas

```json
{
  "type": "command-result",
  "commandId": "cmd-123",
  "success": true,
  "result": {
    "profile_name": "John Doe",
    "title": "CEO at Acme Corp"
  }
}
```

```json
{
  "type": "activity-tracked",
  "platform": "linkedin",
  "activity": {
    "type": "profile_view",
    "url": "https://linkedin.com/in/john-doe",
    "timestamp": "2026-01-22T17:00:00Z"
  }
}
```

## Replacing Browser-Use MCP

### Current Architecture (Browser-Use)

```python
# Current: linkedin_adapter.py
result = mcp__browser-use__browser_task({
    "task": "Go to LinkedIn and send connection request",
    "max_steps": 12
})
```

### New Architecture (Extension)

```python
# New: Send command via WebSocket to extension
websocket.send(json.dumps({
    "type": "linkedin-action",
    "payload": {
        "type": "send_connection",
        "profile_url": url,
        "message": message
    }
}))

# Wait for response
result = await websocket.recv()
```

## Integration Steps

### Step 1: Update Canvas Server

Add extension message handling to `canvas/server.js`:

```javascript
// Handle extension connections
wss.on('connection', (ws, req) => {
  ws.on('message', (data) => {
    const message = JSON.parse(data);

    if (message.type === 'extension-connected') {
      console.log('Extension connected:', message.payload.extensionId);
      extensionClients.set(ws, message.payload);
    }

    if (message.type === 'command-result') {
      // Forward result to waiting command
      handleCommandResult(message);
    }

    if (message.type === 'activity-tracked') {
      // Store activity in database
      storeActivity(message);
    }
  });
});

// Send command to extension
function sendToExtension(command) {
  extensionClients.forEach((client, ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(command));
    }
  });
}
```

### Step 2: Update Adapters

**Before (Browser-Use MCP):**
```python
# .claude/scripts/linkedin_adapter.py
from mcp import browser_use

def send_connection(profile_url, message):
    result = browser_use.browser_task({
        "task": f"Go to {profile_url} and click Connect",
        "max_steps": 12
    })
    return result
```

**After (WebSocket Extension):**
```python
# .claude/scripts/linkedin_adapter.py
import asyncio
import websockets
import json

class LinkedInAdapter:
    def __init__(self):
        self.ws_url = 'ws://localhost:3000/ws'
        self.ws = None

    async def connect(self):
        self.ws = await websockets.connect(self.ws_url)

    async def send_connection(self, profile_url, message):
        command = {
            "type": "linkedin-action",
            "payload": {
                "type": "send_connection",
                "profile_url": profile_url,
                "message": message
            }
        }

        await self.ws.send(json.dumps(command))

        # Wait for result
        response = await self.ws.recv()
        return json.loads(response)
```

### Step 3: Copy LinkedIn Lookback Integration

```bash
# Copy linkedin-lookback skill
cp -r 10x-Team/.claude/skills/linkedin-lookback \
      10x-Outreach-Skill/.claude/skills/

# Update mcp.json
# Add browser-extension skill reference
```

## Command API

### Generic Browser Commands

```javascript
// NAVIGATE
{
  "type": "browser-command",
  "payload": {
    "action": "NAVIGATE",
    "url": "https://example.com"
  }
}

// CLICK
{
  "type": "browser-command",
  "payload": {
    "action": "CLICK",
    "selector": "button.connect-button",
    "options": { "delay": 1000 }
  }
}

// TYPE
{
  "type": "browser-command",
  "payload": {
    "action": "TYPE",
    "selector": "input[name='email']",
    "text": "john@example.com",
    "options": { "humanize": true, "clear": true }
  }
}

// SCRAPE
{
  "type": "browser-command",
  "payload": {
    "action": "SCRAPE",
    "selectors": {
      "name": "h1.profile-name",
      "title": "div.profile-title",
      "company": "a.company-link"
    }
  }
}
```

### Platform-Specific Commands

#### LinkedIn
```javascript
{
  "type": "linkedin-action",
  "payload": {
    "type": "send_connection",  // or: view_profile, like_post, send_message
    "profile_url": "https://linkedin.com/in/john-doe",
    "message": "Hi John, let's connect!" // optional
  }
}
```

#### Instagram
```javascript
{
  "type": "instagram-action",
  "payload": {
    "type": "like_post",  // or: comment, follow, send_dm
    "post_url": "https://instagram.com/p/ABC123",
    "comment": "Great post!" // optional
  }
}
```

#### Twitter
```javascript
{
  "type": "twitter-action",
  "payload": {
    "type": "tweet",  // or: like, retweet, reply, dm
    "text": "Check out this amazing tool!",
    "media_urls": [] // optional
  }
}
```

## Activity Tracking

The extension automatically tracks all user activity:

```javascript
// LinkedIn profile view
{
  "type": "activity-tracked",
  "platform": "linkedin",
  "activity": {
    "type": "profile_view",
    "url": "https://linkedin.com/in/john-doe",
    "timestamp": "2026-01-22T17:00:00Z",
    "data": {
      "name": "John Doe",
      "title": "CEO at Acme Corp",
      "company": "Acme Corp"
    }
  }
}
```

This data is:
1. Sent to canvas server via WebSocket
2. Stored in database
3. Used for lead qualification
4. Triggers automated workflows

## Testing

### 1. Load Extension

```bash
# Chrome
1. Go to chrome://extensions
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select: 10x-Outreach-Skill/.claude/skills/browser-extension
```

### 2. Start Canvas Server

```bash
cd 10x-Outreach-Skill/canvas
npm install
npm start

# Server running on http://localhost:3000
# WebSocket on ws://localhost:3000/ws
```

### 3. Test WebSocket Connection

Open extension popup:
- Should show "✓ Connected" badge
- Check console: "[ClaudeKit Browser] ✅ Connected"

### 4. Test Browser Command

```bash
# Send test command via HTTP API
curl -X POST http://localhost:3000/api/extension/command \
  -H "Content-Type: application/json" \
  -d '{
    "type": "browser-command",
    "payload": {
      "action": "NAVIGATE",
      "url": "https://linkedin.com"
    }
  }'
```

Extension should navigate to LinkedIn.

### 5. Test LinkedIn Action

```bash
curl -X POST http://localhost:3000/api/extension/command \
  -H "Content-Type: application/json" \
  -d '{
    "type": "linkedin-action",
    "payload": {
      "type": "view_profile",
      "profile_url": "https://linkedin.com/in/satyanadella"
    }
  }'
```

Extension should view the profile and send back scraped data.

## Benefits vs Browser-Use

| Feature | Browser-Use MCP | Universal Extension |
|---------|----------------|-------------------|
| Installation | Cloud-hosted | One-click local |
| Latency | High (cloud) | Low (local) |
| Cost | Pay per use | Free |
| Visibility | Hidden | User sees actions |
| Control | Limited steps | Full control |
| Persistence | Temporary | Permanent (cookies) |
| Multi-tab | No | Yes |
| Debugging | Difficult | Chrome DevTools |
| Activity Tracking | No | Yes (built-in) |
| WebSocket Integration | No | Yes (real-time) |

## Next Steps

1. ✅ **Core extension files** (manifest, background)
2. ⏳ **Create content script** (400+ lines)
3. ⏳ **Create platform handlers** (LinkedIn, Instagram, Twitter)
4. ⏳ **Create popup UI** (HTML, JS, CSS)
5. ⏳ **Update canvas server** (add extension handling)
6. ⏳ **Update adapters** (replace MCP calls)
7. ⏳ **Copy linkedin-lookback skill**
8. ⏳ **Test end-to-end**
9. ⏳ **Document usage**
10. ⏳ **Commit to GitHub**

## Current Status

- ✅ Architecture designed
- ✅ Core files created (manifest.json, background.js)
- ⏳ Content script (next)
- ⏳ Platform handlers (next)
- ⏳ Integration testing (after handlers)

Ready to proceed with content script and handlers!

---

**Version**: 1.0.0
**Last Updated**: 2026-01-22
**Status**: In Progress
