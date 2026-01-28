import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function rateLimit(ip: string, limit: number = 10, windowSeconds: number = 1): Promise<boolean> {
  try {
     const context = await getCloudflareContext({ async: true });
     const env = context.env as unknown as { shlink_kv: KVNamespace };
     
     if (!env.shlink_kv) {
        // console.warn("KV binding not found for rate limiting");
        return true; // Fail open if no KV
     }
     
     const now = Math.floor(Date.now() / 1000);
     const key = `rl:${ip}:${now}`;
     
     const current = await env.shlink_kv.get(key);
     const count = current ? parseInt(current) : 0;
     
     if (count >= limit) return false;
     
     // Increment
     // Note: This is not atomic, so technically can be exceeded in high concurrency, 
     // but good enough for soft limiting 10rps vs 1000rps.
     // For strict accounting, Durable Objects are preferred.
     await env.shlink_kv.put(key, (count + 1).toString(), { expirationTtl: windowSeconds + 10 });
     
     return true;
  } catch (e) {
     console.error("Rate limit error", e);
     return true; // Fail open
  }
}
