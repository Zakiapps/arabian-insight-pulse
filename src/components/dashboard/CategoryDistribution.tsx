
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategoryById } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

// Category data
const categoryData = [
  { name: "politics", value: 35 },
  { name: "economy", value: 25 },
  { name: "sports", value: 15 },
  { name: "technology", value: 10 },
  { name: "health", value: 8 },
  { name: "education", value: 5 },
  { name: "society", value: 2 },
];

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

export const CategoryDistribution = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const t = {
    categoryDistribution: isArabic ? "توزيع الفئات" : "Category Distribution",
    categoryDescription: isArabic ? "تصنيف المنشورات حسب الفئات الموضوعية" : "Classification of posts by topic categories",
  };

  return (
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
  );
};
