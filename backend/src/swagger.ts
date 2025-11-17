import { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

/**
 * Swagger/OpenAPI documentation setup.
 */
export async function setupSwagger(server: FastifyInstance) {
  await server.register(swagger, {
    openapi: {
      info: {
        title: 'MxL Backend API',
        description: 'API documentation for MxL telemetry ingestion and processing',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'https://api.mxl.adlcom.com',
          description: 'Production',
        },
        {
          url: 'https://api-staging.mxl.adlcom.com',
          description: 'Staging',
        },
        {
          url: 'http://localhost:3000',
          description: 'Local',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await server.register(swaggerUi, {
    routePrefix: '/api-docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });
}

