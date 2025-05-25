
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  BarChart3,
  PieChart,
  FileBarChart
} from 'lucide-react';

const Reports = () => {
  const reports = [
    {
      id: 1,
      title: 'تقرير تحليل المشاعر الأسبوعي',
      type: 'sentiment',
      date: '2024-01-15',
      status: 'مكتمل',
      description: 'تحليل شامل للمشاعر عبر جميع المنصات'
    },
    {
      id: 2,
      title: 'تقرير الاتجاهات الشهرية',
      type: 'trends',
      date: '2024-01-10',
      status: 'معالجة',
      description: 'رصد الاتجاهات والمواضيع الرائجة'
    },
    {
      id: 3,
      title: 'تقرير أداء المحتوى',
      type: 'performance',
      date: '2024-01-08',
      status: 'مكتمل',
      description: 'تحليل أداء المحتوى والتفاعل'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'مكتمل': return 'bg-green-100 text-green-800';
      case 'معالجة': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sentiment': return TrendingUp;
      case 'trends': return BarChart3;
      case 'performance': return PieChart;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">التقارير والتحليلات</h1>
          <p className="text-muted-foreground">إنشاء وإدارة التقارير التفصيلية</p>
        </div>
        <Button className="gap-2">
          <FileBarChart className="h-4 w-4" />
          إنشاء تقرير جديد
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التقارير</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">هذا الشهر</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مكتملة</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد المعالجة</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>التقارير الأخيرة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => {
              const TypeIcon = getTypeIcon(report.type);
              return (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <TypeIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{report.title}</h3>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{report.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                    {report.status === 'مكتمل' && (
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        تحميل
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>قوالب التقارير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { name: 'تحليل المشاعر', icon: TrendingUp, description: 'تقرير شامل عن تحليل المشاعر' },
              { name: 'الاتجاهات', icon: BarChart3, description: 'رصد الاتجاهات والمواضيع الرائجة' },
              { name: 'أداء المحتوى', icon: PieChart, description: 'تحليل أداء المحتوى والتفاعل' }
            ].map((template, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <template.icon className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold">{template.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                <Button variant="outline" size="sm" className="w-full">
                  استخدام القالب
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
