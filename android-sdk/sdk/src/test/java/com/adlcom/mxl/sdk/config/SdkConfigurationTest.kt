package com.adlcom.mxl.sdk.config

import org.junit.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class SdkConfigurationTest {
    @Test
    fun testDefaultConfiguration() {
        val config = SdkConfiguration.Builder()
            .apiKey("test-key")
            .endpoint("https://api.test.com")
            .build()

        assertEquals("test-key", config.apiKey)
        assertEquals("https://api.test.com", config.endpoint)
        assertEquals(true, config.enableCrashReporting)
        assertEquals(true, config.enablePerformanceMonitoring)
        assertEquals(1.0f, config.samplingRate)
    }

    @Test
    fun testMissingApiKeyThrowsException() {
        assertFailsWith<IllegalArgumentException> {
            SdkConfiguration.Builder()
                .endpoint("https://api.test.com")
                .build()
        }
    }

    @Test
    fun testMissingEndpointThrowsException() {
        assertFailsWith<IllegalArgumentException> {
            SdkConfiguration.Builder()
                .apiKey("test-key")
                .build()
        }
    }

    @Test
    fun testHttpEndpointThrowsException() {
        assertFailsWith<IllegalArgumentException> {
            SdkConfiguration.Builder()
                .apiKey("test-key")
                .endpoint("http://api.test.com")
                .build()
        }
    }

    @Test
    fun testInvalidSamplingRate() {
        assertFailsWith<IllegalArgumentException> {
            SdkConfiguration.Builder()
                .apiKey("test-key")
                .endpoint("https://api.test.com")
                .samplingRate(1.5f) // Invalid: > 1.0
                .build()
        }
    }

    @Test
    fun testCustomConfiguration() {
        val config = SdkConfiguration.Builder()
            .apiKey("test-key")
            .endpoint("https://api.test.com")
            .enableCrashReporting(false)
            .enableNetworkMonitoring(false)
            .samplingRate(0.5f)
            .batchSize(100)
            .build()

        assertEquals(false, config.enableCrashReporting)
        assertEquals(false, config.enableNetworkMonitoring)
        assertEquals(0.5f, config.samplingRate)
        assertEquals(100, config.batchSize)
    }
}

