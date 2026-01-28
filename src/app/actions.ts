"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDb, type Env } from "@/db/client";
import { links } from "@/db/schema";
import { generateShortCode } from "@/lib/utils";
import { z } from "zod";
import { generateQRCode } from "@/lib/qr-code";
import { headers } from "next/headers";

const createLinkSchema = z.object({
  originalUrl: z.string().url("Invalid URL provided"),
});

export type CreateLinkResult = 
  | { success: true; slug: string; originalUrl: string; shortUrl: string; qrCode: string }
  | { success: false; error: string };

export async function createLink(formData: FormData): Promise<CreateLinkResult> {
  const originalUrl = formData.get("originalUrl") as string;
  
  const validation = createLinkSchema.safeParse({ originalUrl });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  try {
    const context = await getCloudflareContext({ async: true });
    const env = context.env as unknown as Env;
    
    if (!env || !env.shlink_db) {
       console.error("Database binding 'shlink_db' not found");
       return { success: false, error: "System configuration error" };
    }
    
    const db = createDb(env);
    
    // TODO: Collision check for US2
    const slug = generateShortCode(); 
    
    await db.insert(links).values({
      id: crypto.randomUUID(),
      slug,
      originalUrl: validation.data.originalUrl,
      createdAt: new Date(),
      isActive: true,
      clickCount: 0
    });

    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const shortUrl = `${protocol}://${host}/${slug}`;
    
    const qrCode = await generateQRCode(shortUrl);

    return { 
      success: true, 
      slug, 
      originalUrl: validation.data.originalUrl,
      shortUrl,
      qrCode
    };
    
  } catch (error) {
    console.error("Failed to create link:", error);
    return { success: false, error: "Failed to create short link. Please try again." };
  }
}
