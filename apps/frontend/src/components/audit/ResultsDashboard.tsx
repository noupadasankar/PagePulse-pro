'use client';

import React, { useState } from 'react';
import ScoreGauge from './ScoreGauge';
import MetricCard from './MetricCard';
import { MetricStatus } from '@/lib/metric-helpers';
import { cn } from '@/lib/utils';
import { Copy, Share2, Download, RotateCcw, AlertOctagon, AlertTriangle, CheckCircle2, Check, ExternalLink, Zap, ShieldCheck, Globe, Laptop, BarChart3, Clock, Activity } from 'lucide-react';
import type { AuditResult } from '@pagepulse/shared-types';

interface ResultsDashboardProps {
  data: AuditResult;
  onRetry: () => void;
}

const CATEGORY_MAP: Record<string, string[]> = {
  Performance: ['responseTime', 'wordCount'],
  Security: ['httpStatus', 'robotsMeta'],
  SEO: ['title', 'metaDescription', 'h1Count', 'headingHierarchy', 'canonicalUrl', 'robotsMeta'],
  Responsiveness: ['viewport'],
  Analytics: ['openGraph', 'twitterCard'],
  'Load Time': ['responseTime', 'httpStatus'],
  Vitals: ['responseTime', 'viewport'],
  Accessibility: ['imageAlt', 'htmlLang', 'inputLabels', 'linkText', 'viewport']
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Performance: Zap,
  Security: ShieldCheck,
  SEO: Globe,
  Responsiveness: Laptop,
  Analytics: BarChart3,
  'Load Time': Clock,
  Vitals: Activity,
  Accessibility: CheckCircle2,
};

export default function ResultsDashboard({ data, onRetry }: ResultsDashboardProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { score, checks, details, url, finalUrl, httpStatus, responseTimeMs, auditedAt, id } = data;

  const criticalCount = checks.filter(c => c.status === 'red').length;
  const warningCount = checks.filter(c => c.status === 'amber').length;
  const passedCount = checks.filter(c => c.status === 'green').length;

  const filteredChecks = selectedCategory === 'All'
    ? checks
    : checks.filter(c => {
        const allowedIds = CATEGORY_MAP[selectedCategory] || [];
        return allowedIds.includes(c.id) || c.category?.toLowerCase() === selectedCategory.toLowerCase();
      });

  const handleCopy = async () => {
    const json = JSON.stringify(data, null, 2);
    await navigator.clipboard.writeText(json);
    setCopied('json');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/audit/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Page Pulse Audit: ${url}`, url: shareUrl });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied('link');
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleDownload = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `page-pulse-audit-${url.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fadeInUp">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-card rounded-2xl p-4 shadow-sm border">
        <div className="flex items-center gap-3">
          <img src={`https://www.google.com/s2/favicons?domain=${url}&sz=32`} alt="favicon" className="w-6 h-6 rounded-sm" />
          <h2 className="text-lg font-semibold truncate max-w-[300px] sm:max-w-md" title={url}>{url}</h2>
          {finalUrl !== url && (
            <a href={finalUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:underline flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> Redirected
            </a>
          )}
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0 text-sm">
          {responseTimeMs && (
            <span className="bg-muted px-3 py-1 rounded-full text-muted-foreground font-medium">
              {responseTimeMs}ms response
            </span>
          )}
          <span className="text-muted-foreground">
            {httpStatus} {httpStatus === 200 ? 'OK' : ''}
          </span>
          <span className="text-muted-foreground">{formatDate(auditedAt)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Score Section */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-8 glass-card rounded-3xl">
          <h3 className="text-xl font-bold mb-6 text-center">Overall Health Score</h3>
          <ScoreGauge score={score.overall} size={240} />
          <div className="mt-6 text-center">
            <span className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${score.overall >= 90 ? 'bg-green-100 text-green-700' : score.overall >= 70 ? 'bg-blue-100 text-blue-700' : score.overall >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
              Grade {score.grade}
            </span>
            <p className="text-sm text-muted-foreground mt-1">{score.label}</p>
          </div>
        </div>

        {/* Summary Stats Row */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card flex flex-col justify-center p-4 rounded-xl border bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertOctagon className="w-5 h-5 text-red-500" />
              <span className="font-semibold text-foreground">Critical Issues</span>
            </div>
            <span className="text-4xl font-bold text-red-500">{criticalCount}</span>
          </div>
          <div className="stat-card flex flex-col justify-center p-4 rounded-xl border bg-amber-50 dark:bg-amber-900/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-foreground">Warnings</span>
            </div>
            <span className="text-4xl font-bold text-amber-500">{warningCount}</span>
          </div>
          <div className="stat-card flex flex-col justify-center p-4 rounded-xl border bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="font-semibold text-foreground">Passed Checks</span>
            </div>
            <span className="text-4xl font-bold text-green-500">{passedCount}</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-3 justify-end">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors font-medium text-sm"
          disabled={copied === 'json'}
        >
          <Copy className="w-4 h-4" />
          {copied === 'json' ? <Check className="w-4 h-4 text-green-500" /> : 'Copy JSON'}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors font-medium text-sm"
          disabled={copied === 'link'}
        >
          <Share2 className="w-4 h-4" />
          {copied === 'link' ? <Check className="w-4 h-4 text-green-500" /> : 'Share Link'}
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors font-medium text-sm"
        >
          <Download className="w-4 h-4" />
          Download Report
        </button>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Re-audit
        </button>
      </div>

      {/* Detailed Metrics Section */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold">Detailed Analysis</h3>
            <p className="text-sm text-muted-foreground">Filter audit findings by metric categories</p>
          </div>

          {/* Metric Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Performance', 'Security', 'SEO', 'Responsiveness', 'Analytics', 'Load Time', 'Vitals', 'Accessibility'].map((cat) => {
              const IconComp = CATEGORY_ICONS[cat];
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  {IconComp && <IconComp className="w-3.5 h-3.5" />}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredChecks.length > 0 ? (
            filteredChecks.map((check, i) => (
              <MetricCard
                key={check.id}
                id={check.id}
                value={check.displayValue}
                status={check.status}
                guidance={check.recommendation}
                index={i}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 border border-dashed rounded-2xl">
              <p className="text-muted-foreground">No checks found for category &quot;{selectedCategory}&quot;</p>
            </div>
          )}
        </div>
      </div>

      {/* Raw Details (Collapsible) */}
      <details className="group border rounded-xl overflow-hidden">
        <summary className="flex items-center justify-between p-4 bg-muted/50 cursor-pointer list-none">
          <span className="font-medium">Raw Extracted Data</span>
          <span className="text-muted-foreground">Click to expand</span>
        </summary>
        <pre className="p-4 overflow-x-auto text-sm bg-black/5 dark:bg-white/5"><code>{JSON.stringify(details, null, 2)}</code></pre>
      </details>
    </div>
  );
}