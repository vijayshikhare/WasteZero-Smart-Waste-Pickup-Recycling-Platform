// src/App.jsx
import { lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

// Context & Toast
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

// Components
import Header from './components/Header/Header.jsx';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import Footer from './components/common/Footer.jsx';

// Public pages
import Home from './pages/navbar/Home.jsx';
import HowItWorks from './pages/navbar/HowItWorks.jsx';
import CollectionPoints from './pages/navbar/CollectionPoints.jsx';
import Rewards from './pages/navbar/Rewards.jsx';
import About from './pages/navbar/About.jsx';
import Contact from './pages/navbar/Contact.jsx';

// Auth pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

// Lazy-loaded pages
const Dashboard           = lazy(() => import('./pages/Dashboard.jsx'));
const UserDashboard       = lazy(() => import('./pages/UserDashboard.jsx'));
const Notifications       = lazy(() => import('./pages/Notifications.jsx'));
const NgoDashboard        = lazy(() => import('./pages/NgoDashboard.jsx'));
const AdminDashboard      = lazy(() => import('./pages/AdminDashboard.jsx'));
const AdminUserManagement = lazy(() => import('./pages/AdminUserManagement.jsx'));
const AdminReports        = lazy(() => import('./pages/AdminReports.jsx'));
const AdminAnalytics      = lazy(() => import('./pages/AdminAnalytics.jsx'));
const Profile             = lazy(() => import('./pages/Profile.jsx'));
const Pickups             = lazy(() => import('./pages/Pickups.jsx'));
const Volunteers          = lazy(() => import('./pages/Volunteers.jsx'));
const NGOs                = lazy(() => import('./pages/NGOs.jsx'));
const Reports             = lazy(() => import('./pages/Reports.jsx'));
const Settings            = lazy(() => import('./pages/Settings.jsx'));
const MyApplications      = lazy(() => import('./pages/MyApplications.jsx'));
const MyPosted            = lazy(() => import('./pages/MyPosted.jsx'));

// Opportunities
const PublicOpportunities = lazy(() => import('./pages/opportunities/PublicOpportunities.jsx')); // ← new public list
const CreateOpportunity   = lazy(() => import('./pages/opportunities/CreateOpportunity.jsx'));   // renamed from OpportunitiesList
const EditOpportunity     = lazy(() => import('./pages/opportunities/EditOpportunity.jsx'));
const OpportunityApplications = lazy(() => import('./pages/opportunities/OpportunityApplications.jsx'));
const Chat = lazy(() => import('./pages/Chat.jsx'));

// Dashboard Layout
function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pt-16 md:pt-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}

// Protected Route with role check
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-emerald-600" />
        <p className="ml-4 text-gray-700 font-medium">Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <Navigate
        to={user?.role === 'ngo' ? '/dashboard' : '/'}
        replace
      />
    );
  }

  return children;
}

// Public Route wrapper (no auth required)
function PublicRoute({ children }) {
  return children;
}

// Redirect helper: send authenticated user to their role-specific dashboard
function RedirectToRole() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      let dest = '/dashboard';
      if (user.role === 'ngo') dest = '/ngo-dashboard';
      else if (user.role === 'volunteer') dest = '/user-dashboard';
      else if (user.role === 'admin') dest = '/admin-dashboard';
      navigate(dest, { replace: true });
    }
  }, [user, navigate]);

  // while redirecting, show a loader to avoid blank screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-emerald-600" />
      <p className="ml-4 text-gray-700 font-medium">Redirecting…</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              borderRadius: '10px',
              background: '#1f2937',
              color: '#f3f4f6',
              maxWidth: '500px',
            },
          }}
        />

        <Header />

        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-emerald-600" />
              <p className="ml-4 text-gray-700 font-medium">Loading...</p>
            </div>
          }
        >
          <Routes>
            {/* ── Public Routes ── */}
            <Route path="/" element={<Home />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/locations" element={<CollectionPoints />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Public Opportunities List – anyone can browse & apply */}
            <Route
              path="/opportunities"
              element={
                <PublicRoute>
                  <PublicOpportunities />
                </PublicRoute>
              }
            />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ── Protected Dashboard Routes ── */}
            <Route
              path="/dashboard"
              element={<ProtectedRoute><RedirectToRole /></ProtectedRoute>}
            />

            {/* Role-Specific Dashboards */}
            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute allowedRoles={['volunteer']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/ngo-dashboard"
              element={
                <ProtectedRoute allowedRoles={['ngo']}>
                  <NgoDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUserManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminReports />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAnalytics />
                </ProtectedRoute>
              }
            />

            {/* Notifications */}
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Profile />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Opportunities – NGO/Admin only */}
            <Route
              path="/dashboard/opportunities"
              element={
                <ProtectedRoute allowedRoles={['ngo', 'admin']}>
                  <DashboardLayout>
                    <MyPosted />  {/* Your NGO's posted opportunities list */}
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/opportunities/create"
              element={
                <ProtectedRoute allowedRoles={['ngo']}>
                  <DashboardLayout>
                    <CreateOpportunity />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/opportunities/edit/:opportunityId"
              element={
                <ProtectedRoute allowedRoles={['ngo']}>
                  <DashboardLayout>
                    <EditOpportunity />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/opportunity-applications/:opportunityId"
              element={
                <ProtectedRoute allowedRoles={['ngo']}>
                  <DashboardLayout>
                    <OpportunityApplications />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            {/* Chat between users */}
            <Route
              path="/chat/:userId?"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Chat />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            {/* Other dashboard pages */}
            <Route
              path="/dashboard/my-applications"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <MyApplications />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/pickups"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Pickups />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/volunteers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <Volunteers />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/ngos"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <NGOs />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/reports"
              element={
                <ProtectedRoute allowedRoles={['admin', 'ngo']}>
                  <DashboardLayout>
                    <Reports />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Settings />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        <Footer />
      </Router>
    </AuthProvider>
  );
}