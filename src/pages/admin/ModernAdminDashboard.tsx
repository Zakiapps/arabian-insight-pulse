
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModernLayout, ModernGrid, FluidContainer } from '@/components/layouts/ModernLayout';
import { ModernButton } from '@/components/ui/modern-button';
import { Settings, Users, BarChart3, Database, Shield, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ModernAdminDashboard = () => {
  const navigate = useNavigate();

  const dashboardCards = [
    {
      title: 'إدارة المستخدمين',
      description: 'إدارة حسابات المستخدمين والأدوار',
      icon: Users,
      route: '/admin/users',
      color: 'bg-blue-500',
      stats: '1,234 مستخدم'
    },
    {
      title: 'مراقبة وسائل التواصل',
      description: 'استخراج وتحليل المنشورات',
      icon: Activity,
      route: '/admin/social-media-scraping',
      color: 'bg-green-500',
      stats: '5,678 منشور'
    },
    {
      title: 'تحليل البيانات',
      description: 'إحصائيات وتقارير مفصلة',
      icon: BarChart3,
      route: '/admin/analytics',
      color: 'bg-purple-500',
      stats: '89% دقة'
    },
    {
      title: 'إدارة قاعدة البيانات',
      description: 'مراقبة وصيانة البيانات',
      icon: Database,
      route: '/admin/database',
      color: 'bg-orange-500',
      stats: '2.3GB'
    },
    {
      title: 'الأمان والحماية',
      description: 'إعدادات الأمان والمراقبة',
      icon: Shield,
      route: '/admin/security',
      color: 'bg-red-500',
      stats: '100% آمن'
    },
    {
      title: 'لوحة التحكم',
      description: 'الوصول إلى جميع إعدادات النظام',
      icon: Settings,
      route: '/admin/control-panel',
      color: 'bg-indigo-500',
      stats: 'متاح'
    }
  ];

  return (
    <FluidContainer>
      <ModernLayout spacing="lg">
        {/* Header Section */}
        <div className="text-center py-8" dir="rtl">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            لوحة التحكم الإدارية
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            مرحباً بك في لوحة التحكم الحديثة. يمكنك من هنا إدارة جميع جوانب النظام بسهولة وفعالية.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-right">إجراءات سريعة</h2>
          <div className="flex flex-wrap gap-4 justify-end" dir="rtl">
            <ModernButton
              onClick={() => navigate('/admin/control-panel')}
              className="bg-primary hover:bg-primary/90"
            >
              <Settings className="h-5 w-5 ml-2" />
              فتح لوحة التحكم
            </ModernButton>
            <ModernButton
              onClick={() => navigate('/admin/users')}
              variant="outline"
            >
              <Users className="h-5 w-5 ml-2" />
              إدارة المستخدمين
            </ModernButton>
            <ModernButton
              onClick={() => navigate('/admin/social-media-scraping')}
              variant="outline"
            >
              <Activity className="h-5 w-5 ml-2" />
              بدء الاستخراج
            </ModernButton>
          </div>
        </div>

        {/* Dashboard Cards Grid */}
        <ModernGrid cols={3}>
          {dashboardCards.map((card, index) => (
            <Card 
              key={index}
              className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 bg-white"
              onClick={() => navigate(card.route)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between" dir="rtl">
                  <div className={`p-3 rounded-lg ${card.color} text-white`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {card.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {card.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center" dir="rtl">
                  <span className="text-2xl font-bold text-gray-900">
                    {card.stats}
                  </span>
                  <span className="text-sm text-gray-500">
                    انقر للوصول
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </ModernGrid>

        {/* System Status */}
        <Card className="border-0 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-right" dir="rtl">حالة النظام</CardTitle>
          </CardHeader>
          <CardContent>
            <ModernGrid cols={4}>
              <div className="text-center p-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium">الخادم</p>
                <p className="text-xs text-gray-500">متصل</p>
              </div>
              <div className="text-center p-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium">قاعدة البيانات</p>
                <p className="text-xs text-gray-500">عادي</p>
              </div>
              <div className="text-center p-4">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium">الاستخراج</p>
                <p className="text-xs text-gray-500">نشط</p>
              </div>
              <div className="text-center p-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium">التحليل</p>
                <p className="text-xs text-gray-500">جاهز</p>
              </div>
            </ModernGrid>
          </CardContent>
        </Card>
      </ModernLayout>
    </FluidContainer>
  );
};

export default ModernAdminDashboard;
