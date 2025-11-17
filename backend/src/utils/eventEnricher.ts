import { logger } from './logger';
import { FastifyRequest } from 'fastify';
import crypto from 'crypto';

interface GeolocationData {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

interface UserAgentData {
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  device?: string;
  deviceType?: string;
  isMobile?: boolean;
  isTablet?: boolean;
  isBot?: boolean;
}

/**
 * Extract IP address from request.
 */
function extractIpAddress(request: FastifyRequest): string {
  // Check various headers for IP address
  const forwarded = request.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return ips.split(',')[0].trim();
  }

  const realIp = request.headers['x-real-ip'];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  return request.ip || request.socket.remoteAddress || 'unknown';
}

/**
 * Get geolocation data from IP address.
 * Note: This is a simplified implementation. In production, use a service like MaxMind GeoIP2.
 */
async function getGeolocation(ipAddress: string): Promise<GeolocationData | null> {
  try {
    // Skip private/local IPs
    if (
      ipAddress.startsWith('127.') ||
      ipAddress.startsWith('192.168.') ||
      ipAddress.startsWith('10.') ||
      ipAddress.startsWith('172.16.') ||
      ipAddress === 'unknown' ||
      ipAddress === '::1'
    ) {
      return null;
    }

    // In production, use MaxMind GeoIP2 or similar service
    // For now, return basic structure
    // You can integrate with services like:
    // - MaxMind GeoIP2 (requires license)
    // - ipapi.co (free tier available)
    // - ip-api.com (free tier available)
    
    // Example: Fetch from ip-api.com (free tier, 45 requests/minute)
    if (process.env.ENABLE_IP_GEOLOCATION === 'true') {
      try {
        const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,country,regionName,city,lat,lon,timezone`);
        const data = await response.json();
        
        if (data.status === 'success') {
          return {
            country: data.country,
            region: data.regionName,
            city: data.city,
            latitude: data.lat,
            longitude: data.lon,
            timezone: data.timezone,
          };
        }
      } catch (error) {
        logger.warn('Failed to fetch geolocation:', error);
      }
    }

    return null;
  } catch (error) {
    logger.error('Error getting geolocation:', error);
    return null;
  }
}

/**
 * Parse user agent string.
 */
function parseUserAgent(userAgent: string | undefined): UserAgentData {
  if (!userAgent) {
    return {};
  }

  const ua = userAgent.toLowerCase();
  const data: UserAgentData = {};

  // Detect browser
  if (ua.includes('chrome') && !ua.includes('edg')) {
    data.browser = 'Chrome';
    const match = ua.match(/chrome\/([\d.]+)/);
    if (match) data.browserVersion = match[1];
  } else if (ua.includes('firefox')) {
    data.browser = 'Firefox';
    const match = ua.match(/firefox\/([\d.]+)/);
    if (match) data.browserVersion = match[1];
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    data.browser = 'Safari';
    const match = ua.match(/version\/([\d.]+)/);
    if (match) data.browserVersion = match[1];
  } else if (ua.includes('edg')) {
    data.browser = 'Edge';
    const match = ua.match(/edg\/([\d.]+)/);
    if (match) data.browserVersion = match[1];
  }

  // Detect OS
  if (ua.includes('android')) {
    data.os = 'Android';
    const match = ua.match(/android ([\d.]+)/);
    if (match) data.osVersion = match[1];
    data.deviceType = 'mobile';
    data.isMobile = true;
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    data.os = 'iOS';
    const match = ua.match(/os ([\d_]+)/);
    if (match) data.osVersion = match[1].replace(/_/g, '.');
    data.deviceType = ua.includes('ipad') ? 'tablet' : 'mobile';
    data.isMobile = !ua.includes('ipad');
    data.isTablet = ua.includes('ipad');
  } else if (ua.includes('windows')) {
    data.os = 'Windows';
    const match = ua.match(/windows nt ([\d.]+)/);
    if (match) data.osVersion = match[1];
    data.deviceType = 'desktop';
  } else if (ua.includes('mac os')) {
    data.os = 'macOS';
    const match = ua.match(/mac os x ([\d_]+)/);
    if (match) data.osVersion = match[1].replace(/_/g, '.');
    data.deviceType = 'desktop';
  } else if (ua.includes('linux')) {
    data.os = 'Linux';
    data.deviceType = 'desktop';
  }

  // Detect device
  if (ua.includes('iphone')) {
    const match = ua.match(/iphone(?:.*?os ([\d_]+))?/);
    if (match) data.device = 'iPhone';
  } else if (ua.includes('ipad')) {
    data.device = 'iPad';
  } else if (ua.includes('android')) {
    // Try to extract device model
    const match = ua.match(/android.*?;\s*([^)]+)\)/);
    if (match) data.device = match[1].trim();
  }

  // Detect bots
  data.isBot = ua.includes('bot') || ua.includes('crawler') || ua.includes('spider');

  return data;
}

/**
 * Generate device fingerprint from request headers.
 */
function generateDeviceFingerprint(request: FastifyRequest): string {
  const components: string[] = [];

  // User agent
  const userAgent = request.headers['user-agent'] || '';
  components.push(userAgent);

  // Accept language
  const acceptLanguage = request.headers['accept-language'] || '';
  components.push(acceptLanguage);

  // Accept encoding
  const acceptEncoding = request.headers['accept-encoding'] || '';
  components.push(acceptEncoding);

  // Screen resolution (if available in headers)
  const screenResolution = request.headers['x-screen-resolution'] || '';
  components.push(screenResolution);

  // Create hash
  const fingerprint = crypto
    .createHash('sha256')
    .update(components.join('|'))
    .digest('hex')
    .substring(0, 16); // Use first 16 chars for shorter fingerprint

  return fingerprint;
}

/**
 * Enrich telemetry event with additional server-side data.
 */
export async function enrichEvent(event: any, request?: FastifyRequest): Promise<any> {
  const enriched: any = {
    ...event,
    serverTimestamp: Date.now(),
    serverTime: new Date().toISOString(),
  };

  if (request) {
    // Extract IP address
    const ipAddress = extractIpAddress(request);
    enriched.ipAddress = ipAddress;

    // Get geolocation
    const geolocation = await getGeolocation(ipAddress);
    if (geolocation) {
      enriched.geolocation = geolocation;
    }

    // Parse user agent
    const userAgent = request.headers['user-agent'];
    if (userAgent) {
      enriched.userAgent = parseUserAgent(userAgent);
    }

    // Generate device fingerprint
    enriched.deviceFingerprint = generateDeviceFingerprint(request);
  }

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

