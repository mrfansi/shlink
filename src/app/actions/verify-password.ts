"use server";

import { compare } from "bcrypt-ts";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDb, type Env } from "@/db/client";
import { cookies } from "next/headers";

export async function verifyLinkPassword(slug: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const context = await getCloudflareContext({ async: true });
    const env = context.env as unknown as Env;
    
    // Fallback env check if local without context?
    // Drizzle setup handles it.
    
    const db = createDb(env);
    
    const link = await db.query.links.findFirst({
        where: (links, { eq }) => eq(links.slug, slug),
        columns: { id: true, passwordHash: true }
    });

    if (!link) return { success: false, error: "Link not found" };
    if (!link.passwordHash) return { success: true }; // No password needed

    const isValid = await compare(password, link.passwordHash);
    
    if (isValid) {
        // Set cookie
        const cookieStore = await cookies();
        cookieStore.set(`link_access_${slug}`, "granted", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 // 1 day access
        });
        return { success: true };
    } else {
        return { success: false, error: "Incorrect password" };
    }

  } catch (err) {
      console.error("Password verification failed", err);
      return { success: false, error: "Verification failed" };
  }
}
