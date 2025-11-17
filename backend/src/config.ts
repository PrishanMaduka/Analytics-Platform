import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/mxl',
  
  // Redis
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  redisPassword: process.env.REDIS_PASSWORD,
  
  // Kafka
  kafkaBrokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
  kafkaClientId: process.env.KAFKA_CLIENT_ID || 'mxl-backend',
  
  // ClickHouse
  clickhouseHost: process.env.CLICKHOUSE_HOST || 'localhost',
  clickhousePort: parseInt(process.env.CLICKHOUSE_PORT || '8123', 10),
  clickhouseDatabase: process.env.CLICKHOUSE_DATABASE || 'mxl',
  
  // OAuth
  oauthClientId: process.env.OAUTH_CLIENT_ID || '',
  oauthClientSecret: process.env.OAUTH_CLIENT_SECRET || '',
  oauthIssuer: process.env.OAUTH_ISSUER || '',
  
  // CORS
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  
  // API
  apiKeyHeader: process.env.API_KEY_HEADER || 'x-api-key',
  
  // S3/MinIO for archiving
  s3Endpoint: process.env.S3_ENDPOINT || '',
  s3AccessKey: process.env.S3_ACCESS_KEY || '',
  s3SecretKey: process.env.S3_SECRET_KEY || '',
  s3Bucket: process.env.S3_BUCKET || 'mxl-archive',
  s3Region: process.env.S3_REGION || 'us-east-1',
  enableArchiving: process.env.ENABLE_ARCHIVING === 'true',
};

