// src/components/common/AuthButtons.jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';
import PropTypes from 'prop-types';

export default function AuthButtons({ mobile = false, onLinkClick = () => {} }) {
  const { user, logout, isAuthenticated } = useAuth(); // assuming isAuthenticated is also exported or derived

  if (isAuthenticated) {
    return (
      <div className={clsx('flex items-center gap-5', mobile && 'flex-col gap-4 w-full')}>
        <NavLink
          to="/profile"
          onClick={onLinkClick}
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 text-sm font-medium',
              isActive ? 'text-emerald-700' : 'text-gray-700 hover:text-emerald-700',
              mobile && 'w-full justify-center'
            )
          }
        >
          <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
            {(user?.name?.[0] ?? 'U').toUpperCase()}
          </div>
          <span>{user?.name || 'Profile'}</span>
        </NavLink>

        <button
          onClick={() => { logout(); onLinkClick(); }}
          className={clsx(
            'text-sm font-medium text-gray-700 hover:text-red-600 transition-colors',
            mobile && 'w-full text-center py-2.5 bg-red-50 hover:bg-red-100 rounded-md'
          )}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className={clsx('flex items-center gap-4', mobile && 'flex-col gap-3 w-full')}>
      <NavLink
        to="/login"
        onClick={onLinkClick}
        className={clsx(
          'text-sm font-medium text-gray-700 hover:text-emerald-700',
          mobile && 'w-full text-center py-2.5 hover:bg-gray-100 rounded-md'
        )}
      >
        Log in
      </NavLink>

      <NavLink
        to="/register"
        onClick={onLinkClick}
        className={clsx(
          'rounded-md bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors',
          mobile && 'w-full text-center py-3'
        )}
      >
        Sign up
      </NavLink>
    </div>
  );
}

AuthButtons.propTypes = {
  mobile: PropTypes.bool,
  onLinkClick: PropTypes.func,
};