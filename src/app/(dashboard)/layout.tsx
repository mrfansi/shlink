import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-muted/10">
      <aside className="w-64 bg-background border-r hidden md:block flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <span className="font-bold text-lg">Shlink</span>
        </div>
        <div className="flex-1 py-4">
          <nav className="space-y-1 px-4">
            {/* Navigation items will be added in Phase 6 */}
          </nav>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
