# Engineering Standards: PagePulse Pro

This document defines the strict engineering and coding standards for the PagePulse Pro project. Adherence to these guidelines ensures codebase consistency, maintainability, and reliability across the monorepo.

## Naming Conventions

Consistent naming is critical for codebase navigation and readability.

- **Files**: Use `kebab-case` for all files (e.g., `audit-form.tsx`, `use-audit.ts`, `audit.service.ts`).
- **Directories**: Use `kebab-case` (e.g., `shared-types`, `rate-limit`).
- **React Components**: Use `PascalCase` (e.g., `AuditForm`, `MetricCard`).
- **Functions**: Use `camelCase` (e.g., `submitAudit`, `parseHtml`).
- **Constants**: Use `SCREAMING_SNAKE_CASE` (e.g., `MAX_URL_LENGTH`, `DEFAULT_TIMEOUT`).
- **Types/Interfaces**: Use `PascalCase` with highly descriptive names (e.g., `AuditRequest`, `MetricScore`).
- **Enums**: Use `PascalCase` for the enum name and `PascalCase` for its members (e.g., `ErrorCode.ValidationError`).
- **Boolean variables**: Prefix with `is`, `has`, or `should` (e.g., `isLoading`, `hasError`, `shouldRetry`).
- **Event handlers**: Prefix with `handle` (e.g., `handleSubmit`, `handleRetry`).
- **Hooks**: Prefix with `use` (e.g., `useAudit`, `useTheme`).

## Domain Specific Naming Rules

### File Naming
- Components: `[name].tsx` (e.g., `metric-card.tsx`)
- Hooks: `use-[name].ts` (e.g., `use-audit.ts`)
- Services: `[domain].service.ts` (e.g., `audit.service.ts`)
- Utilities: `[purpose].ts` (e.g., `url-validator.ts`)
- Types: `[domain].types.ts` (e.g., `audit.types.ts`)
- Tests: `[name].test.ts` or `[name].spec.ts` (e.g., `audit.service.test.ts`)
- Constants: `constants.ts` (for domain-specific constants)
- Config: `config.ts`

### Function Naming
- **Pure functions**: verb + noun (e.g., `validateUrl`, `parseHtml`, `calculateScore`).
- **Handlers**: `handle` + event (e.g., `handleSubmit`, `handleError`).
- **Factories**: `create` + noun (e.g., `createAuditService`, `createLogger`).
- **Predicates**: `is` / `has` + adjective/noun (e.g., `isValidUrl`, `hasAltText`).
- **Transformers**: `to` + target (e.g., `toAuditResponse`, `toErrorPayload`).

### Component Naming
- **Container components**: noun representing the feature (e.g., `AuditForm`, `MetricGrid`).
- **Presentational**: descriptive noun for the UI element (e.g., `ScoreBadge`, `LoadingSpinner`).
- **Layout**: position or role (e.g., `Header`, `Footer`, `PageWrapper`).
- **Pages**: route-descriptive with "Page" suffix (e.g., `LandingPage`, `AuditResultPage`).

### API Naming
- **RESTful routes**: Noun-based, plural where appropriate (e.g., `/api/audits`).
- **POST for actions**: E.g., `POST /api/audit` (create a new audit).
- **GET for retrieval**: E.g., `GET /api/audit/:id`.
- **Health/Status**: `GET /health`.

## Folder Conventions

- **Feature-based Organization**: Group files by feature within the `components/` directory, rather than by type.
- **Barrel Exports**: Use `index.ts` files to create clean public APIs for directories and simplify imports.
- **Test Co-location**: Place test files immediately next to their corresponding source files (e.g., `audit.service.ts` alongside `audit.service.test.ts`).
- **Shared Code**: Utilities or types shared across multiple packages must live at the monorepo package level (`@pagepulse/shared-*`), never duplicated.

## Import Order

Imports must be structured and grouped to maintain clean file headers. This is enforced by ESLint.

1. **Node built-ins**: (e.g., `import path from 'node:path'`)
2. **External packages**: (e.g., `import express from 'express'`, `import { z } from 'zod'`)
3. **Internal packages**: (e.g., `import { AuditSchema } from '@pagepulse/shared-types'`)
4. **Parent imports**: (e.g., `import { util } from '../utils'`)
5. **Sibling imports**: (e.g., `import { helper } from './helper'`)
6. **Type imports**: (e.g., `import type { MetricScore } from './types'`)

*Note: Maintain a blank line between each import group.*

## Error Handling Conventions

- **No Silent Failures**: Never swallow errors (`catch (e) {}` is strictly forbidden).
- **Typed Errors**: Always throw and catch typed error classes that extend a base `AppError`.
- **Standardized Mapping**: All errors must be mapped to a standard `{ code, message }` format before being dispatched to the client.
- **Logging vs. Client Output**: Log the original, detailed error stack on the server-side. Send only sanitized, safe error messages to the client.
- **Result Pattern**: Prefer returning a Result object (`{ success, data, error }`) over throwing exceptions in pure business logic functions.

## Async Conventions

- **Async/Await**: Always use `async/await` syntax. Raw `.then().catch()` chains are disallowed.
- **Rejection Handling**: Every promise must have a defined rejection handler or be awaited within a `try/catch` block.
- **Cancellation**: Use `AbortController` to manage cancellable operations (like pending API requests).
- **Timeouts**: All external network requests must have explicit timeouts configured.
- **Route Handlers**: Wrap async Express/Next route handlers with an `asyncHandler` utility to automatically catch and forward rejected promises to the error middleware.

## Logging Conventions

- **Format**: Use structured JSON logging in production environments.
- **Traceability**: Inject a `requestId` into all log entries to trace requests across systems.
- **Levels**: Strictly adhere to standard log levels: `error`, `warn`, `info`, `debug`.
- **Security**: NEVER log sensitive data, Personally Identifiable Information (PII), passwords, or authentication tokens.
- **Performance**: Log the entry, exit, and total duration of critical or long-running operations.

## TypeScript Rules

- **Strict Mode**: `strict: true` must be enabled in all `tsconfig.json` files.
- **No `any`**: The use of `any` is forbidden. Use `unknown` and apply runtime type guards.
- **Type Assertions**: Avoid type assertions (`as Type`) unless absolutely necessary, and document the necessity with an inline comment.
- **Interfaces vs. Types**: Prefer `interface` for defining object shapes and contracts. Use `type` aliases for unions, intersections, and utility types.
- **Literal Types**: Use `const` assertions (`as const`) to enforce literal types for configuration objects and arrays.
- **Exhaustiveness Checking**: Switch statements on union types or enums must be exhaustive, utilizing a `never` assignment in the default case.

## Comment Rules

- **No Noise**: Do not write comments that state the obvious (e.g., `// increment counter` above `count++`).
- **Focus on 'Why'**: Comments should explain the reasoning (*why*) behind a technical decision, not the mechanics (*what* the code does).
- **JSDoc**: Use JSDoc formatting for all exported functions, classes, and complex types to power IDE intellisense.
- **Action Items**: Use standardized formats for actionable comments:
  - `// TODO(author-name): description — TICKET-123`
  - `// FIXME(author-name): description — TICKET-123`

## API Response Naming

All API endpoints must return a standardized JSON envelope to ensure predictable client consumption:

**Success Response Wrapper:**
```typescript
{ 
  success: true, 
  data: T, 
  meta?: Meta 
}
```

**Error Response Wrapper:**
```typescript
{ 
  success: false, 
  error: { 
    code: string, 
    message: string,
    details?: unknown
  }, 
  meta?: Meta 
}
```
