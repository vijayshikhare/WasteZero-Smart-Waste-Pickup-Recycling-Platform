// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  User, 
  MapPin, 
  Briefcase, 
  FileText, 
  Save, 
  AlertCircle, 
  CheckCircle2,
  Loader2 
} from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    skills: '',
    bio: '',
  });
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        location: user.location || '',
        skills: user.skills?.join(', ') || '',
        bio: user.bio || '',
      });
      setIsLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSaving(true);

    try {
      const payload = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        bio: formData.bio.trim(),
        skills: formData.skills
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
      };

      await axios.put('http://localhost:5000/api/auth/profile', payload, {
        withCredentials: true,
      });

      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Failed to update profile. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 lg:mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-3">
              <User className="w-9 h-9 text-green-600" />
              Your Profile
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your personal information and preferences
            </p>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p>{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left column - Read-only info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="p-6 lg:p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" />
                  Account Information
                </h2>

                <div className="space-y-5">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900 mt-1">{user.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900 mt-1 break-all">{user.email}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium capitalize text-gray-900 mt-1">
                      {user.role === 'ngo' ? 'NGO / Organization' : user.role}
                    </p>
                  </div>

                  {user.location && (
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-900 mt-1">{user.location}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Edit form */}
          <div className="lg:col-span-2">
            <form 
              onSubmit={handleSubmit} 
              className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
            >
              <div className="p-6 lg:p-8 space-y-7">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Edit Profile Details
                </h2>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="e.g. Nagpur, Maharashtra"
                    />
                  </div>
                </div>

                {/* Skills - Volunteers only */}
                {user.role === 'volunteer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Skills <span className="text-gray-500 text-xs">(comma separated)</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="waste sorting, driving, community outreach, awareness campaigns..."
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500">
                      Examples: plastic sorting, event organization, transportation
                    </p>
                  </div>
                )}

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Bio / About You
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                    placeholder="Tell others a bit about yourself, your motivation for joining WasteZero, or your experience..."
                  />
                </div>

                {/* Submit */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`
                      w-full sm:w-auto flex items-center justify-center gap-2 
                      px-8 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 
                      text-white font-semibold rounded-xl shadow-lg
                      hover:from-green-700 hover:to-emerald-700 hover:shadow-xl
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                      transition-all duration-200
                      disabled:opacity-60 disabled:cursor-not-allowed
                      active:scale-[0.98]
                    `}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}