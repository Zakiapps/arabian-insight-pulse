
import React, { useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, ChevronLeft, ChevronRight, ArrowLeft, 
  ArrowRight, Check, ExternalLink, Users, MessageSquare,
  TrendingUp, Globe, Languages, Bell, Shield, Zap,
  Target, Eye, Heart, Share2, FileText, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import SoundEffects from '@/components/landing/SoundEffects';

// Lazy load the 3D scene component for better performance
const ThreeDScene = lazy(() => import('@/components/landing/ThreeDScene'));

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };
  
  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const floatingAnimation = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "mirror" as const
      }
    }
  };

  const features = [
    {
      icon: BarChart3,
      title: "تحليل المشاعر المتقدم",
      description: "تحليل دقيق للمشاعر في النصوص العربية باستخدام نماذج الذكاء الاصطناعي المتطورة",
      color: "bg-blue-500"
    },
    {
      icon: MessageSquare,
      title: "تحليل المحتوى الاجتماعي",
      description: "مراقبة وتحليل المنشورات على جميع منصات التواصل الاجتماعي في الوقت الفعلي",
      color: "bg-green-500"
    },
    {
      icon: TrendingUp,
      title: "التقارير والإحصائيات",
      description: "تقارير تفاعلية مفصلة مع رؤى قيمة حول اتجاهات الرأي العام",
      color: "bg-purple-500"
    },
    {
      icon: Globe,
      title: "تغطية متعددة المنصات",
      description: "تحليل شامل عبر تويتر، فيسبوك، إنستغرام، ولينكدإن",
      color: "bg-orange-500"
    },
    {
      icon: Languages,
      title: "كشف اللهجات العربية",
      description: "تمييز وتحليل اللهجات العربية المختلفة بدقة عالية",
      color: "bg-pink-500"
    },
    {
      icon: Bell,
      title: "تنبيهات ذكية",
      description: "تنبيهات فورية عند تغيرات مهمة في المشاعر أو الاتجاهات",
      color: "bg-red-500"
    }
  ];

  const stats = [
    { number: "1M+", label: "منشور محلل" },
    { number: "500+", label: "عميل راضي" },
    { number: "15+", label: "منصة مدعومة" },
    { number: "99.9%", label: "دقة التحليل" }
  ];

  const pricingPlans = [
    {
      name: "المجاني",
      price: "0",
      period: "شهرياً",
      features: [
        "100 تحليل شهرياً",
        "تحليل المشاعر الأساسي",
        "دعم بريد إلكتروني",
        "تقارير أساسية"
      ],
      buttonText: "ابدأ مجاناً",
      popular: false
    },
    {
      name: "المحترف",
      price: "99",
      period: "شهرياً",
      features: [
        "10,000 تحليل شهرياً",
        "تحليل متقدم للمشاعر",
        "كشف اللهجات",
        "تنبيهات ذكية",
        "تقارير مفصلة",
        "دعم هاتفي"
      ],
      buttonText: "اشترك الآن",
      popular: true
    },
    {
      name: "المؤسسي",
      price: "299",
      period: "شهرياً",
      features: [
        "تحليل غير محدود",
        "جميع الميزات المتقدمة",
        "واجهة برمجة تطبيقات",
        "تكامل مخصص",
        "مدير حساب مخصص",
        "دعم 24/7"
      ],
      buttonText: "تواصل معنا",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Sound effects component */}
      <SoundEffects autoplay={false} />

      {/* الهيدر */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className="border-b sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container flex h-16 items-center justify-between py-4">
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            className="flex items-center gap-2"
          >
            <div className="rounded-md bg-primary p-1.5">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-xl">Arab Insights</span>
          </motion.div>
          <nav className="hidden md:flex items-center gap-5 text-sm">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link to="/" className="font-medium transition-colors hover:text-foreground/80">الرئيسية</Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link to="/services" className="font-medium transition-colors hover:text-foreground/80">خدماتنا</Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link to="/pricing" className="font-medium transition-colors hover:text-foreground/80">الأسعار</Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link to="/reviews" className="font-medium transition-colors hover:text-foreground/80">آراء العملاء</Link>
            </motion.div>
            
            {isAuthenticated ? (
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/dashboard">
                  <Button className="bg-gradient-to-r from-primary to-primary-dark hover:opacity-90">
                    لوحة التحكم
                    <ArrowLeft className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link to="/signin" className="font-medium transition-colors hover:text-primary">تسجيل الدخول</Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link to="/signup">
                    <Button>إنشاء حساب</Button>
                  </Link>
                </motion.div>
              </>
            )}
          </nav>
        </div>
      </motion.header>

      {/* قسم الترحيب الرئيسي */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-white to-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-block rounded-lg bg-muted px-3 py-1 text-sm"
              >
                #1 منصة تحليل المشاعر العربية
              </motion.div>
              <motion.h1 
                variants={fadeIn}
                initial="initial"
                animate="animate"
                className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl"
              >
                اكتشف آراء وتوجهات الجمهور العربي
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
              >
                منصة Arab Insights تمكنك من تحليل مشاعر المستخدمين على وسائل التواصل الاجتماعي باللهجة العربية مع رؤى عميقة وتقارير شاملة.
              </motion.p>
              <motion.div 
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="flex flex-col gap-2 min-[400px]:flex-row"
              >
                <motion.div variants={fadeIn}>
                  {isAuthenticated ? (
                    <Link to="/dashboard">
                      <Button size="lg">الذهاب للوحة التحكم</Button>
                    </Link>
                  ) : (
                    <Link to="/signup">
                      <Button size="lg">البدء مجاناً</Button>
                    </Link>
                  )}
                </motion.div>
                <motion.div variants={fadeIn}>
                  <Link to="/text-analysis">
                    <Button size="lg" variant="outline">جرب التحليل مجاناً</Button>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div 
              className="flex items-center justify-center relative"
              variants={floatingAnimation}
              animate="animate"
            >
              <div className="absolute inset-0 z-0">
                <Suspense fallback={<div className="w-full h-full bg-muted/20 animate-pulse rounded-lg"></div>}>
                  <ThreeDScene className="h-full" />
                </Suspense>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative h-[350px] w-full md:h-[420px] lg:h-[650px] z-10"
              >
                <img
                  src="/placeholder.svg"
                  alt="لوحة تحكم Arab Insights"
                  className="mx-auto h-full w-full object-cover rounded-lg bg-muted/50 p-2 sm:p-4 shadow-xl animate-fade-in backdrop-blur-sm"
                  loading="lazy"
                />
                <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-primary/10"></div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* إحصائيات سريعة */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-sm opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* المميزات الشاملة */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4">مميزاتنا الشاملة</Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              كل ما تحتاجه لتحليل المشاعر العربية
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              مجموعة شاملة من الأدوات والميزات لفهم الرأي العام والمشاعر في المحتوى العربي
            </p>
          </motion.div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="h-full transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* خطط الأسعار */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4">خطط الأسعار</Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              اختر الخطة المناسبة لك
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              خطط مرنة تناسب جميع الاحتياجات من الأفراد إلى المؤسسات الكبيرة
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                    الأكثر شعبية
                  </Badge>
                )}
                <Card className={`h-full ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="text-4xl font-bold">
                      ${plan.price}
                      <span className="text-lg font-normal text-muted-foreground">/{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                      asChild
                    >
                      <Link to={plan.name === "المجاني" ? "/signup" : "/pricing"}>
                        {plan.buttonText}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* روابط سريعة */}
      <section className="py-12 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Link to="/text-analysis" className="group">
              <Card className="transition-all hover:shadow-md group-hover:scale-105">
                <CardContent className="p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">جرب التحليل</h3>
                  <p className="text-sm text-muted-foreground">اختبر خدمة تحليل النصوص مجاناً</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/services" className="group">
              <Card className="transition-all hover:shadow-md group-hover:scale-105">
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">خدماتنا</h3>
                  <p className="text-sm text-muted-foreground">اكتشف جميع الخدمات المتاحة</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/reviews" className="group">
              <Card className="transition-all hover:shadow-md group-hover:scale-105">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">آراء العملاء</h3>
                  <p className="text-sm text-muted-foreground">اقرأ تجارب عملائنا</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/pricing" className="group">
              <Card className="transition-all hover:shadow-md group-hover:scale-105">
                <CardContent className="p-6 text-center">
                  <Eye className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">تفاصيل الأسعار</h3>
                  <p className="text-sm text-muted-foreground">مقارنة مفصلة للخطط</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* الدعوة للعمل */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-16 md:py-24 bg-primary text-primary-foreground relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-r from-white/10 to-white/0"></div>
        </div>
        
        <div className="container px-4 md:px-6 relative z-10">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              ابدأ رحلتك مع Arab Insights اليوم
            </h2>
            <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl mb-8">
              انضم إلى مئات الشركات التي تستخدم منصتنا لفهم الرأي العام العربي واتخاذ قرارات مدروسة
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button size="lg" variant="secondary" className="group">
                    الذهاب للوحة التحكم
                    <ArrowLeft className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <Link to="/signup">
                  <Button size="lg" variant="secondary" className="group">
                    البدء مجاناً الآن
                    <ArrowLeft className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}
              <Link to="/text-analysis">
                <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  جرب التحليل مجاناً
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* التذييل */}
      <footer className="border-t py-12 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-primary p-1">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold">Arab Insights</span>
              </div>
              <p className="text-sm text-muted-foreground">
                منصة متطورة لتحليل المشاعر والبيانات الاجتماعية باللغة العربية
              </p>
              <p className="text-xs text-muted-foreground">
                © 2025 Arab Insights. جميع الحقوق محفوظة.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium">المنتج</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/services" className="text-muted-foreground hover:text-foreground transition-colors">الخدمات</Link></li>
                <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">الأسعار</Link></li>
                <li><Link to="/text-analysis" className="text-muted-foreground hover:text-foreground transition-colors">جرب مجاناً</Link></li>
                <li><Link to="/reviews" className="text-muted-foreground hover:text-foreground transition-colors">آراء العملاء</Link></li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium">الدعم</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">المساعدة</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">التوثيق</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">اتصل بنا</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">حالة النظام</a></li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium">الشركة</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">حولنا</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">المدونة</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">الوظائف</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">الخصوصية</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
