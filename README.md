# CROSS RAMP Demo Collection

A collection of platform-specific demos showcasing how to integrate CROSS RAMP into your games and applications.

## 📁 Available Demos

| Platform | Demo | Description |
|----------|------|-------------|
| **Web** | [web-ramp](./web-ramp/) | Next.js + React demo with Pong game |
| **Unity** | [unity-ramp](./unity-ramp/) | Unity 2022.3 demo with WebView integration |

## 🚀 Quick Start

1. **Choose your platform**: Select the appropriate demo for your platform
2. **Follow the guide**: Each demo has its own detailed README with setup instructions
3. **Customize**: Modify the demo to match your game's needs
4. **Integrate**: Add authentication with your game server

## 🎮 Demo Overview

### Web Demo (web-ramp)
- **Technology**: Next.js 14, React 18, TypeScript
- **Game**: Pong with asset management
- **Integration**: Popup/redirect-based
- **Best For**: Web games, PWAs, browser-based games

### Unity Demo (unity-ramp)
- **Technology**: Unity 2022.3, C#, WebView
- **Game**: Simple asset management game
- **Integration**: WebView-based with deep linking
- **Best For**: Unity games, mobile apps, cross-platform games

## 🛠️ Development

### Local Development
```bash
# Clone repository
git clone https://github.com/crosstoken/cross-ramp.git
cd cross-ramp/demos

# Run web demo
cd web-ramp
pnpm install
pnpm dev

# Run Unity demo
# Open unity-ramp folder in Unity Hub
```

## 🔧 Ramp Project Setup & Backend Integration

For the complete process from Ramp project ID issuance to backend integration, please refer to the following documentation:

📖 **[CROSS RAMP Integration Guide](https://github.com/to-nexus/cross-ramp-integration-sample/blob/master/GUIDE.md)**

This guide includes:
- Ramp project creation and configuration
- Backend server integration methods
- Authentication and payment flow implementation
- Security settings and environment variable management

## 📄 License

This demo collection is provided under the MIT License. See [LICENSE](../LICENSE) file for details. 
