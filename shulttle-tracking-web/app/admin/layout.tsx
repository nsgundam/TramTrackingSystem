import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar (Fixed width 64) */}
      <Sidebar />

      {/* Main Content Area */}
      {/* ml-64 คือเว้นระยะซ้าย 64 หน่วย (เท่าความกว้าง Sidebar) เพื่อไม่ให้เนื้อหาทับกัน */}
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}