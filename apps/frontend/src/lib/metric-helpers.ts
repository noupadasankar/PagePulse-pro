export type MetricStatus = 'green' | 'amber' | 'red';

export const metricDetails: Record<string, { title: string; desc: string; icon: string; recommendation: string }> = {
  title: { title: 'Meta Title', desc: 'The page title tag shown in search results and browser tabs.', icon: 'FileText', recommendation: 'Keep between 30-60 characters for optimal display.' },
  metadescription: { title: 'Meta Description', desc: 'The summary snippet displayed below your title in search results.', icon: 'AlignLeft', recommendation: 'Write 120-160 characters that compel users to click.' },
  h1: { title: 'H1 Headings', desc: 'Primary heading tags that define your page topic for search engines.', icon: 'Heading1', recommendation: 'Use exactly one H1 per page for clear topic signaling.' },
  images: { title: 'Image Alt Text', desc: 'Alternative text for images, critical for accessibility and image search.', icon: 'Image', recommendation: 'Add descriptive alt text to every meaningful image.' },
  wordcount: { title: 'Content Length', desc: 'Total visible word count indicating content depth and value.', icon: 'FileText', recommendation: 'Aim for 300+ words for meaningful content pages.' },
  canonical: { title: 'Canonical URL', desc: 'Prevents duplicate content penalties by declaring the preferred page URL.', icon: 'Link', recommendation: 'Always set a canonical URL to consolidate link equity.' },
  robots: { title: 'Robots Indexability', desc: 'Controls whether search engines can index and display this page.', icon: 'Bot', recommendation: 'Ensure pages you want ranked are set to index, follow.' },
};

export function getStatusColor(status: MetricStatus): string {
  switch (status) {
    case 'green': return 'text-green-500';
    case 'amber': return 'text-amber-500';
    case 'red': return 'text-red-500';
    default: return 'text-gray-500';
  }
}

export function getStatusLabel(status: MetricStatus): string {
  switch (status) {
    case 'green': return 'Good';
    case 'amber': return 'Warning';
    case 'red': return 'Critical';
    default: return 'Unknown';
  }
}

export function getStatusEmoji(status: MetricStatus): string {
  switch (status) {
    case 'green': return '🟢';
    case 'amber': return '🟠';
    case 'red': return '🔴';
    default: return '⚪';
  }
}
