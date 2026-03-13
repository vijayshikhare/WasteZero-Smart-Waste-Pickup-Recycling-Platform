// frontend/src/pages/NgoDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar/Sidebar.jsx';
import {
  BarChart3,
  Users,
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  ChevronRight,
  Loader2,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NgoDashboard() {
  const { user, api } = useAuth();
  const [stats, setStats] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [statsRes, opportunitiesRes, applicationsRes] = await Promise.all([
        api.get('/api/ngo/dashboard/stats'),
        api.get('/api/ngo/opportunities?limit=5'),
        api.get('/api/ngo/applications?limit=5'),
      ]);

      setStats(statsRes.data);
      setOpportunities(opportunitiesRes.data.opportunities || []);
      setRecentApplications(applicationsRes.data.applications || []);
    } catch (err) {
      toast.error('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pt-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">NGO Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage opportunities and volunteers</p>
              </div>
              <Link
                to="/dashboard/opportunities/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Opportunity
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Opportunities */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Opportunities</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.opportunities?.total || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Active Opportunities */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {stats?.opportunities?.active || 0}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Total Applications */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Applications</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {stats?.applications?.total || 0}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Pending Applications */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {stats?.applications?.pending || 0}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Opportunities */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Opportunities</h2>
                    <Link
                      to="/dashboard/opportunities" /* redirect to posted list */
                      className="text-green-600 hover:text-green-700 font-medium text-sm"
                    >
                      View all
                    </Link>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {opportunities.length > 0 ? (
                    opportunities.map((opp) => (
                      <div
                        key={opp._id}
                        className="px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{opp.title}</h3>
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{opp.description}</p>
                            <div className="flex items-center gap-2 mt-3">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  opp.status === 'open'
                                    ? 'bg-green-100 text-green-700'
                                    : opp.status === 'closed'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {opp.status.charAt(0).toUpperCase() + opp.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          <Link
                            to={`/edit-opportunity/${opp._id}`}
                            className="text-green-600 hover:text-green-700 transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No opportunities yet</p>
                      <Link
                        to="/create-opportunity"
                        className="text-green-600 hover:text-green-700 font-medium mt-2 inline-block"
                      >
                        Create your first opportunity
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Applications */}
            <div>
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
                </div>

                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {recentApplications.length > 0 ? (
                    recentApplications.map((app) => (
                      <div key={app._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{app.user_id?.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{app.opportunity_id?.title}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                app.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : app.status === 'accepted'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {app.status}
                            </span>
                            <Link
                              to={`/chat/${app.user_id?._id}`}
                              className="text-blue-600 hover:underline text-xs"
                            >
                              Chat
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-gray-500">
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No applications yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
