package com.adlcom.mxl.sdk.storage

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "crash_events")
data class CrashEventEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val sessionId: String,
    val userId: String?,
    val exceptionType: String,
    val exceptionMessage: String,
    val stackTrace: String,
    val timestamp: Long,
    val uploaded: Boolean = false
)

