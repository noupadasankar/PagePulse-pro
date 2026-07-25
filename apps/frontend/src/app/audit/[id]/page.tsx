import Link from 'next/link';
import ResultsDashboard from '../../../components/audit/ResultsDashboard';
import { ArrowLeft, AlertCircle } from 'lucide-react';

async function getAuditById(id: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/api/v1/audit/${id}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export default async function AuditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const auditData = await getAuditById(resolvedParams.id);

  if (!auditData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-20 h-20 bg-destructive/10 border border-destructive/20 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">Audit Expired or Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          The SEO audit you are looking for doesn&apos;t exist or has expired from our temporary cache.
        </p>
        <Link 
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium py-3 px-6 rounded-xl hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" /> Run New Audit
        </Link>
      </div>
    );
  }

  // Calculate health score & metrics array
  const metricsData = auditData.metrics || {};
  let score = 100;
  const metricsList: any[] = [];

  if (metricsData.title) {
    if (metricsData.title.status === 'red') score -= 15;
    else if (metricsData.title.status === 'amber') score -= 5;
    metricsList.push({
      id: 'title',
      value: metricsData.title.length ? `${metricsData.title.length} chars` : 'Missing',
      status: metricsData.title.status,
      guidance: metricsData.title.message
    });
  }

  if (metricsData.metaDescription) {
    if (metricsData.metaDescription.status === 'red') score -= 15;
    else if (metricsData.metaDescription.status === 'amber') score -= 5;
    metricsList.push({
      id: 'metaDescription',
      value: metricsData.metaDescription.length ? `${metricsData.metaDescription.length} chars` : 'Missing',
      status: metricsData.metaDescription.status,
      guidance: metricsData.metaDescription.message
    });
  }

  if (metricsData.h1Count) {
    if (metricsData.h1Count.status === 'red') score -= 15;
    else if (metricsData.h1Count.status === 'amber') score -= 5;
    metricsList.push({
      id: 'h1',
      value: `${metricsData.h1Count.count} H1 tags`,
      status: metricsData.h1Count.status,
      guidance: metricsData.h1Count.message
    });
  }

  if (metricsData.imagesMissingAlt) {
    if (metricsData.imagesMissingAlt.status === 'red') score -= 15;
    else if (metricsData.imagesMissingAlt.status === 'amber') score -= 5;
    metricsList.push({
      id: 'images',
      value: `${metricsData.imagesMissingAlt.missingAlt} / ${metricsData.imagesMissingAlt.total} missing alt`,
      status: metricsData.imagesMissingAlt.status,
      guidance: metricsData.imagesMissingAlt.message
    });
  }

  if (metricsData.wordCount) {
    if (metricsData.wordCount.status === 'red') score -= 15;
    else if (metricsData.wordCount.status === 'amber') score -= 5;
    metricsList.push({
      id: 'wordCount',
      value: `${metricsData.wordCount.count} words`,
      status: metricsData.wordCount.status,
      guidance: metricsData.wordCount.message
    });
  }

  if (metricsData.canonicalUrl) {
    if (metricsData.canonicalUrl.status === 'red') score -= 10;
    metricsList.push({
      id: 'canonical',
      value: metricsData.canonicalUrl.value ? 'Present' : 'Missing',
      status: metricsData.canonicalUrl.status,
      guidance: metricsData.canonicalUrl.message
    });
  }

  if (metricsData.robotsMeta) {
    if (metricsData.robotsMeta.status === 'red') score -= 15;
    metricsList.push({
      id: 'robots',
      value: metricsData.robotsMeta.isIndexable ? 'Indexable' : 'NoIndex',
      status: metricsData.robotsMeta.status,
      guidance: metricsData.robotsMeta.message
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Breadcrumbs & Share Badge */}
      <div className="flex items-center justify-between mb-8">
        <nav className="text-sm text-muted-foreground flex items-center gap-2">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Audit Result</span>
        </nav>
        
        <div className="bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Shared Audit Link
        </div>
      </div>

      <ResultsDashboard
        data={auditData}
        onRetry={() => {}}
      />
    </div>
  );
}
