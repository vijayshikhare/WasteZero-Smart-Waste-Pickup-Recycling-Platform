// src/components/Sidebar/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Recycle, Users, Building2, FileBarChart, 
  Settings, LogOut, ChevronLeft, ChevronRight, Briefcase, 
  HeartHandshake, PlusCircle, UserCircle, BarChart, Activity, Mail
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout, loading: authLoading, api } = useAuth();
  const [stats, setStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(false);
  const navigate = useNavigate();

  // Debug (remove in production)
  // console.log('[Sidebar] user:', user, 'authLoading:', authLoading);

  if (authLoading) {
    return (
      <aside className="bg-gradient-to-b from-emerald-950 to-green-950 text-white h-screen w-72 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-green-400 mb-4" />
        <p className="text-green-300">Loading...</p>
      </aside>
    );
  }

  // If somehow no user in protected area → redirect handled by ProtectedRoute, but show fallback
  if (!user) {
    return (
      <aside className="bg-gradient-to-b from-emerald-950 to-green-950 text-white h-screen w-72 flex flex-col items-center justify-center p-6 text-center">
        <UserCircle className="h-16 w-16 text-red-400 mb-4" />
        <p className="text-red-300 mb-4">Session expired or not authenticated</p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
        >
          Go to Login
        </button>
      </aside>
    );
  }

  const isNGO = user.role === 'ngo';
  const isVolunteer = user.role === 'volunteer';

  const dashboardPath = user.role === 'admin' ? '/admin-dashboard' : user.role === 'ngo' ? '/ngo-dashboard' : user.role === 'volunteer' ? '/user-dashboard' : '/dashboard';

  const navItems = [
    // Always visible (role-specific dashboard path)
    { path: dashboardPath, label: 'Dashboard', icon: LayoutDashboard, exact: true },

    // Volunteer-specific
    ...(isVolunteer ? [
      { path: '/opportunities', label: 'Browse Opportunities', icon: Briefcase },
      { path: '/dashboard/my-applications', label: 'My Applications', icon: HeartHandshake },
    ] : []),

    // NGO-specific
    ...(isNGO ? [
      { path: '/dashboard/opportunities', label: 'My Opportunities', icon: Briefcase },
      { path: '/dashboard/opportunities/create', label: 'Create New', icon: PlusCircle },
      // posted history is same as My Opportunities (route '/dashboard/opportunities')
    ] : []),

    // Admin-specific
    ...(user.role === 'admin' ? [
      { path: '/admin-dashboard', label: 'Control Panel', icon: Settings, badge: true },
      { path: '/admin/users', label: 'User Management', icon: Users },
      { path: '/admin/analytics', label: 'Analytics', icon: BarChart },
      { path: '/admin-dashboard', label: 'System Health', icon: Activity },
    ] : []),

    // Shared / admin-visible
    { path: '/dashboard/pickups', label: 'Pickups', icon: Recycle },
    ...(isNGO || user.role === 'admin' ? [
      { path: '/dashboard/volunteers', label: 'Volunteers', icon: Users },
      { path: '/dashboard/ngos', label: 'NGOs', icon: Building2 },
      { path: '/dashboard/reports', label: 'Reports', icon: FileBarChart },
    ] : []),
    // messaging (all roles)
    { path: '/chat', label: 'Messages', icon: Mail },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  // Fetch small role-specific stats for sidebar badges
  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      if (!user || !api) return;
      setStatsLoading(true);
      try {
        if (user.role === 'volunteer') {
          const [userRes, unreadRes] = await Promise.all([
            api.get('/api/user/dashboard/stats').catch(() => ({ data: {} })),
            api.get('/api/notifications/unread-count').catch(() => ({ data: { count: 0 } })),
          ]);
          if (!mounted) return;
          setStats({
            applications: userRes.data?.applications || userRes.data?.applicationCount || 0,
            pickups: userRes.data?.pickups || 0,
            unread: unreadRes.data?.count ?? 0,
          });
        } else if (user.role === 'ngo') {
          const [ngoRes, unreadRes] = await Promise.all([
            api.get('/api/ngo/dashboard/stats').catch(() => ({ data: {} })),
            api.get('/api/notifications/unread-count').catch(() => ({ data: { count: 0 } })),
          ]);
          if (!mounted) return;
          setStats({
            opportunities: ngoRes.data?.opportunities || ngoRes.data?.opportunityCount || 0,
            applications: ngoRes.data?.applications || ngoRes.data?.applicationCount || 0,
            unread: unreadRes.data?.count ?? 0,
          });
        } else if (user.role === 'admin') {
          const [adminRes, unreadRes] = await Promise.all([
            api.get('/api/admin/dashboard/stats').catch(() => ({ data: {} })),
            api.get('/api/notifications/unread-count').catch(() => ({ data: { count: 0 } })),
          ]);
          if (!mounted) return;
          setStats({
            users: adminRes.data?.users || 0,
            reports: adminRes.data?.reports || 0,
            unread: unreadRes.data?.count ?? 0,
          });
        }
      } catch (err) {
        console.warn('[Sidebar] fetchStats failed', err);
      } finally {
        if (mounted) setStatsLoading(false);
      }
    };

    fetchStats();
    return () => {
      mounted = false;
    };
  }, [user, api]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      toast.error('Logout failed – try again');
      console.error('Logout error:', err);
    }
  };

  return (
    <aside 
      className={`
        bg-gradient-to-b from-emerald-950 via-green-950 to-emerald-950 
        text-white h-screen transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-72'}
        relative shadow-2xl shadow-black/40 z-30 flex flex-col overflow-hidden
      `}
    >
      {/* Logo + Collapse Toggle */}
      <div className="p-5 flex items-center justify-between border-b border-green-800/30">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <Recycle className="h-8 w-8 text-green-400 animate-pulse" />
            <h1 className="text-2xl font-extrabold tracking-tight">WasteZero</h1>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-full hover:bg-green-900/40 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="mt-5 px-3 flex-1 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-green-700">
        {navItems.map((item) => {
          const path = item.path || '';
          let badgeCount = 0;
          if (path.includes('applications')) badgeCount = stats.applications || 0;
          else if (path.includes('/opportunities') && user?.role === 'ngo') badgeCount = stats.opportunities || 0;
          else if (path.includes('pickups')) badgeCount = stats.pickups || 0;
          else if (path.includes('reports')) badgeCount = stats.reports || 0;
          else if (path.includes('volunteers')) badgeCount = stats.users || 0;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `relative group flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-green-700 to-emerald-700 text-white font-semibold shadow-md' 
                  : 'text-green-100 hover:bg-green-900/40 hover:text-white'
                }`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}

              {/* Badge */}
              {badgeCount > 0 && !isCollapsed && (
                <span className="ml-auto inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-emerald-600 text-xs font-semibold text-white">
                  {badgeCount}
                </span>
              )}

              {badgeCount > 0 && isCollapsed && (
                <span className="absolute -right-1 top-3 inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-xs font-semibold text-white">
                  {badgeCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-5 border-t border-green-800/30 mt-auto">
        <button
          onClick={() => navigate('/profile')}
          className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-green-900/30 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
          title="View / Edit Profile"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center font-bold text-xl shadow-lg flex-shrink-0 overflow-hidden border-2 border-green-400/40">
            {user.profilePicture ? (
              <img
                src={user.profilePicture.startsWith('http') ? user.profilePicture : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profilePicture}`}
                alt={user.name || 'Profile'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=10b981&color=fff&size=128`;
                }}
              />
            ) : (
              (user.name?.[0] || 'U').toUpperCase()
            )}
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <p className="font-semibold truncate text-green-50">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-green-300 truncate">
                {user.email || 'No email'}
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-green-800/60 text-green-200 text-xs rounded-full capitalize">
                {user.role}
              </span>
            </div>
          )}
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl 
                     bg-red-900/30 hover:bg-red-800/50 text-red-300 hover:text-red-100 
                     transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}