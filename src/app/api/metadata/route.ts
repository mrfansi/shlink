import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");

    if (!url) {
        return new NextResponse("Missing url param", { status: 400 });
    }

    try {
        // Simple fetch
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Shlink-Metadata-Bot/1.0"
            }
        });
        
        if (!res.ok) {
            return new NextResponse("Failed to fetch URL", { status: 424 });
        }
        
        const html = await res.text();
        
        // Simple regex extraction
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) 
                              || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i);
        const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i)
                        || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i);

        const title = titleMatch ? titleMatch[1].trim() : "";
        const description = descriptionMatch ? descriptionMatch[1].trim() : "";
        const image = imageMatch ? imageMatch[1].trim() : "";

        return NextResponse.json({
            title,
            description,
            image
        });

    } catch (e) {
        console.error("Metadata fetch error:", e);
        return new NextResponse("Error fetching metadata", { status: 500 });
    }
}
