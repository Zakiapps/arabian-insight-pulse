
import { useState } from "react";
import { 
  Line, 
  Bar, 
  Area, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  LineChart,
  BarChart,
  AreaChart
} from "recharts";
import { ArrowRight, ChevronDown, Download, Filter } from "lucide-react";
import { cn, categories, getCategoryById } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import ThreeDInsightView from "@/components/visualizations/ThreeDInsightView";

// بيانات وهمية
const timeframeSentimentData = [
  { date: "06/01", positive: 48, neutral: 32, negative: 20 },
  { date: "06/02", positive: 42, neutral: 36, negative: 22 },
  { date: "06/03", positive: 45, neutral: 35, negative: 20 },
  { date: "06/04", positive: 39, neutral: 37, negative: 24 },
  { date: "06/05", positive: 38, neutral: 32, negative: 30 },
  { date: "06/06", positive: 35, neutral: 33, negative: 32 },
  { date: "06/07", positive: 30, neutral: 37, negative: 33 },
];

const dialectData = [
  { name: "أردني", value: 65 },
  { name: "غير أردني", value: 35 },
];

// Updated with categories
const topicsData = [
  { topic: "السياسة", category: "politics", count: 850 },
  { topic: "الاقتصاد", category: "economy", count: 650 },
  { topic: "التعليم", category: "education", count: 550 },
  { topic: "الصحة", category: "health", count: 450 },
  { topic: "المجتمع", category: "society", count: 350 },
];

// New category distribution data
const categoryData = [
  { name: "politics", value: 35 },
  { name: "economy", value: 25 },
  { name: "sports", value: 15 },
  { name: "technology", value: 10 },
  { name: "health", value: 8 },
  { name: "education", value: 5 },
  { name: "society", value: 2 },
];

const platformsData = [
  { name: "فيسبوك", posts: 2850 },
  { name: "تويتر", posts: 2150 },
];

const SENTIMENT_COLORS = {
  positive: "hsl(var(--sentiment-positive))",
  neutral: "hsl(var(--sentiment-neutral))",
  negative: "hsl(var(--sentiment-negative))",
};

// Category colors
const CATEGORY_COLORS = [
  "#4f46e5", // politics - blue
  "#10b981", // economy - green
  "#f97316", // sports - orange
  "#8b5cf6", // technology - purple
  "#ef4444", // health - red
  "#eab308", // education - yellow
  "#6366f1", // society - indigo
];

const DIALECT_COLORS = ["#4f46e5", "#a1a1aa"];

const Dashboard = () => {
  const [timeframe, setTimeframe] = useState("7d");
  const [viewMode, setViewMode] = useState("2d"); // Add view mode state
  const { language } = useLanguage();
  
  const isArabic = language === 'ar';
  
  // Translation object
  const t = {
    dashboard: isArabic ? "لوحة التحكم" : "Dashboard",
    description: isArabic 
      ? "مراقبة وتحليل المشاعر واللهجات والمواضيع في وسائل التواصل الاجتماعي العربية" 
      : "Monitor and analyze sentiments, dialects and topics in Arabic social media",
    filter: isArabic ? "تصفية" : "Filter",
    export: isArabic ? "تصدير" : "Export",
    exportAsPDF: isArabic ? "تصدير كملف PDF" : "Export as PDF",
    exportAsExcel: isArabic ? "تصدير كملف Excel" : "Export as Excel",
    totalAnalyzedPosts: isArabic ? "إجمالي المنشورات المحللة" : "Total Analyzed Posts",
    positiveSentiment: isArabic ? "المشاعر الإيجابية" : "Positive Sentiment",
    neutralSentiment: isArabic ? "المشاعر المحايدة" : "Neutral Sentiment",
    negativeSentiment: isArabic ? "المشاعر السلبية" : "Negative Sentiment",
    fromLastWeek: isArabic ? "من الأسبوع الماضي" : "from last week",
    posts: isArabic ? "منشور" : "posts",
    sentimentAnalysis: isArabic ? "تحليل المشاعر" : "Sentiment Analysis",
    sentimentOverTime: isArabic ? "توزيع المشاعر على مدار الوقت" : "Sentiment distribution over time",
    week: isArabic ? "أسبوع" : "Week",
    month: isArabic ? "شهر" : "Month",
    quarter: isArabic ? "ربع سنة" : "Quarter",
    dialectDetection: isArabic ? "كشف اللهجة" : "Dialect Detection",
    dialectDistribution: isArabic ? "توزيع اللهجات الأردنية مقابل غير الأردنية" : "Distribution of Jordanian vs non-Jordanian dialects",
    topTopics: isArabic ? "المواضيع الشائعة" : "Popular Topics",
    topicsDescription: isArabic ? "المواضيع الأكثر نقاشاً في المنشورات العربية" : "Most discussed topics in Arabic posts",
    platformDistribution: isArabic ? "توزيع المنصات" : "Platform Distribution",
    platformsDescription: isArabic ? "المنشورات حسب منصة التواصل الاجتماعي" : "Posts by social media platform",
    categoryDistribution: isArabic ? "توزيع الفئات" : "Category Distribution",
    categoryDescription: isArabic ? "تصنيف المنشورات حسب الفئات الموضوعية" : "Classification of posts by topic categories",
    viewAll: isArabic ? "عرض الكل" : "View All",
    all: isArabic ? "الكل" : "All",
    positive: isArabic ? "إيجابي" : "Positive",
    neutral: isArabic ? "محايد" : "Neutral",
    negative: isArabic ? "سلبي" : "Negative",
  };

  // Sentiment data for 3D visualization
  const sentimentData = {
    positive: 42,
    neutral: 35, 
    negative: 23
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.dashboard}</h1>
          <p className="text-muted-foreground">
            {t.description}
          </p>
        </div>
        <div className="flex gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Filter className="w-4 h-4 ml-1" />
                {t.filter}
                <ChevronDown className="w-4 h-4 mr-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>{t.all}</DropdownMenuItem>
              <DropdownMenuItem>Facebook</DropdownMenuItem>
              <DropdownMenuItem>Twitter</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Download className="w-4 h-4 ml-1" />
                {t.export}
                <ChevronDown className="w-4 h-4 mr-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>{t.exportAsPDF}</DropdownMenuItem>
              <DropdownMenuItem>{t.exportAsExcel}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.totalAnalyzedPosts}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5,024</div>
            <div className="text-xs text-muted-foreground mt-1">
              +12% {t.fromLastWeek}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.positiveSentiment}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">42%</div>
              <div className="text-sm text-green-500">+3%</div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              2,110 {t.posts}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.neutralSentiment}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">35%</div>
              <div className="text-sm text-muted-foreground">-1%</div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              1,758 {t.posts}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.negativeSentiment}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">23%</div>
              <div className="text-sm text-red-500">+2%</div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              1,156 {t.posts}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>{t.sentimentAnalysis}</CardTitle>
            <CardDescription>
              {t.sentimentOverTime}
            </CardDescription>
            <Tabs defaultValue="7d" className="w-full" onValueChange={setTimeframe}>
              <TabsList className="grid w-full max-w-xs grid-cols-3">
                <TabsTrigger value="7d">{t.week}</TabsTrigger>
                <TabsTrigger value="30d">{t.month}</TabsTrigger>
                <TabsTrigger value="90d">{t.quarter}</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeframeSentimentData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                  formatter={(value) => [`${value}%`, '']}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="positive" 
                  name={t.positive} 
                  stackId="1" 
                  stroke={SENTIMENT_COLORS.positive} 
                  fill={SENTIMENT_COLORS.positive}
                  fillOpacity={0.6} 
                />
                <Area 
                  type="monotone" 
                  dataKey="neutral" 
                  name={t.neutral} 
                  stackId="1" 
                  stroke={SENTIMENT_COLORS.neutral} 
                  fill={SENTIMENT_COLORS.neutral}
                  fillOpacity={0.6} 
                />
                <Area 
                  type="monotone" 
                  dataKey="negative" 
                  name={t.negative} 
                  stackId="1" 
                  stroke={SENTIMENT_COLORS.negative} 
                  fill={SENTIMENT_COLORS.negative}
                  fillOpacity={0.6} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{t.categoryDistribution}</CardTitle>
            <CardDescription>
              {t.categoryDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={265}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => 
                    `${getCategoryById(name, language)} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}%`, 
                    getCategoryById(name as string, language)
                  ]}
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>{t.topTopics}</CardTitle>
              <CardDescription>{t.topicsDescription}</CardDescription>
            </div>
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-4 w-4" />
              <span className="sr-only">{t.viewAll}</span>
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topicsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="topic" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                  formatter={(value) => [`${value} ${t.posts}`, '']}
                />
                <Bar dataKey="count" name={t.posts}>
                  {topicsData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CATEGORY_COLORS[categories.findIndex(cat => cat.id === entry.category) % CATEGORY_COLORS.length]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle>{t.dialectDetection}</CardTitle>
            <CardDescription>
              {t.dialectDistribution}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={265}>
              <PieChart>
                <Pie
                  data={dialectData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {dialectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DIALECT_COLORS[index % DIALECT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'النسبة']}
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* New 3D visualization section */}
      <Card className="col-span-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>رؤية ثلاثية الأبعاد للتحليل العاطفي</CardTitle>
            <CardDescription>
              عرض تفاعلي ثلاثي الأبعاد للمشاعر في المنشورات الاجتماعية
            </CardDescription>
          </div>
          <Tabs defaultValue="3d" className="w-32">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="2d">2D</TabsTrigger>
              <TabsTrigger value="3d">3D</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <ThreeDInsightView sentimentData={sentimentData} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
