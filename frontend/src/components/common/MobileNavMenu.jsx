// src/components/common/MobileNavMenu.jsx
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import AuthButtons from './AuthButtons';

const mainNavItems = [
  { to: '/', label: 'Home' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/locations', label: 'Collection Points' },
  { to: '/rewards', label: 'Rewards' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function MobileNavMenu({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden bg-white border-b border-gray-200 shadow-sm">
      <div className="px-5 py-6 space-y-5">
        <nav className="flex flex-col gap-2">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'block py-3 px-4 text-base font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-gray-800 hover:bg-gray-50 hover:text-emerald-700'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="pt-5 border-t border-gray-200">
          <AuthButtons mobile onLinkClick={onClose} />
        </div>
      </div>
    </div>
  );
}

MobileNavMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};