
import { useState } from "react";
import { LineChart, BarChart, AreaChart, PieChart } from "recharts";
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
  ResponsiveContainer 
} from "recharts";
import { ArrowRight, ChevronDown, Download, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
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

const topicsData = [
  { topic: "السياسة", count: 850 },
  { topic: "الاقتصاد", count: 650 },
  { topic: "التعليم", count: 550 },
  { topic: "الصحة", count: 450 },
  { topic: "المجتمع", count: 350 },
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

const DIALECT_COLORS = ["#4f46e5", "#a1a1aa"];

const Dashboard = () => {
  const [timeframe, setTimeframe] = useState("7d");

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">لوحة التحكم</h1>
          <p className="text-muted-foreground">
            مراقبة وتحليل المشاعر واللهجات في وسائل التواصل الاجتماعي العربية
          </p>
        </div>
        <div className="flex gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Filter className="w-4 h-4 ml-1" />
                تصفية
                <ChevronDown className="w-4 h-4 mr-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>جميع المصادر</DropdownMenuItem>
              <DropdownMenuItem>فيسبوك فقط</DropdownMenuItem>
              <DropdownMenuItem>تويتر فقط</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Download className="w-4 h-4 ml-1" />
                تصدير
                <ChevronDown className="w-4 h-4 mr-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>تصدير كملف PDF</DropdownMenuItem>
              <DropdownMenuItem>تصدير كملف Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي المنشورات المحللة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5,024</div>
            <div className="text-xs text-muted-foreground mt-1">
              +12% من الأسبوع الماضي
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              المشاعر الإيجابية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">42%</div>
              <div className="text-sm text-green-500">+3%</div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              2,110 منشور
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              المشاعر المحايدة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">35%</div>
              <div className="text-sm text-muted-foreground">-1%</div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              1,758 منشور
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              المشاعر السلبية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">23%</div>
              <div className="text-sm text-red-500">+2%</div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              1,156 منشور
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>تحليل المشاعر</CardTitle>
            <CardDescription>
              توزيع المشاعر على مدار الوقت
            </CardDescription>
            <Tabs defaultValue="7d" className="w-full" onValueChange={setTimeframe}>
              <TabsList className="grid w-full max-w-xs grid-cols-3">
                <TabsTrigger value="7d">أسبوع</TabsTrigger>
                <TabsTrigger value="30d">شهر</TabsTrigger>
                <TabsTrigger value="90d">ربع سنة</TabsTrigger>
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
                  name="إيجابي" 
                  stackId="1" 
                  stroke={SENTIMENT_COLORS.positive} 
                  fill={SENTIMENT_COLORS.positive}
                  fillOpacity={0.6} 
                />
                <Area 
                  type="monotone" 
                  dataKey="neutral" 
                  name="محايد" 
                  stackId="1" 
                  stroke={SENTIMENT_COLORS.neutral} 
                  fill={SENTIMENT_COLORS.neutral}
                  fillOpacity={0.6} 
                />
                <Area 
                  type="monotone" 
                  dataKey="negative" 
                  name="سلبي" 
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
            <CardTitle>كشف اللهجة</CardTitle>
            <CardDescription>
              توزيع اللهجات الأردنية مقابل غير الأردنية
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>المواضيع الشائعة</CardTitle>
              <CardDescription>المواضيع الأكثر نقاشاً في المنشورات العربية</CardDescription>
            </div>
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-4 w-4" />
              <span className="sr-only">عرض الكل</span>
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
                  formatter={(value) => [`${value} منشور`, 'العدد']}
                />
                <Bar dataKey="count" name="المنشورات" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>توزيع المنصات</CardTitle>
              <CardDescription>المنشورات حسب منصة التواصل الاجتماعي</CardDescription>
            </div>
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-4 w-4" />
              <span className="sr-only">عرض الكل</span>
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
                  formatter={(value) => [`${value} منشور`, 'العدد']}
                />
                <Line type="monotone" dataKey="posts" name="المنشورات" stroke="hsl(var(--primary))" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
