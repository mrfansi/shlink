import { AdminSettings } from "@/components/features/admin-settings";
import { getGlobalConfig } from "@/app/actions/settings";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDb, type Env } from "@/db/client";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function AdminPage() {
    // Role Checks
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
        redirect("/sign-in");
    }

    const context = await getCloudflareContext({ async: true });
    const env = context.env as unknown as Env;
    const db = createDb(env);

    const currentUser = await db.select().from(user).where(eq(user.id, session.user.id)).get();
    
    // For MVP, if no role column or user is not admin, redirect. 
    // Wait, I just added role column.
    // If user is not admin, we could redirect to dashboard.
    // However, I don't have a way to Set Admin yet.
    // Temporary Hack: Allow access if Env Var ADMIN_EMAIL matches? 
    // Or just let it fail if role != admin (which will be true for all now).
    // Let's implement a "Lazy Admin" logic: If this is the FIRST user or matches ADMIN_EMAIL env, update role to admin.
    
    // const adminEmail = (env as any).ADMIN_EMAIL;
    // if (currentUser?.email === adminEmail && currentUser?.role !== 'admin') {
    //      await db.update(user).set({ role: 'admin' }).where(eq(user.id, currentUser!.id));
    // }
    
    if (currentUser?.role !== "admin") {
         // Fallback for demo: If user is me (the dev), allow. 
         // But better to just redirect to settings with "Unauthorized"
         // redirect("/settings"); 
         // Actually, let's just Render "Access Denied" for now to check if it works.
         return (
             <div className="flex h-[50vh] flex-col items-center justify-center gap-2">
                 <h1 className="text-2xl font-bold">Access Denied</h1>
                 <p className="text-muted-foreground">You do not have permission to view this page.</p>
                 <p className="text-sm text-muted-foreground">Current Role: {currentUser?.role || 'user'}</p>
             </div>
         )
    }

    const qrLogoUrl = await getGlobalConfig("qr_logo_url");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
                <p className="text-muted-foreground">System-wide configuration and settings.</p>
            </div>
            
            <AdminSettings currentLogoUrl={qrLogoUrl} />
        </div>
    );
}
