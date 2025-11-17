import Foundation

/**
 * Distributed tracing manager using OpenTelemetry.
 * Note: This is a simplified implementation. In production, integrate with OpenTelemetry Swift SDK.
 */
internal class TracingManager {
    private let configuration: SdkConfiguration
    private var currentSpans: [String: Span] = [:]
    private let spanQueue = DispatchQueue(label: "com.adlcom.mxl.tracing")
    
    static func create(configuration: SdkConfiguration) -> TracingManager? {
        guard configuration.enableDistributedTracing else {
            return nil
        }
        
        return TracingManager(configuration: configuration)
    }
    
    private init(configuration: SdkConfiguration) {
        self.configuration = configuration
        Logger.shared.info("Distributed tracing initialized")
    }
    
    /**
     * Start a new span.
     */
    func startSpan(name: String) -> Span {
        let traceId = generateTraceId()
        let spanId = generateSpanId()
        let span = Span(name: name, traceId: traceId, spanId: spanId, startTime: Date())
        
        spanQueue.sync {
            currentSpans[spanId] = span
        }
        
        return span
    }
    
    /**
     * Get current span.
     */
    func getCurrentSpan() -> Span? {
        return spanQueue.sync {
            // Return the most recently started span
            currentSpans.values.max(by: { $0.startTime < $1.startTime })
        }
    }
    
    /**
     * Add attribute to current span.
     */
    func addAttribute(key: String, value: String) {
        guard let span = getCurrentSpan() else { return }
        
        spanQueue.sync {
            if var updatedSpan = currentSpans[span.spanId ?? ""] {
                if updatedSpan.attributes == nil {
                    updatedSpan.attributes = [:]
                }
                updatedSpan.attributes?[key] = value
                currentSpans[span.spanId ?? ""] = updatedSpan
            }
        }
    }
    
    /**
     * Add event to current span.
     */
    func addEvent(name: String) {
        guard let span = getCurrentSpan() else { return }
        
        spanQueue.sync {
            if var updatedSpan = currentSpans[span.spanId ?? ""] {
                if updatedSpan.events == nil {
                    updatedSpan.events = []
                }
                updatedSpan.events?.append(SpanEvent(name: name, timestamp: Date()))
                currentSpans[span.spanId ?? ""] = updatedSpan
            }
        }
    }
    
    /**
     * End span.
     */
    func endSpan(_ span: Span) {
        spanQueue.sync {
            if var endedSpan = currentSpans[span.spanId ?? ""] {
                endedSpan.endTime = Date()
                endedSpan.duration = endedSpan.endTime?.timeIntervalSince(endedSpan.startTime) ?? 0
                
                // Store span for export
                storeSpan(endedSpan)
                
                // Remove from current spans
                currentSpans.removeValue(forKey: span.spanId ?? "")
            }
        }
    }
    
    /**
     * Get trace context for HTTP headers (W3C Trace Context format).
     */
    func getTraceContext() -> [String: String] {
        guard let span = getCurrentSpan(),
              let traceId = span.traceId,
              let spanId = span.spanId else {
            return [:]
        }
        
        // W3C Trace Context format: traceparent: 00-{traceId}-{spanId}-{flags}
        let flags = "01" // sampled
        let traceparent = "00-\(traceId)-\(spanId)-\(flags)"
        
        return ["traceparent": traceparent]
    }
    
    /**
     * Extract trace context from headers.
     */
    func extractTraceContext(headers: [String: String]) -> Span? {
        guard let traceparent = headers["traceparent"] ?? headers["Traceparent"] else {
            return nil
        }
        
        // Parse W3C Trace Context: 00-{traceId}-{spanId}-{flags}
        let parts = traceparent.split(separator: "-")
        guard parts.count >= 4,
              parts[0] == "00",
              let traceId = String(parts[1]) as String?,
              let spanId = String(parts[2]) as String? else {
            return nil
        }
        
        return Span(name: "extracted", traceId: traceId, spanId: spanId, startTime: Date())
    }
    
    /**
     * Store span for export.
     */
    private func storeSpan(_ span: Span) {
        // In production, this would export to OpenTelemetry collector
        // For now, store as telemetry event
        let sdkState = MxLSdk.getSdkState()
        guard let sdkState = sdkState else { return }
        
        let eventData: [String: Any] = [
            "name": span.name,
            "traceId": span.traceId ?? "",
            "spanId": span.spanId ?? "",
            "duration": span.duration ?? 0,
            "attributes": span.attributes ?? [:],
            "events": (span.events ?? []).map { ["name": $0.name, "timestamp": $0.timestamp.timeIntervalSince1970] }
        ]
        
        sdkState.storageManager.storeEvent(
            eventType: "trace",
            eventData: eventData,
            sessionId: sdkState.sessionManager.getSessionId() ?? "unknown",
            userId: sdkState.sessionManager.getUserId()
        )
    }
    
    /**
     * Generate trace ID (32 hex characters).
     */
    private func generateTraceId() -> String {
        return generateRandomHexString(length: 32)
    }
    
    /**
     * Generate span ID (16 hex characters).
     */
    private func generateSpanId() -> String {
        return generateRandomHexString(length: 16)
    }
    
    /**
     * Generate random hex string.
     */
    private func generateRandomHexString(length: Int) -> String {
        let characters = "0123456789abcdef"
        return String((0..<length).map { _ in characters.randomElement()! })
    }
}

struct Span {
    let name: String
    var traceId: String?
    var spanId: String?
    let startTime: Date
    var endTime: Date?
    var duration: TimeInterval?
    var attributes: [String: String]?
    var events: [SpanEvent]?
    
    init(name: String, traceId: String? = nil, spanId: String? = nil, startTime: Date = Date()) {
        self.name = name
        self.traceId = traceId
        self.spanId = spanId
        self.startTime = startTime
    }
}

struct SpanEvent {
    let name: String
    let timestamp: Date
}

