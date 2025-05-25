
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BarChart3,
  Bell,
  Check,
  Globe, Languages,
  MessageSquare,
  Shield,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  
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

  const features = [
    {
      icon: BarChart3,
      title: "تحليل المشاعر المتقدم",
      description: "تحليل دقيق للمشاعر في النصوص العربية باستخدام نماذج ONNX المتطورة",
      color: "bg-blue-500"
    },
    {
      icon: Languages,
      title: "كشف اللهجة الأردنية",
      description: "تمييز دقيق للهجة الأردنية من النصوص العربية بدقة عالية",
      color: "bg-green-500"
    },
    {
      icon: MessageSquare,
      title: "تحليل المحتوى الاجتماعي",
      description: "مراقبة وتحليل المنشورات على جميع منصات التواصل الاجتماعي",
      color: "bg-purple-500"
    },
    {
      icon: TrendingUp,
      title: "التقارير التفاعلية",
      description: "تقارير مفصلة مع رؤى قيمة حول اتجاهات الرأي العام",
      color: "bg-orange-500"
    },
    {
      icon: Globe,
      title: "تغطية متعددة المنصات",
      description: "تحليل شامل عبر تويتر، فيسبوك، إنستغرام، ولينكدإن",
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
    { number: "50K+", label: "نص محلل" },
    { number: "98%", label: "دقة التحليل" },
    { number: "15+", label: "نوع تحليل" },
    { number: "24/7", label: "مراقبة مستمرة" }
  ];

  const pricingPlans = [
    {
      name: "المجاني",
      price: "0",
      period: "شهرياً",
      features: [
        "100 تحليل شهرياً",
        "تحليل المشاعر الأساسي",
        "كشف اللهجة الأردنية",
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
        "كشف جميع اللهجات العربية",
        "تنبيهات ذكية",
        "تقارير مفصلة",
        "دعم فني متقدم"
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
      {/* Header */}
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
            <span className="font-semibold text-xl">افاق الابتكار للاستشارات و التدريب</span>
          </motion.div>
          <nav className="hidden md:flex items-center gap-5 text-sm">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link to="/" className="font-medium transition-colors hover:text-foreground/80">الرئيسية</Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link to="/text-analysis" className="font-medium transition-colors hover:text-foreground/80">تجربة مجانية</Link>
            </motion.div>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link to="/dashboard" className="font-medium transition-colors hover:text-primary">لوحة التحكم</Link>
                </motion.div>
                {isAdmin && (
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Link to="/admin" className="font-medium transition-colors hover:text-destructive flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      لوحة المشرف
                    </Link>
                  </motion.div>
                )}
              </div>
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

      {/* Hero Section */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-white to-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-block rounded-lg bg-muted px-3 py-1 text-sm"
            >
              #1 منصة تحليل المشاعر العربية مع كشف اللهجة الأردنية
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
              className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-3xl mx-auto"
            >
              منصة افاق الابتكار للاستشارات و التدريب تستخدم نماذج ONNX المتطورة لتحليل مشاعر النصوص العربية 
              وكشف اللهجة الأردنية بدقة عالية مع رؤى عميقة وتقارير شاملة
            </motion.p>
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="flex flex-col gap-2 min-[400px]:flex-row justify-center"
            >
              <motion.div variants={fadeIn}>
                {isAuthenticated ? (
                  <Link to="/dashboard">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-blue-600">
                      الذهاب للوحة التحكم
                      <ArrowLeft className="mr-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/signup">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-blue-600">
                      البدء مجاناً
                    </Button>
                  </Link>
                )}
              </motion.div>
              <motion.div variants={fadeIn}>
                <Link to="/text-analysis">
                  <Button size="lg" variant="outline">جرب التحليل مجاناً</Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
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

      {/* Features Section */}
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
              تحليل متقدم للمشاعر واللهجة الأردنية
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              مجموعة شاملة من الأدوات لفهم الرأي العام والمشاعر في المحتوى العربي مع التركيز على اللهجة الأردنية
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

      {/* Pricing Section */}
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

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-16 md:py-24 bg-primary text-primary-foreground relative overflow-hidden"
      >
        <div className="container px-4 md:px-6 relative z-10">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              ابدأ رحلتك مع افاق الابتكار للاستشارات و التدريب اليوم
            </h2>
            <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl mb-8">
              انضم إلى المستخدمين الذين يستخدمون منصتنا لفهم الرأي العام العربي واكتشاف اللهجة الأردنية
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

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-primary p-1">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold">افاق الابتكار للاستشارات و التدريب</span>
              </div>
              <p className="text-sm text-muted-foreground">
                منصة متطورة لتحليل المشاعر وكشف اللهجة الأردنية في النصوص العربية
              </p>
              <p className="text-xs text-muted-foreground">
                © 2025 افاق الابتكار للاستشارات و التدريب. جميع الحقوق محفوظة.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium">المنتج</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/text-analysis" className="text-muted-foreground hover:text-foreground transition-colors">تجربة مجانية</Link></li>
                <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">الأسعار</Link></li>
                {isAuthenticated && (
                  <li><Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">لوحة التحكم</Link></li>
                )}
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium">الدعم</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">المساعدة</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">التوثيق</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">اتصل بنا</a></li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium">الشركة</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">حولنا</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">الخصوصية</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">الشروط</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
