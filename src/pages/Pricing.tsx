
import React from 'react';
import { Check, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const plans = [
  {
    id: 'basic',
    name: 'الأساسية',
    description: 'مثالية للمشاريع الصغيرة والشخصية',
    price_monthly: 999, // $9.99
    features: [
      'تحليل حتى 1000 منشور شهرياً',
      'تحليل المشاعر الأساسي',
      'تقارير أسبوعية',
      'دعم فني عبر البريد الإلكتروني',
      'واجهة برمجة التطبيقات محدودة'
    ]
  },
  {
    id: 'professional',
    name: 'الاحترافية',
    description: 'الأنسب للشركات المتوسطة',
    price_monthly: 2999, // $29.99
    features: [
      'تحليل حتى 10,000 منشور شهرياً',
      'تحليل مشاعر متقدم مع كشف اللهجة',
      'تقارير يومية ومخصصة',
      'تحليل توزيع المنصات والفئات',
      'دعم فني مباشر',
      'واجهة برمجة التطبيقات كاملة',
      'تصدير البيانات بصيغ متعددة'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'المؤسسية',
    description: 'حلول متكاملة للمؤسسات الكبيرة',
    price_monthly: 9999, // $99.99
    features: [
      'تحليل غير محدود للمنشورات',
      'تحليل مشاعر بالذكاء الاصطناعي',
      'تقارير فورية ومخصصة بالكامل',
      'تحليل متقدم لجميع أدوات التحليل',
      'إدارة فريق متعددة المستويات',
      'دعم فني مخصص 24/7',
      'تكامل مخصص مع الأنظمة',
      'تدريب وإعداد مخصص'
    ]
  }
];

const Pricing = () => {
  const { isAuthenticated } = useAuth();

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">رؤ</span>
            </div>
            رؤى عربية
          </Link>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button asChild>
                <Link to="/dashboard">لوحة التحكم</Link>
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link to="/login">تسجيل الدخول</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">إنشاء حساب</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              خطط الأسعار
            </Badge>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-l from-primary to-blue-600 bg-clip-text text-transparent">
              اختر الخطة المناسبة لك
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              خطط مرنة تناسب جميع الاحتياجات من الأفراد إلى المؤسسات الكبيرة
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-white flex items-center gap-1 px-4 py-1">
                      <Star className="h-3 w-3 fill-current" />
                      الأكثر شعبية
                    </Badge>
                  </div>
                )}
                <Card className={`h-full ${plan.popular ? 'border-primary shadow-xl scale-105' : 'border-border'} transition-all duration-300 hover:shadow-lg`}>
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">${formatPrice(plan.price_monthly)}</span>
                      <span className="text-muted-foreground">/شهرياً</span>
                    </div>
                    <CardDescription className="text-base mt-2">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-8">
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                      variant={plan.popular ? "default" : "outline"}
                      asChild
                    >
                      {isAuthenticated ? (
                        <Link to="/dashboard" className="flex items-center justify-center gap-2">
                          اشترك الآن
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      ) : (
                        <Link to="/register" className="flex items-center justify-center gap-2">
                          ابدأ مجاناً
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">
              هل تحتاج إلى حل مخصص؟
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              نقدم حلول مخصصة للمؤسسات الكبيرة والمشاريع ذات المتطلبات الخاصة
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              تواصل معنا
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
