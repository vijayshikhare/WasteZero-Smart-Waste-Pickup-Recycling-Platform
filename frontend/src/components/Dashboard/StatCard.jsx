export default function StatCard({ title, value, icon: Icon, color = "green" }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-4 rounded-xl bg-${color}-50 text-${color}-600`}>
          <Icon size={28} />
        </div>
      </div>
    </div>
  );
}