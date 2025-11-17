import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { redisService } from '../services/redis';
import { logger } from '../utils/logger';

const configSchema = z.object({
  version: z.number(),
  samplingRate: z.number().optional(),
  featureFlags: z.record(z.boolean()).optional(),
  config: z.record(z.string()).optional(),
});

export async function configRoutes(fastify: FastifyInstance) {
  // Get remote config
  fastify.get('/config', async (request, reply) => {
    try {
      // Check cache first
      const cached = await redisService.getCachedConfig('remote');
      if (cached) {
        return cached;
      }

      // TODO: Fetch from database
      const defaultConfig = {
        version: 1,
        samplingRate: 1.0,
        featureFlags: {},
        config: {},
      };

      // Cache for 1 hour
      await redisService.cacheConfig('remote', defaultConfig, 3600);

      return defaultConfig;
    } catch (error) {
      logger.error('Error getting config:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // Update remote config (admin only)
  fastify.post('/config', async (request, reply) => {
    try {
      const body = configSchema.parse(request.body);

      // TODO: Save to database
      // TODO: Invalidate cache
      await redisService.cacheConfig('remote', body, 3600);

      return {
        success: true,
        message: 'Config updated',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid payload',
          details: error.errors,
        });
      }

      logger.error('Error updating config:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });
}

