import Foundation

/**
 * Network monitor for tracking network requests and responses.
 */
internal class NetworkMonitor: NSObject, URLSessionTaskDelegate {
    private let configuration: SdkConfiguration
    private var taskMetrics: [Int: URLSessionTaskMetrics] = [:]
    
    init(configuration: SdkConfiguration) {
        self.configuration = configuration
        super.init()
    }
    
    /**
     * Create URLSession with monitoring.
     */
    static func createSession(configuration: SdkConfiguration) -> URLSession {
        let sessionConfig = URLSessionConfiguration.default
        let monitor = NetworkMonitor(configuration: configuration)
        
        return URLSession(
            configuration: sessionConfig,
            delegate: monitor,
            delegateQueue: nil
        )
    }
    
    // MARK: - URLSessionTaskDelegate
    
    func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        guard configuration.enableNetworkMonitoring else { return }
        
        let sdkState = MxLSdk.getSdkState()
        guard let sdkState = sdkState else { return }
        
        guard let request = task.originalRequest,
              let url = request.url else {
            return
        }
        
        let metrics = taskMetrics[task.taskIdentifier]
        let response = task.response as? HTTPURLResponse
        
        let startTime = metrics?.taskInterval.start ?? Date()
        let endTime = metrics?.taskInterval.end ?? Date()
        let duration = (endTime.timeIntervalSince(startTime) * 1000) // Convert to milliseconds
        
        let requestSize = request.httpBody?.count ?? 0
        var responseSize = 0
        
        if let response = response,
           let contentLength = response.value(forHTTPHeaderField: "Content-Length"),
           let length = Int(contentLength) {
            responseSize = length
        }
        
        let networkEvent = NetworkEvent(
            sessionId: sdkState.sessionManager.getSessionId() ?? "unknown",
            userId: sdkState.sessionManager.getUserId(),
            url: url.absoluteString,
            method: request.httpMethod ?? "GET",
            statusCode: response?.statusCode ?? -1,
            isSuccess: (200...299).contains(response?.statusCode ?? 0),
            requestSize: Int64(requestSize),
            responseSize: Int64(responseSize),
            duration: Int64(duration),
            timestamp: Date().timeIntervalSince1970 * 1000,
            error: error?.localizedDescription,
            headers: request.allHTTPHeaderFields ?? [:]
        )
        
        storeNetworkEvent(networkEvent, sdkState: sdkState)
        
        // Clean up
        taskMetrics.removeValue(forKey: task.taskIdentifier)
    }
    
    func urlSession(_ session: URLSession, task: URLSessionTask, didFinishCollecting metrics: URLSessionTaskMetrics) {
        taskMetrics[task.taskIdentifier] = metrics
    }
    
    /**
     * Store network event.
     */
    private func storeNetworkEvent(_ event: NetworkEvent, sdkState: SdkState) {
        // TODO: Store in database and queue for upload
        Logger.shared.debug("Network event: \(event.method) \(event.url) - \(event.statusCode) (\(event.duration)ms)")
    }
}

struct NetworkEvent {
    let sessionId: String
    let userId: String?
    let url: String
    let method: String
    let statusCode: Int
    let isSuccess: Bool
    let requestSize: Int64
    let responseSize: Int64
    let duration: Int64
    let timestamp: TimeInterval
    let error: String?
    let headers: [String: String]
}

