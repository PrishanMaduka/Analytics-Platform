# MxL Mobile SDK Platform

Complete implementation of ADLcom's Monitoring Experience Layer (MxL) mobile monitoring platform.

## Project Structure

```
Mobile SDK/
├── android-sdk/          # Android SDK (Kotlin)
├── ios-sdk/              # iOS SDK (Swift)
├── backend/              # Node.js Backend (Fastify)
├── frontend/             # React Frontend (Next.js)
└── docs/                 # Documentation
```

## Components

### Android SDK
Native Android SDK for telemetry collection, crash reporting, and performance monitoring.

### iOS SDK
Native iOS SDK for telemetry collection, crash reporting, and performance monitoring.

### Backend
Node.js/Fastify backend with Kafka integration for telemetry ingestion and processing.

### Frontend
React/Next.js dashboard for analytics, crash analysis, and monitoring.

## Getting Started

### Quick Start

**Android SDK:**
```kotlin
MxLSdk.initialize(context, SdkConfiguration.Builder()
    .apiKey("your-api-key")
    .endpoint("https://api.mxl.adlcom.com")
    .build())
```

**iOS SDK:**
```swift
try MxLSdk.initialize(configuration: SdkConfiguration(
    apiKey: "your-api-key",
    endpoint: "https://api.mxl.adlcom.com"
))
```

### Documentation

- [Android Integration Guide](./docs/android-integration-guide.md)
- [iOS Integration Guide](./docs/ios-integration-guide.md)
- [API Documentation](./docs/API.md)
- [Architecture Overview](./docs/architecture.md)
- [FAQ](./docs/FAQ.md)
- [Best Practices](./docs/best-practices.md)

### Examples

- [Android Examples](./docs/examples/android-example.md)
- [iOS Examples](./docs/examples/ios-example.md)

## Project Status

✅ **100% Complete** - All 8 phases implemented

See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for detailed status.

## Technology Stack

- **SDKs**: Kotlin (Android), Swift (iOS)
- **Backend**: Node.js, Fastify, Kafka, PostgreSQL, ClickHouse, Redis
- **Frontend**: React, Next.js, TypeScript
- **Auth**: OAuth 2.0
- **Tracing**: OpenTelemetry

