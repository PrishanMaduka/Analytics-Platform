/**
 * Integration test for telemetry flow: SDK -> Backend -> Storage
 */

import { describe, it, expect } from '@jest/globals';

describe('Telemetry Flow Integration', () => {
  it('should process event from SDK to ClickHouse', async () => {
    // 1. Simulate SDK sending event
    const event = {
      sessionId: 'integration-session',
      eventType: 'crash',
      timestamp: Date.now(),
      data: { error: 'Test' },
      deviceInfo: {
        platform: 'Android',
        osVersion: '11',
        deviceModel: 'Test',
        appVersion: '1.0',
      },
    };

    // 2. Send to backend API
    const response = await fetch('http://localhost:3000/api/v1/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    expect(response.ok).toBe(true);

    // 3. Wait for Kafka processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 4. Verify data in ClickHouse
    // TODO: Query ClickHouse to verify event was stored
  });

  it('should handle PII redaction in stream', async () => {
    const event = {
      sessionId: 'test-session',
      eventType: 'log',
      timestamp: Date.now(),
      data: {
        message: 'User email is test@example.com',
        phone: '555-1234',
      },
      deviceInfo: {
        platform: 'iOS',
        osVersion: '15',
        deviceModel: 'iPhone',
        appVersion: '1.0',
      },
    };

    const response = await fetch('http://localhost:3000/api/v1/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    expect(response.ok).toBe(true);

    // Verify PII was redacted in storage
    // TODO: Query ClickHouse and verify PII is redacted
  });
});

