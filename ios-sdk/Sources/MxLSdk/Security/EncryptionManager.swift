import Foundation
import CryptoKit

/**
 * AES-256 encryption manager for data at rest.
 */
internal class EncryptionManager {
    private let key: SymmetricKey
    
    private enum Keys {
        static let encryptionKey = "mxl_encryption_key"
    }
    
    static func create() -> EncryptionManager {
        return EncryptionManager()
    }
    
    private init() {
        // Get or generate encryption key
        if let keyData = UserDefaults.standard.data(forKey: Keys.encryptionKey),
           let key = try? SymmetricKey(data: keyData) {
            self.key = key
        } else {
            // Generate new key
            let key = SymmetricKey(size: .bits256)
            UserDefaults.standard.set(key.withUnsafeBytes { Data($0) }, forKey: Keys.encryptionKey)
            self.key = key
        }
    }
    
    /**
     * Encrypt data.
     */
    func encrypt(_ data: String) throws -> String {
        let dataToEncrypt = data.data(using: .utf8)!
        let sealedBox = try AES.GCM.seal(dataToEncrypt, using: key)
        
        // Combine nonce and ciphertext
        let combined = sealedBox.nonce.withUnsafeBytes { Data($0) } + sealedBox.ciphertext + sealedBox.tag
        return combined.base64EncodedString()
    }
    
    /**
     * Decrypt data.
     */
    func decrypt(_ encryptedData: String) throws -> String {
        guard let combined = Data(base64Encoded: encryptedData) else {
            throw EncryptionError.invalidData
        }
        
        // Extract nonce (12 bytes), tag (16 bytes), and ciphertext
        let nonceData = combined.prefix(12)
        let tagData = combined.suffix(16)
        let ciphertextData = combined.dropFirst(12).dropLast(16)
        
        let nonce = try AES.GCM.Nonce(data: nonceData)
        let sealedBox = try AES.GCM.SealedBox(nonce: nonce, ciphertext: ciphertextData, tag: tagData)
        
        let decryptedData = try AES.GCM.open(sealedBox, using: key)
        return String(data: decryptedData, encoding: .utf8)!
    }
    
    /**
     * Encrypt bytes.
     */
    func encryptBytes(_ data: Data) throws -> Data {
        let sealedBox = try AES.GCM.seal(data, using: key)
        let combined = sealedBox.nonce.withUnsafeBytes { Data($0) } + sealedBox.ciphertext + sealedBox.tag
        return combined
    }
    
    /**
     * Decrypt bytes.
     */
    func decryptBytes(_ encryptedData: Data) throws -> Data {
        let nonceData = encryptedData.prefix(12)
        let tagData = encryptedData.suffix(16)
        let ciphertextData = encryptedData.dropFirst(12).dropLast(16)
        
        let nonce = try AES.GCM.Nonce(data: nonceData)
        let sealedBox = try AES.GCM.SealedBox(nonce: nonce, ciphertext: ciphertextData, tag: tagData)
        
        return try AES.GCM.open(sealedBox, using: key)
    }
}

enum EncryptionError: Error {
    case invalidData
    case encryptionFailed
    case decryptionFailed
}

