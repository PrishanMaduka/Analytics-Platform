import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { telemetryService } from '../services/telemetry';
import { logger } from '../utils/logger';
import { apiKeyAuth } from '../middleware/apiKeyAuth';

const telemetrySchema = z.object({
  sessionId: z.string(),
  userId: z.string().optional(),
  eventType: z.enum(['crash', 'performance', 'network', 'interaction', 'log', 'trace']),
  timestamp: z.number(),
  data: z.record(z.any()),
  deviceInfo: z.object({
    platform: z.string(),
    osVersion: z.string(),
    deviceModel: z.string(),
    appVersion: z.string(),
  }),
});

export async function telemetryRoutes(fastify: FastifyInstance) {
  // Apply API key authentication to all telemetry routes
  fastify.addHook('preHandler', apiKeyAuth);

  fastify.post('/telemetry', async (request, reply) => {
    try {
      const body = telemetrySchema.parse(request.body);
      
      await telemetryService.processTelemetry(body, request);
      
      return {
        success: true,
        message: 'Telemetry received',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Invalid telemetry payload:', error.errors);
        return reply.code(400).send({
          success: false,
          error: 'Invalid payload',
          details: error.errors,
        });
      }
      
      logger.error('Error processing telemetry:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  fastify.post('/telemetry/batch', async (request, reply) => {
    try {
      const schema = z.object({
        events: z.array(telemetrySchema),
      });
      
      const body = schema.parse(request.body);
      
      await telemetryService.processBatch(body.events);
      
      return {
        success: true,
        message: `Processed ${body.events.length} events`,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Invalid batch payload:', error.errors);
        return reply.code(400).send({
          success: false,
          error: 'Invalid payload',
          details: error.errors,
        });
      }
      
      logger.error('Error processing batch:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });
}

