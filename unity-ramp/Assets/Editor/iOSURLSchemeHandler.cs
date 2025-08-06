#if UNITY_IOS
using System.IO;
using UnityEngine;
using UnityEditor;
using UnityEditor.Callbacks;
using UnityEditor.iOS.Xcode;

public class iOSURLSchemeHandler
{
    [PostProcessBuild]
    public static void OnPostprocessBuild(BuildTarget buildTarget, string pathToBuiltProject)
    {
        if (buildTarget == BuildTarget.iOS)
        {
            // Info.plist path
            string plistPath = pathToBuiltProject + "/Info.plist";
            
            // Load Info.plist
            PlistDocument plist = new PlistDocument();
            plist.ReadFromString(File.ReadAllText(plistPath));
            
            // Get root dictionary
            PlistElementDict rootDict = plist.root;
            
            // Add LSApplicationQueriesSchemes
            PlistElementArray queriesSchemes = rootDict.CreateArray("LSApplicationQueriesSchemes");
            
            // Add CROSS RAMP and wallet app schemes
            queriesSchemes.AddString("crossx");           // CROSS RAMP main scheme
            queriesSchemes.AddString("metamask");         // MetaMask
            queriesSchemes.AddString("trust");            // Trust Wallet
            queriesSchemes.AddString("walletconnect");    // WalletConnect
            queriesSchemes.AddString("rainbow");          // Rainbow
            queriesSchemes.AddString("coinbase");         // Coinbase Wallet
            queriesSchemes.AddString("phantom");          // Phantom
            queriesSchemes.AddString("imtoken");          // imToken
            queriesSchemes.AddString("tokenpocket");      // TokenPocket
            queriesSchemes.AddString("mathwallet");       // MathWallet
            queriesSchemes.AddString("safepal");          // SafePal
            queriesSchemes.AddString("ledgerlive");       // Ledger Live
            queriesSchemes.AddString("zerion");           // Zerion
            queriesSchemes.AddString("argent");           // Argent
            queriesSchemes.AddString("exodus");           // Exodus
            queriesSchemes.AddString("atomic");           // Atomic Wallet
            queriesSchemes.AddString("binance");          // Binance
            queriesSchemes.AddString("okx");              // OKX
            queriesSchemes.AddString("bybit");            // Bybit
            queriesSchemes.AddString("bitget");           // BitGet
            queriesSchemes.AddString("kucoin");           // KuCoin
            queriesSchemes.AddString("crypto");           // Crypto.com
            
            // Write modified Info.plist
            File.WriteAllText(plistPath, plist.WriteToString());
            
            Debug.Log("[iOS] LSApplicationQueriesSchemes added to Info.plist");
            Debug.Log("[iOS] URL schemes registered for wallet apps including crossx://");
        }
    }
}
#endif 