import { Recycle, Plus } from 'lucide-react';

export default function Pickups() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Pickups</h1>
        <button className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
          <Plus size={18} /> Schedule Pickup
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <Recycle className="h-16 w-16 mx-auto text-green-500 mb-6" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
          No pickups scheduled
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Start managing waste collection schedules for your community.
        </p>
        <button className="bg-green-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors">
          Schedule First Pickup
        </button>
      </div>
    </div>
  );
}