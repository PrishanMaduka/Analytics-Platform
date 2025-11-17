import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { redisService } from '../services/redis';
import { logger } from '../utils/logger';
import { prisma } from '../db/prisma';

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
      const environment = (request.query as any)?.environment || 'production';

      // Check cache first
      const cacheKey = `remote:${environment}`;
      const cached = await redisService.getCachedConfig(cacheKey);
      if (cached) {
        return cached;
      }

      // Fetch from database
      const configRecord = await prisma.remoteConfig.findFirst({
        where: {
          key: 'remote',
          environment: environment,
        },
        orderBy: {
          version: 'desc',
        },
      });

      let configData;
      if (configRecord) {
        configData = configRecord.value as any;
      } else {
        // Default config if none exists
        configData = {
          version: 1,
          samplingRate: 1.0,
          featureFlags: {},
          config: {},
        };
      }

      // Cache for 1 hour
      await redisService.cacheConfig(cacheKey, configData, 3600);

      return configData;
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
      const environment = (request.body as any)?.environment || 'production';

      // Get current version
      const currentConfig = await prisma.remoteConfig.findFirst({
        where: {
          key: 'remote',
          environment: environment,
        },
        orderBy: {
          version: 'desc',
        },
      });

      const newVersion = currentConfig ? currentConfig.version + 1 : 1;

      // Save to database
      await prisma.remoteConfig.upsert({
        where: {
          key: 'remote',
        },
        update: {
          value: body,
          version: newVersion,
          environment: environment,
        },
        create: {
          key: 'remote',
          value: body,
          version: newVersion,
          environment: environment,
        },
      });

      // Invalidate cache for all environments
      const cacheKey = `remote:${environment}`;
      await redisService.cacheConfig(cacheKey, body, 3600);

      logger.info('Remote config updated', {
        environment,
        version: newVersion,
      });

      return {
        success: true,
        message: 'Config updated',
        version: newVersion,
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

