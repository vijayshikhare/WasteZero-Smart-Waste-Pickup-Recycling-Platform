// frontend/src/pages/AdminReports.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  Filter,
  Loader2,
  ChevronDown,
  Check,
  X,
} from 'lucide-react';

export default function AdminReports() {
  const { api } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedReport, setExpandedReport] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionTaken, setActionTaken] = useState('none');

  useEffect(() => {
    fetchReports();
  }, [filterStatus, page]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/reports', {
        params: { status: filterStatus, page, limit: 10 },
      });
      setReports(res.data.reports);
      setTotalPages(res.data.pagination.pages);
    } catch (err) {
      toast.error('Failed to fetch reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReport = async (reportId, newStatus) => {
    try {
      setActionLoading(true);
      await api.put(`/api/admin/reports/${reportId}`, {
        status: newStatus,
        adminNotes,
        actionTaken,
      });
      toast.success('Report updated successfully');
      fetchReports();
      setExpandedReport(null);
      setAdminNotes('');
      setActionTaken('none');
    } catch (err) {
      toast.error('Failed to update report');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-6 h-6 text-gray-600" />
            <h1 className="text-3xl font-bold text-gray-900">Report Management</h1>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="pending">Pending</option>
            <option value="reviewing">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : reports.length > 0 ? (
            <>
              {reports.map(report => (
                <div
                  key={report._id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedReport(
                      expandedReport === report._id ? null : report._id
                    )}
                    className="w-full px-6 py-4 flex items-start justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          report.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : report.status === 'reviewing'
                            ? 'bg-blue-100 text-blue-700'
                            : report.status === 'resolved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          report.reportType === 'user'
                            ? 'bg-blue-100 text-blue-700'
                            : report.reportType === 'opportunity'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {report.reportType}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        {report.reason.toUpperCase()}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {report.description}
                      </p>
                      <p className="text-gray-500 text-xs mt-2">
                        Reported by: {report.reporterId?.name} • {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedReport === report._id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {expandedReport === report._id && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Full Description</h4>
                          <p className="text-gray-700">{report.description}</p>
                        </div>

                        {report.evidence.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Evidence</h4>
                            <div className="space-y-1">
                              {report.evidence.map((url, idx) => (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:text-green-700 text-sm block"
                                >
                                  Evidence {idx + 1}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {report.status !== 'resolved' && report.status !== 'dismissed' && (
                          <div className="space-y-3 pt-4 border-t border-gray-300">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Admin Notes
                              </label>
                              <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add your notes here..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                rows={3}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Action Taken
                              </label>
                              <select
                                value={actionTaken}
                                onChange={(e) => setActionTaken(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              >
                                <option value="none">None</option>
                                <option value="warning">Warning</option>
                                <option value="suspension">Suspension</option>
                                <option value="deletion">Deletion</option>
                                <option value="other">Other</option>
                              </select>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateReport(report._id, 'reviewing')}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
                              >
                                {actionLoading ? 'Updating...' : 'Mark as Reviewing'}
                              </button>
                              <button
                                onClick={() => handleUpdateReport(report._id, 'resolved')}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-1"
                              >
                                <Check className="w-4 h-4" />
                                Resolve
                              </button>
                              <button
                                onClick={() => handleUpdateReport(report._id, 'dismissed')}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-1"
                              >
                                <X className="w-4 h-4" />
                                Dismiss
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Pagination */}
              <div className="flex items-center justify-center gap-2 mt-6">
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
            <div className="bg-white rounded-lg border border-gray-200 py-12 text-center text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No reports found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
