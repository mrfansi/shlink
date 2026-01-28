import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDb, type Env } from "@/db/client";
import { clicks, dailyLinkStats } from "@/db/schema";
import { sql, and, lt, gte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  // Security check: ensure this is triggered by cron or authorized internal request
  // For Cloudflare Cron Triggers hitting a worker, they usually don't hit a Next.js route unless configured via Fetch event.
  // Standard practice: check for a shared secret header (CRON_SECRET).
  
  const authHeader = request.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Allow if no secret configured (dev mode) or match
      // If secret IS configured, must match.
       return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const context = await getCloudflareContext({ async: true });
    const env = context.env as unknown as Env;
    if (!env?.shlink_db) throw new Error("DB missing");
    
    const db = createDb(env);
    
    // 1. Determine "Yesterday" range
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Start of yesterday (00:00:00)
    const startOfYesterday = new Date(yesterday);
    startOfYesterday.setHours(0, 0, 0, 0);
    
    // End of yesterday (23:59:59)
    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);
    
    const dateKey = startOfYesterday.toISOString().split("T")[0]; // YYYY-MM-DD
    
    // 2. Aggregate Clicks
    // Drizzle with SQLite aggregation
    // SELECT link_id, COUNT(*) as count, json_group_array(...) 
    // Complex aggregation might be easier with raw SQL or multiple queries.
    // Let's do a simple count per link first.
    
    /* 
      We want:
      - Total clicks per link
      - (Optional) Metadata breakdown (OS/Country)
    */
   
    // Let's settle for just moving total counts + basic JSON metadata if possible.
    // Simpler approach for MVP: Just Aggregate counts.
    
    const aggregated = await db
        .select({
            linkId: clicks.linkId,
            count: sql<number>`count(*)`
        })
        .from(clicks)
        .where(
            and(
                gte(clicks.timestamp, startOfYesterday),
                lt(clicks.timestamp, endOfYesterday)
            )
        )
        .groupBy(clicks.linkId);
        
    // 3. Insert into daily_link_stats
    const inserts = aggregated.map(stat => {
        if (!stat.linkId) return null;
        return {
            id: crypto.randomUUID(),
            linkId: stat.linkId,
            date: dateKey,
            clicks: stat.count,
            metadata: {} // TODO: Add detailed breakdown if needed
        };
    }).filter(Boolean) as typeof dailyLinkStats.$inferInsert[];
    
    if (inserts.length > 0) {
        // Batch insert
        // SQLite limit is usually 999 variables per query. Be comfortable with smaller batches or just Promise.all
        // inserts.length could be large.
        // Let's chunk it.
        const CHUNK_SIZE = 50;
        for (let i = 0; i < inserts.length; i += CHUNK_SIZE) {
            await db.insert(dailyLinkStats).values(inserts.slice(i, i + CHUNK_SIZE));
        }
    }
    
    // 4. Prune old data (> 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    await db.delete(clicks).where(lt(clicks.timestamp, thirtyDaysAgo));
    
    return NextResponse.json({ 
        success: true, 
        processed: inserts.length, 
        date: dateKey 
    });

  } catch (err) {
      console.error("Aggregation failed:", err);
      return new NextResponse("Internal Error", { status: 500 });
  }
}
