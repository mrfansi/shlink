"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDb, type Env } from "@/db/client";
import { links } from "@/db/schema";
import { generateShortCode } from "@/lib/utils";
import { z } from "zod";
import { generateQRCode } from "@/lib/qr-code";
import { headers } from "next/headers";

import { customSlugSchema, utmParamsSchema } from "@/lib/validators";
import { eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";

const createLinkSchema = z.object({
  originalUrl: z.string().url("Invalid URL provided"),
  slug: customSlugSchema.optional().or(z.literal("")),
  ...utmParamsSchema.shape,
});

export type CreateLinkResult = 
  | { success: true; slug: string; originalUrl: string; shortUrl: string; qrCode: string }
  | { success: false; error: string };

export async function createLink(formData: FormData): Promise<CreateLinkResult> {
  const rawData = {
    originalUrl: formData.get("originalUrl") as string,
    slug: formData.get("slug") as string,
    utm_source: formData.get("utm_source") as string,
    utm_medium: formData.get("utm_medium") as string,
    utm_campaign: formData.get("utm_campaign") as string,
    utm_term: formData.get("utm_term") as string,
    utm_content: formData.get("utm_content") as string,
  };

  const validation = createLinkSchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  let finalUrl: URL;
  try {
    finalUrl = new URL(validation.data.originalUrl);
    if (validation.data.utm_source) finalUrl.searchParams.set("utm_source", validation.data.utm_source);
    if (validation.data.utm_medium) finalUrl.searchParams.set("utm_medium", validation.data.utm_medium);
    if (validation.data.utm_campaign) finalUrl.searchParams.set("utm_campaign", validation.data.utm_campaign);
    if (validation.data.utm_term) finalUrl.searchParams.set("utm_term", validation.data.utm_term);
    if (validation.data.utm_content) finalUrl.searchParams.set("utm_content", validation.data.utm_content);
  } catch (e) {
    return { success: false, error: "Invalid URL" };
  }

  try {
    const context = await getCloudflareContext({ async: true });
    const env = context.env as unknown as Env;
    
    if (!env || !env.shlink_db) {
       console.error("Database binding 'shlink_db' not found");
       return { success: false, error: "System configuration error" };
    }
    
    const db = createDb(env);
    
    let slug = validation.data.slug;

    if (slug) {
      // Check for collision
      const existing = await db.query.links.findFirst({
        where: (links, { eq }) => eq(links.slug, slug!)
      });
      
      if (existing) {
        return { success: false, error: "Custom slug is already taken" };
      }
    } else {
      // Generate unique slug
      let retries = 5;
      while (retries > 0) {
        slug = generateShortCode();
        const existing = await db.query.links.findFirst({
           where: (links, { eq }) => eq(links.slug, slug!)
        });
        if (!existing) break;
        retries--;
      }
      
      if (retries === 0) {
         return { success: false, error: "Failed to generate unique slug. Please try again." };
      }
    }
    
    // Safety check just in case logic failed
    if (!slug) throw new Error("Slug generation failed");

    // Get Auth Session
    const auth = await getAuth();
    const session = await auth.api.getSession({
        headers: await headers()
    });

    await db.insert(links).values({
      id: crypto.randomUUID(),
      slug,
      originalUrl: finalUrl.toString(),
      userId: session?.user?.id,
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
      originalUrl: finalUrl.toString(),
      shortUrl,
      qrCode
    };
    
  } catch (error) {
    console.error("Failed to create link:", error);
    return { success: false, error: "Failed to create short link. Please try again." };
  }
}

export async function deleteLink(linkId: string) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

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

    await db.delete(links).where(eq(links.id, linkId));
    
    return { success: true };
  } catch (error) {
      console.error("Delete failed:", error);
      return { success: false, error: "Delete failed" };
  }
}
