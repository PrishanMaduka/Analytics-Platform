import { FastifyInstance } from 'fastify';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  fastify.get('/ready', async (request, reply) => {
    // TODO: Check database, Redis, Kafka connections
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  });
}

