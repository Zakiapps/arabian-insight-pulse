import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';

interface Analysis {
  id: string;
  sentiment: string;
  sentiment_score: number;
  dialect: string;
  dialect_confidence: number;
}

interface SentimentChartProps {
  analyses: Analysis[];
}

const SentimentChart = ({ analyses }: SentimentChartProps) => {
  const { isRTL } = useLanguage();
  
  // Count sentiments
  const positiveSentiments = analyses.filter(a => a.sentiment === 'positive').length;
  const negativeSentiments = analyses.filter(a => a.sentiment === 'negative').length;
  const neutralSentiments = analyses.filter(a => a.sentiment === 'neutral').length;
  
  // Prepare data for chart
  const data = [
    { 
      name: isRTL ? 'إيجابي' : 'Positive', 
      value: positiveSentiments,
      color: '#22c55e' // green-500
    },
    { 
      name: isRTL ? 'سلبي' : 'Negative', 
      value: negativeSentiments,
      color: '#ef4444' // red-500
    }
  ];
  
  // Add neutral if there are any
  if (neutralSentiments > 0) {
    data.push({ 
      name: isRTL ? 'محايد' : 'Neutral', 
      value: neutralSentiments,
      color: '#6b7280' // gray-500
    });
  }
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = analyses.length;
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-background p-3 border rounded-md shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">
            {data.value} {isRTL ? 'عنصر' : 'items'} ({percentage}%)
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="h-64">
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
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentChart;