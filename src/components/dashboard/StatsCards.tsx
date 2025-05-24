
import { TrendingUp, MessageSquare, Users, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const StatsCards = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const t = {
    analyzedPosts: isArabic ? "المنشورات المحللة" : "Analyzed Posts",
    totalUsers: isArabic ? "إجمالي المستخدمين" : "Total Users", 
    activeSessions: isArabic ? "الجلسات النشطة" : "Active Sessions",
    engagement: isArabic ? "معدل التفاعل" : "Engagement Rate",
    postsToday: isArabic ? "منشور اليوم" : "posts today",
    usersOnline: isArabic ? "مستخدم متصل" : "users online",
    sessionsActive: isArabic ? "جلسة نشطة" : "active sessions",
    avgEngagement: isArabic ? "متوسط التفاعل" : "average engagement"
  };

  const stats = [
    {
      title: t.analyzedPosts,
      value: "2,847",
      description: `+12% ${t.postsToday}`,
      icon: MessageSquare,
      trend: "up",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: t.totalUsers,
      value: "1,234",
      description: `+5% ${t.usersOnline}`,
      icon: Users,
      trend: "up", 
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: t.activeSessions,
      value: "89",
      description: `${t.sessionsActive}`,
      icon: Globe,
      trend: "neutral",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: t.engagement,
      value: "73.2%",
      description: `${t.avgEngagement}`,
      icon: TrendingUp,
      trend: "up",
      color: "text-orange-600", 
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;
