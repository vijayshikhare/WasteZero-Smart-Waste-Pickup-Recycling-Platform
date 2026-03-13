// src/pages/opportunities/OpportunitiesList.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Loader2, Upload, AlertCircle, Trash2 } from 'lucide-react';

export default function OpportunitiesList() {
  const { api, user } = useAuth();

  // Only NGOs can access this page
  if (user?.role !== 'ngo') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-10 text-center max-w-lg w-full">
          <AlertCircle className="h-16 w-16 mx-auto text-yellow-600 mb-5" />
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">Access Restricted</h2>
          <p className="text-yellow-700 mb-6">
            Only NGOs can create and manage volunteer opportunities.
          </p>
          <p className="text-gray-600">
            Browse available opportunities from the main page.
          </p>
        </div>
      </div>
    );
  }

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    required_skills: '',
    duration: '',
    location: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // List of my opportunities (fetched after create or on mount)
  const [myOpportunities, setMyOpportunities] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  // Fetch my opportunities on mount and after create
  const fetchMyOpportunities = async () => {
    try {
      setListLoading(true);
      const res = await api.get('/api/opportunities/my');
      setMyOpportunities(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch my opportunities:', err);
      toast.error('Could not load your opportunities');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOpportunities();
  }, [api]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');
    if (!file.type.startsWith('image/')) return toast.error('Only images allowed');

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      required_skills: '',
      duration: '',
      location: '',
    });
    setImageFile(null);
    setImagePreview(null);
    setSuccess(false);
  };

  // Helper to build full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-opportunity.jpg';
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const title = formData.title.trim();
    const description = formData.description.trim();

    if (!title) return toast.error('Title is required');
    if (description.length < 20) {
      return toast.error('Description must be at least 20 characters long');
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append('title', title);
      form.append('description', description);

      // Skills as array (using [] suffix for safer parsing)
      const skills = formData.required_skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      skills.forEach((skill) => form.append('required_skills[]', skill));

      if (formData.duration?.trim()) form.append('duration', formData.duration.trim());
      if (formData.location?.trim()) form.append('location', formData.location.trim());
      if (imageFile) form.append('image', imageFile);

      // 1. Create opportunity
      await api.post('/api/opportunities', form);

      toast.success('Opportunity created successfully!');

      // 2. Refresh the list immediately
      await fetchMyOpportunities();

      setSuccess(true);
      resetForm();
    } catch (err) {
      console.error('Create failed:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.map((e) => e.message).join(', ') ||
        'Failed to create opportunity. Please check inputs or try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Create Form */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Create New Volunteer Opportunity
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Share your initiative with volunteers in the community
          </p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center mb-12">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-4">Success!</h2>
            <p className="text-green-700 mb-8">
              Your opportunity is now live and visible to volunteers.
            </p>
            <button
              onClick={resetForm}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium shadow"
            >
              Create Another Opportunity
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-lg border p-6 sm:p-10 space-y-8 mb-16"
          >
            {/* Image */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Opportunity Image (optional)
              </label>
              <label className="block w-full max-w-lg h-64 rounded-xl border-2 border-dashed border-gray-300 hover:border-green-500 transition-colors cursor-pointer overflow-hidden bg-gray-50 relative">
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <Upload size={40} className="mb-3" />
                    <p className="font-medium">Click or drag image here</p>
                    <p className="text-sm mt-1">JPG, PNG • max 5MB</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            {/* Title */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Title <span className="text-red-600">*</span>
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                placeholder="e.g. River Cleanup Campaign – Nagpur"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Description <span className="text-red-600">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={7}
                required
                minLength={20}
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                placeholder="Describe the activity, goals, date/time, what volunteers will do, any requirements... (minimum 20 characters)"
              />
              <p
                className={`text-sm mt-1.5 ${
                  formData.description.length < 20 ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {formData.description.length} characters{' '}
                {formData.description.length < 20 ? '(need at least 20)' : '✓'}
              </p>
            </div>

            {/* Skills, Duration, Location */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  Required Skills
                </label>
                <input
                  name="required_skills"
                  value={formData.required_skills}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="cleaning, teamwork, first aid (comma separated)"
                />
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">
                    Duration
                  </label>
                  <input
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    placeholder="e.g. 4 hours, full day, ongoing"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">
                    Location
                  </label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    placeholder="e.g. Futala Lake, Nagpur, Maharashtra"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={resetForm}
                className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 font-medium transition-colors"
              >
                Reset Form
              </button>

              <button
                type="submit"
                disabled={loading}
                className={`px-10 py-3 rounded-xl font-medium text-white flex items-center gap-2 transition-colors ${
                  loading
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 shadow-md'
                }`}
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Creating...' : 'Create Opportunity'}
              </button>
            </div>
          </form>
        )}

        {/* My Opportunities List */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Opportunities</h2>

          {listLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-green-600" />
            </div>
          ) : myOpportunities.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
              <p className="text-gray-600 text-lg">You haven't created any opportunities yet.</p>
              <p className="text-gray-500 mt-2">Create one above to get started!</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {myOpportunities.map((opp) => (
                <div
                  key={opp._id}
                  className="bg-white rounded-xl shadow border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {opp.image ? (
                    <img
                      src={getImageUrl(opp.image)}
                      alt={opp.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-opportunity.jpg';
                        e.target.onerror = null;
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <p className="text-gray-400">No image</p>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {opp.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{opp.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {opp.required_skills?.length > 0 &&
                        opp.required_skills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}