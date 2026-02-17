export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Overview Dashboard</h1>
      
      {/* Stats Cards ตัวอย่าง */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-slate-500 text-sm font-medium">Total Vehicles</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">5</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-slate-500 text-sm font-medium">Active Routes</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">3</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-slate-500 text-sm font-medium">Active Trips</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">2</p>
        </div>
      </div>
    </div>
  );
}