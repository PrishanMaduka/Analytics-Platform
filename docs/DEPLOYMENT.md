# Deployment Guide

This guide covers deploying the MxL Mobile SDK platform to production.

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL 15+
- Redis 7+
- Kafka 2.8+
- ClickHouse latest
- Node.js 20+ (for backend)
- pnpm package manager

## Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=production

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@postgres-host:5432/mxl

# Redis
REDIS_HOST=redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Kafka
KAFKA_BROKERS=kafka-host:9092
KAFKA_CLIENT_ID=mxl-backend

# ClickHouse
CLICKHOUSE_HOST=clickhouse-host
CLICKHOUSE_PORT=8123
CLICKHOUSE_DATABASE=mxl

# OAuth 2.0 (Optional)
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret
OAUTH_ISSUER=https://your-oauth-issuer.com

# CORS
CORS_ORIGINS=https://your-frontend-domain.com

# API Configuration
API_KEY_HEADER=x-api-key

# S3/MinIO for Archiving (Optional)
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=mxl-archive
S3_REGION=us-east-1
ENABLE_ARCHIVING=true

# IP Geolocation (Optional)
ENABLE_IP_GEOLOCATION=true
```

### Frontend Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```bash
NEXT_PUBLIC_API_URL=https://api.mxl.adlcom.com
NEXT_PUBLIC_AUTH_ENABLED=true
```

## Docker Deployment

### Using Docker Compose

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **Run database migrations:**
   ```bash
   docker-compose exec backend pnpm prisma migrate deploy
   ```

3. **Initialize ClickHouse tables:**
   ```bash
   docker-compose exec backend node dist/index.js
   # Tables are auto-initialized on startup
   ```

4. **Verify services:**
   ```bash
   docker-compose ps
   curl http://localhost:3000/health
   ```

### Individual Service Deployment

#### Backend

```bash
cd backend
docker build -t mxl-backend:latest .
docker run -d \
  --name mxl-backend \
  -p 3000:3000 \
  --env-file .env \
  mxl-backend:latest
```

#### Frontend

```bash
cd frontend
docker build -t mxl-frontend:latest .
docker run -d \
  --name mxl-frontend \
  -p 3001:3001 \
  --env-file .env.local \
  mxl-frontend:latest
```

## Infrastructure Requirements

### Minimum Requirements

- **Backend**: 2 CPU cores, 4GB RAM, 20GB storage
- **Frontend**: 1 CPU core, 2GB RAM, 10GB storage
- **PostgreSQL**: 2 CPU cores, 4GB RAM, 100GB storage
- **Redis**: 1 CPU core, 2GB RAM, 10GB storage
- **Kafka**: 2 CPU cores, 4GB RAM, 50GB storage
- **ClickHouse**: 4 CPU cores, 8GB RAM, 500GB storage

### Production Recommendations

- **Backend**: 4 CPU cores, 8GB RAM, 50GB storage (with auto-scaling)
- **Frontend**: 2 CPU cores, 4GB RAM, 20GB storage
- **PostgreSQL**: 4 CPU cores, 16GB RAM, 500GB storage (with replication)
- **Redis**: 2 CPU cores, 8GB RAM, 50GB storage (with cluster)
- **Kafka**: 4 CPU cores, 16GB RAM, 200GB storage (with cluster)
- **ClickHouse**: 8 CPU cores, 32GB RAM, 2TB storage (with replication)

## Database Setup

### PostgreSQL

1. **Create database:**
   ```sql
   CREATE DATABASE mxl;
   CREATE USER mxl WITH PASSWORD 'your-password';
   GRANT ALL PRIVILEGES ON DATABASE mxl TO mxl;
   ```

2. **Run migrations:**
   ```bash
   cd backend
   pnpm prisma migrate deploy
   ```

3. **Create API keys:**
   ```sql
   INSERT INTO "ApiKey" (id, key, name, description, active)
   VALUES (
     gen_random_uuid(),
     'your-api-key-here',
     'Production API Key',
     'Main API key for production',
     true
   );
   ```

### ClickHouse

1. **Create database:**
   ```sql
   CREATE DATABASE IF NOT EXISTS mxl;
   ```

2. **Tables are auto-created** on backend startup via `clickhouseService.initialize()`

## Security Configuration

### API Key Management

1. Generate secure API keys:
   ```bash
   openssl rand -hex 32
   ```

2. Store in database (see PostgreSQL setup above)

3. Configure SDKs with API keys:
   - Android: Set in `SdkConfiguration.Builder().apiKey()`
   - iOS: Set in `SdkConfiguration(apiKey:)`

### Certificate Pinning (iOS)

1. Extract server certificate:
   ```bash
   openssl s_client -connect api.mxl.adlcom.com:443 -showcerts
   ```

2. Convert to base64:
   ```bash
   openssl x509 -in certificate.pem -outform der | base64
   ```

3. Add to iOS SDK configuration:
   ```swift
   SdkConfiguration(
       apiKey: "your-api-key",
       endpoint: "https://api.mxl.adlcom.com",
       enableCertificatePinning: true,
       certificatePins: ["base64-encoded-certificate"]
   )
   ```

## Monitoring & Observability

### Prometheus Metrics

Metrics are available at `/metrics` endpoint:

```bash
curl http://localhost:3000/metrics
```

### Health Checks

- **Health**: `GET /health` - Basic health check
- **Readiness**: `GET /ready` - Checks all dependencies

### Logging

Logs are structured JSON format. Configure log levels via environment:

```bash
LOG_LEVEL=info  # debug, info, warn, error
```

## Scaling

### Horizontal Scaling

1. **Backend**: Deploy multiple instances behind load balancer
2. **Frontend**: Deploy multiple instances behind CDN
3. **Kafka**: Use Kafka cluster with multiple brokers
4. **ClickHouse**: Use ClickHouse cluster with replication

### Load Balancer Configuration

- Health check endpoint: `/health`
- Readiness check: `/ready`
- Sticky sessions: Not required (stateless API)

## Backup & Recovery

### Database Backups

```bash
# PostgreSQL
pg_dump -h localhost -U mxl mxl > backup.sql

# ClickHouse
clickhouse-client --query "SELECT * FROM telemetry_events" > backup.csv
```

### Data Archiving

Archiving to S3/MinIO is configured via environment variables. Archived data is stored in:
```
s3://mxl-archive/archives/YYYY/MM/DD/events-timestamp.json.gz
```

## Troubleshooting

### Common Issues

1. **Database connection errors:**
   - Check `DATABASE_URL` format
   - Verify PostgreSQL is accessible
   - Check firewall rules

2. **Kafka connection errors:**
   - Verify Kafka brokers are running
   - Check `KAFKA_BROKERS` configuration
   - Verify network connectivity

3. **ClickHouse errors:**
   - Check ClickHouse is accessible
   - Verify table initialization completed
   - Check disk space

4. **API key authentication failures:**
   - Verify API key exists in database
   - Check API key is active
   - Verify key format in SDK configuration

## Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] API keys created and secured
- [ ] SSL/TLS certificates configured
- [ ] Certificate pinning configured (iOS)
- [ ] Monitoring and alerting set up
- [ ] Backup strategy implemented
- [ ] Load balancer configured
- [ ] CDN configured (frontend)
- [ ] Log aggregation configured
- [ ] Security review completed
- [ ] Performance testing completed
- [ ] Disaster recovery plan documented

## Support

For deployment assistance, contact:
- Email: mxl-support@adlcom.com
- Documentation: `/docs/` directory
- API Docs: `http://your-backend-url/api-docs`

