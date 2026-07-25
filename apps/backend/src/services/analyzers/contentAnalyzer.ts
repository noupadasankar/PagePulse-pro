import type { MetricCheck } from '@pagepulse/shared-types';
import type { ParsedHtml } from '../../types/audit.types';
import { buildCheck, pluralize, truncate } from './checkBuilder';

/**
 * Content depth and heading structure — whether the page says enough, and
 * whether its outline is machine-readable.
 */
export function analyzeContent(parsed: ParsedHtml): MetricCheck[] {
  return [analyzeH1(parsed), analyzeWordCount(parsed), analyzeHeadingHierarchy(parsed)];
}

function analyzeH1(parsed: ParsedHtml): MetricCheck {
  const count = parsed.h1s.length;

  if (count === 1) {
    return buildCheck({
      id: 'h1',
      label: 'H1 Heading',
      category: 'content',
      status: 'green',
      value: 1,
      displayValue: '1 H1 tag',
      recommendedValue: 'Exactly 1',
      message: `"${truncate(parsed.h1s[0])}"`,
      recommendation: 'Exactly one H1 — this clearly signals the page topic.',
      weight: 2,
    });
  }

  if (count === 0) {
    return buildCheck({
      id: 'h1',
      label: 'H1 Heading',
      category: 'content',
      status: 'red',
      value: 0,
      displayValue: 'Missing',
      recommendedValue: 'Exactly 1',
      message: 'This page has no H1 heading.',
      recommendation:
        'Add a single H1 describing the page topic. It anchors the content for both search engines and screen-reader users navigating by heading.',
      priority: 'high',
      weight: 2,
    });
  }

  // Two or three is untidy; four or more suggests H1 is being used for styling.
  const isSevere = count > 3;
  return buildCheck({
    id: 'h1',
    label: 'H1 Heading',
    category: 'content',
    status: isSevere ? 'red' : 'amber',
    value: count,
    displayValue: `${count} H1 tags`,
    recommendedValue: 'Exactly 1',
    message: `Found ${count} H1 tags competing to describe this page.`,
    recommendation: `Keep one H1 as the page title and demote the other ${count - 1} to H2. Multiple H1s dilute the topic signal.`,
    weight: 2,
  });
}

function analyzeWordCount(parsed: ParsedHtml): MetricCheck {
  const count = parsed.wordCount;
  const formatted = count.toLocaleString('en-US');

  if (count >= 300) {
    return buildCheck({
      id: 'wordCount',
      label: 'Content Length',
      category: 'content',
      status: 'green',
      value: count,
      displayValue: `${formatted} words`,
      recommendedValue: '300+ words',
      message: `This page has ${formatted} words of visible text.`,
      recommendation: 'Good content depth for search engines to evaluate.',
      weight: 2,
    });
  }

  if (count >= 100) {
    return buildCheck({
      id: 'wordCount',
      label: 'Content Length',
      category: 'content',
      status: 'amber',
      value: count,
      displayValue: `${formatted} words`,
      recommendedValue: '300+ words',
      message: `This page has only ${formatted} words of visible text.`,
      recommendation: `Add roughly ${300 - count} more words. Thin pages struggle to rank because there is little for search engines to assess.`,
      weight: 2,
    });
  }

  return buildCheck({
    id: 'wordCount',
    label: 'Content Length',
    category: 'content',
    status: 'red',
    value: count,
    displayValue: `${formatted} words`,
    recommendedValue: '300+ words',
    message: `This page has very little text (${formatted} words).`,
    recommendation:
      'Expand to at least 300 words of substantive content. Note that text rendered client-side by JavaScript is not counted here, since this audit reads the initial HTML.',
    priority: 'high',
    weight: 2,
  });
}

function analyzeHeadingHierarchy(parsed: ParsedHtml): MetricCheck {
  const { headings } = parsed;

  if (headings.length === 0) {
    return buildCheck({
      id: 'headingHierarchy',
      label: 'Heading Structure',
      category: 'content',
      status: 'red',
      value: 0,
      displayValue: 'No headings',
      recommendedValue: 'No skipped levels',
      message: 'This page has no headings at all.',
      recommendation:
        'Structure the content with headings (H1, then H2, then H3). Screen-reader users rely on the heading outline to navigate.',
      priority: 'high',
      weight: 1,
    });
  }

  // A skip (e.g. H2 straight to H4) breaks the outline for assistive tech.
  const skips: string[] = [];
  for (let i = 1; i < headings.length; i += 1) {
    const previous = headings[i - 1].level;
    const current = headings[i].level;
    if (current > previous + 1) skips.push(`H${previous} → H${current}`);
  }

  if (skips.length === 0) {
    return buildCheck({
      id: 'headingHierarchy',
      label: 'Heading Structure',
      category: 'content',
      status: 'green',
      value: headings.length,
      displayValue: `${pluralize(headings.length, 'heading')}, no skips`,
      recommendedValue: 'No skipped levels',
      message: 'Heading levels descend in order without gaps.',
      recommendation: 'Clean heading outline — good for accessibility and content parsing.',
      weight: 1,
    });
  }

  return buildCheck({
    id: 'headingHierarchy',
    label: 'Heading Structure',
    category: 'content',
    status: 'amber',
    value: skips.length,
    displayValue: `${pluralize(skips.length, 'skipped level')}`,
    recommendedValue: 'No skipped levels',
    message: `Heading levels jump: ${skips.slice(0, 3).join(', ')}${skips.length > 3 ? '…' : ''}.`,
    recommendation:
      'Avoid skipping heading levels. Move from H2 to H3 rather than H2 to H4, so the document outline stays navigable.',
    weight: 1,
  });
}
