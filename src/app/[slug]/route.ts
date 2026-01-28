import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDb, type Env } from "@/db/client";
import { trackClick } from "@/lib/analytics";

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const context = await getCloudflareContext({ async: true });
    const env = context.env as unknown as Env;
    
    if (!env || !env.shlink_db) {
      console.error("D1 binding missing");
      return new NextResponse("Service Unavailable", { status: 503 });
    }

    const db = createDb(env);
    
    const result = await db.query.links.findFirst({
      where: (links, { eq, and }) => and(
        eq(links.slug, slug),
        eq(links.isActive, true)
      ),
    });

    if (result) {
      // 0. Bot Detection for Metadata
      const userAgent = request.headers.get("user-agent")?.toLowerCase() || "";
      const isBot = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot|slackbot|skypeuripreview|iframely/.test(userAgent);
      
      if (isBot) {
           // Redirect to Metadata Proxy which returns static HTML with tags
           // We use the original URL as the source for metadata
           const proxyUrl = request.nextUrl.clone();
           proxyUrl.pathname = "/api/metadata";
           proxyUrl.searchParams.set("url", result.originalUrl);
           return NextResponse.redirect(proxyUrl);
      }

      // 1. Check Expiration
      if (result.expiresAt && result.expiresAt < new Date()) {
          const url = request.nextUrl.clone();
          url.pathname = `/expired`;
          return NextResponse.redirect(url);
      }

      // 2. Check Password Protection
      if (result.passwordHash) {
         // Check for access cookie
         const cookieVal = request.cookies.get(`link_access_${slug}`)?.value;
         // In a real app, verify the token signature/validity
         // MVP: Simple check if cookie exists and implies access (e.g., could be a hash of the slug + secret)
         // For now, we'll trust the presence if it matches a simple convention or delegate validation.
         // Let's assume the verify action sets a value "granted". 
         // Security Note: Use signed cookies in production.
         
         if (cookieVal !== "granted") {
             const url = request.nextUrl.clone();
             url.pathname = `/password/${slug}`;
             return NextResponse.redirect(url);
         }
      }

      // 3. Track & Redirect
      // Async Analytics Tracking
      // We pass the promise to waitUntil so it doesn't block the response
      context.ctx.waitUntil(trackClick(env, {
         slug,
         userAgent: request.headers.get("user-agent") || "",
         ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
         country: (request as any).cf?.country,
         city: (request as any).cf?.city,
         referrer: request.headers.get("referer") || undefined
      }));

      return NextResponse.redirect(result.originalUrl);
    }
    
    return new NextResponse("Link not found", { status: 404 });
    
  } catch (error) {
    console.error("Redirection error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
