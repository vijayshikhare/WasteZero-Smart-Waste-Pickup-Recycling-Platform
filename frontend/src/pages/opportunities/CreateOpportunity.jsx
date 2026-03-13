// src/pages/opportunities/OpportunitiesList.jsx
import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Loader2, Upload, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // optional - for redirect after success

export default function OpportunitiesList() {
  const { api, user } = useAuth();
  const navigate = useNavigate(); // optional

  // Only NGOs can create
  if (user?.role !== 'ngo') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-10 text-center max-w-lg w-full">
          <AlertCircle className="h-16 w-16 mx-auto text-yellow-600 mb-5" />
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">Access Restricted</h2>
          <p className="text-yellow-700 mb-6">
            Only NGOs can create volunteer opportunities.
          </p>
          <p className="text-gray-600">
            Browse available opportunities from the main page.
          </p>
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    required_skills: '',
    duration: '',
    location: '',
    status: 'open',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Ref to force re-mount file input after reset
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Only JPG, PNG, WebP images allowed');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    // Debug: confirm file is real
    console.log('[FILE SELECTED]', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      required_skills: '',
      duration: '',
      location: '',
    });

    // Revoke preview URL to free memory
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview(null);
    setSuccess(false);

    // Reset file input (prevents stale file)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

      // Skills - send each as separate entry
      const skills = formData.required_skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      skills.forEach(skill => form.append('required_skills', skill));

      if (formData.duration?.trim()) form.append('duration', formData.duration.trim());
      if (formData.location?.trim()) form.append('location', formData.location.trim());
      if (formData.status) form.append('status', formData.status);

      // Critical: only append if it's a real File
      if (imageFile && imageFile instanceof File) {
        form.append('image', imageFile);
        console.log('[SUBMIT] Appending image:', imageFile.name, imageFile.size);
      } else {
        console.log('[SUBMIT] No image file to send');
      }

      // Create opportunity
      const createRes = await api.post('/api/opportunities', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('[CREATE RESPONSE]', createRes.data);

      toast.success('Opportunity created successfully!');

      // Optional: re-fetch list to show new item with image
      // If you have a state/context for opportunities:
      // await fetchMyOpportunities();

      // Or redirect to my opportunities page
      navigate('/dashboard/opportunities'); // redirect NGOs to their dashboard list

      setSuccess(true);
      resetForm();
    } catch (err) {
      console.error('[CREATE ERROR]', err);
      let msg = 'Failed to create opportunity';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.response?.data?.errors) {
        msg = err.response.data.errors.map(e => e.message).join(', ');
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Create New Volunteer Opportunity
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Share your initiative with volunteers in the community
          </p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
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
            className="bg-white rounded-2xl shadow-lg border p-6 sm:p-10 space-y-8"
          >
            {/* Image Upload */}
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
                  ref={fileInputRef}
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
                placeholder="e.g. River Cleanup Campaign – Nashik"
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
                placeholder="Describe the activity, goals, date/time, what volunteers will do... (min 20 chars)"
              />
              <p className={`text-sm mt-1.5 ${formData.description.length < 20 ? 'text-red-600' : 'text-green-600'}`}>
                {formData.description.length} characters {formData.description.length < 20 ? '(need at least 20)' : '✓'}
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
                  placeholder="cleaning, teamwork, leadership (comma separated)"
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
                    placeholder="e.g. Futala Lake, Nashik, Maharashtra"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status || 'open'}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="completed">Completed</option>
                  </select>
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
      </div>
    </div>
  );
}