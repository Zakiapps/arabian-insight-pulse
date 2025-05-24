
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { UserCircle2, Star, StarHalf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { StarRating } from '@/components/reviews/StarRating';
import AddReviewForm from '@/components/reviews/AddReviewForm';

// Reviews data as fallback if database fetch fails
const fallbackReviews = [
  {
    id: 1,
    name: "محمد العلي",
    company: "شركة الأفق للتكنولوجيا",
    rating: 5,
    date: "2025-03-15",
    review: "منصة رائعة ساعدتنا في فهم آراء عملائنا بشكل أفضل. التحليلات دقيقة جداً والتقارير مفيدة للغاية.",
    avatar: null
  },
  {
    id: 2,
    name: "سارة الخالدي",
    company: "مؤسسة المستقبل للإعلام",
    rating: 4.5,
    date: "2025-04-02",
    review: "أداة قوية لتحليل المشاعر باللهجة الأردنية. ساعدتنا كثيراً في فهم المحتوى المحلي وتحسين تواصلنا مع الجمهور.",
    avatar: null
  },
  {
    id: 3,
    name: "أحمد الزعبي",
    company: "منصة اقرأ",
    rating: 5,
    date: "2025-04-10",
    review: "الدعم الفني ممتاز والتقارير مفصلة. أنصح بها بشدة لأي شركة تريد فهم توجهات العملاء.",
    avatar: null
  },
  {
    id: 4,
    name: "ليلى الحسن",
    company: "متجر النخبة",
    rating: 4,
    date: "2025-03-28",
    review: "سهلة الاستخدام وفعالة. ساعدتنا على تحسين خدمة العملاء من خلال فهم تعليقاتهم وتحليلها بدقة.",
    avatar: null
  }
];

// Define the review type
interface Review {
  id: number | string;
  name: string;
  company: string;
  rating: number;
  date: string;
  review: string;
  avatar: string | null;
}

const Reviews = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>(fallbackReviews);
  const [loading, setLoading] = useState(true);
  
  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Try to fetch reviews from analyzed_posts table and format them as reviews
      const { data, error } = await supabase
        .from('analyzed_posts')
        .select('*')
        .eq('sentiment', 'positive')
        .limit(6);
      
      if (error) throw error;
      
      // Use fetched data if available, otherwise use fallback
      if (data && data.length > 0) {
        // Transform the data from analyzed_posts to match the Review interface
        const formattedReviews: Review[] = data.map((post, index) => ({
          id: post.id || index + 1,
          name: post.source ? `مستخدم من ${post.source}` : `مستخدم ${index + 1}`,
          company: post.source || "عميل",
          rating: Math.min(Math.max(Math.round((post.sentiment_score || 0.5) * 5), 3), 5), // Convert score to 3-5 rating
          date: post.created_at || new Date().toISOString(),
          review: post.content || "",
          avatar: null
        }));
        
        setReviews(formattedReviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // No toast here - silently fall back to sample data
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchReviews();
  }, []);
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">آراء العملاء</h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto mb-8">
          اطلع على تجارب عملائنا واكتشف كيف ساعدتهم منصة رؤى عربية في فهم آراء الجمهور العربي
        </p>
        
        <div className="flex justify-center gap-4">
          <Link to="/">
            <Button variant="outline">الرئيسية</Button>
          </Link>
          <Link to="/pricing">
            <Button>استكشف خططنا</Button>
          </Link>
        </div>
      </div>
      
      {/* Reviews grid */}
      <div className="container mx-auto pb-24">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {reviews.map((review) => (
            <motion.div key={review.id} variants={item}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {review.avatar ? (
                        <img 
                          src={review.avatar} 
                          alt={review.name} 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <UserCircle2 className="w-12 h-12 text-muted-foreground" />
                      )}
                      <div>
                        <h3 className="font-semibold">{review.name}</h3>
                        <p className="text-sm text-muted-foreground">{review.company}</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(review.date).toLocaleDateString('ar-JO')}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <StarRating rating={review.rating} />
                  </div>
                  
                  <p className="text-muted-foreground flex-grow">{review.review}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Share your experience section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-bold mb-4">شاركنا تجربتك</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            نحن نقدر آراء عملائنا ونسعى دائمًا للتحسين. شاركنا تجربتك مع منصة رؤى عربية
          </p>
          <AddReviewForm onReviewAdded={fetchReviews} />
        </motion.div>
      </div>
    </div>
  );
};

export default Reviews;
