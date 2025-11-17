import XCTest
@testable import MxLSdk

final class MxLSdkTests: XCTestCase {
    func testSdkInitialization() throws {
        let config = SdkConfiguration(
            apiKey: "test-api-key",
            endpoint: "https://api.test.com"
        )
        
        XCTAssertNoThrow(try MxLSdk.initialize(configuration: config))
        XCTAssertTrue(MxLSdk.isInitialized)
    }
    
    func testDoubleInitializationThrowsError() throws {
        let config = SdkConfiguration(
            apiKey: "test-api-key",
            endpoint: "https://api.test.com"
        )
        
        try MxLSdk.initialize(configuration: config)
        
        XCTAssertThrowsError(try MxLSdk.initialize(configuration: config)) { error in
            if case SdkError.alreadyInitialized = error {
                // Expected error
            } else {
                XCTFail("Unexpected error type")
            }
        }
    }
}

final class SdkConfigurationTests: XCTestCase {
    func testDefaultConfiguration() {
        let config = SdkConfiguration(
            apiKey: "test-key",
            endpoint: "https://api.test.com"
        )
        
        XCTAssertEqual(config.apiKey, "test-key")
        XCTAssertEqual(config.endpoint, "https://api.test.com")
        XCTAssertTrue(config.enableCrashReporting)
        XCTAssertTrue(config.enablePerformanceMonitoring)
        XCTAssertEqual(config.samplingRate, 1.0)
    }
    
    func testCustomConfiguration() {
        let config = SdkConfiguration(
            apiKey: "test-key",
            endpoint: "https://api.test.com",
            enableCrashReporting: false,
            enableNetworkMonitoring: false,
            samplingRate: 0.5,
            batchSize: 100
        )
        
        XCTAssertFalse(config.enableCrashReporting)
        XCTAssertFalse(config.enableNetworkMonitoring)
        XCTAssertEqual(config.samplingRate, 0.5)
        XCTAssertEqual(config.batchSize, 100)
    }
}

final class PiiDetectorTests: XCTestCase {
    func testEmailDetection() {
        let text = "Contact us at support@example.com for help"
        let matches = PiiDetector.detectPii(text)
        
        XCTAssertFalse(matches.isEmpty)
        XCTAssertEqual(matches.first?.type, .email)
        XCTAssertEqual(matches.first?.value, "support@example.com")
    }
    
    func testPhoneDetection() {
        let text = "Call us at +1-555-123-4567"
        let matches = PiiDetector.detectPii(text)
        
        XCTAssertFalse(matches.isEmpty)
        XCTAssertEqual(matches.first?.type, .phone)
    }
    
    func testPiiRedaction() {
        let text = "Email: test@example.com, Phone: 555-1234"
        let redacted = PiiDetector.redactPii(text)
        
        XCTAssertTrue(redacted.contains("[REDACTED]"))
        XCTAssertFalse(redacted.contains("test@example.com"))
        XCTAssertFalse(redacted.contains("555-1234"))
    }
    
    func testDictionaryRedaction() {
        let data: [String: Any] = [
            "email": "user@example.com",
            "name": "John Doe",
            "phone": "555-1234"
        ]
        
        let redacted = PiiDetector.redactFromDictionary(data)
        
        XCTAssertEqual(redacted["email"] as? String, "[REDACTED]")
        XCTAssertEqual(redacted["phone"] as? String, "[REDACTED]")
    }
}

final class EncryptionManagerTests: XCTestCase {
    func testEncryptionDecryption() throws {
        let manager = EncryptionManager.create()
        let originalText = "Sensitive data to encrypt"
        
        let encrypted = try manager.encrypt(originalText)
        XCTAssertNotEqual(encrypted, originalText)
        
        let decrypted = try manager.decrypt(encrypted)
        XCTAssertEqual(decrypted, originalText)
    }
    
    func testEncryptionConsistency() throws {
        let manager = EncryptionManager.create()
        let text = "Test data"
        
        let encrypted1 = try manager.encrypt(text)
        let encrypted2 = try manager.encrypt(text)
        
        // Same plaintext should produce different ciphertext (due to nonce)
        XCTAssertNotEqual(encrypted1, encrypted2)
        
        // But both should decrypt to same plaintext
        let decrypted1 = try manager.decrypt(encrypted1)
        let decrypted2 = try manager.decrypt(encrypted2)
        XCTAssertEqual(decrypted1, decrypted2)
        XCTAssertEqual(decrypted1, text)
    }
}

final class GdprManagerTests: XCTestCase {
    func testConsentManagement() {
        XCTAssertFalse(GdprManager.hasConsent())
        
        GdprManager.setConsent(true)
        XCTAssertTrue(GdprManager.hasConsent())
        
        GdprManager.setConsent(false)
        XCTAssertFalse(GdprManager.hasConsent())
    }
}

