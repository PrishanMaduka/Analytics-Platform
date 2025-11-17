package com.adlcom.mxl.sdk.storage

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "network_events")
data class NetworkEventEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val sessionId: String,
    val url: String,
    val method: String,
    val statusCode: Int,
    val duration: Long,
    val timestamp: Long,
    val uploaded: Boolean = false
)

