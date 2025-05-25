
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_posts_per_month?: number;
  max_scraping_sources?: number;
  advanced_analytics?: boolean;
  priority_support?: boolean;
  is_popular?: boolean;
  is_active: boolean;
}

const PricingSection = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isYearly, setIsYearly] = useState(false);

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  const fetchPricingPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      console.error('Error fetching pricing plans:', error);
      toast.error('خطأ في جلب خطط الأسعار');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'مجاني';
    return `${(price / 100).toFixed(2)} دينار`;
  };

  const handleSubscribe = async (planId: string, planName: string) => {
    try {
      // Create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          plan_id: planId,
          billing_period: isYearly ? 'yearly' : 'monthly'
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error('لم يتم الحصول على رابط الدفع');
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast.error('خطأ في إنشاء جلسة الدفع');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">جاري تحميل خطط الأسعار...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">خطط الأسعار</h2>
        <p className="text-muted-foreground mb-6">اختر الخطة المناسبة لاحتياجاتك</p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4 space-x-reverse mb-8">
          <span className={!isYearly ? 'font-semibold' : 'text-muted-foreground'}>شهري</span>
          <div className="relative">
            <input
              type="checkbox"
              id="billing-toggle"
              checked={isYearly}
              onChange={(e) => setIsYearly(e.target.checked)}
              className="sr-only"
            />
            <label
              htmlFor="billing-toggle"
              className="flex items-center cursor-pointer"
            >
              <div className={`relative w-12 h-6 rounded-full transition-colors ${isYearly ? 'bg-primary' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isYearly ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
              </div>
            </label>
          </div>
          <span className={isYearly ? 'font-semibold' : 'text-muted-foreground'}>
            سنوي
            <Badge variant="secondary" className="mr-2">وفر 20%</Badge>
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.is_popular ? 'border-primary border-2' : ''}`}
          >
            {plan.is_popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                الأكثر شعبية
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="min-h-[48px]">{plan.description}</CardDescription>
              <div className="pt-4">
                <div className="text-4xl font-bold">
                  {formatPrice(isYearly ? plan.price_yearly : plan.price_monthly)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {plan.price_monthly > 0 && `/ ${isYearly ? 'سنة' : 'شهر'}`}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full"
                variant={plan.is_popular ? 'default' : 'outline'}
                onClick={() => handleSubscribe(plan.id, plan.name)}
                disabled={plan.price_monthly === 0}
              >
                {plan.price_monthly === 0 ? 'ابدأ مجاناً' : 'اشترك الآن'}
              </Button>

              {plan.max_posts_per_month && plan.max_posts_per_month > 0 && (
                <div className="text-xs text-center text-muted-foreground">
                  حتى {plan.max_posts_per_month.toLocaleString()} منشور شهرياً
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>جميع الخطط تشمل ضمان استرداد الأموال لمدة 30 يوماً</p>
        <p>الأسعار شاملة ضريبة القيمة المضافة</p>
      </div>
    </div>
  );
};

export default PricingSection;
