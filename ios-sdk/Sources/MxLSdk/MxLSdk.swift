import Foundation
import UIKit

/**
 * Main entry point for the MxL SDK.
 * 
 * Usage:
 * ```
 * MxLSdk.initialize(configuration: SdkConfiguration(
 *     apiKey: "your-api-key",
 *     endpoint: "https://api.mxl.adlcom.com"
 * ))
 * ```
 */
public class MxLSdk {
    private static var isInitialized = false
    private static var sdkState: SdkState?
    
    /**
     * Initialize the MxL SDK with the provided configuration.
     * 
     * - Parameter configuration: SDK configuration
     * - Throws: `SdkError.alreadyInitialized` if SDK is already initialized
     */
    public static func initialize(configuration: SdkConfiguration) throws {
        guard !isInitialized else {
            throw SdkError.alreadyInitialized
        }
        
        guard let appDelegate = UIApplication.shared.delegate else {
            throw SdkError.invalidConfiguration("Application delegate not found")
        }
        
        sdkState = try SdkInitializer.initialize(configuration: configuration)
        isInitialized = true
    }
    
    /**
     * Check if the SDK is initialized.
     */
    public static var isInitialized: Bool {
        return isInitialized
    }
    
    /**
     * Get the current SDK state (for internal use).
     */
    internal static func getSdkState() -> SdkState? {
        return sdkState
    }
}

public enum SdkError: Error {
    case alreadyInitialized
    case invalidConfiguration(String)
    case initializationFailed(String)
}

