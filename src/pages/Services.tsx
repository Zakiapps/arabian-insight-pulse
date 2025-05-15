
import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, MessageSquare, LineChart, BarChart, Bell, FileText, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Services = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* الهيدر */}
      <header className="border-b sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-md bg-primary p-1.5">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-xl">رؤى عربية</span>
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-sm">
            <Link to="/" className="font-medium transition-colors hover:text-foreground/80">الرئيسية</Link>
            <Link to="/services" className="font-medium transition-colors hover:text-primary">خدماتنا</Link>
            <Link to="/pricing" className="font-medium transition-colors hover:text-foreground/80">الأسعار</Link>
            <Link to="/login" className="font-medium transition-colors hover:text-foreground/80">تسجيل الدخول</Link>
            <Link to="/register">
              <Button>إنشاء حساب</Button>
            </Link>
          </nav>
          <Button variant="outline" size="icon" className="md:hidden">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* قسم الخدمات الرئيسي */}
      <section className="py-12 md:py-24 bg-gradient-to-b from-white to-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">خدماتنا المتكاملة لتحليل المشاعر العربية</h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                نقدم مجموعة متكاملة من الخدمات لتحليل المحتوى على وسائل التواصل الاجتماعي باللغة العربية واللهجة الأردنية
              </p>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
            {/* خدمة 1: تحليل المشاعر */}
            <Card className="relative overflow-hidden transition-all hover:shadow-lg animate-fade-in">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
              <CardContent className="p-6 pt-8">
                <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">تحليل المشاعر</h3>
                <p className="text-muted-foreground mb-4">تحليل مشاعر المستخدمين وتصنيفها إلى إيجابية وسلبية ومحايدة باستخدام نموذج مدرب خصيصًا للهجة الأردنية.</p>
                <ul className="space-y-2 mt-4">
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>دقة عالية تصل إلى 91%</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>دعم للتعبيرات والمصطلحات المحلية</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>تقارير تفصيلية وتحليلات</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* خدمة 2: تصنيف المواضيع */}
            <Card className="relative overflow-hidden transition-all hover:shadow-lg animate-fade-in" style={{ animationDelay: "100ms" }}>
              <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
              <CardContent className="p-6 pt-8">
                <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <BarChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">تصنيف المواضيع</h3>
                <p className="text-muted-foreground mb-4">تصنيف المحتوى إلى فئات مختلفة مثل السياسة والرياضة والاقتصاد والتكنولوجيا والتعليم والصحة والترفيه.</p>
                <ul className="space-y-2 mt-4">
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>7 فئات أساسية + فئات مخصصة</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>تحليل الموضوعات الفرعية</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>رصد المواضيع الرائجة</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* خدمة 3: مراقبة وتنبيهات */}
            <Card className="relative overflow-hidden transition-all hover:shadow-lg animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
              <CardContent className="p-6 pt-8">
                <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">مراقبة وتنبيهات</h3>
                <p className="text-muted-foreground mb-4">مراقبة مستمرة لعلامتك التجارية أو المواضيع التي تهمك مع تنبيهات فورية عند تغير نبرة المشاعر.</p>
                <ul className="space-y-2 mt-4">
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>تنبيهات في الوقت الفعلي</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>تخصيص عتبات التنبيه</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>تنبيهات عبر البريد الإلكتروني والتطبيق</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* خدمة 4: تقارير وتحليلات */}
            <Card className="relative overflow-hidden transition-all hover:shadow-lg animate-fade-in" style={{ animationDelay: "300ms" }}>
              <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
              <CardContent className="p-6 pt-8">
                <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">تقارير وتحليلات</h3>
                <p className="text-muted-foreground mb-4">تقارير مفصلة ولوحات تحكم تفاعلية تعرض تحليلات المشاعر والمواضيع عبر الزمن.</p>
                <ul className="space-y-2 mt-4">
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>تقارير دورية ومخصصة</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>تصدير البيانات بصيغ متعددة</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>مقارنات تاريخية</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* خدمة 5: تحليل المنافسين */}
            <Card className="relative overflow-hidden transition-all hover:shadow-lg animate-fade-in" style={{ animationDelay: "400ms" }}>
              <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
              <CardContent className="p-6 pt-8">
                <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <LineChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">تحليل المنافسين</h3>
                <p className="text-muted-foreground mb-4">مقارنة علامتك التجارية مع المنافسين من حيث المشاعر والتغطية والمواضيع.</p>
                <ul className="space-y-2 mt-4">
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>مقارنات مباشرة</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>تحليل نقاط القوة والضعف</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>رؤى استراتيجية</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* خدمة 6: الاستشارات */}
            <Card className="relative overflow-hidden transition-all hover:shadow-lg animate-fade-in" style={{ animationDelay: "500ms" }}>
              <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
              <CardContent className="p-6 pt-8">
                <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">الاستشارات</h3>
                <p className="text-muted-foreground mb-4">خدمات استشارية مخصصة لمساعدتك على فهم البيانات واتخاذ قرارات أفضل بناءً على تحليلات المشاعر.</p>
                <ul className="space-y-2 mt-4">
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>خبراء في تحليل البيانات العربية</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>توصيات استراتيجية</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>جلسات تدريبية للفريق</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* قسم النموذج المدرب للهجة الأردنية */}
      <section className="py-12 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-white">تقنيتنا</div>
              <h2 className="text-3xl font-bold tracking-tighter mb-4">نموذج متخصص للهجة الأردنية</h2>
              <p className="text-muted-foreground">
                طورنا نموذج تحليل مشاعر متخصص في اللهجة الأردنية، مدرب على مئات الآلاف من المنشورات والتعليقات المصنفة يدوياً من وسائل التواصل الاجتماعي المحلية.
              </p>
              <ul className="space-y-2 mt-6">
                <li className="flex items-center">
                  <Check className="ml-2 h-5 w-5 text-primary" />
                  <span className="font-medium">دقة تتجاوز 91% في تحليل المشاعر</span>
                </li>
                <li className="flex items-center">
                  <Check className="ml-2 h-5 w-5 text-primary" />
                  <span className="font-medium">فهم متقدم للتعبيرات والمصطلحات المحلية</span>
                </li>
                <li className="flex items-center">
                  <Check className="ml-2 h-5 w-5 text-primary" />
                  <span className="font-medium">تحديثات مستمرة للنموذج لمواكبة تطور اللغة</span>
                </li>
                <li className="flex items-center">
                  <Check className="ml-2 h-5 w-5 text-primary" />
                  <span className="font-medium">دعم التشكيل واللهجات المتنوعة</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link to="/login">
                  <Button size="lg">جرب المنصة الآن</Button>
                </Link>
              </div>
            </div>
            <div className="relative h-[400px] lg:h-[500px] w-full overflow-hidden rounded-lg bg-muted/50 shadow-lg">
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src="/placeholder.svg" 
                  alt="نموذج تحليل المشاعر العربية" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-4 right-4 bg-background/95 p-3 rounded-lg shadow-md">
                  <p className="font-medium text-sm">نموذج مدرب على بيانات من الأردن</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* الدعوة للعمل */}
      <section className="py-12 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">جاهز لفهم محتوى المنصات الاجتماعية العربية؟</h2>
              <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl">
                ابدأ اليوم باستخدام منصة رؤى عربية لتحليل المشاعر وتصنيف المواضيع في اللهجة الأردنية
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
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">الشركة</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground transition-colors hover:text-foreground">حول</a></li>
                <li><a href="#" className="text-muted-foreground transition-colors hover:text-foreground">اتصل بنا</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">الدعم</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground transition-colors hover:text-foreground">المساعدة</a></li>
                <li><a href="#" className="text-muted-foreground transition-colors hover:text-foreground">الأسئلة الشائعة</a></li>
              </ul>
            </div>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Services;
