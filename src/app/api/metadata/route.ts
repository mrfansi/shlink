import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { type Env } from "@/db/client";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");

    if (!url) {
        return new NextResponse("Missing url param", { status: 400 });
    }

    try {
        const context = await getCloudflareContext({ async: true });
        const env = context.env as unknown as Env;

        // 1. Check Cache (KV)
        // Key: metadata:{url_hash} OR just metadata:{url} if safe
        const cacheKey = `meta:${btoa(url)}`;
        let cachedHTML: string | null = null;
        
        if (env.shlink_kv) {
             cachedHTML = await env.shlink_kv.get(cacheKey);
             if (cachedHTML) {
                 return new NextResponse(cachedHTML, {
                     headers: { "Content-Type": "text/html" }
                 });
             }
        }

        // 2. Fetch External URL
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Shlink-Metadata-Bot/1.0 (Mozilla/5.0 compatible)"
            }
        });
        
        if (!res.ok) {
            return new NextResponse("Failed to fetch URL", { status: 424 });
        }
        
        const html = await res.text();
        
        // 3. Extract Metadata
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) 
                              || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i);
        const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i)
                        || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i);

        const title = titleMatch ? titleMatch[1].trim() : "Link";
        const description = descriptionMatch ? descriptionMatch[1].trim() : "Shared link";
        const image = imageMatch ? imageMatch[1].trim() : "";

        // 4. Construct HTML Response
        // We return a minimal HTML page with just the meta tags
        // This allows social bots to parse it.
        const responseHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${image}">
</head>
<body>
    <script>window.location.href = "${url}";</script>
</body>
</html>`;

        // 5. Cache & Return
        if (env.shlink_kv) {
            // Cache for 24 hours
            await env.shlink_kv.put(cacheKey, responseHTML, { expirationTtl: 86400 });
        }

        return new NextResponse(responseHTML, {
            headers: { "Content-Type": "text/html" }
        });

    } catch (e) {
        console.error("Metadata fetch error:", e);
        return new NextResponse("Error fetching metadata", { status: 500 });
    }
}
