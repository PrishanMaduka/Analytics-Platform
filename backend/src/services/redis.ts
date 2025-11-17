import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';
import { ProcessedEvent } from './streamProcessor';

let redisClient: Redis | null = null;

/**
 * Get Redis client instance.
 */
function getClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: config.redisHost,
      port: config.redisPort,
      password: config.redisPassword,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisClient.on('error', (error) => {
      logger.error('Redis error:', error);
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });
  }
  return redisClient;
}

class RedisService {
  /**
   * Cache a single event.
   */
  async cacheEvent(event: ProcessedEvent): Promise<void> {
    try {
      const client = getClient();
      const key = `event:${event.sessionId}:${event.timestamp}`;
      const value = JSON.stringify(event);

      // Cache for 24 hours
      await client.setex(key, 86400, value);

      // Add to session events list
      const sessionKey = `session:${event.sessionId}:events`;
      await client.lpush(sessionKey, key);
      await client.expire(sessionKey, 86400);
    } catch (error) {
      logger.error('Error caching event:', error);
    }
  }

  /**
   * Cache batch of events.
   */
  async cacheBatch(events: ProcessedEvent[]): Promise<void> {
    try {
      const client = getClient();
      const pipeline = client.pipeline();

      for (const event of events) {
        const key = `event:${event.sessionId}:${event.timestamp}`;
        const value = JSON.stringify(event);
        pipeline.setex(key, 86400, value);

        const sessionKey = `session:${event.sessionId}:events`;
        pipeline.lpush(sessionKey, key);
        pipeline.expire(sessionKey, 86400);
      }

      await pipeline.exec();
    } catch (error) {
      logger.error('Error caching batch:', error);
    }
  }

  /**
   * Get cached event.
   */
  async getCachedEvent(sessionId: string, timestamp: number): Promise<ProcessedEvent | null> {
    try {
      const client = getClient();
      const key = `event:${sessionId}:${timestamp}`;
      const value = await client.get(key);

      if (value) {
        return JSON.parse(value) as ProcessedEvent;
      }
      return null;
    } catch (error) {
      logger.error('Error getting cached event:', error);
      return null;
    }
  }

  /**
   * Get session events.
   */
  async getSessionEvents(sessionId: string, limit: number = 100): Promise<ProcessedEvent[]> {
    try {
      const client = getClient();
      const sessionKey = `session:${sessionId}:events`;
      const eventKeys = await client.lrange(sessionKey, 0, limit - 1);

      if (eventKeys.length === 0) {
        return [];
      }

      const values = await client.mget(...eventKeys);
      return values
        .filter((v): v is string => v !== null)
        .map((v) => JSON.parse(v) as ProcessedEvent);
    } catch (error) {
      logger.error('Error getting session events:', error);
      return [];
    }
  }

  /**
   * Increment counter.
   */
  async incrementCounter(key: string): Promise<number> {
    try {
      const client = getClient();
      return await client.incr(key);
    } catch (error) {
      logger.error('Error incrementing counter:', error);
      return 0;
    }
  }

  /**
   * Set key expiry.
   */
  async setExpiry(key: string, seconds: number): Promise<void> {
    try {
      const client = getClient();
      await client.expire(key, seconds);
    } catch (error) {
      logger.error('Error setting expiry:', error);
    }
  }

  /**
   * Get counter value.
   */
  async getCounter(key: string): Promise<number> {
    try {
      const client = getClient();
      const value = await client.get(key);
      return value ? parseInt(value, 10) : 0;
    } catch (error) {
      logger.error('Error getting counter:', error);
      return 0;
    }
  }

  /**
   * Cache remote config.
   */
  async cacheConfig(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      const client = getClient();
      await client.setex(`config:${key}`, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error('Error caching config:', error);
    }
  }

  /**
   * Get cached config.
   */
  async getCachedConfig(key: string): Promise<any | null> {
    try {
      const client = getClient();
      const value = await client.get(`config:${key}`);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Error getting cached config:', error);
      return null;
    }
  }
}

export const redisService = new RedisService();

