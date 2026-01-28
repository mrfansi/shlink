import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { type Env } from "@/db/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const context = await getCloudflareContext({ async: true });
    const env = context.env as unknown as Env;

    if (!env.shlink_assets) {
      return new NextResponse("Storage not configured", { status: 500 });
    }

    const object = await env.shlink_assets.get(key);

    if (!object) {
      return new NextResponse("File not found", { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(object.body, {
      headers,
    });
  } catch (error) {
    console.error("Asset fetch failed", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
