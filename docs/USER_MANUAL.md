# MxL Mobile SDK - Complete User Manual

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Android SDK Guide](#android-sdk-guide)
4. [iOS SDK Guide](#ios-sdk-guide)
5. [Configuration](#configuration)
6. [Features & Usage](#features--usage)
7. [API Reference](#api-reference)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## Introduction

The MxL (Monitoring Experience Layer) Mobile SDK is a comprehensive telemetry and monitoring solution for Android and iOS applications. It provides crash reporting, performance monitoring, network tracking, user interaction analytics, and distributed tracing capabilities.

### Key Features

- **Crash & Error Reporting**: Automatic crash detection with stack traces
- **Performance Monitoring**: CPU, memory, startup time, frame rate tracking
- **Network Monitoring**: Request/response tracking, latency measurement
- **User Interaction Tracking**: Screen views, taps, custom events
- **Distributed Tracing**: OpenTelemetry integration for cross-service tracing
- **GDPR Compliance**: Data export, deletion, and anonymization
- **Offline Support**: Local storage with automatic retry
- **Security**: PII redaction, encryption, certificate pinning

### Supported Platforms

- **Android**: API 21+ (Android 5.0+)
- **iOS**: iOS 12.0+

---

## Getting Started

### Prerequisites

- Android Studio (for Android development)
- Xcode 15+ (for iOS development)
- API key from ADLcom (contact mxl-support@adlcom.com)
- Backend endpoint URL

### Quick Start

**Android:**
```kotlin
// In your Application class
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        MxLSdk.initialize(
            this,
            SdkConfiguration.Builder()
                .apiKey("your-api-key")
                .endpoint("https://api.mxl.adlcom.com")
                .build()
        )
    }
}
```

**iOS:**
```swift
// In your AppDelegate
import MxLSdk

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, 
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
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

---

## Android SDK Guide

### Installation

#### Option 1: Maven Central (Recommended)

Add to your `build.gradle.kts`:

```kotlin
dependencies {
    implementation("com.adlcom.mxl:sdk:1.0.0")
}
```

#### Option 2: Local AAR

1. Download the AAR file
2. Place in `libs/` directory
3. Add to `build.gradle.kts`:

```kotlin
dependencies {
    implementation(files("libs/mxl-sdk.aar"))
}
```

### Initialization

Initialize the SDK in your `Application` class:

```kotlin
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
            .enableDistributedTracing(true)
            .samplingRate(1.0f) // 100% of events
            .batchSize(50) // Upload in batches of 50
            .flushIntervalSeconds(30) // Flush every 30 seconds
            .maxOfflineStorageSize(10 * 1024 * 1024) // 10MB
            .enablePiiRedaction(true)
            .enableEncryption(true)
            .build()
        
        MxLSdk.initialize(this, config)
    }
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | String | Required | Your API key |
| `endpoint` | String | Required | Backend API endpoint |
| `enableCrashReporting` | Boolean | true | Enable crash detection |
| `enablePerformanceMonitoring` | Boolean | true | Enable performance tracking |
| `enableNetworkMonitoring` | Boolean | true | Enable network tracking |
| `enableUserTracking` | Boolean | true | Enable user interaction tracking |
| `enableDistributedTracing` | Boolean | true | Enable OpenTelemetry tracing |
| `samplingRate` | Float | 1.0 | Event sampling rate (0.0-1.0) |
| `batchSize` | Int | 50 | Events per batch upload |
| `flushIntervalSeconds` | Int | 30 | Auto-flush interval |
| `maxOfflineStorageSize` | Long | 10MB | Max offline storage |
| `enablePiiRedaction` | Boolean | true | Auto-redact PII |
| `enableEncryption` | Boolean | true | Encrypt stored data |

### Usage Examples

#### Crash Reporting

Crashes are automatically detected. For manual error reporting:

```kotlin
try {
    // Your code
} catch (e: Exception) {
    CrashReporter.reportError(e, mapOf(
        "context" to "payment_flow",
        "userId" to currentUserId
    ))
}
```

#### Performance Monitoring

```kotlin
// Report custom metrics
PerformanceMonitor.reportMetric("api_call_duration", 245.5, "ms")

// Get current metrics
val cpuUsage = PerformanceMonitor.getCpuUsage()
val memoryInfo = PerformanceMonitor.getMemoryUsage(context)
val threadCount = PerformanceMonitor.getThreadCount()
```

#### Network Monitoring

Network monitoring is automatic when enabled. All HTTP requests via OkHttp are tracked.

#### User Interaction Tracking

```kotlin
// Track screen view
UserInteractionTracker.trackScreenView("HomeScreen")

// Track tap event
UserInteractionTracker.trackTap(view, x, y)

// Track custom event
UserInteractionTracker.trackCustomEvent("button_clicked", mapOf(
    "button_id" to "checkout",
    "screen" to "cart"
))
```

#### Distributed Tracing

```kotlin
val tracingManager = TracingManager.create(configuration)
val span = tracingManager?.startSpan("api_call")

try {
    // Your operation
    tracingManager?.addAttribute("operation", "fetch_data")
    tracingManager?.addEvent("operation_started")
} finally {
    tracingManager?.endSpan(span)
}
```

#### Session Management

```kotlin
// Identify user
SessionManager.identify("user123", mapOf(
    "email" to "user@example.com",
    "name" to "John Doe"
))

// Set user attributes
SessionManager.setAttribute("subscription", "premium")
```

#### GDPR Compliance

```kotlin
// Export user data
GdprManager.exportUserData("user123") { data ->
    // Handle exported data
}

// Delete user data
GdprManager.deleteUserData("user123") { success ->
    // Handle deletion result
}

// Anonymize user data
GdprManager.anonymizeUserData("user123") { anonymousId ->
    // Handle anonymization
}
```

---

## iOS SDK Guide

### Installation

#### Option 1: Swift Package Manager (Recommended)

1. In Xcode, go to File → Add Packages
2. Enter repository URL: `https://github.com/adlcom/mxl-ios-sdk`
3. Select version: `1.0.0`
4. Add to your target

#### Option 2: CocoaPods

Add to your `Podfile`:

```ruby
pod 'MxLSdk', '~> 1.0.0'
```

Then run:
```bash
pod install
```

#### Option 3: Manual Installation

1. Download the framework
2. Drag `MxLSdk.framework` into your project
3. Link in Build Phases

### Initialization

Initialize in your `AppDelegate`:

```swift
import MxLSdk

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, 
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        let config = SdkConfiguration(
            apiKey: "your-api-key",
            endpoint: "https://api.mxl.adlcom.com",
            enableCrashReporting: true,
            enablePerformanceMonitoring: true,
            enableNetworkMonitoring: true,
            enableUserTracking: true,
            enableDistributedTracing: true,
            samplingRate: 1.0,
            batchSize: 50,
            flushIntervalSeconds: 30,
            maxOfflineStorageSize: 10 * 1024 * 1024,
            enablePiiRedaction: true,
            enableEncryption: true
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

### Configuration Options

Same as Android SDK (see above table).

### Usage Examples

#### Crash Reporting

```swift
do {
    // Your code
} catch {
    CrashReporter.reportError(error, context: [
        "context": "payment_flow",
        "userId": currentUserId
    ])
}
```

#### Performance Monitoring

```swift
// Report custom metrics
PerformanceMonitor.reportMetric("api_call_duration", 245.5, "ms")

// Get current metrics
let cpuUsage = PerformanceMonitor.getCpuUsage()
let memoryInfo = PerformanceMonitor.getMemoryUsage()
let threadCount = PerformanceMonitor.getThreadCount()
```

#### User Interaction Tracking

```swift
// Track screen view
UserInteractionTracker.trackScreenView("HomeScreen")

// Track tap event
UserInteractionTracker.trackTap(view: view, x: x, y: y)

// Track custom event
UserInteractionTracker.trackCustomEvent("button_clicked", properties: [
    "button_id": "checkout",
    "screen": "cart"
])
```

#### Distributed Tracing

```swift
if let tracingManager = TracingManager.create(configuration: config) {
    let span = tracingManager.startSpan(name: "api_call")
    
    tracingManager.addAttribute(key: "operation", value: "fetch_data")
    tracingManager.addEvent(name: "operation_started")
    
    // Your operation
    
    tracingManager.endSpan(span)
}
```

#### Session Management

```swift
// Identify user
SessionManager.identify(userId: "user123", attributes: [
    "email": "user@example.com",
    "name": "John Doe"
])

// Set user attributes
SessionManager.setAttribute(key: "subscription", value: "premium")
```

#### GDPR Compliance

```swift
// Export user data
GdprManager.exportUserData(userId: "user123") { data in
    // Handle exported data
}

// Delete user data
GdprManager.deleteUserData(userId: "user123") { success in
    // Handle deletion result
}

// Anonymize user data
GdprManager.anonymizeUserData(userId: "user123") { anonymousId in
    // Handle anonymization
}
```

---

## Configuration

### Advanced Configuration

#### Certificate Pinning (iOS)

```swift
let config = SdkConfiguration(
    apiKey: "your-api-key",
    endpoint: "https://api.mxl.adlcom.com",
    enableCertificatePinning: true,
    certificatePins: [
        "base64-encoded-certificate-1",
        "base64-encoded-certificate-2"
    ]
)
```

#### Sampling Rate

Control event volume with sampling:

```kotlin
// Android
.samplingRate(0.1f) // 10% of events

// iOS
samplingRate: 0.1 // 10% of events
```

#### Batch Configuration

Optimize network usage:

```kotlin
// Android
.batchSize(100) // Larger batches
.flushIntervalSeconds(60) // Less frequent flushes

// iOS
batchSize: 100
flushIntervalSeconds: 60
```

#### Offline Storage

Configure offline behavior:

```kotlin
// Android
.maxOfflineStorageSize(50 * 1024 * 1024) // 50MB

// iOS
maxOfflineStorageSize: 50 * 1024 * 1024
```

### Environment-Specific Configuration

#### Development

```kotlin
val config = if (BuildConfig.DEBUG) {
    SdkConfiguration.Builder()
        .apiKey(devApiKey)
        .endpoint("https://api-dev.mxl.adlcom.com")
        .samplingRate(1.0f) // Full sampling in dev
        .build()
} else {
    SdkConfiguration.Builder()
        .apiKey(prodApiKey)
        .endpoint("https://api.mxl.adlcom.com")
        .samplingRate(0.1f) // 10% in production
        .build()
}
```

#### Staging

```kotlin
.endpoint("https://api-staging.mxl.adlcom.com")
.samplingRate(0.5f) // 50% sampling
```

---

## Features & Usage

### Crash Reporting

#### Automatic Crash Detection

Crashes are automatically detected and reported. No additional code required.

#### Manual Error Reporting

Report handled exceptions:

```kotlin
// Android
try {
    riskyOperation()
} catch (e: Exception) {
    CrashReporter.reportError(e, mapOf(
        "operation" to "data_sync",
        "retry_count" to retryCount.toString()
    ))
}

// iOS
do {
    try riskyOperation()
} catch {
    CrashReporter.reportError(error, context: [
        "operation": "data_sync",
        "retry_count": String(retryCount)
    ])
}
```

#### Crash Context

Add context before risky operations:

```kotlin
// Android
CrashReporter.setContext("checkout_flow", mapOf(
    "cart_value" to cartTotal.toString(),
    "payment_method" to paymentMethod
))

// iOS
CrashReporter.setContext(key: "checkout_flow", value: [
    "cart_value": String(cartTotal),
    "payment_method": paymentMethod
])
```

### Performance Monitoring

#### Automatic Metrics

The SDK automatically tracks:
- App startup time
- CPU usage
- Memory usage
- Thread count
- Frame rate (Android)
- UI responsiveness

#### Custom Metrics

Report custom performance metrics:

```kotlin
// Android
PerformanceMonitor.reportMetric("database_query_time", queryTime, "ms")
PerformanceMonitor.reportMetric("image_load_time", loadTime, "ms")

// iOS
PerformanceMonitor.reportMetric("database_query_time", queryTime, "ms")
PerformanceMonitor.reportMetric("image_load_time", loadTime, "ms")
```

#### Performance Thresholds

Set performance thresholds:

```kotlin
// Android
if (operationTime > 1000) { // > 1 second
    PerformanceMonitor.reportMetric("slow_operation", operationTime, "ms")
}

// iOS
if operationTime > 1000 {
    PerformanceMonitor.reportMetric("slow_operation", operationTime, "ms")
}
```

### Network Monitoring

#### Automatic Tracking

All HTTP requests via OkHttp (Android) or URLSession (iOS) are automatically tracked.

#### Network Metrics

Tracked metrics include:
- Request URL and method
- Status code
- Request/response size
- Duration
- Success/failure

#### Custom Network Events

```kotlin
// Android - Add custom headers
val request = Request.Builder()
    .url("https://api.example.com/data")
    .addHeader("X-Custom-Header", "value")
    .build()

// Network monitor automatically tracks this
```

### User Interaction Tracking

#### Screen Views

```kotlin
// Android
override fun onResume() {
    super.onResume()
    UserInteractionTracker.trackScreenView("ProductDetailScreen")
}

// iOS
override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    UserInteractionTracker.trackScreenView("ProductDetailScreen")
}
```

#### Tap Events

```kotlin
// Android
button.setOnClickListener { view ->
    UserInteractionTracker.trackTap(view, event.x, event.y)
    // Your click handler
}

// iOS
@IBAction func buttonTapped(_ sender: UIButton) {
    let location = sender.convert(sender.bounds.origin, to: view)
    UserInteractionTracker.trackTap(view: sender, x: location.x, y: location.y)
    // Your click handler
}
```

#### Custom Events

```kotlin
// Android
UserInteractionTracker.trackCustomEvent("purchase_completed", mapOf(
    "product_id" to productId,
    "price" to price.toString(),
    "currency" to "USD"
))

// iOS
UserInteractionTracker.trackCustomEvent("purchase_completed", properties: [
    "product_id": productId,
    "price": String(price),
    "currency": "USD"
])
```

### Distributed Tracing

#### Creating Spans

```kotlin
// Android
val span = tracingManager?.startSpan("api_call")
try {
    tracingManager?.addAttribute("endpoint", "/api/users")
    val response = apiCall()
    tracingManager?.addEvent("api_success")
} catch (e: Exception) {
    tracingManager?.addAttribute("error", e.message ?: "unknown")
} finally {
    tracingManager?.endSpan(span)
}

// iOS
if let span = tracingManager?.startSpan(name: "api_call") {
    tracingManager?.addAttribute(key: "endpoint", value: "/api/users")
    do {
        let response = try apiCall()
        tracingManager?.addEvent(name: "api_success")
    } catch {
        tracingManager?.addAttribute(key: "error", value: error.localizedDescription)
    }
    tracingManager?.endSpan(span)
}
```

#### Trace Context Propagation

```kotlin
// Android
val traceContext = tracingManager?.getTraceContext()
val headers = mapOf(
    "traceparent" to (traceContext?.get("traceparent") ?: "")
)

// iOS
let traceContext = tracingManager?.getTraceContext()
let headers = [
    "traceparent": traceContext?["traceparent"] ?? ""
]
```

### Session Management

#### User Identification

```kotlin
// Android
SessionManager.identify("user123", mapOf(
    "email" to "user@example.com",
    "name" to "John Doe",
    "subscription" to "premium"
))

// iOS
SessionManager.identify(userId: "user123", attributes: [
    "email": "user@example.com",
    "name": "John Doe",
    "subscription": "premium"
])
```

#### Session Attributes

```kotlin
// Android
SessionManager.setAttribute("user_type", "premium")
SessionManager.setAttribute("app_version", BuildConfig.VERSION_NAME)

// iOS
SessionManager.setAttribute(key: "user_type", value: "premium")
SessionManager.setAttribute(key: "app_version", value: Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "")
```

### GDPR Compliance

#### Export User Data

```kotlin
// Android
GdprManager.exportUserData("user123") { data ->
    // data contains all user's telemetry data
    saveToFile(data)
}

// iOS
GdprManager.exportUserData(userId: "user123") { data in
    // data contains all user's telemetry data
    saveToFile(data)
}
```

#### Delete User Data

```kotlin
// Android
GdprManager.deleteUserData("user123") { success ->
    if (success) {
        // Data deleted successfully
    }
}

// iOS
GdprManager.deleteUserData(userId: "user123") { success in
    if success {
        // Data deleted successfully
    }
}
```

#### Anonymize User Data

```kotlin
// Android
GdprManager.anonymizeUserData("user123") { anonymousId ->
    // User data anonymized, anonymousId is the new identifier
}

// iOS
GdprManager.anonymizeUserData(userId: "user123") { anonymousId in
    // User data anonymized, anonymousId is the new identifier
}
```

---

## API Reference

### Android SDK

#### MxLSdk

Main SDK entry point.

**Methods:**
- `initialize(context: Context, configuration: SdkConfiguration)`: Initialize SDK
- `isInitialized(): Boolean`: Check if SDK is initialized

#### SdkConfiguration.Builder

Configuration builder.

**Methods:**
- `apiKey(key: String)`: Set API key
- `endpoint(url: String)`: Set backend endpoint
- `enableCrashReporting(enabled: Boolean)`: Enable/disable crash reporting
- `enablePerformanceMonitoring(enabled: Boolean)`: Enable/disable performance monitoring
- `enableNetworkMonitoring(enabled: Boolean)`: Enable/disable network monitoring
- `enableUserTracking(enabled: Boolean)`: Enable/disable user tracking
- `enableDistributedTracing(enabled: Boolean)`: Enable/disable tracing
- `samplingRate(rate: Float)`: Set sampling rate (0.0-1.0)
- `batchSize(size: Int)`: Set batch size
- `flushIntervalSeconds(seconds: Int)`: Set flush interval
- `maxOfflineStorageSize(bytes: Long)`: Set max storage size
- `enablePiiRedaction(enabled: Boolean)`: Enable/disable PII redaction
- `enableEncryption(enabled: Boolean)`: Enable/disable encryption
- `build()`: Build configuration

#### CrashReporter

Crash reporting functionality.

**Methods:**
- `reportError(throwable: Throwable, context: Map<String, Any>)`: Report error
- `setContext(key: String, value: Map<String, Any>)`: Set crash context

#### PerformanceMonitor

Performance monitoring.

**Methods:**
- `reportMetric(metric: String, value: Double, unit: String)`: Report metric
- `getCpuUsage(): Double`: Get CPU usage
- `getMemoryUsage(context: Context): MemoryInfo`: Get memory info
- `getThreadCount(): Int`: Get thread count

#### UserInteractionTracker

User interaction tracking.

**Methods:**
- `trackScreenView(screenName: String)`: Track screen view
- `trackTap(view: View, x: Float, y: Float)`: Track tap
- `trackCustomEvent(eventName: String, properties: Map<String, Any>)`: Track custom event

#### SessionManager

Session management.

**Methods:**
- `identify(userId: String, attributes: Map<String, Any>)`: Identify user
- `setAttribute(key: String, value: String)`: Set attribute
- `getSessionId(): String?`: Get current session ID
- `getUserId(): String?`: Get current user ID

#### GdprManager

GDPR compliance.

**Methods:**
- `exportUserData(userId: String, callback: (Any) -> Unit)`: Export data
- `deleteUserData(userId: String, callback: (Boolean) -> Unit)`: Delete data
- `anonymizeUserData(userId: String, callback: (String) -> Unit)`: Anonymize data

### iOS SDK

#### MxLSdk

Main SDK entry point.

**Methods:**
- `initialize(configuration: SdkConfiguration) throws`: Initialize SDK
- `isInitialized: Bool`: Check if SDK is initialized

#### SdkConfiguration

Configuration struct.

**Properties:**
- `apiKey: String`
- `endpoint: String`
- `enableCrashReporting: Bool`
- `enablePerformanceMonitoring: Bool`
- `enableNetworkMonitoring: Bool`
- `enableUserTracking: Bool`
- `enableDistributedTracing: Bool`
- `samplingRate: Float`
- `batchSize: Int`
- `flushIntervalSeconds: Int`
- `maxOfflineStorageSize: Int64`
- `enablePiiRedaction: Bool`
- `enableEncryption: Bool`
- `enableCertificatePinning: Bool`
- `certificatePins: [String]`

#### CrashReporter

Crash reporting functionality.

**Methods:**
- `reportError(_ error: Error, context: [String: Any])`: Report error
- `setContext(key: String, value: [String: Any])`: Set crash context

#### PerformanceMonitor

Performance monitoring.

**Methods:**
- `reportMetric(_ metric: String, value: Double, unit: String)`: Report metric
- `getCpuUsage() -> Double`: Get CPU usage
- `getMemoryUsage() -> MemoryInfo`: Get memory info
- `getThreadCount() -> Int`: Get thread count

#### UserInteractionTracker

User interaction tracking.

**Methods:**
- `trackScreenView(_ screenName: String)`: Track screen view
- `trackTap(view: UIView, x: CGFloat, y: CGFloat)`: Track tap
- `trackCustomEvent(_ eventName: String, properties: [String: Any])`: Track custom event

#### SessionManager

Session management.

**Methods:**
- `identify(userId: String, attributes: [String: Any])`: Identify user
- `setAttribute(key: String, value: String)`: Set attribute
- `getSessionId() -> String?`: Get current session ID
- `getUserId() -> String?`: Get current user ID

#### GdprManager

GDPR compliance.

**Methods:**
- `exportUserData(userId: String, completion: @escaping ([[String: Any]]) -> Void)`: Export data
- `deleteUserData(userId: String, completion: @escaping (Bool) -> Void)`: Delete data
- `anonymizeUserData(userId: String, completion: @escaping (String?) -> Void)`: Anonymize data

---

## Best Practices

### 1. Initialization

- Initialize SDK early in application lifecycle
- Use environment-specific API keys
- Configure appropriate sampling rates for production

```kotlin
// Good: Initialize in Application.onCreate()
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        MxLSdk.initialize(this, config)
    }
}

// Bad: Initializing in Activity
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        MxLSdk.initialize(this, config) // Too late!
    }
}
```

### 2. Error Handling

- Always handle exceptions before reporting
- Provide meaningful context
- Don't report sensitive information

```kotlin
// Good
try {
    processPayment()
} catch (e: PaymentException) {
    CrashReporter.reportError(e, mapOf(
        "payment_method" to paymentMethod,
        "amount" to amount.toString()
    ))
    showErrorToUser()
}

// Bad
try {
    processPayment()
} catch (e: Exception) {
    CrashReporter.reportError(e, mapOf(
        "credit_card" to creditCardNumber, // Never log sensitive data!
        "password" to userPassword
    ))
}
```

### 3. Performance Monitoring

- Report metrics for critical operations
- Set appropriate thresholds
- Monitor trends over time

```kotlin
// Good
val startTime = System.currentTimeMillis()
loadData()
val duration = System.currentTimeMillis() - startTime

if (duration > 1000) {
    PerformanceMonitor.reportMetric("slow_data_load", duration.toDouble(), "ms")
}
```

### 4. User Tracking

- Track meaningful user actions
- Use consistent event names
- Include relevant context

```kotlin
// Good
UserInteractionTracker.trackCustomEvent("product_viewed", mapOf(
    "product_id" to productId,
    "category" to category,
    "price" to price.toString()
))

// Bad
UserInteractionTracker.trackCustomEvent("click", mapOf()) // Too generic
```

### 5. Session Management

- Identify users early
- Update attributes as user state changes
- Clear attributes on logout

```kotlin
// Good
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    
    if (user.isLoggedIn) {
        SessionManager.identify(user.id, mapOf(
            "email" to user.email,
            "subscription" to user.subscriptionType
        ))
    }
}

override fun onDestroy() {
    if (user.loggedOut) {
        SessionManager.clearAttributes()
    }
    super.onDestroy()
}
```

### 6. GDPR Compliance

- Implement user data export on request
- Provide clear deletion options
- Handle anonymization requests

```kotlin
// Good: Implement in settings screen
fun onExportDataClicked() {
    showLoading()
    GdprManager.exportUserData(currentUserId) { data ->
        hideLoading()
        saveToFile(data)
        showSuccess("Data exported successfully")
    }
}
```

### 7. Network Monitoring

- SDK automatically tracks OkHttp/URLSession requests
- No additional code needed
- Monitor network performance in dashboard

### 8. Offline Support

- SDK automatically stores events offline
- Events are uploaded when connection is restored
- Configure appropriate storage limits

### 9. Sampling

- Use sampling in production to reduce volume
- Keep full sampling in development
- Adjust based on traffic

```kotlin
val samplingRate = if (BuildConfig.DEBUG) {
    1.0f // 100% in development
} else {
    0.1f // 10% in production
}
```

### 10. Security

- Never hardcode API keys
- Use build configuration for keys
- Enable PII redaction in production
- Use certificate pinning for sensitive apps

---

## Troubleshooting

### Common Issues

#### SDK Not Initializing

**Problem**: SDK initialization fails silently.

**Solutions**:
1. Check API key is valid
2. Verify endpoint URL is correct
3. Ensure Application class is registered in manifest (Android)
4. Check logs for error messages

```kotlin
// Add logging
try {
    MxLSdk.initialize(this, config)
    Log.d("MxL", "SDK initialized successfully")
} catch (e: Exception) {
    Log.e("MxL", "SDK initialization failed", e)
}
```

#### Events Not Appearing in Dashboard

**Problem**: Events are tracked but not visible in dashboard.

**Solutions**:
1. Check network connectivity
2. Verify API key is active
3. Check sampling rate (may be filtering events)
4. Wait for batch upload (check flush interval)
5. Verify backend is receiving events

#### High Battery Usage

**Problem**: SDK causing battery drain.

**Solutions**:
1. Reduce sampling rate
2. Increase flush interval
3. Disable unnecessary features
4. Reduce batch size

```kotlin
val config = SdkConfiguration.Builder()
    .samplingRate(0.1f) // Reduce to 10%
    .flushIntervalSeconds(60) // Flush less frequently
    .enablePerformanceMonitoring(false) // Disable if not needed
    .build()
```

#### Storage Issues

**Problem**: Offline storage filling up.

**Solutions**:
1. Increase max storage size
2. Reduce flush interval
3. Check for upload failures
4. Clear old events manually

#### Network Errors

**Problem**: Network requests failing.

**Solutions**:
1. Check endpoint URL
2. Verify API key
3. Check certificate pinning configuration (iOS)
4. Review network security config (Android)

### Debug Mode

Enable debug logging:

```kotlin
// Android - Add to build.gradle
buildConfigField("boolean", "MXL_DEBUG", "true")

// In code
if (BuildConfig.MXL_DEBUG) {
    Logger.setLevel(LogLevel.DEBUG)
}
```

### Getting Help

- **Email**: mxl-support@adlcom.com
- **Documentation**: `/docs/` directory
- **API Docs**: Available at backend `/api-docs` endpoint
- **GitHub Issues**: For bug reports and feature requests

---

## FAQ

### General

**Q: Is the SDK free to use?**  
A: Contact ADLcom for pricing and licensing information.

**Q: What data does the SDK collect?**  
A: The SDK collects crash reports, performance metrics, network requests, user interactions, and custom events. All data collection respects user privacy and GDPR requirements.

**Q: How much does the SDK impact app performance?**  
A: The SDK is designed to have minimal impact (<2% CPU overhead). Performance monitoring can be disabled if needed.

**Q: Does the SDK work offline?**  
A: Yes, the SDK stores events locally and uploads them when connectivity is restored.

### Technical

**Q: What's the minimum SDK version?**  
A: Android API 21+ (Android 5.0+), iOS 12.0+

**Q: How do I update the SDK?**  
A: Update the dependency version in your build file and sync/rebuild.

**Q: Can I customize event data?**  
A: Yes, you can add custom properties to all events.

**Q: How are errors handled?**  
A: Errors are logged locally and reported to the backend. The SDK never crashes your app.

### Privacy & Compliance

**Q: Is user data encrypted?**  
A: Yes, data is encrypted at rest (AES-256) and in transit (TLS 1.2+).

**Q: How is PII handled?**  
A: PII is automatically detected and redacted. You can also manually redact sensitive data.

**Q: How do I comply with GDPR?**  
A: Use the GDPR manager methods to export, delete, or anonymize user data on request.

**Q: Can I disable data collection?**  
A: Yes, you can disable individual features or the entire SDK via configuration.

### Integration

**Q: Does it work with React Native?**  
A: Currently, only native Android and iOS SDKs are available. React Native support may be added in the future.

**Q: Can I use it with existing crash reporting tools?**  
A: Yes, the SDK can coexist with other tools, but be mindful of duplicate reporting.

**Q: How do I test the SDK?**  
A: Use the test API key and endpoint provided by ADLcom. Events will appear in the test environment dashboard.

---

## Additional Resources

- [Android Integration Guide](./android-integration-guide.md)
- [iOS Integration Guide](./ios-integration-guide.md)
- [API Documentation](./API.md)
- [Architecture Overview](./architecture.md)
- [Best Practices](./best-practices.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Testing Guide](../TESTING_GUIDE.md)

---

## Support

For additional support:
- **Email**: mxl-support@adlcom.com
- **Documentation**: `/docs/` directory
- **Backend API Docs**: `https://your-backend-url/api-docs`

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Copyright**: © ADLcom Limited

