
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

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

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
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
            <span className="font-semibold text-xl">رؤى عربية</span>
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
              <a href="#testimonials" className="font-medium transition-colors hover:text-foreground/80">آراء العملاء</a>
            </motion.div>
            
            {isAuthenticated ? (
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link to="/dashboard">
                  <Button>لوحة التحكم</Button>
                </Link>
              </motion.div>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link to="/login" className="font-medium transition-colors hover:text-primary">تسجيل الدخول</Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link to="/register">
                    <Button>إنشاء حساب</Button>
                  </Link>
                </motion.div>
              </>
            )}
          </nav>
          <Button variant="outline" size="icon" className="md:hidden">
            <ChevronLeft className="h-4 w-4" />
          </Button>
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
                #1 منصة تحليل المشاعر العربية في الأردن
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
                منصة رؤى عربية تمكنك من تحليل مشاعر المستخدمين على وسائل التواصل الاجتماعي باللهجة الأردنية والعربية.
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
                    <Link to="/register">
                      <Button size="lg">البدء مجاناً</Button>
                    </Link>
                  )}
                </motion.div>
                <motion.div variants={fadeIn}>
                  <Link to="/services">
                    <Button size="lg" variant="outline">استكشف الخدمات</Button>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div 
              className="flex items-center justify-center"
              variants={floatingAnimation}
              animate="animate"
            >
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative h-[350px] w-full md:h-[420px] lg:h-[650px]"
              >
                <img
                  src="/placeholder.svg"
                  alt="لوحة تحكم رؤى عربية"
                  className="mx-auto h-full w-full object-cover rounded-lg bg-muted/50 p-2 sm:p-4 shadow-xl animate-fade-in"
                />
                <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-primary/10"></div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* المميزات */}
      <section className="py-12 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center space-y-4 text-center"
          >
            <div className="space-y-2">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-white"
              >
                مميزاتنا
              </motion.div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">تحليل متقدم لمشاعر الجمهور العربي</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                اكتشف ما يقوله الناس عن علامتك التجارية وفهم المشاعر والتوجهات في اللهجة العربية الأردنية
              </p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, staggerChildren: 0.1 }}
            className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12"
          >
            {/* Feature cards */}
            <motion.div
              whileHover={{ y: -10, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)" }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              <Card className="relative overflow-hidden transition-all">
                <CardContent className="p-6">
                  <motion.div 
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      transition: { repeat: Infinity, repeatDelay: 5, duration: 0.5 } 
                    }}
                    className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4"
                  >
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold">تحليل المشاعر</h3>
                  <p className="text-muted-foreground">تحليل مشاعر المستخدمين إيجابية أم سلبية أم محايدة</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -10, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)" }}
              transition={{ type: "spring", stiffness: 500 }}
              className="lg:mt-10"
            >
              <Card className="relative overflow-hidden transition-all">
                <CardContent className="p-6">
                  <motion.div 
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      transition: { repeat: Infinity, repeatDelay: 7, duration: 0.5 } 
                    }}
                    className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4"
                  >
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold">تصنيف المواضيع</h3>
                  <p className="text-muted-foreground">تصنيف المحتوى إلى فئات مثل السياسة والرياضة والتكنولوجيا</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -10, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)" }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              <Card className="relative overflow-hidden transition-all">
                <CardContent className="p-6">
                  <motion.div 
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      transition: { repeat: Infinity, repeatDelay: 6, duration: 0.5 } 
                    }}
                    className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4"
                  >
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold">تنبيهات المشاعر</h3>
                  <p className="text-muted-foreground">تنبيهات فورية عند ارتفاع المشاعر السلبية حول علامتك التجارية</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* الدعوة للعمل */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-12 md:py-24 bg-primary text-primary-foreground"
      >
        <div className="container px-4 md:px-6">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center space-y-4 text-center"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">ابدأ باستخدام رؤى عربية اليوم</h2>
              <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl">
                انضم إلى مئات الشركات التي تستخدم منصتنا لفهم الرأي العام العربي
              </p>
            </div>
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="flex flex-col gap-2 min-[400px]:flex-row"
            >
              {isAuthenticated ? (
                <motion.div variants={fadeIn}>
                  <Link to="/dashboard">
                    <Button size="lg" variant="secondary">الذهاب للوحة التحكم</Button>
                  </Link>
                </motion.div>
              ) : (
                <motion.div variants={fadeIn}>
                  <Link to="/register">
                    <Button size="lg" variant="secondary">البدء مجاناً</Button>
                  </Link>
                </motion.div>
              )}
              <motion.div variants={fadeIn}>
                <Link to="/pricing">
                  <Button size="lg" variant="outline" className="border-primary-foreground">عرض الأسعار</Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* التذييل */}
      <footer className="border-t py-6 md:py-10">
        <div className="container flex flex-col gap-4 md:flex-row md:gap-8 lg:gap-12">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-primary p-1">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">رؤى عربية</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 رؤى عربية. جميع الحقوق محفوظة.
            </p>
          </div>
          <nav className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">المنتج</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/services" className="text-muted-foreground transition-colors hover:text-foreground">الخدمات</Link></li>
                <li><Link to="/pricing" className="text-muted-foreground transition-colors hover:text-foreground">الأسعار</Link></li>
                <li><a href="#" className="text-muted-foreground transition-colors hover:text-foreground">المقارنة</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">الشركة</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground transition-colors hover:text-foreground">حول</a></li>
                <li><a href="#" className="text-muted-foreground transition-colors hover:text-foreground">العملاء</a></li>
                <li><a href="#" className="text-muted-foreground transition-colors hover:text-foreground">اتصل بنا</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">المصادر</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground transition-colors hover:text-foreground">المدونة</a></li>
                <li><a href="#" className="text-muted-foreground transition-colors hover:text-foreground">التوثيق</a></li>
                <li><a href="#" className="text-muted-foreground transition-colors hover:text-foreground">الدعم</a></li>
              </ul>
            </div>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
