package com.adlcom.mxl.sdk.security

import android.content.Context
import android.util.Base64
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec
import android.content.SharedPreferences

/**
 * AES-256 encryption manager for data at rest.
 */
class EncryptionManager private constructor(
    private val context: Context
) {
    companion object {
        private const val ALGORITHM = "AES"
        private const val TRANSFORMATION = "AES/GCM/NoPadding"
        private const val KEY_SIZE = 256
        private const val GCM_IV_LENGTH = 12
        private const val GCM_TAG_LENGTH = 16
        private const val PREFS_NAME = "mxl_encryption_prefs"
        private const val KEY_NAME = "encryption_key"

        fun create(context: Context): EncryptionManager {
            return EncryptionManager(context)
        }
    }

    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    /**
     * Get or generate encryption key.
     */
    private fun getOrGenerateKey(): SecretKey {
        val keyString = prefs.getString(KEY_NAME, null)
        
        return if (keyString != null) {
            val keyBytes = Base64.decode(keyString, Base64.DEFAULT)
            SecretKeySpec(keyBytes, ALGORITHM)
        } else {
            val keyGenerator = KeyGenerator.getInstance(ALGORITHM)
            keyGenerator.init(KEY_SIZE)
            val key = keyGenerator.generateKey()
            
            // Store key securely
            val keyString = Base64.encodeToString(key.encoded, Base64.DEFAULT)
            prefs.edit().putString(KEY_NAME, keyString).apply()
            
            key
        }
    }

    /**
     * Encrypt data.
     */
    fun encrypt(data: String): String {
        try {
            val key = getOrGenerateKey()
            val cipher = Cipher.getInstance(TRANSFORMATION)
            cipher.init(Cipher.ENCRYPT_MODE, key)
            
            val iv = cipher.iv
            val encryptedBytes = cipher.doFinal(data.toByteArray(Charsets.UTF_8))
            
            // Combine IV and encrypted data
            val combined = ByteArray(GCM_IV_LENGTH + encryptedBytes.size)
            System.arraycopy(iv, 0, combined, 0, GCM_IV_LENGTH)
            System.arraycopy(encryptedBytes, 0, combined, GCM_IV_LENGTH, encryptedBytes.size)
            
            return Base64.encodeToString(combined, Base64.DEFAULT)
        } catch (e: Exception) {
            throw RuntimeException("Encryption failed", e)
        }
    }

    /**
     * Decrypt data.
     */
    fun decrypt(encryptedData: String): String {
        try {
            val key = getOrGenerateKey()
            val combined = Base64.decode(encryptedData, Base64.DEFAULT)
            
            // Extract IV and encrypted data
            val iv = ByteArray(GCM_IV_LENGTH)
            System.arraycopy(combined, 0, iv, 0, GCM_IV_LENGTH)
            
            val encryptedBytes = ByteArray(combined.size - GCM_IV_LENGTH)
            System.arraycopy(combined, GCM_IV_LENGTH, encryptedBytes, 0, encryptedBytes.size)
            
            val cipher = Cipher.getInstance(TRANSFORMATION)
            val parameterSpec = GCMParameterSpec(GCM_TAG_LENGTH * 8, iv)
            cipher.init(Cipher.DECRYPT_MODE, key, parameterSpec)
            
            val decryptedBytes = cipher.doFinal(encryptedBytes)
            return String(decryptedBytes, Charsets.UTF_8)
        } catch (e: Exception) {
            throw RuntimeException("Decryption failed", e)
        }
    }

    /**
     * Encrypt bytes.
     */
    fun encryptBytes(data: ByteArray): ByteArray {
        val encrypted = encrypt(String(data, Charsets.UTF_8))
        return encrypted.toByteArray(Charsets.UTF_8)
    }

    /**
     * Decrypt bytes.
     */
    fun decryptBytes(encryptedData: ByteArray): ByteArray {
        val decrypted = decrypt(String(encryptedData, Charsets.UTF_8))
        return decrypted.toByteArray(Charsets.UTF_8)
    }
}

