# Testing Guide

## Overview

This guide covers testing strategies and procedures for the MxL Mobile SDK platform.

## Test Types

### Unit Tests

**Android SDK**
- Location: `android-sdk/sdk/src/test/java/`
- Framework: JUnit 4, Mockito, Robolectric
- Coverage target: >80%
- Run: `./gradlew test`

**iOS SDK**
- Location: `ios-sdk/Tests/`
- Framework: XCTest
- Coverage target: >80%
- Run: `swift test`

**Backend**
- Location: `backend/src/**/__tests__/`
- Framework: Jest
- Coverage target: >70%
- Run: `npm test`

**Frontend**
- Location: `frontend/src/**/__tests__/`
- Framework: Jest, React Testing Library
- Coverage target: >60%
- Run: `npm test`

### Integration Tests

**Location**: `test-integration/`

**Test Scenarios**:
- SDK to Backend telemetry flow
- Backend to storage (Kafka -> ClickHouse)
- Frontend to Backend API calls
- End-to-end user journeys

**Run**: `npm run test:integration`

### Device Tests

**Android**
- Location: `android-sdk/sdk/src/androidTest/`
- Run on physical devices and emulators
- Test across Android versions (API 21-34+)

**iOS**
- Run on physical devices and simulators
- Test across iOS versions (12.0+)

### Performance Tests

**Backend Load Testing**
- Location: `backend/src/performance/`
- Test high throughput scenarios
- Measure response times and success rates
- Run: `npm run test:performance`

**SDK Performance**
- Measure CPU usage (<2% overhead)
- Memory footprint
- Battery impact
- Network bandwidth usage

## Running Tests

### Android SDK
```bash
cd android-sdk
./gradlew test                    # Unit tests
./gradlew connectedAndroidTest    # Device tests
./gradlew jacocoTestReport        # Coverage report
```

### iOS SDK
```bash
cd ios-sdk
swift test                        # Unit tests
xcodebuild test                   # Device tests
```

### Backend
```bash
cd backend
npm test                          # Unit tests
npm run test:integration          # Integration tests
npm run test:performance         # Performance tests
npm run test:coverage            # Coverage report
```

### Frontend
```bash
cd frontend
npm test                          # Unit tests
npm run test:coverage            # Coverage report
```

## Test Coverage Goals

- **Android SDK**: >80%
- **iOS SDK**: >80%
- **Backend**: >70%
- **Frontend**: >60%

## Continuous Integration

Tests should run automatically on:
- Pull requests
- Commits to main branch
- Nightly builds

## Best Practices

1. Write tests before fixing bugs (TDD)
2. Keep tests independent and isolated
3. Use meaningful test names
4. Mock external dependencies
5. Test edge cases and error conditions
6. Maintain test coverage thresholds

