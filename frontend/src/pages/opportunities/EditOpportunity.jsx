// src/pages/opportunities/EditOpportunity.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, Upload, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const PLACEHOLDER_IMAGE = 'https://placehold.co/800x600/10b981/ffffff/png?text=Volunteer+Opportunity';

export default function EditOpportunity() {
  const { opportunityId } = useParams();
  const navigate = useNavigate();
  const { api, user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    required_skills: '',
    duration: '',
    location: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const res = await api.get(`/api/opportunities/${opportunityId}`);
        const opp = res.data?.data || res.data;

        // Check ownership (extra safety)
        const ownerId = opp.ngo_id?._id ? opp.ngo_id._id.toString() : opp.ngo_id;
        if (user?.role !== 'ngo' || ownerId !== user?._id) {
          toast.error("You don't have permission to edit this opportunity");
          navigate('/dashboard/opportunities');
          return;
        }

        setFormData({
          title: opp.title || '',
          description: opp.description || '',
          required_skills: opp.required_skills?.join(', ') || '',
          duration: opp.duration || '',
          location: opp.location || '',
        });

        setCurrentImage(opp.image ? `${API_BASE}${opp.image}` : PLACEHOLDER_IMAGE);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load opportunity');
        navigate('/dashboard/opportunities');
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunity();
  }, [opportunityId, api, user, navigate]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      return toast.error('Title and description are required');
    }

    setSaving(true);

    try {
      const form = new FormData();
      form.append('title', formData.title.trim());
      form.append('description', formData.description.trim());

      const skills = formData.required_skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      skills.forEach(skill => form.append('required_skills', skill));

      form.append('duration', formData.duration.trim());
      form.append('location', formData.location.trim());

      if (imageFile) {
        form.append('image', imageFile);
      }

      await api.put(`/api/opportunities/${opportunityId}`, form);

      toast.success('Opportunity updated successfully!');
      navigate('/dashboard/opportunities');
    } catch (err) {
      console.error('Update error:', err.response?.data || err);
      toast.error(err.response?.data?.message || 'Failed to update opportunity');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-5 sm:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/dashboard/opportunities')}
          className="flex items-center gap-2 text-green-700 hover:text-green-900 mb-8 font-medium"
        >
          <ArrowLeft size={20} /> Back to Opportunities
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-10">Edit Opportunity</h1>

        <form onSubmit={handleSubmit} className="space-y-10 bg-white p-8 rounded-2xl shadow-lg border">
          {/* Image */}
          <div className="space-y-5">
            <label className="block text-xl font-semibold">
              Opportunity Image
            </label>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-80 h-64 rounded-xl overflow-hidden border bg-gray-50">
                <img
                  src={imagePreview || currentImage || PLACEHOLDER_IMAGE}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={e => e.target.src = PLACEHOLDER_IMAGE}
                />
              </div>

              <label className="flex-1 cursor-pointer">
                <div className="border-2 border-dashed border-gray-400 rounded-xl p-8 text-center hover:border-green-500 transition-colors">
                  <Upload className="mx-auto text-gray-500 mb-4" size={40} />
                  <p className="font-medium">Click to upload new image (optional)</p>
                  <p className="text-sm text-gray-500 mt-2">JPG, PNG • max 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xl font-semibold mb-4">Title *</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 text-lg"
              placeholder="e.g. Beach Cleanup Drive"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xl font-semibold mb-4">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={8}
              required
              className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 text-base leading-relaxed"
              placeholder="Describe the activity, goals, what volunteers will do..."
            />
          </div>

          {/* Skills, Duration, Location */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xl font-semibold mb-4">Required Skills</label>
              <input
                name="required_skills"
                value={formData.required_skills}
                onChange={handleChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                placeholder="teaching, first aid, event planning (comma separated)"
              />
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-xl font-semibold mb-4">Duration</label>
                <input
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. 3 hours, 2 days, ongoing"
                />
              </div>

              <div>
                <label className="block text-xl font-semibold mb-4">Location</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. Nagpur, Maharashtra"
                />
              </div>

              <div>
                <label className="block text-xl font-semibold mb-4">Status</label>
                <select
                  name="status"
                  value={formData.status || 'open'}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-6 pt-8 border-t">
            <button
              type="button"
              onClick={() => navigate('/dashboard/opportunities')}
              className="px-10 py-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold text-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-10 py-4 rounded-xl font-semibold text-lg shadow-md transition-all ${
                saving
                  ? 'bg-green-400 text-white cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}