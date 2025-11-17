import Foundation
import UIKit

/**
 * Performance monitor for tracking app performance metrics.
 */
internal class PerformanceMonitor {
    private static var isInitialized = false
    private static var appLaunchTime: TimeInterval = 0
    private static var displayLink: CADisplayLink?
    private static var lastFrameTime: CFTimeInterval = 0
    private static var frameDropCount: Int = 0
    
    /**
     * Initialize performance monitoring.
     */
    static func initialize(configuration: SdkConfiguration) {
        guard configuration.enablePerformanceMonitoring, !isInitialized else {
            return
        }
        
        appLaunchTime = Date().timeIntervalSince1970
        
        // Track app launch time
        trackAppLaunchTime()
        
        // Start frame monitoring
        startFrameMonitoring()
        
        // Start resource monitoring
        startResourceMonitoring()
        
        isInitialized = true
        Logger.shared.info("Performance monitoring initialized")
    }
    
    /**
     * Track app launch time.
     */
    private static func trackAppLaunchTime() {
        // Measure time from app launch to first view appearance
        NotificationCenter.default.addObserver(
            forName: UIApplication.didFinishLaunchingNotification,
            object: nil,
            queue: .main
        ) { _ in
            let launchTime = Date().timeIntervalSince1970 - appLaunchTime
            reportStartupTime(launchTime)
        }
    }
    
    /**
     * Report startup time.
     */
    private static func reportStartupTime(_ startupTime: TimeInterval) {
        let sdkState = MxLSdk.getSdkState()
        guard let sdkState = sdkState else { return }
        
        let performanceEvent = PerformanceEvent(
            sessionId: sdkState.sessionManager.getSessionId() ?? "unknown",
            userId: sdkState.sessionManager.getUserId(),
            eventType: "startup",
            metric: "startup_time",
            value: startupTime * 1000, // Convert to milliseconds
            unit: "ms",
            timestamp: Date().timeIntervalSince1970 * 1000,
            deviceInfo: getDeviceInfo()
        )
        
        storePerformanceEvent(performanceEvent, sdkState: sdkState)
    }
    
    /**
     * Start frame monitoring for UI performance.
     */
    private static func startFrameMonitoring() {
        displayLink = CADisplayLink(target: DisplayLinkTarget(), selector: #selector(DisplayLinkTarget.tick))
        displayLink?.add(to: .main, forMode: .common)
        lastFrameTime = CACurrentMediaTime()
    }
    
    /**
     * Start resource monitoring (CPU, memory).
     */
    private static func startResourceMonitoring() {
        // Monitor resources periodically
        // TODO: Implement periodic monitoring
        Logger.shared.info("Resource monitoring started")
    }
    
    /**
     * Get current CPU usage.
     */
    static func getCpuUsage() -> Double {
        var info = mach_task_basic_info()
        var count = mach_msg_type_number_t(MemoryLayout<mach_task_basic_info>.size) / 4
        
        let result = withUnsafeMutablePointer(to: &info) {
            $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
                task_info(mach_task_self_, task_flavor_t(MACH_TASK_BASIC_INFO), $0, &count)
            }
        }
        
        guard result == KERN_SUCCESS else {
            return 0.0
        }
        
        // Simplified CPU usage calculation
        return Double(info.resident_size) / 1024.0 / 1024.0 // MB
    }
    
    /**
     * Get current memory usage.
     */
    static func getMemoryUsage() -> MemoryInfo {
        var info = mach_task_basic_info()
        var count = mach_msg_type_number_t(MemoryLayout<mach_task_basic_info>.size) / 4
        
        let result = withUnsafeMutablePointer(to: &info) {
            $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
                task_info(mach_task_self_, task_flavor_t(MACH_TASK_BASIC_INFO), $0, &count)
            }
        }
        
        guard result == KERN_SUCCESS else {
            return MemoryInfo(virtualSize: 0, residentSize: 0)
        }
        
        return MemoryInfo(
            virtualSize: info.virtual_size,
            residentSize: info.resident_size
        )
    }
    
    /**
     * Get thread count.
     */
    static func getThreadCount() -> Int {
        var info = mach_task_basic_info()
        var count = mach_msg_type_number_t(MemoryLayout<mach_task_basic_info>.size) / 4
        
        let result = withUnsafeMutablePointer(to: &info) {
            $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
                task_info(mach_task_self_, task_flavor_t(MACH_TASK_BASIC_INFO), $0, &count)
            }
        }
        
        guard result == KERN_SUCCESS else {
            return 0
        }
        
        // Get thread count from task info
        var threadList: thread_act_array_t?
        var threadCount: mach_msg_type_number_t = 0
        
        task_threads(mach_task_self(), &threadList, &threadCount)
        
        if let threadList = threadList {
            vm_deallocate(mach_task_self(), vm_address_t(bitPattern: threadList), vm_size_t(threadCount * MemoryLayout<thread_t>.size))
        }
        
        return Int(threadCount)
    }
    
    /**
     * Report performance metric.
     */
    static func reportMetric(_ metric: String, value: Double, unit: String = "") {
        let sdkState = MxLSdk.getSdkState()
        guard let sdkState = sdkState else { return }
        
        let performanceEvent = PerformanceEvent(
            sessionId: sdkState.sessionManager.getSessionId() ?? "unknown",
            userId: sdkState.sessionManager.getUserId(),
            eventType: "custom",
            metric: metric,
            value: value,
            unit: unit,
            timestamp: Date().timeIntervalSince1970 * 1000,
            deviceInfo: getDeviceInfo()
        )
        
        storePerformanceEvent(performanceEvent, sdkState: sdkState)
    }
    
    /**
     * Store performance event.
     */
    private static func storePerformanceEvent(_ event: PerformanceEvent, sdkState: SdkState) {
        // TODO: Store in database and queue for upload
        Logger.shared.debug("Performance event: \(event.metric) = \(event.value) \(event.unit)")
    }
    
    /**
     * Get device information.
     */
    private static func getDeviceInfo() -> DeviceInfo {
        let device = UIDevice.current
        let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "unknown"
        
        return DeviceInfo(
            platform: "iOS",
            osVersion: device.systemVersion,
            deviceModel: device.model,
            appVersion: appVersion
        )
    }
    
    /**
     * Stop monitoring.
     */
    static func stop() {
        displayLink?.invalidate()
        displayLink = nil
    }
}

/**
 * Display link target for frame monitoring.
 */
private class DisplayLinkTarget: NSObject {
    @objc func tick() {
        let currentTime = CACurrentMediaTime()
        let frameTime = currentTime - PerformanceMonitor.lastFrameTime
        
        // Check for frame drops (target 60 FPS = 16.67ms per frame)
        if frameTime > 0.017 { // More than 17ms indicates a dropped frame
            PerformanceMonitor.frameDropCount += 1
        }
        
        PerformanceMonitor.lastFrameTime = currentTime
    }
}

struct PerformanceEvent {
    let sessionId: String
    let userId: String?
    let eventType: String
    let metric: String
    let value: Double
    let unit: String
    let timestamp: TimeInterval
    let deviceInfo: DeviceInfo
}

struct MemoryInfo {
    let virtualSize: UInt64
    let residentSize: UInt64
}

struct DeviceInfo {
    let platform: String
    let osVersion: String
    let deviceModel: String
    let appVersion: String
}

