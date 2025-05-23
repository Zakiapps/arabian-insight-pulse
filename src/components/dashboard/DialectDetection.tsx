
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const dialectData = [
  { name: "أردني", value: 65 },
  { name: "غير أردني", value: 35 },
];

const DIALECT_COLORS = ["#4f46e5", "#a1a1aa"];

export const DialectDetection = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const t = {
    dialectDetection: isArabic ? "كشف اللهجة" : "Dialect Detection",
    dialectDistribution: isArabic ? "توزيع اللهجات الأردنية مقابل غير الأردنية" : "Distribution of Jordanian vs non-Jordanian dialects",
  };

  return (
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
  );
};
