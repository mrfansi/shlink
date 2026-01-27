import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb, type Env } from "@/db/client";
import { nextCookies } from "better-auth/next-js";
import * as schema from "@/db/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";

// Create auth instance with D1 binding from Cloudflare context
export async function getAuth() {
  const { env } = await getCloudflareContext<Env>({ async: true });
  
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

// Helper to get current session in Server Components
export async function getSession() {
  const auth = await getAuth();
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('better-auth.session_token');
  
  if (!sessionToken) {
    return null;
  }
  
  try {
    // Use Better Auth's session verification
    const session = await auth.api.getSession({
      headers: {
        cookie: `better-auth.session_token=${sessionToken.value}`
      }
    });
    
    return session;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}
