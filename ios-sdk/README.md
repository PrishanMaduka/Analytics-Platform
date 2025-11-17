# MxL iOS SDK

Native iOS SDK for telemetry collection, crash reporting, and performance monitoring.

## Features

- Crash & Error Reporting
- Performance Monitoring (startup time, UI responsiveness, CPU/memory)
- Network Monitoring
- User Interaction Tracking
- Session & User Context Management
- Custom Logging
- Distributed Tracing (OpenTelemetry)
- Offline Handling & Data Persistence
- Push Notification Analytics
- Remote Configuration
- Data Privacy & Security (PII redaction, AES-256 encryption)

## Installation

### Swift Package Manager

Add to your `Package.swift`:

```swift
dependencies: [
    .package(url: "https://github.com/adlcom/mxl-ios-sdk.git", from: "1.0.0")
]
```

### CocoaPods

Add to your `Podfile`:

```ruby
pod 'MxLSdk', '~> 1.0.0'
```

## Usage

### Initialize SDK

```swift
import MxLSdk

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        do {
            try MxLSdk.initialize(configuration: SdkConfiguration(
                apiKey: "your-api-key",
                endpoint: "https://api.mxl.adlcom.com"
            ))
        } catch {
            print("Failed to initialize MxL SDK: \(error)")
        }
        
        return true
    }
}
```

## Requirements

- iOS 12.0+
- Swift 5.9+
- Xcode 15+

## License

Copyright © ADLcom Limited

