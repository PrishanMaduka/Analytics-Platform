package com.adlcom.mxl.sdk.interaction

import android.app.Activity
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import com.adlcom.mxl.sdk.config.SdkConfiguration
import com.adlcom.mxl.sdk.internal.SdkState
import com.adlcom.mxl.sdk.internal.getSdkState
import com.adlcom.mxl.sdk.logging.Logger
import java.lang.reflect.Method

/**
 * User interaction tracker for capturing user gestures and screen views.
 */
object UserInteractionTracker {
    private var isInitialized = false
    private val trackedActivities = mutableSetOf<String>()

    /**
     * Initialize user interaction tracking.
     */
    fun initialize(configuration: SdkConfiguration) {
        if (!configuration.enableUserTracking || isInitialized) {
            return
        }

        isInitialized = true
        Logger.d("User interaction tracking initialized")
    }

    /**
     * Track screen view for an activity.
     */
    fun trackScreenView(activity: Activity) {
        val sdkState = getSdkState() ?: return
        if (!sdkState.configuration.enableUserTracking) {
            return
        }

        val activityName = activity.javaClass.simpleName
        if (trackedActivities.contains(activityName)) {
            return
        }

        trackedActivities.add(activityName)

        val screenViewEvent = ScreenViewEvent(
            sessionId = sdkState.sessionManager.getSessionId() ?: "unknown",
            userId = sdkState.sessionManager.getUserId(),
            screenName = activityName,
            screenClass = activity.javaClass.name,
            timestamp = System.currentTimeMillis()
        )

        storeScreenView(screenViewEvent, sdkState)
    }

    /**
     * Track tap event.
     */
    fun trackTap(view: View, event: MotionEvent) {
        val sdkState = getSdkState() ?: return
        if (!sdkState.configuration.enableUserTracking) {
            return
        }

        val viewId = view.id
        val viewTag = view.tag?.toString() ?: ""
        val viewClass = view.javaClass.simpleName

        val tapEvent = TapEvent(
            sessionId = sdkState.sessionManager.getSessionId() ?: "unknown",
            userId = sdkState.sessionManager.getUserId(),
            viewId = if (viewId != View.NO_ID) view.resources.getResourceEntryName(viewId) else null,
            viewTag = viewTag,
            viewClass = viewClass,
            x = event.x,
            y = event.y,
            timestamp = System.currentTimeMillis()
        )

        storeTapEvent(tapEvent, sdkState)
    }

    /**
     * Track custom event.
     */
    fun trackEvent(eventName: String, properties: Map<String, Any> = emptyMap()) {
        val sdkState = getSdkState() ?: return
        if (!sdkState.configuration.enableUserTracking) {
            return
        }

        val customEvent = CustomEvent(
            sessionId = sdkState.sessionManager.getSessionId() ?: "unknown",
            userId = sdkState.sessionManager.getUserId(),
            eventName = eventName,
            properties = properties,
            timestamp = System.currentTimeMillis()
        )

        storeCustomEvent(customEvent, sdkState)
    }

    /**
     * Store screen view event.
     */
    private fun storeScreenView(event: ScreenViewEvent, sdkState: SdkState) {
        kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch {
            try {
                sdkState.storageManager.storeEvent(
                    eventType = "interaction",
                    eventData = event,
                    sessionId = event.sessionId,
                    userId = event.userId
                )
                Logger.d("Screen view stored: ${event.screenName}")
            } catch (e: Exception) {
                Logger.e("Error storing screen view event", e)
            }
        }
    }

    /**
     * Store tap event.
     */
    private fun storeTapEvent(event: TapEvent, sdkState: SdkState) {
        kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch {
            try {
                sdkState.storageManager.storeEvent(
                    eventType = "interaction",
                    eventData = event,
                    sessionId = event.sessionId,
                    userId = event.userId
                )
                Logger.d("Tap event stored: ${event.viewClass} at (${event.x}, ${event.y})")
            } catch (e: Exception) {
                Logger.e("Error storing tap event", e)
            }
        }
    }

    /**
     * Store custom event.
     */
    private fun storeCustomEvent(event: CustomEvent, sdkState: SdkState) {
        kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch {
            try {
                sdkState.storageManager.storeEvent(
                    eventType = "interaction",
                    eventData = event,
                    sessionId = event.sessionId,
                    userId = event.userId
                )
                Logger.d("Custom event stored: ${event.eventName}")
            } catch (e: Exception) {
                Logger.e("Error storing custom event", e)
            }
        }
    }
}

data class ScreenViewEvent(
    val sessionId: String,
    val userId: String?,
    val screenName: String,
    val screenClass: String,
    val timestamp: Long
)

data class TapEvent(
    val sessionId: String,
    val userId: String?,
    val viewId: String?,
    val viewTag: String,
    val viewClass: String,
    val x: Float,
    val y: Float,
    val timestamp: Long
)

data class CustomEvent(
    val sessionId: String,
    val userId: String?,
    val eventName: String,
    val properties: Map<String, Any>,
    val timestamp: Long
)

