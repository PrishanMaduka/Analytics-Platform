import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../db/prisma';
import { logger } from '../utils/logger';
import { config } from '../config';

/**
 * API Key authentication middleware.
 * Validates API key from Authorization header or x-api-key header.
 */
export async function apiKeyAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Extract API key from headers
  const authHeader = request.headers.authorization;
  const apiKeyHeader = request.headers[config.apiKeyHeader.toLowerCase()] as string;

  let apiKey: string | undefined;

  // Check Authorization header (Bearer token format)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    apiKey = authHeader.substring(7);
  } else if (authHeader && !authHeader.startsWith('Bearer ')) {
    // Allow plain API key in Authorization header
    apiKey = authHeader;
  } else if (apiKeyHeader) {
    // Check x-api-key header
    apiKey = apiKeyHeader;
  }

  if (!apiKey) {
    logger.warn('API key missing in request', {
      path: request.url,
      method: request.method,
    });
    return reply.code(401).send({
      success: false,
      error: 'Unauthorized',
      message: 'API key is required. Provide it in Authorization header (Bearer <key>) or x-api-key header.',
    });
  }

  try {
    // Look up API key in database
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
    });

    if (!apiKeyRecord) {
      logger.warn('Invalid API key provided', {
        path: request.url,
        method: request.method,
        keyPrefix: apiKey.substring(0, 8) + '...',
      });
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid API key',
      });
    }

    if (!apiKeyRecord.active) {
      logger.warn('Inactive API key used', {
        path: request.url,
        method: request.method,
        keyId: apiKeyRecord.id,
      });
      return reply.code(403).send({
        success: false,
        error: 'Forbidden',
        message: 'API key is inactive',
      });
    }

    // Update last used timestamp (fire and forget)
      prisma.apiKey
      .update({
        where: { id: apiKeyRecord.id },
        data: { lastUsedAt: new Date() },
      })// @ts-ignore
      .catch((error) => {
        logger.error('Error updating API key last used timestamp:', error);
      });

    // Attach API key info to request for use in handlers
    (request as any).apiKey = apiKeyRecord;
  } catch (error) {
    logger.error('Error validating API key:', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal server error',
      message: 'Error validating API key',
    });
  }
}

/**
 * Optional API key authentication - doesn't fail if key is missing.
 * Useful for endpoints that support both authenticated and unauthenticated access.
 */
export async function optionalApiKeyAuth(
  request: FastifyRequest,
  // @ts-ignore
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;
  const apiKeyHeader = request.headers[config.apiKeyHeader.toLowerCase()] as string;

  let apiKey: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    apiKey = authHeader.substring(7);
  } else if (authHeader && !authHeader.startsWith('Bearer ')) {
    apiKey = authHeader;
  } else if (apiKeyHeader) {
    apiKey = apiKeyHeader;
  }

  if (!apiKey) {
    // No API key provided, continue without authentication
    return;
  }

  try {
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
    });

    if (apiKeyRecord && apiKeyRecord.active) {
      (request as any).apiKey = apiKeyRecord;
      
      // Update last used timestamp
      prisma.apiKey
        .update({
          where: { id: apiKeyRecord.id },
          data: { lastUsedAt: new Date() },
        })// @ts-ignore
        .catch((error) => {
          logger.error('Error updating API key last used timestamp:', error);
        });
    }
  } catch (error) {
    logger.error('Error validating optional API key:', error);
    // Continue without authentication on error
  }
}

