// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { 
  Recycle, 
  CalendarCheck, 
  Users, 
  ArrowRight,
  Leaf,
  HeartHandshake,
  MapPin
} from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 overflow-hidden">
      {/* Subtle animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(52,211,153,0.12),transparent_40%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(34,197,94,0.08),transparent_50%)] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Hero Section */}
        <main className="flex-grow flex items-center justify-center px-5 sm:px-8 py-16 md:py-24">
          <div className="w-full max-w-6xl mx-auto text-center">
            {/* Logo & Title */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-4 mb-6 md:mb-8">
                <div className="relative">
                  <Recycle className="h-14 w-14 md:h-16 md:w-16 text-green-600 animate-spin-slow" />
                  <span className="absolute -top-2 -right-2 h-5 w-5 bg-green-400 rounded-full animate-ping opacity-75"></span>
                </div>
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-green-900 tracking-tight">
                  WasteZero
                </h1>
              </div>

              {/* Tagline */}
              <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6 md:mb-8 leading-tight">
                Turn Waste into Impact
              </p>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-medium max-w-4xl mx-auto mb-10 md:mb-14 leading-relaxed">
                Smart scheduling • Responsible recycling • Community-powered collection
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8 mb-16 md:mb-20">
                <Link
                  to="/register"
                  className="group relative inline-flex items-center gap-3 px-10 sm:px-12 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Get Started Free
                  <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-3 px-10 sm:px-12 py-5 border-2 border-green-600 text-green-700 text-xl font-bold rounded-2xl hover:bg-green-50 hover:text-green-800 transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50"
                >
                  Already have an account? Sign In
                </Link>
              </div>
            </div>

            {/* Trust / Value Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 animate-fade-in-up delay-200">
              <div className="group bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-green-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-green-100 rounded-full">
                    <CalendarCheck className="h-10 w-10 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Schedule in Seconds</h3>
                <p className="text-gray-600 text-lg">
                  Book waste pickups instantly from your phone — no calls, no waiting.
                </p>
              </div>

              <div className="group bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-green-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-green-100 rounded-full">
                    <Recycle className="h-10 w-10 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Smart Waste Sorting</h3>
                <p className="text-gray-600 text-lg">
                  Get guidance for plastic, organic, e-waste, metal — reduce contamination.
                </p>
              </div>

              <div className="group bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-green-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-green-100 rounded-full">
                    <HeartHandshake className="h-10 w-10 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Community Impact</h3>
                <p className="text-gray-600 text-lg">
                  Connect with volunteers & NGOs — turn waste into real change in Nagpur.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Subtle Footer */}
        <footer className="py-10 text-center text-gray-600 text-sm border-t border-green-100 bg-white/40 backdrop-blur-sm">
          <p>WasteZero © {new Date().getFullYear()} • Building a cleaner, greener Nagpur together</p>
        </footer>
      </div>
    </div>
  );
}