import { logger } from './logger';

/**
 * Enrich telemetry event with additional server-side data.
 */
export async function enrichEvent(event: any): Promise<any> {
  const enriched = {
    ...event,
    serverTimestamp: Date.now(),
    serverTime: new Date().toISOString(),
    // TODO: Add IP geolocation
    // TODO: Add user agent parsing
    // TODO: Add device fingerprinting
  };

  return enriched;
}

/**
 * Aggregate metrics from event data.
 */
export function aggregateMetrics(eventType: string, event: any): Record<string, number> {
  const metrics: Record<string, number> = {};

  switch (eventType) {
    case 'performance':
      if (event.data?.value) {
        metrics[event.data.metric || 'unknown'] = event.data.value;
      }
      break;

    case 'network':
      if (event.data?.duration) {
        metrics['network_duration'] = event.data.duration;
        metrics['network_size'] = (event.data.requestSize || 0) + (event.data.responseSize || 0);
      }
      break;

    case 'crash':
      metrics['crash_count'] = 1;
      break;

    default:
      break;
  }

  return metrics;
}

