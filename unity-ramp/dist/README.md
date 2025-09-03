# CrossRampManager Distribution

This directory contains the distributable Unity package files for CrossRampManager.

## 📦 Package Files

### CrossRampManager.unitypackage
The main Unity package containing:
- **CrossRampManager.prefab** - Main prefab component
- **CrossRampManager.cs** - Core script with device-aware WebView handling
- **LanguageManager.cs** - Multi-language support system
- **CreateCrossRampPrefab.cs** - Editor utilities
- **iOSURLSchemeHandler.cs** - iOS URL scheme handling

## 🚀 Installation

### For Game Developers
1. **Download** `CrossRampManager.unitypackage`
2. **In Unity**: `Assets > Import Package > Custom Package`
3. **Select** the downloaded package file
4. **Import All** (default selections are correct)
5. **Install dependency**: Unity WebView plugin from [gree/unity-webview](https://github.com/gree/unity-webview)

### Quick Start
1. **Drag** `CrossRampManager.prefab` to your scene
2. **Configure** your Project ID in the Inspector
3. **Call** `CrossRampManager.OpenCrossRamp()` from your game code

## 📋 Requirements

- **Unity 2022.3+** (tested with 2022.3 LTS)
- **Unity WebView plugin** (net.gree.unity-webview)
- **iOS 12.0+** / **Android API 21+**

## 🔧 Features

- ✅ **Device-aware UI** - Automatically adjusts to screen density
- ✅ **Safe area handling** - Respects notches and dynamic island
- ✅ **Cross-platform** - iOS and Android support
- ✅ **Multi-language** - Built-in language management
- ✅ **Easy integration** - Drag & drop prefab

## 📖 Documentation

- **Integration Guide**: See `../README.md`
- **Demo Project**: See `../Assets/Scenes/DemoScene.unity`

## 🐛 Issues & Support

If you encounter any issues:
1. Check the **Unity Console** for error messages
2. Verify **WebView plugin** is installed
3. Review the **README.md** troubleshooting section
4. Check **demo scene** for working example

## 📄 License

This package is distributed under the same license as the main project.

---

**Version**: 1.0.0  
**Compatible with**: Unity 2022.3+  
**Last updated**: Generated automatically on package export 