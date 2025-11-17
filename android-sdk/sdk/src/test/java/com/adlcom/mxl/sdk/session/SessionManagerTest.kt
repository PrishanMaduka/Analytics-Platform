package com.adlcom.mxl.sdk.session

import android.content.Context
import com.adlcom.mxl.sdk.config.SdkConfiguration
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

@RunWith(RobolectricTestRunner::class)
class SessionManagerTest {
    private lateinit var context: Context
    private lateinit var config: SdkConfiguration

    @Before
    fun setup() {
        context = RuntimeEnvironment.getApplication()
        config = SdkConfiguration.Builder()
            .apiKey("test-key")
            .endpoint("https://api.test.com")
            .build()
    }

    @Test
    fun testSessionCreation() {
        val sessionManager = SessionManager.create(context, config)
        val sessionId = sessionManager.getSessionId()
        
        assertNotNull(sessionId)
    }

    @Test
    fun testUserIdentification() {
        val sessionManager = SessionManager.create(context, config)
        sessionManager.identify("user123", mapOf("name" to "Test User"))
        
        assertEquals("user123", sessionManager.getUserId())
    }

    @Test
    fun testSessionTimeout() {
        val sessionManager = SessionManager.create(context, config)
        val initialSessionId = sessionManager.getSessionId()
        
        // Simulate timeout (30 minutes)
        Thread.sleep(100) // Small delay for testing
        
        // Session should still be valid (not enough time passed)
        assertEquals(initialSessionId, sessionManager.getSessionId())
    }
}

