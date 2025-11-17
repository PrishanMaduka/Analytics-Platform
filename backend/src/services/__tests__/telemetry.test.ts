import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { telemetryService } from '../telemetry';
import { kafkaProducer } from '../../kafka/producer';

jest.mock('../../kafka/producer');

describe('TelemetryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process single telemetry event', async () => {
    const mockSend = jest.fn().mockResolvedValue(undefined);
    (kafkaProducer.send as jest.Mock) = mockSend;

    const event = {
      sessionId: 'test-session',
      eventType: 'crash' as const,
      timestamp: Date.now(),
      data: { error: 'Test error' },
      deviceInfo: {
        platform: 'Android',
        osVersion: '11',
        deviceModel: 'Test Device',
        appVersion: '1.0.0',
      },
    };

    await telemetryService.processTelemetry(event);

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith({
      topic: 'telemetry-crash',
      messages: [
        {
          key: 'test-session',
          value: expect.stringContaining('test-session'),
        },
      ],
    });
  });

  it('should process batch of events', async () => {
    const mockSend = jest.fn().mockResolvedValue(undefined);
    (kafkaProducer.send as jest.Mock) = mockSend;

    const events = [
      {
        sessionId: 'session1',
        eventType: 'crash' as const,
        timestamp: Date.now(),
        data: {},
        deviceInfo: {
          platform: 'Android',
          osVersion: '11',
          deviceModel: 'Test',
          appVersion: '1.0',
        },
      },
      {
        sessionId: 'session2',
        eventType: 'performance' as const,
        timestamp: Date.now(),
        data: {},
        deviceInfo: {
          platform: 'iOS',
          osVersion: '15',
          deviceModel: 'Test',
          appVersion: '1.0',
        },
      },
    ];

    await telemetryService.processBatch(events);

    expect(mockSend).toHaveBeenCalledTimes(2); // One per event type
  });
});

