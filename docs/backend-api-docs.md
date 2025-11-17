# Backend API Documentation

## OpenAPI/Swagger Specification

The backend API follows OpenAPI 3.0 specification. Swagger documentation is available at:

```
http://localhost:3000/api-docs
```

## Authentication

All endpoints require authentication via API key:

```
Authorization: Bearer <api-key>
```

## Endpoints Overview

### Health & Status

- `GET /health` - Health check
- `GET /ready` - Readiness check

### Telemetry

- `POST /api/v1/telemetry` - Submit single event
- `POST /api/v1/telemetry/batch` - Submit batch of events

### Configuration

- `GET /api/v1/config` - Get remote configuration
- `POST /api/v1/config` - Update configuration (admin)

### GDPR

- `POST /api/v1/gdpr/export` - Export user data
- `POST /api/v1/gdpr/delete` - Delete user data
- `POST /api/v1/gdpr/anonymize` - Anonymize user data

## Request/Response Examples

### Submit Telemetry Event

**Request:**
```bash
curl -X POST https://api.mxl.adlcom.com/api/v1/telemetry \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-123",
    "eventType": "crash",
    "timestamp": 1705312200000,
    "data": {
      "exceptionType": "NullPointerException",
      "exceptionMessage": "Test error"
    },
    "deviceInfo": {
      "platform": "Android",
      "osVersion": "11",
      "deviceModel": "Pixel 5",
      "appVersion": "1.0.0"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Telemetry received"
}
```

### Batch Telemetry

**Request:**
```bash
curl -X POST https://api.mxl.adlcom.com/api/v1/telemetry/batch \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      {
        "sessionId": "session-1",
        "eventType": "performance",
        "timestamp": 1705312200000,
        "data": {"metric": "startup_time", "value": 1000},
        "deviceInfo": {...}
      }
    ]
  }'
```

## Error Handling

### Validation Error (400)

```json
{
  "success": false,
  "error": "Invalid payload",
  "details": [
    {
      "path": "sessionId",
      "message": "Required"
    }
  ]
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### Rate Limit (429)

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

## Rate Limits

- Default: 100 requests/minute per API key
- Burst: 10 requests/second
- Headers:
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: 95
  - `X-RateLimit-Reset`: 1705312260

## Data Models

### TelemetryEvent

```typescript
interface TelemetryEvent {
  sessionId: string;
  userId?: string;
  eventType: 'crash' | 'performance' | 'network' | 'interaction' | 'log' | 'trace';
  timestamp: number;
  data: Record<string, any>;
  deviceInfo: {
    platform: string;
    osVersion: string;
    deviceModel: string;
    appVersion: string;
  };
}
```

### RemoteConfig

```typescript
interface RemoteConfig {
  version: number;
  samplingRate?: number;
  featureFlags: Record<string, boolean>;
  config: Record<string, string>;
}
```

## Webhooks (Future)

Webhook support for real-time event notifications (planned for future release).

## SDK Compatibility

- Android SDK: 1.0.0+
- iOS SDK: 1.0.0+

## Support

For API issues:
- Email: api-support@adlcom.com
- Documentation: https://docs.mxl.adlcom.com

