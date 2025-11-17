import Foundation
import UIKit
import Darwin
import UserNotifications

/**
 * Internal SDK initializer that sets up all SDK components.
 */
internal struct SdkInitializer {
    static func initialize(configuration: SdkConfiguration) throws -> SdkState {
        let logger = Logger.initialize(configuration: configuration)
        let httpClient = try HttpClient.create(configuration: configuration)
        let storageManager = StorageManager.create(configuration: configuration)
        let sessionManager = SessionManager.create(configuration: configuration)
        
        // Initialize crash reporting
        CrashReporter.initialize(configuration: configuration)
        
        // Initialize performance monitoring
        PerformanceMonitor.initialize(configuration: configuration)
        
        // Initialize user interaction tracking
        UserInteractionTracker.initialize(configuration: configuration)
        
        // Initialize push notification tracking
        PushNotificationTracker.initialize(configuration: configuration)
        
        // Initialize remote config
        let remoteConfigManager = RemoteConfigManager.create(configuration: configuration, httpClient: httpClient)
        if remoteConfigManager.needsRefresh() {
            Task {
                await remoteConfigManager.fetchConfig()
            }
        }
        
        // Initialize distributed tracing
        let tracingManager = TracingManager.create(configuration: configuration)
        
        // Register app lifecycle notifications
        NotificationCenter.default.addObserver(
            forName: UIApplication.didBecomeActiveNotification,
            object: nil,
            queue: .main
        ) { _ in
            sessionManager.onAppForegrounded()
        }
        
        NotificationCenter.default.addObserver(
            forName: UIApplication.didEnterBackgroundNotification,
            object: nil,
            queue: .main
        ) { _ in
            sessionManager.onAppBackgrounded()
        }
        
        return SdkState(
            configuration: configuration,
            httpClient: httpClient,
            storageManager: storageManager,
            sessionManager: sessionManager,
            logger: logger
        )
    }
}

/**
 * SDK state holder containing all initialized components.
 */
internal struct SdkState {
    let configuration: SdkConfiguration
    let httpClient: HttpClient
    let storageManager: StorageManager
    let sessionManager: SessionManager
    let logger: Logger
}

