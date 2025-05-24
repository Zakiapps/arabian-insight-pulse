
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

// Features available for each subscription tier
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
  const { user, isAuthenticated } = useAuth();
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Function to check subscription status
  const checkSubscription = async () => {
    if (!isAuthenticated || !user) {
      setSubscribed(false);
      setSubscriptionTier('free');
      setSubscriptionEnd(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // For the purpose of this demo, we'll query the subscriptions table directly
      // In a production app, you might want to use a secure backend endpoint
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
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
        
        // Get the subscription tier from the plan
        const { data: planData, error: planError } = await supabase
          .from('subscription_plans')
          .select('name')
          .eq('id', data.plan_id)
          .single();
        
        if (planData) {
          // Convert plan name to tier
          const tierName = planData.name.toLowerCase();
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
      } else {
        setSubscribed(false);
        setSubscriptionTier('free');
        setSubscriptionEnd(null);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast.error('Failed to check subscription status');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user can access a specific feature based on their subscription tier
  const canAccessFeature = (feature: string): boolean => {
    // Admin can access all features
    if (user?.profile?.role === 'admin') return true;
    
    // Feature doesn't exist in the mapping
    if (!featureAccess[feature]) return false;
    
    // Check if user's tier can access the feature
    return subscriptionTier !== null && featureAccess[feature].includes(subscriptionTier);
  };

  // Check subscription on mount and when auth state changes
  useEffect(() => {
    checkSubscription();
  }, [isAuthenticated, user]);

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
