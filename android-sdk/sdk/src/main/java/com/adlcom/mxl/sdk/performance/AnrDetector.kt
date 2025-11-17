package com.adlcom.mxl.sdk.performance

import android.os.Handler
import android.os.Looper
import com.adlcom.mxl.sdk.internal.SdkState
import com.adlcom.mxl.sdk.internal.getSdkState
import com.adlcom.mxl.sdk.logging.Logger
import java.util.concurrent.atomic.AtomicBoolean

/**
 * ANR (Application Not Responding) detector.
 */
object AnrDetector {
    private var isInitialized = false
    private val isMonitoring = AtomicBoolean(false)
    private val mainHandler = Handler(Looper.getMainLooper())
    private val anrRunnable = Runnable { checkAnr() }

    /**
     * Initialize ANR detection.
     */
    fun initialize() {
        if (isInitialized) {
            return
        }

        startMonitoring()
        isInitialized = true
        Logger.d("ANR detection initialized")
    }

    /**
     * Start ANR monitoring.
     */
    private fun startMonitoring() {
        if (isMonitoring.get()) {
            return
        }

        isMonitoring.set(true)
        scheduleCheck()
    }

    /**
     * Schedule ANR check.
     */
    private fun scheduleCheck() {
        if (!isMonitoring.get()) {
            return
        }

        mainHandler.postDelayed(anrRunnable, 5000) // Check every 5 seconds
    }

    /**
     * Check for ANR condition.
     */
    private fun checkAnr() {
        val sdkState = getSdkState() ?: return

        // Check if main thread is blocked
        val mainThread = Looper.getMainLooper().thread
        val threadState = mainThread.state

        if (threadState == Thread.State.BLOCKED || threadState == Thread.State.WAITING) {
            // Potential ANR detected
            reportAnr(mainThread)
        }

        scheduleCheck()
    }

    /**
     * Report ANR event.
     */
    private fun reportAnr(thread: Thread) {
        val sdkState = getSdkState() ?: return

        val anrEvent = AnrEvent(
            sessionId = sdkState.sessionManager.getSessionId() ?: "unknown",
            userId = sdkState.sessionManager.getUserId(),
            threadName = thread.name,
            threadState = thread.state.name,
            timestamp = System.currentTimeMillis()
        )

        // Store ANR event
        kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch {
            try {
                sdkState.storageManager.storeEvent(
                    eventType = "performance",
                    eventData = anrEvent,
                    sessionId = anrEvent.sessionId,
                    userId = anrEvent.userId
                )
                Logger.w("ANR event stored: ${thread.name} in state ${thread.state}")
            } catch (e: Exception) {
                Logger.e("Error storing ANR event", e)
            }
        }
    }

    /**
     * Stop ANR monitoring.
     */
    fun stop() {
        isMonitoring.set(false)
        mainHandler.removeCallbacks(anrRunnable)
    }
}

data class AnrEvent(
    val sessionId: String,
    val userId: String?,
    val threadName: String,
    val threadState: String,
    val timestamp: Long
)

