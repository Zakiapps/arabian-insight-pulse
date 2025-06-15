
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Brain, TrendingUp, Tag, MessageSquare } from 'lucide-react';
import { AdvancedAnalysisResult, EmotionRadarData, AnalysisChartData } from '@/types/analysis';

interface ArticleAnalysisChartProps {
  analysis: AdvancedAnalysisResult;
  className?: string;
}

const ArticleAnalysisChart = ({ analysis, className }: ArticleAnalysisChartProps) => {
  // إعداد بيانات Radar Chart للعواطف
  const emotionRadarData: EmotionRadarData[] = Object.entries(analysis.emotion_scores).map(([emotion, score]) => ({
    emotion: getEmotionLabel(emotion),
    score: Math.round(score * 100),
    fullMark: 100
  }));

  // إعداد بيانات Pie Chart للمواضيع
  const topicsData: AnalysisChartData[] = Object.entries(analysis.topic_scores).map(([topic, score], index) => ({
    name: topic,
    value: Math.round(score * 100),
    color: getTopicColor(index)
  }));

  // إعداد بيانات الكلمات المفتاحية
  const keywordsData: AnalysisChartData[] = analysis.keywords_extracted.slice(0, 6).map((keyword, index) => ({
    name: keyword,
    value: Math.max(10, 100 - (index * 15)), // قيم تنازلية للكلمات
    color: `hsl(${210 + (index * 30)}, 70%, 60%)`
  }));

  const getEmotionLabel = (emotion: string) => {
    const labels: { [key: string]: string } = {
      'joy': 'فرح',
      'sadness': 'حزن',
      'anger': 'غضب',
      'fear': 'خوف',
      'surprise': 'مفاجأة',
      'disgust': 'اشمئزاز',
      'neutral': 'محايد',
      'فرح': 'فرح',
      'حزن': 'حزن',
      'غضب': 'غضب',
      'خوف': 'خوف',
      'محايد': 'محايد'
    };
    return labels[emotion] || emotion;
  };

  const getTopicColor = (index: number) => {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];
    return colors[index % colors.length];
  };

  const getUrgencyBadgeColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    const labels = {
      'critical': 'حرج',
      'high': 'عالي',
      'medium': 'متوسط',
      'low': 'منخفض'
    };
    return labels[urgency as keyof typeof labels] || urgency;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* معلومات التحليل الأساسية */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-blue-600" />
            تفاصيل التحليل المتقدم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {Math.round(analysis.sentiment_confidence * 100)}%
              </div>
              <div className="text-sm text-blue-600">ثقة المشاعر</div>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {Math.round(analysis.analysis_quality_score * 100)}%
              </div>
              <div className="text-sm text-green-600">جودة التحليل</div>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">
                {analysis.main_topics.length}
              </div>
              <div className="text-sm text-purple-600">مواضيع</div>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">
                {analysis.keywords_extracted.length}
              </div>
              <div className="text-sm text-orange-600">كلمات مفتاحية</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className={`${getUrgencyBadgeColor(analysis.urgency_level)} border`}>
              مستوى الأهمية: {getUrgencyLabel(analysis.urgency_level)}
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              العاطفة الأساسية: {analysis.primary_emotion}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Radar Chart للعواطف */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              توزيع العواطف
            </CardTitle>
          </CardHeader>
          <CardContent>
            {emotionRadarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={emotionRadarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="emotion" className="text-sm" />
                  <PolarRadiusAxis 
                    angle={0} 
                    domain={[0, 100]} 
                    tick={false}
                  />
                  <Radar
                    name="درجة العاطفة"
                    dataKey="score"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'درجة العاطفة']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">لا توجد بيانات عواطف</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart للمواضيع */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-purple-600" />
              توزيع المواضيع
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topicsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topicsData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {topicsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'نسبة الموضوع']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">لا توجد مواضيع محددة</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart للكلمات المفتاحية */}
      {keywordsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-orange-600" />
              الكلمات المفتاحية الأكثر أهمية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={keywordsData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'درجة الأهمية']}
                />
                <Bar 
                  dataKey="value" 
                  fill="#8884d8"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* تحليل السياق */}
      {analysis.context_analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              تحليل السياق
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {analysis.context_analysis}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ArticleAnalysisChart;
