
import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
  deviceType: 'mobile' | 'tablet' | 'desktop';
  connectionType: string;
  viewportWidth: number;
  viewportHeight: number;
}

export const useMobilePerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    deviceType: 'desktop',
    connectionType: 'unknown',
    viewportWidth: 0,
    viewportHeight: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent;
      
      if (width <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        return width <= 480 ? 'mobile' : 'tablet';
      }
      return 'desktop';
    };

    const getConnectionType = (): string => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      return connection ? connection.effectiveType || 'unknown' : 'unknown';
    };

    const updateViewportMetrics = () => {
      setMetrics(prev => ({
        ...prev,
        deviceType: detectDeviceType(),
        connectionType: getConnectionType(),
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      }));
    };

    // Initial metrics
    updateViewportMetrics();

    // Performance Observer for Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        if (lastEntry) {
          setMetrics(prev => ({ ...prev, lcp: Math.round(lastEntry.startTime) }));
        }
      });

      // First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          if (entry.name === 'first-input') {
            setMetrics(prev => ({ ...prev, fid: Math.round(entry.processingStart - entry.startTime) }));
          }
        });
      });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((entryList) => {
        let clsValue = 0;
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        setMetrics(prev => ({ ...prev, cls: Math.round(clsValue * 1000) / 1000 }));
      });

      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({ ...prev, fcp: Math.round(entry.startTime) }));
          }
        });
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        fidObserver.observe({ entryTypes: ['first-input'] });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.warn('Performance Observer not fully supported:', e);
      }

      // Navigation timing for TTFB
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const ttfb = navigationEntries[0].responseStart - navigationEntries[0].requestStart;
        setMetrics(prev => ({ ...prev, ttfb: Math.round(ttfb) }));
      }
    }

    // Resize listener for responsive updates
    const handleResize = () => {
      updateViewportMetrics();
    };

    window.addEventListener('resize', handleResize);
    setTimeout(() => setIsLoading(false), 1000);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const sendMetrics = async () => {
    if (metrics.lcp || metrics.fcp) {
      try {
        // Send to your analytics endpoint with mobile-specific data
        await fetch('/api/analytics/performance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...metrics,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            // Additional mobile context
            isMobile: metrics.deviceType === 'mobile',
            isTablet: metrics.deviceType === 'tablet',
            networkSpeed: getConnectionType(),
            memoryUsage: (performance as any).memory ? {
              used: (performance as any).memory.usedJSHeapSize,
              total: (performance as any).memory.totalJSHeapSize,
              limit: (performance as any).memory.jsHeapSizeLimit
            } : null,
            // Touch capability detection
            touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
          }),
        });
      } catch (error) {
        console.warn('Failed to send performance metrics:', error);
      }
    }
  };

  const getPerformanceScore = (): number => {
    if (!metrics.lcp || !metrics.fcp) return 0;
    
    let score = 100;
    
    // LCP scoring (good < 2.5s, needs improvement < 4s, poor >= 4s)
    if (metrics.lcp > 4000) score -= 40;
    else if (metrics.lcp > 2500) score -= 20;
    
    // FCP scoring (good < 1.8s, needs improvement < 3s, poor >= 3s)
    if (metrics.fcp > 3000) score -= 30;
    else if (metrics.fcp > 1800) score -= 15;
    
    // CLS scoring (good < 0.1, needs improvement < 0.25, poor >= 0.25)
    if (metrics.cls && metrics.cls > 0.25) score -= 20;
    else if (metrics.cls && metrics.cls > 0.1) score -= 10;
    
    // FID scoring (good < 100ms, needs improvement < 300ms, poor >= 300ms)
    if (metrics.fid && metrics.fid > 300) score -= 10;
    else if (metrics.fid && metrics.fid > 100) score -= 5;
    
    return Math.max(0, score);
  };

  return {
    metrics,
    isLoading,
    sendMetrics,
    performanceScore: getPerformanceScore(),
  };
};
