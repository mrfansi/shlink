import React from 'react';
import Link from 'next/link';
import { Home, LineChart, Settings, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAuth } from '@/lib/auth';
import { headers } from 'next/headers';
import { UserMenu } from '@/components/features/user-menu';
import { redirect } from 'next/navigation';

export const metadata = {
  title: "Dashboard | Shlink",
  description: "Manage your links and view analytics.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
      redirect("/sign-in");
  }

  return (
    <div className="flex h-screen bg-muted/10">
      <aside className="w-64 bg-background border-r hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/" className="font-bold text-lg flex items-center gap-2">
            Shlink <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Pro</span>
          </Link>
        </div>
        <div className="flex-1 py-4 flex flex-col justify-between">
          <nav className="space-y-1 px-4">
             <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start">
                    <Home className="mr-2 h-4 w-4" />
                    Links
                </Button>
             </Link>
             <Link href="/dashboard/settings">
                <Button variant="ghost" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                </Button>
             </Link>
             <Link href="/dashboard/admin">
                <Button variant="ghost" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin
                </Button>
             </Link>
          </nav>

          <div className="px-4 py-4 border-t">
              <div className="flex items-center gap-3">
                  <UserMenu user={session.user} />
                  <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium truncate">{session.user.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{session.user.email}</span>
                  </div>
              </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
            {children}
        </div>
      </main>
    </div>
  );
}
