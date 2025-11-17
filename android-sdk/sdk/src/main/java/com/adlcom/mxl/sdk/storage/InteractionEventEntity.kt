package com.adlcom.mxl.sdk.storage

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "interaction_events")
data class InteractionEventEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val sessionId: String,
    val eventType: String, // screen_view, tap, custom
    val eventData: String, // JSON
    val timestamp: Long,
    val uploaded: Boolean = false
)

