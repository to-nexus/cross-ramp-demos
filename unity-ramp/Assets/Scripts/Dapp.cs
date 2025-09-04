using UnityEngine;
using CrossRamp; // CrossRamp namespace 사용

/// <summary>
/// CROSS RAMP Authentication Example Code
/// 
/// This script is a sample for developers to implement their own authentication logic.
/// Do not use this code directly in production. 
/// Integrate with your game server to set real authentication info.
/// 
/// Usage:
/// 1. After game login: SetCredentials(realAccessToken, realSessionId)
/// 2. For demo/testing: Use demo tokens in Start()
/// </summary>
public class Dapp : MonoBehaviour
{
    // Singleton instance (example)
    private static Dapp instance;
    public static Dapp Instance
    {
        get
        {
            if (instance == null)
            {
                instance = FindObjectOfType<Dapp>();
                if (instance == null)
                {
                    Debug.LogWarning("[Dapp] Dapp instance not found. Creating automatically.");
                    GameObject go = new GameObject("Dapp");
                    instance = go.AddComponent<Dapp>();
                }
            }
            return instance;
        }
    }
    
    void Awake()
    {
        // Singleton setup (example)
        if (instance == null)
        {
            instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else if (instance != this)
        {
            Destroy(gameObject);
            return;
        }
    }
    
    void Start()
    {
        // Example: Auto-set demo credentials when Dapp is created
        // Replace this with your game login logic
        string demoAccessToken = $"demo_access_{System.DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";
        string demoSessionId = $"demo_session_{System.DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";
        SetCredentials(demoAccessToken, demoSessionId);
    }
    
    // ===== Example methods for developers =====
    
    /// <summary>
    /// Set authentication credentials
    /// 
    /// Use this method with real accessToken and sessionId from your game server.
    /// 
    /// Usage:
    /// - Call after successful game login
    /// - Call after receiving auth tokens from server
    /// </summary>
    public static void SetCredentials(string accessToken, string sessionId)
    {
        if (CrossRampManager.Instance != null)
        {
            CrossRampManager.Instance.SetUserCredentials(accessToken, sessionId);
            Debug.Log($"[Dapp] Authentication set - Session: {sessionId}");
        }
        else
        {
            Debug.LogError("[Dapp] CrossRampManager not found!");
        }
    }
} 