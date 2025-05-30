import SoundEffects from '@/components/landing/SoundEffects';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Award,
    BarChart3,
    Brain,
    Eye,
    Globe,
    Shield,
    Sparkles,
    Star,
    Target,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import { lazy } from 'react';
import { Link } from 'react-router-dom';

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
      icon: Brain,
      title: "تحليل المشاعر بالذكاء الاصطناعي",
      description: "تحليل دقيق ومتطور للمشاعر باستخدام أحدث تقنيات الذكاء الاصطناعي والتعلم العميق",
      color: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      icon: Globe,
      title: "كشف اللهجات العربية",
      description: "تمييز وتحليل اللهجات العربية المختلفة مع التركيز على اللهجة الأردنية بدقة عالية",
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600"
    },
    {
      icon: TrendingUp,
      title: "تحليل البيانات المتقدم",
      description: "رؤى عميقة وتقارير تفاعلية مع تصورات بيانية متطورة لفهم الاتجاهات",
      color: "bg-gradient-to-br from-purple-500 to-purple-600"
    },
    {
      icon: Zap,
      title: "معالجة فورية",
      description: "تحليل سريع للنصوص في الوقت الفعلي مع نتائج دقيقة ومفصلة",
      color: "bg-gradient-to-br from-orange-500 to-orange-600"
    },
    {
      icon: Shield,
      title: "أمان وخصوصية",
      description: "حماية كاملة للبيانات مع التزام صارم بمعايير الأمان والخصوصية",
      color: "bg-gradient-to-br from-red-500 to-red-600"
    },
    {
      icon: Award,
      title: "دقة استثنائية",
      description: "معدل دقة يصل إلى 99.9% في تحليل المشاعر والنصوص العربية",
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600"
    }
  ];

  const stats = [
    { number: "1M+", label: "تحليل مكتمل", icon: BarChart3 },
    { number: "500+", label: "عميل راضي", icon: Users },
    { number: "15+", label: "منصة مدعومة", icon: Globe },
    { number: "99.9%", label: "دقة التحليل", icon: Target }
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

  const testimonials = [
    {
      name: "أحمد محمد",
      role: "مدير التسويق الرقمي",
      company: "شركة الرؤية التقنية",
      content: "افاق الابتكار للاستشارات و التدريب غيّر طريقة فهمنا لآراء العملاء. التحليل دقيق والتقارير مفصلة جداً.",
      rating: 5
    },
    {
      name: "سارة أحمد",
      role: "محللة البيانات",
      company: "مؤسسة الابتكار",
      content: "أداة ممتازة لتحليل المشاعر. واجهة سهلة ونتائج موثوقة تساعدنا في اتخاذ القرارات.",
      rating: 5
    },
    {
      name: "محمد علي",
      role: "رئيس قسم البحوث",
      company: "معهد الدراسات الاستراتيجية",
      content: "الدقة في كشف اللهجات العربية مذهلة. أصبح تحليل البيانات أسهل وأكثر فعالية.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col" dir="rtl">
      {/* Sound effects component */}
      <SoundEffects autoplay={false} />

      {/* الهيدر المحسن */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className="border-b sticky top-0 z-50 w-full bg-white/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60 shadow-sm"
      >
        <div className="container flex h-20 items-center justify-between py-4">
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            className="flex items-center gap-3"
          >
            <div className="rounded-xl bg-gradient-to-br from-primary to-blue-600 p-2.5 shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-2xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">افاق الابتكار للاستشارات و التدريب</span>
              <div className="text-xs text-muted-foreground">منصة تحليل المشاعر العربية</div>
            </div>
          </motion.div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link to="/" className="transition-colors hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full">الرئيسية</Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link to="/text-analysis" className="transition-colors hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full">جرب مجاناً</Link>
            </motion.div>
            
            {isAuthenticated ? (
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/dashboard">
                  <Button className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg">
                    لوحة التحكم
                    <ArrowLeft className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <div className="flex items-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link to="/signin" className="font-medium transition-colors hover:text-primary">تسجيل الدخول</Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link to="/signup">
                    <Button className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg">إنشاء حساب</Button>
                  </Link>
                </motion.div>
              </div>
            )}
          </nav>
        </div>
      </motion.header>

      {/* القسم الرئيسي المحسن */}
      <section className="py-32 md:py-40 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] opacity-5"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 xl:gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
              >
                <Sparkles className="h-4 w-4" />
                منصة الذكاء الاصطناعي الرائدة في تحليل المشاعر العربية
              </motion.div>
              
              <motion.h1 
                variants={fadeIn}
                initial="initial"
                animate="animate"
                className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl"
              >
                <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  اكتشف قوة
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  تحليل المشاعر العربية
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-xl text-muted-foreground leading-relaxed max-w-2xl"
              >
                منصة افاق الابتكار للاستشارات و التدريب تستخدم أحدث تقنيات الذكاء الاصطناعي لتحليل المشاعر والآراء في النصوص العربية مع دقة استثنائية وكشف متطور للهجات العربية المختلفة.
              </motion.p>
              
              <motion.div 
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.div variants={fadeIn}>
                  {isAuthenticated ? (
                    <Link to="/dashboard">
                      <Button size="lg" className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-lg px-8 py-6 shadow-xl">
                        الذهاب للوحة التحكم
                        <ArrowLeft className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/signup">
                      <Button size="lg" className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-lg px-8 py-6 shadow-xl">
                        ابدأ التحليل مجاناً
                        <Sparkles className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                </motion.div>
                <motion.div variants={fadeIn}>
                  <Link to="/text-analysis">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 hover:bg-primary/5">
                      جرب التحليل الآن
                      <Eye className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-6 pt-4"
              >
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 border-2 border-white"></div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">أكثر من 500+ عميل راضي</p>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="relative"
              variants={floatingAnimation}
              animate="animate"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-3xl blur-3xl"></div>
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative bg-white rounded-3xl shadow-2xl p-8 border"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">تحليل نص تجريبي</h3>
                    <Badge className="bg-green-100 text-green-700">جاهز للتحليل</Badge>
                  </div>
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6">
                    <p className="text-lg leading-relaxed">"هذا المنتج روعة والله، أنصح الكل يجربوه. الجودة عالية والخدمة زَيّ الفل."</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">إيجابي</div>
                      <div className="text-sm text-green-600/70">المشاعر</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">أردني</div>
                      <div className="text-sm text-blue-600/70">اللهجة</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-xl">
                      <div className="text-2xl font-bold text-purple-600">98%</div>
                      <div className="text-sm text-purple-600/70">الدقة</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* إحصائيات محسنة */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/400')] opacity-10"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group cursor-pointer"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors">
                    <stat.icon className="h-8 w-8" />
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* المميزات المحسنة */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-white to-slate-50">
        <div className="container px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <Badge className="mb-6 text-base px-4 py-2">مميزاتنا الاستثنائية</Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                تقنيات متطورة لتحليل
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                المشاعر العربية
              </span>
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-muted-foreground leading-relaxed">
              اكتشف مجموعة شاملة من الأدوات والتقنيات المتقدمة التي تمكنك من فهم الرأي العام والمشاعر في المحتوى العربي بدقة لا مثيل لها
            </p>
          </motion.div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl mb-3">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-lg leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* شهادات العملاء */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4">شهادات العملاء</Badge>
            <h2 className="text-4xl font-bold tracking-tight mb-4">ماذا يقول عملاؤنا؟</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
              اكتشف تجارب عملائنا الحقيقية مع منصة افاق الابتكار للاستشارات و التدريب
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-lg mb-6 leading-relaxed">"{testimonial.content}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600"></div>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                        <div className="text-xs text-muted-foreground">{testimonial.company}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* الدعوة للعمل */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 md:py-32 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/600')] opacity-10"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              ابدأ رحلتك مع افاق الابتكار للاستشارات و التدريب
            </h2>
            <p className="mx-auto max-w-3xl text-xl md:text-2xl mb-10 opacity-90 leading-relaxed">
              انضم إلى مئات الشركات والمؤسسات التي تستخدم منصتنا المتطورة لفهم الرأي العام العربي واتخاذ قرارات مدروسة ومبنية على البيانات
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button size="lg" variant="secondary" className="text-lg px-10 py-6 group shadow-xl">
                    الذهاب للوحة التحكم
                    <ArrowLeft className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <Link to="/signup">
                  <Button size="lg" variant="secondary" className="text-lg px-10 py-6 group shadow-xl">
                    ابدأ التحليل مجاناً
                    <Sparkles className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  </Button>
                </Link>
              )}
              <Link to="/text-analysis">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary text-lg px-10 py-6">
                  جرب التحليل الآن
                  <Eye className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* التذييل المحسن */}
      <footer className="border-t py-16 bg-slate-900 text-slate-300">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-primary to-blue-600 p-2">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white">افاق الابتكار للاستشارات و التدريب</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                منصة متطورة لتحليل المشاعر والبيانات الاجتماعية باللغة العربية باستخدام أحدث تقنيات الذكاء الاصطناعي
              </p>
              <p className="text-xs text-slate-500">
                © 2025 افاق الابتكار للاستشارات و التدريب. جميع الحقوق محفوظة.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">المنتج</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/text-analysis" className="hover:text-white transition-colors hover:underline">جرب مجاناً</Link></li>
                {isAuthenticated && (
                  <li><Link to="/dashboard" className="hover:text-white transition-colors hover:underline">لوحة التحكم</Link></li>
                )}
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">الدعم</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors hover:underline">المساعدة</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:underline">التوثيق</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:underline">اتصل بنا</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:underline">حالة النظام</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">الشركة</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors hover:underline">حولنا</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:underline">المدونة</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:underline">الوظائف</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:underline">الخصوصية</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
