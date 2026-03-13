// src/pages/Opportunities.jsx
import { useState, useEffect } from 'react';
import { useAuth, publicApi } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Clock,
  AlertCircle,
  Loader2,
  Plus,
  X,
  Upload,
  Users,
  Edit,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const PLACEHOLDER_IMAGE = 'https://placehold.co/800x600/10b981/ffffff/png?text=Volunteer+Opportunity';

export default function Opportunities() {
  const { api, user } = useAuth();
  const navigate = useNavigate();

  const [opportunities, setOpportunities] = useState([]);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create modal (NGO only)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    required_skills: '',
    duration: '',
    location: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // View modal
  const [selectedOpp, setSelectedOpp] = useState(null);

  useEffect(() => {
    fetchOpportunities();
  }, [api, user]);

  const fetchOpportunities = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use public API for opportunities list
      const res = await publicApi.get('/api/opportunities');
      console.log('[Opportunities] Raw /api/opportunities response:', res.data);

      let oppData = [];

      if (Array.isArray(res.data)) {
        oppData = res.data;
      } else if (res.data && typeof res.data === 'object') {
        if (Array.isArray(res.data.data)) oppData = res.data.data;
        else if (Array.isArray(res.data.opportunities)) oppData = res.data.opportunities;
        else if (Array.isArray(res.data.results)) oppData = res.data.results;
        else if (Array.isArray(res.data.payload)) oppData = res.data.payload;
      }

      setOpportunities(oppData);

      if (user?.role === 'volunteer') {
        try {
          // Use authenticated api for user-specific data
          const appsRes = await api.get('/api/applications/my');
          let appData = [];

          if (Array.isArray(appsRes.data)) appData = appsRes.data;
          else if (appsRes.data?.data) appData = appsRes.data.data;
          else if (appsRes.data?.applications) appData = appsRes.data.applications;

          const applied = new Set(
            appData
              .map(a => a?.opportunity_id?._id)
              .filter(id => id && typeof id === 'string' && id.length === 24)
          );

          setAppliedIds(applied);
        } catch (appsErr) {
          console.warn('[Failed to load applied IDs]', appsErr);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load opportunities';
      console.error('[fetchOpportunities] Error:', err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Create modal handlers
  const openCreateModal = () => {
    setFormData({ title: '', description: '', required_skills: '', duration: '', location: '' });
    setImageFile(null);
    setImagePreview(null);
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => setIsCreateOpen(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');
    if (!file.type.startsWith('image/')) return toast.error('Only images allowed');

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      return toast.error('Title and description are required');
    }
    if (!imageFile && !imagePreview) {
      return toast.error('Please upload an image');
    }

    try {
      const form = new FormData();
      form.append('title', formData.title.trim());
      form.append('description', formData.description.trim());
      form.append('required_skills', formData.required_skills.trim());
      form.append('duration', formData.duration.trim());
      form.append('location', formData.location.trim());
      if (imageFile) form.append('image', imageFile);

      await api.post('/api/opportunities', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Opportunity created!');
      fetchOpportunities();
      closeCreateModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create opportunity');
    }
  };

  const handleApply = async (oppId) => {
    // Check if user is authenticated
    if (!user) {
      toast.error('Please log in to apply for opportunities', { duration: 4000 });
      navigate('/login', { state: { from: '/opportunities' } });
      return;
    }

    // Check if user is a volunteer
    if (user.role !== 'volunteer') {
      toast.error('Only volunteers can apply for opportunities');
      return;
    }

    if (!window.confirm('Apply for this opportunity?')) return;

    try {
      await api.post(`/api/applications/${oppId}/apply`);
      toast.success('Application submitted!');
      setAppliedIds(prev => new Set([...prev, oppId]));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    }
  };

  const openView = (opp) => setSelectedOpp(opp);
  const closeView = () => setSelectedOpp(null);

  const isOwner = (opp) => {
    if (user?.role !== 'ngo') return false;
    // some endpoints return opp.ngo_id populated or just id, fallback to createdBy
    const raw = opp?.ngo_id?._id ? opp.ngo_id._id : opp?.ngo_id || opp?.createdBy;
    const owner = raw ? raw.toString() : '';
    const me = user?._id ? user._id.toString() : '';
    return owner === me;
  };

  // ────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <Loader2 className="h-14 w-14 animate-spin text-green-600" />
          <p className="text-gray-700 font-medium text-lg">Loading opportunities...</p>
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
            onClick={() => { setError(null); fetchOpportunities(); }}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Volunteer Opportunities
          </h1>

          {user?.role === 'ngo' && (
            <button
              onClick={openCreateModal}
              className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl shadow-lg font-semibold text-lg transition-all min-w-[220px]"
            >
              <Plus size={22} />
              Create New Opportunity
            </button>
          )}
        </div>

        {opportunities.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border p-12 text-center max-w-3xl mx-auto">
            <Briefcase className="h-24 w-24 mx-auto text-gray-400 mb-6" />
            <h2 className="text-3xl font-semibold text-gray-800 mb-5">
              No opportunities available yet
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              {user?.role === 'ngo'
                ? 'Create your first volunteer opportunity to connect with passionate helpers.'
                : 'NGOs will start posting opportunities soon. Check back later!'}
            </p>
            {user?.role === 'ngo' && (
              <button
                onClick={openCreateModal}
                className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl font-semibold shadow-md text-lg"
              >
                Create Your First Opportunity
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-9">
            {opportunities.map((opp) => (
              <div
                key={opp._id}
                className="bg-white rounded-2xl shadow-lg border overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col cursor-pointer"
                onClick={() => openView(opp)}
              >
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-green-500 to-emerald-700">
                  <img
                    src={opp.image ? `${API_BASE}${opp.image}` : PLACEHOLDER_IMAGE}
                    alt={opp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => (e.target.src = PLACEHOLDER_IMAGE)}
                  />
                  <div className="absolute top-5 right-5">
                    <span className="px-4 py-1.5 bg-green-100 text-green-800 text-sm font-medium rounded-full backdrop-blur-sm shadow-sm border border-green-200">
                      {opp.status?.toUpperCase() || 'OPEN'}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-7 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-green-700 transition-colors">
                    {opp.title || 'Untitled Opportunity'}
                  </h3>

                  <p className="text-gray-700 mb-6 line-clamp-3 flex-grow leading-relaxed">
                    {opp.description || 'No description provided.'}
                  </p>

                  {/* Details Row */}
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
                  </div>

                  {/* Skills Tags */}
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
            ))}
          </div>
        )}
      </div>

      {/* ── View Details Modal ──────────────────────────────────────── */}
      {selectedOpp && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-7 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-3xl font-bold text-gray-900 line-clamp-2 pr-10">
                {selectedOpp.title}
              </h2>
              <button
                onClick={closeView}
                className="p-3 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={32} />
              </button>
            </div>

            <div className="p-8 space-y-10">
              <img
                src={selectedOpp.image ? `${API_BASE}${selectedOpp.image}` : PLACEHOLDER_IMAGE}
                alt={selectedOpp.title}
                className="w-full h-96 object-cover rounded-xl shadow-md"
                onError={(e) => (e.target.src = PLACEHOLDER_IMAGE)}
              />

              <div className="grid md:grid-cols-3 gap-10">
                <div className="md:col-span-2 space-y-10">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-5 flex items-center gap-4">
                      <AlertCircle size={26} className="text-green-600" />
                      Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                      {selectedOpp.description}
                    </p>
                  </div>

                  {selectedOpp.required_skills?.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-5 flex items-center gap-4">
                        <Users size={26} className="text-green-600" />
                        Required Skills
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {selectedOpp.required_skills.map((skill) => (
                          <span
                            key={skill}
                            className="bg-green-100 text-green-800 px-6 py-2.5 rounded-full text-base font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-9 bg-gray-50 p-7 rounded-xl">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-4">
                      <MapPin size={24} className="text-green-600" />
                      Location
                    </h3>
                    <p className="text-gray-700 text-lg">{selectedOpp.location || 'Not specified'}</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-4">
                      <Clock size={24} className="text-green-600" />
                      Duration
                    </h3>
                    <p className="text-gray-700 text-lg">{selectedOpp.duration || 'Flexible'}</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-4">
                      <AlertCircle size={24} className="text-green-600" />
                      Status
                    </h3>
                    <span className="inline-block px-7 py-2.5 bg-green-100 text-green-800 rounded-full text-base font-medium">
                      {selectedOpp.status?.toUpperCase() || 'OPEN'}
                    </span>
                  </div>

                  {/* NGO actions in modal */}
                  {isOwner(selectedOpp) && (
                    <div className="pt-6 border-t flex flex-col gap-4">
                      <Link
                        to={`/dashboard/opportunities/edit/${selectedOpp._id}`}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-medium transition-colors"
                      >
                        <Edit size={18} />
                        Edit Opportunity
                      </Link>

                      <Link
                        to={`/dashboard/opportunity-applications/${selectedOpp._id}`}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-medium transition-colors"
                      >
                        <Users size={18} />
                        View Applications ({selectedOpp.applicationsCount || 0})
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {user?.role !== 'ngo' && (
                <div className="pt-8 border-t flex justify-end">
                  <button
                    onClick={() => { handleApply(selectedOpp._id); closeView(); }}
                    disabled={user?.role === 'volunteer' && appliedIds.has(selectedOpp._id)}
                    className={`px-10 py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
                      user?.role === 'volunteer' && appliedIds.has(selectedOpp._id)
                        ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-xl'
                    }`}
                  >
                    {user?.role === 'volunteer' && appliedIds.has(selectedOpp._id) ? 'Already Applied' : 'Apply Now'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal (NGO only) */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-5">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto">
            <div className="p-7 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-3xl font-bold text-gray-900">Create New Opportunity</h2>
              <button onClick={closeCreateModal} className="p-3 rounded-full hover:bg-gray-100">
                <X size={32} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-8 space-y-10">
              {/* Image Upload */}
              <div className="space-y-5">
                <label className="block text-xl font-semibold text-gray-900">
                  Opportunity Image <span className="text-red-600">*</span>
                </label>

                <div className="flex flex-col md:flex-row gap-10 items-start">
                  <label className="w-full md:w-96 h-80 rounded-2xl border-2 border-dashed border-gray-400 flex flex-col items-center justify-center cursor-pointer hover:border-green-600 transition-all overflow-hidden bg-gray-50 relative group">
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Upload className="text-gray-500 group-hover:text-green-600 transition-colors mb-4" size={52} />
                        <p className="text-center text-gray-600 group-hover:text-green-700 font-medium">
                          Click or drag image here
                        </p>
                        <p className="text-sm text-gray-500 mt-3">JPG, PNG • max 5MB</p>
                        <p className="text-sm text-gray-400 mt-1">Recommended: 800×600 or larger</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleImageChange}
                    />
                  </label>

                  <div className="flex-1">
                    <p className="text-gray-600 leading-relaxed">
                      Upload a clear, representative image for your opportunity.<br />
                      Good lighting and relevant visuals help attract more volunteers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xl font-semibold text-gray-900 mb-4">
                  Title <span className="text-red-600">*</span>
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-7 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 text-lg shadow-sm"
                  placeholder="e.g. Beach Cleanup Drive"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xl font-semibold text-gray-900 mb-4">
                  Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={8}
                  required
                  className="w-full px-7 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 text-base shadow-sm leading-relaxed"
                  placeholder="Describe the activity, goals, what volunteers will do..."
                />
              </div>

              {/* Skills, Duration, Location */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xl font-semibold text-gray-900 mb-4">Required Skills</label>
                  <input
                    name="required_skills"
                    value={formData.required_skills}
                    onChange={handleChange}
                    className="w-full px-7 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 shadow-sm"
                    placeholder="e.g. teaching, first aid, event planning (comma separated)"
                  />
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="block text-xl font-semibold text-gray-900 mb-4">Duration</label>
                    <input
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full px-7 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 shadow-sm"
                      placeholder="e.g. 3 hours, 2 days, ongoing"
                    />
                  </div>

                  <div>
                    <label className="block text-xl font-semibold text-gray-900 mb-4">Location</label>
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-7 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 shadow-sm"
                      placeholder="e.g. Pune, Maharashtra"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-6 pt-10 border-t">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-12 py-5 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold text-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-12 py-5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-lg shadow-md transition-all"
                >
                  Create Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}