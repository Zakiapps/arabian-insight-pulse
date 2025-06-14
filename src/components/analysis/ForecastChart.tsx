import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Forecast {
  id: string;
  analysis_id: string;
  forecast_json: {
    historical: Array<{
      date: string;
      sentiment_score: number;
    }>;
    forecast: Array<{
      date: string;
      sentiment_score: number;
      is_forecast: boolean;
    }>;
  };
  created_at: string;
}

interface ForecastChartProps {
  forecast: Forecast;
}

const ForecastChart: React.FC<ForecastChartProps> = ({ forecast }) => {
  const { isRTL } = useLanguage();
  
  // Combine historical and forecast data for the chart
  const chartData = [
    ...forecast.forecast_json.historical.map(item => ({
      date: item.date,
      sentiment: Math.round(item.sentiment_score * 100),
      type: 'historical'
    })),
    ...forecast.forecast_json.forecast.map(item => ({
      date: item.date,
      forecast: Math.round(item.sentiment_score * 100),
      type: 'forecast'
    }))
  ];
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === 'sentiment' 
                ? (isRTL ? 'المشاعر: ' : 'Sentiment: ') 
                : (isRTL ? 'التوقع: ' : 'Forecast: ')}
              {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card className="bg-muted/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          {isRTL ? 'توقعات المشاعر' : 'Sentiment Forecast'}
        </CardTitle>
        <CardDescription>
          {isRTL ? 'البيانات التاريخية والتوقعات المستقبلية' : 'Historical data and future predictions'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} label={{ 
                value: isRTL ? 'المشاعر (%)' : 'Sentiment (%)', 
                angle: -90, 
                position: 'insideLeft' 
              }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sentiment" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name={isRTL ? "البيانات التاريخية" : "Historical Data"}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="forecast" 
                stroke="#10b981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name={isRTL ? "التوقعات" : "Forecast"}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForecastChart;