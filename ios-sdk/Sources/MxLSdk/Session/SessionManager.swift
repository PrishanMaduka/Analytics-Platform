import Foundation

/**
 * Manages user sessions and context.
 */
internal class SessionManager {
    private let configuration: SdkConfiguration
    private let userDefaults: UserDefaults
    
    private var currentSessionId: String?
    private var sessionStartTime: TimeInterval = 0
    private var lastActivityTime: TimeInterval = 0
    
    private let sessionTimeout: TimeInterval = 30 * 60 // 30 minutes
    
    private enum Keys {
        static let sessionId = "mxl_session_id"
        static let userId = "mxl_user_id"
    }
    
    static func create(configuration: SdkConfiguration) -> SessionManager {
        return SessionManager(configuration: configuration)
    }
    
    private init(configuration: SdkConfiguration) {
        self.configuration = configuration
        self.userDefaults = UserDefaults.standard
        startNewSession()
    }
    
    /**
     * Start a new session.
     */
    func startNewSession() {
        let now = Date().timeIntervalSince1970
        
        // Check if current session has expired
        if let sessionId = currentSessionId,
           (now - lastActivityTime) > sessionTimeout {
            endSession()
        }
        
        if currentSessionId == nil {
            currentSessionId = UUID().uuidString
            sessionStartTime = now
            lastActivityTime = now
            
            userDefaults.set(currentSessionId, forKey: Keys.sessionId)
        }
    }
    
    /**
     * End the current session.
     */
    func endSession() {
        currentSessionId = nil
        sessionStartTime = 0
        lastActivityTime = 0
        userDefaults.removeObject(forKey: Keys.sessionId)
    }
    
    /**
     * Get the current session ID.
     */
    func getSessionId() -> String? {
        return currentSessionId
    }
    
    /**
     * Identify a user.
     */
    func identify(userId: String, attributes: [String: Any] = [:]) {
        userDefaults.set(userId, forKey: Keys.userId)
        // TODO: Store user attributes
    }
    
    /**
     * Get the current user ID.
     */
    func getUserId() -> String? {
        return userDefaults.string(forKey: Keys.userId)
    }
    
    /**
     * Called when app comes to foreground.
     */
    func onAppForegrounded() {
        startNewSession()
    }
    
    /**
     * Called when app goes to background.
     */
    func onAppBackgrounded() {
        lastActivityTime = Date().timeIntervalSince1970
    }
}

