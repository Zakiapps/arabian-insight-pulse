
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, MessageSquare, TrendingUp, Shield, Users, Zap } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-primary">Arab Insights</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link to="/pricing">
                <Button variant="outline">الأسعار</Button>
              </Link>
              <Link to="/reviews">
                <Button variant="outline">التقييمات</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline">تسجيل الدخول</Button>
              </Link>
              <Link to="/register">
                <Button>إنشاء حساب</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            مرحباً بك في Arab Insights
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            منصة متقدمة لتحليل المشاعر والبيانات الاجتماعية للمحتوى العربي باستخدام أحدث تقنيات الذكاء الاصطناعي
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="min-w-[150px]">
                ابدأ الآن مجاناً
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="lg" className="min-w-[150px]">
                عرض الخطط
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                تحليل المشاعر
              </CardTitle>
              <CardDescription>
                تحليل دقيق للمشاعر في النصوص العربية باستخدام نماذج الذكاء الاصطناعي المتقدمة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                احصل على تحليل فوري ودقيق لمشاعر النصوص العربية مع درجة الثقة والتفاصيل المرتبطة
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-green-600" />
                كشف اللهجات
              </CardTitle>
              <CardDescription>
                تحديد اللهجات العربية المختلفة في النصوص بدقة عالية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                تعرف على اللهجات المختلفة من المحتوى العربي لفهم أفضل للسياق الجغرافي والثقافي
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-purple-600" />
                التقارير والإحصائيات
              </CardTitle>
              <CardDescription>
                تقارير مفصلة وإحصائيات شاملة وتصورات بيانية تفاعلية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                احصل على رؤى قيمة من خلال التقارير التفاعلية والإحصائيات المفصلة والمخططات البيانية
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">أمان البيانات</h3>
            <p className="text-gray-600">حماية متقدمة للبيانات مع معايير الأمان العالمية</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">فريق العمل</h3>
            <p className="text-gray-600">إدارة الفرق والمستخدمين بسهولة وفعالية</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">سرعة المعالجة</h3>
            <p className="text-gray-600">معالجة فورية للنصوص بأعلى معايير الدقة والسرعة</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-4">جاهز للبدء؟</h2>
          <p className="text-gray-600 mb-6">انضم إلى آلاف المستخدمين الذين يثقون بـ Arab Insights</p>
          <Link to="/register">
            <Button size="lg" className="mr-4">
              إنشاء حساب مجاني
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg">
              تسجيل الدخول
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Arab Insights. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
