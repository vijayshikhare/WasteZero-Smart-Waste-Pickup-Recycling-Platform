// src/components/Navbar/DashboardNav.jsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, ChevronDown, Home, Settings, LogOut, Recycle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';

export default function DashboardNav({ items, title, icon: Icon }) {
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleSubmenu = (id) => {
    setExpandedMenu(expandedMenu === id ? null : id);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <Recycle className="w-6 h-6 text-emerald-600" />
          <span className="font-bold text-gray-900">WasteZero</span>
        </div>
        <button
          onClick={toggleMenu}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden lg:flex fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-200 flex-col overflow-hidden"
        initial={{ x: -288 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 flex-shrink-0">
          <div className="relative">
            <Recycle className="w-8 h-8 text-emerald-600" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div>
            <p className="text-lg font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
              WasteZero
            </p>
            <p className="text-xs text-gray-500">Dashboard</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {items.map((item) => (
            <div key={item.id}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.id)}
                    className={clsx(
                      'w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all duration-200',
                      expandedMenu === item.id
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && <item.icon size={20} />}
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown
                      size={18}
                      className={clsx(
                        'transition-transform duration-200',
                        expandedMenu === item.id ? 'rotate-180' : ''
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {expandedMenu === item.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-2 space-y-1 border-l-2 border-emerald-200 pl-2"
                      >
                        {item.submenu.map((subitem) => (
                          <NavLink
                            key={subitem.path}
                            to={subitem.path}
                            className={({ isActive }) =>
                              clsx(
                                'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                isActive
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                              )
                            }
                          >
                            {subitem.icon && <subitem.icon size={16} />}
                            {subitem.label}
                          </NavLink>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200',
                      isActive
                        ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    )
                  }
                >
                  {item.icon && <item.icon size={20} />}
                  <span>{item.label}</span>
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-gray-200 p-4 space-y-3 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-3 bg-emerald-50 rounded-lg">
            <img
              src={
                user?.profilePicture
                  ? user.profilePicture.startsWith('http')
                    ? user.profilePicture
                    : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profilePicture}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=10b981&color=fff`
              }
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-200"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-600 truncate">{user?.role}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <NavLink
              to="/profile"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <Settings size={18} />
              <span className="hidden sm:inline">Settings</span>
            </NavLink>
            <button
              onClick={logout}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed top-16 left-0 bottom-0 w-64 bg-white shadow-xl z-50 lg:hidden overflow-y-auto"
            >
              <nav className="p-4 space-y-2">
                {items.map((item) => (
                  <div key={item.id}>
                    {item.submenu ? (
                      <>
                        <button
                          onClick={() => toggleSubmenu(item.id)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            {item.icon && <item.icon size={20} />}
                            <span>{item.label}</span>
                          </div>
                          <ChevronDown
                            size={18}
                            className={clsx(
                              'transition-transform',
                              expandedMenu === item.id ? 'rotate-180' : ''
                            )}
                          />
                        </button>

                        {expandedMenu === item.id && (
                          <div className="ml-2 mt-1 space-y-1 border-l-2 border-emerald-200 pl-2">
                            {item.submenu.map((subitem) => (
                              <NavLink
                                key={subitem.path}
                                to={subitem.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                  clsx(
                                    'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                    isActive
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'text-gray-600 hover:text-emerald-700'
                                  )
                                }
                              >
                                {subitem.icon && <subitem.icon size={16} />}
                                {subitem.label}
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <NavLink
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          clsx(
                            'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all',
                            isActive ? 'bg-emerald-100 text-emerald-700' : 'text-gray-700 hover:bg-gray-100'
                          )
                        }
                      >
                        {item.icon && <item.icon size={20} />}
                        {item.label}
                      </NavLink>
                    )}
                  </div>
                ))}
              </nav>

              {/* Mobile User Section */}
              <div className="border-t border-gray-200 p-4 mt-8 space-y-3">
                <NavLink
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  <Settings size={18} /> Settings
                </NavLink>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content spacing on all screens */}
      <div className="lg:pl-72">
        <div className="lg:hidden h-16" />
      </div>
    </>
  );
}
