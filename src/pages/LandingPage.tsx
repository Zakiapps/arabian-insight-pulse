
import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* الهيدر */}
      <header className="border-b sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary p-1.5">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-xl">رؤى عربية</span>
          </div>
          <nav className="hidden md:flex items-center gap-5 text-sm">
            <Link to="/" className="font-medium transition-colors hover:text-foreground/80">الرئيسية</Link>
            <Link to="/services" className="font-medium transition-colors hover:text-foreground/80">خدماتنا</Link>
            <Link to="/pricing" className="font-medium transition-colors hover:text-foreground/80">الأسعار</Link>
            <a href="#testimonials" className="font-medium transition-colors hover:text-foreground/80">آراء العملاء</a>
            <Link to="/login" className="font-medium transition-colors hover:text-primary">تسجيل الدخول</Link>
            <Link to="/register">
              <Button>إنشاء حساب</Button>
            </Link>
          </nav>
          <Button variant="outline" size="icon" className="md:hidden">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* قسم الترحيب الرئيسي */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-white to-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                #1 منصة تحليل المشاعر العربية في الأردن
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">اكتشف آراء وتوجهات الجمهور العربي</h1>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                منصة رؤى عربية تمكنك من تحليل مشاعر المستخدمين على وسائل التواصل الاجتماعي باللهجة الأردنية والعربية.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link to="/register">
                  <Button size="lg">البدء مجاناً</Button>
                </Link>
                <Link to="/services">
                  <Button size="lg" variant="outline">استكشف الخدمات</Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[350px] w-full md:h-[420px] lg:h-[650px]">
                <img
                  src="/placeholder.svg"
                  alt="لوحة تحكم رؤى عربية"
                  className="mx-auto h-full w-full object-cover rounded-lg bg-muted/50 p-2 sm:p-4 shadow-xl animate-fade-in"
                />
                <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-primary/10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* المميزات */}
      <section className="py-12 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-white">مميزاتنا</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">تحليل متقدم لمشاعر الجمهور العربي</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                اكتشف ما يقوله الناس عن علامتك التجارية وفهم المشاعر والتوجهات في اللهجة العربية الأردنية
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <Card className="relative overflow-hidden transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">تحليل المشاعر</h3>
                <p className="text-muted-foreground">تحليل مشاعر المستخدمين إيجابية أم سلبية أم محايدة</p>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">تصنيف المواضيع</h3>
                <p className="text-muted-foreground">تصنيف المحتوى إلى فئات مثل السياسة والرياضة والتكنولوجيا</p>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">تنبيهات المشاعر</h3>
                <p className="text-muted-foreground">تنبيهات فورية عند ارتفاع المشاعر السلبية حول علامتك التجارية</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* الدعوة للعمل */}
      <section className="py-12 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">ابدأ باستخدام رؤى عربية اليوم</h2>
              <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl">
                انضم إلى مئات الشركات التي تستخدم منصتنا لفهم الرأي العام العربي
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link to="/register">
                <Button size="lg" variant="secondary">البدء مجاناً</Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="border-primary-foreground">عرض الأسعار</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

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
