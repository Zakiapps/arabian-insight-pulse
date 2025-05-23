
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  isPositive?: boolean;
  subtitle?: string;
}

const StatsCard = ({ title, value, change, isPositive, subtitle }: StatsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold">{value}</div>
          {change && (
            <div className={`text-sm ${isPositive ? "text-green-500" : isPositive === false ? "text-red-500" : "text-muted-foreground"}`}>
              {change}
            </div>
          )}
        </div>
        {subtitle && (
          <div className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const StatsCards = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const t = {
    totalAnalyzedPosts: isArabic ? "إجمالي المنشورات المحللة" : "Total Analyzed Posts",
    positiveSentiment: isArabic ? "المشاعر الإيجابية" : "Positive Sentiment",
    neutralSentiment: isArabic ? "المشاعر المحايدة" : "Neutral Sentiment",
    negativeSentiment: isArabic ? "المشاعر السلبية" : "Negative Sentiment",
    fromLastWeek: isArabic ? "من الأسبوع الماضي" : "from last week",
    posts: isArabic ? "منشور" : "posts",
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard 
        title={t.totalAnalyzedPosts}
        value="5,024"
        change="+12%"
        isPositive={true}
        subtitle={t.fromLastWeek}
      />
      <StatsCard 
        title={t.positiveSentiment}
        value="42%"
        change="+3%"
        isPositive={true}
        subtitle={`2,110 ${t.posts}`}
      />
      <StatsCard 
        title={t.neutralSentiment}
        value="35%"
        change="-1%"
        subtitle={`1,758 ${t.posts}`}
      />
      <StatsCard 
        title={t.negativeSentiment}
        value="23%"
        change="+2%"
        isPositive={false}
        subtitle={`1,156 ${t.posts}`}
      />
    </div>
  );
};
