import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen text-gray-100 overflow-hidden glass-ambient-bg" style={{ background: '#060B14' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0 overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

