using UnityEngine;
using UnityEditor;
using System.IO;
using CrossRamp;

public class CreateCrossRampPrefab : MonoBehaviour
{
    [MenuItem("CROSS RAMP/Create CrossRampManager Prefab")]
    static void CreatePrefab()
    {
        // Create prefabs folder if it doesn't exist
        string prefabPath = "Assets/Prefabs";
        if (!AssetDatabase.IsValidFolder(prefabPath))
        {
            AssetDatabase.CreateFolder("Assets", "Prefabs");
        }
        
        // Create GameObject with CrossRampManager component
        GameObject crossRampManager = new GameObject("CrossRampManager");
        CrossRampManager component = crossRampManager.AddComponent<CrossRampManager>();
        
        // Set default values
        component.rampBaseUrl = "https://ramp.crosstoken.io";
        
        // Create prefab
        string prefabFilePath = prefabPath + "/CrossRampManager.prefab";
        GameObject prefab = PrefabUtility.SaveAsPrefabAsset(crossRampManager, prefabFilePath);
        
        // Clean up temporary GameObject
        DestroyImmediate(crossRampManager);
        
        // Select the created prefab
        Selection.activeObject = prefab;
        
        Debug.Log("CrossRampManager prefab created at: " + prefabFilePath);
    }
} 