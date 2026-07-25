import type { MetricCheck } from '@pagepulse/shared-types';
import type { ParsedHtml } from '../../types/audit.types';
import { buildCheck, pluralize } from './checkBuilder';

/**
 * Anchor text that conveys nothing out of context. Screen-reader users often
 * tab through links in isolation, where "click here" is meaningless.
 */
const UNINFORMATIVE_LINK_TEXT = new Set([
  'click here',
  'here',
  'read more',
  'more',
  'learn more',
  'this',
  'link',
  'this link',
  'more info',
  'details',
  'continue',
]);

/**
 * Basic accessibility checks derived from the static HTML.
 *
 * Deliberately limited to what is reliably detectable without a rendering
 * engine — contrast, focus order, and ARIA correctness need a real browser and
 * are out of scope. The UI is explicit that this is a subset, not a WCAG audit.
 */
export function analyzeAccessibility(parsed: ParsedHtml): MetricCheck[] {
  return [
    analyzeImageAlt(parsed),
    analyzeHtmlLang(parsed),
    analyzeViewport(parsed),
    analyzeInputLabels(parsed),
    analyzeLinkText(parsed),
  ];
}

function analyzeImageAlt(parsed: ParsedHtml): MetricCheck {
  const total = parsed.images.length;
  const missing = parsed.images.filter((image) => image.missingAlt).length;

  if (total === 0) {
    return buildCheck({
      id: 'imageAlt',
      label: 'Image Alt Text',
      category: 'accessibility',
      status: 'green',
      value: 0,
      displayValue: 'No images',
      recommendedValue: 'All images have alt text',
      message: 'This page has no images to check.',
      recommendation: 'Nothing to fix — no images found in the HTML.',
      weight: 2,
    });
  }

  if (missing === 0) {
    return buildCheck({
      id: 'imageAlt',
      label: 'Image Alt Text',
      category: 'accessibility',
      status: 'green',
      value: 0,
      displayValue: `${total} of ${total} labelled`,
      recommendedValue: 'All images have alt text',
      message: `All ${pluralize(total, 'image')} have an alt attribute.`,
      recommendation: 'Every image is described for screen readers and image search.',
      weight: 2,
    });
  }

  const isSevere = missing > 3;
  return buildCheck({
    id: 'imageAlt',
    label: 'Image Alt Text',
    category: 'accessibility',
    status: isSevere ? 'red' : 'amber',
    value: missing,
    displayValue: `${missing} of ${total} missing`,
    recommendedValue: 'All images have alt text',
    message: `${pluralize(missing, 'image')} lack an alt attribute.`,
    recommendation:
      'Add descriptive alt text to each meaningful image, and alt="" to purely decorative ones so screen readers skip them.',
    priority: isSevere ? 'high' : 'medium',
    weight: 2,
  });
}

function analyzeHtmlLang(parsed: ParsedHtml): MetricCheck {
  const lang = parsed.htmlLang;

  if (!lang) {
    return buildCheck({
      id: 'htmlLang',
      label: 'Language Attribute',
      category: 'accessibility',
      status: 'red',
      value: null,
      displayValue: 'Missing',
      recommendedValue: '<html lang="en">',
      message: 'The <html> element declares no language.',
      recommendation:
        'Add lang="en" (or the correct language) to <html>. Screen readers use it to select the right pronunciation rules.',
      priority: 'medium',
      weight: 1,
    });
  }

  return buildCheck({
    id: 'htmlLang',
    label: 'Language Attribute',
    category: 'accessibility',
    status: 'green',
    value: lang,
    displayValue: `lang="${lang}"`,
    recommendedValue: '<html lang="en">',
    message: `Page language is declared as "${lang}".`,
    recommendation: 'Screen readers can select the correct pronunciation rules.',
    weight: 1,
  });
}

function analyzeViewport(parsed: ParsedHtml): MetricCheck {
  const viewport = parsed.viewport;

  if (!viewport) {
    return buildCheck({
      id: 'viewport',
      label: 'Mobile Viewport',
      category: 'accessibility',
      status: 'red',
      value: null,
      displayValue: 'Missing',
      recommendedValue: 'width=device-width, initial-scale=1',
      message: 'No viewport meta tag was found.',
      recommendation:
        'Add <meta name="viewport" content="width=device-width, initial-scale=1">. Without it, mobile browsers render at desktop width and zoom out.',
      priority: 'high',
      weight: 1,
    });
  }

  // Blocking zoom traps low-vision users who need to magnify the page.
  const blocksZoom =
    /user-scalable\s*=\s*(no|0)/i.test(viewport) || /maximum-scale\s*=\s*1(\.0)?\b/i.test(viewport);

  if (blocksZoom) {
    return buildCheck({
      id: 'viewport',
      label: 'Mobile Viewport',
      category: 'accessibility',
      status: 'amber',
      value: viewport,
      displayValue: 'Zoom disabled',
      recommendedValue: 'width=device-width, initial-scale=1',
      message: 'The viewport tag prevents users from zooming.',
      recommendation:
        'Remove user-scalable=no and maximum-scale=1. Blocking zoom fails WCAG 1.4.4 and hurts low-vision users.',
      priority: 'medium',
      weight: 1,
    });
  }

  return buildCheck({
    id: 'viewport',
    label: 'Mobile Viewport',
    category: 'accessibility',
    status: 'green',
    value: viewport,
    displayValue: 'Configured',
    recommendedValue: 'width=device-width, initial-scale=1',
    message: 'A responsive viewport is declared.',
    recommendation: 'Page will scale correctly on mobile devices.',
    weight: 1,
  });
}

function analyzeInputLabels(parsed: ParsedHtml): MetricCheck {
  const total = parsed.inputs.length;
  const unlabelled = parsed.inputs.filter((input) => !input.hasLabel).length;

  if (total === 0) {
    return buildCheck({
      id: 'inputLabels',
      label: 'Form Labels',
      category: 'accessibility',
      status: 'green',
      value: 0,
      displayValue: 'No form inputs',
      recommendedValue: 'All inputs labelled',
      message: 'This page has no form inputs to check.',
      recommendation: 'Nothing to fix — no form controls found.',
      weight: 1,
    });
  }

  if (unlabelled === 0) {
    return buildCheck({
      id: 'inputLabels',
      label: 'Form Labels',
      category: 'accessibility',
      status: 'green',
      value: 0,
      displayValue: `${total} of ${total} labelled`,
      recommendedValue: 'All inputs labelled',
      message: `All ${pluralize(total, 'form input')} are labelled.`,
      recommendation: 'Every control is announced correctly by screen readers.',
      weight: 1,
    });
  }

  return buildCheck({
    id: 'inputLabels',
    label: 'Form Labels',
    category: 'accessibility',
    status: 'red',
    value: unlabelled,
    displayValue: `${unlabelled} of ${total} unlabelled`,
    recommendedValue: 'All inputs labelled',
    message: `${pluralize(unlabelled, 'form input')} have no associated label.`,
    recommendation:
      'Associate each input with a <label for="...">, or add aria-label. Unlabelled fields are announced only as "edit text", leaving their purpose unknown.',
    priority: 'high',
    weight: 1,
  });
}

function analyzeLinkText(parsed: ParsedHtml): MetricCheck {
  const linksWithText = parsed.links.filter((link) => link.text.length > 0);
  const vague = linksWithText.filter((link) =>
    UNINFORMATIVE_LINK_TEXT.has(link.text.toLowerCase().replace(/[^\w\s]/g, '').trim())
  ).length;
  const empty = parsed.links.length - linksWithText.length;
  const problems = vague + empty;

  if (parsed.links.length === 0) {
    return buildCheck({
      id: 'linkText',
      label: 'Link Text Quality',
      category: 'accessibility',
      status: 'green',
      value: 0,
      displayValue: 'No links',
      recommendedValue: 'Descriptive link text',
      message: 'This page has no outbound links to check.',
      recommendation: 'Nothing to fix — no links found.',
      weight: 1,
    });
  }

  if (problems === 0) {
    return buildCheck({
      id: 'linkText',
      label: 'Link Text Quality',
      category: 'accessibility',
      status: 'green',
      value: 0,
      displayValue: 'All descriptive',
      recommendedValue: 'Descriptive link text',
      message: `All ${pluralize(parsed.links.length, 'link')} have meaningful text.`,
      recommendation: 'Link purpose is clear when read out of context.',
      weight: 1,
    });
  }

  const detail = [
    vague > 0 ? `${vague} vague (e.g. "click here")` : null,
    empty > 0 ? `${empty} with no text` : null,
  ]
    .filter(Boolean)
    .join(', ');

  return buildCheck({
    id: 'linkText',
    label: 'Link Text Quality',
    category: 'accessibility',
    status: 'amber',
    value: problems,
    displayValue: `${problems} need work`,
    recommendedValue: 'Descriptive link text',
    message: `Found ${detail}.`,
    recommendation:
      'Write link text that describes the destination ("View pricing plans" rather than "click here"). Screen-reader users often browse links out of context.',
    weight: 1,
  });
}
