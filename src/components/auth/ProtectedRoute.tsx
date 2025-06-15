
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

/**
 * Focused, simplified protected route enforcing auth/admin/feature rules.
 */
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

  // Only show loading if actual user check or subscription check is running
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

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Redirect non-admin from admin routes
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin bypass always grants access
  if (user?.email === "admin@arabinsights.com") {
    return <>{children}</>;
  }

  // Feature access
  if (requiredFeature && !canAccessFeature(requiredFeature)) {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
