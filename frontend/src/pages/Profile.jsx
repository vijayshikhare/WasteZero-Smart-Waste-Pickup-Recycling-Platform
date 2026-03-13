// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Assuming API_BASE is exported or import it
import toast from 'react-hot-toast';
import {
  User,
  Camera,
  Save,
  Lock,
  MapPin,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Profile() {
  const { user, updateProfile, checkAuth } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    location: '',
    skills: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setFormData({
      name: user.name || '',
      email: user.email || '',
      address: user.address || '',
      location: user.location || '',
      skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

    // Set preview: blob (new) or full backend URL (existing)
    if (user.profilePicture) {
      const src = user.profilePicture.startsWith('http')
        ? user.profilePicture
        : `${API_BASE}${user.profilePicture.startsWith('/') ? '' : '/'}${user.profilePicture}`;
      setPhotoPreview(src);
    } else {
      setPhotoPreview(null);
    }

    // Cleanup blob URLs
    return () => {
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPG, PNG, or WebP allowed');
      return;
    }

    setProfilePhoto(file);
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);

    // Cleanup previous blob if exists
    if (photoPreview && photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = new FormData();

      if (formData.name.trim()) payload.append('name', formData.name.trim());
      if (formData.email.trim()) payload.append('email', formData.email.trim());
      if (formData.address?.trim()) payload.append('address', formData.address.trim());
      if (formData.location?.trim()) payload.append('location', formData.location.trim());
      if (formData.skills?.trim()) {
        formData.skills
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
          .forEach(skill => payload.append('skills', skill));
      }

      if (formData.newPassword && formData.currentPassword) {
        payload.append('currentPassword', formData.currentPassword);
        payload.append('newPassword', formData.newPassword);
      }

      if (profilePhoto) {
        payload.append('profilePicture', profilePhoto);
      }

      await updateProfile(payload);

      // Refresh user data (should now have updated profilePicture URL)
      await checkAuth();

      toast.success('Profile updated successfully!');
      setProfilePhoto(null); // Clear file input state

      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
      console.error('Profile update error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute final image source with fallback
  const avatarSrc = photoPreview || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=10b981&color=fff&size=256`;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-5 sm:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border">
          {/* Profile Header with Photo */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-8 py-14 text-white relative">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="relative group">
                <img
                  src={avatarSrc}
                  alt="Profile"
                  className="h-32 w-32 sm:h-40 sm:w-40 rounded-full object-cover border-4 border-white/90 shadow-2xl transition-all group-hover:scale-105 duration-300"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=U&background=10b981&color=fff&size=256`;
                  }}
                />

                <label
                  htmlFor="profile-photo"
                  className="absolute bottom-2 right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-100 transition-colors"
                  title="Change profile picture"
                >
                  <Camera size={22} className="text-green-700" />
                </label>

                <input
                  id="profile-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoChange}
                  disabled={isSubmitting}
                />
              </div>

              <div className="text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  {formData.name || user?.name || 'Your Profile'}
                </h1>
                <p className="mt-2 text-green-100/90 text-lg">{formData.email || user?.email}</p>
                {user?.location && (
                  <p className="mt-1 text-green-100/80 flex items-center justify-center sm:justify-start gap-2">
                    <MapPin size={18} />
                    {user.location}
                  </p>
                )}
                {user?.skills && user.skills.length > 0 && (
                  <p className="mt-1 text-green-100/80 text-sm">
                    Skills: {user.skills.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-12">
            {/* Personal Info */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <User size={24} className="text-green-600" />
                Personal Information
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin size={18} className="text-green-600" />
                    Location
                  </label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Nagpur, Maharashtra"
                    disabled={isSubmitting}
                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills / Waste Types
                  </label>
                  <input
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="e.g. pickup, sorting, composting"
                    disabled={isSubmitting}
                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">Comma-separated list</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin size={18} className="text-green-600" />
                    Address
                  </label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g. Kothrud, Pune, Maharashtra"
                    disabled={isSubmitting}
                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                  />
                </div>
              </div>
            </section>

            {/* Password Change */}
            <section className="border-t border-gray-200 pt-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <Lock size={24} className="text-green-600" />
                Change Password (optional)
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Required to change password"
                    disabled={isSubmitting}
                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Leave blank to keep current"
                    disabled={isSubmitting}
                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                    disabled={isSubmitting}
                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                  />
                </div>
              </div>
            </section>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center gap-3 px-10 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}