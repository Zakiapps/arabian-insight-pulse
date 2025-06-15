
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Brain, TrendingUp, Users, Globe, ArrowRight, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AnalysisStats {
  total_analyses: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  arabic_count: number;
  jordanian_dialect_count: number;
}

interface AnalysisInsightsCardProps {
  projectId: string;
  stats?: AnalysisStats;
  recentAnalyses?: Array<{
    id: string;
    input_text: string;
    sentiment: string;
    emotion?: string;
    dialect?: string;
    created_at: string;
    type?: 'news' | 'text';
  }>;
}

const AnalysisInsightsCard = ({ projectId, stats, recentAnalyses }: AnalysisInsightsCardProps) => {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const sentimentPercentage = stats?.total_analyses ? {
    positive: Math.round((stats.positive_count / stats.total_analyses) * 100),
    negative: Math.round((stats.negative_count / stats.total_analyses) * 100),
    neutral: Math.round((stats.neutral_count / stats.total_analyses) * 100)
  } : { positive: 0, negative: 0, neutral: 0 };

  const handleViewAllAnalyses = () => {
    navigate(`/projects/${projectId}/analyses`);
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          رؤى التحليلات الذكية
        </CardTitle>
        <CardDescription>
          نظرة شاملة على جميع تحليلات MARBERT في المشروع
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stats && stats.total_analyses > 0 ? (
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">{stats.total_analyses}</div>
                <div className="text-xs text-muted-foreground">إجمالي التحليلات</div>
              </div>
              
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-green-600">{sentimentPercentage.positive}%</div>
                <div className="text-xs text-muted-foreground">إيجابي</div>
              </div>
              
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-orange-600">{stats.jordanian_dialect_count}</div>
                <div className="text-xs text-muted-foreground">نصوص أردنية</div>
              </div>
              
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-purple-600">{stats.arabic_count}</div>
                <div className="text-xs text-muted-foreground">نصوص عربية</div>
              </div>
            </div>

            {/* Sentiment Distribution */}
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                توزيع المشاعر
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">إيجابي</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${sentimentPercentage.positive}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{sentimentPercentage.positive}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">سلبي</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${sentimentPercentage.negative}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{sentimentPercentage.negative}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">محايد</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gray-500 h-2 rounded-full" 
                        style={{ width: `${sentimentPercentage.neutral}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{sentimentPercentage.neutral}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Analyses Preview */}
            {recentAnalyses && recentAnalyses.length > 0 && (
              <div className="bg-white rounded-lg p-4 border">
                <h4 className="font-medium mb-3">آخر التحليلات</h4>
                <div className="space-y-2">
                  {recentAnalyses.slice(0, 3).map((analysis) => (
                    <div key={analysis.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="text-sm line-clamp-1">{analysis.input_text.slice(0, 60)}...</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={
                            analysis.sentiment === 'positive' ? 'default' : 
                            analysis.sentiment === 'negative' ? 'destructive' : 'secondary'
                          } className="text-xs">
                            {analysis.sentiment === 'positive' ? 'إيجابي' :
                             analysis.sentiment === 'negative' ? 'سلبي' : 'محايد'}
                          </Badge>
                          {analysis.emotion && (
                            <Badge variant="outline" className="text-xs">
                              {analysis.emotion}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(analysis.created_at).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Button */}
            <Button 
              onClick={handleViewAllAnalyses}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              عرض جميع التحليلات التفصيلية
              <ArrowRight className="h-4 w-4 mr-2" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              لا توجد تحليلات متاحة بعد
            </p>
            <p className="text-sm text-muted-foreground">
              ابدأ بتحليل النصوص أو الأخبار لرؤية الرؤى هنا
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisInsightsCard;
