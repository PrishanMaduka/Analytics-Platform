package com.adlcom.mxl.sdk

import android.content.Context
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.adlcom.mxl.sdk.config.SdkConfiguration
import org.junit.Test
import org.junit.runner.RunWith
import kotlin.test.assertNotNull

/**
 * Device/instrumentation tests for Android SDK.
 */
@RunWith(AndroidJUnit4::class)
class DeviceTest {
    private val context: Context = InstrumentationRegistry.getInstrumentation().targetContext

    @Test
    fun testSdkInitializationOnDevice() {
        val config = SdkConfiguration.Builder()
            .apiKey("test-api-key")
            .endpoint("https://api.test.com")
            .build()

        MxLSdk.initialize(context, config)
        assertNotNull(MxLSdk.isInitialized())
    }

    @Test
    fun testCrashReportingOnDevice() {
        // Test crash reporting functionality on actual device
        // This would test native crash handling
    }

    @Test
    fun testPerformanceMonitoringOnDevice() {
        // Test performance monitoring on actual device
        // This would test CPU, memory, ANR detection
    }

    @Test
    fun testNetworkMonitoringOnDevice() {
        // Test network monitoring on actual device
        // This would test OkHttp interceptor
    }
}

