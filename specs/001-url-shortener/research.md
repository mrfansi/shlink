# Research: URL Shortener

**Feature**: URL Shortener (Branch `001-url-shortener`)
**Date**: 2026-01-27

## 1. Asynchronous Bulk Processing

**Problem**: FR-015 requires asynchronous processing for batches > 1000 URLs, but synchronous for < 1000.

**Decision**: **Hybrid Approach (Direct + Cloudflare Queues)**.
**Rationale**:

- **Batch < 1000**: Process directly in the Worker request handler. `Promise.all` can handle 1000 D1 inserts within the worker time limit (usually 30s) if done efficiently.
- **Batch > 1000**: Offload to **Cloudflare Queues**. The API returns "202 Accepted" immediately.
- Satisfies the "immediate feedback" requirement for small batches and reliability for large ones.
  **Rationale**:

- `ctx.waitUntil` is acceptable for "fire and forget" tasks (like analytics logging) but lacks the reliability, retries, and backpressure management needed for bulk processing jobs.
- Queues allow decoupling the API response from the heavy processing load, ensuring the API remains responsive.
- Standard pattern for Cloudflare Workers workloads.

**Alternatives Considered**:

- **`ctx.waitUntil`**: Simpler, but risks data loss if the worker crashes or times out. No built-in retry mechanism for individual items.
- **Client-side chunking**: Have the frontend send 100 requests of 10 items. Adds complexity to the client and is fragile to network interruptions.

**Action Item**:

- Add `queues` binding to `wrangler.jsonc`.
- Create a consumer worker (or route handler) to process queue messages.

## 2. QR Code Generation in Edge Runtime

**Problem**: Need a QR code generation library that works in Cloudflare Workers (Edge runtime), which doesn't support Node.js native modules.

**Decision**: Use **`uqr`** or **`qrcode`** (with `svg` output).
**Rationale**:

- `uqr` is a micro-library designed for modern JS environments, very small footprint.
- `qrcode` is the standard but might need some polyfills or specific configuration for Edge.
- We need to output SVG (as per UI requirements for scalability) or PNG. SVG is better for React components.

**Alternatives Considered**:

- **External API**: Privacy risk and dependency on external service.
- **`node-qrcode`**: Might be too heavy or rely on Canvas which is not available in Workers without polyfills (Resvg).

**Action Item**:

- Test `qrcode` package in Edge runtime. If it fails, fallback to `uqr`.

## 3. Dynamic Metadata Proxy

**Problem**: FR-018 requires fetching and serving metadata to social bots (Twitterbot, FacebookExternalHit, etc.) when they access a short link.

**Decision**: Implement in **Next.js Middleware** or a dedicated **Edge API Route**.
**Rationale**:

- Middleware can detect the User-Agent very early.
- If a bot is detected, rewrite the request to an internal API route (e.g., `/api/metadata?slug=...`) which fetches the target URL, parses OpenGraph tags, caches them in KV/D1, and returns an HTML page with _only_ the meta tags.
- Regular users get a 301 redirect immediately.
- Use `cheerio` for robust metadata extraction from target URLs.

**Alternatives Considered**:

- **Always fetch metadata**: Too slow for regular users (adds latency).
- **Client-side redirect**: Bots don't execute JS, so they won't see metadata if we use client-side redirection.

**Action Item**:

- Use `bot-detect` or regex in Middleware to identify crawlers.
- Implement caching layer (D1 or KV) for metadata to satisfy "cache to prevent redundant requests".

## 4. IP Geolocation & Device Detection

**Problem**: Need accurate country and device type for analytics (FR-005).

**Decision**: Use **Cloudflare `cf` Object** + **`ua-parser-js`**.
**Rationale**:

- `request.cf.country` provides geolocation at the edge with zero overhead.
- `ua-parser-js` is lightweight and widely used for parsing User-Agent strings to get Device Type (Mobile/Desktop/Tablet) and Browser.

**Alternatives Considered**:

- **MaxMind GeoIP**: Requires database maintenance and updates. Cloudflare provides this natively.

**Action Item**:

- Ensure `cf` object is available in the OpenNext context.

## 5. Short ID Generation

**Decision**: **`nanoid`** (custom alphabet).
**Rationale**:

- Fast, secure, URL-friendly.
- `customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 7)` gives plenty of entropy.

### Authentication

- **Decision**: Better Auth with **JWT Plugin**.
- **Rationale**: TC-004 requires stateless JWTs. Standard database sessions do not meet the "stateless" constraint.
- **Configuration**: Enable `jwt` plugin and configure `session` strategies to use tokens in HttpOnly cookies.
- **Status**: Already installed (needs plugin config).

## 6. CSV Parsing

**Decision**: **`papaparse`**.
**Rationale**:

- Fast, robust CSV parsing for bulk upload features.
- Can work on server or client.

## 7. Rate Limiting

**Problem**: FR-016 requires strict rate limiting (10 req/s for writes).

**Decision**: Use **Upstash Redis** or **Cloudflare Rate Limiting (if Enterprise)**. Assumption: Standard Plan -> Use **Upstash Redis** (free tier sufficient for MVP) or **Durable Objects**.
**Revised Decision**: Use **Cloudflare Rate Limiting (Free)** if available or simplifed **KV-based Token Bucket**.
**Final Decision**: **KV-based Sliding Window**.
**Rationale**: Simple to implement, low cost. 10 req/s is high enough that KV writes might be hot, but acceptable for MVP. Alternatively, use a Durable Object for strict counting if precise consistency needed. For MVP, simple Middleware check against KV/D1 is sufficient.

## 8. Global Settings Config

**Problem**: Where to store 'Default Logo' and 'Whitelist'?

**Decision**: **Hybrid Configuration**.

- **Email Whitelist**: **Environment Variable (`ALLOWED_DOMAINS`)**.
  - **Rationale**: FR-006 explicitly demands "configurable via env var". Security critical, immutable at runtime.
- **QR Logo**: **D1 `global_config` table**.
  - **Rationale**: FR-014 requires an "interface" for uploading, implying runtime updates. Env vars require redeployment, which is bad for UX.

**Decision**: **D1 `global_config` table**.
**Rationale**: Simple key-value storage within the existing database. No need for separate service.

## 11. Domain & Host Routing

**Problem**: TC-001 requires the shortener service to operate on a different domain from the dashboard.

**Decision**: **Middleware Host Routing**.
**Logic**:

- Check `request.headers.get("host")`.
- If Host == `SHORT_DOMAIN` (env var):
  - Run Redirection Logic.
- If Host == `DASHBOARD_DOMAIN` (env var):
  - Run Next.js App Router (Dashboard/Auth).
- **Rationale**: Single codebase deployable to Cloudflare Pages/Workers, but logical separation via Host header.

## 12. UTM Builder

**Decision**: **Native `URLSearchParams`**.
**Rationale**: No need for external libraries (`qs`, `query-string`) as standard Web API `URLSearchParams` is fully supported in all modern browsers and Node.js for simple parameter appending.

## 9. Data Aggregation Strategy

**Problem**: FR-009 requires 1-year retention of aggregated stats while pruning raw logs after 30 days.

**Decision**: **Cloudflare Cron Triggers**.
**Rationale**:

- Run a daily Cron job (e.g., at 00:00 UTC).
- The worker will:
  1. Select `clicks` from the previous day.
  2. Aggregate counts by Link ID, Country, and Device.
  3. Upsert into `daily_link_stats`.
  4. Delete `clicks` older than 30 days.
- Keeps the `clicks` table light and performant.

## 10. Edge Cases & Validation

**Circular Redirection**:

- **Logic**: When creating a link, parse the `targetUrl`. If the hostname matches our own domain (e.g., `short.link` or `localhost`), reject the request.

**Malicious Protocols**:

- **Logic**: Validate `targetUrl` starts with `http://` or `https://`. Reject `javascript:`, `file:`, `data:` schemes.

**QR Code Composite**:

- **Strategy**:
  1. Generate QR Code SVG string using `uqr` or `qrcode`.
  2. Fetch the Center Logo (from R2 or Global Config).
  3. Embed the logo as an `<image>` tag centered within the SVG XML string.
  4. Return the complete SVG to the frontend.
- **Rationale**: Pure string manipulation is cheaper and faster than Canvas compositing in Workers.
