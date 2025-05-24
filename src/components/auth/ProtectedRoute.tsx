
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  requiredFeature?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  adminOnly = false,
  requiredFeature
}) => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();
  const { isLoading: subscriptionLoading, canAccessFeature } = useSubscription();
  const location = useLocation();

  console.log('ProtectedRoute check:', {
    loading,
    isAuthenticated,
    isAdmin,
    adminOnly,
    userEmail: user?.email,
    currentPath: location.pathname
  });

  // Use a simpler loading indicator to improve performance
  if (loading || subscriptionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    // Redirect to dashboard if not an admin
    console.log('Not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Admin bypass: admin@arabinsights.com gets full access to everything
  if (user?.email === 'admin@arabinsights.com') {
    console.log('Admin user detected, granting full access');
    return <>{children}</>;
  }

  // Check feature access if a required feature is specified (only for non-admin users)
  if (requiredFeature && !canAccessFeature(requiredFeature)) {
    // Redirect to pricing page for subscription upgrade
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
