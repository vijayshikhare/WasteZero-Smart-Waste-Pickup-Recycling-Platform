// src/pages/Login.jsx
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  LogIn,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 digits
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState('password'); // 'password' | 'otp'
  const [otpSent, setOtpSent] = useState(false);

  const { login, api } = useAuth();
  const navigate = useNavigate();

  // Refs for OTP inputs (auto-focus)
  const otpRefs = useRef([]);

  // Focus first OTP input when OTP mode is active and OTP is sent
  useEffect(() => {
    if (authMode === 'otp' && otpSent && otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, [authMode, otpSent]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    if (!cleanEmail) {
      setError('Email is required');
      toast.error('Please enter your email');
      return;
    }

    if (!cleanPass) {
      setError('Password is required');
      toast.error('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      await login(cleanEmail, cleanPass);
      toast.success('Login successful! Welcome back.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      let msg = 'Invalid email or password. Please try again.';

      if (err.response?.status === 401) {
        msg = 'Incorrect email or password.';
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;

        if (msg.includes('disposable') || msg.includes('temporary')) {
          msg = 'Temporary/disposable emails are not allowed.';
        } else if (msg.includes('invalid') || msg.includes('domain')) {
          msg = 'Invalid email domain.';
        } else if (msg.includes('no password set')) {
          msg = 'No password set for this account. Try Email OTP login.';
          setAuthMode('otp');
        }
      }

      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Email is required');
      toast.error('Email is required');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await api.post('/api/auth/send-otp', { email: cleanEmail });
      setOtpSent(true);
      setOtp(['', '', '', '', '', '']); // reset OTP fields
      toast.success('OTP sent! Check your inbox/spam folder.');
      setError('');
    } catch (err) {
      let msg = err.response?.data?.message || 'Failed to send OTP.';

      if (msg.includes('disposable') || msg.includes('temporary')) {
        msg = 'Temporary/disposable emails are not allowed.';
      } else if (msg.includes('invalid') || msg.includes('domain')) {
        msg = 'Invalid email domain.';
      } else if (msg.includes('already registered')) {
        msg = 'Email already registered. Try password login.';
      }

      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const cleanOtp = otp.join('');
    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setError('Please enter a valid 6-digit OTP');
      toast.error('Invalid OTP format');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await api.post('/api/auth/verify-otp', {
        email: email.trim(),
        otp: cleanOtp,
      });

      toast.success('OTP verified! Welcome back.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (value.length > 1) value = value[0]; // only one digit
    if (!/^\d?$/.test(value)) return; // only digits or empty

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e, index) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();

    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtp(digits);

      // Focus last input or submit if complete
      if (otpRefs.current[5]) otpRefs.current[5].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-8 py-10 text-white text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
              <LogIn className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
            <p className="mt-3 text-green-100 text-lg">
              Sign in to manage waste smarter
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
                  setOtp(['', '', '', '', '', '']);
                }}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  authMode === 'password'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('otp');
                  setError('');
                  setOtpSent(false);
                  setOtp(['', '', '', '', '', '']);
                }}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  authMode === 'otp'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Email OTP
              </button>
            </div>

            {authMode === 'password' ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors placeholder-gray-400"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      disabled={isLoading}
                    />
                  </div>
                </div>

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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors placeholder-gray-400"
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
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
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Email for OTP */}
                <div>
                  <label htmlFor="email-otp" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email-otp"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors placeholder-gray-400"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      disabled={isLoading || otpSent}
                    />
                  </div>
                </div>

                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isLoading || !email.trim()}
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
                    {/* OTP Inputs */}
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
                            ref={(el) => (otpRefs.current[index] = el)}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(e.target.value, index)}
                            onPaste={(e) => handleOtpPaste(e, index)}
                            onKeyDown={(e) => handleOtpKeyDown(e, index)}
                            className="w-12 h-12 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
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
                        'Verify & Login'
                      )}
                    </button>

                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp(['', '', '', '', '', '']);
                        }}
                        className="text-sm text-green-700 hover:text-green-800 hover:underline transition-colors disabled:opacity-50"
                        disabled={isLoading}
                      >
                        Didn't receive OTP? Resend
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="mt-8 text-center space-y-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-green-700 hover:text-green-800 transition-colors hover:underline"
                >
                  Create one now
                </Link>
              </p>

              <Link
                to="/forgot-password"
                className="text-sm text-green-700 hover:text-green-800 hover:underline transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Secure login • Your data stays private
        </p>
      </div>
    </div>
  );
}