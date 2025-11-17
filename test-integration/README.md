# Integration Test Suite

End-to-end integration tests for the MxL platform.

## Test Scenarios

### SDK to Backend Integration
- Telemetry event flow from SDK to backend
- Batch processing
- Error handling and retries

### Backend to Storage Integration
- Kafka to ClickHouse data flow
- Redis caching
- Data retention policies

### Frontend to Backend Integration
- API calls from dashboard
- Real-time data updates
- Error handling

## Running Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific test suite
npm run test:integration -- --grep "telemetry"
```

