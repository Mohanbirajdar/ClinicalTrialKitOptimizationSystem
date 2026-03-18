import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      {/* md:ml-64 — desktop only; on mobile sidebar is an overlay */}
      <main className="flex-1 md:ml-64 min-h-screen min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
