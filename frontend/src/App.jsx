// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

// Global Header (visible on ALL pages)
import Header from './components/Header/Header';

// Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Pickups from './pages/Pickups';
import Volunteers from './pages/Volunteers';
import NGOs from './pages/NGOs';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Opportunities from './pages/Opportunities';
import MyApplications from './pages/MyApplications';
import MyPosted from './pages/MyPosted';

// NGO-specific opportunity management pages
import EditOpportunity from './pages/EditOpportunity';              // ← new
import OpportunityApplications from './pages/OpportunityApplications'; // ← new

// Components
import Sidebar from './components/Sidebar/Sidebar';

// Suppress React Router v7 future flag warnings in development (harmless)
if (process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('React Router Future Flag Warning')) {
      return;
    }
    originalWarn(...args);
  };
}

// Protected Route with optional role check
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-600"></div>
        <p className="ml-4 text-gray-600 font-medium">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Dashboard Layout (Sidebar + content area)
function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pt-16 md:pt-20 p-6 md:p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              borderRadius: '12px',
              background: '#333',
              color: '#fff',
            },
          }}
        />

        {/* Global fixed Header (visible on public & dashboard pages) */}
        <Header />

        <Routes>
          {/* ── Public Routes ──────────────────────────────────────── */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* ── Protected Dashboard & Sub-routes ───────────────────── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Opportunity Management (NGO + Volunteers) */}
          <Route
            path="/dashboard/opportunities"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Opportunities />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* NGO-only: Edit existing opportunity */}
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

          {/* NGO-only: View applications for one opportunity */}
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

          {/* Volunteer-specific */}
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

          {/* NGO-specific */}
          <Route
            path="/dashboard/my-posted"
            element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <DashboardLayout>
                  <MyPosted />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Other dashboard sections */}
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
              <ProtectedRoute>
                <DashboardLayout>
                  <Volunteers />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/ngos"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <NGOs />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/reports"
            element={
              <ProtectedRoute>
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

          {/* Profile */}
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

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;