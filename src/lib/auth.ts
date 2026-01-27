import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "@/db/client";
import { nextCookies } from "better-auth/next-js";
import * as schema from "@/db/schema";
import { D1Database } from "@cloudflare/workers-types";

// Helper to get D1 instance from the request/env context
// In Next.js on Cloudflare Pages/Workers, we need to access the D1 binding from the request context
// For now, we'll assume we can get it or structure this differently if Next.js middleware/context is needed.
// However, better-auth needs the db instance.
// With OpenNext on Cloudflare, we might need to access process.env or global context.
// A common pattern is to initialize it with a function that gets the DB.

// BUT, Better Auth expects `database` to be the adapter instance.
// Since we are running in a worker, the DB binding is available in the request handler.

// We typically use a wrapper or middleware to inject it, but `betterAuth` initialization is often static.
// Let's use the recommended pattern for Drizzle + Cloudflare D1 + Better Auth.

export const auth = betterAuth({
	database: drizzleAdapter(
		// @ts-ignore - The binding will be available at runtime
		createDb({ shlink_db: process.env.shlink_db }), 
		{
			provider: "sqlite",
			schema: schema,
		}
	),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        nextCookies()
    ]
});
