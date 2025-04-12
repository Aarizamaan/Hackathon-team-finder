import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Search, UserCircle } from 'lucide-react';
import { clsx } from 'clsx';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Users },
    { path: '/browse', label: 'Browse', icon: Search },
    { path: '/profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">TeamFinder</span>
          </Link>
          <div className="flex space-x-4">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={clsx(
                  'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium',
                  location.pathname === path
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:bg-gray-100'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;