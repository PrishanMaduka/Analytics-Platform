# MxL Platform Architecture

## Overview

The MxL platform consists of four main components:
1. **Mobile SDKs** (Android & iOS)
2. **Backend API** (Node.js/Fastify)
3. **Data Storage** (ClickHouse, PostgreSQL, Redis)
4. **Frontend Dashboard** (React/Next.js)

## Architecture Diagram

```
┌─────────────┐         ┌─────────────┐
│ Android SDK │         │   iOS SDK   │
└──────┬──────┘         └──────┬──────┘
       │                       │
       └───────────┬───────────┘
                   │ HTTPS/TLS 1.2+
                   │ OAuth 2.0
       ┌───────────▼───────────┐
       │   Load Balancer       │
       │   (HAProxy)           │
       └───────────┬───────────┘
                   │
       ┌───────────▼───────────┐
       │   WAF                │
       │   (Security Layer)   │
       └───────────┬───────────┘
                   │
       ┌───────────▼───────────┐
       │   API Gateway         │
       │   (Fastify)           │
       └───────────┬───────────┘
                   │
       ┌───────────▼───────────┐
       │   Kafka               │
       │   (Event Streaming)   │
       └───────────┬───────────┘
                   │
       ┌───────────▼───────────┐
       │   Stream Processor    │
       │   (Node.js Workers)  │
       └───────────┬───────────┘
                   │
       ┌───────────┴───────────┐
       │                       │
┌──────▼──────┐      ┌────────▼────────┐
│  ClickHouse  │      │   PostgreSQL    │
│ (Time-Series)│      │   (Metadata)    │
└──────────────┘      └─────────────────┘
       │
┌──────▼──────┐
│    Redis    │
│   (Cache)   │
└─────────────┘
       │
┌──────▼──────┐
│  Frontend   │
│  Dashboard  │
└─────────────┘
```

## Data Flow

1. **SDK Collection**: Mobile apps collect telemetry data
2. **Local Storage**: Data stored locally (SQLite/Core Data)
3. **Batch Upload**: Events batched and uploaded to backend
4. **API Gateway**: Receives and validates events
5. **Kafka**: Events published to Kafka topics
6. **Stream Processing**: Events enriched and processed
7. **Storage**: Processed events stored in ClickHouse
8. **Caching**: Recent events cached in Redis
9. **Dashboard**: Frontend queries data for visualization

## Components

### Mobile SDKs

**Responsibilities:**
- Collect telemetry data
- Handle offline storage
- Encrypt sensitive data
- Redact PII
- Batch and upload events

**Key Features:**
- Crash reporting
- Performance monitoring
- Network tracking
- User interaction tracking
- GDPR compliance

### Backend API

**Responsibilities:**
- Receive telemetry events
- Validate and enrich data
- Route to Kafka
- Process events
- Store in databases
- Serve frontend API

**Key Services:**
- Telemetry ingestion
- Stream processing
- Data retention
- Remote configuration
- GDPR compliance

### Data Storage

**ClickHouse:**
- Time-series telemetry data
- High-performance analytics
- 90-day TTL for events
- 365-day TTL for metrics

**PostgreSQL:**
- User and session metadata
- Remote configuration
- Alert rules
- System configuration

**Redis:**
- Event caching
- Session tracking
- Real-time metrics
- Config caching

### Frontend Dashboard

**Responsibilities:**
- Visualize telemetry data
- Display crash reports
- Show performance metrics
- Configure alerts
- Manage remote config

**Key Features:**
- Real-time dashboards
- Crash analysis
- Network monitoring
- User journey visualization
- Alert management

## Security

- **Encryption**: AES-256 for data at rest
- **Transport**: TLS 1.2+ for data in transit
- **PII**: Automatic detection and redaction
- **Auth**: OAuth 2.0 for API access
- **Pinning**: Optional certificate pinning

## Scalability

- **Horizontal Scaling**: Kafka consumer groups
- **Caching**: Redis for fast access
- **Batch Processing**: Efficient data handling
- **Load Balancing**: HAProxy for distribution
- **Auto-scaling**: Cloud-native architecture ready

## Monitoring

- **Health Checks**: /health and /ready endpoints
- **Metrics**: Real-time performance metrics
- **Logging**: Winston for backend logging
- **Alerts**: Configurable alert rules
- **Dashboards**: Comprehensive visualization

