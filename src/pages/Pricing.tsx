
import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Pricing = () => {
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
            <Link to="/services" className="font-medium transition-colors hover:text-foreground/80">خدماتنا</Link>
            <Link to="/pricing" className="font-medium transition-colors hover:text-primary">الأسعار</Link>
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

      {/* قسم التسعير */}
      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">أسعار بسيطة وشفافة</h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                اختر الباقة المناسبة لاحتياجاتك لتحليل المشاعر والمواضيع على وسائل التواصل الاجتماعي
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
            {/* الباقة الأساسية */}
            <Card className="flex flex-col border-2 border-muted">
              <CardHeader>
                <CardTitle className="text-2xl">الباقة الأساسية</CardTitle>
                <CardDescription>مثالية للأفراد والشركات الناشئة</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">49</span>
                  <span className="text-muted-foreground"> دينار / شهرياً</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>تحليل 1000 منشور شهرياً</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>تحليل المشاعر الأساسي</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>تصنيف المواضيع (3 فئات)</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>تقارير أسبوعية</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>دعم عبر البريد الإلكتروني</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">اشترك الآن</Button>
              </CardFooter>
            </Card>

            {/* الباقة المتقدمة */}
            <Card className="flex flex-col border-2 border-primary relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
              <CardHeader>
                <div className="bg-primary text-primary-foreground text-xs rounded-full py-1 px-3 inline-block mb-2">الأكثر شعبية</div>
                <CardTitle className="text-2xl">الباقة المتقدمة</CardTitle>
                <CardDescription>للشركات المتوسطة والعلامات التجارية</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">149</span>
                  <span className="text-muted-foreground"> دينار / شهرياً</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>تحليل 5000 منشور شهرياً</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>تحليل المشاعر المتقدم</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>تصنيف المواضيع (جميع الفئات)</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>تقارير يومية</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>تنبيهات المشاعر السلبية</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>دعم العملاء على مدار الساعة</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">اشترك الآن</Button>
              </CardFooter>
            </Card>

            {/* الباقة الاحترافية */}
            <Card className="flex flex-col border-2 border-muted">
              <CardHeader>
                <CardTitle className="text-2xl">الباقة الاحترافية</CardTitle>
                <CardDescription>للمؤسسات والشركات الكبيرة</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">349</span>
                  <span className="text-muted-foreground"> دينار / شهرياً</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>تحليل غير محدود للمنشورات</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>تحليل المشاعر الاحترافي</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>تصنيف المواضيع المخصص</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>تقارير مخصصة</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>تنبيهات متقدمة ومخصصة</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>مدير حساب مخصص</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="ml-2 h-4 w-4 text-primary" />
                    <span>استشارات شهرية</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">اشترك الآن</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* قسم الاسئلة المتكررة */}
      <section className="py-12 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">الأسئلة الشائعة</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground">
                إجابات لأكثر الأسئلة شيوعاً حول خدماتنا
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-3xl gap-4 py-8">
            {/* سؤال 1 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">هل يمكنني تغيير خطتي في أي وقت؟</CardTitle>
              </CardHeader>
              <CardContent>
                <p>نعم، يمكنك الترقية أو تخفيض خطتك في أي وقت. سيتم تعديل الفاتورة على أساس تناسبي.</p>
              </CardContent>
            </Card>
            {/* سؤال 2 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">هل هناك فترة تجريبية مجانية؟</CardTitle>
              </CardHeader>
              <CardContent>
                <p>نعم، نقدم فترة تجريبية مجانية لمدة 14 يوماً للباقتين المتقدمة والاحترافية.</p>
              </CardContent>
            </Card>
            {/* سؤال 3 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ما هي اللهجات العربية المدعومة؟</CardTitle>
              </CardHeader>
              <CardContent>
                <p>حالياً، نركز على اللهجة الأردنية مع دعم جزئي للهجات الشامية الأخرى. نعمل على توسيع نطاق اللهجات المدعومة في المستقبل.</p>
              </CardContent>
            </Card>
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

export default Pricing;
