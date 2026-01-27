# shlink Development Guidelines

Comprehensive guide for AI coding agents working in the shlink codebase.  
Last updated: 2026-01-27

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Runtime**: Cloudflare Workers/Pages (via OpenNext)
- **Language**: TypeScript 5.7+ (strict mode)
- **Database**: Cloudflare D1 (SQLite) + Drizzle ORM 0.45+
- **Storage**: Cloudflare R2 (object storage)
- **Auth**: Better Auth 1.4+ (email/password)
- **UI**: Shadcn UI (New York style) + Radix UI primitives
- **Styling**: Tailwind CSS v4 + tw-animate-css
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React (DO NOT use emoji icons)
- **Package Manager**: pnpm

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── (auth)/      # Auth route group (sign-in, sign-up)
│   ├── api/         # API routes (/api/auth/*)
│   ├── layout.tsx   # Root layout
│   └── page.tsx     # Homepage
├── components/      # React components
│   ├── auth/        # Auth-specific components
│   └── ui/          # Shadcn UI components (53+ components)
├── db/              # Database layer
│   ├── client.ts    # Drizzle client factory
│   └── schema.ts    # Database schema (Better Auth tables)
├── hooks/           # Custom React hooks
├── lib/             # Utilities & shared code
│   ├── auth-client.ts  # Better Auth client (for Client Components)
│   ├── auth-server.ts  # Better Auth server (for Server Components)
│   └── utils.ts        # Utility functions (cn, etc.)
└── middleware.ts    # Route protection middleware

migrations/          # Drizzle ORM migrations
specs/               # Feature specifications (001-url-shortener)
public/              # Static assets (_headers, SVGs)
.agents/skills/      # AI agent skill library
```

## Commands

### Development
```bash
pnpm dev              # Start dev server (localhost:3000)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
```

### Deployment (Cloudflare)
```bash
pnpm deploy           # Build and deploy to Cloudflare
pnpm upload           # Build and upload (no deploy)
pnpm preview          # Build and preview locally on Cloudflare runtime
```

### Database (Drizzle ORM)
```bash
pnpm db:generate      # Generate migration from schema changes
pnpm db:migrate:local # Apply migrations to local D1 database
pnpm db:migrate:remote # Apply migrations to remote D1 database
pnpm db:studio        # Open Drizzle Studio (GUI at localhost:4983)
```

### Testing
**NOTE**: Testing framework not yet configured. Plan includes:
- Vitest for unit/integration tests
- Playwright for E2E tests
- Run single test: `vitest run <file-path>` (once configured)

### Utilities
```bash
pnpm cf-typegen       # Generate Cloudflare environment types
wrangler d1 execute shlink-db --local --command="SELECT * FROM user"
```

## Code Style

### Imports
- Use `@/*` path alias for all internal imports
- Group imports: external packages → internal modules → types
- Use named exports (avoid default exports except for pages/layouts)

```typescript
// Good
import { betterAuth } from "better-auth";
import { createDb, type Env } from "@/db/client";
import type { User } from "@/db/schema";

// Avoid
import betterAuth from "better-auth";  // No default imports
import { createDb } from "../db/client";  // Use @ alias
```

### TypeScript
- **Strict mode enabled**: no implicit any, null checks enforced
- Use explicit return types for exported functions
- Prefer `type` over `interface` for object shapes
- Use Drizzle's `$inferSelect` and `$inferInsert` for model types
- Cloudflare env types: `getCloudflareContext<Env>()`

```typescript
// Database types
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

// Function signatures
export async function getSession(): Promise<Session | null> {
  // implementation
}

// Cloudflare context
const { env } = await getCloudflareContext<Env>();
```

### Naming Conventions
- **Files**: kebab-case (`auth-server.ts`, `user-menu.tsx`)
- **Components**: PascalCase (`UserMenu`, `SignInForm`)
- **Functions**: camelCase (`getSession`, `createUser`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `API_URL`)
- **Database tables**: snake_case (`user`, `session`, `link_clicks`)
- **React Server Actions**: prefix with `action` (`actionSignIn`, `actionCreateLink`)

### Formatting
- **Indentation**: Tabs (as seen in existing code)
- **Quotes**: Double quotes for strings
- **Semicolons**: Required (seen in schema.ts)
- **Line length**: ~80-100 chars (no hard limit)
- **Trailing commas**: Use in multiline objects/arrays

### Component Structure
```typescript
// 1. Imports
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { User } from "@/db/schema";

// 2. Types
type UserMenuProps = {
  user: User;
  onSignOut: () => void;
};

// 3. Component
export function UserMenu({ user, onSignOut }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    // JSX with cursor-pointer on interactive elements
    <div className="relative cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
      {/* implementation */}
    </div>
  );
}
```

### Error Handling
- Use try-catch for async operations
- Log errors with `console.error` (includes context)
- Return null/undefined for expected failures (e.g., no session found)
- Throw errors for unexpected failures (e.g., database connection issues)

```typescript
export async function getSession() {
  const auth = await getAuth();
  const sessionToken = cookieStore.get('better-auth.session_token');
  
  if (!sessionToken) {
    return null;  // Expected case: no session
  }
  
  try {
    return await auth.api.getSession({
      headers: { cookie: `better-auth.session_token=${sessionToken.value}` }
    });
  } catch (error) {
    console.error('Session verification failed:', error);  // Log unexpected errors
    return null;
  }
}
```

### Database Patterns
- **Schema definition**: Use Drizzle's `sqliteTable` with explicit column types
- **Foreign keys**: Always use `.references(() => tableName.columnName)`
- **Timestamps**: Use `integer("created_at", { mode: "timestamp" })`
- **Relations**: Define separately using Drizzle's `relations()` helper
- **Migrations**: Generate via `pnpm db:generate`, never edit manually

```typescript
export const link = sqliteTable("link", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  targetUrl: text("target_url").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
```

### UI/UX Requirements

**Critical Rules** (from .cursor/commands/ui-ux-pro-max.md):

1. **No emoji icons** - Use Lucide React SVG icons only
2. **Cursor pointer** - Add `cursor-pointer` to ALL clickable/hoverable elements
3. **Stable hover states** - Use color/opacity transitions, NOT scale transforms
4. **Light/Dark mode contrast**:
   - Light mode text: `text-slate-900` (#0F172A) minimum
   - Glass cards: `bg-white/80` in light mode (not bg-white/10)
   - Borders: `border-gray-200` in light, `border-white/10` in dark
5. **Transitions** - Use `transition-colors duration-200` for smooth interactions
6. **Floating navbars** - `top-4 left-4 right-4` spacing, not stuck to edges
7. **Responsive** - Test at 375px, 768px, 1024px, 1440px

### Authentication Patterns
- **Server Components**: Use `getAuth()` and `getSession()` from `@/lib/auth-server`
- **Client Components**: Use `authClient` from `@/lib/auth-client`
- **Middleware**: Protect routes in `src/middleware.ts` (redirect to `/sign-in`)
- **Session cookie**: `better-auth.session_token` (managed by Better Auth)

```typescript
// Server Component
import { getSession } from "@/lib/auth-server";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  
  return <div>Dashboard for {session.user.email}</div>;
}

// Client Component
"use client";
import { authClient } from "@/lib/auth-client";

export function SignInForm() {
  const handleSignIn = async () => {
    await authClient.signIn.email({ email, password });
  };
  // ...
}
```

## Key Configuration Files

- `wrangler.jsonc` - Cloudflare bindings (D1: shlink-db, R2: shlink-assets)
- `drizzle.config.ts` - Database connection & migration settings
- `next.config.ts` - Next.js configuration (experimental serverActions)
- `open-next.config.ts` - OpenNext adapter for Cloudflare
- `components.json` - Shadcn UI configuration (New York style)
- `eslint.config.mjs` - ESLint flat config (next/core-web-vitals)
- `tsconfig.json` - TypeScript strict mode + @/* path alias

## Performance Goals

- Redirection latency: <100ms (99th percentile)
- Throughput: 5,000 req/s
- Bulk shortening: 100 links in <5 seconds

## Testing Checklist (Pre-Delivery)

- [ ] TypeScript compiles without errors (`pnpm build`)
- [ ] ESLint passes (`pnpm lint`)
- [ ] All interactive elements have `cursor-pointer`
- [ ] No emoji icons (use Lucide React)
- [ ] Hover states don't cause layout shift
- [ ] Light/dark mode tested (sufficient contrast)
- [ ] Responsive on 375px, 768px, 1024px, 1440px
- [ ] Forms have proper validation (Zod schema)
- [ ] Database migrations generated and applied
- [ ] No console errors in browser/server

## Available AI Skills

Load these skills for specialized guidance (via Cursor/agent tools):

- `better-auth-best-practices` - Authentication patterns
- `cloudflare` - Workers, Pages, D1, R2, AI
- `drizzle` / `drizzle-orm-d1` - Database schema & migrations
- `frontend-design` - UI/UX design patterns
- `next-best-practices` - Next.js App Router patterns
- `nextjs-app-router-patterns` - Server Components, streaming
- `shadcn-ui` - Component library usage
- `wrangler` - Cloudflare CLI commands

## Common Tasks

### Add a new page
1. Create `src/app/new-page/page.tsx`
2. Protect with middleware if needed (edit `src/middleware.ts`)
3. Use Server Component for data fetching
4. Use `getSession()` for auth checks

### Add a database table
1. Edit `src/db/schema.ts` (add table + types)
2. Generate migration: `pnpm db:generate`
3. Apply locally: `pnpm db:migrate:local`
4. Apply to remote: `pnpm db:migrate:remote`

### Add a Shadcn component
```bash
npx shadcn@latest add <component-name>
```
Components auto-install to `src/components/ui/`

### Debug Cloudflare locally
```bash
pnpm preview  # Runs on Miniflare with D1/R2 bindings
```

## Git Workflow

- **Commit style**: Conventional commits (`feat:`, `fix:`, `docs:`)
- **Branch naming**: `feature/short-name`, `fix/issue-description`
- **No force push** to main/master
- **Test locally** before pushing (especially migrations)

<!-- MANUAL ADDITIONS START -->
<!-- Add custom project-specific rules below -->

<!-- MANUAL ADDITIONS END -->

## Active Technologies
- TypeScript 5.7+ (Strict Mode) + Next.js 16 (App Router), React 19, Better Auth 1.4+, Shadcn UI, Tailwind CSS v4, Lucide Reac (001-url-shortener)
- Cloudflare D1 (SQLite) via Drizzle ORM, Cloudflare R2 (Assets) (001-url-shortener)

## Recent Changes
- 001-url-shortener: Added TypeScript 5.7+ (Strict Mode) + Next.js 16 (App Router), React 19, Better Auth 1.4+, Shadcn UI, Tailwind CSS v4, Lucide Reac
