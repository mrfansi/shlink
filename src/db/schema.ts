import { sqliteTable, text, integer, int } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
	image: text("image"),
    role: text("role").default("user"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
	id: text("id").primaryKey(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
});

export const account = sqliteTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: integer("access_token_expires_at", {
		mode: "timestamp",
	}),
	refreshTokenExpiresAt: integer("refresh_token_expires_at", {
		mode: "timestamp",
	}),
	scope: text("scope"),
	password: text("password"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }),
	updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const globalConfig = sqliteTable("global_config", {
	key: text("key").primaryKey(),
	value: text("value").notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Session = typeof session.$inferSelect;
export type Account = typeof account.$inferSelect;
export type Verification = typeof verification.$inferSelect;
export type GlobalConfig = typeof globalConfig.$inferSelect;

export const links = sqliteTable("links", {
	id: text("id").primaryKey(),
	slug: text("slug").notNull().unique(),
	originalUrl: text("original_url").notNull(),
	userId: text("user_id").references(() => user.id),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp" }),
	passwordHash: text("password_hash"),
	isActive: integer("is_active", { mode: "boolean" }).default(true),
	tags: text("tags", { mode: "json" }).$type<string[]>(),
	metadata: text("metadata", { mode: "json" }).$type<Record<string, any>>(),
	clickCount: integer("click_count").default(0),
});

export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;

export const clicks = sqliteTable("clicks", {
	id: text("id").primaryKey(),
	linkId: text("link_id").references(() => links.id),
	timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
	country: text("country"),
	city: text("city"),
	deviceType: text("device_type"),
	browser: text("browser"),
	os: text("os"),
	referrer: text("referrer"),
	ipAddress: text("ip_address"), // Anonymized
});

export const dailyLinkStats = sqliteTable("daily_link_stats", {
	id: text("id").primaryKey(),
	linkId: text("link_id").references(() => links.id),
	date: text("date").notNull(), // YYYY-MM-DD
	clicks: integer("clicks").notNull().default(0),
	metadata: text("metadata", { mode: "json" }).$type<Record<string, number>>(), // JSON breakdown
});

export type Click = typeof clicks.$inferSelect;
export type NewClick = typeof clicks.$inferInsert;
export type DailyLinkStat = typeof dailyLinkStats.$inferSelect;
export type NewDailyLinkStat = typeof dailyLinkStats.$inferInsert;

export const apiKeys = sqliteTable("api_keys", {
	id: text("id").primaryKey(),
	userId: text("user_id").references(() => user.id).notNull(),
	key: text("key").notNull().unique(), // We should hash this in real prod, but for MVP we might keep raw or hash. Let's keep raw for simplicity or hashed if we implement display-once. 
    // Spec says "API Key management". Let's store a partial key or just the key if we want to show it again (less secure).
    // Better: Store hashed, show once. But for this MVP, I'll store it plainly to avoid complexity of "show once" UI flow right now, or just use a simple token.
    // Actually, `crypto.randomUUID` or `nanoid` is fine.
    name: text("name"),
    lastUsedAt: integer("last_used_at", { mode: "timestamp" }),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
