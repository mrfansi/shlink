import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb, type Env } from "@/db/client";
import { nextCookies } from "better-auth/next-js";
import * as schema from "@/db/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Create auth instance dynamically per request to access D1 binding
async function createAuthInstance() {
  const { env } = await getCloudflareContext<Env>();
  
  return betterAuth({
    database: drizzleAdapter(
      createDb(env as Env), 
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
}

export async function GET(request: Request) {
  const auth = await createAuthInstance();
  const handler = auth.handler;
  return handler(request);
}

export async function POST(request: Request) {
  const auth = await createAuthInstance();
  const handler = auth.handler;
  return handler(request);
}
