import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Globe,
  MessageSquare,
  TrendingUp,
  Brain,
  Sparkles,
  ArrowRight,
  Languages,
  FileText,
  CheckCircle,
  ChevronDown
} from 'lucide-react';

// Define language type
type Language = 'ar' | 'en';

// Define translations
const translations = {
  en: {
    // Navigation
    home: "Home",
    features: "Features",
    pricing: "Pricing",
    login: "Login",
    signup: "Sign Up",
    dashboard: "Dashboard",
    
    // Hero section
    heroTitle: "Discover Insights in Arabic Content",
    heroSubtitle: "Monitor, analyze, and understand Arabic social media and news with advanced AI",
    getStarted: "Get Started",
    tryDemo: "Try Demo",
    
    // Features
    featuresTitle: "Powerful Features",
    featuresSubtitle: "Comprehensive tools for Arabic content analysis",
    
    // Feature cards
    realTimeMonitoring: "Real-Time Monitoring",
    realTimeMonitoringDesc: "Track social media and news sources in real-time with BrightData and NewsAPI integration",
    
    arabicAnalysis: "Arabic Text Analysis",
    arabicAnalysisDesc: "Advanced sentiment analysis and dialect detection specifically trained for Arabic content",
    
    insightForecasting: "Insight Forecasting",
    insightForecastingDesc: "Predict future sentiment trends with our AI-powered forecasting tools",
    
    autoSummaries: "Automatic Summaries",
    autoSummariesDesc: "Get concise summaries of lengthy content using our multilingual summarization model",
    
    // Stats
    analysisAccuracy: "Analysis Accuracy",
    supportedDialects: "Supported Dialects",
    dataSourcesIntegrated: "Data Sources",
    
    // Testimonials
    testimonials: "Testimonials",
    testimonialTitle: "What Our Clients Say",
    
    // CTA
    ctaTitle: "Ready to Gain Insights from Arabic Content?",
    ctaSubtitle: "Start monitoring and analyzing Arabic social media and news today",
    startFree: "Start Free",
    
    // Footer
    product: "Product",
    company: "Company",
    legal: "Legal",
    about: "About",
    contact: "Contact",
    privacy: "Privacy",
    terms: "Terms",
    copyright: "© 2025 Arab Insights. All rights reserved."
  },
  ar: {
    // Navigation
    home: "الرئيسية",
    features: "المميزات",
    pricing: "الأسعار",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
    dashboard: "لوحة التحكم",
    
    // Hero section
    heroTitle: "اكتشف الرؤى في المحتوى العربي",
    heroSubtitle: "راقب وحلل وافهم وسائل التواصل الاجتماعي والأخبار العربية باستخدام الذكاء الاصطناعي المتقدم",
    getStarted: "ابدأ الآن",
    tryDemo: "جرب العرض التوضيحي",
    
    // Features
    featuresTitle: "ميزات قوية",
    featuresSubtitle: "أدوات شاملة لتحليل المحتوى العربي",
    
    // Feature cards
    realTimeMonitoring: "المراقبة في الوقت الفعلي",
    realTimeMonitoringDesc: "تتبع وسائل التواصل الاجتماعي ومصادر الأخبار في الوقت الفعلي مع تكامل BrightData و NewsAPI",
    
    arabicAnalysis: "تحليل النص العربي",
    arabicAnalysisDesc: "تحليل المشاعر المتقدم واكتشاف اللهجة المدربة خصيصًا للمحتوى العربي",
    
    insightForecasting: "التنبؤ بالرؤى",
    insightForecastingDesc: "توقع اتجاهات المشاعر المستقبلية باستخدام أدوات التنبؤ المدعومة بالذكاء الاصطناعي",
    
    autoSummaries: "ملخصات تلقائية",
    autoSummariesDesc: "احصل على ملخصات موجزة للمحتوى الطويل باستخدام نموذج التلخيص متعدد اللغات",
    
    // Stats
    analysisAccuracy: "دقة التحليل",
    supportedDialects: "اللهجات المدعومة",
    dataSourcesIntegrated: "مصادر البيانات",
    
    // Testimonials
    testimonials: "آراء العملاء",
    testimonialTitle: "ماذا يقول عملاؤنا",
    
    // CTA
    ctaTitle: "هل أنت مستعد للحصول على رؤى من المحتوى العربي؟",
    ctaSubtitle: "ابدأ في مراقبة وتحليل وسائل التواصل الاجتماعي والأخبار العربية اليوم",
    startFree: "ابدأ مجانًا",
    
    // Footer
    product: "المنتج",
    company: "الشركة",
    legal: "قانوني",
    about: "عن الشركة",
    contact: "اتصل بنا",
    privacy: "الخصوصية",
    terms: "الشروط",
    copyright: "© 2025 رؤى عربية. جميع الحقوق محفوظة."
  }
};

const BilingualLanding = () => {
  const [language, setLanguage] = useState<Language>('ar');
  const { isAuthenticated } = useAuth();
  const t = translations[language];
  
  // Animation variants
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
  
  // Testimonials data
  const testimonials = [
    {
      name: language === 'ar' ? "محمد العلي" : "Mohammed Al-Ali",
      company: language === 'ar' ? "شركة الأفق للتكنولوجيا" : "Horizon Tech",
      text: language === 'ar' 
        ? "ساعدتنا هذه المنصة في فهم آراء عملائنا بشكل أفضل. التحليلات دقيقة والتقارير مفيدة للغاية."
        : "This platform helped us better understand our customers' opinions. The analytics are accurate and the reports are extremely useful."
    },
    {
      name: language === 'ar' ? "سارة الخالدي" : "Sara Al-Khalidi",
      company: language === 'ar' ? "مؤسسة المستقبل للإعلام" : "Future Media Foundation",
      text: language === 'ar'
        ? "أداة قوية لتحليل المشاعر باللهجات العربية المختلفة. ساعدتنا كثيراً في فهم المحتوى المحلي."
        : "A powerful tool for sentiment analysis in various Arabic dialects. It helped us greatly in understanding local content."
    }
  ];
  
  // Stats data
  const stats = [
    { value: "95%", label: t.analysisAccuracy },
    { value: "12+", label: t.supportedDialects },
    { value: "20+", label: t.dataSourcesIntegrated }
  ];
  
  // Toggle language
  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };
  
  // Set document direction based on language
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  return (
    <div className={`min-h-screen bg-background ${language === 'ar' ? 'font-cairo' : ''}`}>
      {/* Header */}
      <header className="border-b sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary p-1.5">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-xl">
              {language === 'ar' ? 'رؤى عربية' : 'Arab Insights'}
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-5 text-sm">
            <Link to="/" className="font-medium transition-colors hover:text-foreground/80">
              {t.home}
            </Link>
            <a href="#features" className="font-medium transition-colors hover:text-foreground/80">
              {t.features}
            </a>
            <Link to="/pricing" className="font-medium transition-colors hover:text-foreground/80">
              {t.pricing}
            </Link>
            
            <button 
              onClick={toggleLanguage}
              className="font-medium px-3 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors"
            >
              {language === 'ar' ? 'EN' : 'عربي'}
            </button>
            
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button>
                  {t.dashboard}
                  {language === 'ar' ? (
                    <ArrowRight className="mr-2 h-4 w-4" />
                  ) : (
                    <ArrowRight className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/signin" className="font-medium transition-colors hover:text-primary">
                  {t.login}
                </Link>
                <Link to="/signup">
                  <Button>{t.signup}</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-white to-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-block rounded-lg bg-muted px-3 py-1 text-sm"
            >
              <Languages className="h-4 w-4 inline mr-2" />
              {language === 'ar' ? 'منصة تحليل المحتوى العربي الأولى' : '#1 Arabic Content Analysis Platform'}
            </motion.div>
            
            <motion.h1 
              variants={fadeIn}
              initial="initial"
              animate="animate"
              className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl"
            >
              {t.heroTitle}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-3xl"
            >
              {t.heroSubtitle}
            </motion.p>
            
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="flex flex-col gap-2 min-[400px]:flex-row justify-center"
            >
              <motion.div variants={fadeIn}>
                <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                  <Button size="lg" className="bg-gradient-to-r from-primary to-blue-600">
                    {isAuthenticated ? t.dashboard : t.getStarted}
                  </Button>
                </Link>
              </motion.div>
              <motion.div variants={fadeIn}>
                <Link to="/text-analysis">
                  <Button size="lg" variant="outline">{t.tryDemo}</Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4">{t.featuresTitle}</Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              {t.featuresSubtitle}
            </h2>
          </motion.div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center mb-4">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t.realTimeMonitoring}</h3>
                  <p className="text-muted-foreground">{t.realTimeMonitoringDesc}</p>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t.arabicAnalysis}</h3>
                  <p className="text-muted-foreground">{t.arabicAnalysisDesc}</p>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t.insightForecasting}</h3>
                  <p className="text-muted-foreground">{t.insightForecastingDesc}</p>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Feature 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t.autoSummaries}</h3>
                  <p className="text-muted-foreground">{t.autoSummariesDesc}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4">{t.testimonials}</Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              {t.testimonialTitle}
            </h2>
          </motion.div>
          
          <div className="grid gap-8 md:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </div>
                    <p className="text-lg mb-6">"{testimonial.text}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600"></div>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                      </div>
                    </div>
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
        className="py-16 md:py-24 bg-gradient-to-br from-primary to-blue-600 text-primary-foreground relative overflow-hidden"
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
              {t.ctaTitle}
            </h2>
            <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl mb-8">
              {t.ctaSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                <Button size="lg" variant="secondary" className="group">
                  {isAuthenticated ? t.dashboard : t.startFree}
                  {language === 'ar' ? (
                    <ArrowRight className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  ) : (
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  )}
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
                <span className="font-semibold">
                  {language === 'ar' ? 'رؤى عربية' : 'Arab Insights'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' 
                  ? 'منصة متطورة لتحليل المشاعر وكشف اللهجة في النصوص العربية'
                  : 'Advanced platform for sentiment analysis and dialect detection in Arabic texts'}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.copyright}
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium">{t.product}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">{t.features}</a></li>
                <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">{t.pricing}</Link></li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium">{t.company}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.about}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.contact}</a></li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium">{t.legal}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.privacy}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.terms}</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BilingualLanding;