# CROSS RAMP Web Demo

A simple web demo showing how to integrate CROSS RAMP into your web game or application. The core integration is just generating a URL with query parameters and opening it.

## 🎯 What is CROSS RAMP?

CROSS RAMP is a game asset exchange platform that allows players to:
- **Mint Tokens**: Convert game assets into blockchain tokens
- **Burn Tokens**: Convert blockchain tokens back into game assets
- **Cross-Platform**: Exchange assets across different games

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation & Run
```bash
cd demos/web-ramp
pnpm install
pnpm dev
# Open http://localhost:3001
```

## 🔧 Core Integration

The entire CROSS RAMP integration boils down to this:

### 1. Generate URL with Query Parameters

```javascript
function generateRampUrl(projectId, accessToken, sessionId, language = 'en') {
  const rampBaseUrl = 'https://ramp.crosstoken.io';
  const params = new URLSearchParams({
    projectId,
    sessionId,
    accessToken,
    lang: language,
    platform: 'web',
    timestamp: Math.floor(Date.now() / 1000).toString()
  });
  
  return `${rampBaseUrl}/catalog?${params.toString()}`;
}
```

### 2. Open the URL

```javascript
function openCrossRamp(projectId, accessToken, sessionId, language = 'en') {
  const url = generateRampUrl(projectId, accessToken, sessionId, language);
  
  // Desktop: Open in popup
  if (window.innerWidth > 768) {
    const popup = window.open(url, 'cross-ramp', 'width=1000,height=800');
    if (!popup) {
      alert('Please allow popups for this site');
    }
  } else {
    // Mobile: Open in new tab
    window.open(url, '_blank');
  }
}
```

### 3. Use in Your Game

```javascript
// After user login, get these from your server
const projectId = 'your-project-id';
const accessToken = 'user-access-token';
const sessionId = 'user-session-id';

// Add click handler to your button
document.getElementById('ramp-button').onclick = () => {
  openCrossRamp(projectId, accessToken, sessionId, 'en');
};
```

## 📋 Required Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string | ✅ | Your CROSS RAMP project ID |
| `accessToken` | string | ✅ | User authentication token |
| `sessionId` | string | ✅ | User session ID |
| `lang` | string | ❌ | Language code (en, ko, zh) |
| `platform` | string | ❌ | Platform identifier (web, mobile) |
| `timestamp` | number | ❌ | Unix timestamp |

## 🔐 Authentication

### Get Tokens from Your Server

```javascript
// Example: After user login
async function loginUser(username, password) {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const userData = await response.json();
  
  // Your server should return these for CROSS RAMP
  return {
    projectId: userData.projectId,
    accessToken: userData.accessToken,
    sessionId: userData.sessionId
  };
}
```

### Security Notes
- ✅ Generate tokens server-side only
- ✅ Use HTTPS in production
- ✅ Implement token expiration
- ❌ Never hardcode tokens in client code

## 📱 Platform Detection

The demo automatically detects the platform and opens CROSS RAMP appropriately:

```javascript
function openCrossRamp(url) {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isInApp = window.navigator.userAgent.includes('wv') || 
                  window.navigator.userAgent.includes('WebView');
  
  if (isMobile) {
    if (isInApp) {
      // In-app WebView: open in same tab
      window.location.href = url;
    } else {
      // Mobile browser: open in new tab
      window.open(url, '_blank');
    }
  } else {
    // Desktop: open popup
    const popup = window.open(url, 'cross-ramp', 'width=1000,height=800');
    if (!popup) {
      alert('Please allow popups for this site');
    }
  }
}
```

## 🎨 Customization

### Your Own Button

```html
<!-- Simple button -->
<button onclick="openCrossRamp(projectId, accessToken, sessionId)">
  Exchange Assets
</button>

<!-- Styled button -->
<button 
  onclick="openCrossRamp(projectId, accessToken, sessionId)"
  style="background: linear-gradient(45deg, #667eea 0%, #764ba2 100%); 
         color: white; 
         padding: 12px 24px; 
         border: none; 
         border-radius: 8px; 
         cursor: pointer;">
  CROSS RAMP
</button>
```

### Language Support

```javascript
// Add language selector to your game
function changeLanguage(lang) {
  // Update your game language
  setGameLanguage(lang);
  
  // Store preference for CROSS RAMP
  localStorage.setItem('ramp-language', lang);
}

// Use stored language when opening CROSS RAMP
function openRampWithUserLanguage() {
  const userLang = localStorage.getItem('ramp-language') || 'en';
  openCrossRamp(projectId, accessToken, sessionId, userLang);
}
```

## 🧪 Testing

### Testnet Configuration

CROSS RAMP supports both mainnet and testnet environments. To use testnet, modify the URL generation function:

```javascript
function generateRampUrl(projectId, accessToken, sessionId, language = 'en', isTestnet = false) {
  const rampHost = process.env.NEXT_PUBLIC_RAMP_HOST || 'ramp.crosstoken.io';
  const rampBaseUrl = isTestnet ? `https://stg-${rampHost}` : `https://${rampHost}`;
  
  const catalogUrlObj = new URL('/catalog', rampBaseUrl);
  const params = new URLSearchParams({
    projectId,
    sessionId,
    accessToken,
    lang: language,
    platform: 'web',
    timestamp: Math.floor(Date.now() / 1000).toString()
  });
  
  catalogUrlObj.search = params.toString();
  return catalogUrlObj.toString();
}
```

### Environment Variables for Testnet

```bash
# .env.local
NEXT_PUBLIC_RAMP_HOST=ramp.crosstoken.io
NEXT_PUBLIC_RAMP_PORT=8282
```

### Using Testnet in Your Application

```javascript
// Mainnet (production)
const mainnetUrl = generateRampUrl(projectId, accessToken, sessionId, 'en', false);
// Result: https://ramp.crosstoken.io/catalog?...

// Testnet (development/testing)
const testnetUrl = generateRampUrl(projectId, accessToken, sessionId, 'en', true);
// Result: https://stg-ramp.crosstoken.io/catalog?...

// Open CROSS RAMP with testnet
function openCrossRampTestnet() {
  const url = generateRampUrl(projectId, accessToken, sessionId, 'en', true);
  window.open(url, 'cross-ramp-testnet', 'width=1000,height=800');
}
```

### Test the Integration

```javascript
// Test with demo tokens (development only)
const demoProjectId = 'demo-project';
const demoAccessToken = `demo_${Date.now()}`;
const demoSessionId = `session_${Date.now()}`;

// Test URL generation (mainnet)
const mainnetUrl = generateRampUrl(demoProjectId, demoAccessToken, demoSessionId, 'en', false);
console.log('Generated Mainnet URL:', mainnetUrl);

// Test URL generation (testnet)
const testnetUrl = generateRampUrl(demoProjectId, demoAccessToken, demoSessionId, 'en', true);
console.log('Generated Testnet URL:', testnetUrl);

// Test opening
openCrossRamp(demoProjectId, demoAccessToken, demoSessionId, 'en');
```

### Test Checklist
- [ ] URL generates correctly with all parameters
- [ ] Testnet URL uses stg- prefix
- [ ] Opens in popup on desktop
- [ ] Opens in new tab on mobile
- [ ] Works in WebView (mobile apps)
- [ ] Language parameter works
- [ ] Popup blocker detection works

## 🚀 Production Deployment

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_RAMP_URL=https://ramp.crosstoken.io
NEXT_PUBLIC_RAMP_PORT=8282
```

### Production URL Generation

```javascript
function generateRampUrl(projectId, accessToken, sessionId, language = 'en') {
  const rampBaseUrl = process.env.NEXT_PUBLIC_RAMP_URL || 'https://ramp.crosstoken.io';
  const params = new URLSearchParams({
    projectId,
    sessionId,
    accessToken,
    lang: language,
    platform: 'web',
    timestamp: Math.floor(Date.now() / 1000).toString()
  });
  
  return `${rampBaseUrl}/catalog?${params.toString()}`;
}
```

## 🔍 Troubleshooting

### Common Issues

**Popup Blocked**
```javascript
const popup = window.open(url, 'cross-ramp');
if (!popup || popup.closed) {
  // Fallback: open in same tab
  window.location.href = url;
}
```

**CORS Errors**
- Ensure your domain is whitelisted on CROSS RAMP server
- Use HTTPS in production

**Authentication Failed**
- Check token format and expiration
- Verify projectId is correct

## 📚 API Reference

### URL Structure
```
https://ramp.crosstoken.io/catalog?projectId=xxx&sessionId=xxx&accessToken=xxx&lang=en&platform=web&timestamp=1234567890
```

### Function Signature
```javascript
openCrossRamp(projectId, accessToken, sessionId, language = 'en')
```

### Parameters
- `projectId` (string): Your CROSS RAMP project ID
- `accessToken` (string): User authentication token
- `sessionId` (string): User session ID  
- `language` (string, optional): Language code (en, ko, zh)

## 📞 Support

- **Documentation**: [docs.crosstoken.io](https://docs.crosstoken.io)
- **API Reference**: [api.crosstoken.io/docs](https://api.crosstoken.io/docs)
- **Technical Support**: dev@crosstoken.io
- **GitHub Issues**: [github.com/crosstoken/cross-ramp/issues](https://github.com/crosstoken/cross-ramp/issues)

## 📄 License

MIT License - see LICENSE file for details.

---

**That's it!** The entire CROSS RAMP integration is just generating a URL and opening it. Copy the code above and you're ready to go. 