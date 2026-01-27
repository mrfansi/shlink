# Quickstart: URL Shortener

## Prerequisites

- Node.js 20+
- pnpm 9+
- Cloudflare account (for deployment)

## Setup

1.  **Install dependencies**:
    ```bash
    pnpm install
    ```

2.  **Environment Variables**:
    Copy `.env.example` to `.env.local` and configure:
    - `BETTER_AUTH_SECRET`
    - `BETTER_AUTH_URL`
    - `CLOUDFLARE_ACCOUNT_ID`
    - `CLOUDFLARE_DATABASE_ID`

3.  **Database Setup**:
    ```bash
    # Generate migrations
    pnpm db:generate
    
    # Apply to local D1 (Miniflare)
    pnpm db:migrate:local
    ```

## Running Locally

1.  **Start Development Server**:
    ```bash
    pnpm dev
    ```
    Access at `http://localhost:3000`.

2.  **Preview Cloudflare Environment**:
    ```bash
    pnpm preview
    ```
    This runs the app in the `workerd` runtime, simulating the actual Cloudflare deployment.

## Testing

*Testing framework is currently being configured.*

Once available:
```bash
pnpm test
```

## Deployment

1.  **Deploy to Cloudflare**:
    ```bash
    pnpm deploy
    ```
    This builds the Next.js app and deploys it to Cloudflare Pages/Workers.

2.  **Remote Database Migration**:
    ```bash
    pnpm db:migrate:remote
    ```

## Manual Verification

1.  **Shorten a Link (API)**
    ```bash
    curl -X POST http://localhost:3000/api/links \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer <API_KEY>" \
      -d '{"targetUrl": "https://example.com", "slug": "test"}'
    ```

2.  **Access a Short Link**
    Visit `http://localhost:3000/test` in your browser.
