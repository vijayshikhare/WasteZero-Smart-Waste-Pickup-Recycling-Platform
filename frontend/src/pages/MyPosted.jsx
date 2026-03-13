// src/pages/MyPosted.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Briefcase,
  MapPin,
  Clock,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  Plus,
  Search,
  X,
  Upload,
  Users,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const PLACEHOLDER_IMAGE = 'https://placehold.co/800x600/10b981/ffffff/png?text=Your+Opportunity';

export default function MyPosted() {
  const { api, user } = useAuth();

  const [opportunities, setOpportunities] = useState([]);
  const [filteredOpps, setFilteredOpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  // Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    required_skills: '',
    duration: '',
    location: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (user?.role !== 'ngo') {
      setError('This page is only available for NGOs.');
      setLoading(false);
      return;
    }
    fetchMyOpportunities();
  }, [api, user]);

  const fetchMyOpportunities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/opportunities/my');
      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data?.opportunities) {
        data = res.data.opportunities;
      } else if (res.data?.data) {
        data = res.data.data;
      } else if (typeof res.data === 'object' && res.data !== null) {
        data = [res.data]; // single object fallback
      }

      setOpportunities(data);
      setFilteredOpps(data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load your opportunities';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredOpps(opportunities);
      return;
    }
    const filtered = opportunities.filter(opp =>
      opp.title?.toLowerCase().includes(term) ||
      opp.description?.toLowerCase().includes(term) ||
      opp.location?.toLowerCase().includes(term) ||
      (typeof opp.required_skills === 'string' && opp.required_skills.toLowerCase().includes(term)) ||
      (Array.isArray(opp.required_skills) && opp.required_skills.some(s => s.toLowerCase().includes(term)))
    );
    setFilteredOpps(filtered);
  }, [searchTerm, opportunities]);

  // ── Edit Modal ──────────────────────────────────────────
  const openEditModal = (opp) => {
    setEditingOpp(opp);
    setFormData({
      title: opp.title || '',
      description: opp.description || '',
      required_skills: Array.isArray(opp.required_skills)
        ? opp.required_skills.join(', ')
        : typeof opp.required_skills === 'string'
          ? opp.required_skills
          : '',
      duration: opp.duration || '',
      location: opp.location || '',
    });
    setImagePreview(opp.image ? `${API_BASE}${opp.image}` : null);
    setImageFile(null);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditingOpp(null);
    setFormData({ title: '', description: '', required_skills: '', duration: '', location: '' });
    setImageFile(null);
    setImagePreview(null);
  };

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

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      return toast.error('Title and description are required');
    }

    try {
      const form = new FormData();
      form.append('title', formData.title.trim());
      form.append('description', formData.description.trim());
      form.append('required_skills', formData.required_skills.trim());
      form.append('duration', formData.duration.trim());
      form.append('location', formData.location.trim());
      if (imageFile) form.append('image', imageFile);

      await api.put(`/api/opportunities/${editingOpp._id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Opportunity updated');
      fetchMyOpportunities();
      closeEditModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this opportunity permanently?')) return;
    try {
      await api.delete(`/api/opportunities/${id}`);
      toast.success('Deleted successfully');
      setOpportunities(prev => prev.filter(o => o._id !== id));
      setFilteredOpps(prev => prev.filter(o => o._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-green-600" />
          <p className="text-gray-600 font-medium">Loading your opportunities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-10 text-center max-w-lg w-full">
          <AlertCircle className="h-14 w-14 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold text-red-800 mb-3">Error</h2>
          <p className="text-red-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            My Posted Opportunities
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search your opportunities..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm text-base"
              />
            </div>

            <button
              onClick={() => (window.location.href = '/dashboard/opportunities')}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 rounded-xl shadow-md font-medium min-w-[180px]"
            >
              <Plus size={18} />
              Create New
            </button>
          </div>
        </div>

        {filteredOpps.length === 0 ? (
          <div className="bg-white rounded-2xl shadow border p-12 text-center max-w-3xl mx-auto">
            <Briefcase className="h-20 w-20 mx-auto text-gray-400 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              No opportunities posted yet
            </h2>
            <p className="text-gray-600 mb-8">
              Create your first volunteer opportunity to connect with helpers.
            </p>
            <button
              onClick={() => (window.location.href = '/dashboard/opportunities')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3.5 rounded-xl font-medium shadow-sm"
            >
              Create Opportunity
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredOpps.map((opp) => {
              // Defensive skills handling
              const skillsArray = Array.isArray(opp.required_skills)
                ? opp.required_skills
                : typeof opp.required_skills === 'string'
                  ? opp.required_skills.split(',').map(s => s.trim()).filter(Boolean)
                  : [];

              return (
                <div
                  key={opp._id}
                  className="bg-white rounded-2xl shadow-md border overflow-hidden hover:shadow-xl transition-all group flex flex-col"
                >
                  <div className="relative h-56 md:h-64 overflow-hidden bg-gradient-to-br from-green-400 to-emerald-600">
                    <img
                      src={opp.image ? `${API_BASE}${opp.image}` : PLACEHOLDER_IMAGE}
                      alt={opp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`px-4 py-1.5 text-xs font-medium rounded-full text-white backdrop-blur-sm shadow-sm ${
                        (opp.status || 'open').toLowerCase() === 'open' ? 'bg-green-600' :
                        (opp.status || '').toLowerCase() === 'closed' ? 'bg-amber-600' : 'bg-gray-600'
                      }`}>
                        {(opp.status || 'OPEN').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-green-700">
                      {opp.title || 'Untitled'}
                    </h3>
                    <p className="text-gray-600 mb-5 line-clamp-3 flex-grow">
                      {opp.description || 'No description'}
                    </p>

                    <div className="space-y-2 text-sm text-gray-700 mb-5">
                      {opp.location && (
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-green-600" />
                          <span className="truncate">{opp.location}</span>
                        </div>
                      )}
                      {opp.duration && (
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-green-600" />
                          <span>{opp.duration}</span>
                        </div>
                      )}
                    </div>

                    {skillsArray.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {skillsArray.slice(0, 4).map((skill, i) => (
                          <span
                            key={`${skill}-${i}`}
                            className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {skillsArray.length > 4 && (
                          <span className="text-xs text-gray-500 self-center">
                            +{skillsArray.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-5 bg-gray-50 border-t flex justify-end gap-4">
                    <button
                      onClick={() => openEditModal(opp)}
                      className="flex items-center gap-2 px-5 py-2.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                      Edit
                    </button>
                    <Link
                      to={`/dashboard/opportunity-applications/${opp._id}`}
                      className="flex items-center gap-2 px-5 py-2.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Users size={18} />
                      Applications
                    </Link>
                    <button
                      onClick={() => handleDelete(opp._id)}
                      className="flex items-center gap-2 px-5 py-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal - unchanged from previous version */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-3xl font-bold text-gray-900">Edit Opportunity</h2>
              <button onClick={closeEditModal} className="p-2 rounded-full hover:bg-gray-100">
                <X size={32} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-6 md:p-8 space-y-8">
              <div className="space-y-4">
                <label className="block text-xl font-semibold">
                  Opportunity Image
                </label>
                <label className="w-full md:w-80 h-80 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-green-500 transition-colors overflow-hidden bg-gray-50 relative">
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload className="text-gray-400 mb-3" size={48} />
                      <p className="text-gray-500 text-center">Click to change image<br />(optional)</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              <div>
                <label className="block text-xl font-semibold mb-3">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 text-lg shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xl font-semibold mb-3">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={7}
                  required
                  className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 text-base shadow-sm"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xl font-semibold mb-3">Required Skills</label>
                  <input
                    name="required_skills"
                    value={formData.required_skills}
                    onChange={handleChange}
                    className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 shadow-sm"
                    placeholder="comma separated"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xl font-semibold mb-3">Duration</label>
                    <input
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xl font-semibold mb-3">Location</label>
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-5 pt-8 border-t">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-10 py-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium text-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-10 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-md"
                >
                  Update Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}