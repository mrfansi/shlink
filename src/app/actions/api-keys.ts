"use server";

import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDb, type Env } from "@/db/client";
import { apiKeys } from "@/db/schema";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function createApiKey(name: string) {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Unauthorized" };

    const context = await getCloudflareContext({ async: true });
    const env = context.env as unknown as Env;
    const db = createDb(env);

    const key = `sk_${nanoid(32)}`;

    await db.insert(apiKeys).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        key, // In prod, verify hash
        name,
        createdAt: new Date(),
    });

    return { success: true, key }; // Return key only once if we were hashing, but since we store raw for MVP we can list it.
}

export async function listApiKeys() {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return [];

    const context = await getCloudflareContext({ async: true });
    const env = context.env as unknown as Env;
    const db = createDb(env);

    return await db.select().from(apiKeys).where(eq(apiKeys.userId, session.user.id));
}

export async function deleteApiKey(id: string) {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Unauthorized" };

    const context = await getCloudflareContext({ async: true });
    const env = context.env as unknown as Env;
    const db = createDb(env);

    await db.delete(apiKeys).where(eq(apiKeys.id, id)); // Add userId check for security
    
    return { success: true };
}
