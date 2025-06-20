import React, { Suspense, useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

// Hooks
// import { useAuth } from './hooks/useAuth';

// Layout Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import ScrollToTop from './components/common/ScrollToTop';

// Page Components
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Sermons from './pages/Sermons';
import SermonDetails from './pages/SermonDetails';
import Ministries from './pages/Ministries';
import MinistryDetails from './pages/MinistryDetails';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import Gallery from './pages/Gallery';

// Auth Pages
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import MemberDashboard from './pages/member/Dashboard';

// Error Pages
import NotFound from './pages/errors/NotFound';
import Unauthorized from './pages/errors/Unauthorized';
import ServerError from './pages/errors/ServerError';

// Styles
import './styles/globals.css';
import './styles/components.css';
import './App.css';

/**
 * React Query Client Configuration
 * Optimized for church website needs with appropriate caching strategies
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Church content doesn't change frequently, so longer stale time is appropriate
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for server errors
        return failureCount < 3;
      },
      refetchOnWindowFocus: false, // Don't refetch on window focus for better UX
      refetchOnMount: true,
    },
    mutations: {
      retry: 1, // Retry mutations once on failure
    },
  },
});

/**
 * App Layout Component
 * Provides consistent layout structure for all pages
 */
import PropTypes from 'prop-types';

const AppLayout = ({ children, showHeader = true, showFooter = true }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {showHeader && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

AppLayout.propTypes = {
  children: PropTypes.node,
  showHeader: PropTypes.bool,
  showFooter: PropTypes.bool,
};

/**
 * Main App Component
 * Central application component with routing, providers, and global setup
 */
function App() {
  useEffect(() => {
    // Set up global error handling
    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      // You can integrate with error reporting service here
    };

    const handleError = (event) => {
      console.error('Global error:', event.error);
      // You can integrate with error reporting service here
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Set up viewport meta tag for mobile optimization
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
      document.head.appendChild(meta);
    }

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Route definitions for createBrowserRouter
  const routes = [
    {
      path: '/',
      element: (
        <AppLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <Home />
          </Suspense>
        </AppLayout>
      ),
    },
    {
      path: '/about',
      element: (
        <AppLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <About />
          </Suspense>
        </AppLayout>
      ),
    },
    {
      path: '/events',
      element: (
        <AppLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <Events />
          </Suspense>
        </AppLayout>
      ),
    },
    {
      path: '/events/:id',
      element: (
        <AppLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <EventDetails />
          </Suspense>
        </AppLayout>
      ),
    },
    {
      path: '/sermons',
      element: (
        <AppLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <Sermons />
          </Suspense>
        </AppLayout>
      ),
    },
    {
      path: '/sermons/:id',
      element: (
        <AppLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <SermonDetails />
          </Suspense>
        </AppLayout>
      ),
    },
    {
      path: '/ministries',
      element: (
        <AppLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <Ministries />
          </Suspense>
        </AppLayout>
      ),
    },
    {
      path: '/ministries/:id',
      element: (
        <AppLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <MinistryDetails />
          </Suspense>
        </AppLayout>
      ),
    },
    {
      path: '/blog',
      element: (
        <AppLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <Blog />
          </Suspense>
        </AppLayout>
      ),
    },
    {
      path: '/blog/:slug',
      element: (
        <AppLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <BlogPost />
          </Suspense>
        </AppLayout>
      ),
    },
    {
      path: '/gallery',
      element: (
        <AppLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <Gallery />
          </Suspense>
        </AppLayout>
      ),
    },
    {
      path: '/contact',
      element: (
        <AppLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <Contact />
          </Suspense>
        </AppLayout>
      ),
    },
    // Authentication Routes
    {
      path: '/login',
      element: (
        <AppLayout>
          <Login />
        </AppLayout>
      ),
    },
    {
      path: '/register',
      element: (
        <AppLayout>
          <Register />
        </AppLayout>
      ),
    },
    // Protected Dashboards
    {
      path: '/admin/dashboard',
      element: (
        <AppLayout>
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        </AppLayout>
      ),
    },
    {
      path: '/member/dashboard',
      element: (
        <AppLayout>
          <ProtectedRoute roles={['member', 'pastor', 'staff', 'admin']}>
            <MemberDashboard />
          </ProtectedRoute>
        </AppLayout>
      ),
    },
    // Error Routes
    {
      path: '/unauthorized',
      element: (
        <AppLayout>
          <Unauthorized />
        </AppLayout>
      ),
    },
    {
      path: '/server-error',
      element: (
        <AppLayout>
          <ServerError />
        </AppLayout>
      ),
    },
    // 404 Route
    {
      path: '*',
      element: (
        <AppLayout>
          <NotFound />
        </AppLayout>
      ),
    },
  ];

  const router = createBrowserRouter(routes, {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  });

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <ScrollToTop />
              <div className="App">
                <RouterProvider router={router} />
              </div>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
        {/* React Query DevTools - Only in development */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
