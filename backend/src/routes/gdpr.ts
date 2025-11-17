import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { prisma } from '../db/prisma';
import { clickhouseService } from '../services/clickhouse';

const userIdSchema = z.object({
  userId: z.string(),
});

export async function gdprRoutes(fastify: FastifyInstance) {
  // Export user data (GDPR right to data portability)
  fastify.post('/gdpr/export', async (request, reply) => {
    try {
      const body = userIdSchema.parse(request.body);
      const { userId } = body;

      // Collect all user data
      const userData: any = {
        userId,
        exportedAt: new Date().toISOString(),
        sessions: [],
        events: [],
      };

      // Get sessions
      const sessions = await prisma.session.findMany({
        where: {
          userId: userId,
        },
      });
      userData.sessions = sessions;

      // Get events from ClickHouse
      const events = await clickhouseService.queryEvents(
        `SELECT * FROM telemetry_events WHERE user_id = '${userId}' ORDER BY timestamp DESC LIMIT 10000`
      );
      userData.events = events;

      return {
        success: true,
        data: userData,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid payload',
          details: error.errors,
        });
      }

      logger.error('Error exporting user data:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // Delete user data (GDPR right to be forgotten)
  fastify.post('/gdpr/delete', async (request, reply) => {
    try {
      const body = userIdSchema.parse(request.body);
      const { userId } = body;

      // Delete sessions
      await prisma.session.deleteMany({
        where: {
          userId: userId,
        },
      });

      // Delete user
      await prisma.user.deleteMany({
        where: {
          userId: userId,
        },
      });

      // TODO: Delete events from ClickHouse
      // Note: ClickHouse doesn't support DELETE easily, may need to mark as deleted

      logger.info(`User data deleted for user: ${userId}`);

      return {
        success: true,
        message: 'User data deleted successfully',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid payload',
          details: error.errors,
        });
      }

      logger.error('Error deleting user data:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // Anonymize user data
  fastify.post('/gdpr/anonymize', async (request, reply) => {
    try {
      const body = userIdSchema.parse(request.body);
      const { userId } = body;

      const anonymousId = `anonymous_${Date.now()}`;

      // Update sessions
      await prisma.session.updateMany({
        where: {
          userId: userId,
        },
        data: {
          userId: anonymousId,
        },
      });

      // Update user
      await prisma.user.updateMany({
        where: {
          userId: userId,
        },
        data: {
          userId: anonymousId,
        },
      });

      // TODO: Anonymize events in ClickHouse

      logger.info(`User data anonymized for user: ${userId}`);

      return {
        success: true,
        message: 'User data anonymized successfully',
        anonymousId,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid payload',
          details: error.errors,
        });
      }

      logger.error('Error anonymizing user data:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });
}

