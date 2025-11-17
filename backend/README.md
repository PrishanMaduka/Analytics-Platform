# MxL Backend

Node.js/Fastify backend for telemetry ingestion and processing.

## Features

- Telemetry ingestion API
- Kafka integration for event streaming
- PostgreSQL for metadata storage
- Redis for caching
- ClickHouse integration for analytics
- OAuth 2.0 authentication
- Rate limiting and security

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up database:
```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Start development server:
```bash
npm run dev
```

## API Endpoints

### Health Check
- `GET /health` - Health check
- `GET /ready` - Readiness check

### Telemetry
- `POST /api/v1/telemetry` - Submit single telemetry event
- `POST /api/v1/telemetry/batch` - Submit batch of events

## Technology Stack

- **Framework**: Fastify
- **Database**: PostgreSQL (Prisma ORM)
- **Cache**: Redis
- **Message Queue**: Kafka
- **Analytics**: ClickHouse
- **Validation**: Zod
- **Logging**: Winston

## License

Copyright © ADLcom Limited

