// src/pages/opportunities/OpportunityApplications.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, Users, Calendar, Mail, CheckCircle, XCircle } from 'lucide-react';

export default function OpportunityApplications() {
  const { opportunityId } = useParams();
  const navigate = useNavigate();
  const { api, user } = useAuth();

  const [opportunity, setOpportunity] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        // wait until auth context loads; effect will retrigger when user changes
        return;
      }
      try {
        // Fetch opportunity to show title + check ownership
        const oppRes = await api.get(`/api/opportunities/${opportunityId}`);
        // response shape might be { success, data: opportunity } or the object itself
        const opp = oppRes.data?.data || oppRes.data;

        // ownership check: verify current user is the NGO that created it
        // account for ObjectId vs string by converting both sides to text
        const ownerIdRaw = opp.ngo_id?._id ? opp.ngo_id._id : opp.ngo_id;
        const ownerId = ownerIdRaw ? ownerIdRaw.toString() : '';
        const myId = user?._id ? user._id.toString() : '';
        if (user?.role !== 'ngo' || ownerId !== myId) {
          // use an id so StrictMode double-invoke doesn't show two toasts
          toast.error("You don't have permission to view applications for this opportunity", { id: 'no-perm-apps' });
          navigate('/dashboard/opportunities');
          return;
        }

        setOpportunity(opp);

        // Fetch applications (you need backend endpoint for this)
        // Example endpoint: /api/opportunities/:id/applications
        const appsRes = await api.get(`/api/opportunities/${opportunityId}/applications`);
        const appData = appsRes.data?.data || appsRes.data?.applications || appsRes.data || [];
        // Extract apps array if still wrapped
        const apps = Array.isArray(appData) ? appData : [];
        setApplications(apps);} catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || 'Failed to load applications';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [opportunityId, api, user, navigate]);

  const handleDecision = async (applicationId, action) => {
    // action is 'accept' or 'reject'
    try {
      const res = await api.post(`/api/ngo/applications/${applicationId}/${action}`);
      toast.success(`Application ${action === 'accept' ? 'accepted' : 'rejected'}`);
      setApplications((prev) =>
        prev.map((a) =>
          a._id === applicationId ? { ...a, status: action === 'accept' ? 'accepted' : 'rejected' } : a
        )
      );
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || `Failed to ${action} application`;
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-10 text-center max-w-lg">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Error</h2>
          <p className="text-red-700 mb-6">{error || 'Opportunity not found'}</p>
          <button
            onClick={() => navigate('/dashboard/opportunities')}
            className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700"
          >
            Back to Opportunities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-5 sm:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <button
              onClick={() => navigate('/dashboard/opportunities')}
              className="flex items-center gap-2 text-green-700 hover:text-green-900 font-medium mb-2"
            >
              <ArrowLeft size={20} /> Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Applications for: {opportunity.title}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-lg text-gray-700">
              Total applications: <strong>{applications.length}</strong>
            </p>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow border p-12 text-center">
            <Users className="mx-auto h-16 w-16 text-gray-400 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">
              No applications yet
            </h2>
            <p className="text-gray-600">
              When volunteers apply, their details will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {applications.map(app => (
              <div
                key={app._id}
                className="bg-white rounded-2xl shadow border p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {app.volunteer_id?.name || 'Anonymous Volunteer'}
                    </h3>
                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                      <Mail size={16} />
                      {app.volunteer_id?.email || 'No email provided'}
                    </p>
                  </div>
                  <span className="px-4 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {app.status || 'Pending'}
                  </span>
                </div>

                <div className="space-y-3 text-gray-700 text-sm">
                  <p className="flex items-center gap-2">
                    <Calendar size={16} />
                    Applied on: {new Date(app.createdAt).toLocaleDateString()}
                  </p>

                  {app.message && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="font-medium mb-1">Message from volunteer:</p>
                      <p className="text-gray-600 italic">"{app.message}"</p>
                    </div>
                  )}
                </div>

                {/* action buttons */}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleDecision(app._id, 'accept')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                  >
                    <CheckCircle size={16} /> Accept
                  </button>
                  <button
                    onClick={() => handleDecision(app._id, 'reject')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                  <Link
                    to={`/chat/${app.volunteer_id?._id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                  >
                    <Mail size={16} /> Chat
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}