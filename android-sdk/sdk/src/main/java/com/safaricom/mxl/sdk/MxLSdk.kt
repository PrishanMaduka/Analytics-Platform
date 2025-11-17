package com.adlcom.mxl.sdk

import android.app.Application
import android.content.Context
import com.adlcom.mxl.sdk.config.SdkConfiguration
import com.adlcom.mxl.sdk.internal.SdkInitializer
import com.adlcom.mxl.sdk.internal.SdkState

/**
 * Main entry point for the MxL SDK.
 * 
 * Usage:
 * ```
 * MxLSdk.initialize(context, SdkConfiguration.Builder()
 *     .apiKey("your-api-key")
 *     .endpoint("https://api.mxl.adlcom.com")
 *     .build())
 * ```
 */
object MxLSdk {
    private var isInitialized = false
    private var sdkState: SdkState? = null

    /**
     * Initialize the MxL SDK with the provided configuration.
     * 
     * @param context Application context
     * @param configuration SDK configuration
     * @throws IllegalStateException if SDK is already initialized
     */
    @JvmStatic
    fun initialize(context: Context, configuration: SdkConfiguration) {
        if (isInitialized) {
            throw IllegalStateException("MxL SDK is already initialized")
        }

        require(context is Application) {
            "Context must be an Application instance"
        }

        sdkState = SdkInitializer.initialize(context, configuration)
        isInitialized = true
    }

    /**
     * Check if the SDK is initialized.
     */
    @JvmStatic
    fun isInitialized(): Boolean = isInitialized

    /**
     * Get the current SDK state (for internal use).
     */
    internal fun getSdkState(): SdkState? = sdkState
}

