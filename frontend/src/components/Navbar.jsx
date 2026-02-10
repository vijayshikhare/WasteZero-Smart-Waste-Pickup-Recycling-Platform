// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LogOut, 
  UserCircle, 
  LayoutDashboard,
  Menu,
  X 
} from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className="bg-gradient-to-r from-green-700 to-emerald-800 text-white shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-18">
          
          {/* Logo */}
          <Link 
            to={user ? '/dashboard' : '/'} 
            className="flex items-center space-x-2 group"
          >
            <div className="text-2xl md:text-3xl font-bold tracking-tight transition-transform group-hover:scale-105">
              WasteZero
            </div>
            <span className="text-2xl md:text-3xl transition-transform group-hover:rotate-12">
              ♻️
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <NavLink to="/dashboard" icon={<LayoutDashboard size={18} />}>
                  Dashboard
                </NavLink>
                
                <NavLink to="/profile" icon={<UserCircle size={18} />}>
                  Profile
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600/90 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-red-900/20 active:scale-95"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login">
                  Login
                </NavLink>

                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-white text-green-800 font-semibold rounded-lg shadow-md hover:bg-gray-100 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md hover:bg-green-800/50 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-green-600/30 bg-green-800/95 backdrop-blur-sm">
          <div className="px-4 pt-2 pb-4 space-y-3">
            {user ? (
              <>
                <MobileNavLink to="/dashboard" onClick={toggleMobileMenu}>
                  <LayoutDashboard size={18} /> Dashboard
                </MobileNavLink>
                
                <MobileNavLink to="/profile" onClick={toggleMobileMenu}>
                  <UserCircle size={18} /> Profile
                </MobileNavLink>

                <button
                  onClick={() => {
                    handleLogout();
                    toggleMobileMenu();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-100 hover:bg-red-900/50 rounded-lg transition-colors"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <>
                <MobileNavLink to="/login" onClick={toggleMobileMenu}>
                  Login
                </MobileNavLink>

                <Link
                  to="/register"
                  onClick={toggleMobileMenu}
                  className="block px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-center font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

// Reusable NavLink component for cleaner code
function NavLink({ to, children, icon, ...props }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 text-white/90 hover:text-white font-medium transition-colors duration-200 hover:underline underline-offset-4"
      {...props}
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileNavLink({ to, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 text-white/90 hover:bg-green-700/50 rounded-lg transition-colors"
    >
      {children}
    </Link>
  );
}