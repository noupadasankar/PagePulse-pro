# Environment Configuration

This document outlines the environment configuration strategy, best practices, and variable management for PagePulse Pro.

## Development Environment
The local development environment is optimized for developer experience, debugging, and rapid iteration.
- **Frontend server**: runs on port `3000` (via Next.js dev server).
- **Backend server**: runs on port `3001` (via Express + ts-node-dev).
- **Features**: Hot module replacement (HMR) enabled. Verbose debug logging.
- **Variables**: `NODE_ENV=development`, `PORT=3001`, `CORS_ORIGIN=http://localhost:3000`, `LOG_LEVEL=debug`.

## Production Environment
The production environment prioritizes security, performance, and stability.
- **Frontend server**: Managed by Vercel, responding on standard 80/443 ports.
- **Backend server**: Managed by Render. The `PORT` is dynamically injected by the host.
- **Features**: Debug logging is disabled. Strict exact-match CORS policies. Fast startup.
- **Variables**: `NODE_ENV=production`, `PORT` (from host), `CORS_ORIGIN=https://pagepulse.vercel.app`, `LOG_LEVEL=info`.

## Environment Variables Directory

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| `PORT` | Yes | `3001` | The port the backend server listens on. | `3001` |
| `NODE_ENV` | Yes | `development` | Identifies the runtime environment. | `production` |
| `CORS_ORIGIN` | Yes | `http://localhost:3000` | Allowed origins for cross-origin requests. | `https://pagepulse.vercel.app` |
| `RATE_LIMIT_MAX` | No | `100` | Maximum requests allowed per IP window. | `30` |
| `RATE_LIMIT_WINDOW_MS` | No | `60000` | Window size for rate limiting in milliseconds. | `60000` |
| `LOG_LEVEL` | No | `info` | The verbosity of the application logger. | `debug` |
| `RESULT_TTL_MS` | No | `86400000` | Time-to-live for in-memory stored audit results. | `86400000` |
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:3001` | The backend API URL accessible by the frontend client. | `https://api.pagepulse.app` |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` | The frontend base URL, used for shareable links. | `https://pagepulse.vercel.app` |

## Configuration Loading
- **Development**: We use `dotenv` to load `.env` and `.env.local` files automatically.
- **Production**: Native platform environment variables are used (Vercel and Render dashboards). No `.env` files are deployed to production.
- **Hierarchy Priority**: `process.env` (system) > `.env.local` > `.env`.

## Validation (Best Practice)
All environment variables are validated synchronously at application startup using Zod schemas (`src/config/env.ts`).
- **Fail-fast**: If a required variable is missing or malformed, `process.exit(1)` is triggered with a highly descriptive Zod error message.
- **Transparency**: The successfully validated configuration is logged at startup (with sensitive secrets redacted) to confirm proper initialization.

## Secrets Management
- Currently, PagePulse Pro requires no critical secrets (no Database passwords, no authentication keys).
- **Future-proofing**: Any added secrets (e.g., Redis URIs, AI API keys) must NEVER be committed to the repository.
- Secrets are exclusively managed via the deployment platform's secure environment variable managers.

## Security Considerations
1. **Repository Hygiene**: `.env` and `.env.local` are explicitly included in `.gitignore`.
2. **Examples Only**: An `.env.example` file is committed, containing ONLY safe placeholder values.
3. **Docker Safety**: Secrets are never baked into Docker images during the build step; they are injected at runtime via environment configuration.
4. **Strict CORS**: `CORS_ORIGIN` must be an exact match in production. Wildcards (`*`) are explicitly rejected by configuration validation.
5. **Rate Limiting Defaults**: Conservative default values are baked into the validation schema to prevent abuse even if variables are omitted.
