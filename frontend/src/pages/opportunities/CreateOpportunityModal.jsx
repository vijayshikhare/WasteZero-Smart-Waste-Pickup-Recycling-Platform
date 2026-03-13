// src/pages/opportunities/CreateOpportunityModal.jsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import { X, Upload } from 'lucide-react';

export default function CreateOpportunityModal({ isOpen, onClose, onSuccess, api }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    required_skills: '',
    duration: '',
    location: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  if (!isOpen) return null;

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

    try {
      const form = new FormData();
      form.append('title', formData.title.trim());
      form.append('description', formData.description.trim());

      // Send skills as array (most common backend expectation)
      const skills = formData.required_skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      skills.forEach(skill => form.append('required_skills', skill));

      form.append('duration', formData.duration.trim());
      form.append('location', formData.location.trim());
      if (imageFile) form.append('image', imageFile);

      // IMPORTANT: do NOT set Content-Type header manually
      await api.post('/api/opportunities', form);

      toast.success('Opportunity created!');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('[Create] Full error:', err.response?.data || err);
      toast.error(err.response?.data?.message || 'Failed to create opportunity');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-5">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto">
        <div className="p-7 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-3xl font-bold text-gray-900">Create New Opportunity</h2>
          <button onClick={onClose} className="p-3 rounded-full hover:bg-gray-100">
            <X size={32} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-10">
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

          <div className="flex justify-end gap-6 pt-10 border-t">
            <button
              type="button"
              onClick={onClose}
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
  );
}