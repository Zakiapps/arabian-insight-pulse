
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, MessageSquare, TrendingUp } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Arab Insights
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            منصة متقدمة لتحليل المشاعر والبيانات الاجتماعية للمحتوى العربي
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signin">
              <Button size="lg" className="min-w-[150px]">
                تسجيل الدخول
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" size="lg" className="min-w-[150px]">
                إنشاء حساب جديد
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                تحليل المشاعر
              </CardTitle>
              <CardDescription>
                تحليل دقيق للمشاعر في النصوص العربية باستخدام نماذج الذكاء الاصطناعي
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                احصل على تحليل فوري ودقيق لمشاعر النصوص العربية مع درجة الثقة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-green-600" />
                تحليل المحتوى
              </CardTitle>
              <CardDescription>
                تحليل شامل للمحتوى الاجتماعي والمنشورات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                فهم أعمق لردود الأفعال والآراء في المحتوى الاجتماعي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-purple-600" />
                التقارير والإحصائيات
              </CardTitle>
              <CardDescription>
                تقارير مفصلة وإحصائيات شاملة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                احصل على رؤى قيمة من خلال التقارير التفاعلية والإحصائيات المفصلة
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link to="/text-analysis">
            <Button variant="outline" size="lg">
              جرب تحليل النصوص مجاناً
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
