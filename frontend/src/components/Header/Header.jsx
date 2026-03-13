// src/components/Header/Header.jsx
import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Recycle, LogOut, Menu, X, ChevronDown, Bell, Settings, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/opportunities', label: 'Opportunities' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
];

export default function Header() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get role badge color and label
  const getRoleBadgeConfig = () => {
    switch (user?.role) {
      case 'admin':
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          label: 'Admin',
          icon: '👑',
        };
      case 'ngo':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          label: 'Organization',
          icon: '🏢',
        };
      case 'volunteer':
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          label: 'Volunteer',
          icon: '🌱',
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          label: 'User',
          icon: '👤',
        };
    }
  };

  const roleBadge = getRoleBadgeConfig();
  const getDashboardLink = () => {
    switch (user?.role) {
      case 'admin':
        return '/admin-dashboard';
      case 'ngo':
        return '/ngo-dashboard';
      case 'volunteer':
      default:
        return '/user-dashboard';
    }
  };

  const closeMobileMenu = () => setIsMobileOpen(false);

  const avatarSrc = user?.profilePicture
    ? user.profilePicture.startsWith('http') || user.profilePicture.startsWith('blob:')
      ? user.profilePicture
      : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profilePicture.startsWith('/') ? '' : '/'}${user.profilePicture}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=10b981&color=fff&size=128`;

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    closeMobileMenu();
    setShowProfileMenu(false);
  };

  if (loading) {
    return (
      <header className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={clsx(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200/70 shadow-sm'
            : 'bg-white/80 backdrop-blur-lg border-b border-transparent'
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 md:h-18 items-center justify-between">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group" aria-label="WasteZero Home">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.15 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 180 }}
                className="relative"
              >
                <Recycle className="h-9 w-9 md:h-10 md:w-10 text-emerald-600" />
                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400/80 animate-ping" />
              </motion.div>

              <div className="flex flex-col leading-none">
                <span className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent tracking-tight">
                  WasteZero
                </span>
                <span className="text-[10px] md:text-xs font-medium text-gray-600 hidden sm:block">
                  Nagpur's Smart Recycling Network
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-10">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    clsx(
                      'relative text-base font-medium transition-all duration-300 group',
                      isActive
                        ? 'text-emerald-700 font-semibold'
                        : 'text-gray-700 hover:text-emerald-700'
                    )
                  }
                >
                  {item.label}
                  <span
                    className={clsx(
                      'absolute -bottom-1 left-0 h-0.5 bg-emerald-500 transition-all duration-400 ease-out',
                      'w-0 group-hover:w-full',
                      ({ isActive }) => (isActive ? 'w-full' : '')
                    )}
                  />
                </NavLink>
              ))}
            </nav>

            {/* Auth Controls + Mobile Toggle */}
            <div className="flex items-center gap-4 md:gap-6">
              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-5 relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowProfileMenu((prev) => !prev)}
                    className="group flex items-center gap-3"
                  >
                    <div className="relative">
                      <img
                        src={avatarSrc}
                        alt="Profile"
                        className="h-10 w-10 md:h-11 md:w-11 rounded-full object-cover border-2 border-emerald-200 shadow-sm transition-all duration-300 group-hover:border-emerald-400 group-hover:shadow-md group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=User&background=10b981&color=fff&size=128`;
                        }}
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-100/50" />
                    </div>

                    <div className="hidden lg:block text-left min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">
                        {user?.name?.split(' ')[0] || 'Profile'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email?.split('@')[0] || ''}
                      </p>
                    </div>

                    <ChevronDown size={16} className="text-gray-500 group-hover:text-emerald-600 transition-colors" />
                  </motion.button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-14 right-0 z-50 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 overflow-hidden"
                      >
                        {/* Header */}
                        <div className="px-4 py-4 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                              <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                            </div>
                          </div>
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${roleBadge.bg} ${roleBadge.text} text-xs font-semibold`}>
                            <span>{roleBadge.icon}</span>
                            {roleBadge.label}
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <NavLink
                            to={getDashboardLink()}
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors group"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <LayoutDashboard size={18} className="text-emerald-600 group-hover:text-emerald-700" />
                            <div>
                              <p className="font-medium">Dashboard</p>
                              <p className="text-xs text-gray-500">Go to your workspace</p>
                            </div>
                          </NavLink>

                          <NavLink
                            to="/profile"
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <Settings size={18} />
                            Profile Settings
                          </NavLink>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gray-100"></div>

                        {/* Logout */}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 transition-colors font-medium"
                        >
                          <LogOut size={18} />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-4">
                  <NavLink
                    to="/login"
                    className="px-5 py-2.5 text-gray-700 hover:text-emerald-700 font-medium transition-colors"
                  >
                    Log in
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-md hover:shadow-lg hover:brightness-105 transition-all"
                  >
                    Sign Up
                  </NavLink>
                </div>
              )}

              <button
                className="lg:hidden p-2 rounded-lg hover:bg-emerald-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
              onClick={closeMobileMenu}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-4/5 max-w-sm bg-white/95 backdrop-blur-xl shadow-2xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <Recycle className="h-8 w-8 text-emerald-600" />
                    <span className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                      WasteZero
                    </span>
                  </div>
                  <button onClick={closeMobileMenu}>
                    <X size={28} className="text-gray-700" />
                  </button>
                </div>

                <nav className="flex flex-col gap-2 mb-10">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center px-5 py-4 rounded-xl text-lg font-medium transition-all',
                          isActive
                            ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-inner'
                            : 'text-gray-800 hover:bg-emerald-50/70 hover:text-emerald-700'
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </nav>

                <div className="border-t border-gray-200 pt-8">
                  {isAuthenticated ? (
                    <div className="space-y-6">
                      <div className="flex flex-col gap-4 px-5 py-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                        <div className="flex items-center gap-4">
                          <img
                            src={avatarSrc}
                            alt="Profile"
                            className="h-14 w-14 rounded-full object-cover border-2 border-emerald-300"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900">{user?.name || 'User'}</p>
                            <p className="text-sm text-gray-600 truncate">{user?.email}</p>
                          </div>
                        </div>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${roleBadge.bg} ${roleBadge.text} text-xs font-semibold w-fit`}>
                          <span>{roleBadge.icon}</span>
                          {roleBadge.label}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <NavLink
                          to={getDashboardLink()}
                          onClick={closeMobileMenu}
                          className="w-full py-3 px-4 bg-emerald-100 text-emerald-700 font-medium rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-2"
                        >
                          <LayoutDashboard size={20} />
                          Go to Dashboard
                        </NavLink>

                        <NavLink
                          to="/profile"
                          onClick={closeMobileMenu}
                          className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                          <Settings size={20} />
                          Profile Settings
                        </NavLink>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <NavLink
                        to="/login"
                        onClick={closeMobileMenu}
                        className="py-4 px-6 text-center text-lg font-medium text-gray-800 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                      >
                        Log in
                      </NavLink>
                      <NavLink
                        to="/register"
                        onClick={closeMobileMenu}
                        className="py-4 px-6 text-center text-lg font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-md hover:shadow-lg transition"
                      >
                        Create Account
                      </NavLink>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Prevent content jump under fixed header */}
      <div className="h-16 md:h-18" />
    </>
  );
}