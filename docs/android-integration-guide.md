# Android SDK Integration Guide

## Installation

### Gradle

Add to your `build.gradle.kts`:

```kotlin
dependencies {
    implementation("com.adlcom.mxl:sdk:1.0.0")
}
```

### Maven

```xml
<dependency>
    <groupId>com.adlcom.mxl</groupId>
    <artifactId>sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

## Quick Start

### 1. Initialize SDK

In your `Application` class:

```kotlin
import com.adlcom.mxl.sdk.MxLSdk
import com.adlcom.mxl.sdk.config.SdkConfiguration

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        val config = SdkConfiguration.Builder()
            .apiKey("your-api-key")
            .endpoint("https://api.mxl.adlcom.com")
            .enableCrashReporting(true)
            .enablePerformanceMonitoring(true)
            .enableNetworkMonitoring(true)
            .enableUserTracking(true)
            .samplingRate(1.0f)
            .build()
        
        MxLSdk.initialize(this, config)
    }
}
```

### 2. Register Application

In `AndroidManifest.xml`:

```xml
<application
    android:name=".MyApplication"
    ...>
</application>
```

## Configuration Options

### Basic Configuration

```kotlin
SdkConfiguration.Builder()
    .apiKey("your-api-key")                    // Required
    .endpoint("https://api.mxl.adlcom.com") // Required
    .build()
```

### Advanced Configuration

```kotlin
SdkConfiguration.Builder()
    .apiKey("your-api-key")
    .endpoint("https://api.mxl.adlcom.com")
    
    // Feature toggles
    .enableCrashReporting(true)
    .enablePerformanceMonitoring(true)
    .enableNetworkMonitoring(true)
    .enableUserTracking(true)
    .enableDistributedTracing(true)
    
    // Security
    .enableCertificatePinning(true)
    .certificatePins(listOf("sha256/..."))
    .enablePiiRedaction(true)
    .enableEncryption(true)
    
    // Performance
    .samplingRate(1.0f)              // 0.0 to 1.0
    .batchSize(50)                   // Events per batch
    .flushIntervalSeconds(30)         // Auto-flush interval
    .maxOfflineStorageSize(10 * 1024 * 1024) // 10MB
    
    .build()
```

## Features

### Crash Reporting

Automatic crash reporting is enabled by default. To manually report errors:

```kotlin
import com.adlcom.mxl.sdk.crash.CrashReporter

try {
    // Your code
} catch (e: Exception) {
    CrashReporter.reportError(e, mapOf(
        "context" to "user_action",
        "screen" to "MainActivity"
    ))
}
```

### Performance Monitoring

Performance metrics are automatically collected. To report custom metrics:

```kotlin
import com.adlcom.mxl.sdk.performance.PerformanceMonitor

PerformanceMonitor.reportMetric("custom_metric", 123.45, "ms")

// Get current metrics
val cpuUsage = PerformanceMonitor.getCpuUsage()
val memoryInfo = PerformanceMonitor.getMemoryUsage(context)
val threadCount = PerformanceMonitor.getThreadCount()
```

### User Interaction Tracking

Track screen views:

```kotlin
import com.adlcom.mxl.sdk.interaction.UserInteractionTracker

override fun onResume() {
    super.onResume()
    UserInteractionTracker.trackScreenView(this)
}
```

Track custom events:

```kotlin
UserInteractionTracker.trackEvent("button_clicked", mapOf(
    "button_id" to "login_button",
    "screen" to "LoginActivity"
))
```

### User Identification

```kotlin
import com.adlcom.mxl.sdk.internal.getSdkState

val sdkState = getSdkState()
sdkState?.sessionManager?.identify("user-123", mapOf(
    "name" to "John Doe",
    "email" to "john@example.com"
))
```

### GDPR Compliance

```kotlin
import com.adlcom.mxl.sdk.compliance.GdprManager

// Check consent
if (GdprManager.hasConsent(context)) {
    // Collect data
}

// Set consent
GdprManager.setConsent(context, true)

// Export user data
GdprManager.exportUserData("user-123") { json ->
    // Handle exported data
}

// Delete user data
GdprManager.deleteUserData("user-123") { success ->
    if (success) {
        // Data deleted
    }
}
```

## ProGuard Rules

Add to `proguard-rules.pro`:

```proguard
-keep class com.adlcom.mxl.sdk.** { *; }
-keepclassmembers class com.adlcom.mxl.sdk.** {
    *;
}
-dontwarn okhttp3.**
-dontwarn okio.**
```

## Best Practices

1. **Initialize Early**: Initialize SDK in `Application.onCreate()`
2. **Handle Errors**: Wrap initialization in try-catch
3. **Respect Privacy**: Only collect data with user consent
4. **Test Thoroughly**: Test on various Android versions
5. **Monitor Performance**: Keep an eye on SDK overhead

## Troubleshooting

### SDK Not Initialized

Ensure you're initializing in an `Application` class, not an Activity.

### Events Not Sending

- Check network connectivity
- Verify API key is correct
- Check logs for error messages
- Ensure consent is given (if required)

### High Battery Usage

- Reduce sampling rate
- Increase flush interval
- Disable unnecessary features

## Support

For issues and questions:
- GitHub Issues: https://github.com/adlcom/mxl-android-sdk
- Email: mxl-support@adlcom.com

