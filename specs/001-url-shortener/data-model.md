# Data Model

## Schema Definitions

- **user**: Identity (Email, Name).
- **session**: Active sessions.
- **account**: Linked accounts / Password.
- **verification**: Email verification tokens.
- **global_config**: System-wide settings (Logo, Whitelist).

### Core Feature Entities

#### Global Config

Singleton table for system settings.

| Field        | Type      | Attributes | Description                       |
| ------------ | --------- | ---------- | --------------------------------- |
| `key`        | `text`    | PK         | Config key (e.g., 'qr_logo_url'). |
| `value`      | `text`    | Not Null   | JSON value or string.             |
| `updated_at` | `integer` | Timestamp  | Last update.                      |

#### Link

Represents a shortened URL.

| Field           | Type      | Attributes          | Description                                                                 |
| --------------- | --------- | ------------------- | --------------------------------------------------------------------------- |
| `id`            | `text`    | PK, uuid            | Unique identifier.                                                          |
| `slug`          | `text`    | Unique, Index       | The short path (e.g., "promo"). Base62 or custom.                           |
| `original_url`  | `text`    | Not Null            | The destination URL.                                                        |
| `user_id`       | `text`    | FK -> `user.id`     | Owner of the link.                                                          |
| `created_at`    | `integer` | Not Null, Timestamp | Creation time.                                                              |
| `expires_at`    | `integer` | Nullable, Timestamp | Optional expiration time.                                                   |
| `password_hash` | `text`    | Nullable            | Encrypted password for protected links.                                     |
| `is_active`     | `integer` | Boolean, Default 1  | Soft delete / manual deactivation.                                          |
| `tags`          | `text`    | JSON Array          | List of tags for organization.                                              |
| `metadata`      | `text`    | JSON Object         | Cached metadata (title, image, description).                                |
| `click_count`   | `integer` | Default 0           | Denormalized counter for fast listing (optional, but good for performance). |

#### Click

Represents a visit to a shortened link.

| Field         | Type      | Attributes             | Description                                |
| ------------- | --------- | ---------------------- | ------------------------------------------ |
| `id`          | `text`    | PK, uuid               | Unique identifier.                         |
| `link_id`     | `text`    | FK -> `link.id`, Index | The link being accessed.                   |
| `timestamp`   | `integer` | Not Null, Timestamp    | Time of click.                             |
| `country`     | `text`    | Nullable               | Two-letter country code (from CF headers). |
| `city`        | `text`    | Nullable               | City name (from CF headers).               |
| `device_type` | `text`    | Nullable               | mobile, tablet, desktop (from UA).         |
| `browser`     | `text`    | Nullable               | Chrome, Safari, etc.                       |
| `os`          | `text`    | Nullable               | iOS, Windows, etc.                         |
| `referrer`    | `text`    | Nullable               | Referer header.                            |
| `ip_address`  | `text`    | Nullable               | Anonymized IP (hashed or partial).         |

#### Daily Link Stats

Aggregated stats for historical queries (1-year retention).

| Field      | Type      | Attributes             | Description               |
| ---------- | --------- | ---------------------- | ------------------------- |
| `id`       | `text`    | PK                     | Unique ID.                |
| `link_id`  | `text`    | FK -> `link.id`, Index | Link specific.            |
| `date`     | `text`    | Not Null, Index        | YYYY-MM-DD.               |
| `clicks`   | `integer` | Not Null               | Total clicks for day.     |
| `metadata` | `text`    | JSON                   | Device/Country breakdown. |

## Relationships

- `User` (1) -> (Many) `Link`
- `Link` (1) -> (Many) `Click`
- `Link` (1) -> (Many) `DailyLinkStats`
