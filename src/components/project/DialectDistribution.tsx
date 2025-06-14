import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';

interface Analysis {
  id: string;
  sentiment: string;
  sentiment_score: number;
  dialect: string;
  dialect_confidence: number;
}

interface DialectDistributionProps {
  analyses: Analysis[];
}

const DialectDistribution = ({ analyses }: DialectDistributionProps) => {
  const { isRTL } = useLanguage();
  
  // Count dialects
  const dialectCounts: Record<string, number> = {};
  
  analyses.forEach(analysis => {
    const dialect = analysis.dialect || 'unknown';
    dialectCounts[dialect] = (dialectCounts[dialect] || 0) + 1;
  });
  
  // Prepare data for chart
  const data = Object.entries(dialectCounts).map(([dialect, count]) => {
    let name = dialect;
    let color = '#6b7280'; // Default gray
    
    // Translate dialect names
    if (dialect === 'jordanian') {
      name = isRTL ? 'أردني' : 'Jordanian';
      color = '#3b82f6'; // blue-500
    } else if (dialect === 'standard_arabic') {
      name = isRTL ? 'عربي فصيح' : 'Standard Arabic';
      color = '#8b5cf6'; // purple-500
    } else if (dialect === 'unknown') {
      name = isRTL ? 'غير معروف' : 'Unknown';
    }
    
    return { name, value: count, color };
  });
  
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

export default DialectDistribution;