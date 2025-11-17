# iOS SDK Integration Guide

## Installation

### Swift Package Manager

1. In Xcode, go to **File > Add Packages**
2. Enter repository URL: `https://github.com/adlcom/mxl-ios-sdk`
3. Select version: `1.0.0`
4. Add to your target

### CocoaPods

Add to your `Podfile`:

```ruby
pod 'MxLSdk', '~> 1.0.0'
```

Then run:
```bash
pod install
```

## Quick Start

### 1. Initialize SDK

In your `AppDelegate.swift`:

```swift
import MxLSdk

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, 
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        let config = SdkConfiguration(
            apiKey: "your-api-key",
            endpoint: "https://api.mxl.adlcom.com"
        )
        
        do {
            try MxLSdk.initialize(configuration: config)
        } catch {
            print("Failed to initialize MxL SDK: \(error)")
        }
        
        return true
    }
}
```

### 2. Configure Info.plist

Add network permissions if needed:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
</dict>
```

## Configuration Options

### Basic Configuration

```swift
let config = SdkConfiguration(
    apiKey: "your-api-key",
    endpoint: "https://api.mxl.adlcom.com"
)
```

### Advanced Configuration

```swift
let config = SdkConfiguration(
    apiKey: "your-api-key",
    endpoint: "https://api.mxl.adlcom.com",
    
    // Feature toggles
    enableCrashReporting: true,
    enablePerformanceMonitoring: true,
    enableNetworkMonitoring: true,
    enableUserTracking: true,
    enableDistributedTracing: true,
    
    // Security
    enableCertificatePinning: true,
    certificatePins: ["sha256/..."],
    enablePiiRedaction: true,
    enableEncryption: true,
    
    // Performance
    samplingRate: 1.0,              // 0.0 to 1.0
    batchSize: 50,
    flushIntervalSeconds: 30,
    maxOfflineStorageSize: 10 * 1024 * 1024  // 10MB
)
```

## Features

### Crash Reporting

Automatic crash reporting is enabled by default. To manually report errors:

```swift
import MxLSdk

do {
    // Your code
} catch {
    CrashReporter.reportError(error, context: [
        "context": "user_action",
        "screen": "MainViewController"
    ])
}
```

### Performance Monitoring

Performance metrics are automatically collected. To report custom metrics:

```swift
import MxLSdk

PerformanceMonitor.reportMetric("custom_metric", value: 123.45, unit: "ms")

// Get current metrics
let cpuUsage = PerformanceMonitor.getCpuUsage()
let memoryInfo = PerformanceMonitor.getMemoryUsage()
let threadCount = PerformanceMonitor.getThreadCount()
```

### User Interaction Tracking

Track screen views:

```swift
import MxLSdk

override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    UserInteractionTracker.trackScreenView(self)
}
```

Track custom events:

```swift
UserInteractionTracker.trackEvent("button_clicked", properties: [
    "button_id": "login_button",
    "screen": "LoginViewController"
])
```

### User Identification

```swift
let sdkState = MxLSdk.getSdkState()
sdkState?.sessionManager.identify(userId: "user-123", attributes: [
    "name": "John Doe",
    "email": "john@example.com"
])
```

### GDPR Compliance

```swift
import MxLSdk

// Check consent
if GdprManager.hasConsent() {
    // Collect data
}

// Set consent
GdprManager.setConsent(true)

// Export user data
Task {
    if let data = await GdprManager.exportUserData(userId: "user-123") {
        // Handle exported data
    }
}

// Delete user data
Task {
    let success = await GdprManager.deleteUserData(userId: "user-123")
    if success {
        // Data deleted
    }
}
```

## Requirements

- iOS 12.0+
- Swift 5.9+
- Xcode 15+

## Best Practices

1. **Initialize Early**: Initialize SDK in `AppDelegate.didFinishLaunching`
2. **Handle Errors**: Use do-catch for initialization
3. **Respect Privacy**: Only collect data with user consent
4. **Test Thoroughly**: Test on various iOS versions and devices
5. **Monitor Performance**: Keep an eye on SDK overhead

## Troubleshooting

### SDK Not Initialized

Ensure you're initializing in `AppDelegate`, not a view controller.

### Events Not Sending

- Check network connectivity
- Verify API key is correct
- Check console logs for errors
- Ensure consent is given (if required)

### High Battery Usage

- Reduce sampling rate
- Increase flush interval
- Disable unnecessary features

## Support

For issues and questions:
- GitHub Issues: https://github.com/adlcom/mxl-ios-sdk
- Email: mxl-support@adlcom.com

