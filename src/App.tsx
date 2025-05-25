
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';

// Layouts
import MainLayout from '@/components/layouts/MainLayout';
import AuthLayout from '@/components/layouts/AuthLayout';

// Auth Pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';

// Main Pages
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Pricing from '@/pages/Pricing';
import NotFound from '@/pages/NotFound';

// Admin Pages
import ModernAdminDashboard from '@/pages/admin/ModernAdminDashboard';
import AdminControlPanel from '@/pages/admin/AdminControlPanel';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminUsersManagement from '@/pages/admin/AdminUsersManagement';
import SocialMediaScraping from '@/pages/admin/SocialMediaScraping';

// Feature Pages
import TextAnalysis from '@/pages/features/TextAnalysis';
import SocialMediaAnalysis from '@/pages/features/SocialMediaAnalysis';
import Reports from '@/pages/features/Reports';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirects authenticated users to dashboard)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Toaster position="top-center" richColors />
            <Routes>
              {/* Public Routes - redirect to dashboard if authenticated */}
              <Route path="/" element={
                <PublicRoute>
                  <MainLayout />
                </PublicRoute>
              }>
                <Route index element={<Home />} />
                <Route path="pricing" element={<Pricing />} />
              </Route>

              {/* Auth Routes - redirect to dashboard if authenticated */}
              <Route path="/" element={
                <PublicRoute>
                  <AuthLayout />
                </PublicRoute>
              }>
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="reset-password" element={<ResetPassword />} />
              </Route>

              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="text-analysis" element={<TextAnalysis />} />
                <Route path="social-media-analysis" element={<SocialMediaAnalysis />} />
                <Route path="reports" element={<Reports />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={
                <AdminRoute>
                  <MainLayout />
                </AdminRoute>
              }>
                <Route index element={<ModernAdminDashboard />} />
                <Route path="control-panel" element={<AdminControlPanel />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="users-management" element={<AdminUsersManagement />} />
                <Route path="social-media-scraping" element={<SocialMediaScraping />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
