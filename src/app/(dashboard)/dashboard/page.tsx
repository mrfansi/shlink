import { LinkList } from "@/components/features/link-list";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDb, type Env } from "@/db/client";
import { links } from "@/db/schema";
import { desc, eq } from "drizzle-orm"; // Import desc, eq explicitly

export default async function DashboardPage() {
    const auth = await getAuth();
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session) {
        redirect("/sign-in");
    }

    const context = await getCloudflareContext({ async: true });
    const env = context.env as unknown as Env;
    const db = createDb(env);

    // Fetch Links
    const userLinks = await db.query.links.findMany({
        where: (fields, { eq }) => eq(fields.userId, session.user.id),
        orderBy: (fields, { desc }) => [desc(fields.createdAt)],
        limit: 100 
    });

    // Fetch Global Logo
    // Use try-catch as globalConfig might not be in query interface if types aren't perfect
    let logoUrl: string | undefined;
    try {
        const logoConfig = await db.query.globalConfig.findFirst({
            where: (idx, { eq }) => eq(idx.key, "qr_logo_url")
        });
        logoUrl = logoConfig?.value;
    } catch (e) {
        // Fallback or ignore
    }
    
    // Construct Base URL
    const host = headersList.get("host") || "localhost:3000";
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Manage your shortened links.</p>
            </div>
            
            <LinkList links={userLinks} baseUrl={baseUrl} logoUrl={logoUrl} />
        </div>
    );
}
