import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Hooks
import { useAuth } from './hooks/useAuth';

// Layout Components (to be created)
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import ScrollToTop from './components/common/ScrollToTop';

// Page Components (to be created)
// Public Pages
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
import Login from './pages/member/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Member Portal Pages
import Dashboard from './pages/member/Dashboard';
import Profile from './pages/member/Profile';
import MyEvents from './pages/member/MyEvents';
import MyDonations from './pages/member/MyDonations';
import PrayerRequests from './pages/member/PrayerRequests';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageEvents from './pages/admin/ManageEvents';
import ManageSermons from './pages/admin/ManageSermons';
import ManageContent from './pages/admin/ManageContent';
import SiteSettings from './pages/admin/SiteSettings';

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
 * Protected Route Component
 * Handles authentication and role-based access control
 */
const ProtectedRoute = ({ children, requireRole = null, requireAuth = true }) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if specific role is required
  if (requireRole && !hasRole(requireRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

/**
 * Public Route Component
 * Redirects authenticated users away from auth pages
 */
const PublicRoute = ({ children, redirectTo = '/dashboard' }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

/**
 * App Layout Component
 * Provides consistent layout structure for all pages
 */
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

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <Router>
              <ScrollToTop />
              <div className="App">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={
                    <AppLayout>
                      <Suspense fallback={<LoadingSpinner />}>
                        <Home />
                      </Suspense>
                    </AppLayout>
                  } />
                  
                  <Route path="/about" element={
                    <AppLayout>
                      <Suspense fallback={<LoadingSpinner />}>
                        <About />
                      </Suspense>
                    </AppLayout>
                  } />
                  
                  <Route path="/events" element={
                    <AppLayout>
                      <Suspense fallback={<LoadingSpinner />}>
                        <Events />
                      </Suspense>
                    </AppLayout>
                  } />
                  
                  <Route path="/events/:id" element={
                    <AppLayout>
                      <Suspense fallback={<LoadingSpinner />}>
                        <EventDetails />
                      </Suspense>
                    </AppLayout>
                  } />
                  
                  <Route path="/sermons" element={
                    <AppLayout>
                      <Suspense fallback={<LoadingSpinner />}>
                        <Sermons />
                      </Suspense>
                    </AppLayout>
                  } />
                  
                  <Route path="/sermons/:id" element={
                    <AppLayout>
                      <Suspense fallback={<LoadingSpinner />}>
                        <SermonDetails />
                      </Suspense>
                    </AppLayout>
                  } />
                  
                  <Route path="/ministries" element={
                    <AppLayout>
                      <Suspense fallback={<LoadingSpinner />}>
                        <Ministries />
                      </Suspense>
                    </AppLayout>
                  } />
                  
                  <Route path="/ministries/:id" element={
                    <AppLayout>
                      <Suspense fallback={<LoadingSpinner />}>
                        <MinistryDetails />
                      </Suspense>
                    </AppLayout>
                  } />
                  
                  <Route path="/blog" element={
                    <AppLayout>
                      <Suspense fallback={<LoadingSpinner />}>
                        <Blog />
                      </Suspense>
                    </AppLayout>
                  } />
                  
                  <Route path="/blog/:slug" element={
                    <AppLayout>
                      <Suspense fallback={<LoadingSpinner />}>
                        <BlogPost />
                      </Suspense>
                    </AppLayout>
                  } />
                  
                  <Route path="/gallery" element={
                    <AppLayout>
                      <Suspense fallback={<LoadingSpinner />}>
                        <Gallery />
                      </Suspense>
                    </AppLayout>
                  } />
                  
                  <Route path="/contact" element={
                    <AppLayout>
                      <Suspense fallback={<LoadingSpinner />}>
                        <Contact />
                      </Suspense>
                    </AppLayout>
                  } />

                  {/* Authentication Routes */}
                  <Route path="/login" element={
                    <PublicRoute>
                      <AppLayout showFooter={false}>
                        <Suspense fallback={<LoadingSpinner />}>
                          <Login />
                        </Suspense>
                      </AppLayout>
                    </PublicRoute>
                  } />
                  
                  <Route path="/register" element={
                    <PublicRoute>
                      <AppLayout showFooter={false}>
                        <Suspense fallback={<LoadingSpinner />}>
                          <Register />
                        </Suspense>
                      </AppLayout>
                    </PublicRoute>
                  } />
                  
                  <Route path="/forgot-password" element={
                    <PublicRoute>
                      <AppLayout showFooter={false}>
                        <Suspense fallback={<LoadingSpinner />}>
                          <ForgotPassword />
                        </Suspense>
                      </AppLayout>
                    </PublicRoute>
                  } />
                  
                  <Route path="/reset-password/:token" element={
                    <PublicRoute>
                      <AppLayout showFooter={false}>
                        <Suspense fallback={<LoadingSpinner />}>
                          <ResetPassword />
                        </Suspense>
                      </AppLayout>
                    </PublicRoute>
                  } />
                  
                  <Route path="/verify-email/:token" element={
                    <AppLayout showFooter={false}>
                      <Suspense fallback={<LoadingSpinner />}>
                        <VerifyEmail />
                      </Suspense>
                    </AppLayout>
                  } />

                  {/* Member Portal Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Suspense fallback={<LoadingSpinner />}>
                          <Dashboard />
                        </Suspense>
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Suspense fallback={<LoadingSpinner />}>
                          <Profile />
                        </Suspense>
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/my-events" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Suspense fallback={<LoadingSpinner />}>
                          <MyEvents />
                        </Suspense>
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/my-donations" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Suspense fallback={<LoadingSpinner />}>
                          <MyDonations />
                        </Suspense>
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/prayer-requests" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Suspense fallback={<LoadingSpinner />}>
                          <PrayerRequests />
                        </Suspense>
                      </AppLayout>
                    </ProtectedRoute>
                  } />

                  {/* Admin Routes */}
                  <Route path="/admin" element={
                    <ProtectedRoute requireRole="admin">
                      <AppLayout>
                        <Suspense fallback={<LoadingSpinner />}>
                          <AdminDashboard />
                        </Suspense>
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/users" element={
                    <ProtectedRoute requireRole="admin">
                      <AppLayout>
                        <Suspense fallback={<LoadingSpinner />}>
                          <ManageUsers />
                        </Suspense>
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/events" element={
                    <ProtectedRoute requireRole="admin">
                      <AppLayout>
                        <Suspense fallback={<LoadingSpinner />}>
                          <ManageEvents />
                        </Suspense>
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/sermons" element={
                    <ProtectedRoute requireRole="admin">
                      <AppLayout>
                        <Suspense fallback={<LoadingSpinner />}>
                          <ManageSermons />
                        </Suspense>
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/content" element={
                    <ProtectedRoute requireRole="admin">
                      <AppLayout>
                        <Suspense fallback={<LoadingSpinner />}>
                          <ManageContent />
                        </Suspense>
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/settings" element={
                    <ProtectedRoute requireRole="admin">
                      <AppLayout>
                        <Suspense fallback={<LoadingSpinner />}>
                          <SiteSettings />
                        </Suspense>
                      </AppLayout>
                    </ProtectedRoute>
                  } />

                  {/* Error Routes */}
                  <Route path="/unauthorized" element={
                    <AppLayout>
                      <Unauthorized />
                    </AppLayout>
                  } />
                  
                  <Route path="/server-error" element={
                    <AppLayout>
                      <ServerError />
                    </AppLayout>
                  } />
                  
                  {/* 404 Route - Must be last */}
                  <Route path="*" element={
                    <AppLayout>
                      <NotFound />
                    </AppLayout>
                  } />
                </Routes>
              </div>
            </Router>
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