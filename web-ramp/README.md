# CROSS RAMP Web Demo

A simple web demo showing how to integrate CROSS RAMP into your web game or application. The core integration is just generating a URL with query parameters and opening it.

## 🎯 What is CROSS RAMP?

CROSS RAMP is a game asset exchange platform that allows players to:
- **Mint Tokens**: Convert game assets into blockchain tokens
- **Burn Tokens**: Convert blockchain tokens back into game assets
- **Cross-Platform**: Exchange assets on any platform

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
const generateRampUrl = (isTestnet: boolean = false): string => {
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
};
```

### 2. Open the URL

```javascript
const openCrossRamp = async () => {
  const catalogUrl = generateRampUrl();
  
  // Desktop: popup, Mobile: new tab
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    window.open(catalogUrl, '_blank');
  } else {
    const popup = window.open(catalogUrl, 'cross-ramp', 'width=1000,height=800');
    if (!popup) alert('Please allow popups');
  }
};
```

### 3. Use in Your Game

```javascript
// After user login, get these from your server
const projectId = 'your-project-id';
const accessToken = 'user-access-token';
const sessionId = 'user-session-id';

// Add click handler to your button
document.getElementById('ramp-button').onclick = openCrossRamp;
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

## 📄 License

MIT License - see LICENSE file for details.

---

**That's it!** The entire CROSS RAMP integration is just generating a URL and opening it. Copy the code above and you're ready to go. 