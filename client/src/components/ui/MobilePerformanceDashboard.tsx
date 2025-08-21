
import { useEffect } from 'react';
import { useMobilePerformance } from '../../hooks/useMobilePerformance';
import { Smartphone, Wifi, Monitor, Activity, Gauge } from 'lucide-react';
import Card from './Card';

interface MobilePerformanceDashboardProps {
  className?: string;
  showFullMetrics?: boolean;
}

const MobilePerformanceDashboard = ({ className = '', showFullMetrics = false }: MobilePerformanceDashboardProps) => {
  const { metrics, isLoading, sendMetrics, performanceScore } = useMobilePerformance();

  useEffect(() => {
    // Send metrics after page load
    const timer = setTimeout(() => {
      sendMetrics();
    }, 5000);

    return () => clearTimeout(timer);
  }, [sendMetrics]);

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMetricStatus = (metric: number | null, thresholds: [number, number]): 'good' | 'needs-improvement' | 'poor' => {
    if (metric === null) return 'good';
    if (metric <= thresholds[0]) return 'good';
    if (metric <= thresholds[1]) return 'needs-improvement';
    return 'poor';
  };

  const formatMetric = (value: number | null, unit: string = 'ms'): string => {
    if (value === null) return 'N/A';
    return `${value}${unit}`;
  };

  if (isLoading && !showFullMetrics) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {showFullMetrics && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Mobile Performance Metrics
            </h3>
            <div className={`text-2xl font-bold ${getScoreColor(performanceScore)}`}>
              {performanceScore}/100
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-sm text-neutral-600 mb-1">Device</div>
              <div className="flex items-center justify-center">
                <Smartphone className="w-4 h-4 mr-1 text-sage" />
                <span className="font-medium capitalize">{metrics.deviceType}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-neutral-600 mb-1">Connection</div>
              <div className="flex items-center justify-center">
                <Wifi className="w-4 h-4 mr-1 text-sage" />
                <span className="font-medium">{metrics.connectionType}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-neutral-600 mb-1">Viewport</div>
              <div className="flex items-center justify-center">
                <Monitor className="w-4 h-4 mr-1 text-sage" />
                <span className="font-medium text-xs">{metrics.viewportWidth}×{metrics.viewportHeight}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-neutral-600 mb-1">Score</div>
              <div className="flex items-center justify-center">
                <Gauge className="w-4 h-4 mr-1 text-sage" />
                <span className={`font-bold ${getScoreColor(performanceScore)}`}>{performanceScore}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <div className="text-xs text-neutral-600 mb-1">LCP</div>
              <div className={`font-semibold text-sm ${
                getMetricStatus(metrics.lcp, [2500, 4000]) === 'good' ? 'text-green-600' : 
                getMetricStatus(metrics.lcp, [2500, 4000]) === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {formatMetric(metrics.lcp)}
              </div>
            </div>
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <div className="text-xs text-neutral-600 mb-1">FCP</div>
              <div className={`font-semibold text-sm ${
                getMetricStatus(metrics.fcp, [1800, 3000]) === 'good' ? 'text-green-600' : 
                getMetricStatus(metrics.fcp, [1800, 3000]) === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {formatMetric(metrics.fcp)}
              </div>
            </div>
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <div className="text-xs text-neutral-600 mb-1">FID</div>
              <div className={`font-semibold text-sm ${
                getMetricStatus(metrics.fid, [100, 300]) === 'good' ? 'text-green-600' : 
                getMetricStatus(metrics.fid, [100, 300]) === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {formatMetric(metrics.fid)}
              </div>
            </div>
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <div className="text-xs text-neutral-600 mb-1">CLS</div>
              <div className={`font-semibold text-sm ${
                getMetricStatus(metrics.cls ? metrics.cls * 1000 : null, [100, 250]) === 'good' ? 'text-green-600' : 
                getMetricStatus(metrics.cls ? metrics.cls * 1000 : null, [100, 250]) === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {formatMetric(metrics.cls, '')}
              </div>
            </div>
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <div className="text-xs text-neutral-600 mb-1">TTFB</div>
              <div className={`font-semibold text-sm ${
                getMetricStatus(metrics.ttfb, [600, 1500]) === 'good' ? 'text-green-600' : 
                getMetricStatus(metrics.ttfb, [600, 1500]) === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {formatMetric(metrics.ttfb)}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Mobile-specific optimizations indicator */}
      {metrics.deviceType === 'mobile' && performanceScore < 70 && (
        <Card className="p-4 border-yellow-200 bg-yellow-50">
          <div className="flex items-start space-x-3">
            <Smartphone className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Mobile Performance Notice</h4>
              <p className="text-sm text-yellow-700">
                Performance score is below optimal for mobile devices. Consider optimizing images, reducing bundle size, or improving server response times.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MobilePerformanceDashboard;
