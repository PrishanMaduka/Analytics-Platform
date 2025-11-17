import { logger } from '../utils/logger';

/**
 * PII detection and redaction service for backend.
 */
class PiiRedactionService {
  private readonly emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi;
  private readonly phonePattern = /\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/gi;
  private readonly creditCardPattern = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/gi;
  private readonly ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/gi;
  private readonly ipAddressPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/gi;
  private readonly redactionString = '[REDACTED]';

  /**
   * Detect PII in text.
   */
  detectPii(text: string): Array<{ type: string; value: string; start: number; end: number }> {
    const matches: Array<{ type: string; value: string; start: number; end: number }> = [];

    // Email detection
    let match;
    while ((match = this.emailPattern.exec(text)) !== null) {
      matches.push({
        type: 'email',
        value: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    // Phone detection
    while ((match = this.phonePattern.exec(text)) !== null) {
      matches.push({
        type: 'phone',
        value: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    // Credit card detection
    while ((match = this.creditCardPattern.exec(text)) !== null) {
      matches.push({
        type: 'credit_card',
        value: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    // SSN detection
    while ((match = this.ssnPattern.exec(text)) !== null) {
      matches.push({
        type: 'ssn',
        value: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    // IP address detection
    while ((match = this.ipAddressPattern.exec(text)) !== null) {
      matches.push({
        type: 'ip_address',
        value: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    return matches;
  }

  /**
   * Redact PII from text.
   */
  redactPii(text: string): string {
    const matches = this.detectPii(text).sort((a, b) => b.start - a.start);

    let redactedText = text;
    for (const match of matches) {
      redactedText =
        redactedText.substring(0, match.start) +
        this.redactionString +
        redactedText.substring(match.end);
    }

    return redactedText;
  }

  /**
   * Redact PII from object recursively.
   */
  redactFromObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.redactPii(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.redactFromObject(item));
    }

    if (obj !== null && typeof obj === 'object') {
      const redacted: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (this.isPiiKey(key)) {
          redacted[key] = this.redactionString;
        } else {
          redacted[key] = this.redactFromObject(value);
        }
      }
      return redacted;
    }

    return obj;
  }

  /**
   * Check if a key suggests PII.
   */
  private isPiiKey(key: string): boolean {
    const lowerKey = key.toLowerCase();
    return (
      lowerKey.includes('email') ||
      lowerKey.includes('phone') ||
      lowerKey.includes('ssn') ||
      lowerKey.includes('credit') ||
      lowerKey.includes('card') ||
      lowerKey.includes('password') ||
      lowerKey.includes('token') ||
      lowerKey.includes('secret') ||
      lowerKey.includes('address') ||
      lowerKey.includes('name')
    );
  }
}

export const piiRedactionService = new PiiRedactionService();

