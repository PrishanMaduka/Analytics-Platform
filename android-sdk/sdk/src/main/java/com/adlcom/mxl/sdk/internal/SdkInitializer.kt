package com.adlcom.mxl.sdk.internal

import android.app.Application
import android.content.Context
import com.adlcom.mxl.sdk.config.SdkConfiguration
import com.adlcom.mxl.sdk.crash.CrashReporter
import com.adlcom.mxl.sdk.performance.PerformanceMonitor
import com.adlcom.mxl.sdk.performance.AnrDetector
import com.adlcom.mxl.sdk.network.HttpClient
import com.adlcom.mxl.sdk.storage.StorageManager
import com.adlcom.mxl.sdk.session.SessionManager
import com.adlcom.mxl.sdk.logging.Logger
import com.adlcom.mxl.sdk.interaction.UserInteractionTracker
import com.adlcom.mxl.sdk.push.PushNotificationTracker
import com.adlcom.mxl.sdk.config.RemoteConfigManager
import com.adlcom.mxl.sdk.tracing.TracingManager

/**
 * Internal SDK initializer that sets up all SDK components.
 */
internal object SdkInitializer {
    fun initialize(context: Application, configuration: SdkConfiguration): SdkState {
        Logger.initialize(context, configuration)
        
        val httpClient = HttpClient.create(context, configuration)
        val storageManager = StorageManager.create(context, configuration)
        val sessionManager = SessionManager.create(context, configuration)
        
        // Initialize crash reporting
        CrashReporter.initialize(context, configuration)
        
        // Initialize performance monitoring
        PerformanceMonitor.initialize(context, configuration)
        AnrDetector.initialize()
        
        // Initialize user interaction tracking
        UserInteractionTracker.initialize(configuration)
        
        // Initialize push notification tracking
        PushNotificationTracker.initialize(context, configuration)
        
        // Initialize remote config
        val remoteConfigManager = RemoteConfigManager.create(context, configuration, httpClient)
        if (remoteConfigManager.needsRefresh()) {
            remoteConfigManager.fetchConfig()
        }
        
        // Initialize distributed tracing
        val tracingManager = TracingManager.create(configuration)
        
        // Schedule periodic flush
        storageManager.schedulePeriodicFlush()
        
        // Register application lifecycle callbacks
        context.registerActivityLifecycleCallbacks(
            SdkLifecycleCallbacks(sessionManager)
        )
        
        return SdkState(
            context = context,
            configuration = configuration,
            httpClient = httpClient,
            storageManager = storageManager,
            sessionManager = sessionManager
        )
    }
}

/**
 * SDK state holder containing all initialized components.
 */
internal data class SdkState(
    val context: Context,
    val configuration: SdkConfiguration,
    val httpClient: HttpClient,
    val storageManager: StorageManager,
    val sessionManager: SessionManager
)

