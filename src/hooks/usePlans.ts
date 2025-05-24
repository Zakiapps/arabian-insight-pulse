
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Plan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  features: string[];
  created_at?: string;
  price_yearly?: number;
  is_active?: boolean;
}

export const usePlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('price_monthly', { ascending: true });

        if (error) throw error;

        // Transform the data to match our Plan interface
        const transformedPlans: Plan[] = (data || []).map(plan => ({
          id: plan.id,
          name: plan.name,
          description: plan.description || '',
          price_monthly: plan.price_monthly,
          features: Array.isArray(plan.features) ? plan.features : [],
          created_at: plan.created_at,
          price_yearly: plan.price_yearly,
          is_active: plan.is_active
        }));

        setPlans(transformedPlans);
      } catch (err: any) {
        console.error('Error fetching plans:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return { plans, loading, error };
};
