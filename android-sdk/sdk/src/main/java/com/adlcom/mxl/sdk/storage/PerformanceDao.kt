package com.adlcom.mxl.sdk.storage

import androidx.room.Dao
import androidx.room.Insert

@Dao
interface PerformanceDao {
    @Insert
    suspend fun insert(event: PerformanceEventEntity): Long
}

