import type { MetricCheck } from '@pagepulse/shared-types';
import type { ParsedHtml } from '../../types/audit.types';
import { buildCheck, truncate } from './checkBuilder';

/**
 * Title and meta description — the two tags that decide how the page renders in
 * a search results listing. Thresholds match the documented spec:
 * title 30–60 chars, description 120–160.
 */
export function analyzeMeta(parsed: ParsedHtml): MetricCheck[] {
  return [analyzeTitle(parsed), analyzeMetaDescription(parsed)];
}

function analyzeTitle(parsed: ParsedHtml): MetricCheck {
  const title = parsed.title;
  const length = title?.length ?? 0;

  if (!title) {
    return buildCheck({
      id: 'title',
      label: 'Page Title',
      category: 'meta',
      status: 'red',
      value: null,
      displayValue: 'Missing',
      recommendedValue: '30–60 characters',
      message: 'This page has no <title> tag.',
      recommendation:
        'Add a unique <title> of 30–60 characters describing the page. It is the single strongest on-page ranking signal and the headline of your search result.',
      priority: 'critical',
      weight: 2,
    });
  }

  if (length >= 30 && length <= 60) {
    return buildCheck({
      id: 'title',
      label: 'Page Title',
      category: 'meta',
      status: 'green',
      value: length,
      displayValue: `${length} characters`,
      recommendedValue: '30–60 characters',
      message: `"${truncate(title)}"`,
      recommendation: 'Well-sized title — it should display in full in search results.',
      weight: 2,
    });
  }

  const tooShort = length < 30;
  return buildCheck({
    id: 'title',
    label: 'Page Title',
    category: 'meta',
    status: 'amber',
    value: length,
    displayValue: `${length} characters`,
    recommendedValue: '30–60 characters',
    message: `"${truncate(title)}"`,
    recommendation: tooShort
      ? `At ${length} characters this title is short and wastes ranking space. Expand it toward 30–60 characters with relevant keywords.`
      : `At ${length} characters this title will likely be truncated in search results. Trim it to 60 characters or fewer.`,
    weight: 2,
  });
}

function analyzeMetaDescription(parsed: ParsedHtml): MetricCheck {
  const description = parsed.metaDescription;
  const length = description?.length ?? 0;

  if (!description) {
    return buildCheck({
      id: 'metaDescription',
      label: 'Meta Description',
      category: 'meta',
      status: 'red',
      value: null,
      displayValue: 'Missing',
      recommendedValue: '120–160 characters',
      message: 'This page has no meta description.',
      recommendation:
        'Add a 120–160 character meta description. Search engines will otherwise invent a snippet from page text, costing you control over click-through rate.',
      priority: 'critical',
      weight: 2,
    });
  }

  if (length >= 120 && length <= 160) {
    return buildCheck({
      id: 'metaDescription',
      label: 'Meta Description',
      category: 'meta',
      status: 'green',
      value: length,
      displayValue: `${length} characters`,
      recommendedValue: '120–160 characters',
      message: `"${truncate(description, 100)}"`,
      recommendation: 'Well-sized description — it should display in full in search results.',
      weight: 2,
    });
  }

  // Far outside the window is worse than merely suboptimal, so grade it red.
  const isSevere = length < 70 || length > 200;
  const tooShort = length < 120;

  return buildCheck({
    id: 'metaDescription',
    label: 'Meta Description',
    category: 'meta',
    status: isSevere ? 'red' : 'amber',
    value: length,
    displayValue: `${length} characters`,
    recommendedValue: '120–160 characters',
    message: `"${truncate(description, 100)}"`,
    recommendation: tooShort
      ? `At ${length} characters this description is too short to be compelling. Expand it to 120–160 characters.`
      : `At ${length} characters this description will be cut off. Trim it to 160 characters or fewer.`,
    weight: 2,
  });
}
