// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Recycle,
  Clock,
  CheckCircle2,
  Package,
  ArrowUpRight,
  Users,
  Building2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function Dashboard() {
  const { user, api } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!user?.role) return;

      setLoading(true);
      setError(null);

      try {
        let endpoint = '';

        if (user.role === 'ngo') {
          endpoint = '/api/dashboard/ngo-stats';
        } else if (user.role === 'volunteer') {
          endpoint = '/api/dashboard/volunteer-stats';
        } else if (user.role === 'admin') {
          endpoint = '/api/dashboard/admin-stats';
        } else {
          throw new Error('Unknown role');
        }

        const res = await api.get(endpoint);
        setStats(res.data);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load dashboard data';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [api, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-green-600" />
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-10 text-center max-w-lg w-full">
          <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-5" />
          <h2 className="text-2xl font-bold text-red-800 mb-4">Something went wrong</h2>
          <p className="text-red-700 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-md"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Default/fallback stats if API returns nothing
  const defaultStats = {
    totalPickups: 0,
    pending: 0,
    completed: 0,
    activeVolunteers: 0,
    partnerNGOs: 0,
    totalWasteKg: '0 kg',
    appliedOpportunities: 0,
    acceptedApplications: 0,
    pendingApplications: 0,
  };

  const s = { ...defaultStats, ...stats };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Welcome back, {user?.name || 'User'}
          </h1>
          <p className="mt-2 text-gray-600">
            {user?.role === 'ngo' && 'Manage your waste pickups and volunteers'}
            {user?.role === 'volunteer' && 'Track your applications and contributions'}
            {user?.role === 'admin' && 'Oversee the entire platform activity'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Common / NGO */}
          {(user?.role === 'ngo' || user?.role === 'admin') && (
            <>
              <StatCard
                title="Total Pickups"
                value={s.totalPickups}
                icon={<Recycle className="h-10 w-10 text-green-500 opacity-80" />}
                color="green"
              />
              <StatCard
                title="Pending"
                value={s.pending}
                icon={<Clock className="h-10 w-10 text-amber-500 opacity-80" />}
                color="amber"
              />
              <StatCard
                title="Completed"
                value={s.completed}
                icon={<CheckCircle2 className="h-10 w-10 text-emerald-500 opacity-80" />}
                color="emerald"
              />
            </>
          )}

          {/* Volunteer specific */}
          {user?.role === 'volunteer' && (
            <>
              <StatCard
                title="Applied Opportunities"
                value={s.appliedOpportunities}
                icon={<Package className="h-10 w-10 text-blue-500 opacity-80" />}
                color="blue"
              />
              <StatCard
                title="Accepted"
                value={s.acceptedApplications}
                icon={<CheckCircle2 className="h-10 w-10 text-green-500 opacity-80" />}
                color="green"
              />
              <StatCard
                title="Pending"
                value={s.pendingApplications}
                icon={<Clock className="h-10 w-10 text-amber-500 opacity-80" />}
                color="amber"
              />
            </>
          )}

          {/* NGO / Admin extras */}
          {(user?.role === 'ngo' || user?.role === 'admin') && (
            <>
              <StatCard
                title="Active Volunteers"
                value={s.activeVolunteers}
                icon={<Users className="h-10 w-10 text-purple-500 opacity-80" />}
                color="purple"
              />
              {user?.role === 'ngo' && (
                <StatCard
                  title="Total Waste Collected"
                  value={s.totalWasteKg}
                  icon={<Recycle className="h-10 w-10 text-teal-500 opacity-80" />}
                  color="teal"
                />
              )}
              {user?.role === 'admin' && (
                <StatCard
                  title="Partner NGOs"
                  value={s.partnerNGOs}
                  icon={<Building2 className="h-10 w-10 text-indigo-500 opacity-80" />}
                  color="indigo"
                />
              )}
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {user?.role === 'ngo' && (
            <QuickActionCard
              title="Schedule New Pickup"
              description="Book waste collection from any location in Nagpur."
              buttonText="Schedule Pickup"
              onClick={() => navigate('/pickups/new')}
              color="green"
            />
          )}

          {user?.role === 'volunteer' && (
            <QuickActionCard
              title="Browse Opportunities"
              description="Find new volunteer opportunities near you."
              buttonText="View Opportunities"
              onClick={() => navigate('/opportunities')}
              color="blue"
            />
          )}

          {user?.role === 'admin' && (
            <QuickActionCard
              title="Manage Users"
              description="Oversee volunteers, NGOs, and admins."
              buttonText="Go to Users"
              onClick={() => navigate('/admin/users')}
              color="purple"
            />
          )}

          {/* Secondary card - stats or recent */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Quick Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Last Activity</span>
                <span className="font-medium text-gray-900">2 hours ago</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Notifications</span>
                <span className="font-medium text-amber-600">3 unread</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-600">Account Status</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          </div>

          {s.totalPickups === 0 && s.appliedOpportunities === 0 ? (
            <div className="p-12 text-center">
              <Package className="h-16 w-16 mx-auto text-gray-400 mb-6" />
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                No recent activity
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {user?.role === 'ngo'
                  ? 'Schedule your first pickup or invite volunteers to get started.'
                  : user?.role === 'volunteer'
                  ? 'Apply to your first opportunity to start contributing.'
                  : 'Platform is ready — add users or opportunities to begin.'}
              </p>
              {user?.role === 'ngo' && (
                <button
                  onClick={() => navigate('/pickups/new')}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-medium shadow-sm transition-colors"
                >
                  Schedule First Pickup
                </button>
              )}
              {user?.role === 'volunteer' && (
                <button
                  onClick={() => navigate('/opportunities')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium shadow-sm transition-colors"
                >
                  Browse Opportunities
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* Placeholder recent items — replace with real data */}
              <div className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Pickup scheduled - Sector 17</p>
                    <p className="text-sm text-gray-600 mt-1">2 hours ago</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Scheduled
                  </span>
                </div>
              </div>
              {/* Add more items dynamically when you have real data */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({ title, value, icon, color = 'green' }) {
  const colorClasses = {
    green: 'text-green-600',
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    teal: 'text-teal-600',
    indigo: 'text-indigo-600',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-4xl font-bold mt-1 ${colorClasses[color] || 'text-gray-900'}`}>
            {value}
          </p>
        </div>
        <div className="opacity-80">{icon}</div>
      </div>
    </div>
  );
}

// Reusable Quick Action Card
function QuickActionCard({ title, description, buttonText, onClick, color = 'green' }) {
  const bgClasses = {
    green: 'from-green-600 to-emerald-700',
    blue: 'from-blue-600 to-indigo-700',
    purple: 'from-purple-600 to-pink-700',
  };

  return (
    <div className={`bg-gradient-to-br ${bgClasses[color] || bgClasses.green} rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-all`}>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-opacity-90 mb-6">{description}</p>
      <button
        onClick={onClick}
        className="bg-white text-gray-900 px-8 py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-colors flex items-center gap-2 shadow-sm"
      >
        {buttonText} <ArrowUpRight size={18} />
      </button>
    </div>
  );
}