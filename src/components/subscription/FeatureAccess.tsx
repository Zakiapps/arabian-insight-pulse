
import { ReactNode } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FeatureGuardProps {
  children: ReactNode;
  featureName: string;
  fallback?: ReactNode;
}

export const FeatureGuard = ({
  children,
  featureName,
  fallback,
}: FeatureGuardProps) => {
  const { canAccessFeature } = useSubscription();
  const navigate = useNavigate();

  if (canAccessFeature(featureName)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Alert className="border-amber-200 bg-amber-50 text-amber-800">
      <Lock className="h-4 w-4" />
      <AlertTitle>هذه الميزة غير متوفرة في اشتراكك الحالي</AlertTitle>
      <AlertDescription className="mt-2">
        قم بترقية اشتراكك للوصول إلى هذه الميزة وأكثر.
        <div className="mt-4">
          <Button
            size="sm"
            variant="outline"
            className="border-amber-500 bg-amber-100 hover:bg-amber-200 text-amber-900"
            onClick={() => navigate("/pricing")}
          >
            <Crown className="mr-2 h-4 w-4" />
            عرض الباقات
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
