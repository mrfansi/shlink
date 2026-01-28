"use server";

import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDb, type Env } from "@/db/client";
import { links } from "@/db/schema";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { hash } from "bcrypt-ts";

const updateSchema = z.object({
    linkId: z.string(),
    originalUrl: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    password: z.string().optional(),
    expiresAt: z.string().optional(), // ISO date string or empty
});

export async function updateLink(data: z.infer<typeof updateSchema>) {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const validation = updateSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.message };
    }

    const { linkId, originalUrl, tags, isActive, password, expiresAt } = validation.data;

    try {
        const context = await getCloudflareContext({ async: true });
        const env = context.env as unknown as Env;
        const db = createDb(env);

        const link = await db.query.links.findFirst({
            where: (links, { eq }) => eq(links.id, linkId),
        });

        if (!link) return { success: false, error: "Link not found" };

        if (link.userId !== session.user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const updates: any = {};
        if (originalUrl) updates.originalUrl = originalUrl;
        if (tags) updates.tags = tags;
        if (isActive !== undefined) updates.isActive = isActive;
        if (password) {
            updates.passwordHash = await hash(password, 10);
        }
        if (expiresAt !== undefined) {
             updates.expiresAt = expiresAt ? new Date(expiresAt) : null;
        }

        updates.updatedAt = new Date(); // Warning: schema might not have updatedAt for links, let's check. 
        // Schema definition for 'links' in turn 265:
        // 70: export const links = sqliteTable("links", {
        // ...
        // 75: 	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
        // 76: 	expiresAt: integer("expires_at", { mode: "timestamp" }),
        // ...
        // There is NO updatedAt in links schema shown in turn 265. So I will remove it.

        delete updates.updatedAt; 

        if (Object.keys(updates).length > 0) {
            await db.update(links)
                .set(updates)
                .where(eq(links.id, linkId));
        }

        return { success: true };

    } catch (e) {
        console.error("Update failed:", e);
        return { success: false, error: "Update failed" };
    }
}
