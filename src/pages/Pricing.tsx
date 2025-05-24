import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ArrowRight, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import PaymentModal from '@/components/subscription/PaymentModal';

interface Plan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  features: string[];
  is_active?: boolean;
}

// Fallback plans to show if database fetch fails
const fallbackPlans: Plan[] = [
  {
    id: "1",
    name: "أساسي",
    description: "مثالي للأفراد والشركات الناشئة",
    price_monthly: 19,
    features: [
      "تحليل حتى 1000 منشور شهرياً",
      "تحليل المشاعر الأساسي",
      "كشف اللهجات",
      "تقارير أسبوعية",
      "تنبيهات محدودة"
    ],
    is_active: true
  },
  {
    id: "2",
    name: "احترافي",
    description: "للشركات الصغيرة والمتوسطة",
    price_monthly: 49,
    features: [
      "تحليل حتى 5000 منشور شهرياً",
      "تحليل المشاعر المتقدم",
      "كشف اللهجات المتقدم",
      "تقارير يومية",
      "تنبيهات غير محدودة",
      "واجهة برمجة التطبيقات"
    ],
    is_active: true
  },
  {
    id: "3",
    name: "مؤسسات",
    description: "للمؤسسات الكبيرة والحكومات",
    price_monthly: 199,
    features: [
      "تحليل منشورات غير محدودة",
      "تحليل المشاعر الاحترافي",
      "كشف اللهجات الاحترافي",
      "تحليل مخصص",
      "تقارير مخصصة",
      "دعم على مدار الساعة",
      "واجهة برمجة تطبيقات متقدمة",
      "مدير حساب مخصص"
    ],
    is_active: true
  }
];

const Pricing = () => {
  const [plans, setPlans] = useState<Plan[]>(fallbackPlans);
  const [loading, setLoading] = useState(true);
  const [dbFetchFailed, setDbFetchFailed] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  
  const { isAuthenticated } = useAuth();
  const { subscriptionTier } = useSubscription();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('price_monthly', { ascending: true });
        
        if (error) {
          console.error('Error fetching plans:', error);
          setDbFetchFailed(true);
          toast.error('حدث خطأ أثناء تحميل خطط الاشتراك');
        } else if (data && data.length > 0) {
          // Transform the data to match our Plan interface
          const transformedPlans: Plan[] = data.map(plan => ({
            id: plan.id,
            name: plan.name,
            description: plan.description || '',
            price_monthly: plan.price_monthly,
            features: Array.isArray(plan.features) 
              ? plan.features.map(feature => String(feature)) 
              : [],
            is_active: plan.is_active
          }));
          setPlans(transformedPlans);
          setDbFetchFailed(false);
        } else {
          setDbFetchFailed(true);
          toast.info('تم تحميل خطط الاشتراك الافتراضية');
        }
      } catch (error) {
        console.error('Exception fetching plans:', error);
        setDbFetchFailed(true);
        toast.error('حدث خطأ أثناء الاتصال بالخادم');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, []);
  
  const handleSubscribe = (plan: Plan) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }
    
    setSelectedPlan(plan);
    setPaymentModalOpen(true);
  };
  
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
  };
  
  const cardVariants = {
    hover: {
      scale: 1.03,
      boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };
  
  const selectedCardVariants = {
    selected: {
      y: -10,
      boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.15)",
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };
  
  // Show simple loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <motion.header 
        className="container mx-auto py-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold mb-4">خطط الاشتراك</h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
          اختر الخطة المناسبة لك واستمتع بمميزات تحليل المشاعر والتقارير المتقدمة
        </p>
        {dbFetchFailed && (
          <div className="mt-4 p-2 bg-yellow-50 text-yellow-800 rounded-md inline-block">
            نعرض حالياً الخطط الافتراضية. يرجى تحديث الصفحة للمحاولة مرة أخرى.
          </div>
        )}
      </motion.header>
      
      {/* Pricing Cards */}
      <div className="container mx-auto pb-24">
        <div className="grid gap-10 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              variants={cardVariants}
              whileHover="hover"
              className="h-full"
            >
              <motion.div
                variants={selectedCardVariants}
                animate={subscriptionTier === plan.name.toLowerCase() ? "selected" : ""}
              >
                <Card className={`flex h-full flex-col ${subscriptionTier === plan.name.toLowerCase() ? 'border-primary shadow-lg' : ''}`}>
                  <CardHeader className="flex flex-col space-y-1.5">
                    {subscriptionTier === plan.name.toLowerCase() && (
                      <div className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary mb-2 w-fit">
                        اشتراكك الحالي
                      </div>
                    )}
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div>
                      <span className="text-3xl font-bold">${plan.price_monthly}</span>
                      <span className="text-muted-foreground mr-2">/ شهرياً</span>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="grid gap-2">
                      {plan.features.map((feature: string, i: number) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + i * 0.05 }}
                          className="flex items-center gap-2"
                        >
                          <div className="rounded-full bg-primary/10 p-1">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                          <span>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full group" 
                      variant={subscriptionTier === plan.name.toLowerCase() ? "secondary" : "default"}
                      onClick={() => handleSubscribe(plan)}
                      disabled={subscriptionTier === plan.name.toLowerCase()}
                    >
                      {subscriptionTier === plan.name.toLowerCase() ? (
                        'الخطة الحالية'
                      ) : (
                        <span className="flex items-center">
                          اشترك الآن 
                          <ArrowRight className="mr-2 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                        </span>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-bold mb-4">تحتاج إلى خطة مخصصة؟</h2>
          <p className="text-muted-foreground mb-6">
            تواصل معنا للحصول على خطة مخصصة تناسب احتياجاتك
          </p>
          <Button variant="outline" asChild>
            <Link to="/contact">تواصل معنا</Link>
          </Button>
        </motion.div>
      </div>
      
      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          planId={selectedPlan.id}
          planName={selectedPlan.name}
          planPrice={selectedPlan.price_monthly}
        />
      )}
    </div>
  );
};

export default Pricing;
