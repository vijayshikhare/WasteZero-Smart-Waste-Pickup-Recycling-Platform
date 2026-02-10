// src/pages/Dashboard.jsx
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Recycle, 
  CalendarCheck, 
  Users, 
  BarChart3, 
  ArrowRightCircle,
  Sparkles 
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Role-specific configuration
  const roleConfig = {
    volunteer: {
      heroTitle: "Welcome back, Volunteer!",
      heroSubtitle: "Thank you for helping make Nagpur cleaner",
      mainAction: {
        label: "Find Opportunities",
        path: "/opportunities",           // update when you implement Milestone 2
        description: "Browse available waste pickups, clean-up drives & volunteering events",
        icon: <CalendarCheck className="w-6 h-6" />,
      },
      accentColor: "green",
    },
    ngo: {
      heroTitle: "NGO Dashboard",
      heroSubtitle: "You're making a real difference in your community",
      mainAction: {
        label: "Create Opportunity",
        path: "/opportunities/new",
        description: "Post new waste collection requests, events or awareness campaigns",
        icon: <ArrowRightCircle className="w-6 h-6" />,
      },
      accentColor: "emerald",
    },
    admin: {
      heroTitle: "Admin Control Center",
      heroSubtitle: "Platform oversight & analytics",
      mainAction: {
        label: "View Platform Stats",
        path: "/admin/overview",
        description: "Monitor users, activity, reports and system health",
        icon: <BarChart3 className="w-6 h-6" />,
      },
      accentColor: "purple",
    },
  };

  const config = roleConfig[user.role] || roleConfig.volunteer;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Welcome / Hero Section */}
        <div className={`bg-gradient-to-r from-${config.accentColor}-600 to-${config.accentColor}-700 rounded-3xl shadow-2xl overflow-hidden mb-10 lg:mb-12`}>
          <div className="px-6 py-12 sm:px-12 sm:py-16 md:flex md:items-center md:justify-between relative">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <Sparkles className="w-10 h-10 text-white/90" />
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                  {config.heroTitle}
                </h1>
              </div>
              <p className="text-xl sm:text-2xl text-white/95 font-medium mb-3">
                {config.heroSubtitle}
              </p>
              <p className="text-lg text-white/80">
                Hello, <span className="font-semibold">{user.name}</span>
              </p>
            </div>

            <div className="mt-8 md:mt-0 relative z-10">
              <Link
                to={config.mainAction.path}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:bg-gray-50 transition-all duration-300 group hover:-translate-y-1"
              >
                {config.mainAction.icon}
                <span className="text-lg">{config.mainAction.label}</span>
                <ArrowRightCircle className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Subtle decorative overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Primary content card */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100/80 p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Recycle className="w-7 h-7 text-green-600" />
              Your Space on WasteZero
            </h2>

            <p className="text-gray-700 leading-relaxed text-lg mb-8">
              {config.mainAction.description}
            </p>

            {/* Placeholder stats / highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
              <StatCard label="Active Opportunities" value="0" />
              <StatCard label="This Month Impact" value="—" />
              <StatCard label="Community Rank" value="New" />
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Tips</h3>
              <ul className="space-y-4 text-gray-700">
                <TipItem>Update your profile location & skills to get better matches</TipItem>
                <TipItem>Check notifications regularly for new opportunities</TipItem>
                <TipItem>Share your participation to inspire others</TipItem>
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:space-y-8">
            {/* Coming soon teaser */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 lg:p-8 border border-green-100">
              <h3 className="text-xl font-bold text-green-800 mb-5 flex items-center gap-3">
                <Sparkles className="w-6 h-6" />
                Coming Soon
              </h3>
              <ul className="space-y-4 text-gray-700">
                <FeatureItem>Real-time pickup tracking</FeatureItem>
                <FeatureItem>Personal impact dashboard & badges</FeatureItem>
                <FeatureItem>Direct chat with coordinators & NGOs</FeatureItem>
                <FeatureItem>Collection history & certificates</FeatureItem>
              </ul>
            </div>

            {/* Helpful resources */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 lg:p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-5">Helpful Resources</h3>
              <div className="space-y-4">
                <ResourceLink label="How WasteZero Works" href="/help/how-it-works" />
                <ResourceLink label="Waste Sorting Guide" href="/help/sorting-guide" />
                <ResourceLink label="Contact Support" href="/help/contact" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Small reusable components
function StatCard({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 text-center">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

function TipItem({ children }) {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-green-500" />
      <span>{children}</span>
    </li>
  );
}

function FeatureItem({ children }) {
  return (
    <li className="flex items-center gap-3 text-gray-700">
      <span className="text-green-600">›</span>
      {children}
    </li>
  );
}

function ResourceLink({ label, href }) {
  return (
    <a
      href={href}
      className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-gray-800 font-medium"
    >
      {label}
    </a>
  );
}