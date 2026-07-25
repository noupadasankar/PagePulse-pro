import * as cheerio from 'cheerio';
import type { ParsedHeading, ParsedHtml, ParsedImage, ParsedLink } from '../types/audit.types';
import { ParserError } from '../errors';

/** Cap on retained links, to bound memory on link-farm pages. */
const MAX_LINKS = 500;

/** Input types carrying no user-visible value, so they need no label. */
const UNLABELLED_INPUT_TYPES = new Set(['hidden', 'submit', 'button', 'reset', 'image']);

export class ParserService {
  parse(html: string, baseUrl: string): ParsedHtml {
    try {
      const $ = cheerio.load(html);

      const title = $('title').first().text().trim() || null;

      // Prefer the real description; fall back to og:description so a page that
      // only sets the social variant isn't reported as having nothing at all.
      const metaDescription =
        $('meta[name="description"]').attr('content')?.trim() ||
        $('meta[property="og:description"]').attr('content')?.trim() ||
        null;

      const headings: ParsedHeading[] = [];
      $('h1, h2, h3, h4, h5, h6').each((_, el) => {
        const tagName = (el as { tagName?: string }).tagName?.toLowerCase() ?? '';
        const level = Number.parseInt(tagName.slice(1), 10);
        const text = $(el).text().trim();
        if (Number.isFinite(level) && text) headings.push({ level, text });
      });
      const h1s = headings.filter((h) => h.level === 1).map((h) => h.text);

      const images: ParsedImage[] = [];
      $('img').each((_, el) => {
        const src = $(el).attr('src');
        if (!src) return;
        const altAttr = $(el).attr('alt');
        images.push({
          src: toAbsoluteUrl(src, baseUrl),
          alt: altAttr ?? null,
          // An empty alt is intentional (decorative image); only a missing
          // attribute is an accessibility failure.
          missingAlt: altAttr === undefined,
        });
      });

      const links: ParsedLink[] = [];
      const seenLinks = new Set<string>();
      $('a[href]').each((_, el) => {
        if (links.length >= MAX_LINKS) return;
        const href = $(el).attr('href')?.trim();

        // Skip in-page anchors and non-navigational schemes.
        if (!href || href.startsWith('#')) return;
        if (/^(mailto|tel|javascript|data):/i.test(href)) return;

        const absolute = toAbsoluteUrl(href, baseUrl);
        if (seenLinks.has(absolute)) return;
        seenLinks.add(absolute);

        links.push({
          href: absolute,
          text: $(el).text().trim(),
          isInternal: isSameOrigin(absolute, baseUrl),
        });
      });

      const canonicalUrl = $('link[rel="canonical"]').attr('href')?.trim() || null;
      const robotsMeta = $('meta[name="robots"]').attr('content')?.trim() || null;
      const htmlLang = $('html').attr('lang')?.trim() || null;
      const viewport = $('meta[name="viewport"]').attr('content')?.trim() || null;

      const faviconHref =
        $('link[rel="icon"]').attr('href') ||
        $('link[rel="shortcut icon"]').attr('href') ||
        $('link[rel="apple-touch-icon"]').attr('href') ||
        null;
      const faviconUrl = faviconHref ? toAbsoluteUrl(faviconHref.trim(), baseUrl) : null;

      const openGraph = collectPrefixedMeta($, 'property', 'og:');
      const twitterCard = {
        // Twitter tags use name= per spec but property= is common in the wild.
        ...collectPrefixedMeta($, 'property', 'twitter:'),
        ...collectPrefixedMeta($, 'name', 'twitter:'),
      };

      const inputs = collectLabelledInputs($);

      // Strip non-content nodes before measuring text so scripts and styles
      // don't inflate the word count.
      $('script, style, noscript, svg, iframe, template').remove();
      $('*')
        .contents()
        .filter((_, node) => node.type === 'comment')
        .remove();

      const visibleText = ($('body').text() || '').replace(/\s+/g, ' ').trim();
      const wordCount = visibleText ? visibleText.split(/\s+/).filter(Boolean).length : 0;

      return {
        title,
        metaDescription,
        h1s,
        headings,
        images,
        links,
        visibleText,
        wordCount,
        canonicalUrl,
        robotsMeta,
        faviconUrl,
        htmlLang,
        viewport,
        openGraph,
        twitterCard,
        inputs,
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'unknown error';
      throw new ParserError(`Failed to parse HTML: ${reason}`);
    }
  }
}

/** Resolves a possibly-relative URL, falling back to the raw value if invalid. */
function toAbsoluteUrl(url: string, baseUrl: string): string {
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}

function isSameOrigin(url: string, baseUrl: string): boolean {
  try {
    return new URL(url).origin === new URL(baseUrl).origin;
  } catch {
    return false;
  }
}

/** Collects `<meta>` content keyed by name/property, with the prefix stripped. */
function collectPrefixedMeta(
  $: cheerio.CheerioAPI,
  attribute: 'name' | 'property',
  prefix: string
): Record<string, string> {
  const result: Record<string, string> = {};
  $(`meta[${attribute}^="${prefix}"]`).each((_, el) => {
    const key = $(el).attr(attribute)?.slice(prefix.length).trim();
    const content = $(el).attr('content')?.trim();
    if (key && content) result[key] = content;
  });
  return result;
}

/**
 * Finds form controls and whether each is labelled by any mechanism a screen
 * reader accepts: a wrapping <label>, a `for=` association, or an
 * aria-label / aria-labelledby / title attribute.
 */
function collectLabelledInputs($: cheerio.CheerioAPI): { hasLabel: boolean; type: string }[] {
  const labelledIds = new Set<string>();
  $('label[for]').each((_, el) => {
    const target = $(el).attr('for')?.trim();
    if (target) labelledIds.add(target);
  });

  const inputs: { hasLabel: boolean; type: string }[] = [];
  $('input, select, textarea').each((_, el) => {
    const $el = $(el);
    const type = ($el.attr('type') || 'text').toLowerCase();
    if (UNLABELLED_INPUT_TYPES.has(type)) return;

    const id = $el.attr('id')?.trim();
    const hasLabel = Boolean(
      (id && labelledIds.has(id)) ||
        $el.closest('label').length > 0 ||
        $el.attr('aria-label')?.trim() ||
        $el.attr('aria-labelledby')?.trim() ||
        $el.attr('title')?.trim()
    );

    inputs.push({ hasLabel, type });
  });

  return inputs;
}
