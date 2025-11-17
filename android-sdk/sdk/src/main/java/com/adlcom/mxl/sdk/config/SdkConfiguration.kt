package com.adlcom.mxl.sdk.config

/**
 * Configuration for the MxL SDK.
 */
data class SdkConfiguration(
    val apiKey: String,
    val endpoint: String,
    val enableCrashReporting: Boolean = true,
    val enablePerformanceMonitoring: Boolean = true,
    val enableNetworkMonitoring: Boolean = true,
    val enableUserTracking: Boolean = true,
    val enableDistributedTracing: Boolean = true,
    val enableCertificatePinning: Boolean = false,
    val certificatePins: List<String> = emptyList(),
    val samplingRate: Float = 1.0f,
    val batchSize: Int = 50,
    val flushIntervalSeconds: Int = 30,
    val maxOfflineStorageSize: Long = 10 * 1024 * 1024, // 10MB
    val enablePiiRedaction: Boolean = true,
    val enableEncryption: Boolean = true
) {
    class Builder {
        private var apiKey: String = ""
        private var endpoint: String = ""
        private var enableCrashReporting: Boolean = true
        private var enablePerformanceMonitoring: Boolean = true
        private var enableNetworkMonitoring: Boolean = true
        private var enableUserTracking: Boolean = true
        private var enableDistributedTracing: Boolean = true
        private var enableCertificatePinning: Boolean = false
        private var certificatePins: List<String> = emptyList()
        private var samplingRate: Float = 1.0f
        private var batchSize: Int = 50
        private var flushIntervalSeconds: Int = 30
        private var maxOfflineStorageSize: Long = 10 * 1024 * 1024
        private var enablePiiRedaction: Boolean = true
        private var enableEncryption: Boolean = true

        fun apiKey(apiKey: String) = apply { this.apiKey = apiKey }
        fun endpoint(endpoint: String) = apply { this.endpoint = endpoint }
        fun enableCrashReporting(enable: Boolean) = apply { this.enableCrashReporting = enable }
        fun enablePerformanceMonitoring(enable: Boolean) = apply { this.enablePerformanceMonitoring = enable }
        fun enableNetworkMonitoring(enable: Boolean) = apply { this.enableNetworkMonitoring = enable }
        fun enableUserTracking(enable: Boolean) = apply { this.enableUserTracking = enable }
        fun enableDistributedTracing(enable: Boolean) = apply { this.enableDistributedTracing = enable }
        fun enableCertificatePinning(enable: Boolean) = apply { this.enableCertificatePinning = enable }
        fun certificatePins(pins: List<String>) = apply { this.certificatePins = pins }
        fun samplingRate(rate: Float) = apply { 
            require(rate in 0.0f..1.0f) { "Sampling rate must be between 0.0 and 1.0" }
            this.samplingRate = rate 
        }
        fun batchSize(size: Int) = apply { 
            require(size > 0) { "Batch size must be greater than 0" }
            this.batchSize = size 
        }
        fun flushIntervalSeconds(seconds: Int) = apply { 
            require(seconds > 0) { "Flush interval must be greater than 0" }
            this.flushIntervalSeconds = seconds 
        }
        fun maxOfflineStorageSize(size: Long) = apply { 
            require(size > 0) { "Storage size must be greater than 0" }
            this.maxOfflineStorageSize = size 
        }
        fun enablePiiRedaction(enable: Boolean) = apply { this.enablePiiRedaction = enable }
        fun enableEncryption(enable: Boolean) = apply { this.enableEncryption = enable }

        fun build(): SdkConfiguration {
            require(apiKey.isNotBlank()) { "API key is required" }
            require(endpoint.isNotBlank()) { "Endpoint is required" }
            require(endpoint.startsWith("https://")) { "Endpoint must use HTTPS" }
            
            return SdkConfiguration(
                apiKey = apiKey,
                endpoint = endpoint,
                enableCrashReporting = enableCrashReporting,
                enablePerformanceMonitoring = enablePerformanceMonitoring,
                enableNetworkMonitoring = enableNetworkMonitoring,
                enableUserTracking = enableUserTracking,
                enableDistributedTracing = enableDistributedTracing,
                enableCertificatePinning = enableCertificatePinning,
                certificatePins = certificatePins,
                samplingRate = samplingRate,
                batchSize = batchSize,
                flushIntervalSeconds = flushIntervalSeconds,
                maxOfflineStorageSize = maxOfflineStorageSize,
                enablePiiRedaction = enablePiiRedaction,
                enableEncryption = enableEncryption
            )
        }
    }
}

