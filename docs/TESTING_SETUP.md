# Testing Setup & Configuration

## Overview

Phase 7 (Testing & QA) is marked as completed, but there were some configuration issues preventing tests from being discovered. This document outlines the fixes and how to run tests.

## Issues Found & Fixed

### 1. Android SDK - Missing Robolectric Dependency

**Issue**: Tests use `@RunWith(RobolectricTestRunner::class)` but Robolectric wasn't in dependencies.

**Fix**: Added to `android-sdk/sdk/build.gradle.kts`:
```kotlin
testImplementation("org.robolectric:robolectric:4.11.1")
testImplementation("androidx.test:core:1.5.0")
```

**Files Affected**:
- `android-sdk/sdk/src/test/java/com/adlcom/mxl/sdk/MxLSdkTest.kt`
- `android-sdk/sdk/src/test/java/com/adlcom/mxl/sdk/session/SessionManagerTest.kt`

### 2. Backend - Test Pattern Too Restrictive

**Issue**: Jest config only matched `**/__tests__/**/*.test.ts`, missing:
- `integration/telemetry.integration.test.ts`
- `performance/load.test.ts`

**Fix**: Updated `backend/jest.config.js` to include:
```javascript
testMatch: [
  '**/__tests__/**/*.test.ts',
  '**/*.test.ts',
  '**/*.integration.test.ts',
  '**/integration/**/*.test.ts',
  '**/performance/**/*.test.ts',
],
```

## Test Structure

### Android SDK Tests

**Unit Tests** (`src/test/`):
- ✅ `MxLSdkTest.kt` - SDK initialization tests
- ✅ `SdkConfigurationTest.kt` - Configuration builder tests
- ✅ `PiiDetectorTest.kt` - PII detection tests
- ✅ `SessionManagerTest.kt` - Session management tests

**Instrumentation Tests** (`src/androidTest/`):
- ✅ `PerformanceTest.kt` - Performance benchmarks
- ✅ `DeviceTest.kt` - Device-specific tests

**Run Tests**:
```bash
cd android-sdk/sdk
./gradlew test              # Unit tests
./gradlew connectedAndroidTest  # Instrumentation tests
```

### iOS SDK Tests

**Unit Tests** (`Tests/MxLSdkTests/`):
- ✅ `MxLSdkTests.swift` - SDK initialization, configuration, PII detection, encryption, GDPR

**Run Tests**:
```bash
cd ios-sdk
swift test
# Or in Xcode: Cmd+U
```

### Backend Tests

**Unit Tests** (`src/**/__tests__/`):
- ✅ `routes/__tests__/telemetry.test.ts` - API route tests
- ✅ `services/__tests__/telemetry.test.ts` - Service logic tests
- ✅ `services/__tests__/piiRedaction.test.ts` - PII redaction tests

**Integration Tests** (`src/integration/`):
- ✅ `telemetry.integration.test.ts` - End-to-end telemetry flow

**Performance Tests** (`src/performance/`):
- ✅ `load.test.ts` - Load and performance testing

**Run Tests**:
```bash
cd backend
npm test                    # All tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage
npm run test:integration    # Integration tests only
npm run test:performance    # Performance tests only
```

### Frontend Tests

**Component Tests** (`src/components/__tests__/`):
- ✅ `Dashboard.test.tsx` - Dashboard component tests
- ✅ `MetricsWidget.test.tsx` - Metrics widget tests

**Run Tests**:
```bash
cd frontend
npm test                    # All tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage
```

### Integration Test Suite

**Cross-Platform Tests** (`test-integration/`):
- ✅ `telemetry-flow.test.ts` - SDK to backend integration

**Run Tests**:
```bash
cd test-integration
npm test
```

## Test Coverage

### Current Coverage Status

- **Android SDK**: Unit tests for core functionality
- **iOS SDK**: Unit tests for initialization, configuration, PII, encryption
- **Backend**: Unit, integration, and performance tests
- **Frontend**: Component tests for dashboards

### Coverage Goals

- **Backend**: 70% (configured in `jest.config.js`)
- **Frontend**: 60% (configured in `jest.config.js`)
- **Android/iOS**: Target 70%+ coverage

## Running All Tests

### Quick Test Commands

```bash
# Android
cd android-sdk/sdk && ./gradlew test

# iOS
cd ios-sdk && swift test

# Backend
cd backend && npm test

# Frontend
cd frontend && npm test

# Integration
cd test-integration && npm test
```

### CI/CD Integration

Tests should be run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Android Tests
  run: cd android-sdk/sdk && ./gradlew test

- name: Run iOS Tests
  run: cd ios-sdk && swift test

- name: Run Backend Tests
  run: cd backend && npm test

- name: Run Frontend Tests
  run: cd frontend && npm test
```

## Troubleshooting

### Android Tests Not Running

1. **Check Robolectric is installed**:
   ```bash
   cd android-sdk/sdk
   ./gradlew dependencies --configuration testImplementation | grep robolectric
   ```

2. **Sync Gradle**:
   ```bash
   ./gradlew --refresh-dependencies
   ```

3. **Run with verbose output**:
   ```bash
   ./gradlew test --info
   ```

### Backend Tests Not Found

1. **Verify test pattern matches**:
   ```bash
   cd backend
   npm test -- --listTests
   ```

2. **Check file naming**:
   - Must end with `.test.ts` or `.integration.test.ts`
   - Or be in `__tests__/` directory

### Frontend Tests Failing

1. **Check Jest setup**:
   ```bash
   cd frontend
   cat jest.setup.js  # Should exist
   ```

2. **Clear cache**:
   ```bash
   npm test -- --clearCache
   ```

## Next Steps

1. ✅ **Fixed**: Added missing Robolectric dependency
2. ✅ **Fixed**: Updated Jest test patterns
3. ⏳ **Todo**: Add more comprehensive test coverage
4. ⏳ **Todo**: Set up CI/CD test automation
5. ⏳ **Todo**: Add E2E tests for complete flows

## Test Files Summary

| Component | Test Files | Status |
|-----------|-----------|--------|
| Android SDK | 4 unit + 2 instrumentation | ✅ Fixed |
| iOS SDK | 1 comprehensive test file | ✅ Working |
| Backend | 3 unit + 1 integration + 1 performance | ✅ Fixed |
| Frontend | 2 component tests | ✅ Working |
| Integration | 1 flow test | ✅ Working |

**Total**: 15 test files with actual test implementations

