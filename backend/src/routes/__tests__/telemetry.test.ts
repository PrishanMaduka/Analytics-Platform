import { describe, it, expect, beforeEach } from '@jest/globals';
import { build } from '../../index';
import { telemetryService } from '../../services/telemetry';

jest.mock('../../services/telemetry');

describe('Telemetry Routes', () => {
  let app: any;

  beforeEach(async () => {
    app = await build();
  });

  it('should accept valid telemetry event', async () => {
    const mockProcess = jest.fn().mockResolvedValue(undefined);
    (telemetryService.processTelemetry as jest.Mock) = mockProcess;

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/telemetry',
      payload: {
        sessionId: 'test-session',
        eventType: 'crash',
        timestamp: Date.now(),
        data: { error: 'Test' },
        deviceInfo: {
          platform: 'Android',
          osVersion: '11',
          deviceModel: 'Test',
          appVersion: '1.0',
        },
      },
    });

    expect(response.statusCode).toBe(200);
    expect(mockProcess).toHaveBeenCalledTimes(1);
  });

  it('should reject invalid telemetry event', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/telemetry',
      payload: {
        // Missing required fields
        sessionId: 'test',
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it('should accept batch of events', async () => {
    const mockProcessBatch = jest.fn().mockResolvedValue(undefined);
    (telemetryService.processBatch as jest.Mock) = mockProcessBatch;

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/telemetry/batch',
      payload: {
        events: [
          {
            sessionId: 'session1',
            eventType: 'crash',
            timestamp: Date.now(),
            data: {},
            deviceInfo: {
              platform: 'Android',
              osVersion: '11',
              deviceModel: 'Test',
              appVersion: '1.0',
            },
          },
        ],
      },
    });

    expect(response.statusCode).toBe(200);
    expect(mockProcessBatch).toHaveBeenCalledTimes(1);
  });
});

