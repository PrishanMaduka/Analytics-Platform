package com.adlcom.mxl.sdk.storage

import android.content.Context
import androidx.room.Room
import androidx.work.*
import com.adlcom.mxl.sdk.config.SdkConfiguration
import com.adlcom.mxl.sdk.logging.Logger
import com.adlcom.mxl.sdk.network.HttpClient
import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit

/**
 * Manages local storage for offline data persistence.
 */
class StorageManager private constructor(
    private val context: Context,
    private val configuration: SdkConfiguration,
    private val database: TelemetryDatabase,
    private val httpClient: HttpClient,
    private val gson: Gson
) {
    companion object {
        fun create(context: Context, configuration: SdkConfiguration): StorageManager {
            val database = Room.databaseBuilder(
                context,
                TelemetryDatabase::class.java,
                "mxl_telemetry.db"
            ).build()

            val httpClient = HttpClient.create(context, configuration)
            val gson = Gson()

            return StorageManager(context, configuration, database, httpClient, gson)
        }
    }

    /**
     * Store telemetry event.
     */
    suspend fun storeEvent(eventType: String, eventData: Any, sessionId: String, userId: String? = null) {
        try {
            val eventJson = gson.toJson(eventData)
            val entity = TelemetryEventEntity(
                sessionId = sessionId,
                userId = userId,
                eventType = eventType,
                eventData = eventJson,
                timestamp = System.currentTimeMillis()
            )

            database.telemetryDao().insert(entity)

            // Check if we need to flush
            val pendingCount = database.telemetryDao().getPendingCount()
            if (pendingCount >= configuration.batchSize) {
                flushEvents()
            }
        } catch (e: Exception) {
            Logger.e("Error storing event", e)
        }
    }

    /**
     * Flush pending events to server.
     */
    suspend fun flushEvents() {
        try {
            val pendingEvents = database.telemetryDao().getPendingEvents(configuration.batchSize)
            if (pendingEvents.isEmpty()) {
                return
            }

            val events = pendingEvents.map { entity ->
                gson.fromJson(entity.eventData, Map::class.java)
            }

            val batchPayload = mapOf(
                "events" to events
            )

            val result = httpClient.post("/api/v1/telemetry/batch", gson.toJson(batchPayload))

            when (result) {
                is com.adlcom.mxl.sdk.network.NetworkResult.Success -> {
                    val ids = pendingEvents.map { it.id }
                    database.telemetryDao().markAsUploaded(ids)
                    Logger.d("Uploaded ${pendingEvents.size} events")
                }
                is com.adlcom.mxl.sdk.network.NetworkResult.Error -> {
                    // Increment upload attempts
                    pendingEvents.forEach { event ->
                        val updated = event.copy(uploadAttempts = event.uploadAttempts + 1)
                        database.telemetryDao().update(updated)
                    }
                    Logger.w("Failed to upload events: ${result.message}")
                }
            }
        } catch (e: Exception) {
            Logger.e("Error flushing events", e)
        }
    }

    /**
     * Schedule periodic flush.
     */
    fun schedulePeriodicFlush() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val workRequest = PeriodicWorkRequestBuilder<UploadWorker>(
            configuration.flushIntervalSeconds.toLong(),
            TimeUnit.SECONDS
        )
            .setConstraints(constraints)
            .build()

        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            "mxl_upload_work",
            ExistingPeriodicWorkPolicy.KEEP,
            workRequest
        )
    }

    /**
     * Clean up old events.
     */
    suspend fun cleanupOldEvents() {
        try {
            val cutoffTime = System.currentTimeMillis() - (7 * 24 * 60 * 60 * 1000) // 7 days
            database.telemetryDao().deleteOldEvents(cutoffTime)
        } catch (e: Exception) {
            Logger.e("Error cleaning up old events", e)
        }
    }

    /**
     * Check storage size and enforce limits.
     */
    suspend fun enforceStorageLimits() {
        try {
            val pendingSize = database.telemetryDao().getPendingSize() ?: 0L
            if (pendingSize > configuration.maxOfflineStorageSize) {
                // Delete oldest events
                val cutoffTime = System.currentTimeMillis() - (24 * 60 * 60 * 1000) // 1 day
                database.telemetryDao().deleteOldEvents(cutoffTime)
            }
        } catch (e: Exception) {
            Logger.e("Error enforcing storage limits", e)
        }
    }
}

/**
 * WorkManager worker for uploading events.
 */
class UploadWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        return try {
            // Get SDK state to access storage manager
            val sdkState = com.adlcom.mxl.sdk.MxLSdk.getSdkState()
            if (sdkState != null) {
                sdkState.storageManager.flushEvents()
                Result.success()
            } else {
                Logger.w("SDK not initialized, cannot flush events")
                Result.retry()
            }
        } catch (e: Exception) {
            Logger.e("Error in UploadWorker", e)
            Result.retry()
        }
    }
}
