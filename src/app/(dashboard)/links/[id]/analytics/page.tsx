import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDb, type Env } from "@/db/client";
import { getLinkAnalytics } from "@/lib/analytics";
import { AnalyticsCharts } from "@/components/features/analytics-charts";
import { notFound, redirect } from "next/navigation";
import { getAuth } from "@/lib/auth"; 
import { headers } from "next/headers";
import { ExportButton } from "@/components/features/export-button";

export default async function AnalyticsPage({ params }: { params: { id: string } }) {
  const { id } = params;

  // 1. Auth Check - Optional for public analytics, but if strict:
  /*
  const auth = await getAuth();
  const session = await auth.api.getSession({
      headers: await headers()
  });
  // if (!session) redirect("/sign-in");
  */

  const context = await getCloudflareContext({ async: true });
  const env = context.env as unknown as Env;
  const db = createDb(env);

  const link = await db.query.links.findFirst({
      where: (links, { eq }) => eq(links.id, id)
  });

  if (!link) notFound();

  // TODO: Verify ownership if we implement user scoping strictly.
  // For now, if you know the ID and are logged in (protected by middleware), you can see it?
  // Ideally: if (link.userId !== session.user.id) notFound();
  
  // 2. Fetch Data
  const stats = await getLinkAnalytics(env, id);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Stats for <span className="font-mono text-primary">{link.slug}</span> ({link.originalUrl})
          </p>
        </div>
        
        <form action={async () => {
             "use server";
             // Streaming response or redirecting to download url?
             // Server Actions cannot easily download files directly without client handling.
             // We'll leave the button as a form trigger but we need a client component to handle the blob.
             // Alternative: Link to an API route /api/links/[id]/export
        }}>
           {/* Placeholder for Export Button - Implementing proper download requires client interaction */}
           {/* We will use a dedicated Client Component for the header actions if needed, or just a simple API link */}
            <ExportButton linkId={id} />
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Clicks (All Time)" value={link.clickCount || 0} />
        <StatCard title="Recent Clicks (30d)" value={stats.totalClicks} />
        <StatCard title="Last CLick" value="Just now" /> {/* Placeholder */}
        <StatCard title="Active Status" value={link.isActive ? "Active" : "Archived"} />
      </div>

      <AnalyticsCharts 
        dailyStats={stats.daily} 
        deviceStats={stats.devices} 
        countryStats={stats.countries} 
      />
    </div>
  );
}

function StatCard({ title, value }: { title: string, value: string | number }) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
       <div className="text-sm font-medium text-muted-foreground">{title}</div>
       <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
  )
}


