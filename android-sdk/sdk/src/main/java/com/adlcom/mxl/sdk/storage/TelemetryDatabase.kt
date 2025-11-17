package com.adlcom.mxl.sdk.storage

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters

/**
 * Room database for storing telemetry events offline.
 */
@Database(
    entities = [
        TelemetryEventEntity::class,
        CrashEventEntity::class,
        NetworkEventEntity::class,
        PerformanceEventEntity::class,
        InteractionEventEntity::class
    ],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class TelemetryDatabase : RoomDatabase() {
    abstract fun telemetryDao(): TelemetryDao
    abstract fun crashDao(): CrashDao
    abstract fun networkDao(): NetworkDao
    abstract fun performanceDao(): PerformanceDao
    abstract fun interactionDao(): InteractionDao
}

