import { supabase } from "@/integrations/supabase/client";
import { ErrorTracking } from "./error-tracking";

export interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  tti?: number; // Time to Interactive
}

export class PerformanceMonitoring {
  private static metrics: PerformanceMetrics = {};
  private static readonly THRESHOLDS = {
    FCP: 1800, // 1.8s
    LCP: 2500, // 2.5s
    FID: 100, // 100ms
    CLS: 0.1, // 0.1
    TTFB: 600, // 600ms
    TTI: 3800, // 3.8s
  };

  static async trackPerformance() {
    if (!window.performance) return;

    try {
      // Get navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
        this.metrics.tti = navigation.domInteractive - navigation.fetchStart;
      }

      // Get paint timing
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcp) {
        this.metrics.fcp = fcp.startTime;
      }

      // Get LCP (Largest Contentful Paint)
      this.observeLCP();

      // Get FID (First Input Delay)
      this.observeFID();

      // Get CLS (Cumulative Layout Shift)
      this.observeCLS();

      // Send metrics after a delay to ensure all are collected
      setTimeout(() => this.sendMetrics(), 5000);
    } catch (error) {
      console.error('Failed to track performance:', error);
    }
  }

  private static observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
        
        if (this.metrics.lcp && this.metrics.lcp > this.THRESHOLDS.LCP) {
          ErrorTracking.logPerformanceIssue('LCP', this.metrics.lcp, this.THRESHOLDS.LCP);
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('LCP observation not supported');
    }
  }

  private static observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
          
          if (this.metrics.fid && this.metrics.fid > this.THRESHOLDS.FID) {
            ErrorTracking.logPerformanceIssue('FID', this.metrics.fid, this.THRESHOLDS.FID);
          }
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('FID observation not supported');
    }
  }

  private static observeCLS() {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            this.metrics.cls = clsValue;
          }
        }
        
        if (this.metrics.cls && this.metrics.cls > this.THRESHOLDS.CLS) {
          ErrorTracking.logPerformanceIssue('CLS', this.metrics.cls, this.THRESHOLDS.CLS);
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('CLS observation not supported');
    }
  }

  private static async sendMetrics() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from('user_events').insert([{
        user_id: user?.id,
        event_type: 'performance',
        event_data: {
          metrics: this.metrics,
          thresholds: this.THRESHOLDS,
          passed: this.checkThresholds(),
          connection: (navigator as any).connection?.effectiveType,
          device_memory: (navigator as any).deviceMemory,
          hardware_concurrency: navigator.hardwareConcurrency,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        },
        page_url: window.location.pathname,
      }]);

      // Log warnings for poor performance
      const issues = this.getPerformanceIssues();
      if (issues.length > 0) {
        console.warn('Performance issues detected:', issues);
      }
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  }

  private static checkThresholds(): Record<string, boolean> {
    return {
      FCP: !this.metrics.fcp || this.metrics.fcp <= this.THRESHOLDS.FCP,
      LCP: !this.metrics.lcp || this.metrics.lcp <= this.THRESHOLDS.LCP,
      FID: !this.metrics.fid || this.metrics.fid <= this.THRESHOLDS.FID,
      CLS: !this.metrics.cls || this.metrics.cls <= this.THRESHOLDS.CLS,
      TTFB: !this.metrics.ttfb || this.metrics.ttfb <= this.THRESHOLDS.TTFB,
      TTI: !this.metrics.tti || this.metrics.tti <= this.THRESHOLDS.TTI,
    };
  }

  private static getPerformanceIssues(): string[] {
    const issues: string[] = [];
    const checks = this.checkThresholds();

    Object.entries(checks).forEach(([metric, passed]) => {
      if (!passed) {
        const value = this.metrics[metric.toLowerCase() as keyof PerformanceMetrics];
        const threshold = this.THRESHOLDS[metric as keyof typeof this.THRESHOLDS];
        issues.push(`${metric}: ${value}ms exceeds threshold of ${threshold}ms`);
      }
    });

    return issues;
  }

  static getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  static trackCustomMetric(name: string, value: number) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  }

  static startCustomMetric(name: string) {
    performance.mark(`${name}-start`);
  }

  static async trackAPICall(endpoint: string, duration: number, success: boolean) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from('user_events').insert([{
        user_id: user?.id,
        event_type: 'api_call',
        event_data: {
          endpoint,
          duration,
          success,
          timestamp: new Date().toISOString(),
        },
        page_url: window.location.pathname,
      }]);
    } catch (error) {
      console.error('Failed to track API call:', error);
    }
  }
}

// Initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    PerformanceMonitoring.trackPerformance();
  });
}
