package com.adlcom.mxl.sdk.storage

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Entity for storing telemetry events.
 */
@Entity(tableName = "telemetry_events")
data class TelemetryEventEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val sessionId: String,
    val userId: String?,
    val eventType: String,
    val eventData: String, // JSON string
    val timestamp: Long,
    val uploaded: Boolean = false,
    val uploadAttempts: Int = 0
)

