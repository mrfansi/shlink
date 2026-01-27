# Feature Specification: URL Shortener

**Feature Branch**: `001-url-shortener`  
**Created**: 2026-01-27  
**Status**: Draft  
**Input**: User description provided in request.

## Clarifications

### Session 2026-01-27

- Q: How should Geolocation and Device Analytics be implemented in the Cloudflare Workers environment? → A: Use Cloudflare `cf` object for Country + `ua-parser-js` for Device Type.
- Q: What identity mechanism should be used for link ownership and dashboard access? → A: Full Auth (Email/Password) for all internal users.
- Q: Where should images (e.g., QR code logos) be stored? → A: Cloudflare R2.
- Q: How should user sessions be managed? → A: JWT in Secure/HttpOnly Cookies.
- Q: Which web framework should be used for the implementation? → A: Next.js (deployed on Cloudflare).
- Q: How should metadata (Title/Description/Image) be handled for social media previews? → A: Use a Dynamic Crawler Handler to fetch metadata in real-time when a bot (WhatsApp, Facebook, etc.) accesses the link.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Core URL Shortening (Priority: P1)

As an internal user who needs to share a long system URL, I can paste my URL and receive a short link so that it's easier to share internally or with authorized partners.

**Why this priority**: This is the fundamental purpose of the application. Without this, the app has no value.

**Independent Test**: Can be fully tested by submitting a long URL and checking if the output is a shortened link that redirects correctly.

**Acceptance Scenarios**:

1. **Given** the homepage is loaded, **When** I paste a valid URL starting with http/https, **Then** the system generates a short link.
2. **Given** a generated short link, **When** I visit it in a browser, **Then** I am redirected to the original long URL within 100ms (as per success criteria) using a 301/302 status code.

---

### User Story 2 - Custom Slugs (Priority: P1)

As a brand owner, I want to use a specific keyword as the link suffix so that my links are memorable and trustworthy.

**Why this priority**: Identical to core value but adds branding capability, a key requirement for return users.

**Independent Test**: Can be tested by shortening a link with a specific custom slug and verifying it works.

**Acceptance Scenarios**:

1. **Given** a URL to shorten, **When** I provide a custom slug "promo-lebaran", **Then** the system checks for availability and assigns "short.link/promo-lebaran" to my link.
2. **Given** a custom slug that already exists, **When** I try to use it, **Then** the system displays a "Slug is already taken" error message.

---

### User Story 3 - Analytics Dashboard (Priority: P2)

As a marketer, I want to see detailed statistics for my links so that I can measure the effectiveness of my campaigns.

**Why this priority**: High value for professional users, though the core redirection works without it.

**Independent Test**: Can be tested by clicking a link multiple times from different devices/locations and checking if the dashboard reflects this data.

**Acceptance Scenarios**:

1. **Given** a link has been clicked, **When** I view the analytics dashboard, **Then** I see the total click count, geolocation (country), referrer source, and device type.
2. **Given** a link with zero clicks, **When** I view the dashboard, **Then** the system shows a "No data available" state.

---

### User Story 4 - User Authentication & Link Management (Priority: P2)

As a registered user, I want to see a list of all links I've created so that I can edit or delete them later.

**Why this priority**: Essential for long-term user retention and link maintenance.

**Independent Test**: Can be tested by logging in and verifying that only the user's specific links are visible and manageable.

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I visit my dashboard, **Then** I see a list of my shortened links with their original URLs and creation dates.
2. **Given** an existing link in my list, **When** I click "Delete", **Then** the short link no longer works and is removed from my dashboard.

---

### User Story 5 - Link Expiration & Password Protection (Priority: P3)

As a security-conscious user, I want to restrict access to my links using passwords or time limits.

**Why this priority**: Advanced security features that enhance the product but are not "core" to the shortening service.

**Independent Test**: Can be tested by setting an expiration date in the past and verifying the link is inactive, or setting a password and verifying the prompt.

**Acceptance Scenarios**:

1. **Given** a link is password protected, **When** a visitor accesses it, **Then** they are prompted for a password before redirection.
2. **Given** a link has expired, **When** accessed, **Then** the system shows a 404 or "Link Expired" page.

---

### User Story 6 - Developer API & Bulk Operations (Priority: P3)

As a developer, I want to programmatically shorten links or process large lists of URLs at once.

**Why this priority**: Scales the product for automated workflows and enterprise use.

**Independent Test**: Can be tested via curl/postman calls to the API or uploading a CSV for bulk processing.

**Acceptance Scenarios**:

1. **Given** a valid API key, **When** I send a POST request with a URL, **Then** I receive a JSON response containing the short link.
2. **Given** a CSV file with 10 URLs, **When** I upload it to the bulk shortener, **Then** the system processes all 10 and provides a downloadable list of short links.

---

### Edge Cases

- **Circular Redirection**: What happens when a user tries to shorten a short link from the same domain? The system MUST prevent shortening URLs from its own domain to avoid infinite loops.
- **Invalid URLs**: How does the system handle "javascript:" or other malicious protocols? These MUST be rejected.
- **High Traffic Spikes**: Can the system handle 1 million clicks in 1 hour for a viral link? The system SHOULD be designed for high scalability (as per success criteria 5000 req/s).
- **Database Collisions**: What happens if the random slug generator produces a slug that already exists? The system will automatically increase the slug length by one character and retry the generation to ensure uniqueness.
- **Internal Safety**: Since the system is internal-only, focus is on organizational whitelist validation rather than public safety APIs.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST generate a unique slug using a base62-like algorithm for non-custom links.
- **FR-002**: System MUST enforce restrictions on custom slugs: only alphanumeric characters, hyphens, and underscores are allowed, with a length between 3 and 32 characters.
- **FR-003**: System MUST create a new unique short link for every shortening request, even if the target URL already exists in the database.
- **FR-004**: System MUST support permanent (301) and temporary (302) HTTP redirects.
- **FR-005**: System MUST track click events using Cloudflare-native country detection (`cf` object), Referer header, and server-side User-Agent parsing (e.g., using `ua-parser-js`) for device type categorization.
- **FR-006**: System MUST implement full user account management (Sign Up, Log In) using Email and Password. To secure internal access, Sign Up MUST be restricted to a specific allowed email domain whitelist (configurable via env var).
- **FR-007**: System MUST generate a unique QR code for every shortened link, supporting high-restoration error correction and permitting a logo overlay in the center.
- **FR-008**: System MUST provide a REST API with Bearer token authentication.
- **FR-009**: System MUST persist link and click data in Cloudflare D1. To optimize storage, Raw Click Logs MUST be retained for 30 days, then aggregated into daily summaries for 1-year history. Old raw logs MUST be pruned automatically.
- **FR-017**: System database operations MUST be managed using DrizzleORM for type-safe schema and query handling.
- **FR-010**: System MUST support CSV file uploads for bulk URL shortening. In case of invalid URLs, the system MUST process valid ones and return a report detailing failures.
- **FR-011**: System MUST allow setting an optional expiration date/time for any link. Expired links MUST show an error page but remain visible and restorable in the user dashboard.
- **FR-012**: System MUST allow setting an optional password for any link. The landing page MUST display the target URL's metadata (title/favicon) to build trust.
- **FR-013**: System MUST provide a minimalist, premium-styled landing page for password entry and displaying error states (e.g., link expired).
- **FR-014**: System MUST provide a Global Settings interface allowing administrators to upload a default logo for QR code center overlays.
- **FR-015**: System MUST support bulk shortening via API. For payloads under 1,000 URLs, processing MUST be synchronous for immediate feedback. Larger batches MUST use an asynchronous job queue.
- **FR-016**: System MUST enforce tiered rate limiting: write operations (API/Dashboard) limited to 10 req/s per IP. Public redirection MUST be optimized for high throughput (standard DDoS protection only) to meet the 5,000 req/s target.
- **FR-018**: System MUST implement a "Dynamic Metadata Proxy" for social media previews. Metadata fetched MUST be cached (e.g., in D1 or KV) to prevent redundant external requests on subsequent shares.
- **FR-019**: System MUST allow users to assign multiple "Tags" to links for organization and filtering in the dashboard.
- **FR-020**: The "Slug" (short path) of a link MUST be immutable (cannot be changed) after creation to prevent dead links. Users CAN update the Target URL, Tags, or Settings of an existing link.
- **FR-021**: System MUST provide an "Export to CSV" function in the analytics dashboard, allowing users to download click data reports for specific links or date ranges.
- **FR-022**: System MUST provide a built-in UTM Builder interface in the link creation/edit form to help users correctly append standard UTM parameters (source, medium, campaign) to their target URLs.

### Key Entities _(include if feature involves data)_

- **Link**: Represents the mapping between slug and original URL. Attributes: slug, original_url, user_id, created_at, expires_at, password_hash, is_active, tags (array/json).
- **Click**: Represents a single visitor event. Attributes: link_id, timestamp, country, referrer, device_type, ip_address (anonymized).
- **User**: Represents a registered account for link management/API access. Attributes: email, password_hash, api_key, role ('user', 'admin').
- **GlobalConfig**: Stores system-wide settings. Attributes: key (pk), value (json).

## Assumptions & Risks

- **Internal Use**: The system is intended for internal organizational use. Security focus is on internal access control rather than public safety APIs (e.g., Google Safe Browsing).
- **Redirection Domains**: It is assumed that the redirection service will have its own dedicated domain or subdomain to prevent cookies/session leakage between the management UI and shortened links.
- **Anonymization**: IP addresses collected for geolocation tracking will be anonymized before storage to comply with generic privacy guidelines.
- **Runtime Environment**: The system will be designed to run within the Cloudflare Workers environment to utilize Cloudflare D1.

### Technical Constraints

- **TC-001**: The link shortener service MUST operate on a different domain or subdomain from the primary proxy/management dashboard to ensure domain isolation and brand clarity for short links.
- **TC-002**: Data persistence MUST use Cloudflare D1 for relational data and Cloudflare R2 for binary/image storage (e.g., logos).
- **TC-003**: Database interactions MUST use DrizzleORM.
- **TC-004**: Authentication sessions MUST be managed using stateless JWTs stored in Secure, HttpOnly, and SameSite=Lax/Strict cookies.
- **TC-005**: The application MUST be built using Next.js on Cloudflare Pages. Critical Redirection Logic MUST be implemented in lightweight Middleware or a separate Worker to guarantee <100ms latency, decoupled from heavier Next.js rendering.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Redirection latency MUST be under 100ms for 99% of requests.
- **SC-002**: The system MUST handle at least 5,000 requests per second.
- **SC-003**: 100% of shortened links MUST redirect to the correct original destination.
- **SC-004**: Users can shorten their first link in under 10 seconds from landing on the homepage.
- **SC-005**: Bulk shortening of 100 links MUST complete in under 5 seconds.
