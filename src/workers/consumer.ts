import { createDb, Env } from "@/db/client";
import { links } from "@/db/schema";
import { generateShortCode } from "@/lib/utils";

interface QueueMessage {
    userId: string;
    url: string;
    slug?: string;
}

export default {
    async queue(batch: MessageBatch<QueueMessage>, env: Env): Promise<void> {
        const db = createDb(env);
        
        // Process each message
        for (const message of batch.messages) {
             try {
                const body = message.body;
                let slug = body.slug;
                if (!slug) slug = generateShortCode();
                
                // Insert
                await db.insert(links).values({
                    id: crypto.randomUUID(),
                    slug,
                    originalUrl: body.url,
                    userId: body.userId,
                    createdAt: new Date(),
                    isActive: true,
                    clickCount: 0
                }).onConflictDoNothing();
                
                message.ack();
             } catch (e) {
                 console.error("Failed to process message", e);
                 // If retry is needed: message.retry();
             }
        }
    }
}
