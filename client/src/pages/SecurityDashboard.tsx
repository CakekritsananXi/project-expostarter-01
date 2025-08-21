import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw, Download } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { queryClient } from '../lib/queryClient';

interface VulnerabilityReport {
  vulnerabilities: Array<{
    id: string;
    title: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    package: string;
    description: string;
    fix?: string;
  }>;
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  scannedAt: Date;
}

const SecurityDashboard: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanType, setScanType] = useState<'comprehensive' | 'vulnerabilities' | 'audit'>('comprehensive');

  const { data: scanResults, isLoading } = useQuery<{ data: any }>({
    queryKey: [`/api/security/${scanType}`],
    enabled: false, // Don't auto-fetch
  });

  const runSecurityScan = async (type: 'comprehensive' | 'vulnerabilities' | 'audit') => {
    setIsScanning(true);
    setScanType(type);
    
    try {
      await queryClient.invalidateQueries({ queryKey: [`/api/security/${type}`] });
      const result = await queryClient.fetchQuery({
        queryKey: [`/api/security/${type}`],
        queryFn: async () => {
          const response = await fetch(`/api/security/${type === 'comprehensive' ? 'scan' : type}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          
          if (!response.ok) {
            throw new Error('Failed to run security scan');
          }
          
          return response.json();
        },
      });
      
      console.log('Security scan completed:', result);
    } catch (error) {
      console.error('Security scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const SecurityMetrics = ({ data }: { data: any }) => {
    if (!data?.vulnerabilities && !data?.summary) return null;

    const summary = data.summary || data.vulnerabilities?.summary;
    if (!summary) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-neutral-900">{summary.total}</div>
          <div className="text-sm text-neutral-600">Total Issues</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-red-600">{summary.critical}</div>
          <div className="text-sm text-neutral-600">Critical</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-orange-600">{summary.high}</div>
          <div className="text-sm text-neutral-600">High</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-yellow-600">{summary.medium}</div>
          <div className="text-sm text-neutral-600">Medium</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-blue-600">{summary.low}</div>
          <div className="text-sm text-neutral-600">Low</div>
        </Card>
      </div>
    );
  };

  const VulnerabilityList = ({ vulnerabilities }: { vulnerabilities: any[] }) => {
    if (!vulnerabilities || vulnerabilities.length === 0) {
      return (
        <Card className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Vulnerabilities Found</h3>
          <p className="text-neutral-600">Your application appears to be secure!</p>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {vulnerabilities.slice(0, 10).map((vuln, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(vuln.severity)}`}>
                    {getSeverityIcon(vuln.severity)}
                    <span className="ml-1 capitalize">{vuln.severity}</span>
                  </span>
                  <span className="ml-2 text-sm text-neutral-500">{vuln.package}</span>
                </div>
                <h4 className="font-medium text-neutral-900 mb-1">{vuln.title}</h4>
                <p className="text-sm text-neutral-600 mb-2">{vuln.description}</p>
                {vuln.fix && (
                  <div className="text-sm bg-blue-50 text-blue-700 p-2 rounded">
                    <strong>Fix:</strong> {vuln.fix}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
        {vulnerabilities.length > 10 && (
          <Card className="p-4 text-center">
            <p className="text-neutral-600">
              Showing 10 of {vulnerabilities.length} vulnerabilities. 
              Run a full scan to see all issues.
            </p>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
          Security Dashboard
        </h1>
        <p className="text-sm sm:text-base text-neutral-600">
          Monitor and scan your application for security vulnerabilities.
        </p>
      </div>

      {/* Security Actions */}
      <Card className="mb-8 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Security Scanning</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="primary"
            icon={Shield}
            loading={isScanning && scanType === 'comprehensive'}
            onClick={() => runSecurityScan('comprehensive')}
            className="justify-start"
            data-testid="button-comprehensive-scan"
          >
            Comprehensive Scan
          </Button>
          <Button
            variant="secondary"
            icon={AlertTriangle}
            loading={isScanning && scanType === 'vulnerabilities'}
            onClick={() => runSecurityScan('vulnerabilities')}
            className="justify-start"
            data-testid="button-vulnerability-scan"
          >
            Vulnerability Scan
          </Button>
          <Button
            variant="outline"
            icon={RefreshCw}
            loading={isScanning && scanType === 'audit'}
            onClick={() => runSecurityScan('audit')}
            className="justify-start"
            data-testid="button-audit-scan"
          >
            NPM Audit
          </Button>
        </div>
      </Card>

      {/* Security Metrics */}
      {scanResults?.data && <SecurityMetrics data={scanResults.data} />}

      {/* Security Headers Info */}
      <Card className="mb-8 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Security Features Implemented</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm">Content Security Policy (CSP)</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm">HTTP Strict Transport Security (HSTS)</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm">XSS Protection Headers</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm">CSRF Token Protection</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm">Rate Limiting</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm">Input Sanitization</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm">Client-side Validation</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm">Secure Authentication</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Vulnerability Results */}
      {isLoading && (
        <Card className="p-6 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600">Running security scan...</p>
        </Card>
      )}

      {scanResults?.data && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">Scan Results</h2>
            <div className="flex items-center space-x-2 text-sm text-neutral-500">
              <span>Last scan:</span>
              <span>{new Date(scanResults.data.scannedAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
          
          {scanResults.data.vulnerabilities && (
            <VulnerabilityList 
              vulnerabilities={scanResults.data.vulnerabilities.vulnerabilities || scanResults.data.vulnerabilities} 
            />
          )}
          
          {scanResults.data.npmAudit && (
            <div className="mt-6">
              <h3 className="text-md font-medium text-neutral-900 mb-4">NPM Audit Results</h3>
              <VulnerabilityList vulnerabilities={scanResults.data.npmAudit.vulnerabilities} />
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default SecurityDashboard;