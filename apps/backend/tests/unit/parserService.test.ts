import { describe, it, expect } from 'vitest';
import { ParserService } from '../../src/services/ParserService';

describe('ParserService', () => {
  const parser = new ParserService();
  const fixture = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Test Page Title</title>
        <meta name="description" content="This is a test meta description for the audit service." />
        <link rel="canonical" href="https://example.com/canonical" />
        <meta name="robots" content="index, follow" />
      </head>
      <body>
        <h1>Main Heading</h1>
        <p>This is visible text on the page with several words for testing.</p>
        <img src="https://example.com/img1.png" alt="Test Image" />
        <img src="/img2.png" />
        <script>console.log("ignore script text")</script>
        <style>body { color: red; }</style>
        <noscript>No script support</noscript>
        <svg><text>SVG text</text></svg>
        <!-- This is a comment -->
      </body>
    </html>
  `;

  it('extracts page title correctly', () => {
    const result = parser.parse(fixture, 'https://example.com');
    expect(result.title).toBe('Test Page Title');
  });

  it('extracts meta description correctly', () => {
    const result = parser.parse(fixture, 'https://example.com');
    expect(result.metaDescription).toBe('This is a test meta description for the audit service.');
  });

  it('extracts H1 headings correctly', () => {
    const result = parser.parse(fixture, 'https://example.com');
    expect(result.h1s).toEqual(['Main Heading']);
  });

  it('identifies images missing alt attributes correctly', () => {
    const result = parser.parse(fixture, 'https://example.com');
    expect(result.images).toHaveLength(2);
    expect(result.images[0].missingAlt).toBe(false);
    expect(result.images[1].missingAlt).toBe(true);
  });

  it('filters out script, style, noscript, svg, and comment text from visible text and word count', () => {
    const result = parser.parse(fixture, 'https://example.com');
    expect(result.visibleText).not.toContain('ignore script text');
    expect(result.visibleText).not.toContain('color: red');
    expect(result.visibleText).not.toContain('No script support');
    expect(result.visibleText).not.toContain('This is a comment');
    expect(result.wordCount).toBeGreaterThan(5);
  });

  it('extracts canonical URL and robots meta', () => {
    const result = parser.parse(fixture, 'https://example.com');
    expect(result.canonicalUrl).toBe('https://example.com/canonical');
    expect(result.robotsMeta).toBe('index, follow');
  });

  it('extracts the html lang attribute', () => {
    expect(parser.parse(fixture, 'https://example.com').htmlLang).toBe('en');
  });

  it('resolves relative image sources against the base URL', () => {
    const result = parser.parse(fixture, 'https://example.com');
    expect(result.images[1].src).toBe('https://example.com/img2.png');
  });
});

describe('ParserService — social and accessibility extraction', () => {
  const parser = new ParserService();

  const socialFixture = `
    <html lang="en-GB">
      <head>
        <meta property="og:title" content="OG Title" />
        <meta property="og:description" content="OG Description" />
        <meta property="og:image" content="/og.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Twitter Title" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <h1>Title</h1>
        <h2>Section</h2>
        <h4>Skipped a level</h4>
        <a href="/internal">Internal link</a>
        <a href="https://other.com/page">External link</a>
        <a href="#section">Anchor should be skipped</a>
        <a href="mailto:hi@example.com">Mail should be skipped</a>
        <a href="/internal">Duplicate should be skipped</a>
        <label for="named">Name</label><input id="named" type="text" />
        <input id="orphan" type="email" />
        <input type="hidden" value="csrf" />
      </body>
    </html>
  `;

  it('extracts Open Graph tags without the prefix', () => {
    const result = parser.parse(socialFixture, 'https://example.com');
    expect(result.openGraph).toMatchObject({ title: 'OG Title', description: 'OG Description' });
  });

  it('extracts Twitter Card tags from name attributes', () => {
    const result = parser.parse(socialFixture, 'https://example.com');
    expect(result.twitterCard).toMatchObject({ card: 'summary_large_image', title: 'Twitter Title' });
  });

  it('resolves the favicon to an absolute URL', () => {
    const result = parser.parse(socialFixture, 'https://example.com');
    expect(result.faviconUrl).toBe('https://example.com/favicon.ico');
  });

  it('records the full heading outline including skipped levels', () => {
    const result = parser.parse(socialFixture, 'https://example.com');
    expect(result.headings.map((heading) => heading.level)).toEqual([1, 2, 4]);
  });

  it('classifies links as internal or external and skips non-navigational hrefs', () => {
    const result = parser.parse(socialFixture, 'https://example.com');

    // Anchors, mailto:, and the duplicate are all excluded.
    expect(result.links).toHaveLength(2);
    expect(result.links.filter((link) => link.isInternal)).toHaveLength(1);
    expect(result.links.filter((link) => !link.isInternal)).toHaveLength(1);
  });

  it('detects which form inputs have an associated label', () => {
    const result = parser.parse(socialFixture, 'https://example.com');

    // The hidden input needs no label, so it is not reported.
    expect(result.inputs).toHaveLength(2);
    expect(result.inputs.filter((input) => input.hasLabel)).toHaveLength(1);
  });

  it('treats an explicit empty alt as intentional rather than missing', () => {
    const result = parser.parse(
      '<html><body><img src="/decorative.png" alt="" /></body></html>',
      'https://example.com'
    );

    expect(result.images[0].missingAlt).toBe(false);
  });

  it('falls back to og:description when no meta description exists', () => {
    const result = parser.parse(socialFixture, 'https://example.com');
    expect(result.metaDescription).toBe('OG Description');
  });
});
