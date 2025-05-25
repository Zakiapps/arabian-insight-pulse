
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, MessageSquare, TrendingUp, Shield, Globe, Users, Star, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background" dir="rtl">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm">
              <BarChart3 className="w-4 h-4 ml-2" />
              منصة تحليل المشاعر الأولى في الأردن
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              رؤى عربية
            </h1>
            
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 leading-relaxed">
              منصة ذكية لتحليل المشاعر باللغة العربية واكتشاف اللهجة الأردنية
              <br />
              باستخدام نموذج MARBERT المتطور
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button size="lg" className="px-8 py-6 text-lg" asChild>
                <Link to="/register">
                  ابدأ مجاناً
                  <ArrowLeft className="w-5 h-5 mr-2" />
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg" asChild>
                <Link to="/text-analysis">
                  جرب التحليل الآن
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">99%</div>
                <div className="text-muted-foreground">دقة التحليل</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">100K+</div>
                <div className="text-muted-foreground">نص محلل</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-muted-foreground">خدمة متواصلة</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/10">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">ميزات متطورة</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              نوفر لك أدوات تحليل متقدمة لفهم المشاعر والآراء بدقة عالية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>تحليل المشاعر</CardTitle>
                <CardDescription>
                  تحليل دقيق للمشاعر الإيجابية والسلبية والمحايدة
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>كشف اللهجة الأردنية</CardTitle>
                <CardDescription>
                  تمييز النصوص المكتوبة باللهجة الأردنية المحلية
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>تقارير تفصيلية</CardTitle>
                <CardDescription>
                  إحصائيات وتقارير شاملة لنتائج التحليل
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>أمان عالي</CardTitle>
                <CardDescription>
                  حماية كاملة لبياناتك مع التشفير المتقدم
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>نموذج MARBERT</CardTitle>
                <CardDescription>
                  استخدام أحدث نماذج الذكاء الاصطناعي للغة العربية
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>دعم فني متميز</CardTitle>
                <CardDescription>
                  فريق دعم متخصص لمساعدتك في جميع الأوقات
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">كيف يعمل النظام</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              خطوات بسيطة للحصول على تحليل دقيق لنصوصك
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">أدخل النص</h3>
              <p className="text-muted-foreground">
                قم بإدخال النص الذي تريد تحليله في المنطقة المخصصة
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">تحليل ذكي</h3>
              <p className="text-muted-foreground">
                نموذج MARBERT يحلل النص ويستخرج المشاعر واللهجة
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">نتائج فورية</h3>
              <p className="text-muted-foreground">
                احصل على تقرير مفصل بالنتائج والإحصائيات
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/10">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">آراء عملائنا</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              اكتشف تجارب المستخدمين مع منصة رؤى عربية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "منصة رائعة لتحليل المحتوى العربي. النتائج دقيقة جداً وسهلة الفهم."
                </p>
                <div className="font-semibold">أحمد محمد</div>
                <div className="text-sm text-muted-foreground">مدير تسويق</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "ميزة كشف اللهجة الأردنية مفيدة جداً لأبحاثي الأكاديمية."
                </p>
                <div className="font-semibold">د. فاطمة العلي</div>
                <div className="text-sm text-muted-foreground">باحثة لغوية</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "سهولة الاستخدام والدقة العالية جعلت عملي أسهل بكثير."
                </p>
                <div className="font-semibold">سارة خالد</div>
                <div className="text-sm text-muted-foreground">محللة بيانات</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            ابدأ رحلتك في تحليل المشاعر اليوم
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            انضم إلى آلاف المستخدمين الذين يثقون في منصة رؤى عربية
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 py-6 text-lg" asChild>
              <Link to="/register">
                إنشاء حساب مجاني
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg" asChild>
              <Link to="/pricing">
                عرض الخطط
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
