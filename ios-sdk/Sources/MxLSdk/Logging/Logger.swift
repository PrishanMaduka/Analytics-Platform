import Foundation
import Logging

/**
 * SDK logger for internal logging.
 */
internal class Logger {
    private let logger: Logging.Logger
    private static var sharedInstance: Logger?
    
    static var shared: Logger {
        return sharedInstance ?? Logger(logger: Logging.Logger(label: "com.adlcom.mxl.sdk"))
    }
    
    static func initialize(configuration: SdkConfiguration) -> Logger {
        var logger = Logging.Logger(label: "com.adlcom.mxl.sdk")
        logger.logLevel = .info
        let instance = Logger(logger: logger)
        sharedInstance = instance
        return instance
    }
    
    private init(logger: Logging.Logger) {
        self.logger = logger
    }
    
    func debug(_ message: String) {
        logger.debug("\(message)")
    }
    
    func info(_ message: String) {
        logger.info("\(message)")
    }
    
    func warning(_ message: String) {
        logger.warning("\(message)")
    }
    
    func error(_ message: String, error: Error? = nil) {
        if let error = error {
            logger.error("\(message): \(error.localizedDescription)")
        } else {
            logger.error("\(message)")
        }
    }
}

