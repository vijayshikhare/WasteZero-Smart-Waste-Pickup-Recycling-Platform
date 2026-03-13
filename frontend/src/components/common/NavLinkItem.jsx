// src/components/common/NavLinkItem.jsx
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';

export default function NavLinkItem({ to, label, onClick = () => {} }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        clsx(
          'text-sm font-medium transition-colors duration-200',
          isActive
            ? 'text-emerald-700 font-semibold'
            : 'text-gray-700 hover:text-emerald-700'
        )
      }
    >
      {label}
    </NavLink>
  );
}

NavLinkItem.propTypes = {
  to: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};