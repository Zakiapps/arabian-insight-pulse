
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
    currentPath: location.pathname,
    requiredFeature
  });

  // Show loading indicator while checking authentication
  if (loading || subscriptionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to signin');
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Check admin access for admin-only routes
  if (adminOnly && !isAdmin) {
    console.log('Admin required but user is not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Admin bypass: admin@arabinsights.com gets full access to everything
  if (user?.email === 'admin@arabinsights.com') {
    console.log('Admin user detected, granting full access');
    return <>{children}</>;
  }

  // Check feature access if a required feature is specified (only for non-admin users)
  if (requiredFeature && !canAccessFeature(requiredFeature)) {
    console.log('Feature access denied, redirecting to pricing');
    return <Navigate to="/pricing" replace />;
  }

  console.log('Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;
