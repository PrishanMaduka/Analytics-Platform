package com.adlcom.mxl.sdk.storage

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "performance_events")
data class PerformanceEventEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val sessionId: String,
    val metric: String,
    val value: Double,
    val unit: String,
    val timestamp: Long,
    val uploaded: Boolean = false
)

