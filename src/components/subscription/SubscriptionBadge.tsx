
import { useSubscription } from "@/contexts/SubscriptionContext";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Stars, CircleDollarSign } from "lucide-react";

interface SubscriptionBadgeProps {
  className?: string;
  showIcon?: boolean;
}

export const SubscriptionBadge = ({
  className,
  showIcon = true,
}: SubscriptionBadgeProps) => {
  const { subscriptionTier } = useSubscription();

  if (!subscriptionTier || subscriptionTier === 'free') {
    return (
      <Badge
        variant="outline"
        className={cn("bg-muted text-muted-foreground border-muted-foreground/20", className)}
      >
        {showIcon && <CircleDollarSign className="h-3.5 w-3.5 ml-1" />}
        مجاني
      </Badge>
    );
  }

  if (subscriptionTier === 'basic') {
    return (
      <Badge
        variant="outline"
        className={cn("bg-blue-50 text-blue-700 border-blue-200", className)}
      >
        {showIcon && <Star className="h-3.5 w-3.5 ml-1" />}
        أساسي
      </Badge>
    );
  }

  if (subscriptionTier === 'premium') {
    return (
      <Badge
        variant="outline"
        className={cn("bg-purple-50 text-purple-700 border-purple-200", className)}
      >
        {showIcon && <Stars className="h-3.5 w-3.5 ml-1" />}
        بريميوم
      </Badge>
    );
  }

  if (subscriptionTier === 'enterprise') {
    return (
      <Badge
        variant="outline"
        className={cn("bg-amber-50 text-amber-700 border-amber-200", className)}
      >
        {showIcon && <Crown className="h-3.5 w-3.5 ml-1" />}
        إنتربرايز
      </Badge>
    );
  }

  return null;
};
