import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { config } from './config';
import { logger } from './utils/logger';
import { telemetryRoutes } from './routes/telemetry';
import { healthRoutes } from './routes/health';
import { configRoutes } from './routes/config';
import { gdprRoutes } from './routes/gdpr';
import { startConsumers } from './kafka/consumer';
import { clickhouseService } from './services/clickhouse';
import { dataRetentionService } from './services/dataRetention';
import { setupSwagger } from './swagger';
import { metricsCollector } from './utils/metrics';

const server = Fastify({
  logger: false, // Using custom logger
});

export async function build() {
  // Register plugins
  await server.register(helmet);
  await server.register(cors, {
    origin: config.corsOrigins,
  });
  await server.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });
  
  // Setup Swagger documentation
  if (config.nodeEnv !== 'production') {
    await setupSwagger(server);
  }

  // Initialize services (skip in test mode)
  if (process.env.NODE_ENV !== 'test') {
    await clickhouseService.initialize();
    await startConsumers();
    
    // Schedule data retention (run daily)
    setInterval(() => {
      dataRetentionService.runRetentionPolicies().catch((err) => {
        logger.error('Error in retention policy:', err);
      });
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  // Register routes
  await server.register(healthRoutes);
  await server.register(telemetryRoutes, { prefix: '/api/v1' });
  await server.register(configRoutes, { prefix: '/api/v1' });
  await server.register(gdprRoutes, { prefix: '/api/v1' });

  // Metrics endpoint
  server.get('/metrics', async (request, reply) => {
    reply.type('text/plain');
    return metricsCollector.getPrometheusFormat();
  });

  return server;
}

async function start() {
  try {
    const app = await build();

    // Start server
    const address = await app.listen({
      port: config.port,
      host: config.host,
    });

    logger.info(`Server listening on ${address}`);
  } catch (err) {
    logger.error('Error starting server:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await server.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await server.close();
  process.exit(0);
});

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test' && require.main === module) {
  start();
}
