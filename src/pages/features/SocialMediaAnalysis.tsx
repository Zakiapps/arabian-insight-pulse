
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Instagram, Twitter, Facebook, Globe, TrendingUp, Users, Heart } from 'lucide-react';

const SocialMediaAnalysis = () => {
  const platforms = [
    { name: 'Twitter', icon: Twitter, posts: 1234, sentiment: 'إيجابي', color: 'bg-blue-500' },
    { name: 'Instagram', icon: Instagram, posts: 856, sentiment: 'محايد', color: 'bg-pink-500' },
    { name: 'Facebook', icon: Facebook, posts: 542, sentiment: 'سلبي', color: 'bg-blue-600' },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">تحليل وسائل التواصل الاجتماعي</h1>
        <p className="text-muted-foreground">مراقبة وتحليل المحتوى عبر منصات التواصل الاجتماعي المختلفة</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المنشورات</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,632</div>
            <p className="text-xs text-muted-foreground">
              +12% من الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المشاركات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15,847</div>
            <p className="text-xs text-muted-foreground">
              +8% من الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإعجابات</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89,234</div>
            <p className="text-xs text-muted-foreground">
              +23% من الشهر الماضي
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platforms Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>تحليل المنصات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {platforms.map((platform) => (
              <div key={platform.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${platform.color} text-white`}>
                    <platform.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{platform.name}</h3>
                    <p className="text-sm text-muted-foreground">{platform.posts} منشور</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{platform.sentiment}</Badge>
                  <Button variant="outline" size="sm">
                    عرض التفاصيل
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle>أحدث المنشورات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">مستخدم {i}</span>
                    <Badge variant="secondary">Twitter</Badge>
                    <span className="text-sm text-muted-foreground">منذ ساعتين</span>
                  </div>
                  <p className="text-sm">
                    هذا نص تجريبي لمنشور على وسائل التواصل الاجتماعي يحتوي على محتوى باللغة العربية...
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>❤️ 24</span>
                    <span>🔄 12</span>
                    <span>💬 8</span>
                    <Badge variant="outline" className="text-green-600">إيجابي</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialMediaAnalysis;
