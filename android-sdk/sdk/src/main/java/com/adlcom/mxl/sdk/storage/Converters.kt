package com.adlcom.mxl.sdk.storage

import androidx.room.TypeConverter
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * Type converters for Room database.
 */
class Converters {
    private val gson = Gson()

    @TypeConverter
    fun fromString(value: String): Map<String, Any> {
        val type = object : TypeToken<Map<String, Any>>() {}.type
        return gson.fromJson(value, type)
    }

    @TypeConverter
    fun toString(map: Map<String, Any>): String {
        return gson.toJson(map)
    }
}

