// src/components/Sidebar/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Recycle, Users, Building2, FileBarChart, 
  Settings, LogOut, ChevronLeft, ChevronRight, Briefcase, HeartHandshake 
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isNGO = user?.role === 'ngo';
  const isVolunteer = user?.role === 'volunteer';

  // Shared items
  const commonNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/dashboard/pickups', label: 'Pickups', icon: Recycle },
    { path: '/dashboard/volunteers', label: 'Volunteers', icon: Users },
    { path: '/dashboard/ngos', label: 'NGOs', icon: Building2 },
    { path: '/dashboard/reports', label: 'Reports', icon: FileBarChart },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  // Volunteer-specific
  const volunteerItems = [
    { path: '/dashboard/opportunities', label: 'Opportunities', icon: Briefcase },
    { path: '/dashboard/my-applications', label: 'My Applications', icon: HeartHandshake },
  ];

  // NGO-specific
  const ngoItems = [
    { path: '/dashboard/opportunities', label: 'Opportunities', icon: Briefcase },
    { path: '/dashboard/my-posted', label: 'My Posted', icon: FileBarChart },
  ];

  const navItems = [
    ...commonNavItems,
    ...(isVolunteer ? volunteerItems : []),
    ...(isNGO ? ngoItems : []),
  ];

  const goToProfile = () => navigate('/profile');

  return (
    <aside 
      className={`
        bg-gradient-to-b from-emerald-950 to-green-950 
        text-white h-screen transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-72'}
        relative shadow-2xl shadow-green-950/40 z-30 flex flex-col
      `}
    >
      {/* Logo & Collapse Toggle */}
      <div className="p-6 flex items-center justify-between border-b border-green-800/40">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <Recycle className="h-8 w-8 text-green-400 animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tight">WasteZero</h1>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-full hover:bg-green-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="mt-6 px-3 flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-green-700/80 text-white font-medium shadow-md' 
                  : 'text-green-100 hover:bg-green-800/60 hover:text-white'
              }`
            }
          >
            <item.icon className={`h-5 w-5 min-w-[20px] ${isCollapsed ? 'mx-auto' : ''}`} />
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-6 border-t border-green-800/40 mt-auto">
        <button
          onClick={goToProfile}
          className="w-full flex items-center gap-3 mb-5 p-2 rounded-xl hover:bg-green-800/40 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-green-500"
          title="View / Edit Profile"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0 overflow-hidden border-2 border-green-500/30">
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt={user.name || "Profile"}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = ''; }} // fallback to initial
              />
            ) : (
              (user?.name?.[0] ?? 'U').toUpperCase()
            )}
          </div>

          {!isCollapsed && (
            <div className="overflow-hidden min-w-0">
              <p className="font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-green-300 truncate">{user?.email}</p>
              <p className="text-xs text-green-400 capitalize mt-0.5">{user?.role || 'User'}</p>
            </div>
          )}
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-5 py-3 rounded-xl text-red-300 hover:bg-red-900/30 hover:text-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}