import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";
import { createDb, type Env } from "@/db/client";
import * as schema from "@/db/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const getAuth = async () => {
  const context = await getCloudflareContext({ async: true });
  const env = context.env as unknown as Env;

  if (!env.shlink_db) {
    throw new Error("Database binding 'shlink_db' not found in environment");
  }

  const db = createDb(env);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: schema,
    }),
    emailAndPassword: {
      enabled: true,
    },
    secret: (env as any).BETTER_AUTH_SECRET || "development-secret",
    plugins: [
      jwt({
        // jwt specific options if any
      }),
    ],
  });
};
