import { logger } from '../utils/logger';
import { clickhouseService } from './clickhouse';
import { redisService } from './redis';
import { piiRedactionService } from './piiRedaction';
import { enrichEvent, aggregateMetrics } from '../utils/eventEnricher';

export interface ProcessedEvent {
  sessionId: string;
  userId?: string;
  eventType: string;
  timestamp: number;
  serverTimestamp: number;
  data: Record<string, any>;
  deviceInfo: Record<string, any>;
  enriched: Record<string, any>;
  metrics?: Record<string, number>;
}

class StreamProcessor {
  /**
   * Process a single telemetry event.
   */
  async processEvent(eventType: string, rawEvent: any): Promise<void> {
    try {
      // Enrich event with additional data
      let enrichedEvent = await enrichEvent(rawEvent);
      
      // Redact PII if enabled
      enrichedEvent = piiRedactionService.redactFromObject(enrichedEvent) as any;

      // Aggregate metrics if applicable
      const metrics = aggregateMetrics(eventType, enrichedEvent);

      const processedEvent: ProcessedEvent = {
        ...enrichedEvent,
        enriched: enrichedEvent,
        metrics,
      };

      // Store in ClickHouse for analytics
      await clickhouseService.insertEvent(processedEvent);

      // Cache recent events in Redis
      await redisService.cacheEvent(processedEvent);

      // Update real-time metrics
      await this.updateRealtimeMetrics(eventType, processedEvent);

      logger.debug(`Processed ${eventType} event for session ${processedEvent.sessionId}`);
    } catch (error) {
      logger.error(`Error processing ${eventType} event:`, error);
      throw error;
    }
  }

  /**
   * Process batch of events.
   */
  async processBatch(events: ProcessedEvent[]): Promise<void> {
    try {
      // Batch insert to ClickHouse
      await clickhouseService.insertBatch(events);

      // Cache events in Redis
      await redisService.cacheBatch(events);

      logger.debug(`Processed batch of ${events.length} events`);
    } catch (error) {
      logger.error('Error processing batch:', error);
      throw error;
    }
  }

  /**
   * Update real-time metrics in Redis.
   */
  private async updateRealtimeMetrics(eventType: string, event: ProcessedEvent): Promise<void> {
    const timestamp = Math.floor(Date.now() / 1000); // Current second
    const key = `metrics:${eventType}:${timestamp}`;

    await redisService.incrementCounter(key);
    await redisService.setExpiry(key, 3600); // Expire after 1 hour
  }
}

export const streamProcessor = new StreamProcessor();

