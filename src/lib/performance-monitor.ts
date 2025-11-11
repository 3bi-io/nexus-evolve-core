/**
 * Performance Monitoring Utilities for Mobile Optimization
 * Tracks key metrics: FCP, LCP, FID, CLS, TTFB
 */

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  tti?: number; // Time to Interactive
}

type MetricName = keyof PerformanceMetrics;

interface PerformanceThresholds {
  fcp: { good: number; needsImprovement: number };
  lcp: { good: number; needsImprovement: number };
  fid: { good: number; needsImprovement: number };
  cls: { good: number; needsImprovement: number };
  ttfb: { good: number; needsImprovement: number };
}

// Google's Core Web Vitals thresholds
const THRESHOLDS: PerformanceThresholds = {
  fcp: { good: 1800, needsImprovement: 3000 },
  lcp: { good: 2500, needsImprovement: 4000 },
  fid: { good: 100, needsImprovement: 300 },
  cls: { good: 0.1, needsImprovement: 0.25 },
  ttfb: { good: 800, needsImprovement: 1800 },
};

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // First Contentful Paint (FCP)
    this.observePaint();
    
    // Largest Contentful Paint (LCP)
    this.observeLCP();
    
    // First Input Delay (FID)
    this.observeFID();
    
    // Cumulative Layout Shift (CLS)
    this.observeCLS();
    
    // Time to First Byte (TTFB)
    this.measureTTFB();
  }

  private observePaint() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        
        if (fcpEntry) {
          this.metrics.fcp = fcpEntry.startTime;
          this.logMetric('FCP', fcpEntry.startTime);
        }
      });

      observer.observe({ entryTypes: ['paint'] });
      this.observers.set('paint', observer);
    } catch (error) {
      console.warn('Paint observer not supported:', error);
    }
  }

  private observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        if (lastEntry) {
          this.metrics.lcp = lastEntry.startTime;
          this.logMetric('LCP', lastEntry.startTime);
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', observer);
    } catch (error) {
      console.warn('LCP observer not supported:', error);
    }
  }

  private observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstInput = entries[0] as PerformanceEventTiming;
        
        if (firstInput) {
          this.metrics.fid = firstInput.processingStart - firstInput.startTime;
          this.logMetric('FID', this.metrics.fid);
        }
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', observer);
    } catch (error) {
      console.warn('FID observer not supported:', error);
    }
  }

  private observeCLS() {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.cls = clsValue;
          }
        });
        
        this.logMetric('CLS', clsValue);
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', observer);
    } catch (error) {
      console.warn('CLS observer not supported:', error);
    }
  }

  private measureTTFB() {
    try {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navTiming) {
        this.metrics.ttfb = navTiming.responseStart - navTiming.requestStart;
        this.logMetric('TTFB', this.metrics.ttfb);
      }
    } catch (error) {
      console.warn('TTFB measurement not supported:', error);
    }
  }

  private logMetric(name: string, value: number) {
    const metricKey = name.toLowerCase() as MetricName;
    const threshold = THRESHOLDS[metricKey];
    
    if (!threshold) return;
    
    let rating: 'good' | 'needs-improvement' | 'poor';
    
    if (value <= threshold.good) {
      rating = 'good';
    } else if (value <= threshold.needsImprovement) {
      rating = 'needs-improvement';
    } else {
      rating = 'poor';
    }
    
    console.log(`[Performance] ${name}: ${value.toFixed(2)}ms - ${rating}`);
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getMetricRating(metric: MetricName): 'good' | 'needs-improvement' | 'poor' | 'unknown' {
    const value = this.metrics[metric];
    if (value === undefined) return 'unknown';
    
    const threshold = THRESHOLDS[metric];
    if (!threshold) return 'unknown';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  public disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }

  // Send metrics to analytics (e.g., Supabase)
  public async reportMetrics() {
    const metrics = this.getMetrics();
    
    console.log('[Performance Report]', {
      ...metrics,
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection?.effectiveType,
    });
    
    // You can send this to your analytics backend
    // await supabase.from('performance_metrics').insert(...)
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Measure component render time
export function measureRender(componentName: string) {
  const startMark = `${componentName}-render-start`;
  const endMark = `${componentName}-render-end`;
  const measureName = `${componentName}-render`;
  
  performance.mark(startMark);
  
  return () => {
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);
    
    const measure = performance.getEntriesByName(measureName)[0];
    console.log(`[Render Time] ${componentName}: ${measure.duration.toFixed(2)}ms`);
    
    // Clean up
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(measureName);
  };
}

// Detect slow network conditions
export function isSlowConnection(): boolean {
  const connection = (navigator as any).connection;
  if (!connection) return false;
  
  const slowConnections = ['slow-2g', '2g', '3g'];
  return slowConnections.includes(connection.effectiveType);
}

// Measure bundle size
export function logBundleSize() {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (entry.initiatorType === 'script' || entry.initiatorType === 'link') {
          const sizeKB = (entry.transferSize / 1024).toFixed(2);
          console.log(`[Bundle] ${entry.name.split('/').pop()}: ${sizeKB}KB`);
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }
}
