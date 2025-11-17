import Foundation

/**
 * Configuration for the MxL SDK.
 */
public struct SdkConfiguration {
    public let apiKey: String
    public let endpoint: String
    public let enableCrashReporting: Bool
    public let enablePerformanceMonitoring: Bool
    public let enableNetworkMonitoring: Bool
    public let enableUserTracking: Bool
    public let enableDistributedTracing: Bool
    public let enableCertificatePinning: Bool
    public let certificatePins: [String]
    public let samplingRate: Float
    public let batchSize: Int
    public let flushIntervalSeconds: Int
    public let maxOfflineStorageSize: Int64
    public let enablePiiRedaction: Bool
    public let enableEncryption: Bool
    
    public init(
        apiKey: String,
        endpoint: String,
        enableCrashReporting: Bool = true,
        enablePerformanceMonitoring: Bool = true,
        enableNetworkMonitoring: Bool = true,
        enableUserTracking: Bool = true,
        enableDistributedTracing: Bool = true,
        enableCertificatePinning: Bool = false,
        certificatePins: [String] = [],
        samplingRate: Float = 1.0,
        batchSize: Int = 50,
        flushIntervalSeconds: Int = 30,
        maxOfflineStorageSize: Int64 = 10 * 1024 * 1024, // 10MB
        enablePiiRedaction: Bool = true,
        enableEncryption: Bool = true
    ) {
        guard !apiKey.isEmpty else {
            fatalError("API key is required")
        }
        guard !endpoint.isEmpty else {
            fatalError("Endpoint is required")
        }
        guard endpoint.hasPrefix("https://") else {
            fatalError("Endpoint must use HTTPS")
        }
        guard samplingRate >= 0.0 && samplingRate <= 1.0 else {
            fatalError("Sampling rate must be between 0.0 and 1.0")
        }
        guard batchSize > 0 else {
            fatalError("Batch size must be greater than 0")
        }
        guard flushIntervalSeconds > 0 else {
            fatalError("Flush interval must be greater than 0")
        }
        guard maxOfflineStorageSize > 0 else {
            fatalError("Storage size must be greater than 0")
        }
        
        self.apiKey = apiKey
        self.endpoint = endpoint
        self.enableCrashReporting = enableCrashReporting
        self.enablePerformanceMonitoring = enablePerformanceMonitoring
        self.enableNetworkMonitoring = enableNetworkMonitoring
        self.enableUserTracking = enableUserTracking
        self.enableDistributedTracing = enableDistributedTracing
        self.enableCertificatePinning = enableCertificatePinning
        self.certificatePins = certificatePins
        self.samplingRate = samplingRate
        self.batchSize = batchSize
        self.flushIntervalSeconds = flushIntervalSeconds
        self.maxOfflineStorageSize = maxOfflineStorageSize
        self.enablePiiRedaction = enablePiiRedaction
        self.enableEncryption = enableEncryption
    }
}

