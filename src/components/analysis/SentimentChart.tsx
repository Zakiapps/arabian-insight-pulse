import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface SentimentChartProps {
  analysis: {
    sentiment: string;
    sentiment_score: number;
    model_response: any;
  };
}

const SentimentChart: React.FC<SentimentChartProps> = ({ analysis }) => {
  const { isRTL } = useLanguage();
  
  // Extract positive and negative probabilities from model response
  const positive = analysis.model_response?.positive_prob || 
    (analysis.sentiment === 'positive' ? analysis.sentiment_score : 1 - analysis.sentiment_score);
  
  const negative = analysis.model_response?.negative_prob || 
    (analysis.sentiment === 'negative' ? analysis.sentiment_score : 1 - analysis.sentiment_score);
  
  const data = [
    { name: isRTL ? 'إيجابي' : 'Positive', value: positive, color: '#22c55e' },
    { name: isRTL ? 'سلبي' : 'Negative', value: negative, color: '#ef4444' },
  ];
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 border rounded shadow-sm">
          <p className="font-medium">{`${payload[0].name}: ${(payload[0].value * 100).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="bg-muted/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          {isRTL ? 'توزيع المشاعر' : 'Sentiment Distribution'}
        </CardTitle>
        <CardDescription>
          {isRTL ? 'نسبة المشاعر الإيجابية والسلبية' : 'Positive vs. Negative sentiment ratio'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentChart;