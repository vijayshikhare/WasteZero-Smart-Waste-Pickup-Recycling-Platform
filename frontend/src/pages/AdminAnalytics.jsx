// frontend/src/pages/AdminAnalytics.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  BarChart3,
  TrendingUp,
  calendar,
  Loader2,
  LineChart as LineChartIcon,
} from 'lucide-react';

export default function AdminAnalytics() {
  const { api } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/analytics', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      });
      setAnalytics(res.data);
    } catch (err) {
      toast.error('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-6 h-6 text-gray-600" />
            <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange(prev => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange(prev => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <button
              onClick={fetchAnalytics}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Update
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Growth */}
            {analytics?.userGrowth && analytics.userGrowth.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5 text-green-600" />
                  User Growth Trend
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-900">
                          Period
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-900">
                          Volunteers
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-900">
                          NGOs
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-900">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analytics.userGrowth.map((row, idx) => {
                        const volCount = row._id.role === 'volunteer' ? row.count : 0;
                        const ngoCount = row._id.role === 'ngo' ? row.count : 0;
                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-900">
                              {row._id.month}/{row._id.year}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {row._id.role === 'volunteer' ? row.count : '-'}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {row._id.role === 'ngo' ? row.count : '-'}
                            </td>
                            <td className="px-4 py-2 font-medium text-gray-900">
                              {row.count}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Opportunity Statistics */}
            {analytics?.opportunityStats && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Opportunity Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analytics.opportunityStats.map((stat, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <p className="text-gray-600 text-sm capitalize">
                        {stat._id} Opportunities
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {stat.count}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Application Statistics */}
            {analytics?.applicationStats && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  Application Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analytics.applicationStats.map((stat, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <p className="text-gray-600 text-sm capitalize">
                        {stat._id} Applications
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {stat.count}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Report Statistics */}
            {analytics?.reportStats && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-red-600" />
                  Report Statistics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {analytics.reportStats.map((stat, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <p className="text-gray-600 text-sm capitalize">
                        {stat._id}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {stat.count}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
