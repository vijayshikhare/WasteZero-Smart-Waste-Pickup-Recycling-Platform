// frontend/src/pages/UserDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  BarChart3,
  Bell,
  TrendingUp,
  CheckCircle,
  Clock,
  Trash2,
  Send,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UserDashboard() {
  const { user, api } = useAuth();
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // only fetch when we know auth state, avoids 401/400 noise during initial load
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [statsRes, notificationsRes, unreadRes] = await Promise.all([
        api.get('/api/user/dashboard/stats'),
        api.get('/api/user/notifications?limit=5'),
        api.get('/api/notifications/unread-count'),
      ]);

      setStats(statsRes.data);
      setNotifications(notificationsRes.data.notifications);
      setUnreadCount(unreadRes.data.unreadCount);
    } catch (err) {
      toast.error('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/api/user/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await api.delete(`/api/user/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
            </div>
            <Link
              to="/dashboard/opportunities"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Send className="w-5 h-5" />
              Find Opportunities
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Applications */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Applications</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.applications?.submitted || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Accepted Applications */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Accepted</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats?.applications?.accepted || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Scheduled Pickups */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Scheduled Pickups</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {stats?.pickups?.scheduled || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Completed Pickups */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">
                  {stats?.pickups?.completed || 0}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
                {unreadCount > 0 && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <Link
                to="/notifications"
                className="text-green-600 hover:text-green-700 font-medium text-sm"
              >
                View all
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {notification.message}
                      </p>
                      <p className="text-gray-500 text-xs mt-2">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification._id)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/my-applications"
            className="p-6 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-gray-900">My Applications</h3>
            <p className="text-gray-600 text-sm mt-1">Track your opportunity applications</p>
          </Link>

          <Link
            to="/pickups"
            className="p-6 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-gray-900">My Pickups</h3>
            <p className="text-gray-600 text-sm mt-1">Manage your scheduled pickups</p>
          </Link>

          <Link
            to="/profile"
            className="p-6 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-gray-900">Edit Profile</h3>
            <p className="text-gray-600 text-sm mt-1">Update your profile information</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
