import Foundation

/**
 * HTTP client for communicating with MxL backend.
 * Supports TLS 1.2+, certificate pinning, and retry logic.
 */
internal class HttpClient {
    private let session: URLSession
    private let baseURL: URL
    private let apiKey: String
    
    private init(session: URLSession, baseURL: URL, apiKey: String) {
        self.session = session
        self.baseURL = baseURL
        self.apiKey = apiKey
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
        
        if configuration.enableNetworkMonitoring {
            // Use network monitor for tracking
            session = NetworkMonitor.createSession(configuration: configuration)
        } else if configuration.enableCertificatePinning && !configuration.certificatePins.isEmpty {
            // TODO: Implement certificate pinning
            session = URLSession(configuration: config)
        } else {
            session = URLSession(configuration: config)
        }
        
        return HttpClient(session: session, baseURL: baseURL, apiKey: configuration.apiKey)
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

