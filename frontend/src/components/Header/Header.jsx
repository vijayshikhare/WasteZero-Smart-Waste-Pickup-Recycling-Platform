// src/components/Header/Header.jsx
import { Link } from 'react-router-dom';
import { Recycle, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';

export default function Header() {
  const { user, logout } = useAuth();
  const isAuthenticated = !!user;

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-gradient-to-r from-emerald-800 via-green-700 to-emerald-800 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 transition-transform duration-200 hover:scale-[1.02] active:scale-100 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-emerald-800 rounded-lg"
            aria-label="Go to homepage"
          >
            <div className="relative">
              <Recycle className="h-8 w-8 text-green-300 transition-transform duration-300 hover:rotate-12" />
              <span className="absolute -right-1 -top-1 h-3.5 w-3.5 animate-ping rounded-full bg-green-400 opacity-75" />
            </div>

            <div className="hidden sm:block">
              <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                WasteZero
              </h1>
              <p className="hidden text-xs font-medium text-green-200 md:block">
                Cleaner India • Smarter Tomorrow
              </p>
            </div>
          </Link>

          {/* Right section */}
          <div className="flex items-center gap-4 sm:gap-6">
            {isAuthenticated ? (
              <div className="flex items-center gap-4 sm:gap-6">
                {/* User info - visible on md+ */}
                <Link
                  to="/profile"
                  className="hidden items-center gap-3 md:flex transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-green-400 rounded-lg p-1"
                  aria-label="View and edit profile"
                >
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white truncate max-w-[180px]">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-green-100/90 truncate max-w-[220px]">
                      {user?.email}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-700 font-bold text-white shadow-inner ring-2 ring-green-400/40 transition-transform hover:scale-105">
                    {(user?.name?.[0] ?? 'U').toUpperCase()}
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className={clsx(
                    'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white',
                    'bg-red-600/90 shadow-sm transition-all duration-200',
                    'hover:bg-red-700 hover:shadow-md active:bg-red-800 active:scale-[0.98]',
                    'focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-emerald-800'
                  )}
                  aria-label="Log out"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 sm:gap-6">
                <Link
                  to="/login"
                  className="text-sm font-medium text-green-100 transition-colors duration-200 hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-green-400 rounded-md px-2 py-1"
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  className={clsx(
                    'rounded-lg border border-green-400/40 px-5 py-2 text-sm font-medium text-white',
                    'bg-white/10 backdrop-blur-sm shadow-sm transition-all duration-200',
                    'hover:border-green-300 hover:bg-white/15 hover:shadow-md',
                    'active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-emerald-800'
                  )}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}