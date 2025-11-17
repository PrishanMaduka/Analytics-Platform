# Frequently Asked Questions (FAQ)

## General

### What is MxL SDK?

MxL (Monitoring Experience Layer) SDK is a comprehensive mobile monitoring solution that provides crash reporting, performance monitoring, network tracking, user analytics, and more for Android and iOS applications.

### What platforms are supported?

- Android: API 21+ (Android 5.0+)
- iOS: iOS 12.0+

### Is the SDK free to use?

Contact ADL for licensing and pricing information.

## Installation

### How do I add the SDK to my Android project?

Add to your `build.gradle.kts`:
```kotlin
dependencies {
    implementation("com.adlcom.mxl:sdk:1.0.0")
}
```

### How do I add the SDK to my iOS project?

Use Swift Package Manager or CocoaPods. See integration guides for details.

### What are the minimum requirements?

**Android:**
- Android API 21+
- Kotlin 1.9+
- Java 17+

**iOS:**
- iOS 12.0+
- Swift 5.9+
- Xcode 15+

## Configuration

### How do I get an API key?

Contact ADLcom to obtain an API key for your application.

### Can I disable certain features?

Yes, all features can be toggled in the SDK configuration:
```kotlin
SdkConfiguration.Builder()
    .enableCrashReporting(false)
    .enablePerformanceMonitoring(false)
    // ...
```

### What is the recommended sampling rate?

Start with 1.0 (100%) for initial testing, then adjust based on your needs. For high-traffic apps, 0.1-0.5 (10-50%) is often sufficient.

## Data & Privacy

### What data does the SDK collect?

The SDK collects:
- Crash reports and stack traces
- Performance metrics (CPU, memory, startup time)
- Network request/response data
- User interaction events (screen views, taps)
- Device information (model, OS version, app version)

### How is PII handled?

The SDK automatically detects and redacts PII (emails, phone numbers, credit cards, etc.) before sending data to the backend.

### Is data encrypted?

Yes, data is encrypted using AES-256 encryption when stored locally, and transmitted over HTTPS/TLS 1.2+.

### How do I comply with GDPR?

Use the GDPR compliance APIs:
- Check consent: `GdprManager.hasConsent()`
- Set consent: `GdprManager.setConsent(true)`
- Export data: `GdprManager.exportUserData()`
- Delete data: `GdprManager.deleteUserData()`

## Performance

### What is the performance impact?

The SDK is designed to have minimal impact:
- CPU overhead: <2%
- Memory: ~5-10MB
- Battery: Minimal impact
- Network: Batched requests to minimize bandwidth

### How do I reduce SDK overhead?

- Reduce sampling rate
- Increase flush interval
- Disable unused features
- Use remote configuration to adjust settings

## Troubleshooting

### Events are not being sent

1. Check network connectivity
2. Verify API key is correct
3. Check if consent is required and given
4. Review logs for error messages
5. Ensure SDK is properly initialized

### SDK initialization fails

- Ensure you're initializing in Application class (Android) or AppDelegate (iOS)
- Verify API key and endpoint are correct
- Check that endpoint uses HTTPS
- Review error logs

### High battery usage

- Reduce sampling rate
- Increase batch flush interval
- Disable unnecessary features
- Check for excessive network calls

### Crashes not being reported

- Ensure crash reporting is enabled in configuration
- Check that native crash handlers are properly set up
- Verify ProGuard/R8 rules are configured correctly

## Support

### Where can I get help?

- Documentation: https://docs.mxl.adlcom.com
- GitHub Issues: https://github.com/adlcom/mxl-sdk
- Email: mxl-support@adlcom.com

### How do I report bugs?

Report bugs via GitHub Issues or email support.

### Can I contribute?

Yes! Contributions are welcome. See CONTRIBUTING.md for guidelines.

## Best Practices

### When should I initialize the SDK?

Initialize as early as possible in your application lifecycle:
- Android: `Application.onCreate()`
- iOS: `AppDelegate.didFinishLaunching`

### Should I identify users?

Yes, identifying users helps with:
- Crash correlation
- User journey tracking
- Support and debugging

### How often should I update the SDK?

Update to the latest version regularly to get:
- Bug fixes
- Performance improvements
- New features
- Security patches

