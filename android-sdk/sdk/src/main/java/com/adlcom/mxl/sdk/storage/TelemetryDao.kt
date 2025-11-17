package com.adlcom.mxl.sdk.storage

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Update

/**
 * DAO for telemetry events.
 */
@Dao
interface TelemetryDao {
    @Insert
    suspend fun insert(event: TelemetryEventEntity): Long

    @Query("SELECT * FROM telemetry_events WHERE uploaded = 0 ORDER BY timestamp ASC LIMIT :limit")
    suspend fun getPendingEvents(limit: Int): List<TelemetryEventEntity>

    @Update
    suspend fun update(event: TelemetryEventEntity)

    @Query("UPDATE telemetry_events SET uploaded = 1 WHERE id IN (:ids)")
    suspend fun markAsUploaded(ids: List<Long>)

    @Query("DELETE FROM telemetry_events WHERE uploaded = 1 AND timestamp < :beforeTimestamp")
    suspend fun deleteOldEvents(beforeTimestamp: Long)

    @Query("SELECT COUNT(*) FROM telemetry_events WHERE uploaded = 0")
    suspend fun getPendingCount(): Int

    @Query("SELECT SUM(LENGTH(eventData)) FROM telemetry_events WHERE uploaded = 0")
    suspend fun getPendingSize(): Long?
}

