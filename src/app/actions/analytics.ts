"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDb, type Env } from "@/db/client";
import { getLinkAnalytics } from "@/lib/analytics";

export async function exportAnalyticsCsv(linkId: string) {
  try {
    const context = await getCloudflareContext({ async: true });
    const env = context.env as unknown as Env;
    
    // We export detailed click logs for the user to analyze
    // Re-implementing a simple fetch of clicks here because getLinkAnalytics aggregates
    // But typically export means "Raw Data" or "Detailed Report".
    // Let's export the recent raw clicks + daily summary.
    
    const db = createDb(env);
    
    // Fetch raw clicks (limit 1000 or 5000)
    const clicks = await db.query.clicks.findMany({
        where: (clicks, { eq }) => eq(clicks.linkId, linkId),
        orderBy: (clicks, { desc }) => desc(clicks.timestamp),
        limit: 5000
    });
    
    if (!clicks || clicks.length === 0) {
        return { error: "No data found" };
    }
    
    // Manual CSV generation
    const header = "Timestamp,IP (Anonymized),Country,City,Device,OS,Browser,Referrer\n";
    const rows = clicks.map(c => {
        const ts = c.timestamp.toISOString();
        const ip = c.ipAddress || "";
        const country = (c.country || "").replace(/,/g, " ");
        const city = (c.city || "").replace(/,/g, " ");
        const device = (c.deviceType || "").replace(/,/g, " ");
        const os = (c.os || "").replace(/,/g, " ");
        const browser = (c.browser || "").replace(/,/g, " ");
        const ref = (c.referrer || "").replace(/,/g, " ");
        
        return `${ts},${ip},${country},${city},${device},${os},${browser},${ref}`;
    }).join("\n");
    
    const csvContent = header + rows;
    
    return { csv: csvContent, filename: `analytics-${linkId}-${new Date().toISOString().split("T")[0]}.csv` };

  } catch (err) {
      console.error("Export failed:", err);
      return { error: "Export failed" };
  }
}
