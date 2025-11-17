import { createClient } from '@clickhouse/client';
import { config } from '../config';
import { logger } from '../utils/logger';
import { ProcessedEvent } from './streamProcessor';

let clickhouseClient: ReturnType<typeof createClient> | null = null;

/**
 * Initialize ClickHouse client.
 */
function getClient() {
  if (!clickhouseClient) {
    clickhouseClient = createClient({
      host: `http://${config.clickhouseHost}:${config.clickhousePort}`,
      database: config.clickhouseDatabase,
    });
  }
  return clickhouseClient;
}

class ClickHouseService {
  /**
   * Initialize ClickHouse tables.
   */
  async initialize(): Promise<void> {
    try {
      const client = getClient();

      // Create events table
      await client.exec(`
        CREATE TABLE IF NOT EXISTS telemetry_events (
          session_id String,
          user_id Nullable(String),
          event_type String,
          timestamp DateTime64(3),
          server_timestamp DateTime64(3),
          data String,
          device_info String,
          enriched String,
          metrics String
        ) ENGINE = MergeTree()
        ORDER BY (event_type, timestamp)
        PARTITION BY toYYYYMM(timestamp)
        TTL timestamp + INTERVAL 90 DAY
      `);

      // Create metrics aggregation table
      await client.exec(`
        CREATE TABLE IF NOT EXISTS metrics_aggregated (
          event_type String,
          metric_name String,
          metric_value Float64,
          timestamp DateTime,
          session_id String
        ) ENGINE = SummingMergeTree(metric_value)
        ORDER BY (event_type, metric_name, timestamp, session_id)
        PARTITION BY toYYYYMM(timestamp)
        TTL timestamp + INTERVAL 365 DAY
      `);

      logger.info('ClickHouse tables initialized');
    } catch (error) {
      logger.error('Error initializing ClickHouse:', error);
      throw error;
    }
  }

  /**
   * Insert a single event.
   */
  async insertEvent(event: ProcessedEvent): Promise<void> {
    try {
      const client = getClient();

      await client.insert({
        table: 'telemetry_events',
        values: [
          {
            session_id: event.sessionId,
            user_id: event.userId || null,
            event_type: event.eventType,
            timestamp: new Date(event.timestamp),
            server_timestamp: new Date(event.serverTimestamp),
            data: JSON.stringify(event.data),
            device_info: JSON.stringify(event.deviceInfo),
            enriched: JSON.stringify(event.enriched),
            metrics: JSON.stringify(event.metrics || {}),
          },
        ],
        format: 'JSONEachRow',
      });
    } catch (error) {
      logger.error('Error inserting event to ClickHouse:', error);
      throw error;
    }
  }

  /**
   * Insert batch of events.
   */
  async insertBatch(events: ProcessedEvent[]): Promise<void> {
    try {
      if (events.length === 0) return;

      const client = getClient();

      const values = events.map((event) => ({
        session_id: event.sessionId,
        user_id: event.userId || null,
        event_type: event.eventType,
        timestamp: new Date(event.timestamp),
        server_timestamp: new Date(event.serverTimestamp),
        data: JSON.stringify(event.data),
        device_info: JSON.stringify(event.deviceInfo),
        enriched: JSON.stringify(event.enriched),
        metrics: JSON.stringify(event.metrics || {}),
      }));

      await client.insert({
        table: 'telemetry_events',
        values,
        format: 'JSONEachRow',
      });

      logger.debug(`Inserted ${events.length} events to ClickHouse`);
    } catch (error) {
      logger.error('Error inserting batch to ClickHouse:', error);
      throw error;
    }
  }

  /**
   * Query events.
   */
  async queryEvents(query: string): Promise<any[]> {
    try {
      const client = getClient();
      const result = await client.query({ query, format: 'JSONEachRow' });
      const data = await result.json();
      return data as any[];
    } catch (error) {
      logger.error('Error querying ClickHouse:', error);
      throw error;
    }
  }

  /**
   * Get aggregated metrics.
   */
  async getAggregatedMetrics(
    eventType: string,
    metricName: string,
    startTime: Date,
    endTime: Date
  ): Promise<number> {
    try {
      const query = `
        SELECT sum(metric_value) as total
        FROM metrics_aggregated
        WHERE event_type = '${eventType}'
          AND metric_name = '${metricName}'
          AND timestamp >= '${startTime.toISOString()}'
          AND timestamp <= '${endTime.toISOString()}'
      `;

      const results = await this.queryEvents(query);
      return results[0]?.total || 0;
    } catch (error) {
      logger.error('Error getting aggregated metrics:', error);
      throw error;
    }
  }
}

export const clickhouseService = new ClickHouseService();

