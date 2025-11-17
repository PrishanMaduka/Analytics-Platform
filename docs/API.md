# MxL API Documentation

## Base URL

```
Production: https://api.mxl.adlcom.com
Staging: https://api-staging.mxl.adlcom.com
```

## Authentication

All API requests require authentication via API key in the Authorization header:

```
Authorization: Bearer <your-api-key>
```

## Endpoints

### Health Check

#### GET /health

Check API health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600
}
```

#### GET /ready

Check if API is ready to accept requests.

**Response:**
```json
{
  "status": "ready",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Telemetry

#### POST /api/v1/telemetry

Submit a single telemetry event.

**Request Body:**
```json
{
  "sessionId": "string (required)",
  "userId": "string (optional)",
  "eventType": "crash | performance | network | interaction | log | trace",
  "timestamp": 1234567890,
  "data": {
    "key": "value"
  },
  "deviceInfo": {
    "platform": "Android | iOS",
    "osVersion": "string",
    "deviceModel": "string",
    "appVersion": "string"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Telemetry received"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid payload
- `401` - Unauthorized
- `500` - Internal server error

#### POST /api/v1/telemetry/batch

Submit a batch of telemetry events.

**Request Body:**
```json
{
  "events": [
    {
      "sessionId": "string",
      "eventType": "string",
      "timestamp": 1234567890,
      "data": {},
      "deviceInfo": {}
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Processed 10 events"
}
```

### Remote Configuration

#### GET /api/v1/config

Get remote configuration for SDK.

**Response:**
```json
{
  "version": 1,
  "samplingRate": 1.0,
  "featureFlags": {
    "enableFeatureX": true,
    "enableFeatureY": false
  },
  "config": {
    "key": "value"
  }
}
```

#### POST /api/v1/config

Update remote configuration (admin only).

**Request Body:**
```json
{
  "version": 2,
  "samplingRate": 0.8,
  "featureFlags": {
    "enableFeatureX": true
  },
  "config": {
    "key": "value"
  }
}
```

### GDPR Compliance

#### POST /api/v1/gdpr/export

Export user data (GDPR right to data portability).

**Request Body:**
```json
{
  "userId": "user-123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user-123",
    "exportedAt": "2024-01-15T10:30:00Z",
    "sessions": [],
    "events": []
  }
}
```

#### POST /api/v1/gdpr/delete

Delete user data (GDPR right to be forgotten).

**Request Body:**
```json
{
  "userId": "user-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User data deleted successfully"
}
```

#### POST /api/v1/gdpr/anonymize

Anonymize user data.

**Request Body:**
```json
{
  "userId": "user-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User data anonymized successfully",
  "anonymousId": "anonymous_1234567890"
}
```

## Rate Limiting

- Default: 100 requests per minute per API key
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": {}
}
```

## SDK Event Types

### Crash Events
```json
{
  "eventType": "crash",
  "data": {
    "exceptionType": "NullPointerException",
    "exceptionMessage": "Attempt to invoke virtual method",
    "stackTrace": "...",
    "threadInfo": {}
  }
}
```

### Performance Events
```json
{
  "eventType": "performance",
  "data": {
    "metric": "startup_time",
    "value": 1234,
    "unit": "ms"
  }
}
```

### Network Events
```json
{
  "eventType": "network",
  "data": {
    "url": "https://api.example.com/endpoint",
    "method": "GET",
    "statusCode": 200,
    "duration": 150,
    "requestSize": 1024,
    "responseSize": 2048
  }
}
```

### Interaction Events
```json
{
  "eventType": "interaction",
  "data": {
    "type": "screen_view | tap | custom",
    "screenName": "MainActivity",
    "properties": {}
  }
}
```

