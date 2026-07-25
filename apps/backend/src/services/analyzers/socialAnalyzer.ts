import type { MetricCheck } from '@pagepulse/shared-types';
import type { ParsedHtml } from '../../types/audit.types';
import { buildCheck } from './checkBuilder';

/** og: tags required for a rich link preview. */
const REQUIRED_OG_TAGS = ['title', 'description', 'image'] as const;

/** twitter: tags required for a rich card. */
const REQUIRED_TWITTER_TAGS = ['card', 'title', 'description'] as const;

/**
 * Open Graph and Twitter Card tags — how the page looks when shared on social
 * platforms. Not a direct ranking factor, hence the lighter category weight,
 * but it drives click-through on shared links.
 */
export function analyzeSocial(parsed: ParsedHtml): MetricCheck[] {
  return [analyzeOpenGraph(parsed), analyzeTwitterCard(parsed)];
}

function analyzeOpenGraph(parsed: ParsedHtml): MetricCheck {
  const tags = parsed.openGraph;
  const present = REQUIRED_OG_TAGS.filter((tag) => Boolean(tags[tag]));
  const missing = REQUIRED_OG_TAGS.filter((tag) => !tags[tag]);

  if (missing.length === 0) {
    return buildCheck({
      id: 'openGraph',
      label: 'Open Graph Tags',
      category: 'social',
      status: 'green',
      value: present.length,
      displayValue: 'Complete',
      recommendedValue: 'og:title, og:description, og:image',
      message: 'All essential Open Graph tags are present.',
      recommendation:
        'Links to this page will render a rich preview on Facebook, LinkedIn, Slack, and similar.',
      weight: 2,
    });
  }

  const missingList = missing.map((tag) => `og:${tag}`).join(', ');

  if (present.length === 0) {
    return buildCheck({
      id: 'openGraph',
      label: 'Open Graph Tags',
      category: 'social',
      status: 'red',
      value: 0,
      displayValue: 'Missing',
      recommendedValue: 'og:title, og:description, og:image',
      message: 'No Open Graph tags were found.',
      recommendation:
        'Add og:title, og:description, and og:image. Without them, shared links show a bare URL instead of a preview card, which measurably reduces clicks.',
      priority: 'medium',
      weight: 2,
    });
  }

  return buildCheck({
    id: 'openGraph',
    label: 'Open Graph Tags',
    category: 'social',
    status: 'amber',
    value: present.length,
    displayValue: `${present.length} of ${REQUIRED_OG_TAGS.length} tags`,
    recommendedValue: 'og:title, og:description, og:image',
    message: `Missing ${missingList}.`,
    recommendation: `Add ${missingList} to complete the preview card. og:image matters most — it is the visual that drives clicks.`,
    weight: 2,
  });
}

function analyzeTwitterCard(parsed: ParsedHtml): MetricCheck {
  const tags = parsed.twitterCard;
  const hasOpenGraphFallback = Boolean(parsed.openGraph.title && parsed.openGraph.image);
  const present = REQUIRED_TWITTER_TAGS.filter((tag) => Boolean(tags[tag]));
  const missing = REQUIRED_TWITTER_TAGS.filter((tag) => !tags[tag]);

  if (missing.length === 0) {
    return buildCheck({
      id: 'twitterCard',
      label: 'Twitter Card Tags',
      category: 'social',
      status: 'green',
      value: present.length,
      displayValue: 'Complete',
      recommendedValue: 'twitter:card, twitter:title, twitter:description',
      message: 'All essential Twitter Card tags are present.',
      recommendation: 'Links to this page will render as a rich card on X/Twitter.',
      weight: 2,
    });
  }

  // X falls back to Open Graph when Twitter tags are absent, so a page with
  // solid og: tags still previews correctly. Grade that as a warning, not a fail.
  if (present.length === 0 && hasOpenGraphFallback) {
    return buildCheck({
      id: 'twitterCard',
      label: 'Twitter Card Tags',
      category: 'social',
      status: 'amber',
      value: 0,
      displayValue: 'Using Open Graph fallback',
      recommendedValue: 'twitter:card, twitter:title, twitter:description',
      message: 'No Twitter tags, but Open Graph tags will be used instead.',
      recommendation:
        'Optionally add twitter:card ("summary_large_image") for explicit control. X currently falls back to your Open Graph tags.',
      priority: 'low',
      weight: 2,
    });
  }

  if (present.length === 0) {
    return buildCheck({
      id: 'twitterCard',
      label: 'Twitter Card Tags',
      category: 'social',
      status: 'red',
      value: 0,
      displayValue: 'Missing',
      recommendedValue: 'twitter:card, twitter:title, twitter:description',
      message: 'No Twitter Card tags, and no Open Graph tags to fall back on.',
      recommendation:
        'Add twitter:card, twitter:title, and twitter:description so shared links render as a card rather than a plain URL.',
      priority: 'medium',
      weight: 2,
    });
  }

  const missingList = missing.map((tag) => `twitter:${tag}`).join(', ');
  return buildCheck({
    id: 'twitterCard',
    label: 'Twitter Card Tags',
    category: 'social',
    status: 'amber',
    value: present.length,
    displayValue: `${present.length} of ${REQUIRED_TWITTER_TAGS.length} tags`,
    recommendedValue: 'twitter:card, twitter:title, twitter:description',
    message: `Missing ${missingList}.`,
    recommendation: `Add ${missingList} to complete the card.`,
    weight: 2,
  });
}
