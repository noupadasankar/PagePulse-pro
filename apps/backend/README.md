# PagePulse Pro — Backend API Service

Production-ready Express + TypeScript backend microservice for PagePulse Pro SEO Audit Tool.

## Stack
- **Runtime:** Node.js LTS (v20+)
- **Framework:** Express 4
- **Language:** TypeScript 5 (Strict Mode)
- **Validation:** Zod 3 + Custom SSRF Validator
- **HTTP Client:** Axios 1 (with keep-alive HTTP/HTTPS agent)
- **HTML Parser:** Cheerio 1
- **Security:** Helmet, CORS, express-rate-limit, Request ID
- **Testing:** Vitest, Supertest

## Directory Structure
```
apps/backend/
├── src/
│   ├── config/          # Zod environment variable validation
│   ├── constants/       # HTTP status codes & constants
│   ├── controllers/     # Thin controllers (AuditController)
│   ├── errors/          # Custom AppError class hierarchy
│   ├── middleware/      # Error handler, rate limiter, request ID
│   ├── routes/          # API v1 routes & healthcheck
│   ├── services/        # Pure business logic (Fetch, Parse, Metrics, Audit)
│   ├── types/           # Strongly-typed TypeScript interfaces
│   ├── utils/           # ResponseBuilder & structured logger
│   ├── validators/      # SSRF & URL format validator
│   ├── app.ts           # Express application setup
│   ├── server.ts        # HTTP server with graceful shutdown
│   └── index.ts         # Main entry point
├── tests/
│   ├── unit/            # Validator, Parser & Metrics tests
│   └── integration/     # Express API integration tests
├── .env.example
├── Dockerfile
├── package.json
└── tsconfig.json
```

## API Endpoints
- `POST /api/v1/audit` (and alias `/api/audit`) — Accepts `{ "url": "https://example.com" }`
- `GET /health` — System status, uptime, and timestamp

## Running Locally
```bash
# Install dependencies
pnpm install

# Start development server with hot reload
pnpm --filter backend dev

# Run unit & integration tests
pnpm --filter backend test
```
