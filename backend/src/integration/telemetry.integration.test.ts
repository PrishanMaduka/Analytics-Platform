import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { build } from '../index';

describe('Telemetry Integration Tests', () => {
  let app: any;

  beforeAll(async () => {
    app = await build();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should process telemetry end-to-end', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/telemetry',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: {
        sessionId: 'integration-test-session',
        eventType: 'crash',
        timestamp: Date.now(),
        data: {
          exception: 'TestException',
          message: 'Test error message',
        },
        deviceInfo: {
          platform: 'Android',
          osVersion: '11',
          deviceModel: 'Test Device',
          appVersion: '1.0.0',
        },
      },
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toHaveProperty('success', true);
  });

  it('should handle batch telemetry', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/telemetry/batch',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: {
        events: [
          {
            sessionId: 'session1',
            eventType: 'performance',
            timestamp: Date.now(),
            data: { metric: 'startup_time', value: 1000 },
            deviceInfo: {
              platform: 'iOS',
              osVersion: '15',
              deviceModel: 'iPhone',
              appVersion: '1.0',
            },
          },
          {
            sessionId: 'session2',
            eventType: 'network',
            timestamp: Date.now(),
            data: { url: 'https://api.test.com', duration: 200 },
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
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true);
    expect(body.message).toContain('Processed');
  });
});

