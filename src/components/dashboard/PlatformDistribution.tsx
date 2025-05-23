
import { ArrowRight } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const platformsData = [
  { name: "فيسبوك", posts: 2850 },
  { name: "تويتر", posts: 2150 },
];

export const PlatformDistribution = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const t = {
    platformDistribution: isArabic ? "توزيع المنصات" : "Platform Distribution",
    platformsDescription: isArabic ? "المنشورات حسب منصة التواصل الاجتماعي" : "Posts by social media platform",
    viewAll: isArabic ? "عرض الكل" : "View All",
    posts: isArabic ? "منشور" : "posts",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{t.platformDistribution}</CardTitle>
          <CardDescription>{t.platformsDescription}</CardDescription>
        </div>
        <Button variant="ghost" size="icon">
          <ArrowRight className="h-4 w-4" />
          <span className="sr-only">{t.viewAll}</span>
        </Button>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={platformsData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
              formatter={(value) => [`${value} ${t.posts}`, '']}
            />
            <Line type="monotone" dataKey="posts" name={t.posts} stroke="hsl(var(--primary))" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
