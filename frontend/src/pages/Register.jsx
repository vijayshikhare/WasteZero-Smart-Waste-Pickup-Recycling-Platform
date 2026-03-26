// src/pages/Register.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  UserPlus, Mail, Lock, User, Building2, AlertCircle, ArrowRight, ShieldCheck, Loader2, Eye, EyeOff 
} from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'volunteer',
    ngoCertificationCode: '',
    adminSecretKey: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 separate digits
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState('password'); // 'password' | 'otp'
  const [otpSent, setOtpSent] = useState(false);

  const { register, checkAuth, api } = useAuth();
  const navigate = useNavigate();

  // Auto-focus first OTP digit when OTP mode starts
  useEffect(() => {
    if (authMode === 'otp' && otpSent) {
      document.getElementById('otp-0')?.focus();
    }
  }, [authMode, otpSent]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Full name is required');
      toast.error('Full name is required');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      toast.error('Email is required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Validate authorization codes
    if (formData.role === 'ngo' && !formData.ngoCertificationCode.trim()) {
      setError('NGO Certification Code is required');
      toast.error('Please enter your NGO Certification Code');
      return;
    }

    if (formData.role === 'admin' && !formData.adminSecretKey.trim()) {
      setError('Admin Master Key is required');
      toast.error('Please enter the Admin Master Key');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        role: formData.role,
        ngoCertificationCode: formData.ngoCertificationCode.trim(),
        adminSecretKey: formData.adminSecretKey.trim(),
      });
      // AuthContext will show a success toast on successful registration
      await checkAuth();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed.';

      if (msg.includes('disposable') || msg.includes('temporary')) {
        toast.error('Temporary or disposable emails not allowed.');
      } else if (msg.includes('invalid') || msg.includes('domain')) {
        toast.error('Invalid email domain.');
      } else if (msg.includes('already registered')) {
        toast.error('Email already registered. Please login.');
      } else {
        toast.error(msg);
      }

      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const nameTrim = formData.name.trim();
    const emailTrim = formData.email.trim();

    if (!nameTrim || !emailTrim) {
      setError('Name and email are required');
      toast.error('Name and email are required');
      return;
    }

    // Validate authorization codes
    if (formData.role === 'ngo' && !formData.ngoCertificationCode.trim()) {
      setError('NGO Certification Code is required');
      toast.error('Please enter your NGO Certification Code');
      return;
    }

    if (formData.role === 'admin' && !formData.adminSecretKey.trim()) {
      setError('Admin Master Key is required');
      toast.error('Please enter the Admin Master Key');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await api.post('/api/auth/send-otp', { email: emailTrim });
      setOtpSent(true);
      toast.success('OTP sent! Check your email (including spam).');
      setError('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP.';

      if (msg.includes('disposable') || msg.includes('temporary')) {
        toast.error('Temporary/disposable emails not allowed.');
      } else if (msg.includes('invalid') || msg.includes('domain')) {
        toast.error('Invalid email domain.');
      } else {
        toast.error(msg);
      }

      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const cleanOtp = otp.join('');
    if (cleanOtp.length !== 6) {
      setError('Enter a valid 6-digit OTP');
      toast.error('Invalid OTP format');
      return;
    }

    // Validate authorization codes
    if (formData.role === 'ngo' && !formData.ngoCertificationCode.trim()) {
      setError('NGO Certification Code is required');
      toast.error('Please enter your NGO Certification Code');
      return;
    }

    if (formData.role === 'admin' && !formData.adminSecretKey.trim()) {
      setError('Admin Master Key is required');
      toast.error('Please enter the Admin Master Key');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await api.post('/api/auth/verify-otp', { 
        email: formData.email.trim(), 
        otp: cleanOtp,
        role: formData.role,
        ngoCertificationCode: formData.ngoCertificationCode.trim(),
        adminSecretKey: formData.adminSecretKey.trim(),
      });

      // AuthContext will show a success toast on successful OTP verification
      await checkAuth();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP';
      toast.error(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (value.length > 1) value = value[0]; // single digit only
    if (!/^\d*$/.test(value)) return; // only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next field
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-8 py-10 text-white text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
              <UserPlus className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Join WasteZero</h2>
            <p className="mt-3 text-green-100 text-lg">
              Help build a cleaner, smarter Nagpur
            </p>
          </div>

          {/* Form content */}
          <div className="px-8 pt-8 pb-10">
            {error && (
              <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Auth Mode Toggle */}
            <div className="flex justify-center gap-4 mb-8">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('password');
                  setError('');
                  setOtpSent(false);
                  setOtp(['','','','','','']);
                }}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  authMode === 'password'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Password Signup
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('otp');
                  setError('');
                }}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  authMode === 'otp'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Email OTP Signup
              </button>
            </div>

            <form 
              onSubmit={authMode === 'password' ? handlePasswordSubmit : (e) => e.preventDefault()}
              className="space-y-6"
            >
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>

                  {/* NGO Certification Code - Only for NGO (password flow) */}
                  {formData.role === 'ngo' && (
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <label htmlFor="ngoCertificationCodePw" className="block text-sm font-medium text-blue-900 mb-1.5">
                        🏢 NGO Certification Code
                      </label>
                      <p className="text-xs text-blue-700 mb-2">Enter the certification code provided by WasteZero admins for your organization</p>
                      <input
                        id="ngoCertificationCodePw"
                        type="password"
                        name="ngoCertificationCode"
                        value={formData.ngoCertificationCode}
                        onChange={handleChange}
                        className="block w-full px-4 py-2.5 border border-blue-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter your NGO certification code"
                        disabled={isLoading}
                      />
                    </div>
                  )}

                  {/* Admin Secret Key - Only for Admin (password flow) */}
                  {formData.role === 'admin' && (
                    <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                      <label htmlFor="adminSecretKeyPw" className="block text-sm font-medium text-purple-900 mb-1.5">
                        👨‍💼 Admin Master Key
                      </label>
                      <p className="text-xs text-purple-700 mb-2">Enter the master key to register as a platform administrator</p>
                      <input
                        id="adminSecretKeyPw"
                        type="password"
                        name="adminSecretKey"
                        value={formData.adminSecretKey}
                        onChange={handleChange}
                        className="block w-full px-4 py-2.5 border border-purple-300 bg-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                        placeholder="Enter admin master key"
                        disabled={isLoading}
                      />
                    </div>
                  )}
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors placeholder-gray-400"
                    placeholder="John Doe"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors placeholder-gray-400"
                    placeholder="you@example.com"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {authMode === 'password' ? (
                <>
                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors placeholder-gray-400"
                        placeholder="••••••••"
                        required
                        minLength={6}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1.5">
                      I want to join as
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="block w-full pl-11 pr-4 py-3 border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors appearance-none"
                        disabled={isLoading}
                      >
                        <option value="volunteer">🤝 Volunteer / Individual</option>
                        <option value="ngo">🏢 NGO / Organization</option>
                        <option value="admin">👨‍💼 Admin / Platform Manager</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`
                      w-full flex items-center justify-center gap-2 
                      py-3.5 px-6 bg-gradient-to-r from-green-600 to-emerald-600 
                      text-white font-semibold rounded-xl shadow-lg
                      hover:from-green-700 hover:to-emerald-700 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                      transition-all duration-200
                      disabled:opacity-60 disabled:cursor-not-allowed
                      hover:shadow-xl hover:shadow-green-200/50
                      active:scale-[0.98]
                    `}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  {/* Role */}
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1.5">
                      I want to join as
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="block w-full pl-11 pr-4 py-3 border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors appearance-none"
                        disabled={isLoading}
                      >
                        <option value="volunteer">🤝 Volunteer / Individual</option>
                        <option value="ngo">🏢 NGO / Organization</option>
                        <option value="admin">👨‍💼 Admin / Platform Manager</option>
                      </select>
                    </div>
                  </div>

                  {/* NGO Certification Code - Only for NGO */}
                  {formData.role === 'ngo' && (
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <label htmlFor="ngoCertificationCodeOtp" className="block text-sm font-medium text-blue-900 mb-1.5">
                        🏢 NGO Certification Code
                      </label>
                      <p className="text-xs text-blue-700 mb-2">Enter the certification code provided by WasteZero admins for your organization</p>
                      <input
                        id="ngoCertificationCodeOtp"
                        type="password"
                        name="ngoCertificationCode"
                        value={formData.ngoCertificationCode}
                        onChange={handleChange}
                        className="block w-full px-4 py-2.5 border border-blue-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter your NGO certification code"
                        disabled={isLoading}
                      />
                    </div>
                  )}

                  {/* Admin Secret Key - Only for Admin */}
                  {formData.role === 'admin' && (
                    <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                      <label htmlFor="adminSecretKeyOtp" className="block text-sm font-medium text-purple-900 mb-1.5">
                        👨‍💼 Admin Master Key
                      </label>
                      <p className="text-xs text-purple-700 mb-2">Enter the master key to register as a platform administrator</p>
                      <input
                        id="adminSecretKeyOtp"
                        type="password"
                        name="adminSecretKey"
                        value={formData.adminSecretKey}
                        onChange={handleChange}
                        className="block w-full px-4 py-2.5 border border-purple-300 bg-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                        placeholder="Enter admin master key"
                        disabled={isLoading}
                      />
                    </div>
                  )}

                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isLoading || !formData.name.trim() || !formData.email.trim()}
                      className={`
                        w-full flex items-center justify-center gap-2
                        py-3.5 px-6 bg-gradient-to-r from-green-600 to-emerald-600
                        text-white font-semibold rounded-xl shadow-lg
                        hover:from-green-700 hover:to-emerald-700
                        disabled:opacity-60 disabled:cursor-not-allowed
                        transition-all duration-200
                        hover:shadow-xl hover:shadow-green-200/50
                        active:scale-[0.98]
                      `}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send OTP to Email'
                      )}
                    </button>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5 text-emerald-600" />
                          Enter 6-digit OTP
                        </label>
                        <div className="flex justify-center gap-3">
                          {otp.map((digit, index) => (
                            <input
                              key={index}
                              id={`otp-${index}`}
                              type="text"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(e.target.value, index)}
                              onKeyDown={(e) => handleOtpKeyDown(e, index)}
                              className="w-12 h-12 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                              autoComplete="one-time-code"
                              disabled={isLoading}
                            />
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={isLoading || otp.some(d => !d)}
                        className={`
                          w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600
                          text-white font-semibold rounded-xl shadow-lg
                          hover:from-emerald-700 hover:to-teal-700
                          disabled:opacity-60 disabled:cursor-not-allowed
                          transition-all duration-200
                          hover:shadow-xl hover:shadow-emerald-200/50
                          active:scale-[0.98]
                        `}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          'Verify & Create Account'
                        )}
                      </button>

                      <div className="text-center mt-4">
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="text-sm text-green-700 hover:text-green-800 hover:underline transition-colors"
                          disabled={isLoading}
                        >
                          Didn't receive OTP? Resend
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-green-700 hover:text-green-800 transition-colors hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Your data is secure • Join our mission for a cleaner Nagpur
        </p>
      </div>
    </div>
  );
}