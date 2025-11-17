import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { config } from '../config';
import { logger } from '../utils/logger';
import { streamProcessor } from '../services/streamProcessor';

const kafka = new Kafka({
  clientId: config.kafkaClientId,
  brokers: config.kafkaBrokers,
});

let consumers: Consumer[] = [];

/**
 * Create and start Kafka consumers for telemetry processing.
 */
export async function startConsumers(): Promise<void> {
  const eventTypes = ['crash', 'performance', 'network', 'interaction', 'log', 'trace'];

  for (const eventType of eventTypes) {
    const consumer = kafka.consumer({
      groupId: `mxl-processor-${eventType}`,
    });

    await consumer.connect();
    await consumer.subscribe({
      topic: `telemetry-${eventType}`,
      fromBeginning: false,
    });

    await consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        try {
          const message = JSON.parse(payload.message.value?.toString() || '{}');
          await streamProcessor.processEvent(eventType, message);
        } catch (error) {
          logger.error(`Error processing message from topic telemetry-${eventType}:`, error);
        }
      },
    });

    consumers.push(consumer);
    logger.info(`Started consumer for topic: telemetry-${eventType}`);
  }
}

/**
 * Stop all consumers gracefully.
 */
export async function stopConsumers(): Promise<void> {
  for (const consumer of consumers) {
    await consumer.disconnect();
  }
  consumers = [];
  logger.info('All consumers stopped');
}

