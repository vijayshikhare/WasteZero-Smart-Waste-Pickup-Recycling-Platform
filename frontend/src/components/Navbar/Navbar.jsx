import { Bell, Search, UserCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          WasteZero Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search pickups, volunteers..."
            className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
          <Bell className="h-6 w-6 text-gray-600" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
            <p className="text-sm text-gray-500">{user?.role || 'Member'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold shadow-md">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}