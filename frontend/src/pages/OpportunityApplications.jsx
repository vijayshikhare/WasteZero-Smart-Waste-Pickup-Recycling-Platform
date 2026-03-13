// src/pages/OpportunityApplications.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  User,
  Mail,
  Phone,
  ArrowLeft,
} from 'lucide-react';

export default function OpportunityApplications() {
  const { api } = useAuth();
  const { opportunityId } = useParams();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, [opportunityId]);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/applications/opportunity/${opportunityId}`);
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setApplications(data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load applications';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appId, newStatus) => {
    if (!window.confirm(`Are you sure to mark this application as ${newStatus}?`)) return;

    setUpdatingId(appId);
    try {
      await api.patch(`/api/applications/${appId}/status`, {
        status: newStatus,
        // note: 'Optional reason here' // if you want to add note field
      });
      toast.success(`Application marked as ${newStatus}!`);
      fetchApplications(); // refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchApplications}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold">Applications</h1>
        </div>
        <span className="text-sm text-gray-600">
          Opportunity ID: {opportunityId}
        </span>
      </div>

      {applications.length === 0 ? (
        <div className="bg-gray-50 border rounded-xl p-12 text-center">
          <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No applications yet</h2>
          <p className="text-gray-600">
            When volunteers apply, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => {
            const vol = app.volunteer_id || {};
            return (
              <div
                key={app._id}
                className="bg-white border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6 border-b">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <img
                        src={vol.profilePicture || `https://ui-avatars.com/api/?name=${vol.name || 'User'}&background=10b981&color=fff`}
                        alt={vol.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-green-100"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {vol.name || 'Volunteer'}
                      </h3>
                      <div className="mt-1 space-y-1 text-sm text-gray-600">
                        {vol.email && (
                          <p className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {vol.email}
                          </p>
                        )}
                        {vol.phone && (
                          <p className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {vol.phone}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Applied on {new Date(app.appliedAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                          app.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : app.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions - only show if pending */}
                {app.status === 'pending' && (
                  <div className="px-6 py-4 bg-gray-50 flex gap-4">
                    <button
                      onClick={() => handleStatusChange(app._id, 'accepted')}
                      disabled={updatingId === app._id}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                    >
                      {updatingId === app._id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusChange(app._id, 'rejected')}
                      disabled={updatingId === app._id}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                    >
                      {updatingId === app._id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                      Reject
                    </button>
                  </div>
                )}

                {/* Optional note from NGO */}
                {app.note && (
                  <div className="px-6 py-4 border-t bg-amber-50/50">
                    <p className="text-sm text-amber-800">
                      <strong>Note:</strong> {app.note}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}