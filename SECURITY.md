# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 🚨 How to Report

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead:

1. **Email**: Send details to **security@claudekit.com** (or create a private security advisory on GitHub)
2. **Subject**: "Security Vulnerability - ClaudeKit Browser Extension"
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
   - Your contact information (for follow-up)

### ⏱️ Response Timeline

- **Initial Response**: Within 48 hours
- **Triage**: Within 1 week
- **Fix & Patch**: Within 2-4 weeks (depending on severity)
- **Public Disclosure**: After patch is released and users have had time to update

### 🏆 Recognition

We appreciate security researchers who help make ClaudeKit Browser Extension secure:

- Security researchers will be credited in release notes (unless anonymity is requested)
- Critical vulnerabilities may be eligible for acknowledgment on our website

---

## Security Best Practices for Users

### 🔒 Installation

- **Only install from trusted sources**:
  - Official GitHub repository: [github.com/yourusername/claudekit-browser-extension](https://github.com/yourusername/claudekit-browser-extension)
  - Chrome Web Store (once available)
- **Verify integrity**: Check commit signatures and compare file hashes
- **Review permissions**: Before installation, review requested permissions in `manifest.json`

### 🌐 WebSocket Server

- **Use localhost only**: Default configuration uses `ws://localhost:3000/ws`
- **Do not expose publicly**: Never bind WebSocket server to `0.0.0.0` or public IPs
- **Use authentication**: Implement token-based authentication if exposing beyond localhost
- **Consider TLS**: Use `wss://` instead of `ws://` for encrypted connections

### 🔑 Credentials & Data

- **Never hardcode credentials**: Don't store passwords or API keys in extension
- **Use secure storage**: Browser extension storage is NOT encrypted
- **Review activity logs**: Periodically check tracked activities in extension popup
- **Clear data regularly**: Use "Clear Stats" button to remove stored data

### 🛡️ Account Protection

- **Respect rate limits**: Don't modify rate limits beyond platform recommendations
- **Use delays**: Enable human-like delays in automation to avoid detection
- **Monitor for bans**: Check if platforms flag your account
- **Create test accounts**: Test automation on disposable accounts first

### 🚦 Platform Terms of Service

- **Read platform TOS**: Automation may violate terms of service on some platforms
- **Use responsibly**: Don't spam, harass, or violate platform guidelines
- **Commercial use**: Check if automation is permitted for commercial purposes
- **Data scraping**: Respect robots.txt and rate limits when scraping

---

## Known Security Considerations

### ⚠️ Current Limitations

1. **Local Storage Not Encrypted**
   - Activity logs and rate limits stored in `chrome.storage.local`
   - Data readable by anyone with file system access
   - **Mitigation**: Don't store sensitive data in extension

2. **WebSocket Communication Unencrypted**
   - Default uses `ws://` (unencrypted) not `wss://` (encrypted)
   - Commands sent in plaintext over localhost
   - **Mitigation**: Use `wss://` with TLS for remote connections

3. **No Authentication**
   - WebSocket server doesn't authenticate connections by default
   - Any local process can connect to server
   - **Mitigation**: Implement token-based authentication

4. **Content Script Injection**
   - Content scripts have access to page DOM
   - Malicious websites could detect and interfere with automation
   - **Mitigation**: Be cautious on untrusted websites

5. **Rate Limit Bypass**
   - Rate limits stored client-side, can be cleared
   - Users can modify limits in code
   - **Mitigation**: Use responsibly; platform-side limits still apply

### 🔧 Planned Security Enhancements

- [ ] WebSocket authentication tokens
- [ ] Encrypted storage for sensitive data
- [ ] Rate limit enforcement on server side
- [ ] Content Security Policy (CSP) improvements
- [ ] Audit logging for command execution
- [ ] HTTPS-only mode for production use

---

## Security Features

### ✅ Current Protections

1. **Rate Limiting**
   - Prevents excessive automation that could trigger bans
   - Daily limits per action type (connections, messages, etc.)
   - Stored in `chrome.storage.local` with date-based resets

2. **Activity Tracking**
   - Logs all automation actions
   - Visible in extension popup for user awareness
   - Can be cleared by user

3. **Localhost-Only Default**
   - WebSocket connects to `localhost:3000` by default
   - Prevents accidental exposure to public networks

4. **Manifest V3**
   - Uses modern Manifest V3 API
   - Service workers instead of background pages
   - Improved security and permissions model

5. **Content Script Isolation**
   - Content scripts run in isolated world
   - Cannot directly access page JavaScript variables
   - Communicates via message passing

6. **Host Permissions**
   - Requires user approval for `<all_urls>` permission
   - Users can revoke permissions at any time

---

## Vulnerability Disclosure Policy

### 🔍 Scope

**In Scope:**
- WebSocket communication security
- Extension permission misuse
- Data leakage or privacy issues
- Code injection vulnerabilities
- Authentication bypass
- Rate limit bypass (server-side)

**Out of Scope:**
- Third-party platform vulnerabilities (LinkedIn, Instagram, etc.)
- Social engineering attacks
- Physical access to user's computer
- Rate limit bypass (client-side only - by design)
- Denial of service of local WebSocket server

### 📊 Severity Levels

| Severity | Description | Response Time |
|----------|-------------|---------------|
| **Critical** | Remote code execution, credential theft | 24-48 hours |
| **High** | Authentication bypass, data leakage | 3-7 days |
| **Medium** | DoS, rate limit bypass, minor data exposure | 1-2 weeks |
| **Low** | UI bugs, cosmetic issues | 2-4 weeks |

---

## Security Checklist for Contributors

When contributing code, ensure:

- [ ] No hardcoded credentials or API keys
- [ ] No sensitive data logged to console
- [ ] No eval() or unsafe JavaScript execution
- [ ] No inline event handlers (use addEventListener)
- [ ] No external script loading without SRI
- [ ] Rate limits respected for platform actions
- [ ] Input validation on all WebSocket commands
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies are up-to-date and audited

---

## Third-Party Dependencies

We strive to minimize external dependencies. Currently:

- **No production dependencies**: Extension uses only browser APIs
- **Dev dependencies**: Only for testing (e.g., `ws` for test WebSocket server)

When dependencies are added:
- Use `npm audit` to check for vulnerabilities
- Pin versions to avoid supply chain attacks
- Review dependency permissions and code

---

## Incident Response

In the event of a security incident:

1. **Detection**: User reports or automated monitoring detects issue
2. **Triage**: Security team assesses severity and impact
3. **Containment**: Immediate mitigation deployed if possible
4. **Investigation**: Root cause analysis performed
5. **Remediation**: Patch developed and tested
6. **Disclosure**: Public disclosure after patch release
7. **Lessons Learned**: Post-mortem and process improvements

---

## Security Resources

- [OWASP Browser Extension Security](https://owasp.org/www-community/vulnerabilities/Browser_Extension_Security)
- [Chrome Extension Security](https://developer.chrome.com/docs/extensions/mv3/security/)
- [WebSocket Security](https://owasp.org/www-community/vulnerabilities/WebSocket_Security)

---

## Contact

- **Security Issues**: security@claudekit.com
- **General Issues**: [GitHub Issues](https://github.com/yourusername/claudekit-browser-extension/issues)
- **Private Reports**: GitHub Security Advisories

---

**Thank you for helping keep ClaudeKit Browser Extension secure!**

Last updated: 2026-01-22
