# Repository Structure

This document outlines the directory structure and organization of the PagePulse Pro monorepo. The repository is designed using a Turborepo-based monorepo architecture, housing both the frontend and backend applications along with shared packages.

## Directory Tree

```text
pagepulse-pro/
├── apps/
│   ├── frontend/                    # Next.js 15 application
│   │   ├── app/                     # App Router pages
│   │   │   ├── page.tsx             # Landing page
│   │   │   ├── layout.tsx           # Root layout
│   │   │   ├── loading.tsx          # Global loading
│   │   │   ├── error.tsx            # Error boundary
│   │   │   ├── not-found.tsx        # 404 page
│   │   │   ├── globals.css          # Global styles
│   │   │   └── audit/
│   │   │       └── [id]/
│   │   │           └── page.tsx     # Shareable result
│   │   ├── components/
│   │   │   ├── audit/               # Audit feature components
│   │   │   ├── layout/              # Layout components
│   │   │   ├── ui/                  # shadcn/ui primitives
│   │   │   └── shared/              # Shared components
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── services/                # API client functions
│   │   ├── utils/                   # Utility functions
│   │   ├── lib/                     # Third-party integrations
│   │   ├── types/                   # Frontend-specific types
│   │   ├── public/                  # Static assets
│   │   │   └── favicon.ico
│   │   ├── next.config.ts           # Next.js configuration
│   │   ├── tailwind.config.ts       # Tailwind configuration
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── Dockerfile
│   └── backend/                     # Express API server
│       ├── src/
│       │   ├── index.ts             # Entry point
│       │   ├── app.ts               # Express app factory
│       │   ├── config/
│       │   │   └── env.ts           # Environment validation
│       │   ├── controllers/
│       │   │   └── audit.controller.ts
│       │   ├── services/
│       │   │   ├── audit.service.ts
│       │   │   ├── html-fetcher.ts
│       │   │   └── html-parser.ts
│       │   ├── middleware/
│       │   │   ├── error-handler.ts
│       │   │   ├── rate-limiter.ts
│       │   │   ├── request-id.ts
│       │   │   └── validate.ts
│       │   ├── errors/
│       │   │   ├── app-error.ts
│       │   │   └── error-codes.ts
│       │   ├── utils/
│       │   │   ├── url-validator.ts
│       │   │   ├── response-builder.ts
│       │   │   └── logger.ts
│       │   ├── routes/
│       │   │   ├── audit.routes.ts
│       │   │   └── health.routes.ts
│       │   ├── store/
│       │   │   └── result-store.ts   # In-memory store with TTL
│       │   └── types/
│       │       └── express.d.ts      # Express type augmentations
│       ├── tests/
│       │   ├── unit/
│       │   ├── integration/
│       │   └── fixtures/
│       ├── tsconfig.json
│       ├── vitest.config.ts
│       ├── package.json
│       └── Dockerfile
├── packages/
│   └── shared-types/                # Shared Zod schemas + types
│       ├── src/
│       │   ├── index.ts
│       │   ├── schemas/
│       │   │   ├── audit-request.ts
│       │   │   ├── audit-response.ts
│       │   │   └── audit-error.ts
│       │   └── types/
│       │       └── index.ts          # Inferred types from schemas
│       ├── tsconfig.json
│       └── package.json
├── tests/
│   └── e2e/                         # Playwright E2E tests
│       ├── audit-flow.spec.ts
│       ├── shareable-link.spec.ts
│       └── playwright.config.ts
├── docs/                            # Documentation
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                   # Lint, typecheck, test, build
│   │   └── deploy.yml               # Deploy workflow
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
├── .env.example                     # Example environment variables
├── .gitignore
├── .eslintrc.js                     # Root ESLint config
├── .prettierrc                      # Prettier config
├── docker-compose.yml               # Local development
├── docker-compose.prod.yml          # Production
├── turbo.json                       # Turborepo pipeline config
├── pnpm-workspace.yaml              # pnpm workspace definition
├── package.json                     # Root package.json
├── tsconfig.base.json               # Base TypeScript config
└── README.md
```

## Detailed Explanations

### Root Level
- **`apps/`**: Contains the deployable application projects. Separating apps allows for independent scaling, testing, and deployment.
- **`packages/`**: Contains shared internal libraries that apps depend on. This prevents code duplication and enforces consistency.
- **`tests/e2e/`**: End-to-end tests covering the entire system flow from UI to backend. Placed at the root as they test the interaction between multiple apps.
- **`docs/`**: Centralized documentation for the project. Keeps architectural, setup, and contribution guides in one place.
- **`.github/`**: GitHub-specific configurations including Actions workflows and templates. Essential for CI/CD and standardizing community interactions.
- **`turbo.json`**: Defines the Turborepo pipeline and task dependencies, ensuring fast incremental builds and task execution.
- **`pnpm-workspace.yaml`**: Configures pnpm workspaces, telling pnpm where packages and apps reside.
- **`package.json`**: Root package file containing workspace-level development scripts and dependencies (e.g., Turborepo, ESLint, Prettier).
- **`tsconfig.base.json`**: Base TypeScript configuration shared across all apps and packages for compiler consistency.

### Frontend (`apps/frontend/`)
- **`app/`**: Next.js 15 App Router directory. Uses nested folders for routing.
  - **`page.tsx`**: Landing page offering the core URL submission form.
  - **`audit/[id]/page.tsx`**: Dynamic route displaying specific audit results for shareability.
- **`components/`**: Organized UI elements.
  - **`audit/`**: Domain-specific components for the auditing feature, keeping logic colocated.
  - **`ui/`**: Reusable primitive components (e.g., shadcn/ui), strictly for UI without business logic.
- **`services/`**: API client functions for fetching data from the backend. Abstracts external network calls.

### Backend (`apps/backend/`)
- **`src/app.ts`**: The Express application factory. Separated from `index.ts` to allow testing the app without binding to a network port.
- **`src/config/env.ts`**: Zod-based runtime environment variable validation. Fails fast if configuration is missing or invalid.
- **`src/services/`**: Core business logic modules.
  - **`html-fetcher.ts`**: Dedicated to fetching web page content.
  - **`html-parser.ts`**: Processes fetched HTML to extract SEO metrics.
- **`src/middleware/`**: Express middlewares intercepting requests.
  - **`validate.ts`**: Generic validation middleware utilizing Zod schemas from the shared package.
- **`src/store/result-store.ts`**: In-memory caching/storage mechanism with TTL, storing audit results to serve via shareable links without a DB.

### Shared Types (`packages/shared-types/`)
- **`src/schemas/`**: Zod schemas representing the API contracts (requests, responses, errors). Acts as the single source of truth for data shapes.
- **`src/types/index.ts`**: TypeScript types inferred directly from Zod schemas. Ensures that both frontend and backend are perfectly type-aligned, preventing integration bugs.

## Design Principles

1. **Feature-Based Organization**: In the frontend, components related to "audit" are grouped together. This co-location makes it easier to navigate and scale features.
2. **Separation of Concerns**: The backend separates route definitions (`routes/`), request handling (`controllers/`), and business logic (`services/`). The frontend separates UI components, data fetching (`services/`), and state/logic (`hooks/`).
3. **Co-location**: Tests, styles, and utilities closely related to a specific domain are kept nearby where appropriate, minimizing cognitive load when working on a feature.
4. **Dependency Direction**: The dependency flow is strictly downward. Applications (`apps/`) can depend on shared packages (`packages/`), but packages should never depend on applications. The backend does not depend on the frontend, and vice-versa, relying only on shared contracts.
