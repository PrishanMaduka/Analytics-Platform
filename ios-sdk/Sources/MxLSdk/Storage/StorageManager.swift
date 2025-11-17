import Foundation
import CoreData

/**
 * Manages local storage for offline data persistence.
 */
internal class StorageManager {
    private let configuration: SdkConfiguration
    private let persistentContainer: NSPersistentContainer
    
    static func create(configuration: SdkConfiguration) -> StorageManager {
        let container = NSPersistentContainer(name: "TelemetryDataModel")
        container.loadPersistentStores { _, error in
            if let error = error {
                Logger.shared.error("Error loading persistent store", error: error)
            }
        }
        
        return StorageManager(configuration: configuration, container: container)
    }
    
    private init(configuration: SdkConfiguration, container: NSPersistentContainer) {
        self.configuration = configuration
        self.persistentContainer = container
    }
    
    /**
     * Store telemetry event.
     */
    func storeEvent(eventType: String, eventData: [String: Any]) {
        let context = persistentContainer.viewContext
        
        context.perform {
            // TODO: Create TelemetryEvent entity and save
            // For now, just log
            Logger.shared.debug("Storing event: \(eventType)")
        }
    }
    
    /**
     * Flush pending events to server.
     */
    func flushEvents(completion: @escaping (Bool) -> Void) {
        let context = persistentContainer.viewContext
        
        context.perform {
            // TODO: Fetch pending events and upload
            completion(true)
        }
    }
    
    /**
     * Clean up old events.
     */
    func cleanupOldEvents() {
        let context = persistentContainer.viewContext
        let cutoffDate = Date().addingTimeInterval(-7 * 24 * 60 * 60) // 7 days ago
        
        context.perform {
            // TODO: Delete old events
            Logger.shared.debug("Cleaning up old events")
        }
    }
}
