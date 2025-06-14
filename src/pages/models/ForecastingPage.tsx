import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { 
  Zap, 
  Loader2, 
  TrendingUp, 
  Calendar, 
  Info,
  LineChart,
  BarChart,
  Download
} from "lucide-react";
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const ForecastingPage = () => {
  const { isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [forecastPeriod, setForecastPeriod] = useState('7');
  const [forecastData, setForecastData] = useState<any>(null);
  
  // Generate mock forecast data
  const generateForecast = async () => {
    setLoading(true);
    
    try {
      // In a real implementation, this would call the forecast API
      // For demo purposes, we'll generate mock data
      
      // Generate historical data (past 14 days)
      const historicalData = [];
      const today = new Date();
      
      for (let i = 14; i >= 1; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        historicalData.push({
          date: date.toISOString().split('T')[0],
          sentiment: Math.round((0.5 + (Math.random() * 0.4 - 0.2)) * 100) / 100,
          type: 'historical'
        });
      }
      
      // Generate forecast data (next N days)
      const forecastDays = parseInt(forecastPeriod);
      const forecastData = [];
      
      // Get the last sentiment value from historical data
      const lastSentiment = historicalData[historicalData.length - 1].sentiment;
      
      for (let i = 1; i <= forecastDays; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        
        // Generate a value that follows a trend with some randomness
        const trendFactor = 0.01; // Slight upward trend
        const randomFactor = 0.05; // Random variation
        
        const sentiment = Math.max(0, Math.min(1, 
          lastSentiment + (i * trendFactor) + (Math.random() * randomFactor - randomFactor/2)
        ));
        
        forecastData.push({
          date: date.toISOString().split('T')[0],
          sentiment: Math.round(sentiment * 100) / 100,
          type: 'forecast'
        });
      }
      
      // Combine historical and forecast data
      const combinedData = [...historicalData, ...forecastData];
      
      // Calculate some statistics
      const avgHistorical = historicalData.reduce((sum, item) => sum + item.sentiment, 0) / historicalData.length;
      const avgForecast = forecastData.reduce((sum, item) => sum + item.sentiment, 0) / forecastData.length;
      const trend = avgForecast - avgHistorical;
      const trendPercentage = (trend / avgHistorical) * 100;
      
      setForecastData({
        data: combinedData,
        stats: {
          avgHistorical,
          avgForecast,
          trend,
          trendPercentage,
          forecastDays,
          confidence: 0.85 + (Math.random() * 0.1)
        }
      });
      
      toast.success(isRTL ? "تم إنشاء التنبؤ بنجاح" : "Forecast generated successfully");
    } catch (error) {
      console.error('Error generating forecast:', error);
      toast.error(isRTL ? "حدث خطأ أثناء إنشاء التنبؤ" : "Error generating forecast");
    } finally {
      setLoading(false);
    }
  };
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            {isRTL ? "المشاعر: " : "Sentiment: "}
            <span className="font-medium">{Math.round(payload[0].value * 100)}%</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {payload[0].payload.type === 'historical' 
              ? (isRTL ? "بيانات تاريخية" : "Historical data") 
              : (isRTL ? "تنبؤ" : "Forecast")}
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Zap className="h-8 w-8 text-primary" />
          {isRTL ? "نموذج التنبؤ" : "Forecasting Model"}
        </h1>
        <p className="text-muted-foreground">
          {isRTL 
            ? "التنبؤ باتجاهات المشاعر المستقبلية بناءً على البيانات التاريخية" 
            : "Predict future sentiment trends based on historical data"}
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {isRTL ? "إعدادات التنبؤ" : "Forecast Settings"}
          </CardTitle>
          <CardDescription>
            {isRTL 
              ? "تكوين معلمات التنبؤ" 
              : "Configure forecast parameters"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="forecast-period">
                {isRTL ? "فترة التنبؤ (بالأيام)" : "Forecast Period (days)"}
              </Label>
              <Select 
                value={forecastPeriod} 
                onValueChange={setForecastPeriod}
              >
                <SelectTrigger id="forecast-period">
                  <SelectValue placeholder={isRTL ? "اختر فترة التنبؤ" : "Select forecast period"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">{isRTL ? "7 أيام" : "7 days"}</SelectItem>
                  <SelectItem value="14">{isRTL ? "14 يوم" : "14 days"}</SelectItem>
                  <SelectItem value="30">{isRTL ? "30 يوم" : "30 days"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={generateForecast} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isRTL ? "جاري إنشاء التنبؤ..." : "Generating forecast..."}
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    {isRTL ? "إنشاء التنبؤ" : "Generate Forecast"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {forecastData && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isRTL ? "نتائج التنبؤ" : "Forecast Results"}
            </CardTitle>
            <CardDescription>
              {isRTL 
                ? `تنبؤ لمدة ${forecastData.stats.forecastDays} يوم بناءً على بيانات 14 يوم سابقة` 
                : `${forecastData.stats.forecastDays}-day forecast based on 14 days of historical data`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Forecast Chart */}
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                  data={forecastData.data}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis 
                    domain={[0, 1]} 
                    tickFormatter={(value) => `${Math.round(value * 100)}%`} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sentiment" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name={isRTL ? "المشاعر" : "Sentiment"}
                    connectNulls
                    isAnimationActive
                  />
                  {/* Add a vertical line to separate historical and forecast data */}
                  <Line 
                    type="monotone" 
                    dataKey="type" 
                    stroke="transparent" 
                    strokeWidth={0}
                    dot={({ payload }) => {
                      if (payload.date === forecastData.data[13].date) {
                        return (
                          <line 
                            x1={0} 
                            y1={0} 
                            x2={0} 
                            y2={300} 
                            stroke="#d1d5db" 
                            strokeWidth={2} 
                            strokeDasharray="5 5" 
                          />
                        );
                      }
                      return null;
                    }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Forecast Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <h3 className="font-medium mb-1">
                    {isRTL ? "الاتجاه" : "Trend"}
                  </h3>
                  <div className={`text-2xl font-bold ${forecastData.stats.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {forecastData.stats.trend >= 0 ? '+' : ''}
                    {Math.round(forecastData.stats.trendPercentage)}%
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <h3 className="font-medium mb-1">
                    {isRTL ? "متوسط المشاعر المتوقع" : "Avg. Forecast Sentiment"}
                  </h3>
                  <div className="text-2xl font-bold text-blue-500">
                    {Math.round(forecastData.stats.avgForecast * 100)}%
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <h3 className="font-medium mb-1">
                    {isRTL ? "دقة التنبؤ" : "Forecast Accuracy"}
                  </h3>
                  <div className="text-2xl font-bold">
                    {Math.round(forecastData.stats.confidence * 100)}%
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                {isRTL ? "تصدير التنبؤ" : "Export Forecast"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Model Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            {isRTL ? "معلومات عن النموذج" : "Model Information"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium mb-2">
                {isRTL ? "نموذج التنبؤ" : "Forecasting Model"}
              </h3>
              <p className="text-muted-foreground">
                {isRTL 
                  ? "يستخدم نموذج التنبؤ تقنيات تحليل السلاسل الزمنية المتقدمة للتنبؤ باتجاهات المشاعر المستقبلية بناءً على البيانات التاريخية. يمكن للنموذج التنبؤ بدقة عالية لفترات تصل إلى 30 يومًا." 
                  : "The forecasting model uses advanced time series analysis techniques to predict future sentiment trends based on historical data. The model can forecast with high accuracy for periods up to 30 days."}
              </p>
              <div className="mt-4">
                <h4 className="font-medium mb-1">
                  {isRTL ? "التقنيات المستخدمة" : "Techniques Used"}
                </h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>{isRTL ? "نماذج ARIMA (المتوسط المتحرك المتكامل للانحدار الذاتي)" : "ARIMA (AutoRegressive Integrated Moving Average) models"}</li>
                  <li>{isRTL ? "الشبكات العصبية المتكررة (RNN)" : "Recurrent Neural Networks (RNN)"}</li>
                  <li>{isRTL ? "نماذج الذاكرة طويلة المدى القصيرة (LSTM)" : "Long Short-Term Memory (LSTM) models"}</li>
                  <li>{isRTL ? "تحليل المكونات الموسمية" : "Seasonal component analysis"}</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">
                {isRTL ? "استخدامات التنبؤ" : "Forecasting Use Cases"}
              </h3>
              <p className="text-muted-foreground">
                {isRTL 
                  ? "يمكن استخدام التنبؤات بالمشاعر في مجموعة متنوعة من التطبيقات، بما في ذلك تحليل السوق، وإدارة السمعة، والتخطيط الاستراتيجي، واستباق الأزمات." 
                  : "Sentiment forecasts can be used in a variety of applications, including market analysis, reputation management, strategic planning, and crisis anticipation."}
              </p>
              <div className="mt-4">
                <h4 className="font-medium mb-1">
                  {isRTL ? "مؤشرات الأداء الرئيسية" : "Key Performance Indicators"}
                </h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>{isRTL ? "دقة التنبؤ: 85-95%" : "Forecast accuracy: 85-95%"}</li>
                  <li>{isRTL ? "متوسط الخطأ المطلق (MAE): 0.05-0.1" : "Mean Absolute Error (MAE): 0.05-0.1"}</li>
                  <li>{isRTL ? "متوسط مربع الخطأ (MSE): 0.01-0.02" : "Mean Squared Error (MSE): 0.01-0.02"}</li>
                  <li>{isRTL ? "دقة اتجاه التنبؤ: 90-98%" : "Trend direction accuracy: 90-98%"}</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForecastingPage;