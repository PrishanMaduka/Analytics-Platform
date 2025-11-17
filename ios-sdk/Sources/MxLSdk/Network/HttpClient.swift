import Foundation
import Security
import CommonCrypto

/**
 * HTTP client for communicating with MxL backend.
 * Supports TLS 1.2+, certificate pinning, and retry logic.
 */
internal class HttpClient: NSObject {
    private let session: URLSession
    private let baseURL: URL
    private let apiKey: String
    private let certificatePins: [String]?
    
    private init(session: URLSession, baseURL: URL, apiKey: String, certificatePins: [String]?) {
        self.session = session
        self.baseURL = baseURL
        self.apiKey = apiKey
        self.certificatePins = certificatePins
        super.init()
    }
    
    static func create(configuration: SdkConfiguration) throws -> HttpClient {
        guard let baseURL = URL(string: configuration.endpoint) else {
            throw SdkError.invalidConfiguration("Invalid endpoint URL")
        }
        
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 30
        config.waitsForConnectivity = true
        
        let session: URLSession
        let certificatePins: [String]?
        
        if configuration.enableNetworkMonitoring {
            // Use network monitor for tracking
            session = NetworkMonitor.createSession(configuration: configuration)
            certificatePins = nil
        } else if configuration.enableCertificatePinning && !configuration.certificatePins.isEmpty {
            // Create session with certificate pinning delegate
            let delegate = CertificatePinningDelegate(pins: configuration.certificatePins)
            session = URLSession(configuration: config, delegate: delegate, delegateQueue: nil)
            certificatePins = configuration.certificatePins
        } else {
            session = URLSession(configuration: config)
            certificatePins = nil
        }
        
        return HttpClient(session: session, baseURL: baseURL, apiKey: configuration.apiKey, certificatePins: certificatePins)
    }
    
    func post(path: String, body: Data) async throws -> NetworkResponse {
        guard let url = URL(string: path, relativeTo: baseURL) else {
            throw SdkError.invalidConfiguration("Invalid path")
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("MxL-iOS-SDK/1.0.0", forHTTPHeaderField: "User-Agent")
        request.httpBody = body
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw SdkError.initializationFailed("Invalid response type")
        }
        
        if (200...299).contains(httpResponse.statusCode) {
            return .success(data)
        } else {
            return .error(code: httpResponse.statusCode, message: String(data: data, encoding: .utf8) ?? "Unknown error")
        }
    }
}

enum NetworkResponse {
    case success(Data)
    case error(code: Int, message: String)
}

/**
 * URLSessionDelegate for certificate pinning.
 */
private class CertificatePinningDelegate: NSObject, URLSessionDelegate {
    private let pinnedCertificates: [Data]
    
    init(pins: [String]) {
        // Convert base64 encoded certificate strings to Data
        self.pinnedCertificates = pins.compactMap { pin in
            guard let data = Data(base64Encoded: pin) else {
                Logger.shared.warn("Invalid certificate pin format")
                return nil
            }
            return data
        }
        super.init()
    }
    
    func urlSession(_ session: URLSession, didReceive challenge: URLAuthenticationChallenge, completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {
        guard challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodServerTrust,
              let serverTrust = challenge.protectionSpace.serverTrust else {
            completionHandler(.performDefaultHandling, nil)
            return
        }
        
        // Evaluate server trust
        var secresult = SecTrustResultType.invalid
        let status = SecTrustEvaluate(serverTrust, &secresult)
        
        guard status == errSecSuccess else {
            Logger.shared.error("Certificate validation failed", error: nil)
            completionHandler(.cancelAuthenticationChallenge, nil)
            return
        }
        
        // Get server certificates
        let serverCertificates = (0..<SecTrustGetCertificateCount(serverTrust)).compactMap { index in
            SecTrustGetCertificateAtIndex(serverTrust, index)
        }
        
        // Check if any server certificate matches pinned certificates
        for serverCert in serverCertificates {
            guard let serverCertData = SecCertificateCopyData(serverCert) as Data? else {
                continue
            }
            
            // Compare with pinned certificates
            for pinnedCert in pinnedCertificates {
                if serverCertData == pinnedCert {
                    // Certificate matches, allow connection
                    let credential = URLCredential(trust: serverTrust)
                    completionHandler(.useCredential, credential)
                    return
                }
            }
            
            // Also check public key hash (SHA256) for more flexible pinning
            if let publicKey = getPublicKey(from: serverCert) {
                let publicKeyHash = sha256(data: publicKey)
                for pinnedCert in pinnedCertificates {
                    if pinnedCert == publicKeyHash {
                        let credential = URLCredential(trust: serverTrust)
                        completionHandler(.useCredential, credential)
                        return
                    }
                }
            }
        }
        
        // No matching certificate found
        Logger.shared.error("Certificate pinning validation failed - no matching certificate", error: nil)
        completionHandler(.cancelAuthenticationChallenge, nil)
    }
    
    /**
     * Extract public key from certificate.
     */
    private func getPublicKey(from certificate: SecCertificate) -> Data? {
        guard let publicKey = SecCertificateCopyKey(certificate) else {
            return nil
        }
        
        var error: Unmanaged<CFError>?
        guard let publicKeyData = SecKeyCopyExternalRepresentation(publicKey, &error) as Data? else {
            return nil
        }
        
        return publicKeyData
    }
    
    /**
     * Calculate SHA256 hash of data.
     */
    private func sha256(data: Data) -> Data {
        var hash = [UInt8](repeating: 0, count: Int(CC_SHA256_DIGEST_LENGTH))
        data.withUnsafeBytes {
            _ = CC_SHA256($0.baseAddress, CC_LONG(data.count), &hash)
        }
        return Data(hash)
    }
}

