# Implementation Plan: URL Shortener

**Branch**: `001-url-shortener` | **Date**: 2026-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-url-shortener/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

The URL Shortener feature allows internal users to shorten long URLs into memorable, trackable short links. Key capabilities include custom slugs, detailed analytics (geolocation, device), QR code generation, and bulk processing. The system handles high-throughput redirection (<100ms) using Cloudflare Edge, with data persistence in D1 and R2.

## Technical Context

**Language/Version**: TypeScript 5.7+ (Strict Mode)
**Primary Dependencies**: Next.js 16 (App Router), React 19, Better Auth 1.4+, Shadcn UI, Tailwind CSS v4, Lucide React
**Storage**: Cloudflare D1 (SQLite) via Drizzle ORM, Cloudflare R2 (Assets)
**Testing**: Vitest (Unit/Integration), Playwright (E2E) - *pending configuration*
**Target Platform**: Cloudflare Workers/Pages (via OpenNext)
**Project Type**: Web Application (Next.js)
**Performance Goals**: <100ms redirection latency (p99), 5000 req/s throughput
**Constraints**: 
- No emoji icons (Lucide only)
- Cursor pointer on all interactive elements
- Light/Dark mode support
- Responsive design (mobile to desktop)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles (from AGENTS.md)
1.  **Tech Stack Adherence**: Must use Next.js 16, Drizzle, Better Auth, Cloudflare. -> **COMPLIANT**
2.  **UI/UX Standards**: No emojis, specific hover states, contrast requirements. -> **COMPLIANT**
3.  **Code Style**: Strict TypeScript, explicit return types, named exports. -> **COMPLIANT**
4.  **Database Patterns**: Drizzle `sqliteTable`, specific timestamp handling. -> **COMPLIANT**
5.  **Performance**: <100ms latency requirement. -> **COMPLIANT**

## Project Structure

### Documentation (this feature)

```text
specs/001-url-shortener/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── openapi.yaml     # API Specification
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (auth)/          # Sign-in/Sign-up pages
│   ├── (dashboard)/     # Authenticated user dashboard
│   ├── api/             # API Routes (auth, shortener, bulk)
│   ├── [slug]/          # Redirection route (catch-all)
│   └── page.tsx         # Landing page
├── components/
│   ├── ui/              # Shared UI components
│   ├── features/        # Feature-specific components (QR, Charts)
│   └── forms/           # React Hook Forms (Link creation)
├── db/
│   ├── schema.ts        # Database definitions
│   └── client.ts        # Drizzle client
├── lib/
│   ├── analytics.ts     # Analytics tracking logic
│   ├── qr-code.ts       # QR generation utility
│   └── utils.ts         # Shared helpers
└── middleware.ts        # Auth protection & Redirection logic
```

**Structure Decision**: Standard Next.js App Router structure with feature grouping in components and dedicated API routes. Redirection logic prioritized in middleware/Edge routes.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |
