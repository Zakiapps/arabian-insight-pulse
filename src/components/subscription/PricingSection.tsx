
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_posts_per_month: number;
  max_scraping_sources: number;
  advanced_analytics: boolean;
  priority_support: boolean;
  is_popular: boolean;
  is_active: boolean;
}

const PricingSection = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) throw error;

      // تحويل features من Json إلى string[]
      const transformedPlans: PricingPlan[] = (data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : []
      }));

      setPlans(transformedPlans);
    } catch (error: any) {
      console.error('Error fetching plans:', error);
      toast.error('خطأ في جلب الباقات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          plan_id: planId,
          billing_period: billingPeriod
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        toast.success('تم تفعيل الباقة المجانية بنجاح');
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast.error('خطأ في إنشاء جلسة الدفع');
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'مجاني';
    return `${(price / 100).toFixed(2)} دينار`;
  };

  const getPrice = (plan: PricingPlan) => {
    return billingPeriod === 'yearly' ? plan.price_yearly : plan.price_monthly;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">جاري تحميل الباقات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">اختر الباقة المناسبة لك</h2>
        <p className="text-lg text-muted-foreground mb-8">
          باقات مرنة تناسب جميع احتياجاتك من تحليل المشاعر ومراقبة وسائل التواصل
        </p>

        {/* مفتاح تبديل الفترة */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-muted p-1 rounded-lg">
            <Button
              variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBillingPeriod('monthly')}
            >
              شهري
            </Button>
            <Button
              variant={billingPeriod === 'yearly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBillingPeriod('yearly')}
            >
              سنوي
              <Badge variant="secondary" className="mr-2">وفر 20%</Badge>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.is_popular ? 'border-primary shadow-lg' : ''}`}>
            {plan.is_popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 py-1">
                  <Star className="w-3 h-3 mr-1" />
                  الأكثر شعبية
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">{formatPrice(getPrice(plan))}</span>
                {plan.price_monthly > 0 && (
                  <span className="text-muted-foreground">/{billingPeriod === 'yearly' ? 'سنة' : 'شهر'}</span>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>المنشورات الشهرية: {plan.max_posts_per_month === -1 ? 'غير محدود' : plan.max_posts_per_month}</div>
                  <div>مصادر السحب: {plan.max_scraping_sources === -1 ? 'غير محدود' : plan.max_scraping_sources}</div>
                </div>
              </div>

              <Button 
                className="w-full"
                onClick={() => handleSubscribe(plan.id)}
                variant={plan.is_popular ? 'default' : 'outline'}
              >
                {plan.price_monthly === 0 ? 'ابدأ مجاناً' : 'اشترك الآن'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>جميع الباقات تشمل ضمان استرداد المال خلال 30 يوم</p>
        <p>لا توجد رسوم إضافية أو تكاليف خفية</p>
      </div>
    </div>
  );
};

export default PricingSection;
