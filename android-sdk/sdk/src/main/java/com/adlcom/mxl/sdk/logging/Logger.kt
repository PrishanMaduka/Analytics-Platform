package com.adlcom.mxl.sdk.logging

import android.content.Context
import android.util.Log
import com.adlcom.mxl.sdk.config.SdkConfiguration

/**
 * SDK logger for internal logging.
 */
object Logger {
    private const val TAG = "MxLSdk"
    private var isInitialized = false
    private var enableDebug = false
    
    fun initialize(context: Context, configuration: SdkConfiguration) {
        isInitialized = true
        // Check if debug mode using reflection
        try {
            val buildConfigClass = Class.forName("com.adlcom.mxl.sdk.BuildConfig")
            val debugField = buildConfigClass.getField("DEBUG")
            enableDebug = debugField.getBoolean(null) as Boolean
        } catch (e: Exception) {
            enableDebug = false
        }
    }
    
    fun d(message: String) {
        if (enableDebug) {
            Log.d(TAG, message)
        }
    }
    
    fun i(message: String) {
        Log.i(TAG, message)
    }
    
    fun w(message: String) {
        Log.w(TAG, message)
    }
    
    fun e(message: String, throwable: Throwable? = null) {
        Log.e(TAG, message, throwable)
    }
}

