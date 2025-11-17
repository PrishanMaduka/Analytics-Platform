import { Kafka } from 'kafkajs';
import { config } from '../config';
import { logger } from '../utils/logger';

const kafka = new Kafka({
  clientId: config.kafkaClientId,
  brokers: config.kafkaBrokers,
});

const producer = kafka.producer();

let isConnected = false;

export const kafkaProducer = {
  async connect(): Promise<void> {
    if (isConnected) {
      return;
    }

    try {
      await producer.connect();
      isConnected = true;
      logger.info('Kafka producer connected');
    } catch (error) {
      logger.error('Error connecting Kafka producer:', error);
      throw error;
    }
  },

  async disconnect(): Promise<void> {
    if (!isConnected) {
      return;
    }

    try {
      await producer.disconnect();
      isConnected = false;
      logger.info('Kafka producer disconnected');
    } catch (error) {
      logger.error('Error disconnecting Kafka producer:', error);
    }
  },

  async send(message: { topic: string; messages: Array<{ key: string; value: string }> }): Promise<void> {
    if (!isConnected) {
      await this.connect();
    }

    try {
      await producer.send(message);
    } catch (error) {
      logger.error('Error sending message to Kafka:', error);
      throw error;
    }
  },
};

// Connect on startup
kafkaProducer.connect().catch((error) => {
  logger.error('Failed to connect Kafka producer on startup:', error);
});

