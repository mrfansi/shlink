<!--
Sync Impact Report:
- Version change: Initial Template -> 1.0.0
- List of modified principles: Established Edge-First, Type Safety, Visual Excellence, Schema-First, and Simplicity principles.
- Added sections: Technical Constraints, Quality Gates.
- Templates requiring updates: ✅ None (Defaults align).
- Follow-up: None.
-->

# Shlink Constitution

<!-- Example: Spec Constitution, TaskFlow Constitution, etc. -->

## Core Principles

### I. Edge-First Architecture

<!-- Example: I. Library-First -->

The application is designed for the Cloudflare Workers runtime (OpenNext). All architectural decisions must prioritize edge compatibility, low cold-start times, and distributed consistency. Node.js-specific APIs should be avoided unless strictly necessary and polyfilled. State should be managed via Cloudflare D1 (SQL) and KV/R2 where appropriate.

### II. End-to-End Type Safety

<!-- Example: II. CLI Interface -->

TypeScript is non-negotiable. We enforce strict typing across the entire stack: from the database schema (Drizzle ORM) to the API layer (Zod validation) and the frontend components. `any` types are prohibited. API contracts must be defined and typed before implementation.

### III. Visual Excellence

<!-- Example: III. Test-First (NON-NEGOTIABLE) -->

The user interface must be polished, responsive, and accessible. We use Tailwind CSS (v4) for styling and Radix UI for accessible primitives. "Good enough" UI is not acceptable; we aim for a premium, fluid user experience with proper loading states and error feedback.

### IV. Schema-First Design

<!-- Example: IV. Integration Testing -->

Data models and API contracts are defined first. We use Zod for runtime validation of all inputs (environment variables, API requests, form data). Database changes are managed via Drizzle Kit migrations, ensuring the schema in code always matches the database state.

### V. Simplicity Over Complexity

<!-- Example: V. Observability, VI. Versioning & Breaking Changes, VII. Simplicity -->

We prefer simple, standard web platform solutions over complex abstractions. Dependencies should be kept to a minimum to maintain generic bundle sizes small for the edge. If a standard web API exists (e.g., `fetch`, `Request`, `Response`), use it over a library wrapper.

## Technical Constraints

<!-- Example: Additional Constraints, Security Requirements, Performance Standards, etc. -->

- **Runtime**: Cloudflare Workers (via OpenNext)
- **Framework**: Next.js 15+ (App Router)
- **Database**: Cloudflare D1 + Drizzle ORM
- **Styling**: Tailwind CSS v4 + Radix UI
- **Authentication**: Better-Auth
- **Language**: TypeScript (Strict Mode)

## Quality Gates

<!-- Example: Development Workflow, Review Process, Quality Gates, etc. -->

- **Linting**: All code must pass ESLint and Prettier checks.
- **Type Check**: `tsc --noEmit` must pass before any commit.
- **Build**: The project must successfully build (`npm run build`) before deployment.
- **Migrations**: Any database schema change must be accompanied by a generated SQL migration file.

## Governance

<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

This Constitution defines the non-negotiable architectural and quality standards for the Shlink project.

- **Amendments**: Changes to this document require a Pull Request with a clear rationale and must trigger a version bump.
- **Compliance**: All code reviews must reference these principles when requesting changes. Use the `/speckit.constitution` workflow to update this file.

**Version**: 1.0.0 | **Ratified**: 2026-01-27 | **Last Amended**: 2026-01-27
