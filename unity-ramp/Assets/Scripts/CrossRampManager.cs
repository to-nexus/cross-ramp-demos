using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Networking;
using System.Collections;
using System;

/// <summary>
/// CROSS RAMP Manager Script
/// Simple integration for CROSS RAMP in Unity games
/// </summary>
public class CrossRampManager : MonoBehaviour
{
    #region Singleton
    private static CrossRampManager instance;
    public static CrossRampManager Instance
    {
        get
        {
            if (instance == null)
            {
                instance = FindObjectOfType<CrossRampManager>();
                if (instance == null)
                {
                    Debug.LogError("[CrossRampManager] Instance not found! Make sure CrossRampManager is in the scene.");
                }
            }
            return instance;
        }
    }
    #endregion

    #region Settings
    [Header("CROSS RAMP Settings")]
    [Tooltip("Your CROSS RAMP project ID")]
    public string projectId = "nexus-ramp-v1";
    
    [Tooltip("CROSS RAMP base URL")]
    public string rampBaseUrl = "https://ramp.crosstoken.io";
    
    [Tooltip("Your app's custom URL scheme (e.g., 'mygame://') for returning to your app after transactions")]
    public string appScheme = "";
    
    [Header("UI Components")]
    [Tooltip("Button to open CROSS RAMP (optional - for prefab usage)")]
    public Button crossRampButton;
    #endregion

    #region Private Fields
    private string accessToken = "";
    private string sessionId = "";
    private WebViewObject webViewObject;
    private bool isWebViewOpen = false;
    private GameObject safeAreaBackground;
    private ScreenOrientation lastOrientation;
    private Vector2 lastScreenSize;
    private Coroutine pollLocalStorageCoroutine;
    #endregion
    
    #region Properties
    public bool IsWebViewOpen => isWebViewOpen;
    #endregion
    
    #region Data Structures
    /// <summary>
    /// Options for opening CROSS RAMP with specific parameters
    /// </summary>
    [System.Serializable]
    public class CrossRampOptions
    {
        [Tooltip("Target page: 'catalog' or 'exchange'")]
        public string targetPage = "catalog";
        
        [Tooltip("RampPair ID (required for exchange page)")]
        public string rampPairId = "";
        
        [Tooltip("Action: 'mint', 'burn', or 'reclaim' (required for exchange page)")]
        public string action = "";
        
        [Tooltip("Item UID for seamless selection (optional)")]
        public string uid = "";
        
        [Tooltip("Language code")]
        public string language = "en";

        public CrossRampOptions() { }
        
        public CrossRampOptions(string targetPage, string rampPairId = "", string action = "", string uid = "", string language = "en")
        {
            this.targetPage = targetPage;
            this.rampPairId = rampPairId;
            this.action = action;
            this.uid = uid;
            this.language = language;
        }
    }
    #endregion

    #region Unity Lifecycle
    void Awake()
    {
        SetupSingleton();
    }
    
    void Start()
    {
        Initialize();
    }
    
    void Update()
    {
        CheckScreenChanges();
    }
    
    void OnDestroy()
    {
        Cleanup();
    }
    #endregion

    #region Initialization
    void SetupSingleton()
    {
        if (instance == null)
        {
            instance = this;
            DontDestroyOnLoad(gameObject);
            Debug.Log("[CrossRampManager] Singleton instance setup complete");
        }
        else if (instance != this)
        {
            Debug.LogWarning("[CrossRampManager] Duplicate CrossRampManager found, removing.");
            Destroy(gameObject);
        }
    }
    
    void Initialize()
    {
        InitializeWebView();
        SetupButton();
        InitializeScreenTracking();
        Debug.Log("[CrossRampManager] Ready!");
    }
    
    void InitializeScreenTracking()
    {
        lastOrientation = Screen.orientation;
        lastScreenSize = new Vector2(Screen.width, Screen.height);
    }
    #endregion

    #region Public API
    /// <summary>
    /// Set user credentials for CROSS RAMP authentication
    /// </summary>
    public void SetUserCredentials(string userAccessToken, string userSessionId)
    {
        this.accessToken = userAccessToken;
        this.sessionId = userSessionId;
        Debug.Log($"[CrossRampManager] User credentials set for session: {userSessionId}");
    }
    
    /// <summary>
    /// Open CROSS RAMP with specified parameters
    /// </summary>
    /// <param name="targetPage">Target page: 'catalog' or 'exchange'</param>
    /// <param name="rampPairId">RampPair ID (required for exchange page)</param>
    /// <param name="action">Action: 'mint', 'burn', or 'reclaim' (required for exchange page)</param>
    /// <param name="uid">Item UID for seamless selection (optional)</param>
    /// <param name="language">Language code (default: 'en')</param>
    public void OpenCrossRamp(string targetPage = "catalog", string rampPairId = "", string action = "", string uid = "", string language = "en")
    {
        var options = new CrossRampOptions(targetPage, rampPairId, action, uid, language);
        OpenCrossRampWithOptions(options);
    }

    /// <summary>
    /// Open CROSS RAMP with specific options
    /// </summary>
    public void OpenCrossRampWithOptions(CrossRampOptions options)
    {
        if (string.IsNullOrEmpty(accessToken) || string.IsNullOrEmpty(sessionId))
        {
            Debug.LogError("[CrossRampManager] User credentials not set! Call SetUserCredentials() after user login.");
            return;
        }
        
        if (accessToken.StartsWith("demo_") || sessionId.StartsWith("demo_"))
        {
            Debug.LogWarning("[CrossRampManager] Using demo credentials! Replace with real values via SetUserCredentials() after user login.");
        }

        // Validate exchange page requirements
        if (options.targetPage == "exchange")
        {
            if (string.IsNullOrEmpty(options.rampPairId))
            {
                Debug.LogError("[CrossRampManager] rampPairId is required for exchange page!");
                return;
            }
            if (string.IsNullOrEmpty(options.action))
            {
                Debug.LogError("[CrossRampManager] action is required for exchange page!");
                return;
            }
            if (options.action != "mint" && options.action != "burn" && options.action != "reclaim")
            {
                Debug.LogError("[CrossRampManager] action must be 'mint', 'burn', or 'reclaim'!");
                return;
            }
        }
        
        StartCoroutine(OpenCrossRampCoroutine(options));
    }

    /// <summary>
    /// Open CROSS RAMP exchange page directly (convenience method)
    /// </summary>
    public void OpenExchangePage(string rampPairId, string action, string uid = "", string language = "en")
    {
        var options = new CrossRampOptions("exchange", rampPairId, action, uid, language);
        OpenCrossRampWithOptions(options);
    }

    /// <summary>
    /// Close WebView
    /// </summary>
    public void CloseWebView()
    {
        Debug.Log($"[CrossRampManager] CloseWebView() called - isWebViewOpen: {isWebViewOpen}");
        
        if (!isWebViewOpen) 
        {
            Debug.Log("[CrossRampManager] WebView is not open, ignoring close request");
            return;
        }
        
        isWebViewOpen = false;
        StopPolling();
        ClearRemainingMessages(); // 닫을 때도 메시지 정리
        HideWebView();
        CleanupUI();
        Debug.Log("[CrossRampManager] WebView closed successfully");
    }
    
    /// <summary>
    /// Handle button click
    /// </summary>
    public void OnButtonClick()
    {
        OpenCrossRamp();
        // OpenCrossRamp("exchange", "1001", "mint", "sword_001_uid_002", "en");
        // Test direct exchange page access with seamless UID selection
    }
    #endregion

    #region WebView Management
    void InitializeWebView()
    {
        try
        {
            webViewObject = (new GameObject("WebViewObject")).AddComponent<WebViewObject>();
            webViewObject.Init(
                cb: OnWebViewCallback,
                err: OnWebViewError,
                httpErr: OnWebViewHttpError,
                started: OnWebViewStarted,
                hooked: OnWebViewHooked,
                ld: OnWebViewLoaded,
                enableWKWebView: true
            );
            
            webViewObject.SetVisibility(false);
        }
        catch (System.Exception e)
        {
            Debug.LogWarning($"[CrossRampManager] WebView initialization failed: {e.Message}");
        }
    }
    
    IEnumerator OpenCrossRampCoroutine(CrossRampOptions options)
    {
        Debug.Log($"[CrossRampManager] Opening CROSS RAMP");
        
        if (isWebViewOpen) yield break;
        
        // Reset state before opening
        isWebViewOpen = false;
        yield return new WaitForEndOfFrame();
        
        string frontendUrl = GenerateRampFrontendUrl(options);
        
        if (webViewObject == null)
        {
            InitializeWebView();
        }
        
        if (webViewObject != null)
        {
            SetupWebViewLayout();
            LoadWebViewUrl(frontendUrl);
            StartPolling();
        }
        else
        {
            Debug.LogError("[CrossRampManager] WebView not available");
        }
    }
    
    void SetupWebViewLayout()
    {
        SafeAreaInfo safeAreaInfo = GetSafeAreaInfo();
        
        int topMargin = Mathf.RoundToInt(safeAreaInfo.topInset);
        int leftMargin = Mathf.RoundToInt(safeAreaInfo.leftInset);
        int rightMargin = Mathf.RoundToInt(safeAreaInfo.rightInset);
        int bottomMargin = Mathf.RoundToInt(safeAreaInfo.bottomInset);
        
        webViewObject.SetMargins(leftMargin, topMargin, rightMargin, bottomMargin);
        webViewObject.SetVisibility(true);
        
        isWebViewOpen = true;
        Debug.Log($"[CrossRampManager] WebView initialized and ready - isWebViewOpen: {isWebViewOpen}");
    }
    
    void LoadWebViewUrl(string url)
    {
        if (webViewObject != null)
        {
            try
            {
                webViewObject.LoadURL(url);
                Debug.Log($"[CrossRampManager] Loading WebView: {url}");
            }
            catch (System.Exception e)
            {
                Debug.LogError($"[CrossRampManager] Error loading WebView: {e.Message}");
            }
        }
    }
    
    void HideWebView()
    {
        if (webViewObject != null)
        {
            webViewObject.SetVisibility(false);
        }
    }
    #endregion

    #region URL Generation
    string GenerateRampFrontendUrl(CrossRampOptions options)
    {
        try
        {
            string encodedProjectId = UnityWebRequest.EscapeURL(projectId);
            string encodedSessionId = UnityWebRequest.EscapeURL(sessionId);
            string encodedAccessToken = UnityWebRequest.EscapeURL(accessToken);
            string encodedLanguage = UnityWebRequest.EscapeURL(string.IsNullOrEmpty(options.language) ? "en" : options.language);
            string encodedPlatform = UnityWebRequest.EscapeURL("unity");
            string encodedNetwork = UnityWebRequest.EscapeURL("testnet");
            
            long timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            string encodedTimestamp = UnityWebRequest.EscapeURL(timestamp.ToString());
            
            // Build base query parameters (always required)
            string queryParams = $"?projectId={encodedProjectId}&sessionId={encodedSessionId}&accessToken={encodedAccessToken}&lang={encodedLanguage}&platform={encodedPlatform}&timestamp={encodedTimestamp}&network={encodedNetwork}";
            
            // Add appScheme if available
            if (!string.IsNullOrEmpty(appScheme))
            {
                string encodedAppScheme = UnityWebRequest.EscapeURL(appScheme);
                queryParams += $"&appScheme={encodedAppScheme}";
            }

            // Build URL based on target page
            string finalUrl;
            if (options.targetPage == "exchange")
            {
                // Exchange page: /exchange/{rampPairId}?action={action}&uid={uid}&...
                string encodedAction = UnityWebRequest.EscapeURL(options.action);
                queryParams += $"&action={encodedAction}";

                // Add uid if provided
                if (!string.IsNullOrEmpty(options.uid))
                {
                    string encodedUid = UnityWebRequest.EscapeURL(options.uid);
                    queryParams += $"&uid={encodedUid}";
                }

                finalUrl = rampBaseUrl + $"/exchange/{options.rampPairId}" + queryParams;
            }
            else
            {
                // Default to catalog page
                finalUrl = rampBaseUrl + "/catalog" + queryParams;
            }
            
            #if UNITY_EDITOR
            Debug.Log($"[CrossRampManager] Generated URL for browser testing: {finalUrl}");
            #endif
            
            return finalUrl;
        }
        catch (System.Exception e)
        {
            Debug.LogError($"[CrossRampManager] Error generating frontend URL: {e.Message}");
            return rampBaseUrl;
        }
    }
    #endregion

    #region Polling (Editor Only)
    void StartPolling()
    {
        #if UNITY_EDITOR
        // 기존 폴링이 있다면 완전히 정리
        if (pollLocalStorageCoroutine != null)
        {
            StopCoroutine(pollLocalStorageCoroutine);
            pollLocalStorageCoroutine = null;
        }
        
        // 새로운 폴링 시작
        pollLocalStorageCoroutine = StartCoroutine(PollLocalStorageForMessage());
        Debug.Log("[CrossRampManager] Started localStorage polling");
        #endif
    }
    
    void StopPolling()
    {
        #if UNITY_EDITOR
        if (pollLocalStorageCoroutine != null)
        {
            StopCoroutine(pollLocalStorageCoroutine);
            pollLocalStorageCoroutine = null;
            Debug.Log("[CrossRampManager] Stopped localStorage polling coroutine");
        }
        StopAllCoroutines();
        Debug.Log("[CrossRampManager] All coroutines stopped");
        #endif
    }
    
    IEnumerator PollLocalStorageForMessage()
    {
        Debug.Log("[CrossRampManager] Starting localStorage polling");
        
        // 웹뷰가 완전히 로드될 때까지 잠시 대기
        yield return new WaitForSeconds(2f);
        
        // 폴링 시작 전에 이전 세션의 잔여 메시지 정리
        ClearPreviousSessionMessages();
        
        while (isWebViewOpen)
        {
            
            try
            {
                string js = @"
                    (function() {
                        try {
                            var message = localStorage.getItem('cross-ramp-message');
                            if (message) {
                                localStorage.removeItem('cross-ramp-message');
                                
                                // 원본 메시지 내용 확인
                                var originalMessage;
                                try {
                                    originalMessage = JSON.parse(message);
                                } catch(parseError) {
                                    console.log('Could not parse message as JSON, treating as close signal:', message);
                                    originalMessage = { action: 'close' };
                                }
                                
                                // close action인 경우에만 Unity로 전송
                                if (originalMessage && originalMessage.action === 'close') {
                                    var payload = JSON.stringify({
                                        type: 'cross-ramp-action',
                                        action: 'close',
                                        timestamp: Date.now()
                                    });
                                    if (typeof Unity !== 'undefined' && typeof Unity.call === 'function') {
                                        Unity.call(payload);
                                    }
                                    if (typeof window.unityInstance !== 'undefined' && window.unityInstance.SendMessage) {
                                        window.unityInstance.SendMessage('CrossRampManager', 'OnMessageReceived', payload);
                                    }
                                } else {
                                    console.log('Ignoring non-close message:', originalMessage);
                                }
                            }
                        } catch(e) {
                            console.error('Unity PollLocalStorage error:', e);
                        }
                    })();
                ";
                
                if (webViewObject != null)
                {
                    webViewObject.EvaluateJS(js);
                }
            }
            catch (System.Exception e)
            {
                Debug.LogWarning($"[CrossRampManager] PollLocalStorage JS error: {e.Message}");
            }
            
            yield return new WaitForSeconds(1f);
        }
        
        Debug.Log("[CrossRampManager] Stopped localStorage polling");
    }
    
    void ClearPreviousSessionMessages()
    {
        Debug.Log("[CrossRampManager] Clearing previous session messages from localStorage");
        
        string clearJs = @"
            (function() {
                try {
                    var existingMessage = localStorage.getItem('cross-ramp-message');
                    if (existingMessage) {
                        console.log('[CrossRamp] Clearing previous session message:', existingMessage);
                        localStorage.removeItem('cross-ramp-message');
                        console.log('[CrossRamp] Previous session message cleared');
                    } else {
                        console.log('[CrossRamp] No previous session message found');
                    }
                } catch(e) {
                    console.error('[CrossRamp] Error clearing previous session messages:', e);
                }
            })();
        ";
        
        if (webViewObject != null)
        {
            try
            {
                webViewObject.EvaluateJS(clearJs);
                Debug.Log("[CrossRampManager] Previous session cleanup executed");
            }
            catch (System.Exception e)
            {
                Debug.LogWarning($"[CrossRampManager] Error clearing previous session: {e.Message}");
            }
        }
    }
    
    void ClearRemainingMessages()
    {
        Debug.Log("[CrossRampManager] Clearing remaining messages on webview close");
        
        string clearJs = @"
            (function() {
                try {
                    var existingMessage = localStorage.getItem('cross-ramp-message');
                    if (existingMessage) {
                        console.log('[CrossRamp] Clearing remaining message on close:', existingMessage);
                        localStorage.removeItem('cross-ramp-message');
                        console.log('[CrossRamp] Remaining message cleared');
                    }
                } catch(e) {
                    console.error('[CrossRamp] Error clearing remaining messages:', e);
                }
            })();
        ";
        
        if (webViewObject != null)
        {
            try
            {
                webViewObject.EvaluateJS(clearJs);
                Debug.Log("[CrossRampManager] Remaining messages cleanup executed");
            }
            catch (System.Exception e)
            {
                Debug.LogWarning($"[CrossRampManager] Error clearing remaining messages: {e.Message}");
            }
        }
    }
    #endregion

    #region WebView Callbacks
    void OnWebViewCallback(string msg)
    {
        Debug.Log($"[CrossRampManager] WebView callback received: {msg}");
        
        if (msg.Contains("cross-ramp-action"))
        {
            Debug.Log("[CrossRampManager] Detected cross-ramp-action message");
            try
            {
                var messageData = JsonUtility.FromJson<CrossRampMessage>(msg);
                Debug.Log($"[CrossRampManager] Parsed message data: type={messageData?.type}, action={messageData?.action}");
                
                if (messageData != null && messageData.type == "cross-ramp-action" && messageData.action == "close")
                {
                    Debug.Log("[CrossRampManager] Received valid close action - calling CloseWebView()");
                    CloseWebView();
                }
            }
            catch (System.Exception e)
            {
                Debug.LogError($"[CrossRampManager] Failed to parse message: {e.Message}");
            }
        }
    }
    
    void OnWebViewError(string msg) => Debug.LogError($"[CrossRampManager] WebView error: {msg}");
    void OnWebViewHttpError(string msg) => Debug.LogError($"[CrossRampManager] WebView HTTP error: {msg}");
    void OnWebViewStarted(string msg) => Debug.Log($"[CrossRampManager] WebView started: {msg}");
    void OnWebViewHooked(string msg) => Debug.Log($"[CrossRampManager] WebView hooked: {msg}");
    void OnWebViewLoaded(string msg) => Debug.Log($"[CrossRampManager] WebView loaded: {msg}");
    #endregion

    #region Message Handling
    public void OnMessageReceived(string messageData)
    {
        Debug.Log($"[CrossRampManager] Direct message received: {messageData}");
        ProcessMessage(messageData);
    }
    
    public void OnCloseRequested()
    {
        Debug.Log("[CrossRampManager] Legacy close message received");
        CloseWebView();
    }
    
    void ProcessMessage(string messageData)
    {
        try
        {
            Debug.Log($"[CrossRampManager] Processing message: {messageData}");
            
            // 빈 메시지 체크
            if (string.IsNullOrEmpty(messageData))
            {
                Debug.LogWarning("[CrossRampManager] Received empty message, ignoring");
                return;
            }
            
            var message = JsonUtility.FromJson<CrossRampMessage>(messageData);
            if (message != null)
            {
                Debug.Log($"[CrossRampManager] Parsed message: type={message.type}, action={message.action}");
                
                // 유효한 cross-ramp-action이면서 close action인 경우에만 처리
                if (!string.IsNullOrEmpty(message.type) && 
                    !string.IsNullOrEmpty(message.action) &&
                    message.type == "cross-ramp-action" && 
                    message.action == "close")
                {
                    Debug.Log("[CrossRampManager] Valid close action detected - closing WebView");
                    CloseWebView();
                }
                else
                {
                    Debug.Log($"[CrossRampManager] Ignoring message - not a valid close action: type={message.type}, action={message.action}");
                }
            }
            else
            {
                Debug.LogWarning("[CrossRampManager] Failed to parse message as CrossRampMessage");
            }
        }
        catch (System.Exception e)
        {
            Debug.LogError($"[CrossRampManager] Error processing message: {e.Message}");
        }
    }
    #endregion

    #region UI Management
    void SetupButton()
    {
        if (crossRampButton != null)
        {
            crossRampButton.onClick.AddListener(OnButtonClick);
            Debug.Log("[CrossRampManager] Button connected successfully");
        }
    }
    
    void CleanupUI()
    {
        if (safeAreaBackground != null)
        {
            Destroy(safeAreaBackground);
            safeAreaBackground = null;
        }
    }
    #endregion

    #region Screen Management
    void CheckScreenChanges()
    {
        if (!isWebViewOpen) return;
        
        bool needsUpdate = false;
        
        if (Screen.orientation != lastOrientation)
        {
            Debug.Log($"[CrossRampManager] Orientation changed from {lastOrientation} to {Screen.orientation}");
            lastOrientation = Screen.orientation;
            needsUpdate = true;
        }
        
        Vector2 currentScreenSize = new Vector2(Screen.width, Screen.height);
        if (currentScreenSize != lastScreenSize)
        {
            Debug.Log($"[CrossRampManager] Screen size changed from {lastScreenSize} to {currentScreenSize}");
            lastScreenSize = currentScreenSize;
            needsUpdate = true;
        }
        
        if (needsUpdate)
        {
            StartCoroutine(UpdateWebViewLayout());
        }
    }
    
    IEnumerator UpdateWebViewLayout()
    {
        Debug.Log("[CrossRampManager] Updating WebView layout...");
        yield return null;
        
        SafeAreaInfo safeAreaInfo = GetSafeAreaInfo();
        
        if (webViewObject != null)
        {
            int topMargin = Mathf.RoundToInt(safeAreaInfo.topInset);
            int leftMargin = Mathf.RoundToInt(safeAreaInfo.leftInset);
            int rightMargin = Mathf.RoundToInt(safeAreaInfo.rightInset);
            int bottomMargin = Mathf.RoundToInt(safeAreaInfo.bottomInset);
            
            webViewObject.SetMargins(leftMargin, topMargin, rightMargin, bottomMargin);
            Debug.Log($"[CrossRampManager] WebView margins updated");
        }
    }
    #endregion

    #region Safe Area
    [System.Serializable]
    public struct SafeAreaInfo
    {
        public float topInset;
        public float bottomInset;
        public float leftInset;
        public float rightInset;
        public bool hasNotch;
        public string deviceInfo;
    }
    
    SafeAreaInfo GetSafeAreaInfo()
    {
        SafeAreaInfo safeAreaInfo = new SafeAreaInfo();
        
        Rect safeArea = Screen.safeArea;
        Rect screenRect = new Rect(0, 0, Screen.width, Screen.height);
        
        safeAreaInfo.topInset = screenRect.height - (safeArea.y + safeArea.height);
        safeAreaInfo.bottomInset = safeArea.y;
        safeAreaInfo.leftInset = safeArea.x;
        safeAreaInfo.rightInset = screenRect.width - (safeArea.x + safeArea.width);
        safeAreaInfo.hasNotch = safeAreaInfo.topInset > 10f || safeAreaInfo.bottomInset > 10f;
        
        #if UNITY_IOS
        safeAreaInfo.deviceInfo = "iOS";
        if (safeAreaInfo.hasNotch)
        {
            if (safeAreaInfo.topInset < 44f) safeAreaInfo.topInset = 44f;
            if (Screen.height > 2000f && safeAreaInfo.topInset < 54f) safeAreaInfo.topInset = 54f;
        }
        else if (safeAreaInfo.topInset < 20f)
        {
            safeAreaInfo.topInset = 20f;
        }
        #elif UNITY_ANDROID
        safeAreaInfo.deviceInfo = "Android";
        if (safeAreaInfo.hasNotch)
        {
            if (safeAreaInfo.topInset < 24f) safeAreaInfo.topInset = 24f;
        }
        else if (safeAreaInfo.topInset < 24f)
        {
            safeAreaInfo.topInset = 24f;
        }
        if (safeAreaInfo.bottomInset > 10f)
        {
            safeAreaInfo.bottomInset = Mathf.Max(safeAreaInfo.bottomInset, 20f);
        }
        #else
        safeAreaInfo.deviceInfo = "Other";
        if (safeAreaInfo.topInset < 20f) safeAreaInfo.topInset = 20f;
        #endif
        
        Debug.Log($"[CrossRampManager] Safe area info - Platform: {safeAreaInfo.deviceInfo}, Top: {safeAreaInfo.topInset}, Bottom: {safeAreaInfo.bottomInset}, Left: {safeAreaInfo.leftInset}, Right: {safeAreaInfo.rightInset}, Has notch: {safeAreaInfo.hasNotch}");
        
        return safeAreaInfo;
    }
    #endregion

    #region Data Structures
    [System.Serializable]
    public class CrossRampMessage
    {
        public string type;
        public string action;
        public long timestamp;
    }
    #endregion

    #region Cleanup
    void Cleanup()
    {
        if (instance == this)
        {
            instance = null;
            Debug.Log("[CrossRampManager] Singleton instance cleanup complete");
        }
        
        if (webViewObject != null)
        {
            webViewObject.SetVisibility(false);
        }
        
        CleanupUI();
        
        if (crossRampButton != null)
        {
            crossRampButton.onClick.RemoveListener(OnButtonClick);
        }
    }
    #endregion

    #region Debug
    [ContextMenu("Force Close WebView")]
    public void ForceCloseWebView()
    {
        CloseWebView();
    }
    
    public void LogToUnity(string logData)
    {
        Debug.Log($"[WebView Debug] {logData}");
    }
    #endregion
} 