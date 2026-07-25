# PagePulse Pro - Product Requirements Document

## 1. Project Vision
PagePulse Pro democratizes SEO analysis by providing instant, actionable website audits without requiring login, payment, or expertise. One URL input → comprehensive report in seconds.

## 2. Problem Statement
Small business owners and indie developers lack affordable, instant SEO feedback. Existing tools (Ahrefs, SEMrush, Screaming Frog) are expensive, complex, or require installation. There's no simple 'paste a URL and get results' tool that's free, fast, and shareable.

## 3. User Journey
1. **Landing:** User lands on PagePulse Pro.
2. **Input:** Enters a URL in the hero input.
3. **Processing:** Sees animated loading stages (Connecting → Downloading → Parsing → Analyzing → Generating).
4. **Results:** Views color-coded metric cards (green/amber/red).
5. **Actions:** Can copy JSON, retry, or share via a unique link.
6. **History:** Can view the last 5 audits from `localStorage` history.

## 4. Target Audience
### Primary Users
- Indie developers
- Small business owners
- Content creators
- Freelance marketers
- Junior SEO practitioners

## 5. Use Cases
- Quick SEO health check before a product launch.
- Competitor page analysis.
- Client report generation (via shareable links).
- Content optimization validation.
- Educational tool for learning SEO basics.

## 6. Functional Requirements
| Feature | Description |
| :--- | :--- |
| **URL Input Validation** | Client-side validation using Zod. Server-side validation to block localhost, private IPs, `javascript:`, and `ftp://`. |
| **HTML Fetching** | Fetching mechanism with strict timeouts: 10s connect, 30s total. |
| **SEO Metrics Extraction** | Extract 7 key metrics: Title, Meta Description, H1 Count, Images missing alt attributes, Word count, Canonical URL, Robots meta. |
| **Scoring System** | Color-coded scoring with green/amber/red thresholds. |
| **Loading Animations** | Staged loading animation providing real-time feedback. |
| **Shareable Results** | Generate shareable result pages under `/audit/[id]`. |
| **Audit History** | Store the last 5 audits in `localStorage`. |
| **Actions** | Ability to copy the report as JSON and retry the audit. |
| **UI/UX** | Responsive design (mobile-first), dark mode support, and WCAG AA accessibility compliance. |

## 7. Non-Functional Requirements
- **Performance:** Response time < 5 seconds for the 95th percentile. HTML size limit: 10MB. Max 5 redirects. Bundle size < 200KB (gzipped).
- **Scalability & Limits:** Support 30 requests/min/IP.
- **Security:** HTTPS enforcement. CSP headers configured via Helmet. No data persistence beyond an in-memory store with TTL.

## 8. Success Metrics
- **Speed:** Time to first audit < 10 seconds from landing.
- **Reliability:** Error rate < 5%.
- **Quality:** Lighthouse performance score > 90.
- **Security:** Zero security vulnerabilities in OWASP top 10.
- **Engineering Standards:** 100% TypeScript strict mode compliance.

## 9. Out of Scope
- User authentication/accounts.
- Persistent database storage.
- Crawling multiple pages (site-wide audits).
- JavaScript rendering (SPA analysis).
- PDF report export.
- API key management.
- Historical trend tracking.
- Custom scoring rules.

## 10. Constraints
- **Infrastructure:** Free tier hosting (Vercel for Frontend, Render for Backend).
- **Storage:** No database; in-memory store only.
- **Processing:** Server-side HTML parsing only (no headless browser).
- **Usage:** Rate limited to prevent abuse.

## 11. Assumptions
- Target websites serve valid HTML.
- Target websites respond within 30 seconds.
- Users have modern browsers (ES2020+).
- Free tier hosting is sufficient for initial traffic volumes.

## 12. Acceptance Criteria
- Given a valid URL, when the user submits, then the 7 SEO metrics are displayed within 5 seconds.
- Given an invalid URL, when the user submits, then a user-friendly error message is shown immediately.
- Given a shareable link, when another user visits it, then the same audit results are displayed.
- Given the landing page, then the Lighthouse accessibility score is > 90.
- Given a rate limit is exceeded, then the user sees a friendly 'slow down' message.
- Given a timeout during fetch, then the user sees a specific timeout error with a retry option.
