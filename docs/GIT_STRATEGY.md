# Git Strategy

This document outlines the Git branching, commit conventions, and issue management strategy for PagePulse Pro.

## Branch Naming Conventions
- `main` — production-ready code. Commits here trigger production deployments.
- `develop` — integration branch. Represents the latest integrated changes.
- `feat/<milestone>-<description>` — feature branches (e.g., `feat/m3-backend-skeleton`).
- `fix/<description>` — bug fixes.
- `docs/<description>` — documentation updates.
- `chore/<description>` — tooling, dependencies, and config changes.

## Commit Naming (Conventional Commits)
We strictly adhere to [Conventional Commits](https://www.conventionalcommits.org/).
- **Format**: `type(scope): description`
- **Types**: `feat`, `fix`, `docs`, `test`, `chore`, `refactor`, `perf`, `ci`
- **Scopes**: `shared`, `backend`, `frontend`, `e2e`, `docker`, `ci`
- **Subject line limits**: Max 72 characters.
- **Body**: Focus on "what" and "why", not "how".

## Pull Request Template (`.github/PULL_REQUEST_TEMPLATE.md`)
```markdown
## Description
<!-- Describe your changes in detail -->

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
<!-- Describe the tests that you ran to verify your changes -->

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots (if applicable)
```

## Issue Templates

### Bug Report (`.github/ISSUE_TEMPLATE/bug_report.md`)
```markdown
---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior.

**Expected behavior**
A clear and concise description of what you expected to happen.

**Environment:**
- OS: [e.g. iOS]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]
```

### Feature Request (`.github/ISSUE_TEMPLATE/feature_request.md`)
```markdown
---
name: Feature request
about: Suggest an idea for this project
title: '[FEAT] '
labels: enhancement
assignees: ''
---
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.
```

## Tagging and Releases
- **Semantic Versioning**: `v0.1.0` (MVP), `v0.2.0`, etc.
- **Process**: Tag a release upon the completion of a major milestone block.

## Recommended Commit Order
The following sequence of ~20 commits reflects the implementation mapped to our milestones:

1. `init: monorepo structure with pnpm and turborepo` (Affects: Root config files)
2. `chore: add base TypeScript and ESLint configuration` (Affects: `.eslintrc.js`, `tsconfig.base.json`)
3. `feat(shared): add audit request Zod schema` (Affects: `packages/shared-types`)
4. `feat(shared): add audit response and error schemas` (Affects: `packages/shared-types`)
5. `feat(backend): initialize Express server with health endpoint` (Affects: `apps/backend/src/app.ts`, `index.ts`)
6. `feat(backend): add security middleware (Helmet, CORS, rate limit)` (Affects: `apps/backend/src/middleware`)
7. `feat(backend): add request ID and logging middleware` (Affects: `apps/backend/src/middleware`, utils)
8. `feat(backend): implement URL validation service` (Affects: `apps/backend/src/utils/url-validator.ts`)
9. `feat(backend): implement HTML fetcher with Axios` (Affects: `apps/backend/src/services/html-fetcher.ts`)
10. `feat(backend): implement HTML parser with Cheerio` (Affects: `apps/backend/src/services/html-parser.ts`)
11. `feat(backend): implement audit service orchestration` (Affects: `apps/backend/src/services/audit.service.ts`)
12. `feat(backend): add error handling system` (Affects: `apps/backend/src/errors`, `middleware/error-handler.ts`)
13. `test(backend): add unit tests for validators and parsers` (Affects: `apps/backend/tests/unit`)
14. `test(backend): add integration tests for audit endpoint` (Affects: `apps/backend/tests/integration`)
15. `feat(frontend): initialize Next.js with Tailwind and shadcn/ui` (Affects: `apps/frontend/`)
16. `feat(frontend): implement landing page with audit form` (Affects: `apps/frontend/app/page.tsx`, components)
17. `feat(frontend): implement loading stages and results dashboard` (Affects: UI components, audit views)
18. `feat(frontend): add shareable results and audit history` (Affects: `apps/frontend/app/audit/[id]/page.tsx`, local storage hooks)
19. `feat(frontend): add dark mode, accessibility, and polish` (Affects: globals.css, theme providers, component updates)
20. `test(e2e): add Playwright end-to-end tests` (Affects: `tests/e2e/`)
21. `chore(docker): add Dockerfiles and docker-compose` (Affects: root and app `Dockerfile`, `docker-compose.yml`)
22. `ci: add GitHub Actions workflow for CI/CD` (Affects: `.github/workflows/`)
23. `docs: add README, architecture, and API documentation` (Affects: `docs/`, `README.md`)
