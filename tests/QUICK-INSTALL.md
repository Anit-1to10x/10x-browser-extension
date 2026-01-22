# Quick Install & Run Guide

Get started with browser extension tests in 5 minutes.

## 1. Install Dependencies

```bash
cd C:\Users\Anit\Downloads\10x-Outreach-Skill\.claude\skills\browser-extension\tests
npm install
```

This installs the `ws` WebSocket package.

## 2. Start Canvas Server

**Terminal 1:**
```bash
cd C:\Users\Anit\Downloads\10x-Outreach-Skill\canvas
npm install  # First time only
npm start
```

Keep this terminal open. Server runs on `http://localhost:3000`

## 3. Load Browser Extension

1. Open Chrome
2. Go to `chrome://extensions`
3. Enable "Developer mode" (top right toggle)
4. Click "Load unpacked"
5. Select: `C:\Users\Anit\Downloads\10x-Outreach-Skill\.claude\skills\browser-extension`
6. Verify badge shows ✓ (green)

## 4. Run Tests

**Terminal 2:**
```bash
cd C:\Users\Anit\Downloads\10x-Outreach-Skill\.claude\skills\browser-extension\tests

# Run all tests
run-all-tests.bat

# OR run individual test
node test-connection.js
```

## 5. Expected Output

```
============================================================
Browser Extension Test Suite
============================================================

[2026-01-22T17:24:35.123Z] Starting WebSocket Connection Tests
[2026-01-22T17:24:35.456Z] ✓ PASS: WebSocket connection established
[2026-01-22T17:24:36.123Z] ✓ PASS: Sent identification message
[2026-01-22T17:24:37.456Z] ✓ PASS: Ping/Pong heartbeat working
...

============================================================
Test Summary: 7 passed, 0 failed
============================================================

[RESULT] All tests PASSED
```

## Troubleshooting

### "Cannot find module 'ws'"

```bash
cd tests
npm install
```

### "Connection timeout"

1. Check Canvas server is running (Terminal 1)
2. Visit `http://localhost:3000` in browser
3. Check firewall isn't blocking port 3000

### Extension badge shows ✗ (red)

1. Reload extension: `chrome://extensions` → Reload button
2. Check browser console (F12) for errors
3. Restart Canvas server

## Quick Test

Run only connection test (fastest):
```bash
node test-connection.js
```

Should complete in ~5 seconds.

## Platform Tests

For LinkedIn/Instagram/Twitter tests:
1. Log into platform in Chrome
2. Edit test data in test file
3. Run specific test:
   ```bash
   node test-linkedin.js
   ```

**⚠️ Warning:** Platform tests perform real actions. Use test accounts only!

## Success Criteria

All tests pass (exit code 0):
- ✓ WebSocket connection working
- ✓ Extension communicating with server
- ✓ Commands execute successfully
- ✓ Responses received correctly

## Next Steps

- Read full [README.md](./README.md) for details
- Configure test data for your accounts
- Integrate tests into CI/CD pipeline
- Run tests after code changes

---

**Need Help?** See [README.md](./README.md) troubleshooting section
