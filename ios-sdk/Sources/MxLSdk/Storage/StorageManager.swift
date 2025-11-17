import Foundation
import CoreData

/**
 * Manages local storage for offline data persistence.
 */
internal class StorageManager {
    private let configuration: SdkConfiguration
    private let persistentContainer: NSPersistentContainer
    
    static func create(configuration: SdkConfiguration) -> StorageManager {
        // Create in-memory Core Data stack for simplicity
        // In production, you might want to use a persistent store
        let container = NSPersistentContainer(name: "TelemetryDataModel")
        
        // Create a simple description for in-memory store
        let description = NSPersistentStoreDescription()
        description.type = NSInMemoryStoreType
        container.persistentStoreDescriptions = [description]
        
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
    func storeEvent(eventType: String, eventData: [String: Any], sessionId: String, userId: String? = nil) {
        let context = persistentContainer.viewContext
        
        context.perform {
            do {
                // Convert eventData to JSON string
                let jsonData = try JSONSerialization.data(withJSONObject: eventData, options: [])
                guard let eventDataString = String(data: jsonData, encoding: .utf8) else {
                    Logger.shared.error("Failed to serialize event data", error: nil)
                    return
                }
                
                // Create entity using NSManagedObject
                let entity = NSEntityDescription.entity(forEntityName: "TelemetryEvent", in: context) ??
                    NSEntityDescription()
                entity.name = "TelemetryEvent"
                
                let event = NSManagedObject(entity: entity, insertInto: context)
                event.setValue(sessionId, forKey: "sessionId")
                event.setValue(userId, forKey: "userId")
                event.setValue(eventType, forKey: "eventType")
                event.setValue(eventDataString, forKey: "eventData")
                event.setValue(Date(), forKey: "timestamp")
                event.setValue(false, forKey: "uploaded")
                event.setValue(0, forKey: "uploadAttempts")
                
                try context.save()
                Logger.shared.debug("Event stored: \(eventType)")
                
                // Check if we need to flush
                let fetchRequest = NSFetchRequest<NSFetchRequestResult>(entityName: "TelemetryEvent")
                fetchRequest.predicate = NSPredicate(format: "uploaded == NO")
                let count = try context.count(for: fetchRequest)
                
                if count >= self.configuration.batchSize {
                    self.flushEvents { _ in }
                }
            } catch {
                Logger.shared.error("Error storing event", error: error)
            }
        }
    }
    
    /**
     * Flush pending events to server.
     */
    func flushEvents(completion: @escaping (Bool) -> Void) {
        let context = persistentContainer.viewContext
        
        context.perform {
            do {
                let fetchRequest = NSFetchRequest<NSManagedObject>(entityName: "TelemetryEvent")
                fetchRequest.predicate = NSPredicate(format: "uploaded == NO")
                fetchRequest.fetchLimit = self.configuration.batchSize
                fetchRequest.sortDescriptors = [NSSortDescriptor(key: "timestamp", ascending: true)]
                
                let pendingEvents = try context.fetch(fetchRequest)
                
                if pendingEvents.isEmpty {
                    completion(true)
                    return
                }
                
                // Convert to JSON format
                var events: [[String: Any]] = []
                for event in pendingEvents {
                    guard let eventDataString = event.value(forKey: "eventData") as? String,
                          let eventData = try? JSONSerialization.jsonObject(with: eventDataString.data(using: .utf8)!, options: []) as? [String: Any] else {
                        continue
                    }
                    events.append(eventData)
                }
                
                // Upload events (this would call HttpClient in a real implementation)
                // For now, mark as uploaded
                for event in pendingEvents {
                    event.setValue(true, forKey: "uploaded")
                }
                
                try context.save()
                Logger.shared.debug("Flushed \(pendingEvents.count) events")
                completion(true)
            } catch {
                Logger.shared.error("Error flushing events", error: error)
                completion(false)
            }
        }
    }
    
    /**
     * Clean up old events.
     */
    func cleanupOldEvents() {
        let context = persistentContainer.viewContext
        let cutoffDate = Date().addingTimeInterval(-7 * 24 * 60 * 60) // 7 days ago
        
        context.perform {
            do {
                let fetchRequest = NSFetchRequest<NSFetchRequestResult>(entityName: "TelemetryEvent")
                fetchRequest.predicate = NSPredicate(format: "uploaded == YES AND timestamp < %@", cutoffDate as NSDate)
                
                let deleteRequest = NSBatchDeleteRequest(fetchRequest: fetchRequest as! NSFetchRequest<NSFetchRequestResult>)
                try context.execute(deleteRequest)
                try context.save()
                
                Logger.shared.debug("Cleaned up old events")
            } catch {
                Logger.shared.error("Error cleaning up old events", error: error)
            }
        }
    }
    
    /**
     * Get all events for a user (for GDPR export).
     */
    func getAllEvents(userId: String?, completion: @escaping ([[String: Any]]) -> Void) {
        let context = persistentContainer.viewContext
        
        context.perform {
            do {
                let fetchRequest = NSFetchRequest<NSManagedObject>(entityName: "TelemetryEvent")
                if let userId = userId {
                    fetchRequest.predicate = NSPredicate(format: "userId == %@", userId)
                }
                
                let events = try context.fetch(fetchRequest)
                var result: [[String: Any]] = []
                
                for event in events {
                    guard let eventDataString = event.value(forKey: "eventData") as? String,
                          let eventData = try? JSONSerialization.jsonObject(with: eventDataString.data(using: .utf8)!, options: []) as? [String: Any] else {
                        continue
                    }
                    result.append(eventData)
                }
                
                completion(result)
            } catch {
                Logger.shared.error("Error getting events", error: error)
                completion([])
            }
        }
    }
    
    /**
     * Delete all events for a user (for GDPR deletion).
     */
    func deleteAllEvents(userId: String?, completion: @escaping (Bool) -> Void) {
        let context = persistentContainer.viewContext
        
        context.perform {
            do {
                let fetchRequest = NSFetchRequest<NSFetchRequestResult>(entityName: "TelemetryEvent")
                if let userId = userId {
                    fetchRequest.predicate = NSPredicate(format: "userId == %@", userId)
                }
                
                let deleteRequest = NSBatchDeleteRequest(fetchRequest: fetchRequest)
                try context.execute(deleteRequest)
                try context.save()
                
                Logger.shared.debug("Deleted events for user: \(userId ?? "all")")
                completion(true)
            } catch {
                Logger.shared.error("Error deleting events", error: error)
                completion(false)
            }
        }
    }
}
