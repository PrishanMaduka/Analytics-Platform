package com.adlcom.mxl.sdk.internal

import android.app.Activity
import android.app.Application
import android.os.Bundle
import com.adlcom.mxl.sdk.session.SessionManager

/**
 * Application lifecycle callbacks for tracking app state changes.
 */
internal class SdkLifecycleCallbacks(
    private val sessionManager: SessionManager
) : Application.ActivityLifecycleCallbacks {
    
    private var activityCount = 0
    
    override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {
        // Activity created
    }
    
    override fun onActivityStarted(activity: Activity) {
        if (activityCount == 0) {
            // App came to foreground
            sessionManager.onAppForegrounded()
        }
        activityCount++
    }
    
    override fun onActivityResumed(activity: Activity) {
        sessionManager.onActivityResumed(activity)
    }
    
    override fun onActivityPaused(activity: Activity) {
        sessionManager.onActivityPaused(activity)
    }
    
    override fun onActivityStopped(activity: Activity) {
        activityCount--
        if (activityCount == 0) {
            // App went to background
            sessionManager.onAppBackgrounded()
        }
    }
    
    override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {
        // No action needed
    }
    
    override fun onActivityDestroyed(activity: Activity) {
        // Activity destroyed
    }
}

