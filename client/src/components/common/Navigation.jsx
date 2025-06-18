import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../hooks/useAuth';

/**
 * Navigation Component
 * Reusable navigation component for breadcrumbs, sidebar, and secondary navigation
 * Features breadcrumb navigation, page navigation, and contextual navigation
 */
const Navigation = ({ 
  type = 'breadcrumb', 
  items = [], 
  className = '',
  showHome = true,
  separator = '/',
  maxItems = 5 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  // (Removed: user and useAuth)
  
  // Auto-generate breadcrumb from current path if no items provided
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    if (showHome) {
      breadcrumbs.push({ name: 'Home', path: '/', icon: 'home' });
    }
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Format segment name
      let name = segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      // Handle special routes
      if (segment === 'member') {
        name = 'Member Portal';
      } else if (segment === 'dashboard') {
        name = 'Dashboard';
      } else if (segment === 'profile') {
        name = 'My Profile';
      } else if (segment === 'attendance') {
        name = 'Attendance Records';
      }
      
      breadcrumbs.push({
        name,
        path: currentPath,
        isLast: index === pathSegments.length - 1
      });
    });
    
    return breadcrumbs;
  };

  const navigationItems = items.length > 0 ? items : generateBreadcrumbs();
  
  // Truncate breadcrumbs if too long
  const displayItems = navigationItems.length > maxItems 
    ? [
        navigationItems[0],
        { name: '...', path: null, isEllipsis: true },
        ...navigationItems.slice(-2)
      ]
    : navigationItems;

  // Breadcrumb Navigation
  if (type === 'breadcrumb') {
    return (
      <nav 
        className={`flex items-center space-x-2 text-sm ${className}`}
        aria-label="Breadcrumb navigation"
      >
        <ol className="flex items-center space-x-2">
          {displayItems.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && !item.isEllipsis && (
                <span className="mx-2 text-gray-400 dark:text-gray-600" aria-hidden="true">
                  {separator === '/' ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    separator
                  )}
                </span>
              )}
              
              {item.isEllipsis ? (
                <span className="text-gray-500 dark:text-gray-400">...</span>
              ) : item.isLast ? (
                <span 
                  className="text-gray-900 dark:text-white font-medium"
                  aria-current="page"
                >
                  {item.icon === 'home' && (
                    <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  )}
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  {item.icon === 'home' && (
                    <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  )}
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  }

  // Sidebar Navigation
  if (type === 'sidebar') {
    return (
      <nav className={`space-y-1 ${className}`} aria-label="Sidebar navigation">
        {navigationItems.map((item, index) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={index}
              to={item.path}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.icon && (
                <span className={`mr-3 flex-shrink-0 h-5 w-5 ${
                  isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'
                }`}>
                  {typeof item.icon === 'string' ? (
                    <svg fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5">
                      {/* Add icon paths based on item.icon string */}
                    </svg>
                  ) : (
                    item.icon
                  )}
                </span>
              )}
              {item.name}
              {item.badge && (
                <span className="ml-auto inline-block py-0.5 px-2 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    );
  }

  // Tab Navigation
  if (type === 'tabs') {
    return (
      <nav className={`flex space-x-8 ${className}`} aria-label="Tab navigation">
        {navigationItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={index}
              to={item.path}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                isActive
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.name}
              {item.count !== undefined && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  isActive 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    );
  }

  // Steps Navigation
  if (type === 'steps') {
    return (
      <nav className={`${className}`} aria-label="Progress steps">
        <ol className="flex items-center">
          {navigationItems.map((item, index) => {
            const isCompleted = item.completed;
            const isCurrent = item.current;
            const isLast = index === navigationItems.length - 1;
            
            return (
              <li key={index} className={`relative ${!isLast ? 'pr-8 sm:pr-20' : ''}`}>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  {!isLast && (
                    <div className={`h-0.5 w-full ${
                      isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
                
                <div className={`relative w-8 h-8 flex items-center justify-center rounded-full ${
                  isCompleted 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : isCurrent 
                    ? 'border-2 border-blue-600 bg-white' 
                    : 'border-2 border-gray-300 bg-white hover:border-gray-400'
                }`}>
                  {isCompleted ? (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className={`text-sm font-medium ${
                      isCurrent ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                  )}
                </div>
                
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2">
                  <span className={`text-xs font-medium ${
                    isCompleted || isCurrent ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {item.name}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  // Pagination Navigation
  if (type === 'pagination') {
    const { currentPage = 1, totalPages = 1, onPageChange } = items;
    
    const handlePageChange = (page) => {
      if (onPageChange) {
        onPageChange(page);
      }
    };
    
    return (
      <nav className={`flex items-center justify-between ${className}`} aria-label="Pagination">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing page <span className="font-medium">{currentPage}</span> of{' '}
              <span className="font-medium">{totalPages}</span>
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    page === currentPage
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </nav>
    );
  }

  // Default return for unsupported types
  return null;
};

export default Navigation;