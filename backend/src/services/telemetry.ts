import { logger } from '../utils/logger';
import { kafkaProducer } from '../kafka/producer';
import { enrichEvent } from '../utils/eventEnricher';
import { FastifyRequest } from 'fastify';

export interface TelemetryEvent {
  sessionId: string;
  userId?: string;
  eventType: 'crash' | 'performance' | 'network' | 'interaction' | 'log' | 'trace';
  timestamp: number;
  data: Record<string, any>;
  deviceInfo: {
    platform: string;
    osVersion: string;
    deviceModel: string;
    appVersion: string;
  };
}

class TelemetryService {
  async processTelemetry(event: TelemetryEvent, request?: FastifyRequest): Promise<void> {
    try {
      // Enrich event with server-side data
      const enrichedEvent = await enrichEvent(event, request);

      // Send to Kafka
      await kafkaProducer.send({
        topic: `telemetry-${event.eventType}`,
        messages: [
          {
            key: event.sessionId,
            value: JSON.stringify(enrichedEvent),
          },
        ],
      });

      logger.debug(`Processed telemetry event: ${event.eventType} for session ${event.sessionId}`);
    } catch (error) {
      logger.error('Error processing telemetry:', error);
      throw error;
    }
  }

  async processBatch(events: TelemetryEvent[]): Promise<void> {
    try {
      // Group events by type for efficient Kafka batching
      const eventsByType = events.reduce((acc, event) => {
        if (!acc[event.eventType]) {
          acc[event.eventType] = [];
        }
        acc[event.eventType].push(event);
        return acc;
      }, {} as Record<string, TelemetryEvent[]>);

      // Send batches to Kafka
      const promises = Object.entries(eventsByType).map(([eventType, typeEvents]) => {
        return kafkaProducer.send({
          topic: `telemetry-${eventType}`,
          messages: typeEvents.map((event) => ({
            key: event.sessionId,
            value: JSON.stringify({
              ...event,
              serverTimestamp: Date.now(),
            }),
          })),
        });
      });

      await Promise.all(promises);

      logger.debug(`Processed batch of ${events.length} events`);
    } catch (error) {
      logger.error('Error processing batch:', error);
      throw error;
    }
  }
}

export const telemetryService = new TelemetryService();

