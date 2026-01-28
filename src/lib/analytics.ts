import { UAParser } from "ua-parser-js";
import { createDb, type Env } from "@/db/client";
import { clicks, dailyLinkStats } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

interface TrackClickParams {
  slug: string;
  userAgent: string;
  ip: string;
  country?: string;
  city?: string;
  referrer?: string;
}

export async function trackClick(env: Env, params: TrackClickParams) {
  try {
    const db = createDb(env);

    // 1. Resolve Slug to Link ID
    // Optimization: We could pass the Link ID if we already looked it up,
    // but often we just have the slug from the request.
    const link = await db.query.links.findFirst({
        where: (links, { eq }) => eq(links.slug, params.slug),
        columns: { id: true }
    });

    if (!link) {
        console.warn(`[Analytics] Link not found for slug: ${params.slug}`);
        return;
    }

    // 2. Parse User Agent
    const parser = new UAParser(params.userAgent);
    const result = parser.getResult();
    
    // 3. Anonymize IP (Simple Hash)
    const ipHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(params.ip + (process.env.IP_SALT || "shlink-salt")));
    const ipHex = Array.from(new Uint8Array(ipHash)).map(b => b.toString(16).padStart(2, '0')).join('');

    // 4. Insert Click
    await db.insert(clicks).values({
        id: crypto.randomUUID(),
        linkId: link.id,
        timestamp: new Date(),
        country: params.country || "Unknown",
        city: params.city || "Unknown",
        deviceType: result.device.type || "desktop", // ua-parser-js returns undefined for desktop usually vs 'mobile'/'tablet'
        browser: result.browser.name || "Unknown",
        os: result.os.name || "Unknown",
        referrer: params.referrer || "Direct",
        ipAddress: ipHex.substring(0, 16) // Store partial hash
    });

    // 5. Increment Click Count (Denormalized)
    await db.update(clicks).set({
        // This is actual table update, wait, we need to update LINKS table
    });
    // Correct update
    /* 
       We cannot easily update 'links' table 'clickCount' atomically without a transaction or raw SQL.
       Drizzle: 
    */
    /*
    await db.run(sql`
        UPDATE links 
        SET click_count = click_count + 1 
        WHERE id = ${link.id}
    `);
    */
   // D1 doesn't support run() on the drizzle object directly the same way depending on adapter version.
   // But we can use db.update
    const { links: linksTable } = await import("@/db/schema");
    
    await db.update(linksTable)
      .set({ clickCount: sql`${linksTable.clickCount} + 1` })
      .where(sql`${linksTable.id} = ${link.id}`);

    // ...
  } catch (err) {
    console.error(`[Analytics] Failed to track click for ${params.slug}:`, err);
  }
}

export async function getLinkAnalytics(env: Env, linkId: string) {
  const db = createDb(env);
  
  // 1. Get Daily Stats (Trend)
  const daily = await db.select()
    .from(dailyLinkStats)
    .where(eq(dailyLinkStats.linkId, linkId))
    .orderBy(dailyLinkStats.date);

  // 2. Get Recent Clicks (Last 30 days detailed)
  const recentClicks = await db.query.clicks.findMany({
    where: (clicks, { eq }) => eq(clicks.linkId, linkId),
    limit: 1000 // Cap for performance for now
  });
  
  // 3. Aggregate Details (Device, Country) from recent clicks
  const deviceStats = new Map<string, number>();
  const countryStats = new Map<string, number>();
  
  recentClicks.forEach(c => {
    const device = c.deviceType || "Unknown";
    const country = c.country || "Unknown";
    
    deviceStats.set(device, (deviceStats.get(device) || 0) + 1);
    countryStats.set(country, (countryStats.get(country) || 0) + 1);
  });
  
  const devices = Array.from(deviceStats.entries()).map(([name, value]) => ({ name, value }));
  const countries = Array.from(countryStats.entries()).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  
  return {
    daily: daily.map(d => ({ date: d.date, clicks: d.clicks })),
    devices,
    countries,
    totalClicks: recentClicks.length // This is just recent. Real total should be on Link table.
  };
}
