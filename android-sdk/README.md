# MxL Android SDK

Native Android SDK for telemetry collection, crash reporting, and performance monitoring.

## Features

- Crash & Error Reporting
- Performance Monitoring (startup time, ANRs, CPU/memory)
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

Add to your `build.gradle.kts`:

```kotlin
dependencies {
    implementation("com.adlcom.mxl:sdk:1.0.0")
}
```

## Usage

### Initialize SDK

```kotlin
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        MxLSdk.initialize(
            this,
            SdkConfiguration.Builder()
                .apiKey("your-api-key")
                .endpoint("https://api.mxl.adlcom.com")
                .enableCrashReporting(true)
                .enablePerformanceMonitoring(true)
                .enableNetworkMonitoring(true)
                .build()
        )
    }
}
```

## Requirements

- Android API 21+ (Android 5.0+)
- Kotlin 1.9+
- Java 17+

## License

Copyright © ADLcom Limited

