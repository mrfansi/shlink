import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDb, type Env } from "@/db/client";
import { apiKeys, links } from "@/db/schema"; // Ensure links is exported
import { generateShortCode } from "@/lib/utils";
import { z } from "zod";

const createSchema = z.object({
  url: z.string().url(),
  slug: z.string().min(3).optional(),
});

export async function POST(req: NextRequest) {
    // 1. Auth Check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const key = authHeader.replace("Bearer ", "");
    
    try {
        const context = await getCloudflareContext({ async: true });
        const env = context.env as unknown as Env;
        const db = createDb(env);
        
        const apiKey = await db.query.apiKeys.findFirst({
            where: (apiKeys, { eq }) => eq(apiKeys.key, key)
        });
        
        if (!apiKey) {
             return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
        }
        
        // 2. Body Validation
        const body = await req.json();
        const validation = createSchema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json({ error: "Invalid input", details: validation.error }, { status: 400 });
        }
        
        // 3. Logic (Simplified duplicate of actions.ts logic)
        let slug = validation.data.slug;
        
        if (slug) {
             const existing = await db.query.links.findFirst({
                where: (links, { eq }) => eq(links.slug, slug!)
             });
             if (existing) return NextResponse.json({ error: "Slug taken" }, { status: 409 });
        } else {
             slug = generateShortCode();
             // Retry logic omitted for brevity in MVP
        }
        
        const finalUrl = new URL(validation.data.url).toString();
        
        await db.insert(links).values({
            id: crypto.randomUUID(),
            slug,
            originalUrl: finalUrl,
            userId: apiKey.userId,
            createdAt: new Date(),
            isActive: true,
            clickCount: 0
        });
        
        // Construct response
        const shlinkUrl = `${req.nextUrl.protocol}//${req.headers.get("host")}/${slug}`;
        
        return NextResponse.json({
            success: true,
            data: {
                slug,
                url: finalUrl,
                shortUrl: shlinkUrl
            }
        });

    } catch (e) {
        console.error("API Error:", e);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
