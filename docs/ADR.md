# Architecture Decision Records (ADRs) for PagePulse Pro

## ADR-001: Why Next.js?
**Status:** Accepted
**Date:** 2026-07-25

**Context:**
The PagePulse Pro application requires a frontend framework that provides an excellent developer experience, seamless React integration, and robust Server-Side Rendering (SSR). SSR is critical for generating shareable audit pages that accurately render dynamic content on the initial load, improving perceived performance and ensuring links display correctly when shared.

**Decision:**
We will use Next.js 15 (App Router) for the frontend application.

**Alternatives Considered:**
- **Vite + React SPA:** Excellent developer experience and fast build times, but lacks native SSR support, making shareable, instantly-rendered pages harder to implement without additional infrastructure.
- **Remix:** Strong focus on web fundamentals and SSR, but has a smaller ecosystem compared to Next.js and a different mental model for data fetching that the current team is less familiar with.
- **Astro:** Great for content-heavy sites with its island architecture, but might add unnecessary complexity for a highly dynamic, interactive web app like ours.

**Tradeoffs:**
- *Pros:* Built-in SSR/SSG, excellent routing (App Router), massive ecosystem, seamless integration with Vercel, optimized image and font handling.
- *Cons:* Steeper learning curve for the App Router paradigm, potentially larger server footprint compared to an SPA, frequent major version updates requiring maintenance.

**Consequences:**
We gain a robust foundation for building high-performance, shareable pages. The engineering team will need to align strictly on App Router conventions and best practices for server versus client components.

---

## ADR-002: Why Express?
**Status:** Accepted
**Date:** 2026-07-25

**Context:**
The backend API for PagePulse Pro needs to handle HTTP requests from the frontend, orchestrate web scraping, and return structured audit data. We need a reliable, well-understood, and lightweight HTTP server to act as a focused microservice.

**Decision:**
We will use Express.js for the backend API.

**Alternatives Considered:**
- **Fastify:** High performance and low overhead, but has a slightly different middleware ecosystem and a steeper learning curve for developers used to Express.
- **NestJS:** Highly opinionated, structured framework excellent for large enterprise apps, but introduces unnecessary complexity and boilerplate for our focused API needs.
- **Hono:** Extremely fast and edge-ready, but the ecosystem is still growing compared to the maturity of Express.

**Tradeoffs:**
- *Pros:* Unmatched ecosystem of middleware, extremely mature, ubiquitous in the Node.js community, simple and unopinionated routing.
- *Cons:* Not the fastest Node.js framework available today, relies heavily on third-party middleware for basic features, lacks built-in TypeScript support out-of-the-box (requires manual typing).

**Consequences:**
We can rapidly develop the API using standard middleware. We must ensure we structure the application properly, as Express does not enforce a specific architecture.

---

## ADR-003: Why TypeScript?
**Status:** Accepted
**Date:** 2026-07-25

**Context:**
As a monorepo containing both frontend and backend code, maintaining data consistency and preventing runtime errors is critical. We need a way to share types across the stack and catch errors during development.

**Decision:**
We will use TypeScript across the entire monorepo.

**Alternatives Considered:**
- **JavaScript:** Flexible and requires no compilation step, but highly prone to runtime errors and lacks standard contract enforcement across boundaries.
- **JSDoc types:** Provides some editor tooling without compilation, but is verbose and less powerful than native TypeScript constructs.
- **Flow:** An alternative static type checker by Meta, but it has largely lost community mindshare to TypeScript.

**Tradeoffs:**
- *Pros:* Catch errors at compile time, excellent IDE support (autocompletion, refactoring), self-documenting code, ability to share types between frontend and backend.
- *Cons:* Requires a build step, initial setup complexity in a monorepo, some learning curve for complex type definitions, occasional struggles with third-party library typings.

**Consequences:**
Development speed may slightly decrease initially due to type annotations, but long-term maintainability, refactorability, and bug prevention will drastically improve.

---

## ADR-004: Why Zod?
**Status:** Accepted
**Date:** 2026-07-25

**Context:**
We need to validate incoming data (API payloads, user inputs) at runtime while also keeping our static TypeScript types in sync. Duplicating validation logic and type definitions leads to drift and bugs.

**Decision:**
We will use Zod for schema validation.

**Alternatives Considered:**
- **Yup:** Very popular and similar to Zod, but its TypeScript inference is less robust and sometimes unintuitive compared to Zod's native TS focus.
- **Joi:** Powerful and battle-tested in the Node ecosystem, but not designed with TypeScript inference as a first-class citizen.
- **Valibot:** Smaller bundle size and modular, but newer and has a smaller ecosystem/community integrations than Zod.

**Tradeoffs:**
- *Pros:* Exceptional TypeScript inference (single source of truth for runtime validation and static types), highly expressive API, great integration with tools like React Hook Form.
- *Cons:* Slightly larger bundle size compared to alternatives like Valibot, which could impact frontend performance if overused in client bundles.

**Consequences:**
We will define our domain models as Zod schemas and infer TypeScript types from them. This ensures our runtime validation exactly matches our compile-time expectations.

---

## ADR-005: Why Axios?
**Status:** Accepted
**Date:** 2026-07-25

**Context:**
The backend needs a robust HTTP client to fetch target URLs for SEO auditing. This client must support custom timeouts, handle redirects predictably, allow interceptors, and enforce maximum response size controls to prevent memory exhaustion.

**Decision:**
We will use Axios for HTTP requests on the backend.

**Alternatives Considered:**
- **native fetch:** Built into Node.js now, but lacks built-in features like interceptors, easy timeout configuration (requires AbortController), and stream size limiting out-of-the-box.
- **node-fetch:** A solid polyfill, but largely superseded by native fetch and lacks some of the advanced orchestration features of Axios.
- **got:** Very powerful and feature-rich for Node.js, but has a steeper learning curve and a recent history of complex ESM transitions.

**Tradeoffs:**
- *Pros:* Familiar API, built-in interceptors, easy timeout and cancelation support, automatic JSON parsing, excellent error handling.
- *Cons:* Slightly heavier than native fetch, adds an external dependency for something technically available natively.

**Consequences:**
We have a reliable, configurable tool for fetching target pages safely. We must ensure we configure Axios to reject excessively large payloads to protect our server memory.

---

## ADR-006: Why Cheerio?
**Status:** Accepted
**Date:** 2026-07-25

**Context:**
Once a target page is fetched, the backend needs to parse the HTML string and extract relevant SEO metrics (meta tags, headings, link counts, etc.) quickly and efficiently without rendering the page.

**Decision:**
We will use Cheerio for server-side HTML parsing.

**Alternatives Considered:**
- **jsdom:** Accurately simulates a full DOM environment, but is notoriously slow and memory-intensive, which is detrimental for an API service.
- **Puppeteer:** Provides a real browser environment to execute JavaScript, but is massively heavy, slow, and expensive to run at scale.
- **htmlparser2:** Cheerio is actually built on this, but using it directly is too low-level and requires complex event-driven parsing logic.

**Tradeoffs:**
- *Pros:* Extremely fast, lightweight, familiar jQuery-like API, perfect for static HTML extraction.
- *Cons:* Does not execute JavaScript, so it cannot audit Client-Side Rendered (SPA) applications that do not pre-render their SEO tags.

**Consequences:**
Our auditing pipeline will be highly performant and consume minimal server resources. However, we explicitly accept the limitation that fully client-side rendered pages will yield poor SEO scores.

---

## ADR-007: Why Vercel for Frontend?
**Status:** Accepted
**Date:** 2026-07-25

**Context:**
We need a hosting provider for our Next.js frontend that supports App Router, Server-Side Rendering (SSR), and Edge functions out of the box with zero configuration.

**Decision:**
We will use Vercel for frontend hosting.

**Alternatives Considered:**
- **Netlify:** Excellent platform, but historically trails slightly behind Vercel in day-one support for cutting-edge Next.js features.
- **Cloudflare Pages:** Great performance and edge network, but integrating complex Next.js SSR can sometimes require workarounds compared to Vercel's native integration.
- **Self-hosted (Docker/AWS):** Total control over infrastructure, but requires significant DevOps overhead to match the caching and CDN features Vercel provides automatically.

**Tradeoffs:**
- *Pros:* Zero-config deployment for Next.js, preview deployments on PRs, excellent global Edge network, optimized image optimization API.
- *Cons:* Vendor lock-in to specific proprietary features, potentially expensive scaling costs at high enterprise tiers.

**Consequences:**
Frontend deployments will be seamless and highly performant. The team will rely on Vercel's CI/CD pipeline rather than building custom GitHub Actions for frontend deployment.

---

## ADR-008: Why Render for Backend?
**Status:** Accepted
**Date:** 2026-07-25

**Context:**
We need a simple, reliable hosting provider for our Node.js/Express backend that supports Docker containers, auto-deployments from GitHub, and provides a cost-effective tier for the MVP phase.

**Decision:**
We will use Render for backend hosting.

**Alternatives Considered:**
- **Railway:** Very similar to Render, great developer experience, but Render's established pricing model and predictable performance profiles align well with our needs.
- **AWS Lambda / API Gateway:** Highly scalable and pay-per-use, but introduces cold starts and significant architectural complexity compared to a standard long-running Node process.
- **DigitalOcean App Platform:** Solid alternative, but Render often provides a slightly more streamlined PaaS experience for simple Dockerized Node apps.

**Tradeoffs:**
- *Pros:* Simple Docker deployment, automatic PR environments, built-in free/low-cost tiers, managed TLS, easy environment variable management.
- *Cons:* Free tier sleeps after inactivity (requires upgrade for production), less granular infrastructure control compared to raw AWS/GCP.

**Consequences:**
Backend deployment will be straightforward via Dockerfiles. We must manage the free-tier sleep behavior during early testing, upgrading to a paid tier before public launch to ensure API responsiveness.

---

## ADR-009: Why REST instead of GraphQL?
**Status:** Accepted
**Date:** 2026-07-25

**Context:**
The frontend needs to request audit data from the backend. The data structure is fixed per audit, and the access pattern is simple: submit a URL, receive a full report.

**Decision:**
We will use a RESTful architecture for the API.

**Alternatives Considered:**
- **GraphQL:** Excellent for fetching sparse data across complex graphs, but overkill for a flat, singular "audit report" object. Adds overhead to server implementation and client payload sizes.
- **tRPC:** Outstanding type safety for monorepos, but tightly couples the frontend and backend. We want the API to be potentially accessible to third-party integrations in the future.
- **gRPC:** High performance binary protocol, but terrible developer experience for web clients and unnecessary for simple JSON reporting.

**Tradeoffs:**
- *Pros:* Simple, universally understood, easily cacheable via standard HTTP headers, trivial to test with standard tools (cURL, Postman).
- *Cons:* Potential over-fetching (though not an issue here since we need the whole report), lacks the built-in type contract of tRPC or GraphQL.

**Consequences:**
We will rely on OpenAPI/Swagger or shared Zod schemas in the monorepo to maintain type safety across the REST boundary.

---

## ADR-010: Why not use a database?
**Status:** Accepted
**Date:** 2026-07-25

**Context:**
Users need to be able to share their SEO audit results via a unique URL. However, the scope of the project is currently an MVP, and we want to minimize operational complexity and infrastructure costs. The reports only need to live temporarily.

**Decision:**
We will use an in-memory Map with a Time-To-Live (TTL) for storing recent audit results, omitting a persistent database.

**Alternatives Considered:**
- **Redis:** Perfect for TTL-based caching and shared state, but adds an extra infrastructure component to deploy, monitor, and pay for.
- **PostgreSQL / SQLite:** Relational databases are overkill for temporary, schemaless JSON report blobs.
- **MongoDB:** Good for JSON documents, but still requires provisioning and management.

**Tradeoffs:**
- *Pros:* Zero infrastructure cost, zero latency read/writes, drastically simplifies backend deployment.
- *Cons:* Data is lost on server restart, cannot scale horizontally (multiple server instances will not share state), memory limits restrict how many reports can be stored.

**Consequences:**
This is explicitly an MVP compromise. Reports will expire and be lost on server redeployments. If the service scales beyond a single instance or requires permanent report histories, we will migrate to Redis or a managed database.

---

## ADR-011: Why no authentication?
**Status:** Accepted
**Date:** 2026-07-25

**Context:**
PagePulse Pro is designed to be a frictionless tool. We want users to instantly audit their pages to demonstrate the tool's value, maximizing viral sharing and adoption.

**Decision:**
We will launch with no user authentication or login walls.

**Alternatives Considered:**
- **OAuth (Google/GitHub):** Secure and standard, but creates an immediate barrier to entry that drastically reduces conversion rates for simple utility tools.
- **Magic Links:** Passwordless, but still requires the user to leave the app, check email, and return, disrupting the "instant audit" flow.

**Tradeoffs:**
- *Pros:* Zero friction, highest possible adoption rate, simpler application architecture (no session management, user tables, or auth middleware).
- *Cons:* Susceptible to abuse/botting, unable to offer premium saved history features, difficult to throttle usage on a per-user basis (must rely on IP rate limiting).

**Consequences:**
We must implement aggressive IP-based rate limiting to prevent API abuse. Future premium features will require introducing an auth layer, which will be added as an optional enhancement later.
