
"use client";

import { ReportsSubNav } from '@/components/reports/ReportsSubNav';

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1">
      <aside className="hidden md:flex md:w-64 flex-col border-r bg-background p-4">
        <ReportsSubNav />
      </aside>
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        {children}
      </main>
      {/* TODO: Add a drawer or alternative navigation for mobile for ReportsSubNav */}
    </div>
  );
}
