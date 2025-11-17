package com.adlcom.mxl.sdk.security

import org.junit.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class PiiDetectorTest {
    @Test
    fun testEmailDetection() {
        val text = "Contact us at support@example.com for help"
        val matches = PiiDetector.detectPii(text)
        
        assertTrue(matches.isNotEmpty())
        assertEquals(PiiType.EMAIL, matches[0].type)
        assertEquals("support@example.com", matches[0].value)
    }

    @Test
    fun testPhoneDetection() {
        val text = "Call us at +1-555-123-4567"
        val matches = PiiDetector.detectPii(text)
        
        assertTrue(matches.isNotEmpty())
        assertEquals(PiiType.PHONE, matches[0].type)
    }

    @Test
    fun testCreditCardDetection() {
        val text = "Card number: 1234-5678-9012-3456"
        val matches = PiiDetector.detectPii(text)
        
        assertTrue(matches.isNotEmpty())
        assertEquals(PiiType.CREDIT_CARD, matches[0].type)
    }

    @Test
    fun testSSNDetection() {
        val text = "SSN: 123-45-6789"
        val matches = PiiDetector.detectPii(text)
        
        assertTrue(matches.isNotEmpty())
        assertEquals(PiiType.SSN, matches[0].type)
    }

    @Test
    fun testPiiRedaction() {
        val text = "Email: test@example.com, Phone: 555-1234"
        val redacted = PiiDetector.redactPii(text)
        
        assertTrue(redacted.contains("[REDACTED]"))
        assertTrue(!redacted.contains("test@example.com"))
        assertTrue(!redacted.contains("555-1234"))
    }

    @Test
    fun testMapRedaction() {
        val data = mapOf(
            "email" to "user@example.com",
            "name" to "John Doe",
            "phone" to "555-1234"
        )
        
        val redacted = PiiDetector.redactFromMap(data)
        
        assertEquals("[REDACTED]", redacted["email"])
        assertEquals("[REDACTED]", redacted["phone"])
    }
}

