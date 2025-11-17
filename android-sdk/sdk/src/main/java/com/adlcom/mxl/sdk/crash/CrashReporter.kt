package com.adlcom.mxl.sdk.crash

import android.content.Context
import com.adlcom.mxl.sdk.config.SdkConfiguration
import com.adlcom.mxl.sdk.internal.SdkState
import com.adlcom.mxl.sdk.internal.getSdkState
import com.adlcom.mxl.sdk.logging.Logger
import com.adlcom.mxl.sdk.session.SessionManager
import java.io.PrintWriter
import java.io.StringWriter

/**
 * Crash reporter for capturing and reporting crashes.
 */
object CrashReporter {
    private var originalHandler: Thread.UncaughtExceptionHandler? = null
    private var isInitialized = false

    /**
     * Initialize crash reporting.
     */
    fun initialize(context: Context, configuration: SdkConfiguration) {
        if (!configuration.enableCrashReporting || isInitialized) {
            return
        }

        originalHandler = Thread.getDefaultUncaughtExceptionHandler()

        val crashHandler = object : Thread.UncaughtExceptionHandler {
            override fun uncaughtException(thread: Thread, throwable: Throwable) {
                try {
                    captureCrash(thread, throwable)
                } catch (e: Exception) {
                    Logger.e("Error capturing crash", e)
                } finally {
                    // Call original handler
                    originalHandler?.uncaughtException(thread, throwable)
                }
            }
        }

        Thread.setDefaultUncaughtExceptionHandler(crashHandler)
        isInitialized = true
        Logger.d("Crash reporting initialized")
    }

    /**
     * Capture a crash event.
     */
    private fun captureCrash(thread: Thread, throwable: Throwable) {
        val sdkState = getSdkState() ?: return

        val stackTrace = getStackTrace(throwable)
        val threadInfo = getThreadInfo(thread)

        val crashEvent = CrashEvent(
            sessionId = sdkState.sessionManager.getSessionId() ?: "unknown",
            userId = sdkState.sessionManager.getUserId(),
            exceptionType = throwable.javaClass.name,
            exceptionMessage = throwable.message ?: "",
            stackTrace = stackTrace,
            threadInfo = threadInfo,
            timestamp = System.currentTimeMillis(),
            deviceInfo = getDeviceInfo(sdkState.context)
        )

        // Store crash for later upload
        storeCrash(crashEvent, sdkState)
    }

    /**
     * Get stack trace as string.
     */
    private fun getStackTrace(throwable: Throwable): String {
        val sw = StringWriter()
        val pw = PrintWriter(sw)
        throwable.printStackTrace(pw)
        return sw.toString()
    }

    /**
     * Get thread information.
     */
    private fun getThreadInfo(thread: Thread): ThreadInfo {
        return ThreadInfo(
            name = thread.name,
            id = thread.id,
            priority = thread.priority,
            state = thread.state.name
        )
    }

    /**
     * Get device information.
     */
    private fun getDeviceInfo(context: Context): DeviceInfo {
        val packageManager = context.packageManager
        val packageInfo = packageManager.getPackageInfo(context.packageName, 0)

        return DeviceInfo(
            platform = "Android",
            osVersion = android.os.Build.VERSION.RELEASE,
            sdkVersion = android.os.Build.VERSION.SDK_INT,
            deviceModel = android.os.Build.MODEL,
            manufacturer = android.os.Build.MANUFACTURER,
            appVersion = packageInfo.versionName ?: "unknown",
            appVersionCode = packageInfo.longVersionCode
        )
    }

    /**
     * Store crash event for later upload.
     */
    private fun storeCrash(crashEvent: CrashEvent, sdkState: SdkState) {
        kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch {
            try {
                sdkState.storageManager.storeEvent(
                    eventType = "crash",
                    eventData = crashEvent,
                    sessionId = crashEvent.sessionId,
                    userId = crashEvent.userId
                )
                Logger.d("Crash event stored: ${crashEvent.exceptionType}")
            } catch (e: Exception) {
                Logger.e("Error storing crash event", e)
            }
        }
    }

    /**
     * Report a custom error manually.
     */
    fun reportError(throwable: Throwable, context: Map<String, Any> = emptyMap()) {
        val sdkState = getSdkState() ?: return

        val stackTrace = getStackTrace(throwable)
        val threadInfo = getThreadInfo(Thread.currentThread())

        val crashEvent = CrashEvent(
            sessionId = sdkState.sessionManager.getSessionId() ?: "unknown",
            userId = sdkState.sessionManager.getUserId(),
            exceptionType = throwable.javaClass.name,
            exceptionMessage = throwable.message ?: "",
            stackTrace = stackTrace,
            threadInfo = threadInfo,
            timestamp = System.currentTimeMillis(),
            deviceInfo = getDeviceInfo(sdkState.context),
            customContext = context
        )

        storeCrash(crashEvent, sdkState)
    }
}

data class CrashEvent(
    val sessionId: String,
    val userId: String?,
    val exceptionType: String,
    val exceptionMessage: String,
    val stackTrace: String,
    val threadInfo: ThreadInfo,
    val timestamp: Long,
    val deviceInfo: DeviceInfo,
    val customContext: Map<String, Any> = emptyMap()
)

data class ThreadInfo(
    val name: String,
    val id: Long,
    val priority: Int,
    val state: String
)

data class DeviceInfo(
    val platform: String,
    val osVersion: String,
    val sdkVersion: Int,
    val deviceModel: String,
    val manufacturer: String,
    val appVersion: String,
    val appVersionCode: Long
)

