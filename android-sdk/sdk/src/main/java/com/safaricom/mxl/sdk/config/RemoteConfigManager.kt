package com.adlcom.mxl.sdk.config

import android.content.Context
import android.content.SharedPreferences
import com.adlcom.mxl.sdk.internal.SdkState
import com.adlcom.mxl.sdk.internal.getSdkState
import com.adlcom.mxl.sdk.logging.Logger
import com.adlcom.mxl.sdk.network.HttpClient
import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit

/**
 * Manages remote configuration updates.
 */
class RemoteConfigManager private constructor(
    private val context: Context,
    private val configuration: SdkConfiguration,
    private val httpClient: HttpClient,
    private val prefs: SharedPreferences,
    private val gson: Gson
) {
    companion object {
        private const val PREFS_NAME = "mxl_remote_config"
        private const val KEY_CONFIG_VERSION = "config_version"
        private const val KEY_CONFIG_DATA = "config_data"
        private const val KEY_LAST_FETCH = "last_fetch"

        fun create(context: Context, configuration: SdkConfiguration, httpClient: HttpClient): RemoteConfigManager {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val gson = Gson()
            return RemoteConfigManager(context, configuration, httpClient, prefs, gson)
        }
    }

    /**
     * Fetch remote configuration.
     */
    fun fetchConfig() {
        val scope = CoroutineScope(Dispatchers.IO)
        scope.launch {
            try {
                val response = httpClient.post("/api/v1/config", "{}")
                
                when (response) {
                    is com.adlcom.mxl.sdk.network.NetworkResult.Success -> {
                        val configData = gson.fromJson(response.data, RemoteConfigData::class.java)
                        saveConfig(configData)
                        Logger.d("Remote config fetched: version ${configData.version}")
                    }
                    is com.adlcom.mxl.sdk.network.NetworkResult.Error -> {
                        Logger.w("Failed to fetch remote config: ${response.message}")
                    }
                }
            } catch (e: Exception) {
                Logger.e("Error fetching remote config", e)
            }
        }
    }

    /**
     * Get feature flag value.
     */
    fun getFeatureFlag(key: String, defaultValue: Boolean = false): Boolean {
        val configData = getCachedConfig() ?: return defaultValue
        return configData.featureFlags[key] ?: defaultValue
    }

    /**
     * Get sampling rate.
     */
    fun getSamplingRate(): Float {
        val configData = getCachedConfig() ?: return configuration.samplingRate
        return configData.samplingRate ?: configuration.samplingRate
    }

    /**
     * Get config value.
     */
    fun getConfigValue(key: String, defaultValue: String = ""): String {
        val configData = getCachedConfig() ?: return defaultValue
        return configData.config[key] ?: defaultValue
    }

    /**
     * Save configuration.
     */
    private fun saveConfig(configData: RemoteConfigData) {
        prefs.edit()
            .putInt(KEY_CONFIG_VERSION, configData.version)
            .putString(KEY_CONFIG_DATA, gson.toJson(configData))
            .putLong(KEY_LAST_FETCH, System.currentTimeMillis())
            .apply()
    }

    /**
     * Get cached configuration.
     */
    private fun getCachedConfig(): RemoteConfigData? {
        val configJson = prefs.getString(KEY_CONFIG_DATA, null) ?: return null
        return try {
            gson.fromJson(configJson, RemoteConfigData::class.java)
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Check if config needs refresh.
     */
    fun needsRefresh(): Boolean {
        val lastFetch = prefs.getLong(KEY_LAST_FETCH, 0)
        val now = System.currentTimeMillis()
        val timeSinceFetch = now - lastFetch
        return timeSinceFetch > TimeUnit.HOURS.toMillis(1) // Refresh every hour
    }
}

data class RemoteConfigData(
    val version: Int,
    val samplingRate: Float?,
    val featureFlags: Map<String, Boolean>,
    val config: Map<String, String>
)

