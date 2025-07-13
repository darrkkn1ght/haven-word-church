import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

/**
 * Header Component
 * Main navigation header for Haven Word Church website
 * Features responsive design, mobile menu, and theme toggle
 */
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Navigation items for public pages
  const publicNavItems = [
    { name: 'Home', path: '/', exact: true },
    { name: 'About', path: '/about' },
    { name: 'Events', path: '/events' },
    { name: 'Sermons', path: '/sermons' },
    { name: 'Ministries', path: '/ministries' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  // (Removed: memberNavItems)

  // (Removed: scroll effect for header background)

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Check if current path is active
  const isActivePath = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // (Removed: handleLogout function)

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white dark:bg-primary-900 shadow-lg"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex flex-col items-start">
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
              aria-label="Haven Word Church - Home"
            >
              <img
                src="/logo.jpeg"
                alt="Haven Word Church Logo"
                className="h-10 w-auto lg:h-12 max-h-[50px] object-contain transition-transform duration-200 group-hover:scale-105 rounded-lg shadow-soft"
                style={{ maxHeight: 50 }}
              />
              <div className="hidden sm:block ml-2">
                <h1 className="text-lg lg:text-xl font-bold text-primary-500 dark:text-white font-accent tracking-tight">
                  Haven Word
                </h1>
                <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 -mt-1">
                  Church
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1" role="navigation">
            {publicNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActivePath(item.path, item.exact)
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
                aria-current={isActivePath(item.path, item.exact) ? 'page' : undefined}
              >
                {item.name}
              </Link>
            ))}
            {!user && (
              <Link
                to="/login"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20`}
              >
                Login
              </Link>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Spread City Logo - right side */}
            <div className="hidden md:block">
              <img
                src="/assets/images/spreadcity-light.png"
                alt="Spread City Logo Light"
                className="h-10 w-auto object-contain dark:hidden"
                style={{ maxHeight: '2.5rem' }}
              />
              <img
                src="/assets/images/spreadcity-dark.png"
                alt="Spread City Logo Dark"
                className="h-10 w-auto object-contain hidden dark:block"
                style={{ maxHeight: '2.5rem' }}
              />
            </div>
            {/* Theme Toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                className="sr-only peer"
                type="checkbox"
                checked={theme === 'dark'}
                onChange={toggleTheme}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              />
              <div className="group peer ring-2 bg-gradient-to-r from-yellow-200 via-gray-400 to-blue-900 rounded-full outline-none duration-500 after:duration-300 w-14 h-7 shadow-md peer-focus:outline-none after:content-[''] after:rounded-full after:absolute after:bg-[#0D2B39] after:transition-all after:duration-300 after:w-6 after:h-6 after:top-0.5 after:left-0.5 peer-checked:after:translate-x-7 peer-hover:after:scale-110 after:shadow after:border after:border-gray-400 relative">
                {/* Sun icon (left) */}
                <span className="absolute left-1 top-1/2 -translate-y-1/2 text-yellow-400 text-xs pointer-events-none">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15a5 5 0 100-10 5 5 0 000 10zm0 2a7 7 0 110-14 7 7 0 010 14zm0-16a1 1 0 011 1v1a1 1 0 11-2 0V2a1 1 0 011-1zm0 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm8-7a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zm-16 0a1 1 0 01-1 1H1a1 1 0 110-2h1a1 1 0 011 1zm12.071-5.071a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zm-10.142 0a1 1 0 010 1.414l-.707.707A1 1 0 113.22 5.636l.707-.707a1 1 0 011.414 0zm10.142 10.142a1 1 0 00-1.414 0l-.707.707a1 1 0 101.414 1.414l.707-.707a1 1 0 000-1.414zm-10.142 0a1 1 0 00-1.414 0l-.707.707a1 1 0 101.414 1.414l.707-.707a1 1 0 000-1.414z"/></svg>
                </span>
                {/* Moon icon (right) */}
                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-blue-300 text-xs pointer-events-none">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
                </span>
              </div>
            </label>
            {/* User Dropdown */}
            {user ? (
              <div className="relative group">
                <button
                  className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <User className="w-7 h-7 text-blue-600 bg-blue-100 rounded-full p-1" />
                  )}
                  <span className="hidden md:inline text-gray-700 dark:text-gray-200 font-medium">{user.name?.split(' ')[0] || 'Account'}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-all z-50">
                  <Link
                    to={user.role === 'admin' ? '/admin/dashboard' : '/member/dashboard'}
                    className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-800"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to={user.role === 'admin' ? '/admin/profile' : '/member/profile'}
                    className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-800"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-800"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : null}
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Public Navigation */}
              {publicNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActivePath(item.path, item.exact)
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {!user && (
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  Login
                </Link>
              )}
              {user && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                  <Link
                    to={user.role === 'admin' ? '/admin/dashboard' : '/member/dashboard'}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-800"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to={user.role === 'admin' ? '/admin/profile' : '/member/profile'}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-800"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-800"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;