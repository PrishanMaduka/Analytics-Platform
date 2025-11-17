package com.adlcom.mxl.sdk.session

import android.app.Activity
import android.content.Context
import android.content.SharedPreferences
import com.adlcom.mxl.sdk.config.SdkConfiguration
import java.util.UUID

/**
 * Manages user sessions and context.
 */
class SessionManager private constructor(
    private val context: Context,
    private val configuration: SdkConfiguration,
    private val prefs: SharedPreferences
) {
    companion object {
        private const val PREFS_NAME = "mxl_sdk_prefs"
        private const val KEY_SESSION_ID = "session_id"
        private const val KEY_USER_ID = "user_id"
        private const val SESSION_TIMEOUT_MS = 30 * 60 * 1000L // 30 minutes
        
        fun create(context: Context, configuration: SdkConfiguration): SessionManager {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            return SessionManager(context, configuration, prefs)
        }
    }
    
    private var currentSessionId: String? = null
    private var sessionStartTime: Long = 0
    private var lastActivityTime: Long = 0
    
    init {
        startNewSession()
    }
    
    /**
     * Start a new session.
     */
    fun startNewSession() {
        val now = System.currentTimeMillis()
        
        // Check if current session has expired
        if (currentSessionId != null && (now - lastActivityTime) > SESSION_TIMEOUT_MS) {
            endSession()
        }
        
        if (currentSessionId == null) {
            currentSessionId = UUID.randomUUID().toString()
            sessionStartTime = now
            lastActivityTime = now
            
            prefs.edit()
                .putString(KEY_SESSION_ID, currentSessionId)
                .apply()
        }
    }
    
    /**
     * End the current session.
     */
    fun endSession() {
        currentSessionId = null
        sessionStartTime = 0
        lastActivityTime = 0
    }
    
    /**
     * Get the current session ID.
     */
    fun getSessionId(): String? = currentSessionId
    
    /**
     * Identify a user.
     */
    fun identify(userId: String, attributes: Map<String, Any> = emptyMap()) {
        prefs.edit()
            .putString(KEY_USER_ID, userId)
            .apply()
        
        // Store user attributes
        // TODO: Store attributes in database
    }
    
    /**
     * Get the current user ID.
     */
    fun getUserId(): String? = prefs.getString(KEY_USER_ID, null)
    
    /**
     * Called when app comes to foreground.
     */
    fun onAppForegrounded() {
        startNewSession()
    }
    
    /**
     * Called when app goes to background.
     */
    fun onAppBackgrounded() {
        lastActivityTime = System.currentTimeMillis()
    }
    
    /**
     * Called when an activity is resumed.
     */
    fun onActivityResumed(activity: Activity) {
        lastActivityTime = System.currentTimeMillis()
        // TODO: Track screen view
    }
    
    /**
     * Called when an activity is paused.
     */
    fun onActivityPaused(activity: Activity) {
        lastActivityTime = System.currentTimeMillis()
    }
}

