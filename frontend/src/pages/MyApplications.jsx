// src/pages/MyApplications.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  AlertCircle,
  Briefcase,
  MapPin,
  Users,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const PLACEHOLDER_IMAGE = 'https://placehold.co/800x600/10b981/ffffff/png?text=Your+Application';

export default function MyApplications() {
  const { api } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyApplications();
  }, [api]);

  const fetchMyApplications = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get('/api/applications/my');
      console.log('[MyApplications] Raw response:', res.data);

      let appData = [];

      // Handle different possible response shapes
      if (Array.isArray(res.data)) {
        appData = res.data;
      } else if (res.data && typeof res.data === 'object') {
        if (Array.isArray(res.data.data)) appData = res.data.data;
        else if (Array.isArray(res.data.applications)) appData = res.data.applications;
        else if (Array.isArray(res.data.results)) appData = res.data.results;
        else if (Array.isArray(res.data.payload)) appData = res.data.payload;
      }

      // Filter out invalid entries
      const validApps = appData.filter(app => app && app._id && app.opportunity_id);

      setApplications(validApps);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load your applications';
      console.error('[MyApplications] Fetch error:', err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const base = "px-4 py-1.5 text-sm font-medium rounded-full flex items-center gap-2 backdrop-blur-sm shadow-sm";

    switch (status?.toLowerCase()) {
      case 'pending':
        return (
          <div className={`${base} bg-amber-100 text-amber-800 border border-amber-200`}>
            <Clock size={16} />
            Pending
          </div>
        );
      case 'accepted':
        return (
          <div className={`${base} bg-green-100 text-green-800 border border-green-200`}>
            <CheckCircle size={16} />
            Accepted
          </div>
        );
      case 'rejected':
        return (
          <div className={`${base} bg-red-100 text-red-800 border border-red-200`}>
            <XCircle size={16} />
            Rejected
          </div>
        );
      default:
        return (
          <div className={`${base} bg-gray-100 text-gray-700 border border-gray-200`}>
            {status || 'Unknown'}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <Loader2 className="h-14 w-14 animate-spin text-green-600" />
          <p className="text-gray-700 font-medium text-lg">Loading your applications...</p>
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
            onClick={() => { setError(null); fetchMyApplications(); }}
            className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-5 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            My Applications
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Track the status of your volunteer applications
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border p-12 text-center max-w-3xl mx-auto">
            <Briefcase className="h-20 w-20 mx-auto text-gray-400 mb-6" />
            <h2 className="text-3xl font-semibold text-gray-800 mb-5">
              No applications yet
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Start applying to opportunities to make an impact!
            </p>
            <Link
              to="/opportunities"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl font-semibold shadow-md text-lg transition-all"
            >
              Browse Opportunities
              <ArrowRight size={20} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-9">
            {applications.map((app) => {
              const opp = app.opportunity_id || {}; // populated field
              return (
                <div
                  key={app._id}
                  className="bg-white rounded-2xl shadow-lg border overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col"
                >
                  {/* Image / Placeholder */}
                  <div className="relative h-64 overflow-hidden bg-gradient-to-br from-green-500 to-emerald-700">
                    <img
                      src={opp.image ? `${API_BASE}${opp.image}` : PLACEHOLDER_IMAGE}
                      alt={opp.title || 'Opportunity'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => (e.target.src = PLACEHOLDER_IMAGE)}
                    />
                    <div className="absolute top-5 right-5">
                      {getStatusBadge(app.status)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-7 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-green-700 transition-colors">
                      {opp.title || 'Untitled Opportunity'}
                    </h3>

                    <p className="text-gray-700 mb-6 line-clamp-4 flex-grow leading-relaxed">
                      {opp.description || 'No description available'}
                    </p>

                    <div className="space-y-3 text-gray-700 mb-6">
                      {opp.location && (
                        <div className="flex items-center gap-3">
                          <MapPin size={20} className="text-green-600 flex-shrink-0" />
                          <span className="truncate">{opp.location}</span>
                        </div>
                      )}
                      {opp.duration && (
                        <div className="flex items-center gap-3">
                          <Clock size={20} className="text-green-600 flex-shrink-0" />
                          <span>{opp.duration}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500">Applied on:</span>
                        <span className="font-medium">
                          {new Date(app.appliedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {opp.required_skills?.length > 0 && (
                      <div className="flex flex-wrap gap-2.5">
                        {opp.required_skills.slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className="bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {opp.required_skills.length > 5 && (
                          <span className="text-sm text-gray-500 self-center">
                            +{opp.required_skills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}