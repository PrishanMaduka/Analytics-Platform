package com.adlcom.mxl.sdk.storage

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query

@Dao
interface CrashDao {
    @Insert
    suspend fun insert(event: CrashEventEntity): Long

    @Query("SELECT * FROM crash_events WHERE uploaded = 0 ORDER BY timestamp ASC")
    suspend fun getPendingEvents(): List<CrashEventEntity>
}

