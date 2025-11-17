package com.adlcom.mxl.sdk.storage

import androidx.room.Dao
import androidx.room.Insert

@Dao
interface InteractionDao {
    @Insert
    suspend fun insert(event: InteractionEventEntity): Long
}

