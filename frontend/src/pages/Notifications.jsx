// frontend/src/pages/Notifications.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Bell, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Notifications() {
  const { api } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/notifications', {
        params: { page, limit: 15 },
      });
      setNotifications(res.data.notifications);
      setTotalPages(res.data.pagination.pages);
    } catch (err) {
      toast.error('Failed to load notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await api.delete(`/api/notifications/${notificationId}`);
      toast.success('Notification deleted');
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/api/notifications/mark-all-read');
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      try {
        await api.delete('/api/notifications');
        toast.success('All notifications deleted');
        fetchNotifications();
      } catch (err) {
        toast.error('Failed to delete all notifications');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-6 h-6 text-gray-600" />
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                title="Mark all as read"
              >
                Mark all read
              </button>
              <button
                onClick={handleDeleteAll}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                title="Delete all notifications"
              >
                Clear all
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : notifications.length > 0 ? (
          <>
            <div className="space-y-3">
              {notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all ${
                    !notification.isRead ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              notification.type === 'application_update'
                                ? 'bg-blue-100 text-blue-700'
                                : notification.type === 'opportunity_match'
                                ? 'bg-green-100 text-green-700'
                                : notification.type === 'message_received'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {notification.type.replace(/_/g, ' ')}
                            </span>
                            {notification.actionUrl && (
                              <Link
                                to={notification.actionUrl}
                                className="text-green-600 hover:text-green-700 text-xs font-medium"
                              >
                                View
                              </Link>
                            )}
                          </div>
                          <p className="text-gray-500 text-xs mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
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
                        onClick={() => handleDelete(notification._id)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 py-12 text-center">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30 text-gray-400" />
            <p className="text-gray-500 text-lg">No notifications yet</p>
            <p className="text-gray-400 text-sm mt-1">
              You're all caught up! Notifications will appear here when you receive updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
