import { describe, it, expect } from '@jest/globals';
import { piiRedactionService } from '../piiRedaction';

describe('PiiRedactionService', () => {
  it('should detect email addresses', () => {
    const text = 'Contact us at support@example.com for help';
    const matches = piiRedactionService.detectPii(text);

    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].type).toBe('email');
    expect(matches[0].value).toBe('support@example.com');
  });

  it('should detect phone numbers', () => {
    const text = 'Call us at +1-555-123-4567';
    const matches = piiRedactionService.detectPii(text);

    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].type).toBe('phone');
  });

  it('should detect credit cards', () => {
    const text = 'Card number: 1234-5678-9012-3456';
    const matches = piiRedactionService.detectPii(text);

    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].type).toBe('credit_card');
  });

  it('should redact PII from text', () => {
    const text = 'Email: test@example.com, Phone: 555-1234';
    const redacted = piiRedactionService.redactPii(text);

    expect(redacted).toContain('[REDACTED]');
    expect(redacted).not.toContain('test@example.com');
    expect(redacted).not.toContain('555-1234');
  });

  it('should redact PII from objects', () => {
    const obj = {
      email: 'user@example.com',
      name: 'John Doe',
      phone: '555-1234',
      nested: {
        creditCard: '1234-5678-9012-3456',
      },
    };

    const redacted = piiRedactionService.redactFromObject(obj);

    expect(redacted.email).toBe('[REDACTED]');
    expect(redacted.phone).toBe('[REDACTED]');
    expect((redacted.nested as any).creditCard).toBe('[REDACTED]');
    expect(redacted.name).not.toBe('[REDACTED]');
  });
});

