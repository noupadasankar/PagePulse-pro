'use client';

import { useAudit } from '@/hooks/useAudit';
import { useAuditHistory } from '@/hooks/useAuditHistory';
import { AuditForm } from '@/components/audit/AuditForm';
import ResultsDashboard from '@/components/audit/ResultsDashboard';
import AuditHistory from '@/components/audit/AuditHistory';
import { MetricDetailModal } from '@/components/audit/MetricDetailModal';
import { Activity, AlertTriangle, ArrowRight, BarChart3, CheckCircle2, Clock, Globe, Laptop, RefreshCcw, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';

function getViewModel(data: any) {
  if (!data) return null;
  // api-client already unwraps json.data, but guard against double-wrapping
  const raw = data.data ? data.data : data;
  if (!raw || typeof raw !== 'object' || !raw.score) return null;
  const overallScore = raw.score?.overall ?? 0;
  return {
    ...raw,
    healthScore: overallScore,
  };
}

export default function Page() {
  const { runAudit, data, isPending, isError, isSuccess, error, reset } = useAudit();
  const { addAudit, history, toHistoryEntry } = useAuditHistory();
  const [showLoading, setShowLoading] = useState(false);
  const [selectedMetricCategory, setSelectedMetricCategory] = useState<string | null>(null);
  const savedAuditId = useRef<string | null>(null);

  const viewModel = getViewModel(data);

  useEffect(() => {
    if (viewModel && isSuccess && viewModel.id && savedAuditId.current !== viewModel.id) {
      savedAuditId.current = viewModel.id;
      addAudit({
        id: viewModel.id,
        url: viewModel.url,
        timestamp: viewModel.auditedAt || new Date().toISOString(),
        score: viewModel.healthScore,
        healthScore: viewModel.healthScore,
      });
    }
  }, [viewModel?.id, isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isPending) {
      savedAuditId.current = null;
      const timer = setTimeout(() => setShowLoading(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [isPending]);

  const handleAudit = (url: string) => {
    setShowLoading(false);
    runAudit(url);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stats = history.length > 0 ? {
    total: history.length,
    avg: Math.round(history.reduce((acc, h) => acc + (h.healthScore || 0), 0) / history.length),
    best: Math.max(...history.map(h => h.healthScore || 0))
  } : null;

  return (
    <div className="flex-1 flex flex-col">
      <MetricDetailModal
        categoryName={selectedMetricCategory}
        onClose={() => setSelectedMetricCategory(null)}
        onRunAuditRequest={scrollToTop}
      />

      <main className="flex-1 container mx-auto px-4 py-8 space-y-12">
        {/* Loading Overlay */}
        {showLoading && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <Zap className="h-6 w-6 text-primary absolute inset-0 m-auto animate-pulse" />
            </div>
            <p className="text-lg font-medium animate-pulse">Analyzing page metrics & technical SEO...</p>
            <p className="text-sm text-muted-foreground">Running checks for meta, performance, security & accessibility</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-destructive/50 bg-destructive/10 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-bold text-destructive">Audit Failed</h2>
            <p className="text-muted-foreground">{error?.message || 'Failed to analyze page. Please verify the URL and try again.'}</p>
            <Button onClick={reset} variant="outline" className="gap-2">
              <RefreshCcw className="h-4 w-4" /> Try Again
            </Button>
          </div>
        )}

        {/* Results View */}
        {viewModel && isSuccess && !isPending && (
          <ResultsDashboard data={viewModel} onRetry={reset} />
        )}

        {/* Hero & Audit Form (When no results) */}
        {!viewModel && !isPending && (
          <>
            <section className="text-center py-12 space-y-6 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-secondary text-secondary-foreground text-sm font-medium">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>Instant Real-Time Technical SEO Audit</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                Analyze Any Page&apos;s <span className="gradient-text">SEO & Health</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Get an instant breakdown of your website&apos;s performance, security, indexing, meta tags, and accessibility with zero sign-up.
              </p>

              <div className="pt-4 max-w-xl mx-auto">
                <AuditForm onSubmit={handleAudit} isLoading={isPending} />
              </div>
            </section>

            {/* How It Works */}
            <section className="py-12 border-t space-y-8">
              <h2 className="text-3xl font-bold text-center">How PagePulse Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl bg-secondary/50">
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl font-bold">1</div>
                  <h3 className="text-xl font-semibold">Enter URL</h3>
                  <p className="text-muted-foreground">Input any public website address to begin your instant technical scan.</p>
                </div>
                <div className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl bg-secondary/50">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xl font-bold">2</div>
                  <h3 className="text-xl font-semibold">Instant Analysis</h3>
                  <p className="text-muted-foreground">Our engine fetches and analyzes your site in real-time across 8 core areas.</p>
                </div>
                <div className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl bg-secondary/50">
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xl font-bold">3</div>
                  <h3 className="text-xl font-semibold">Actionable Results</h3>
                  <p className="text-muted-foreground">Get detailed insights and recommendations to improve your site score.</p>
                </div>
              </div>
            </section>

            {/* Comprehensive Metrics Cards */}
            <section className="py-12 border-t">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Comprehensive Metrics</h2>
                <p className="text-muted-foreground">We analyze everything that matters for SEO and UX. Click any metric to inspect.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Zap, label: 'Performance', color: 'text-amber-500' },
                  { icon: ShieldCheck, label: 'Security', color: 'text-emerald-500' },
                  { icon: Globe, label: 'SEO', color: 'text-blue-500' },
                  { icon: Laptop, label: 'Responsiveness', color: 'text-purple-500' },
                  { icon: BarChart3, label: 'Analytics', color: 'text-indigo-500' },
                  { icon: Clock, label: 'Load Time', color: 'text-cyan-500' },
                  { icon: Activity, label: 'Vitals', color: 'text-rose-500' },
                  { icon: CheckCircle2, label: 'Accessibility', color: 'text-teal-500' }
                ].map((feature, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedMetricCategory(feature.label)}
                    className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-secondary/60 hover:border-primary/50 hover:shadow-lg hover:scale-[1.03] transition-all cursor-pointer text-left group"
                  >
                    <div className="p-2 rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                      <feature.icon className={`h-5 w-5 ${feature.color}`} />
                    </div>
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{feature.label}</span>
                  </button>
                ))}
              </div>
            </section>
            
            {stats && (
              <section className="py-12 border-t space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl bg-card border shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Total Audits</p>
                    <p className="text-4xl font-bold">{stats.total}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-card border shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Average Score</p>
                    <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{stats.avg}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-card border shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Best Score</p>
                    <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{stats.best}</p>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold mb-6">Recent Audits</h2>
                  <AuditHistory entries={history.map(toHistoryEntry)} onReaudit={handleAudit} />
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}