package com.adlcom.mxl.sdk.security

import java.util.regex.Pattern

/**
 * PII (Personally Identifiable Information) detector and redactor.
 */
object PiiDetector {
    // Common PII patterns
    private val EMAIL_PATTERN = Pattern.compile(
        "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b",
        Pattern.CASE_INSENSITIVE
    )
    
    private val PHONE_PATTERN = Pattern.compile(
        "\\b(\\+?\\d{1,3}[-.\\s]?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}\\b",
        Pattern.CASE_INSENSITIVE
    )
    
    private val CREDIT_CARD_PATTERN = Pattern.compile(
        "\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b",
        Pattern.CASE_INSENSITIVE
    )
    
    private val SSN_PATTERN = Pattern.compile(
        "\\b\\d{3}-\\d{2}-\\d{4}\\b",
        Pattern.CASE_INSENSITIVE
    )
    
    private val IP_ADDRESS_PATTERN = Pattern.compile(
        "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
        Pattern.CASE_INSENSITIVE
    )
    
    private val REDACTION_STRING = "[REDACTED]"

    /**
     * Detect PII in text.
     */
    fun detectPii(text: String): List<PiiMatch> {
        val matches = mutableListOf<PiiMatch>()
        
        // Email detection
        EMAIL_PATTERN.matcher(text).findAll().forEach { match ->
            matches.add(PiiMatch(PiiType.EMAIL, match.value, match.range.first, match.range.last + 1))
        }
        
        // Phone detection
        PHONE_PATTERN.matcher(text).findAll().forEach { match ->
            matches.add(PiiMatch(PiiType.PHONE, match.value, match.range.first, match.range.last + 1))
        }
        
        // Credit card detection
        CREDIT_CARD_PATTERN.matcher(text).findAll().forEach { match ->
            matches.add(PiiMatch(PiiType.CREDIT_CARD, match.value, match.range.first, match.range.last + 1))
        }
        
        // SSN detection
        SSN_PATTERN.matcher(text).findAll().forEach { match ->
            matches.add(PiiMatch(PiiType.SSN, match.value, match.range.first, match.range.last + 1))
        }
        
        // IP address detection
        IP_ADDRESS_PATTERN.matcher(text).findAll().forEach { match ->
            matches.add(PiiMatch(PiiType.IP_ADDRESS, match.value, match.range.first, match.range.last + 1))
        }
        
        return matches
    }

    /**
     * Redact PII from text.
     */
    fun redactPii(text: String): String {
        val matches = detectPii(text).sortedByDescending { it.start }
        
        var redactedText = text
        matches.forEach { match ->
            redactedText = redactedText.replaceRange(
                match.start,
                match.end,
                REDACTION_STRING
            )
        }
        
        return redactedText
    }

    /**
     * Redact PII from map/object recursively.
     */
    fun redactFromMap(data: Map<String, Any>): Map<String, Any> {
        return data.mapValues { (key, value) ->
            when (value) {
                is String -> {
                    // Check if key suggests PII
                    if (isPiiKey(key)) {
                        REDACTION_STRING
                    } else {
                        redactPii(value)
                    }
                }
                is Map<*, *> -> redactFromMap(value as Map<String, Any>)
                is List<*> -> value.map { item ->
                    when (item) {
                        is String -> redactPii(item)
                        is Map<*, *> -> redactFromMap(item as Map<String, Any>)
                        else -> item
                    }
                }
                else -> value
            }
        }
    }

    /**
     * Check if a key suggests PII.
     */
    private fun isPiiKey(key: String): Boolean {
        val lowerKey = key.lowercase()
        return lowerKey.contains("email") ||
                lowerKey.contains("phone") ||
                lowerKey.contains("ssn") ||
                lowerKey.contains("credit") ||
                lowerKey.contains("card") ||
                lowerKey.contains("password") ||
                lowerKey.contains("token") ||
                lowerKey.contains("secret") ||
                lowerKey.contains("address") ||
                lowerKey.contains("name")
    }
}

data class PiiMatch(
    val type: PiiType,
    val value: String,
    val start: Int,
    val end: Int
)

enum class PiiType {
    EMAIL,
    PHONE,
    CREDIT_CARD,
    SSN,
    IP_ADDRESS
}

