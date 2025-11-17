import { logger } from './logger';

/**
 * Prometheus-style metrics collection.
 */
class MetricsCollector {
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  /**
   * Increment a counter.
   */
  increment(name: string, labels?: Record<string, string>): void {
    const key = this.getKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + 1);
  }

  /**
   * Set a gauge value.
   */
  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getKey(name, labels);
    this.gauges.set(key, value);
  }

  /**
   * Record a histogram value.
   */
  recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getKey(name, labels);
    const values = this.histograms.get(key) || [];
    values.push(value);
    this.histograms.set(key, values);
  }

  /**
   * Get metrics in Prometheus format.
   */
  getPrometheusFormat(): string {
    const lines: string[] = [];

    // Counters
    for (const [key, value] of this.counters.entries()) {
      const { name, labels } = this.parseKey(key);
      const labelStr = this.formatLabels(labels);
      lines.push(`${name}${labelStr} ${value}`);
    }

    // Gauges
    for (const [key, value] of this.gauges.entries()) {
      const { name, labels } = this.parseKey(key);
      const labelStr = this.formatLabels(labels);
      lines.push(`${name}${labelStr} ${value}`);
    }

    // Histograms (simplified - just sum and count)
    for (const [key, values] of this.histograms.entries()) {
      const { name, labels } = this.parseKey(key);
      const labelStr = this.formatLabels(labels);
      const sum = values.reduce((a, b) => a + b, 0);
      const count = values.length;
      lines.push(`${name}_sum${labelStr} ${sum}`);
      lines.push(`${name}_count${labelStr} ${count}`);
    }

    return lines.join('\n') + '\n';
  }

  /**
   * Get key for metric storage.
   */
  private getKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    return `${name}{${labelStr}}`;
  }

  /**
   * Parse key back to name and labels.
   */
  private parseKey(key: string): { name: string; labels: Record<string, string> } {
    const match = key.match(/^(.+?)(?:\{(.+)\})?$/);
    if (!match) {
      return { name: key, labels: {} };
    }

    const name = match[1];
    const labels: Record<string, string> = {};

    if (match[2]) {
      const pairs = match[2].split(',');
      for (const pair of pairs) {
        const [k, v] = pair.split('=');
        if (k && v) {
          labels[k] = v;
        }
      }
    }

    return { name, labels };
  }

  /**
   * Format labels for Prometheus.
   */
  private formatLabels(labels: Record<string, string>): string {
    if (Object.keys(labels).length === 0) {
      return '';
    }
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return `{${labelStr}}`;
  }

  /**
   * Reset all metrics.
   */
  reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }
}

export const metricsCollector = new MetricsCollector();

