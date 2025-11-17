import Foundation
import UIKit

/**
 * User interaction tracker for capturing user gestures and screen views.
 */
internal class UserInteractionTracker {
    private static var isInitialized = false
    private static var trackedViewControllers = Set<String>()
    
    /**
     * Initialize user interaction tracking.
     */
    static func initialize(configuration: SdkConfiguration) {
        guard configuration.enableUserTracking, !isInitialized else {
            return
        }
        
        isInitialized = true
        Logger.shared.info("User interaction tracking initialized")
    }
    
    /**
     * Track screen view for a view controller.
     */
    static func trackScreenView(_ viewController: UIViewController) {
        let sdkState = MxLSdk.getSdkState()
        guard let sdkState = sdkState, sdkState.configuration.enableUserTracking else {
            return
        }
        
        let viewControllerName = String(describing: type(of: viewController))
        guard !trackedViewControllers.contains(viewControllerName) else {
            return
        }
        
        trackedViewControllers.insert(viewControllerName)
        
        let screenViewEvent = ScreenViewEvent(
            sessionId: sdkState.sessionManager.getSessionId() ?? "unknown",
            userId: sdkState.sessionManager.getUserId(),
            screenName: viewControllerName,
            screenClass: String(describing: type(of: viewController)),
            timestamp: Date().timeIntervalSince1970 * 1000
        )
        
        storeScreenView(screenViewEvent, sdkState: sdkState)
    }
    
    /**
     * Track tap event.
     */
    static func trackTap(view: UIView, location: CGPoint) {
        let sdkState = MxLSdk.getSdkState()
        guard let sdkState = sdkState, sdkState.configuration.enableUserTracking else {
            return
        }
        
        let viewClass = String(describing: type(of: view))
        let viewTag = view.tag
        
        let tapEvent = TapEvent(
            sessionId: sdkState.sessionManager.getSessionId() ?? "unknown",
            userId: sdkState.sessionManager.getUserId(),
            viewTag: viewTag != 0 ? String(viewTag) : nil,
            viewClass: viewClass,
            x: Double(location.x),
            y: Double(location.y),
            timestamp: Date().timeIntervalSince1970 * 1000
        )
        
        storeTapEvent(tapEvent, sdkState: sdkState)
    }
    
    /**
     * Track custom event.
     */
    static func trackEvent(_ eventName: String, properties: [String: Any] = [:]) {
        let sdkState = MxLSdk.getSdkState()
        guard let sdkState = sdkState, sdkState.configuration.enableUserTracking else {
            return
        }
        
        let customEvent = CustomEvent(
            sessionId: sdkState.sessionManager.getSessionId() ?? "unknown",
            userId: sdkState.sessionManager.getUserId(),
            eventName: eventName,
            properties: properties,
            timestamp: Date().timeIntervalSince1970 * 1000
        )
        
        storeCustomEvent(customEvent, sdkState: sdkState)
    }
    
    /**
     * Store screen view event.
     */
    private static func storeScreenView(_ event: ScreenViewEvent, sdkState: SdkState) {
        // TODO: Store in database
        Logger.shared.debug("Screen view: \(event.screenName)")
    }
    
    /**
     * Store tap event.
     */
    private static func storeTapEvent(_ event: TapEvent, sdkState: SdkState) {
        // TODO: Store in database
        Logger.shared.debug("Tap event: \(event.viewClass) at (\(event.x), \(event.y))")
    }
    
    /**
     * Store custom event.
     */
    private static func storeCustomEvent(_ event: CustomEvent, sdkState: SdkState) {
        // TODO: Store in database
        Logger.shared.debug("Custom event: \(event.eventName)")
    }
}

struct ScreenViewEvent {
    let sessionId: String
    let userId: String?
    let screenName: String
    let screenClass: String
    let timestamp: TimeInterval
}

struct TapEvent {
    let sessionId: String
    let userId: String?
    let viewTag: String?
    let viewClass: String
    let x: Double
    let y: Double
    let timestamp: TimeInterval
}

struct CustomEvent {
    let sessionId: String
    let userId: String?
    let eventName: String
    let properties: [String: Any]
    let timestamp: TimeInterval
}

