/**
 * Performance monitoring utilities for Idea Printer
 * Tracks performance metrics and user analytics
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface WebVital {
  name: 'FCP' | 'LCP' | 'CLS' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

/**
 * Performance metrics store
 */
class MetricsStore {
  private metrics: PerformanceMetric[] = [];
  private webVitals: WebVital[] = [];
  private maxMetrics = 1000;

  /**
   * Record a performance metric
   */
  record(name: string, value: number, metadata?: Record<string, unknown>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Trim if exceeded max
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Metric]', name, value, metadata || '');
    }

    // Send to analytics in production
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric);
    }
  }

  /**
   * Record a Web Vital
   */
  recordWebVital(vital: WebVital) {
    this.webVitals.push(vital);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vital]', vital.name, vital.value, vital.rating);
    }

    // Send to analytics in production
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      this.sendWebVitalToAnalytics(vital);
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get all web vitals
   */
  getWebVitals(): WebVital[] {
    return [...this.webVitals];
  }

  /**
   * Get metrics summary
   */
  getSummary(): {
    totalMetrics: number;
    averages: Record<string, number>;
    webVitals: Record<string, { value: number; rating: string }>;
  } {
    const averages: Record<string, number> = {};

    // Calculate averages for each metric type
    const metricsByName: Record<string, number[]> = {};
    this.metrics.forEach((metric) => {
      if (!metricsByName[metric.name]) {
        metricsByName[metric.name] = [];
      }
      metricsByName[metric.name].push(metric.value);
    });

    Object.keys(metricsByName).forEach((name) => {
      const values = metricsByName[name];
      averages[name] = values.reduce((a, b) => a + b, 0) / values.length;
    });

    // Get latest web vitals
    const latestWebVitals: Record<string, { value: number; rating: string }> = {};
    this.webVitals.forEach((vital) => {
      latestWebVitals[vital.name] = {
        value: vital.value,
        rating: vital.rating,
      };
    });

    return {
      totalMetrics: this.metrics.length,
      averages,
      webVitals: latestWebVitals,
    };
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = [];
    this.webVitals = [];
  }

  /**
   * Export metrics as JSON
   */
  export(): string {
    return JSON.stringify(
      {
        metrics: this.metrics,
        webVitals: this.webVitals,
      },
      null,
      2
    );
  }

  /**
   * Send metric to analytics service
   */
  private sendToAnalytics(metric: PerformanceMetric) {
    // Placeholder for analytics integration
    // In production, send to your analytics service (e.g., Google Analytics, Vercel Analytics)

    // Example for Google Analytics 4:
    if (typeof window !== 'undefined') {
      const w = window as Window & {
        gtag?: (command: string, eventName: string, params: Record<string, unknown>) => void;
      };
      if (w.gtag) {
        w.gtag('event', metric.name, {
          value: metric.value,
          ...metric.metadata,
        });
      }
    }
  }

  /**
   * Send Web Vital to analytics service
   */
  private sendWebVitalToAnalytics(vital: WebVital) {
    // Placeholder for Web Vitals analytics
    // In production, send to your analytics service

    // Example for Google Analytics 4:
    if (typeof window !== 'undefined') {
      const w = window as Window & {
        gtag?: (command: string, eventName: string, params: Record<string, unknown>) => void;
      };
      if (w.gtag) {
        w.gtag('event', vital.name, {
          value: Math.round(vital.name === 'CLS' ? vital.value * 1000 : vital.value),
          metric_rating: vital.rating,
          event_category: 'Web Vitals',
        });
      }
    }
  }
}

// Singleton metrics store
export const metricsStore = new MetricsStore();

/**
 * Record generation time metric
 */
export function recordGenerationTime(durationMs: number, metadata?: Record<string, unknown>) {
  metricsStore.record('generation_time', durationMs, metadata);
}

/**
 * Record API latency
 */
export function recordApiLatency(endpoint: string, durationMs: number) {
  metricsStore.record('api_latency', durationMs, { endpoint });
}

/**
 * Record user interaction
 */
export function recordUserInteraction(action: string, metadata?: Record<string, unknown>) {
  metricsStore.record('user_interaction', 1, { action, ...metadata });
}

/**
 * Record error occurrence
 */
export function recordError(errorType: string, errorMessage: string) {
  metricsStore.record('error', 1, { errorType, errorMessage });
}

/**
 * Get Web Vitals rating based on thresholds
 */
function getWebVitalRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, [number, number]> = {
    FCP: [1800, 3000],
    LCP: [2500, 4000],
    CLS: [0.1, 0.25],
    TTFB: [800, 1800],
    INP: [200, 500],
  };

  const [good, needsImprovement] = thresholds[name] || [0, 0];

  if (value <= good) return 'good';
  if (value <= needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Report Web Vital
 */
export function reportWebVital(name: WebVital['name'], value: number) {
  const vital: WebVital = {
    name,
    value,
    rating: getWebVitalRating(name, value),
    timestamp: Date.now(),
  };

  metricsStore.recordWebVital(vital);
}

/**
 * Initialize Web Vitals reporting
 * Should be called in the root layout or _app component
 */
export function initializeWebVitals() {
  if (typeof window === 'undefined') return;

  // Use the web-vitals library if available
  import('web-vitals')
    .then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      onCLS((metric) => reportWebVital('CLS', metric.value));
      onFCP((metric) => reportWebVital('FCP', metric.value));
      onLCP((metric) => reportWebVital('LCP', metric.value));
      onTTFB((metric) => reportWebVital('TTFB', metric.value));
      if (onINP) {
        onINP((metric) => reportWebVital('INP', metric.value));
      }
    })
    .catch((error) => {
      console.warn('Failed to load web-vitals:', error);
    });
}

/**
 * Get performance metrics summary
 */
export function getPerformanceMetrics() {
  return metricsStore.getSummary();
}

/**
 * Export all metrics
 */
export function exportMetrics(): string {
  return metricsStore.export();
}
