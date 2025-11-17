package com.adlcom.mxl.sdk.push

import android.content.Context
import com.adlcom.mxl.sdk.config.SdkConfiguration
import com.adlcom.mxl.sdk.internal.SdkState
import com.adlcom.mxl.sdk.internal.getSdkState
import com.adlcom.mxl.sdk.logging.Logger

/**
 * Push notification tracker for FCM (Firebase Cloud Messaging).
 */
object PushNotificationTracker {
    private var isInitialized = false

    /**
     * Initialize push notification tracking.
     */
    fun initialize(context: Context, configuration: SdkConfiguration) {
        if (isInitialized) {
            return
        }

        isInitialized = true
        Logger.d("Push notification tracking initialized")
    }

    /**
     * Track notification received.
     */
    fun trackNotificationReceived(notificationId: String, data: Map<String, String> = emptyMap()) {
        val sdkState = getSdkState() ?: return

        val pushEvent = PushEvent(
            sessionId = sdkState.sessionManager.getSessionId() ?: "unknown",
            userId = sdkState.sessionManager.getUserId(),
            notificationId = notificationId,
            eventType = "received",
            timestamp = System.currentTimeMillis(),
            data = data
        )

        storePushEvent(pushEvent, sdkState)
    }

    /**
     * Track notification opened.
     */
    fun trackNotificationOpened(notificationId: String, data: Map<String, String> = emptyMap()) {
        val sdkState = getSdkState() ?: return

        val pushEvent = PushEvent(
            sessionId = sdkState.sessionManager.getSessionId() ?: "unknown",
            userId = sdkState.sessionManager.getUserId(),
            notificationId = notificationId,
            eventType = "opened",
            timestamp = System.currentTimeMillis(),
            data = data
        )

        storePushEvent(pushEvent, sdkState)
    }

    /**
     * Track notification action clicked.
     */
    fun trackNotificationAction(notificationId: String, actionId: String, data: Map<String, String> = emptyMap()) {
        val sdkState = getSdkState() ?: return

        val pushEvent = PushEvent(
            sessionId = sdkState.sessionManager.getSessionId() ?: "unknown",
            userId = sdkState.sessionManager.getUserId(),
            notificationId = notificationId,
            eventType = "action",
            actionId = actionId,
            timestamp = System.currentTimeMillis(),
            data = data
        )

        storePushEvent(pushEvent, sdkState)
    }

    /**
     * Store push event.
     */
    private fun storePushEvent(event: PushEvent, sdkState: SdkState) {
        // TODO: Store in database
        Logger.d("Push event: ${event.eventType} for notification ${event.notificationId}")
    }
}

data class PushEvent(
    val sessionId: String,
    val userId: String?,
    val notificationId: String,
    val eventType: String, // received, opened, action
    val actionId: String? = null,
    val timestamp: Long,
    val data: Map<String, String>
)

