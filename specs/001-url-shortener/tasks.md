# Tasks: URL Shortener

**Feature**: URL Shortener (Branch `001-url-shortener`)
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)
**Status**: Generated via `/speckit.tasks`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create Next.js project structure with `npx create-next-app`
- [ ] T002 [P] Configure Tailwind CSS v4 in `src/app/globals.css`
- [ ] T003 [P] Configure Shadcn UI components in `components.json` and install core components
- [ ] T004 [P] Initialize Cloudflare Wrangler configuration in `wrangler.jsonc` (D1, R2, KV bindings)
- [ ] T005 install core dependencies (drizzle-orm, better-auth, lucide-react)

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Setup Drizzle configuration and client in `src/db/client.ts`
- [ ] T007 Define database schema for Users, Accounts, Sessions, and Verification in `src/db/schema.ts`
- [ ] T008 Implement Better Auth configuration with Drizzle adapter in `src/lib/auth.ts`
- [ ] T009 [P] Create Auth API route handler in `src/app/api/auth/[...all]/route.ts`
- [ ] T010 [P] Create basic public layout in `src/app/layout.tsx`
- [ ] T011 [P] Create dashboard layout shell in `src/app/(dashboard)/layout.tsx`
- [ ] T012 Implement Middleware for Host based routing in `src/middleware.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

## Phase 3: User Story 1 - Core URL Shortening (Priority: P1) 🎯 MVP

**Goal**: Guests can shorten URLs with random slugs and get a QR code.

**Independent Test**: Shorten a URL via the landing page form, verify redirection works, and scan the QR code.

### Implementation for User Story 1

- [ ] T013 [US1] Define `links` table in `src/db/schema.ts`
- [ ] T014 [US1] Create migration for links table in `drizzle/migrations/`
- [ ] T015 [US1] Implement Base62/Nanoid ID generator in `src/lib/utils.ts`
- [ ] T016 [US1] Implement QR Code generation utility in `src/lib/qr-code.ts`
- [ ] T017 [US1] Create Link Creation Server Action in `src/app/actions.ts`
- [ ] T018 [US1] Implement Shortener Form component in `src/components/features/shortener-form.tsx`
- [ ] T019 [US1] Integrate Shortener Form into Landing Page `src/app/page.tsx`
- [ ] T020 [US1] Implement Redirection Logic in Middleware or Worker Route `src/middleware.ts` (or `src/app/[slug]/route.ts`)
- [ ] T021 [US1] Implement Result Card component (Slug + QR) in `src/components/features/result-card.tsx`

**Checkpoint**: User Story 1 (MVP) fully functional. Public shortening and redirection works.

## Phase 4: User Story 2 - Custom Slugs (Priority: P1)

**Goal**: Users can choose a specific custom alias for their URL.

**Independent Test**: Shorten variables with a custom slug, verify collision error allows retry, verify redirection works.

### Implementation for User Story 2

- [ ] T022 [US2] Update Link Creation Action to handle optional custom slug in `src/app/actions.ts`
- [ ] T023 [US2] Implement custom slug validation regex in `src/lib/validators.ts`
- [ ] T024 [P] [US2] Update Shortener Form UI to include Custom Slug input in `src/components/features/shortener-form.tsx`
- [ ] T025 [US2] Implement collision check logic in `src/db/queries.ts` (or within action)
- [ ] T026 [US2] Add error handling for "Slug taken" in `src/components/features/shortener-form.tsx`

**Checkpoint**: Custom slugs are supported and validated.

## Phase 5: User Story 3 - Analytics Dashboard (Priority: P2)

**Goal**: Marketers can view click stats, geolocation, and device info.

**Independent Test**: Visit a link multiple times (mock headers), check `daily_link_stats` and Dashboard view.

### Implementation for User Story 3

- [ ] T027 [US3] Define `clicks` and `daily_link_stats` tables in `src/db/schema.ts`
- [ ] T028 [US3] Create migration for analytics tables in `drizzle/migrations/`
- [ ] T029 [US3] Implement async click tracking in Middleware `src/middleware.ts`
- [ ] T030 [US3] Implement Cron Job handler for aggregation in `src/app/api/cron/aggregate/route.ts`
- [ ] T031 [US3] Create Analytics Service to query stats in `src/lib/analytics.ts`
- [ ] T032 [P] [US3] Create Charts components (Bar/Pie) using Recharts/Shadcn in `src/components/features/analytics-charts.tsx`
- [ ] T033 [US3] Create Analytics View page in `src/app/(dashboard)/links/[id]/analytics/page.tsx`
- [ ] T034 [US3] Implement CSV Export Server Action in `src/app/actions/analytics.ts`

**Checkpoint**: Click tracking active, aggregation working, charts visible.

## Phase 6: User Story 4 - User Authentication & Link Management (Priority: P2)

**Goal**: Users can sign up, log in, and manage their links.

**Independent Test**: Sign up, create links, log out, log in, verify "My Links" list shows only user's links.

### Implementation for User Story 4

- [ ] T035 [US4] Create Sign In / Sign Up pages in `src/app/(auth)/sign-in/page.tsx` & `sign-up/page.tsx`
- [ ] T036 [US4] Update Link Creation to associate `user_id` if authenticated in `src/app/actions.ts`
- [ ] T037 [US4] Implement "My Links" data fetching in `src/db/queries.ts`
- [ ] T038 [P] [US4] Create Link List Table component in `src/components/features/link-list.tsx`
- [ ] T039 [US4] Create Dashboard Home page in `src/app/(dashboard)/page.tsx`
- [ ] T040 [US4] Implement Delete Link Action in `src/app/actions.ts`
- [ ] T041 [US4] Implement Tags management UI in `src/components/features/link-tags.tsx`

**Checkpoint**: Auth Users can manage their own links.

## Phase 7: User Story 5 - Link Security & Advanced (Priority: P3)

**Goal**: Password protection and link expiration.

**Independent Test**: Create password link, access checks for password. Create expired link, access shows error.

### Implementation for User Story 5

- [ ] T042 [US5] Update `links` schema for password/expiration if needed in `src/db/schema.ts`
- [ ] T043 [US5] Implement Password/Expiration middleware check in `src/middleware.ts`
- [ ] T044 [P] [US5] Create Password Interstitial Page in `src/app/password/[slug]/page.tsx`
- [ ] T045 [US5] Implement Password Verification Action in `src/app/actions.ts`
- [ ] T046 [US5] Implement Metadata Proxy endpoint in `src/app/api/metadata/route.ts`
- [ ] T047 [US5] Create 404/Expired Link custom page in `src/app/not-found.tsx`

**Checkpoint**: Advanced security features functional.

## Phase 8: User Story 6 - Developer API & Bulk (Priority: P3)

**Goal**: API access and Bulk CSV handling.

**Independent Test**: CURL request with Bearer token creates link.

### Implementation for User Story 6

- [ ] T048 [US6] Implement API Key generation in Dashboard `src/app/(dashboard)/settings/page.tsx`
- [ ] T049 [US6] Create API Auth Middleware (Bearer Token) in `src/lib/api-auth.ts`
- [ ] T050 [US6] Implement POST /api/shorten endpoint in `src/app/api/v1/shorten/route.ts`
- [ ] T051 [US6] Implement CSV Parsing utility in `src/lib/csv.ts`
- [ ] T052 [US6] Create Bulk Upload UI in `src/app/(dashboard)/bulk/page.tsx`
- [ ] T053 [US6] Implement Bulk Processing (Queue Consumer setup) in `src/workers/consumer.ts` (if using Worker) or Async Action

**Checkpoint**: API and Bulk tools ready.

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T054 [P] Implement Global Settings (Logo Upload) in `src/app/(dashboard)/admin/page.tsx`
- [ ] T055 [P] Optimize SEO metadata for all public pages
- [ ] T056 Run performance profiling on Redirection Middleware
- [ ] T057 Verify accessibility (AHA) compliance
- [ ] T058 Final documentation updates (API docs)

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Start immediately.
- **Foundational (Phase 2)**: Depends on Setup. Blocks all User Stories.
- **US1 & US2 (P1)**: Start after Foundational.
- **US3 & US4 (P2)**: Start after Phase 2 (ideally after US1 for integration context).
- **US5 & US6 (P3)**: Start after Phase 2.

### Parallel Opportunities

- Logic Utils (Base62, QR, Validators) can be built in parallel to UI.
- Dashboard Pages (US4) can be built in parallel to Analytics (US3).
- API Routes (US6) can be built in parallel to Frontend features.

---

## Implementation Strategy

### MVP First (User Story 1 + 2)

1. Complete Setup & Foundational.
2. Implement US1 (Core) & US2 (Custom Slugs).
3. Validate: Public user can create short link (random/custom), see QR, and redirect works.

### Incremental Delivery P2

1. Add US4 (Auth) -> Enable "My Links".
2. Add US3 (Analytics) -> Enable Stats.
3. Validate: User logs in, sees history, sees stats.

### Incremental Delivery P3

1. Add US5 (Security) & US6 (API).
2. Validate: API access, Passwords, Bulk.
