// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { 
  Recycle, 
  CalendarCheck, 
  Users, 
  ArrowRight 
} from 'lucide-react'; // ← install: npm install lucide-react

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 overflow-hidden">
      {/* Subtle background pattern / overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(34,197,94,0.08),transparent_50%)] pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Hero Section */}
        <main className="flex-grow flex items-center justify-center px-5 sm:px-8 py-16 md:py-24">
          <div className="w-full max-w-5xl mx-auto text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-green-900 tracking-tight mb-6 md:mb-8 leading-tight">
                WasteZero
                <span className="inline-block ml-3 md:ml-4 text-green-600 animate-pulse-slow">♻️</span>
              </h1>

              <p className="text-xl sm:text-2xl md:text-3xl text-gray-700 font-medium mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed">
                Smart waste collection • Responsible recycling • Community impact
              </p>

              <p className="text-lg md:text-xl text-gray-600 mb-10 md:mb-14 max-w-2xl mx-auto">
                Schedule pickups in minutes, categorize waste correctly, connect with local volunteers and NGOs — all in one place.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8">
                <Link
                  to="/register"
                  className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xl font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
                >
                  Get Started Free
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-3 px-10 py-5 border-2 border-green-600 text-green-700 text-xl font-semibold rounded-2xl hover:bg-green-50 hover:text-green-800 transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50"
                >
                  Already have an account? Login
                </Link>
              </div>
            </div>

            {/* Value propositions / trust signals */}
            <div className="mt-16 md:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 animate-fade-in-up delay-200">
              <div className="flex flex-col items-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-md border border-green-100 hover:shadow-lg transition-shadow">
                <CalendarCheck className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Easy Scheduling</h3>
                <p className="text-gray-600">Book waste pickups in 30 seconds</p>
              </div>

              <div className="flex flex-col items-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-md border border-green-100 hover:shadow-lg transition-shadow">
                <Recycle className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Smart Sorting</h3>
                <p className="text-gray-600">Guidance for plastic, organic, e-waste & more</p>
              </div>

              <div className="flex flex-col items-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-md border border-green-100 hover:shadow-lg transition-shadow">
                <Users className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Community Power</h3>
                <p className="text-gray-600">Connect volunteers & NGOs near you</p>
              </div>
            </div>
          </div>
        </main>

        {/* Optional subtle footer bar */}
        <footer className="py-8 text-center text-gray-500 text-sm border-t border-green-100 bg-white/40 backdrop-blur-sm">
          <p>WasteZero © {new Date().getFullYear()} • Making Nagpur cleaner, together</p>
        </footer>
      </div>
    </div>
  );
}