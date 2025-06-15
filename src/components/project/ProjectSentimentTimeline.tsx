
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import { SentimentTimelineData } from '@/types/analysis';

interface ProjectSentimentTimelineProps {
  projectId: string;
}

const ProjectSentimentTimeline = ({ projectId }: ProjectSentimentTimelineProps) => {
  const { data: timelineData, isLoading } = useQuery({
    queryKey: ['sentiment-timeline', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sentiment_timeline')
        .select('*')
        .eq('project_id', projectId)
        .order('analysis_date', { ascending: true })
        .limit(30);
      
      if (error) throw error;
      
      return data?.map(item => ({
        ...item,
        date: new Date(item.analysis_date).toLocaleDateString('ar-SA', {
          month: 'short',
          day: 'numeric'
        }),
        total: item.positive_count + item.negative_count + item.neutral_count
      })) || [];
    },
    enabled: !!projectId
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            الخط الزمني للمشاعر
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  if (!timelineData || timelineData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            الخط الزمني للمشاعر
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">لا توجد بيانات زمنية متاحة</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          الخط الزمني للمشاعر
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* مخطط المساحة للمشاعر */}
          <div>
            <h4 className="text-sm font-medium mb-3">توزيع المشاعر عبر الزمن</h4>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="neutralGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6b7280" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6b7280" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label) => `تاريخ: ${label}`}
                  formatter={(value, name) => [
                    value, 
                    name === 'positive_count' ? 'إيجابي' :
                    name === 'negative_count' ? 'سلبي' : 'محايد'
                  ]}
                />
                <Legend 
                  formatter={(value) => 
                    value === 'positive_count' ? 'إيجابي' :
                    value === 'negative_count' ? 'سلبي' : 'محايد'
                  }
                />
                <Area 
                  type="monotone" 
                  dataKey="positive_count" 
                  stackId="1" 
                  stroke="#10b981" 
                  fill="url(#positiveGradient)" 
                  name="positive_count"
                />
                <Area 
                  type="monotone" 
                  dataKey="negative_count" 
                  stackId="1" 
                  stroke="#ef4444" 
                  fill="url(#negativeGradient)" 
                  name="negative_count"
                />
                <Area 
                  type="monotone" 
                  dataKey="neutral_count" 
                  stackId="1" 
                  stroke="#6b7280" 
                  fill="url(#neutralGradient)" 
                  name="neutral_count"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* مخطط خطي لمتوسط الثقة */}
          <div>
            <h4 className="text-sm font-medium mb-3">متوسط ثقة التحليل</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 1]} />
                <Tooltip 
                  labelFormatter={(label) => `تاريخ: ${label}`}
                  formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, 'متوسط الثقة']}
                />
                <Line 
                  type="monotone" 
                  dataKey="average_sentiment_score" 
                  stroke="#8884d8" 
                  strokeWidth={3}
                  dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ملخص العواطف السائدة */}
          <div>
            <h4 className="text-sm font-medium mb-3">العواطف السائدة</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {timelineData.slice(-4).map((item, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground mb-1">{item.date}</div>
                  <div className="font-medium text-sm">{item.dominant_emotion}</div>
                  <div className="text-xs text-muted-foreground">
                    المجموع: {item.total}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectSentimentTimeline;
