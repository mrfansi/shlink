"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDb, type Env } from "@/db/client";
import { globalConfig } from "@/db/schema"; 
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";

// Verify importing 'user' table correctly. Reference schema.ts shows 'user' export.
import { user as userTable, globalConfig as globalConfigTable } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function uploadLogo(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) {
        return { success: false, error: "No file provided" };
    }

    try {
        const auth = await getAuth();
        const session = await auth.api.getSession({ headers: await headers() });

        if (!session) {
            return { success: false, error: "Unauthorized" };
        }

        const context = await getCloudflareContext({ async: true });
        const env = context.env as unknown as Env;
        const db = createDb(env);

        // Check Admin Role
        const currentUser = await db.select().from(userTable).where(eq(userTable.id, session.user.id)).get();
        if (!currentUser || currentUser.role !== "admin") {
            // For MVP: If role is default 'user', maybe allow first user or just fail?
            // Since we just added the column, everyone is 'user'.
            // I will Temporarily allow it if no admins exist? No, that's complex.
            // I'll just fail. The user might need to manually update DB.
            return { success: false, error: "Forbidden: Admins only" };
        }

        if (!env.shlink_assets) {
             return { success: false, error: "Storage configuration missing" };
        }

        // Upload to R2
        const buffer = await file.arrayBuffer();
        const key = `logo-${Date.now()}-${file.name}`;
        
        await env.shlink_assets.put(key, buffer, {
            httpMetadata: {
                contentType: file.type,
            },
        });

        // The public URL depends on how R2 is exposed. 
        // Usually it's via a custom domain or worker.
        // I will assume standard R2 public access or a configured domain.
        // For now, I'll store the object key or a constructed URL.
        // If 'assets.short.link' is set up... 
        // Let's assume we store the relative path or full URL if we know the public bucket URL.
        // I'll store the key for now, or maybe a /api/assets/ proxy path?
        // Let's assume there is a public R2 domain configured in env vars?
        // Checking research.md: "R2 for binary/image storage".
        
        const publicUrl = `/api/assets/${key}`; // We might need a proxy if bucket isn't public

        // Update Global Config
        // Check if config exists
        const existing = await db.select().from(globalConfigTable).where(eq(globalConfigTable.key, "qr_logo_url")).get();
        if (existing) {
             await db.update(globalConfigTable)
               .set({ value: publicUrl, updatedAt: new Date() })
               .where(eq(globalConfigTable.key, "qr_logo_url"));
        } else {
             await db.insert(globalConfigTable).values({
                key: "qr_logo_url",
                value: publicUrl,
                updatedAt: new Date(),
             });
        }

        revalidatePath("/admin");
        return { success: true };

    } catch (e) {
        console.error("Upload failed", e);
        return { success: false, error: "Upload failed" };
    }
}

export async function getGlobalConfig(key: string) {
     try {
        const context = await getCloudflareContext({ async: true });
        const env = context.env as unknown as Env;
        const db = createDb(env);
        
        const record = await db.select().from(globalConfigTable).where(eq(globalConfigTable.key, key)).get();
        return record ? record.value : null;

     } catch(e) {
        console.error("Config fetch failed", e);
        return null;
     }
}
