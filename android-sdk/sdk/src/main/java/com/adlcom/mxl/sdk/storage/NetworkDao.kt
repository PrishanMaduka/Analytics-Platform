package com.adlcom.mxl.sdk.storage

import androidx.room.Dao
import androidx.room.Insert

@Dao
interface NetworkDao {
    @Insert
    suspend fun insert(event: NetworkEventEntity): Long
}

