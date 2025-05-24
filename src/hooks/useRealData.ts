
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalPosts: number;
  positivePosts: number;
  negativePosts: number;
  neutralPosts: number;
  jordanianPosts: number;
  recentPosts: any[];
}

export const useRealData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    positivePosts: 0,
    negativePosts: 0,
    neutralPosts: 0,
    jordanianPosts: 0,
    recentPosts: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // جلب إحصائيات المشاعر
        const { data: sentimentStats, error: statsError } = await supabase
          .rpc('get_sentiment_stats', { user_id_param: user.id });

        if (statsError) throw statsError;

        // جلب آخر المنشورات
        const { data: recentPosts, error: postsError } = await supabase
          .from('analyzed_posts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (postsError) throw postsError;

        if (sentimentStats && sentimentStats.length > 0) {
          const statsData = sentimentStats[0];
          setStats({
            totalPosts: statsData.total_posts || 0,
            positivePosts: statsData.positive_posts || 0,
            negativePosts: statsData.negative_posts || 0,
            neutralPosts: statsData.neutral_posts || 0,
            jordanianPosts: statsData.jordanian_posts || 0,
            recentPosts: recentPosts || []
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return { stats, loading };
};
