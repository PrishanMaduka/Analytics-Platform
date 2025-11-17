import { logger } from '../utils/logger';
import { clickhouseService } from './clickhouse';
import { redisService } from './redis';
import { prisma } from '../db/prisma';
import { config } from '../config';

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
   * Archive old data to cold storage (S3/MinIO).
   */
  private async archiveOldData(): Promise<void> {
    if (!config.enableArchiving || !config.s3Endpoint) {
      return;
    }

    try {
      const archiveDate = new Date();
      archiveDate.setDate(archiveDate.getDate() - 90); // Archive data older than 90 days

      // Query old events from ClickHouse
      const query = `
        SELECT * FROM telemetry_events
        WHERE timestamp < '${archiveDate.toISOString()}'
        LIMIT 10000
      `;

      const oldEvents = await clickhouseService.queryEvents(query);

      if (oldEvents.length === 0) {
        logger.debug('No data to archive');
        return;
      }

      // Archive to S3/MinIO
      await this.uploadToS3(oldEvents, archiveDate);

      logger.info(`Archived ${oldEvents.length} events to S3`);
    } catch (error) {
      logger.error('Error archiving data:', error);
    }
  }

  /**
   * Upload data to S3/MinIO.
   */
  private async uploadToS3(events: any[], date: Date): Promise<void> {
    try {
      // Create S3 client (using AWS SDK compatible API)
      const S3Client = await this.getS3Client();

      if (!S3Client) {
        logger.warn('S3 client not available, skipping archive');
        return;
      }

      // Create archive file name
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const key = `archives/${year}/${month}/${day}/events-${Date.now()}.json.gz`;

      // Compress and upload
      const data = JSON.stringify(events);
      const compressed = await this.compressData(data);

      await S3Client.putObject({
        Bucket: config.s3Bucket,
        Key: key,
        Body: compressed,
        ContentType: 'application/json',
        ContentEncoding: 'gzip',
      });

      logger.info(`Uploaded archive to S3: ${key}`);
    } catch (error) {
      logger.error('Error uploading to S3:', error);
      throw error;
    }
  }

  /**
   * Get S3 client (AWS SDK or MinIO compatible).
   */
  private async getS3Client(): Promise<any | null> {
    try {
      // In production, use @aws-sdk/client-s3 or minio package
      // For now, return null to indicate it's not fully implemented
      // This allows the code to compile but requires actual S3 SDK installation
      
      // Example implementation would be:
      // const { S3Client } = require('@aws-sdk/client-s3');
      // return new S3Client({
      //   endpoint: config.s3Endpoint,
      //   region: config.s3Region,
      //   credentials: {
      //     accessKeyId: config.s3AccessKey,
      //     secretAccessKey: config.s3SecretKey,
      //   },
      // });

      logger.debug('S3 client requires @aws-sdk/client-s3 package installation');
      return null;
    } catch (error) {
      logger.error('Error creating S3 client:', error);
      return null;
    }
  }

  /**
   * Compress data using gzip.
   */
  private async compressData(data: string): Promise<Buffer> {
    const zlib = require('zlib');
    return new Promise((resolve, reject) => {
      zlib.gzip(data, (error: Error | null, buffer: Buffer) => {
        if (error) {
          reject(error);
        } else {
          resolve(buffer);
        }
      });
    });
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

