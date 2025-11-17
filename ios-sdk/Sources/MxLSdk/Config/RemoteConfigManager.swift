import Foundation

/**
 * Manages remote configuration updates.
 */
internal class RemoteConfigManager {
    private let configuration: SdkConfiguration
    private let httpClient: HttpClient
    private let userDefaults: UserDefaults
    
    private enum Keys {
        static let configVersion = "mxl_config_version"
        static let configData = "mxl_config_data"
        static let lastFetch = "mxl_config_last_fetch"
    }
    
    static func create(configuration: SdkConfiguration, httpClient: HttpClient) -> RemoteConfigManager {
        return RemoteConfigManager(configuration: configuration, httpClient: httpClient)
    }
    
    private init(configuration: SdkConfiguration, httpClient: HttpClient) {
        self.configuration = configuration
        self.httpClient = httpClient
        self.userDefaults = UserDefaults.standard
    }
    
    /**
     * Fetch remote configuration.
     */
    func fetchConfig() async {
        do {
            let body = try JSONSerialization.data(withJSONObject: [:])
            let response = try await httpClient.post(path: "/api/v1/config", body: body)
            
            switch response {
            case .success(let data):
                if let configData = try? JSONDecoder().decode(RemoteConfigData.self, from: data) {
                    saveConfig(configData)
                    Logger.shared.info("Remote config fetched: version \(configData.version)")
                }
            case .error(let code, let message):
                Logger.shared.warning("Failed to fetch remote config: \(message)")
            }
        } catch {
            Logger.shared.error("Error fetching remote config", error: error)
        }
    }
    
    /**
     * Get feature flag value.
     */
    func getFeatureFlag(_ key: String, defaultValue: Bool = false) -> Bool {
        let configData = getCachedConfig() ?? nil
        return configData?.featureFlags[key] ?? defaultValue
    }
    
    /**
     * Get sampling rate.
     */
    func getSamplingRate() -> Float {
        let configData = getCachedConfig()
        return configData?.samplingRate ?? configuration.samplingRate
    }
    
    /**
     * Get config value.
     */
    func getConfigValue(_ key: String, defaultValue: String = "") -> String {
        let configData = getCachedConfig()
        return configData?.config[key] ?? defaultValue
    }
    
    /**
     * Save configuration.
     */
    private func saveConfig(_ configData: RemoteConfigData) {
        if let encoded = try? JSONEncoder().encode(configData) {
            userDefaults.set(configData.version, forKey: Keys.configVersion)
            userDefaults.set(encoded, forKey: Keys.configData)
            userDefaults.set(Date().timeIntervalSince1970, forKey: Keys.lastFetch)
        }
    }
    
    /**
     * Get cached configuration.
     */
    private func getCachedConfig() -> RemoteConfigData? {
        guard let data = userDefaults.data(forKey: Keys.configData) else {
            return nil
        }
        
        return try? JSONDecoder().decode(RemoteConfigData.self, from: data)
    }
    
    /**
     * Check if config needs refresh.
     */
    func needsRefresh() -> Bool {
        let lastFetch = userDefaults.double(forKey: Keys.lastFetch)
        let timeSinceFetch = Date().timeIntervalSince1970 - lastFetch
        return timeSinceFetch > 3600 // 1 hour
    }
}

struct RemoteConfigData: Codable {
    let version: Int
    let samplingRate: Float?
    let featureFlags: [String: Bool]
    let config: [String: String]
}

