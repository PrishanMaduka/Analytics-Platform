package com.adlcom.mxl.sdk

import android.app.Application
import com.adlcom.mxl.sdk.config.SdkConfiguration
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import kotlin.test.assertFalse
import kotlin.test.assertTrue

@RunWith(RobolectricTestRunner::class)
class MxLSdkTest {
    @Mock
    private lateinit var mockApplication: Application

    @Before
    fun setup() {
        MockitoAnnotations.openMocks(this)
    }

    @Test
    fun testSdkNotInitializedInitially() {
        assertFalse(MxLSdk.isInitialized())
    }

    @Test
    fun testSdkInitialization() {
        val context = RuntimeEnvironment.getApplication()
        val config = SdkConfiguration.Builder()
            .apiKey("test-api-key")
            .endpoint("https://api.test.com")
            .build()

        MxLSdk.initialize(context, config)
        assertTrue(MxLSdk.isInitialized())
    }

    @Test(expected = IllegalStateException::class)
    fun testDoubleInitializationThrowsException() {
        val context = RuntimeEnvironment.getApplication()
        val config = SdkConfiguration.Builder()
            .apiKey("test-api-key")
            .endpoint("https://api.test.com")
            .build()

        MxLSdk.initialize(context, config)
        MxLSdk.initialize(context, config) // Should throw
    }
}

