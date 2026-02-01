# Shlink - URL Shortener

A modern, high-performance URL shortener built for internal use. Developed with Next.js, Cloudflare Workers, D1, and R2.

## Features

- **Shorten URLs**: Generate short links with random or custom slugs.
- **QR Codes**: Auto-generated QR codes for every link.
- **Analytics**: Track clicks, geolocation, and device types.
- **Authentication**: Secure login via Email/Password or GitHub.
- **Link Management**: Dashboard to view, edit, and delete links.
- **Security**: Password protection and password-protected links.
- **API**: Public API for programmatic link creation.
- **Bulk Operations**: Bulk upload via CSV.
- **Custom Domains**: (Coming Soon) Support for branded domains.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Runtime**: [Cloudflare Workers](https://workers.cloudflare.com/) (via OpenNext)
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (Assets), KV (Rate Limiting)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Auth**: [Better Auth](https://better-auth.com/)
- **Styling**: Tailwind CSS v4 + Shadcn UI

## Getting Started

### Prerequisites

- Node.js 20+
- Cloudflare Account
- Wrangler CLI (`npm i -g wrangler`)

### Local Development

1.  **Install Dependencies**:

    ```bash
    npm install
    ```

2.  **Setup Environment**:
    Copy `.env.example` to `.env` (if provided) or set the following variables:

    ```bash
    BETTER_AUTH_SECRET=your_secret
    BETTER_AUTH_URL=http://localhost:3000
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    NEXT_PUBLIC_SHORT_DOMAIN=short.link
    ```

3.  **Run Migrations (Local)**:

    ```bash
    npm run db:migrate:local
    ```

4.  **Start Development Server**:
    ```bash
    npm run dev
    ```

### Deployment

1.  **Deploy to Cloudflare**:

    ```bash
    npm run deploy
    ```

2.  **Run Migrations (Production)**:
    ```bash
    npm run db:migrate:prod
    ```

## API Documentation

The API allows you to programmatically shorten URLs.

**Base URL**: `https://<your-domain>/api/v1`

### Authentication

Include your API Key in the `Authorization` header:

```
Authorization: Bearer <your_api_key>
```

You can generate an API key from the **Settings** page in the dashboard.

### Endpoints

#### Create Short Link

**POST** `/shorten`

**Body** (JSON):

```json
{
  "url": "https://example.com/very/long/url",
  "slug": "custom-alias", // Optional
  "expiresAt": "2025-12-31T23:59:59Z", // Optional
  "password": "secret-password" // Optional
}
```

**Response** (200 OK):

```json
{
  "shortUrl": "https://short.link/custom-alias",
  "slug": "custom-alias",
  "qrCode": "data:image/svg+xml;base64,..."
}
```

## Contributing

Silakan baca [Panduan Kontribusi](docs/CONTRIB.md) untuk detail tentang alur kerja pengembangan kami.

1.  Fork the repository.
2.  Create a feature branch.
3.  Commit your changes.
4.  Open a Pull Request.

## Operational Guide

Untuk panduan deployment dan operasional, silakan lihat [Runbook Operasional](docs/RUNBOOK.md).

## License

MIT
