'use client';

import React from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Globe, 
  Laptop, 
  BarChart3, 
  Clock, 
  Activity, 
  CheckCircle2, 
  X, 
  ArrowRight,
  Check,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface MetricCategoryInfo {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  badgeBg: string;
  description: string;
  benchmark: string;
  checks: { title: string; description: string; impact: 'High' | 'Medium' | 'Low' }[];
  liveStats: { label: string; value: string; status: 'good' | 'warning' | 'info' }[];
}

export const METRIC_CATEGORIES_DATA: Record<string, MetricCategoryInfo> = {
  Performance: {
    id: 'Performance',
    name: 'Performance & Speed',
    icon: Zap,
    color: 'text-amber-500',
    badgeBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    description: 'Measures network latency, server response time, TTFB, and DOM execution speed to maximize user retention.',
    benchmark: '< 300ms Server Response',
    checks: [
      { title: 'Time to First Byte (TTFB)', description: 'Server response responsiveness and initial connection time.', impact: 'High' },
      { title: 'DOM Processing Time', description: 'Duration taken to parse HTML and construct DOM tree.', impact: 'Medium' },
      { title: 'Asset Payload Compression', description: 'Gzip/Brotli encoding check for CSS, JS, and HTML files.', impact: 'High' },
    ],
    liveStats: [
      { label: 'Avg TTFB', value: '142ms', status: 'good' },
      { label: 'Payload Size', value: '420 KB', status: 'good' },
      { label: 'Compression', value: 'Brotli Active', status: 'good' },
    ]
  },
  Security: {
    id: 'Security',
    name: 'Security & SSL',
    icon: ShieldCheck,
    color: 'text-emerald-500',
    badgeBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    description: 'Verifies HTTPS protocol enforcement, TLS certificate health, security headers, and SSRF/x-frame safeguards.',
    benchmark: 'HTTPS Enforced + TLS 1.3',
    checks: [
      { title: 'HTTPS Redirection', description: 'Ensures HTTP requests automatically upgrade to secure HTTPS.', impact: 'High' },
      { title: 'Security Headers', description: 'Checks for Content-Security-Policy, HSTS, and X-Content-Type-Options.', impact: 'High' },
      { title: 'SSL Certificate Validity', description: 'Validates encryption chain and certificate expiration date.', impact: 'High' },
    ],
    liveStats: [
      { label: 'Encryption', value: 'TLS 1.3 256-bit', status: 'good' },
      { label: 'HTTPS Redirect', value: 'Enabled 301', status: 'good' },
      { label: 'HSTS Header', value: 'Active', status: 'good' },
    ]
  },
  SEO: {
    id: 'SEO',
    name: 'Search Engine Optimization',
    icon: Globe,
    color: 'text-blue-500',
    badgeBg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    description: 'Evaluates essential meta tags, title lengths, descriptions, canonical tags, and robots indexing directives.',
    benchmark: '100% Meta & Indexability Compliance',
    checks: [
      { title: 'Meta Title & Description', description: 'Checks character length and uniqueness for SERP snippet optimization.', impact: 'High' },
      { title: 'Canonical Tag Presence', description: 'Prevents duplicate content issues across URL parameters.', impact: 'High' },
      { title: 'Robots Directives', description: 'Ensures target pages permit crawling and indexation.', impact: 'High' },
    ],
    liveStats: [
      { label: 'Title Length', value: '54 / 60 chars', status: 'good' },
      { label: 'Indexability', value: 'Index, Follow', status: 'good' },
      { label: 'Canonical URL', value: 'Self-referencing', status: 'good' },
    ]
  },
  Responsiveness: {
    id: 'Responsiveness',
    name: 'Mobile & Responsiveness',
    icon: Laptop,
    color: 'text-purple-500',
    badgeBg: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    description: 'Ensures the page scales gracefully across mobile, tablet, and desktop devices without horizontal scrolling.',
    benchmark: 'Viewport Configured + Fluid Layout',
    checks: [
      { title: 'Mobile Viewport Meta Tag', description: 'Validates presence of width=device-width, initial-scale=1.', impact: 'High' },
      { title: 'Touch Target Sizing', description: 'Ensures interactive elements have sufficient padding for finger taps.', impact: 'Medium' },
      { title: 'Font Size Legibility', description: 'Checks that base text size is readable on small viewports.', impact: 'Medium' },
    ],
    liveStats: [
      { label: 'Viewport Tag', value: 'Configured', status: 'good' },
      { label: 'Touch Targets', value: 'Passed (>=48px)', status: 'good' },
      { label: 'Horizontal Scroll', value: 'None detected', status: 'good' },
    ]
  },
  Analytics: {
    id: 'Analytics',
    name: 'Analytics & Tracking',
    icon: BarChart3,
    color: 'text-indigo-500',
    badgeBg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    description: 'Detects presence of tracking scripts (Google Analytics 4, Tag Manager, Meta Pixel) and social meta cards.',
    benchmark: 'OG Cards & Analytics Active',
    checks: [
      { title: 'Open Graph Social Cards', description: 'Verifies og:image, og:title, and og:description for rich link previews.', impact: 'High' },
      { title: 'Twitter / X Card Tags', description: 'Ensures twitter:card format renders summary or large image cards.', impact: 'Medium' },
      { title: 'Analytics Script Tags', description: 'Scans page scripts for tracking code integrations.', impact: 'Low' },
    ],
    liveStats: [
      { label: 'Open Graph', value: 'Configured', status: 'good' },
      { label: 'Twitter Card', value: 'Summary Large', status: 'good' },
      { label: 'Tracking Tags', value: 'Detected', status: 'good' },
    ]
  },
  'Load Time': {
    id: 'Load Time',
    name: 'Load Time Breakdown',
    icon: Clock,
    color: 'text-cyan-500',
    badgeBg: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    description: 'Tracks page assembly duration from DNS lookup, connection handshake, to HTML download completion.',
    benchmark: '< 500ms Total Page Fetch',
    checks: [
      { title: 'HTTP Response Time', description: 'Full roundtrip time to complete the initial HTML payload fetch.', impact: 'High' },
      { title: 'Redirect Overhead', description: 'Identifies chain redirects (301/302) that delay page load.', impact: 'High' },
      { title: 'HTTP Status Code', description: 'Ensures clean 200 OK status code without server error retries.', impact: 'High' },
    ],
    liveStats: [
      { label: 'Status Code', value: '200 OK', status: 'good' },
      { label: 'Redirect Chain', value: '0 Hop (Direct)', status: 'good' },
      { label: 'Fetch Duration', value: '185 ms', status: 'good' },
    ]
  },
  Vitals: {
    id: 'Vitals',
    name: 'Core Web Vitals',
    icon: Activity,
    color: 'text-rose-500',
    badgeBg: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    description: 'Analyzes user experience metrics including Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS).',
    benchmark: 'LCP < 2.5s | CLS < 0.1',
    checks: [
      { title: 'Largest Contentful Paint (LCP)', description: 'Render time of the largest image or text block visible in the viewport.', impact: 'High' },
      { title: 'Cumulative Layout Shift (CLS)', description: 'Measures visual stability and unexpected content shifting.', impact: 'High' },
      { title: 'First Contentful Paint (FCP)', description: 'Time until the browser renders the first bit of DOM content.', impact: 'Medium' },
    ],
    liveStats: [
      { label: 'LCP (Est.)', value: '1.2s', status: 'good' },
      { label: 'CLS (Est.)', value: '0.02', status: 'good' },
      { label: 'FCP (Est.)', value: '0.8s', status: 'good' },
    ]
  },
  Accessibility: {
    id: 'Accessibility',
    name: 'Accessibility & Usability',
    icon: CheckCircle2,
    color: 'text-teal-500',
    badgeBg: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
    description: 'Scans for image alt attributes, language declarations, form label associations, and descriptive anchor text.',
    benchmark: '100% Alt Text & Language Tagged',
    checks: [
      { title: 'Image Alternative Text', description: 'Ensures all non-decorative <img> elements have meaningful alt text.', impact: 'High' },
      { title: 'HTML Language Attribute', description: 'Checks for <html lang="..."> attribute for screen reader compatibility.', impact: 'High' },
      { title: 'Form Input Labelling', description: 'Verifies <label> or aria-label associations on interactive form controls.', impact: 'Medium' },
    ],
    liveStats: [
      { label: 'Alt Text Coverage', value: '100%', status: 'good' },
      { label: 'HTML Lang', value: 'Declared (en)', status: 'good' },
      { label: 'Form Control Labels', value: '100% Associated', status: 'good' },
    ]
  }
};

interface MetricDetailModalProps {
  categoryName: string | null;
  onClose: () => void;
  onRunAuditRequest?: () => void;
}

export function MetricDetailModal({ categoryName, onClose, onRunAuditRequest }: MetricDetailModalProps) {
  if (!categoryName || !METRIC_CATEGORIES_DATA[categoryName]) return null;

  const data = METRIC_CATEGORIES_DATA[categoryName];
  const Icon = data.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden animate-scaleUp">
        {/* Top Decorative Header */}
        <div className="flex items-center justify-between pb-6 border-b">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${data.badgeBg} border`}>
              <Icon className={`h-6 w-6 ${data.color}`} />
            </div>
            <div>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${data.badgeBg}`}>
                Real-Time Metric Engine
              </span>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{data.name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-6 space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Overview Description */}
          <div className="bg-secondary/40 rounded-2xl p-4 border border-border/50">
            <p className="text-muted-foreground text-sm leading-relaxed">{data.description}</p>
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-primary">
              <Check className="h-4 w-4" />
              <span>Target Standard: {data.benchmark}</span>
            </div>
          </div>

          {/* Live Preview Stats */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Real-Time Measurement Engine Preview
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {data.liveStats.map((stat, i) => (
                <div key={i} className="p-3.5 rounded-xl border bg-card/60 flex flex-col items-start gap-1">
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                  <span className="text-lg font-bold text-foreground">{stat.value}</span>
                  <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Benchmark
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-Checks Analyzed */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Specific Checks Analyzed by PagePulse
            </h4>
            <div className="space-y-3">
              {data.checks.map((check, i) => (
                <div key={i} className="p-4 rounded-xl border bg-card hover:bg-secondary/20 transition-colors flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      {check.title}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{check.description}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    check.impact === 'High' 
                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {check.impact} Impact
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" /> Runs instantly during website analysis
          </span>
          <Button
            onClick={() => {
              onClose();
              if (onRunAuditRequest) onRunAuditRequest();
            }}
            className="w-full sm:w-auto gap-2 font-semibold shadow-lg"
          >
            Test Your Website Now <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
