import { logger } from '../utils/logger';
import { clickhouseService } from './clickhouse';
import { redisService } from './redis';
import { prisma } from '../db/prisma';

/**
 * Data retention service for managing data lifecycle.
 */
class DataRetentionService {
  /**
   * Run retention policies.
   */
  async runRetentionPolicies(): Promise<void> {
    try {
      logger.info('Running data retention policies...');

      // Clean up old telemetry events (ClickHouse TTL handles this automatically)
      await this.cleanupOldTelemetryEvents();

      // Clean up old session data
      await this.cleanupOldSessions();

      // Clean up old Redis cache
      await this.cleanupOldCache();

      // Archive old data if needed
      await this.archiveOldData();

      logger.info('Data retention policies completed');
    } catch (error) {
      logger.error('Error running retention policies:', error);
    }
  }

  /**
   * Clean up old telemetry events.
   * Note: ClickHouse TTL handles automatic deletion, but we can trigger manual cleanup.
   */
  private async cleanupOldTelemetryEvents(): Promise<void> {
    try {
      // ClickHouse automatically deletes data based on TTL
      // This is just for logging/monitoring
      logger.debug('Telemetry events cleanup handled by ClickHouse TTL');
    } catch (error) {
      logger.error('Error cleaning up telemetry events:', error);
    }
  }

  /**
   * Clean up old session data from PostgreSQL.
   */
  private async cleanupOldSessions(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days retention

      const result = await prisma.session.deleteMany({
        where: {
          endedAt: {
            lt: cutoffDate,
          },
        },
      });

      logger.info(`Cleaned up ${result.count} old sessions`);
    } catch (error) {
      logger.error('Error cleaning up sessions:', error);
    }
  }

  /**
   * Clean up old cache entries from Redis.
   */
  private async cleanupOldCache(): Promise<void> {
    try {
      // Redis automatically expires keys based on TTL
      // This is just for monitoring
      logger.debug('Cache cleanup handled by Redis TTL');
    } catch (error) {
      logger.error('Error cleaning up cache:', error);
    }
  }

  /**
   * Archive old data to cold storage.
   */
  private async archiveOldData(): Promise<void> {
    try {
      // TODO: Implement archiving to S3/MinIO for long-term storage
      logger.debug('Data archiving not yet implemented');
    } catch (error) {
      logger.error('Error archiving data:', error);
    }
  }

  /**
   * Get data retention statistics.
   */
  async getRetentionStats(): Promise<{
    telemetryEvents: number;
    sessions: number;
    cacheSize: number;
  }> {
    try {
      // Get approximate counts
      const sessionCount = await prisma.session.count({
        where: {
          endedAt: null, // Active sessions
        },
      });

      return {
        telemetryEvents: 0, // ClickHouse doesn't provide easy count
        sessions: sessionCount,
        cacheSize: 0, // Redis doesn't provide easy size
      };
    } catch (error) {
      logger.error('Error getting retention stats:', error);
      return {
        telemetryEvents: 0,
        sessions: 0,
        cacheSize: 0,
      };
    }
  }
}

export const dataRetentionService = new DataRetentionService();

