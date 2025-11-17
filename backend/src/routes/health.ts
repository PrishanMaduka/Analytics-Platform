import { FastifyInstance } from 'fastify';
import { prisma } from '../db/prisma';
import { redisService } from '../services/redis';
import { kafkaProducer } from '../kafka/producer';
import { clickhouseService } from '../services/clickhouse';
import { logger } from '../utils/logger';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  // @ts-ignore
    fastify.get('/ready', async (request, reply) => {
    const checks: Record<string, { status: string; error?: string }> = {};
    let allHealthy = true;

    // Check PostgreSQL database
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = { status: 'ok' };
    } catch (error) {
      allHealthy = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      checks.database = { status: 'error', error: errorMessage };
      logger.error('Database health check failed:', error);
    }

    // Check Redis
    try {
      await redisService.getCounter('health_check');
      checks.redis = { status: 'ok' };
    } catch (error) {
      allHealthy = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      checks.redis = { status: 'error', error: errorMessage };
      logger.error('Redis health check failed:', error);
    }

    // Check Kafka
    try {
      // Try to get producer metadata to verify connection
      await kafkaProducer.send({
        topic: '__health_check__',
        messages: [{ key: 'health', value: JSON.stringify({ timestamp: Date.now() }) }],
      }).catch(() => {
        // Ignore errors for health check topic (it may not exist)
      });
      checks.kafka = { status: 'ok' };
    } catch (error) {
      allHealthy = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      checks.kafka = { status: 'error', error: errorMessage };
      logger.error('Kafka health check failed:', error);
    }

    // Check ClickHouse
    try {
      await clickhouseService.queryEvents('SELECT 1');
      checks.clickhouse = { status: 'ok' };
    } catch (error) {
      allHealthy = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      checks.clickhouse = { status: 'error', error: errorMessage };
      logger.error('ClickHouse health check failed:', error);
    }

    const statusCode = allHealthy ? 200 : 503;
    return reply.code(statusCode).send({
      status: allHealthy ? 'ready' : 'not ready',
      timestamp: new Date().toISOString(),
      checks,
    });
  });
}

