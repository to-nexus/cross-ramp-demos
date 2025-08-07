# CROSS RAMP Unity Demo

A Unity demo showing how to integrate CROSS RAMP into your Unity game using the CrossRampManager component.

## 🎯 What is CROSS RAMP?

CROSS RAMP is a game asset exchange platform that allows players to:
- **Mint Tokens**: Convert game assets into blockchain tokens
- **Burn Tokens**: Convert blockchain tokens back into game assets
- **Cross-Platform**: Exchange assets across different games

## 🚀 Quick Start

### Prerequisites
- Unity 2022.3 LTS or later
- Unity WebView plugin

### Installation

#### 1. Import Unity WebView Plugin
Download and import the Unity WebView plugin from the official repository.

#### 2. Import CROSS RAMP Demo
Copy the demo files to your Unity project's Assets folder.

#### 3. Open Demo Scene
```
Assets/Scenes/DemoScene.unity
```

## 🔧 Core Integration

### 1. Add CrossRampManager to Scene

```csharp
// Method 1: Drag & Drop Prefab
// 1. Find CrossRampManager.prefab in Assets/Prefabs/
// 2. Drag it into your scene

// Method 2: Code
GameObject rampManager = Instantiate(Resources.Load<GameObject>("CrossRampManager"));
```

### 2. Configure Settings

In the Inspector, set these values:

```
CrossRampManager (Script)
├── Project ID: your-project-id
├── Ramp Base URL: https://ramp.crosstoken.io
└── App Scheme: mygame:// (optional, for deep linking)
```

### 3. Set Authentication

```csharp
// After user login, get these from your server
string accessToken = "user-access-token";
string sessionId = "user-session-id";

// Set credentials
CrossRampManager.Instance.SetUserCredentials(accessToken, sessionId);
```

### 4. Open CROSS RAMP

```csharp
// Add click handler to your button
public void OnRampButtonClick()
{
    CrossRampManager.Instance.OpenCrossRamp("en");
}
```

## 📋 Required Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string | ✅ | Your CROSS RAMP project ID |
| `accessToken` | string | ✅ | User authentication token |
| `sessionId` | string | ✅ | User session ID |
| `language` | string | ❌ | Language code (en, ko, zh) |
| `network` | string | ❌ | "testnet" or "mainnet". "mainnet" by default |
| `platform` | string | ❌ | use "unity" for Unity project |

## 🔐 Authentication

### Get Tokens from Your Server

```csharp
// Example: After user login
public async Task<AuthData> LoginUser(string username, string password)
{
    var request = new UnityWebRequest("https://your-game-server.com/login", "POST");
    request.SetRequestHeader("Content-Type", "application/json");
    
    var loginData = new { username, password };
    request.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(JsonUtility.ToJson(loginData)));
    
    var operation = request.SendWebRequest();
    while (!operation.isDone) await Task.Yield();
    
    if (request.result == UnityWebRequest.Result.Success)
    {
        var response = JsonUtility.FromJson<AuthResponse>(request.downloadHandler.text);
        return new AuthData
        {
            accessToken = response.accessToken,
            sessionId = response.sessionId
        };
    }
    
    throw new Exception("Login failed");
}

[System.Serializable]
public class AuthResponse
{
    public string accessToken;
    public string sessionId;
}
```

### Security Notes
- ✅ Generate tokens server-side only
- ✅ Use HTTPS in production
- ✅ Implement token expiration
- ❌ Never hardcode tokens in client code

## 🎨 Customization

### Your Own Button

```csharp
// Simple button integration
public class RampButton : MonoBehaviour
{
    void Start()
    {
        GetComponent<Button>().onClick.AddListener(OnClick);
    }
    
    void OnClick()
    {
        CrossRampManager.Instance.OpenCrossRamp("en");
    }
}
```

## 📱 Platform Setup

### iOS Configuration

Add to Info.plist:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>com.yourgame.ramp</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>mygame</string>
        </array>
    </dict>
</array>
```

### Android Configuration

Add to AndroidManifest.xml:
```xml
<activity android:name="com.unity3d.player.UnityPlayerActivity">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="mygame" />
    </intent-filter>
</activity>
```

## 🧪 Testing

### Test the Integration

```csharp
// Test with demo tokens (development only)
void TestRampIntegration()
{
    string demoAccessToken = $"demo_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";
    string demoSessionId = $"session_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";
    
    CrossRampManager.Instance.SetUserCredentials(demoAccessToken, demoSessionId);
    CrossRampManager.Instance.OpenCrossRamp("en");
}
```

### Test Checklist
- [ ] CrossRampManager prefab loads correctly
- [ ] Authentication works with valid tokens
- [ ] Opens WebView on mobile
- [ ] Opens popup on desktop
- [ ] Language parameter works
- [ ] Deep linking returns to game

## 📚 API Reference

### CrossRampManager Methods

```csharp
public class CrossRampManager : MonoBehaviour
{
    // Singleton instance
    public static CrossRampManager Instance { get; }
    
    // Properties
    public bool IsWebViewOpen { get; }
    
    // Methods
    public void SetUserCredentials(string accessToken, string sessionId);
    public void OpenCrossRamp(string language = "en");
    public void CloseWebView();
}
```

### Configuration Properties

```csharp
[Header("CROSS RAMP Settings")]
public string projectId = "your-project-id";
public string rampBaseUrl = "https://ramp.crosstoken.io";
public string appScheme = "mygame://";
```

## 🔍 Troubleshooting

### Common Issues

**WebView Not Opening**
- Check Unity WebView plugin installation
- Verify internet connection
- Check authentication tokens

**Authentication Failed**
- Verify server-side token generation
- Check token expiration
- Validate projectId

**iOS Build Issues**
- Check Info.plist configuration
- Verify URL scheme setup
- Test on physical device

**Android Build Issues**
- Check AndroidManifest.xml
- Verify permissions
- Test on physical device

## 📄 License

MIT License - see LICENSE file for details.

---

**That's it!** Just drag the CrossRampManager prefab into your scene, set the project ID, and you're ready to go.


