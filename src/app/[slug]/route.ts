import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDb, type Env } from "@/db/client";

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

    if (result && result.originalUrl) {
      return NextResponse.redirect(result.originalUrl);
    }
    
    return new NextResponse("Link not found", { status: 404 });
    
  } catch (error) {
    console.error("Redirection error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
