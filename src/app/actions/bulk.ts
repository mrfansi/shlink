"use server";

import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDb, type Env } from "@/db/client";
import { links } from "@/db/schema";
import { headers } from "next/headers";
import { generateShortCode } from "@/lib/utils";

interface CsvRow {
    url: string;
    slug?: string;
}

export async function bulkCreateLinks(rows: CsvRow[]) {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Unauthorized" };

    if (rows.length > 1000) {
        try {
            const context = await getCloudflareContext({ async: true });
            const env = context.env as unknown as Env;
            
            if (env.shlink_queue) {
                 const chunkSize = 100;
                 
                 for (let i = 0; i < rows.length; i += chunkSize) {
                     const batchRows = rows.slice(i, i + chunkSize);
                     
                     // Send batch of individual messages to queue
                     await env.shlink_queue.sendBatch(batchRows.map(row => ({
                        body: {
                            userId: session.user.id,
                            url: row.url,
                            slug: row.slug
                        },
                        contentType: "json"
                     })));
                 }
                 
                 return { success: true, message: "Large batch accepted for background processing." };
            }
        } catch (e) {
            console.error("Queue error:", e);
            return { success: false, error: "Failed to queue large batch" };
        }
    }

    try {
        const context = await getCloudflareContext({ async: true });
        const env = context.env as unknown as Env;
        const db = createDb(env);
        
        const results = [];
        let successCount = 0;
        let failCount = 0;

        // Naive iteration for MVP.
        // For larger bulks, we should use batch insert or queue.
        for (const row of rows) {
             let slug = row.slug;
             if (!slug) slug = generateShortCode();

             try {
                // Check collision if custom slug - simplified check, assume unique if generated
                // For bulk, let's just try insert and catch error if needed or pre-check
                // Drizzle insert().values().onConflictDoNothing() might not return what we need.
                
                // Let's rely on validation in loop
                await db.insert(links).values({
                    id: crypto.randomUUID(),
                    slug,
                    originalUrl: row.url,
                    userId: session.user.id,
                    createdAt: new Date(),
                    isActive: true,
                    clickCount: 0
                });
                successCount++;
                results.push({ url: row.url, slug, status: "success" });
             } catch (e) {
                 failCount++;
                 results.push({ url: row.url, error: "Failed (collision or invalid)", status: "error" });
             }
        }
        
        return { success: true, stats: { successCount, failCount }, results };

    } catch (e) {
        console.error("Bulk error:", e);
        return { success: false, error: "Bulk process failed" };
    }
}
