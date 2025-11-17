import Foundation
import UIKit

/**
 * Crash reporter for capturing and reporting crashes.
 */
internal class CrashReporter {
    private static var isInitialized = false
    private static var originalExceptionHandler: NSUncaughtExceptionHandler?
    private static var signalHandlers: [Int32: sig_t] = [:]
    
    /**
     * Initialize crash reporting.
     */
    static func initialize(configuration: SdkConfiguration) {
        guard configuration.enableCrashReporting, !isInitialized else {
            return
        }
        
        // Set up exception handler for Objective-C exceptions
        originalExceptionHandler = NSGetUncaughtExceptionHandler()
        NSSetUncaughtExceptionHandler { exception in
            captureException(exception)
            originalExceptionHandler?(exception)
        }
        
        // Set up signal handlers for C/C++ crashes
        setupSignalHandlers()
        
        isInitialized = true
        Logger.shared.info("Crash reporting initialized")
    }
    
    /**
     * Set up signal handlers for native crashes.
     */
    private static func setupSignalHandlers() {
        let signals: [Int32] = [SIGABRT, SIGBUS, SIGFPE, SIGILL, SIGSEGV, SIGTRAP]
        
        for signal in signals {
            signalHandlers[signal] = signal(signal, { signal in
                captureSignal(signal)
                // Re-raise signal with default handler
                signal(signal, SIG_DFL)
                raise(signal)
            })
        }
    }
    
    /**
     * Capture Objective-C exception.
     */
    private static func captureException(_ exception: NSException) {
        let sdkState = MxLSdk.getSdkState()
        guard let sdkState = sdkState else { return }
        
        let stackTrace = exception.callStackSymbols.joined(separator: "\n")
        let threadInfo = getThreadInfo()
        
        let crashEvent = CrashEvent(
            sessionId: sdkState.sessionManager.getSessionId() ?? "unknown",
            userId: sdkState.sessionManager.getUserId(),
            exceptionType: exception.name.rawValue,
            exceptionMessage: exception.reason ?? "",
            stackTrace: stackTrace,
            threadInfo: threadInfo,
            timestamp: Date().timeIntervalSince1970 * 1000,
            deviceInfo: getDeviceInfo()
        )
        
        storeCrash(crashEvent, sdkState: sdkState)
    }
    
    /**
     * Capture signal-based crash.
     */
    private static func captureSignal(_ signal: Int32) {
        let sdkState = MxLSdk.getSdkState()
        guard let sdkState = sdkState else { return }
        
        let signalName = getSignalName(signal)
        let stackTrace = Thread.callStackSymbols.joined(separator: "\n")
        let threadInfo = getThreadInfo()
        
        let crashEvent = CrashEvent(
            sessionId: sdkState.sessionManager.getSessionId() ?? "unknown",
            userId: sdkState.sessionManager.getUserId(),
            exceptionType: "Signal: \(signalName)",
            exceptionMessage: "Application crashed with signal \(signalName)",
            stackTrace: stackTrace,
            threadInfo: threadInfo,
            timestamp: Date().timeIntervalSince1970 * 1000,
            deviceInfo: getDeviceInfo()
        )
        
        storeCrash(crashEvent, sdkState: sdkState)
    }
    
    /**
     * Get signal name.
     */
    private static func getSignalName(_ signal: Int32) -> String {
        switch signal {
        case SIGABRT: return "SIGABRT"
        case SIGBUS: return "SIGBUS"
        case SIGFPE: return "SIGFPE"
        case SIGILL: return "SIGILL"
        case SIGSEGV: return "SIGSEGV"
        case SIGTRAP: return "SIGTRAP"
        default: return "UNKNOWN"
        }
    }
    
    /**
     * Get thread information.
     */
    private static func getThreadInfo() -> ThreadInfo {
        let thread = Thread.current
        return ThreadInfo(
            name: thread.name.isEmpty ? "Main" : thread.name,
            isMainThread: Thread.isMainThread,
            threadNumber: thread.hashValue
        )
    }
    
    /**
     * Get device information.
     */
    private static func getDeviceInfo() -> DeviceInfo {
        let device = UIDevice.current
        let systemVersion = device.systemVersion
        let model = device.model
        let name = device.name
        
        let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "unknown"
        let buildNumber = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "unknown"
        
        return DeviceInfo(
            platform: "iOS",
            osVersion: systemVersion,
            deviceModel: model,
            deviceName: name,
            appVersion: appVersion,
            buildNumber: buildNumber
        )
    }
    
    /**
     * Store crash event.
     */
    private static func storeCrash(_ crashEvent: CrashEvent, sdkState: SdkState) {
        // TODO: Store in database and queue for upload
        Logger.shared.error("Crash captured: \(crashEvent.exceptionType)")
    }
    
    /**
     * Report a custom error manually.
     */
    static func reportError(_ error: Error, context: [String: Any] = [:]) {
        let sdkState = MxLSdk.getSdkState()
        guard let sdkState = sdkState else { return }
        
        let stackTrace = Thread.callStackSymbols.joined(separator: "\n")
        let threadInfo = getThreadInfo()
        
        let crashEvent = CrashEvent(
            sessionId: sdkState.sessionManager.getSessionId() ?? "unknown",
            userId: sdkState.sessionManager.getUserId(),
            exceptionType: String(describing: type(of: error)),
            exceptionMessage: error.localizedDescription,
            stackTrace: stackTrace,
            threadInfo: threadInfo,
            timestamp: Date().timeIntervalSince1970 * 1000,
            deviceInfo: getDeviceInfo(),
            customContext: context
        )
        
        storeCrash(crashEvent, sdkState: sdkState)
    }
}

struct CrashEvent {
    let sessionId: String
    let userId: String?
    let exceptionType: String
    let exceptionMessage: String
    let stackTrace: String
    let threadInfo: ThreadInfo
    let timestamp: TimeInterval
    let deviceInfo: DeviceInfo
    let customContext: [String: Any]
}

struct ThreadInfo {
    let name: String
    let isMainThread: Bool
    let threadNumber: Int
}

struct DeviceInfo {
    let platform: String
    let osVersion: String
    let deviceModel: String
    let deviceName: String
    let appVersion: String
    let buildNumber: String
}

