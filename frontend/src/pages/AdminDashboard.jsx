// frontend/src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  BarChart3,
  Users,
  AlertCircle,
  TrendingUp,
  FileText,
  Shield,
  Activity,
  Loader2,
  Eye,
  X,
  Lock,
  CheckCircle,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, api } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [suspending, setSuspending] = useState(false);
  const [userFilter, setUserFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        api.get('/api/admin/dashboard/stats'),
        api.get('/api/admin/users'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data?.users || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load admin data';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId) => {
    if (!window.confirm('Suspend this user? They will not be able to access the platform.')) return;

    setSuspending(true);
    try {
      await api.post(`/api/admin/users/${userId}/suspend`);
      toast.success('User suspended successfully');
      fetchDashboardData();
      setSelectedUser(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to suspend user');
    } finally {
      setSuspending(false);
    }
  };

  const handleActivateUser = async (userId) => {
    if (!window.confirm('Activate this user?')) return;

    setSuspending(true);
    try {
      await api.post(`/api/admin/users/${userId}/activate`);
      toast.success('User activated successfully');
      fetchDashboardData();
      setSelectedUser(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to activate user');
    } finally {
      setSuspending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <Loader2 className="h-14 w-14 animate-spin text-blue-600" />
          <p className="text-gray-700 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-10 text-center max-w-lg w-full">
          <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-5" />
          <h2 className="text-2xl font-bold text-red-800 mb-4">Error</h2>
          <p className="text-red-700 mb-8">{error}</p>
          <button
            onClick={() => { setError(null); fetchDashboardData(); }}
            className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    if (userFilter === 'suspended') return u.isSuspended;
    if (userFilter === 'active') return !u.isSuspended;
    if (userFilter === 'volunteer') return u.role === 'volunteer';
    if (userFilter === 'ngo') return u.role === 'ngo';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-5 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 size={40} className="text-blue-600" />
            Admin Control Panel
          </h1>
          <p className="mt-2 text-gray-600">Monitor platform health, manage users, and track metrics</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'users', label: '👥 User Management' },
            { id: 'analytics', label: '📈 Analytics' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="bg-white rounded-2xl shadow-lg border p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Users</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">{stats.users?.total || 0}</p>
                  </div>
                  <Users className="h-12 w-12 text-blue-600 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Volunteers</p>
                    <p className="text-4xl font-bold text-green-600 mt-2">{stats.users?.volunteers || 0}</p>
                  </div>
                  <span className="text-4xl">🤝</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">NGOs</p>
                    <p className="text-4xl font-bold text-emerald-600 mt-2">{stats.users?.ngos || 0}</p>
                  </div>
                  <span className="text-4xl">🏢</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Suspended</p>
                    <p className="text-4xl font-bold text-red-600 mt-2">{stats.users?.suspended || 0}</p>
                  </div>
                  <Lock className="h-12 w-12 text-red-600 opacity-20" />
                </div>
              </div>
            </div>

            {/* Opportunities */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white rounded-2xl shadow-lg border p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Opportunities</p>
                    <p className="text-4xl font-bold text-purple-600 mt-2">{stats.opportunities?.total || 0}</p>
                  </div>
                  <span className="text-4xl">📋</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Open</p>
                    <p className="text-4xl font-bold text-blue-600 mt-2">{stats.opportunities?.open || 0}</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-blue-600 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Completed</p>
                    <p className="text-4xl font-bold text-green-600 mt-2">{stats.opportunities?.completed || 0}</p>
                  </div>
                  <CheckCircle className="h-12 w-12 text-green-600 opacity-20" />
                </div>
              </div>
            </div>

            {/* Applications & Reports */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg border p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📝 Applications Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total Applications</span>
                    <span className="text-2xl font-bold text-blue-600">{stats.applications?.total || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Pending Review</span>
                    <span className="text-2xl font-bold text-orange-600">{stats.applications?.pending || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Accepted</span>
                    <span className="text-2xl font-bold text-green-600">{stats.applications?.accepted || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">⚠️ Reports Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Pending Reports</span>
                    <span className="text-2xl font-bold text-red-600">{stats.reports?.pending || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Under Review</span>
                    <span className="text-2xl font-bold text-orange-600">{stats.reports?.reviewing || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Recent Activity (24h)</span>
                    <span className="text-2xl font-bold text-blue-600">{stats.recentActivity || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-lg border p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'All Users' },
                  { value: 'active', label: 'Active' },
                  { value: 'suspended', label: 'Suspended' },
                  { value: 'volunteer', label: 'Volunteers' },
                  { value: 'ngo', label: 'NGOs' },
                ].map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => setUserFilter(filter.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      userFilter === filter.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-4 font-semibold text-gray-900">Name</th>
                      <th className="px-6 py-4 font-semibold text-gray-900">Email</th>
                      <th className="px-6 py-4 font-semibold text-gray-900">Role</th>
                      <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-4 font-semibold text-gray-900">Joined</th>
                      <th className="px-6 py-4 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u._id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                        <td className="px-6 py-4 text-gray-700 text-sm">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            u.role === 'volunteer' ? 'bg-green-100 text-green-800' :
                            u.role === 'ngo' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {u.role === 'volunteer' ? '🤝' : u.role === 'ngo' ? '🏢' : '👨‍💼'} {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            u.isSuspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {u.isSuspended ? '🔒 Suspended' : '✅ Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(u.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                          >
                            <Eye size={18} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg border p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">📊 Platform Growth</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 font-medium">User Engagement</span>
                    <span className="text-blue-600 font-bold">{stats.users?.total || 0} users</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-blue-600 h-4 rounded-full" 
                      style={{ width: `${Math.min((stats.users?.total || 0) / 10, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 font-medium">Volunteer Participation</span>
                    <span className="text-green-600 font-bold">{stats.users?.volunteers || 0}</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-green-600 h-4 rounded-full" 
                      style={{ width: `${stats.users?.total ? (stats.users.volunteers / stats.users.total * 100) : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 font-medium">NGO Adoption</span>
                    <span className="text-emerald-600 font-bold">{stats.users?.ngos || 0}</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-emerald-600 h-4 rounded-full" 
                      style={{ width: `${stats.users?.total ? (stats.users.ngos / stats.users.total * 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">💪 System Health</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                  <span className="text-gray-700">Recent Activity (24h)</span>
                  <span className="text-2xl font-bold text-blue-600">{stats.recentActivity || 0}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                  <span className="text-gray-700">Active Opportunities</span>
                  <span className="text-2xl font-bold text-green-600">{stats.opportunities?.open || 0}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-orange-50 rounded-xl">
                  <span className="text-gray-700">Pending Applications</span>
                  <span className="text-2xl font-bold text-orange-600">{stats.applications?.pending || 0}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl">
                  <span className="text-gray-700">Reports Awaiting Review</span>
                  <span className="text-2xl font-bold text-red-600">{stats.reports?.pending || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-5">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-7 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-3xl font-bold text-gray-900">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="p-3 rounded-full hover:bg-gray-100">
                <X size={32} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Name</p>
                  <p className="text-gray-900 text-lg font-semibold mt-1">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">Email</p>
                  <p className="text-gray-900 text-lg font-semibold mt-1">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">Role</p>
                  <p className="text-gray-900 text-lg font-semibold mt-1">
                    {selectedUser.role === 'volunteer' ? '🤝 Volunteer' :
                     selectedUser.role === 'ngo' ? '🏢 NGO' : '👨‍💼 Admin'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">Status</p>
                  <p className={`text-lg font-semibold mt-1 ${selectedUser.isSuspended ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedUser.isSuspended ? '🔒 Suspended' : '✅ Active'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">Joined</p>
                  <p className="text-gray-900 text-lg font-semibold mt-1">
                    {new Date(selectedUser.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">User ID</p>
                  <p className="text-gray-900 text-sm font-mono mt-1 truncate">{selectedUser._id}</p>
                </div>
              </div>

              {selectedUser.role !== 'admin' && (
                <div className="flex gap-4 pt-6 border-t">
                  {selectedUser.isSuspended ? (
                    <button
                      onClick={() => handleActivateUser(selectedUser._id)}
                      disabled={suspending}
                      className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all disabled:opacity-60"
                    >
                      {suspending ? 'Processing...' : '✅ Activate User'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSuspendUser(selectedUser._id)}
                      disabled={suspending}
                      className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      <Lock size={18} />
                      {suspending ? 'Processing...' : 'Suspend User'}
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedUser(null)}
                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition-all"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
