package com.adlcom.mxl.sdk.performance

import android.app.ActivityManager
import android.content.Context
import android.os.Build
import android.os.Debug
import android.os.Process
import android.os.SystemClock
import android.view.Choreographer
import androidx.work.*
import com.adlcom.mxl.sdk.config.SdkConfiguration
import com.adlcom.mxl.sdk.internal.SdkState
import com.adlcom.mxl.sdk.internal.getSdkState
import com.adlcom.mxl.sdk.logging.Logger
import java.io.BufferedReader
import java.io.FileReader
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicLong

/**
 * Performance monitor for tracking app performance metrics.
 */
object PerformanceMonitor {
    private var isInitialized = false
    private var appStartTime: Long = 0
    private val frameDropCount = AtomicLong(0)
    private var lastFrameTime = SystemClock.elapsedRealtime()
    private var choreographer: Choreographer? = null
    private var frameCallback: Choreographer.FrameCallback? = null
    private var context: Context? = null
    private var configuration: SdkConfiguration? = null

    /**
     * Initialize performance monitoring.
     */
    fun initialize(context: Context, configuration: SdkConfiguration) {
        if (!configuration.enablePerformanceMonitoring || isInitialized) {
            return
        }

        this.context = context
        this.configuration = configuration
        appStartTime = SystemClock.elapsedRealtime()
        isInitialized = true

        // Start monitoring
        startStartupTimeTracking()
        startFrameMonitoring()
        startResourceMonitoring(context)

        Logger.d("Performance monitoring initialized")
    }

    /**
     * Track app startup time.
     */
    private fun startStartupTimeTracking() {
        val startupTime = SystemClock.elapsedRealtime() - appStartTime
        reportStartupTime(startupTime)
    }

    /**
     * Report startup time.
     */
    private fun reportStartupTime(startupTime: Long) {
        val sdkState = getSdkState() ?: return

        val performanceEvent = PerformanceEvent(
            sessionId = sdkState.sessionManager.getSessionId() ?: "unknown",
            userId = sdkState.sessionManager.getUserId(),
            eventType = "startup",
            metric = "startup_time",
            value = startupTime.toDouble(),
            unit = "ms",
            timestamp = System.currentTimeMillis(),
            deviceInfo = getDeviceInfo(sdkState.context)
        )

        storePerformanceEvent(performanceEvent, sdkState)
    }

    /**
     * Start frame monitoring for UI performance.
     */
    private fun startFrameMonitoring() {
        try {
            choreographer = Choreographer.getInstance()
            
            frameCallback = object : Choreographer.FrameCallback {
                private var lastFrameTimeNanos = System.nanoTime()
                private var frameCount = 0
                private var droppedFrames = 0
                
                override fun doFrame(frameTimeNanos: Long) {
                    val frameInterval = frameTimeNanos - lastFrameTimeNanos
                    val expectedFrameTime = 16_666_667L // ~60 FPS = 16.67ms
                    
                    // Check for dropped frames (frame took longer than expected)
                    if (frameInterval > expectedFrameTime * 1.5) {
                        val dropped = ((frameInterval - expectedFrameTime) / expectedFrameTime).toInt()
                        droppedFrames += dropped
                        frameDropCount.addAndGet(dropped.toLong())
                    }
                    
                    frameCount++
                    lastFrameTimeNanos = frameTimeNanos
                    
                    // Report frame metrics every 60 frames (~1 second at 60 FPS)
                    if (frameCount >= 60) {
                        val sdkState = getSdkState()
                        if (sdkState != null) {
                            reportMetric("fps", 60.0 - droppedFrames.toDouble(), "fps")
                            reportMetric("dropped_frames", droppedFrames.toDouble(), "frames")
                        }
                        frameCount = 0
                        droppedFrames = 0
                    }
                    
                    // Schedule next frame callback
                    choreographer?.postFrameCallback(this)
                }
            }
            
            choreographer?.postFrameCallback(frameCallback!!)
            Logger.d("Frame monitoring started")
        } catch (e: Exception) {
            Logger.e("Error starting frame monitoring", e)
        }
    }

    /**
     * Start resource monitoring (CPU, memory, battery).
     */
    private fun startResourceMonitoring(context: Context) {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.NOT_REQUIRED)
            .setRequiresBatteryNotLow(false)
            .build()

        val workRequest = PeriodicWorkRequestBuilder<ResourceMonitoringWorker>(
            5, TimeUnit.MINUTES // Monitor every 5 minutes
        )
            .setConstraints(constraints)
            .build()

        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            "mxl_resource_monitoring",
            ExistingPeriodicWorkPolicy.KEEP,
            workRequest
        )

        Logger.d("Resource monitoring started")
    }

    /**
     * Get current CPU usage.
     */
    fun getCpuUsage(): Double {
        return try {
            val pid = Process.myPid()
            val reader = BufferedReader(FileReader("/proc/$pid/stat"))
            val stats = reader.readLine().split(" ")
            reader.close()

            val utime = stats[13].toLong()
            val stime = stats[14].toLong()
            val totalTime = utime + stime

            // Calculate CPU usage percentage (simplified)
            totalTime.toDouble() / 100.0
        } catch (e: Exception) {
            Logger.e("Error getting CPU usage", e)
            0.0
        }
    }

    /**
     * Get current memory usage.
     */
    fun getMemoryUsage(context: Context): MemoryInfo {
        val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memInfo = ActivityManager.MemoryInfo()
        activityManager.getMemoryInfo(memInfo)

        val runtime = Runtime.getRuntime()
        val usedMemory = runtime.totalMemory() - runtime.freeMemory()
        val maxMemory = runtime.maxMemory()

        return MemoryInfo(
            totalMemory = memInfo.totalMem,
            availableMemory = memInfo.availMem,
            usedMemory = usedMemory,
            maxMemory = maxMemory,
            isLowMemory = memInfo.lowMemory,
            threshold = memInfo.threshold
        )
    }

    /**
     * Get thread count.
     */
    fun getThreadCount(): Int {
        return Thread.activeCount()
    }

    /**
     * Report performance metric.
     */
    fun reportMetric(metric: String, value: Double, unit: String = "") {
        val sdkState = getSdkState() ?: return

        val performanceEvent = PerformanceEvent(
            sessionId = sdkState.sessionManager.getSessionId() ?: "unknown",
            userId = sdkState.sessionManager.getUserId(),
            eventType = "custom",
            metric = metric,
            value = value,
            unit = unit,
            timestamp = System.currentTimeMillis(),
            deviceInfo = getDeviceInfo(sdkState.context)
        )

        storePerformanceEvent(performanceEvent, sdkState)
    }

    /**
     * Store performance event.
     */
    private fun storePerformanceEvent(event: PerformanceEvent, sdkState: SdkState) {
        kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch {
            try {
                sdkState.storageManager.storeEvent(
                    eventType = "performance",
                    eventData = event,
                    sessionId = event.sessionId,
                    userId = event.userId
                )
                Logger.d("Performance event stored: ${event.metric} = ${event.value} ${event.unit}")
            } catch (e: Exception) {
                Logger.e("Error storing performance event", e)
            }
        }
    }

    /**
     * Get device information.
     */
    private fun getDeviceInfo(context: Context): DeviceInfo {
        val packageManager = context.packageManager
        val packageInfo = packageManager.getPackageInfo(context.packageName, 0)

        return DeviceInfo(
            platform = "Android",
            osVersion = Build.VERSION.RELEASE,
            sdkVersion = Build.VERSION.SDK_INT,
            deviceModel = Build.MODEL,
            manufacturer = Build.MANUFACTURER,
            appVersion = packageInfo.versionName ?: "unknown"
        )
    }
}

data class PerformanceEvent(
    val sessionId: String,
    val userId: String?,
    val eventType: String,
    val metric: String,
    val value: Double,
    val unit: String,
    val timestamp: Long,
    val deviceInfo: DeviceInfo
)

data class MemoryInfo(
    val totalMemory: Long,
    val availableMemory: Long,
    val usedMemory: Long,
    val maxMemory: Long,
    val isLowMemory: Boolean,
    val threshold: Long
)

data class DeviceInfo(
    val platform: String,
    val osVersion: String,
    val sdkVersion: Int,
    val deviceModel: String,
    val manufacturer: String,
    val appVersion: String
)

/**
 * WorkManager worker for periodic resource monitoring.
 */
class ResourceMonitoringWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        return try {
            val sdkState = com.adlcom.mxl.sdk.MxLSdk.getSdkState()
            if (sdkState != null && sdkState.configuration.enablePerformanceMonitoring) {
                // Collect CPU usage
                val cpuUsage = PerformanceMonitor.getCpuUsage()
                PerformanceMonitor.reportMetric("cpu_usage", cpuUsage, "%")

                // Collect memory usage
                val memoryInfo = PerformanceMonitor.getMemoryUsage(applicationContext)
                PerformanceMonitor.reportMetric("memory_used", memoryInfo.usedMemory.toDouble() / 1024.0 / 1024.0, "MB")
                PerformanceMonitor.reportMetric("memory_available", memoryInfo.availableMemory.toDouble() / 1024.0 / 1024.0, "MB")
                PerformanceMonitor.reportMetric("memory_total", memoryInfo.totalMemory.toDouble() / 1024.0 / 1024.0, "MB")

                // Collect thread count
                val threadCount = PerformanceMonitor.getThreadCount()
                PerformanceMonitor.reportMetric("thread_count", threadCount.toDouble(), "threads")

                Result.success()
            } else {
                Result.retry()
            }
        } catch (e: Exception) {
            Logger.e("Error in ResourceMonitoringWorker", e)
            Result.retry()
        }
    }
}

