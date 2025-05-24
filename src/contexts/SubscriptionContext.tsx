
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise' | null;

interface SubscriptionContextType {
  subscribed: boolean;
  subscriptionTier: SubscriptionTier;
  subscriptionEnd: string | null;
  isLoading: boolean;
  checkSubscription: () => Promise<void>;
  canAccessFeature: (feature: string) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export interface SubscriptionProviderProps {
  children: ReactNode;
}

// Features available for each subscription tier - now cached in memory
const featureAccess: Record<string, SubscriptionTier[]> = {
  'basic-analytics': ['free', 'basic', 'premium', 'enterprise'],
  'sentiment-analysis': ['basic', 'premium', 'enterprise'],
  'dialect-detection': ['premium', 'enterprise'],
  'advanced-reporting': ['premium', 'enterprise'],
  'data-export': ['premium', 'enterprise'],
  'bulk-upload': ['basic', 'premium', 'enterprise'],
  'real-time-analytics': ['enterprise'],
  'custom-dashboard': ['enterprise'],
  'priority-support': ['enterprise'],
};

export const SubscriptionProvider = ({ children }: SubscriptionProviderProps) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cachedSubscriptionData, setCachedSubscriptionData] = useState<any>(null);

  // Optimized function to check subscription status
  const checkSubscription = async () => {
    // Admin gets enterprise-level access without subscription checks
    if (isAdmin) {
      setSubscribed(true);
      setSubscriptionTier('enterprise');
      setSubscriptionEnd(null);
      setIsLoading(false);
      return;
    }

    // Set free tier for non-authenticated users
    if (!isAuthenticated || !user) {
      setSubscribed(false);
      setSubscriptionTier('free');
      setSubscriptionEnd(null);
      setIsLoading(false);
      return;
    }

    // Use cached data if available
    if (cachedSubscriptionData) {
      setSubscribed(cachedSubscriptionData.subscribed);
      setSubscriptionTier(cachedSubscriptionData.tier);
      setSubscriptionEnd(cachedSubscriptionData.end);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Combined query to get subscription and plan in a single request
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plan:plan_id (
            name
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        setSubscribed(false);
        setSubscriptionTier('free');
        setSubscriptionEnd(null);
      } else if (data) {
        setSubscribed(true);
        
        // Get tier from plan name
        if (data.plan && data.plan.name) {
          const tierName = data.plan.name.toLowerCase();
          if (tierName.includes('basic')) {
            setSubscriptionTier('basic');
          } else if (tierName.includes('premium')) {
            setSubscriptionTier('premium');
          } else if (tierName.includes('enterprise')) {
            setSubscriptionTier('enterprise');
          } else {
            setSubscriptionTier('free');
          }
        } else {
          setSubscriptionTier('free');
        }
        
        setSubscriptionEnd(data.current_period_end);

        // Cache the subscription data for performance
        setCachedSubscriptionData({
          subscribed: true,
          tier: subscriptionTier,
          end: data.current_period_end
        });
      } else {
        setSubscribed(false);
        setSubscriptionTier('free');
        setSubscriptionEnd(null);
        
        // Cache the free tier status
        setCachedSubscriptionData({
          subscribed: false,
          tier: 'free',
          end: null
        });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast.error('Failed to check subscription status');
    } finally {
      setIsLoading(false);
    }
  };

  // Optimized feature access check - uses in-memory data
  const canAccessFeature = (feature: string): boolean => {
    // Admin can access all features
    if (isAdmin) return true;
    
    // Feature doesn't exist in the mapping
    if (!featureAccess[feature]) return false;
    
    // Check if user's tier can access the feature
    return subscriptionTier !== null && featureAccess[feature].includes(subscriptionTier);
  };

  // Check subscription when auth state changes
  useEffect(() => {
    // Clear cache when auth state changes
    setCachedSubscriptionData(null);
    checkSubscription();
  }, [isAuthenticated, user, isAdmin]);

  const value = {
    subscribed,
    subscriptionTier,
    subscriptionEnd,
    isLoading,
    checkSubscription,
    canAccessFeature,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
