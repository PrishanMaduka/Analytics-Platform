import { describe, it, expect } from '@jest/globals';
import { build } from '../index';

/**
 * Performance/load testing script.
 * Run with: npm run test:performance
 */
describe('Performance Tests', () => {
  it('should handle high throughput', async () => {
    const app = await build();
    const startTime = Date.now();
    const requests = 1000;
    const concurrent = 10;

    const promises: Promise<any>[] = [];
    for (let i = 0; i < requests; i += concurrent) {
      const batch = Array.from({ length: concurrent }, (_, j) => {
        return app.inject({
          method: 'POST',
          url: '/api/v1/telemetry',
          payload: {
            sessionId: `session-${i + j}`,
            eventType: 'performance',
            timestamp: Date.now(),
            data: { test: 'load' },
            deviceInfo: {
              platform: 'Android',
              osVersion: '11',
              deviceModel: 'Test',
              appVersion: '1.0',
            },
          },
        });
      });
      promises.push(...batch);
    }

    const results = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    const successCount = results.filter((r) => r.statusCode === 200).length;
    const avgResponseTime = duration / requests;

    console.log(`Processed ${requests} requests in ${duration}ms`);
    console.log(`Success rate: ${(successCount / requests) * 100}%`);
    console.log(`Average response time: ${avgResponseTime}ms`);

    expect(successCount).toBeGreaterThan(requests * 0.95); // 95% success rate
    expect(avgResponseTime).toBeLessThan(100); // < 100ms average

    await app.close();
  });
});

